const { mkdirpSync, readdirSync, readFileSync, writeFileSync } = require('fs-extra');
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
  const content = readFileSync(path.join(SOURCE, filename)).toString();
  const compiled = template(content);
  const result = compiled(vars);

  writeFileSync(path.join(OUTPUT, filename), result);
}
