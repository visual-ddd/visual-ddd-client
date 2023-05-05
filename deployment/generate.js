const { mkdirpSync, statSync, readdirSync, readFileSync, writeFileSync, copyFileSync } = require('fs-extra');
const { template } = require('lodash');
const path = require('path');
const json5 = require('json5');

const CURRENT = __dirname;
const OUTPUT = path.join(CURRENT, './output');
const SOURCE = path.join(CURRENT, './source');
const CONFIG = path.join(CURRENT, './variable.jsonc');

mkdirpSync(OUTPUT);

const vars = json5.parse(readFileSync(CONFIG).toString());
const files = readdirSync(SOURCE);

for (const filename of files) {
  const fullFilename = path.join(SOURCE, filename);
  const stat = statSync(fullFilename);
  if (stat.isDirectory()) {
    continue;
  }

  const content = readFileSync(fullFilename).toString();
  const compiled = template(content);
  const result = compiled(vars);

  writeFileSync(path.join(OUTPUT, filename), result);
}

copyFileSync(path.join(CURRENT, './README.md'), path.join(OUTPUT, './README.md'));
