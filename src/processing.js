/* Processing and intake of JSON in Workflowy backup file format and structure.
*/

import date from './date.js';
import { nodeIsBacklink } from './node.js';

/*
 * @params: 
 *   {AppState}, application state object
 *   {JSON}, raw JSON data loaded from Workflowy .backup file
 * @returns: {JSON} of same structure, with selected properties and minor formatting cleanup
 */
const parseData = (state, data) => {
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
      if (node.metadata.layoutMode == "todo") newNode.layoutMode = "todo";
      // newNode.lastModified = date.wfTimeToLocalTime(node.lm, date.WF_EPOCH_SECONDS_PST);
      // node.mirrorRootItems?.forEach(item => mirrors.set(item.id, node.id));
      if (node.ch) {
        if (!(node.ch.length === 1 && nodeIsBacklink(node.ch[0]))) {
          newNode.children = parseData(state, node.ch); 
        }
      }
      newData.push(newNode)
    } else {
      continue;
    }
  };
  return newData;
}

export { parseData };
