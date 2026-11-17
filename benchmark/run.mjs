/* eslint-disable no-console */
// Runs the benchmark page in headless Chromium with CPU throttling and prints a table.
// See benchmark/README.md for how to build the variants first.
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const here = dirname(fileURLToPath(import.meta.url));
const distRoot = join(here, 'dist');

const args = Object.fromEntries(process.argv.slice(2).map(arg => {
  const [key, value = 'true'] = arg.replace(/^--/, '').split('=');
  return [key, value];
}));
const runs = Number(args.runs || 5);
const throttles = (args.throttle || '1,4,6').split(',').map(Number);
const variants = [
  { label: 'before (base branch)', dist: 'before', windowing: false },
  { label: 'after, rowWindowing off', dist: 'current', windowing: false },
  { label: 'after, rowWindowing on', dist: 'current', windowing: true },
].filter(v => !args.only || v.dist === args.only);

const ACTIONS = [
  ['mount', 'initial render'],
  ['updateOne', 'update one item'],
  ['scroll', 'vertical scroll 1200px (one jump)'],
  ['scrollSteps', 'vertical scroll 10 x 120px'],
  ['zoom', 'zoom in'],
  ['appendPage', 'append 25 routes / 1,000 items'],
];

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = createServer(async (req, res) => {
  try {
    const path = resolve(distRoot, `.${decodeURIComponent(req.url.split('?')[0])}`);
    if (!path.startsWith(distRoot)) throw new Error('outside');
    const body = await readFile(path.endsWith('/') ? join(path, 'index.html') : path);
    res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({
  executablePath: args.chromium || process.env.CHROMIUM_PATH,
});

async function taskSeconds(cdp) {
  const { metrics } = await cdp.send('Performance.getMetrics');
  return metrics.find(m => m.name === 'TaskDuration').value;
}

async function runOnce(variant, throttle) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Performance.enable');
  await page.goto(`${origin}/${variant.dist}/index.html`);
  await page.waitForFunction(() => window.bench);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });

  const result = {};
  for (const [action] of ACTIONS) {
    const before = await taskSeconds(cdp);
    const wall = action === 'mount'
      ? await page.evaluate(w => window.bench.mount({ windowing: w }), variant.windowing)
      : await page.evaluate(a => window.bench[a](), action);
    await page.waitForTimeout(250);
    const busy = (await taskSeconds(cdp) - before) * 1000;
    result[action] = { wall, busy };
    if (action === 'mount') {
      result.nodesAfterMount = await page.evaluate(() => window.bench.nodes());
      result.rowsAfterMount = await page.evaluate(() => window.bench.renderedRows());
    }
  }
  result.nodesAfterAppend = await page.evaluate(() => window.bench.nodes());
  result.counts = await page.evaluate(() => window.bench.counts());
  await context.close();
  return result;
}

async function markupAfterMount(variant) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${origin}/${variant.dist}/index.html`);
  await page.waitForFunction(() => window.bench);
  await page.evaluate(w => window.bench.mount({ windowing: w }), variant.windowing);
  await page.waitForTimeout(250);
  const markup = await page.evaluate(() => window.bench.markup());
  await context.close();
  return markup;
}

const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const results = {};
for (const throttle of throttles) {
  for (const variant of variants) {
    const samples = [];
    for (let i = 0; i < runs; i += 1) {
      samples.push(await runOnce(variant, throttle));
    }
    const summary = {};
    for (const [action] of ACTIONS) {
      summary[action] = {
        wall: median(samples.map(s => s[action].wall)),
        busy: median(samples.map(s => s[action].busy)),
      };
    }
    summary.nodesAfterMount = median(samples.map(s => s.nodesAfterMount));
    summary.rowsAfterMount = median(samples.map(s => s.rowsAfterMount));
    summary.nodesAfterAppend = median(samples.map(s => s.nodesAfterAppend));
    summary.counts = samples[0].counts;
    results[`${throttle}x ${variant.label}`] = summary;
    console.error(`done ${throttle}x ${variant.label}`);
  }
}

if (variants.length === 3 && !args['skip-markup']) {
  const [beforeMarkup, offMarkup] = [await markupAfterMount(variants[0]), await markupAfterMount(variants[1])];
  results.markupIdenticalBeforeVsOff = beforeMarkup === offMarkup;
}

await browser.close();
server.close();

const fmt = n => `${Math.round(n)}`;
const lines = [];
lines.push(`Medians of ${runs} runs. Each cell: main-thread busy ms (CDP TaskDuration) / wall ms to next paint.`);
lines.push('');
lines.push(`| CPU | variant | ${ACTIONS.map(([, label]) => label).join(' | ')} | DOM nodes (mount) | rows mounted | DOM nodes (after append) |`);
lines.push(`|---|---|${ACTIONS.map(() => '---').join('|')}|---|---|---|`);
for (const [key, s] of Object.entries(results)) {
  if (typeof s !== 'object') continue;
  const [cpu, ...label] = key.split(' ');
  lines.push(`| ${cpu} | ${label.join(' ')} | ${ACTIONS.map(([a]) => `${fmt(s[a].busy)} / ${fmt(s[a].wall)}`).join(' | ')} | ${s.nodesAfterMount} | ${s.rowsAfterMount} | ${s.nodesAfterAppend} |`);
}
if ('markupIdenticalBeforeVsOff' in results) {
  lines.push('');
  lines.push(`Timeline markup after mount identical between base branch and rowWindowing off: ${results.markupIdenticalBeforeVsOff}`);
}
console.log(lines.join('\n'));
if (args.out) {
  await writeFile(args.out, JSON.stringify(results, null, 2));
}
