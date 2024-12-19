import { convertToMd } from './md.js';
import { parseWfData } from './parsers.js';

const main = (state, conf, data) => {
  const parsedData = parseWfData(state, data);
  state.startProgressBar();
  convertToMd(state, conf, conf.get("defaultPage"), parsedData, parsedData.length);
  state.stopProgressBar();

  if (state.isTestInstance) return state;
}

export { main };
