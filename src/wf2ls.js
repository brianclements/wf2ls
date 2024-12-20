import { default as minimist } from 'minimist';

import { AppState } from './state.js';
import { 
  AppConfig,
  defaultConfig,
  updateConfigFromCliArgs,
  updateConfigFromFile
} from './config.js';
import { mainProgressBar } from './progress.js';
import { main } from './main.js';
import {
  readJsonFile,
  fileExists,
  writeFile
} from './fs.js';

// CLI entrypoint for main()
// process config files first.
// REMEMBER: all paths are relative to your PWD in your term. Easiest common
// reference is the root of src.
const mainConfig = new AppConfig(defaultConfig); // internal from config.js
let confFile = undefined;

if (fileExists(mainConfig.get("confFileLocation"))) { // ./config.json
  confFile = readJsonFile(mainConfig.get("confFileLocation"));
  updateConfigFromFile(mainConfig, confFile[0]);
}

const cliArgs = minimist(process.argv.slice(2));
if (fileExists(cliArgs.c)) { // config from custom location, "-c" option on CLI
  confFile = readJsonFile(cliArgs.c);
  updateConfigFromFile(mainConfig, confFile[0]);
}

// give CLI args a chance to override anything from defaultConfig or confFile
updateConfigFromCliArgs(mainConfig, cliArgs);

const rawData = readJsonFile(mainConfig.get("sourceFile"));
const mainState = new AppState(mainProgressBar);

main(mainState, mainConfig, rawData);

for (let [page, content] of mainState.pages) {
  writeFile(content, page + ".md", mainConfig.get("destDir"));
}
