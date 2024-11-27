const { config } = require('./config.js');
const progress = require('./progress.js');
const utils = require('./utils.js');
const {
  tagInText,
  stripTag,
  toPageLink,
  makeBlockPrefix,
  makeNotePrefix
} = require('./text.js');

let jobProgress = 0;
let pages = new Map();
let mirrors = new Map();

/*
 * @params: {JSON} single JSON node object
 * @returns: <string>, string of formatted note text with indents & newlines
 */
const processNote = (node, indentTxt) => {
  let note = "";
  if (node.note) {
    let lines = node.note.split('\n');
    let prefixedLines = []
    lines.forEach(l => {
      prefixedLines.push(indentTxt + l);
    });
    note = '\n' + prefixedLines.join(`\n`);
  }

  return note;
}

/*
 * @params:
 *   <pageName:string>, name of current page being processed
 *   {node:JSON}, current JSON node object
 *   <nNodes:int>, total number of children nodes in {node}
 *   <nNodes:int>, level of indenting for next set of children nodes
 *   <isNewPage:bool>, tell new recursive branch that it's starting a new page
 * @returns: <null>, appends to global "pages" map
 */
const parse2md = (pageName, node, nNodes, indentLvl, isNewPage) => {
  pageName ? pageName : pageName = "content";
  indentLvl ? indentLvl : indentLvl = 0;
  isNewPage ? isNewPage : isNewPage = false;
  let pageBlocks = [];
  for (n of node) {
    jobProgress++;
    // console.log(n.name + ": " + jobProgress)
    progress.bar.update(jobProgress);
    if (n.name !== "") {
      let name = n.name.trim();
      let note = "";
      let completed = "";
      let marker = "";
      if (tagInText(config.newPageTag, n.name) ||
          tagInText(config.newPageTag, n.note) &&
          !isNewPage) {
            pName = stripTag(config.newPageTag, name).trim();
            n.name = toPageLink(pName);
            name = n.name;
            n.note = stripTag(config.newPageTag, n.note).trim();
            newNode = n.children;
            newNode.unshift(utils.makeNode(
              processNote( {note: n.note}, makeNotePrefix(0)),
              ''));
            progress.totalNumNodes++
            progress.bar.setTotal(progress.totalNumNodes);
            parse2md(pName.trim(), newNode, newNode.length, 0, true);
      }

      note = processNote(n, makeNotePrefix(indentLvl));

      if (n.layoutMode === "todo") {
        marker = "TODO ";
        if (n.completed) {
          completed = "\n" + makeNotePrefix(indentLvl) + "completed-on:: " + n.completed;
          marker = "COMPLETED ";
        }
      }

      pageBlocks.push(makeBlockPrefix(indentLvl) + marker + name + completed + note);

      if (n.children) {
        pageBlocks.push(parse2md(
          pageName.trim(),
          n.children,
          n.children.length,
          indentLvl + 1,
          false));
      }
    }
    nNodes -= 1;
  };

  if (nNodes === 0 && indentLvl > 0) {
    return pageBlocks.join('\n');
  }

  pages.set(pageName.trim(), pageBlocks.join('\n'));
}

module.exports = {
  pages,
  parse2md
}