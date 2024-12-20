import fs from 'fs';

const directoryExists = (path) => {
  try {
    return fs.statSync(path).isDirectory();
  } catch (err) {
    return false;
  }
}

const fileExists = (fPath) => {
  try {
    return fs.existsSync(fPath);
  } catch (err) {
    return false;
  }
}

const makeDir = (dPath) => {
  try {
    fs.mkdirSync(dPath);
    return true;
  } catch (err) {
    let postMsg;
    if (directoryExists(dPath)) {
      postMsg = "\n\tdirectory already exists"
    } else {
      postMsg = "\n\tunknown error\n" + err;
    }
    throw new Error(
    "Could not create directory at \"" + dPath + "\", " + postMsg);
  }
}

const readJsonFile = (fPath) => {
  let rawJson;
  try {
    rawJson = fs.readFileSync(fPath);
  } catch (err) {
    throw err;
  }
  return JSON.parse(rawJson);
}

const removeDirAndContents = (dPath) => {
  try {
    fs.rmdirSync(dPath, { recursive: true });
    return true;
  } catch (err) {
    let postMsg;
    if (directoryExists(dPath)) {
      postMsg = "\n\tunknown error";
    } else {
      postMsg = "\n\tdirectory doesn't exist"
    }
    throw new Error(
    "Could not delete directory at \"" + dPath + "\", " + postMsg);
  }
}

const writeFile = (data, file, destDir) => {
  let filePath = ""
  if (directoryExists(destDir)) {
    if (destDir.endsWith("/")) {
      filePath = destDir + file 
    } else {
      filePath = destDir + "/" + file
    }
    try {
      fs.writeFileSync(filePath, data)
      return true;
    } catch (err) {
      return err;
    }
  } else {
  throw new Error(
    "Could not write to \"" + destDir + "," + "\n\tdirectory doesn't exist.");
  }
}

export { 
  directoryExists,
  fileExists,
  makeDir,
  readJsonFile,
  removeDirAndContents,
  writeFile
};
