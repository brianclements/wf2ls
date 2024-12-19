/* Processing and intake of JSON in Workflowy backup file format and structure.
 *
 * TODO: specify this output object structure so that diff JSON inputs can be
 * used from other applications later as plugins.
*/

import date from './date.js';
import { nodeIsBacklink } from './node.js';

/*
 * @params: 
 *   {AppState}, application state object
 *   {JSON}, raw JSON data loaded from Workflowy .backup file
 * @returns: {JSON} of same structure, with selected properties and minor
 *           formatting cleanup. 
 */
const parseWfData = (state, data) => {
  let newData = [];
  for (let node of data) {
    if (node.nm !== "") {
      let newNode = {};
      state.addJob()
      // if (!resultIdMap.get(node.id)) resultIdMap.set(node.id, newNode);
      newNode.name = node.nm.trim();
      // newNode.id = node.id;
      // if (node.ct) newNode.created = date.wfTimeToLocalTime(node.ct, date.WF_EPOCH_SECONDS_PST);
      if (node.no) newNode.note = node.no.trim();
      if (node.cp) newNode.completed = date.wfTimeToLocalTime(node.cp, date.WF_EPOCH_SECONDS_PST);
      //TODO: make parser output also use 'node.metadata.layoutMode' format
      if (node.metadata.layoutMode == "todo") newNode.layoutMode = "todo";
      // newNode.lastModified = date.wfTimeToLocalTime(node.lm, date.WF_EPOCH_SECONDS_PST);
      // node.mirrorRootItems?.forEach(item => mirrors.set(item.id, node.id));
      if (node.ch) {
        if (!(node.ch.length === 1 && nodeIsBacklink(node.ch[0]))) {
          newNode.children = parseWfData(state, node.ch); 
        }
      }
      newData.push(newNode)
    } else {
      continue;
    }
  };
  return newData;
}

// TODO: change filename to parsers
export { parseWfData };
