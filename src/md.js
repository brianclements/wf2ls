import utils from './utils.js';
import { indentNote } from './node.js';
import {
  tagInText,
  stripTag,
  toPageLink,
  makeBlockNamePrefix,
  makeBlockNotePrefix
} from './text.js';

/*
 * @params:
 *   {AppState}, application state object
 *   {mainConfig}, application config object
 *   <pageName:string>, name of current page being processed
 *   {node:JSON}, current JSON node object
 *   <nNodes:int>, total number of children nodes in {node}
 *   <nNodes:int>, level of indenting for next set of children nodes
 *   <isNewPage:bool>, tell new recursive branch that it's starting a new page
 * @returns: <null>, appends to pages map in {AppState}
 */
const convertToMd = (state, conf, pageName, node, nNodes, indentLvl, isNewPage) => {
  pageName ? pageName : pageName = "content";
  indentLvl ? indentLvl : indentLvl = 0;
  isNewPage ? isNewPage : isNewPage = false;
  let pageBlocks = [];
  for (let n of node) {
    state.incrementJobProgress();
    if (n.name !== "") {
      let name = n.name.trim();
      let note = "";
      let completed = "";
      let marker = "";
      if (tagInText(conf.get("newPageTag"), n.name) ||
          tagInText(conf.get("newPageTag"), n.note) &&
          !isNewPage) {
            let pName = stripTag(conf.get("newPageTag"), name).trim();
            n.name = toPageLink(pName);
            name = n.name;
            n.note = stripTag(conf.get("newPageTag"), n.note).trim();
            let newNode = n.children;
            newNode.unshift(utils.makeNode(
              indentNote( {note: n.note}, makeBlockNotePrefix(conf.get("indentSpaces"), 0)),
              ''));
            state.addJob();
            pageBlocks.push(makeBlockNamePrefix(conf.get("indentSpaces"), indentLvl) + name);
            convertToMd(
              state,
              conf,
              pName.trim(),
              newNode,
              newNode.length,
              0,
              true
            );
            nNodes--;
            continue;
      }

      note = indentNote(n, makeBlockNotePrefix(conf.get("indentSpaces"), indentLvl));

      if (n.layoutMode === "todo") {
        marker = "TODO ";
        if (n.completed) {
          completed = "\n" + makeBlockNotePrefix(conf.get("indentSpaces"), indentLvl) + "completed-on:: " + toPageLink(n.completed);
          marker = "DONE ";
        }
      }

      pageBlocks.push(makeBlockNamePrefix(conf.get("indentSpaces"), indentLvl) + marker + name + completed + note);

      if (n.children) {
        pageBlocks.push(convertToMd(
          state,
          conf,
          pageName.trim(),
          n.children,
          n.children.length,
          indentLvl + 1,
          false));
      }
    }
    nNodes--;
  };

  if (nNodes === 0 && indentLvl > 0) {
    return pageBlocks.join('\n');
  }

  state.addPage(pageName.trim(), pageBlocks.join('\n'));
}

export { convertToMd };
