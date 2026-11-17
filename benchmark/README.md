# Timeline benchmark

A page shaped like planning-web's routes Gantt, driven in headless Chromium with CPU throttling.

## What it renders

- 67 routes (groups) and 2,747 items: per route a shift bar, two route-line segments, start and end depots, 34 delivery stops, an idle gap and a break.
- Clustering on, with planning-web's settings (`tinyItemSize: 0.2`, `clusteringRange: 0.5`, increased hover on tiny items).
- 48px rows, a 420px sidebar with a multi-element `groupRenderer`, a `rowRenderer` wrapping `GroupRow`/`RowItems` in a styled-component, and item/cluster renderers that build several elements per item, with styled-components for stops.
- The timeline body (`.rct-outer`) is the vertical scroll container inside a 640px panel, as in planning-web.

## What it measures

Per run, on a fresh page: initial render, updating one stop (new `items` and `groups` arrays, other item objects unchanged), one 1200px vertical scroll, ten 120px scroll steps, a zoom-in, and appending 25 routes with 1,000 items. Each action reports the main-thread busy time (CDP `TaskDuration` delta, read 250ms after the action) and the wall time until the next paint. DOM node counts are taken after mount and after the append.

The runner also checks that the timeline markup after mount is identical between the base branch and this branch with `rowWindowing` off.

## Limits compared with the real app

- No MobX, Ant Design or Hive components, popovers, hover state or store updates; real renderers are heavier, so absolute numbers are lower than in planning-web. Relative differences are what this is for.
- Item objects that did not change keep their identity between updates. planning-web currently rebuilds every item on each change, which re-renders every mounted item regardless of this library.
- Headless Chromium on a developer machine with CDP CPU throttling; not real low-end hardware.

## Running it

```bash
# once: a browser driver (not a dependency of the package)
npm i --no-save playwright-core

# build the page against this checkout and against the base branch
git worktree add ../rct-base master
ln -s "$PWD/node_modules" ../rct-base/node_modules
npx vite build --config benchmark/vite.config.js
TIMELINE_DIR=../rct-base BENCH_LABEL=before npx vite build --config benchmark/vite.config.js

# run (CHROMIUM_PATH: any Chromium/Chrome binary)
CHROMIUM_PATH=/path/to/chrome node benchmark/run.mjs --runs=5 --throttle=1,4,6
```
