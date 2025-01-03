/* Node Testing and Processing
 *
 */
import { default as _ } from 'lodash';

/*
 * @params: 
 *    [empty]
 *    OR
 *    {props}, object defining any of:
 *      <id:string>, default: randomUUID()
 *      <name:string>, default: ''
 *      <note:string>, default: nonexistent
 *      <completed:string>, default: nonexistent
 *      <children:array>, default: nonexistent,
 *          can include an array of recursive makeNode() functions
 * @returns: {node}, node object compatible with convertToMd()
 */
const makeNode = (props) => {
  props = (props ?? {});
  let newNode = { metadata: {}};

  props.id ? newNode.id = props.id : newNode.id = crypto.randomUUID();
  props.name ? newNode.name = props.name : newNode.name = '';
  if (props.note) newNode.note = props.note;
  if (props.completed) newNode.completed = props.completed;
  if (props.children) newNode.children = props.children;

  return newNode;
}

const nodeHasNote = (node) => {
  if (node.note) {
    return true;
  } else {
    return false;
  }
}

const nodeIsBacklink = (node) => {
  if (node.metadata.isReferencesRoot) {
    return true;
  } else {
    return false;
  }
}

const nodeIsBoard = (node) => {
  if (node.metadata.layoutMode === 'board') {
    return true;
  } else {
    return false;
  }
}

const nodeIsBullet = (node) => {
  if (_.isEmpty(node.metadata)) {
    return true;
  } else {
    return false;
  }
}

const nodeIsCodeBlock = (node) => {
  if (node.metadata.layoutMode === 'code-block') {
    return true;
  } else {
    return false;
  }
}

const nodeIsH1 = (node) => {
  if (node.metadata.layoutMode === 'h1') {
    return true;
  } else {
    return false;
  }
}

const nodeIsH2 = (node) => {
  if (node.metadata.layoutMode === 'h2') {
    return true;
  } else {
    return false;
  }
}

const nodeIsParagraph = (node) => {
  if (node.metadata.layoutMode === 'p') {
    return true;
  } else {
    return false;
  }
}

const nodeIsQuoteBlock = (node) => {
  if (node.metadata.layoutMode === 'quote-block') {
    return true;
  } else {
    return false;
  }
}

const nodeIsTodo = (node) => {
  if (node.metadata.layoutMode === 'todo') {
    return true;
  } else {
    return false;
  }
}

export {
  makeNode,
  nodeHasNote,
  nodeIsBacklink,
  nodeIsBullet,
  nodeIsBoard,
  nodeIsCodeBlock,
  nodeIsH1,
  nodeIsH2,
  nodeIsParagraph,
  nodeIsQuoteBlock,
  nodeIsTodo
}
