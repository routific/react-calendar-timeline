const fs = require('fs');
const path = require('path');

const libDir = path.join(__dirname, '..', 'lib');
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

// Compatibility shim for consumers that still resolve `main`/`lib` paths.
fs.writeFileSync(
  path.join(libDir, 'index.js'),
  [
    "'use strict';",
    "module.exports = require('../dist/react-calendar-timeline.cjs.js');",
    '',
  ].join('\n'),
);

console.log('Wrote lib/index.js compatibility shim');
