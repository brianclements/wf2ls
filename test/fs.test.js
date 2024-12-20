import fs from 'fs';
import * as chai from 'chai';
import { default as chaiFiles } from 'chai-files';
chai.use(chaiFiles);
let expect = chai.expect;
let file = chaiFiles.file;
let dir = chaiFiles.dir;

import {
  directoryExists,
  fileExists,
  readJsonFile,
  makeDir,
  removeDirAndContents,
  writeFile
} from '../src/fs.js';

describe('fs.js', () => {
  const CWD = import.meta.dirname; // src/test/
  const testFileDir = CWD + "/tmp"; // src/test/tmp
  const existingTestDir = testFileDir;
  const nonExistingTestDir = CWD + "/notHere";

  describe('makeDir()', () => {
    it('Makes directory if it does not exist', () => {
      expect(dir(existingTestDir)).to.not.exist;
      expect(makeDir(existingTestDir)).to.be.ok;
      expect(dir(existingTestDir)).to.exist;
    });
    it('Throws error if directory already exists', () => {
      expect(dir(existingTestDir)).to.exist;
      expect(() => makeDir(existingTestDir)).to.throw(/already exists/);
      expect(dir(existingTestDir)).to.exist;
    });
    it('Throws error if destination is undefined', () => {
      expect(() => makeDir(undefined)).to.throw(/unknown error/);
    });
    after(() => {
      removeDirAndContents(existingTestDir);
    });
  });
  describe('removeDirAndContents()', () => {
    it("Removes directory if it exists", () => {
      expect(dir(existingTestDir)).to.not.exist;
      expect(makeDir(existingTestDir)).to.be.ok;
      expect(removeDirAndContents(existingTestDir)).to.be.ok;
      expect(dir(existingTestDir)).to.not.exist;
    });
    it('Throws error if directory does not exist', () => {
      expect(dir(nonExistingTestDir)).to.not.exist;
      expect(() => removeDirAndContents(nonExistingTestDir)).to.throw(/doesn't exist/);
    });
    // Can't quite figure out how to make a file that can't be deleted for testing.
    it.skip('Throws error if directory removal fails for some other reason', () => {
      expect(dir(existingTestDir)).to.not.exist;
      expect(makeDir(existingTestDir)).to.be.ok;
      fs.chmod(existingTestDir, 0o000, (err) => { // this should do it...
        if (err) {
          return err;
        }
      });
      // this still works for some reason even though permissions were completely removed...
      expect(() => removeDirAndContents(existingTestDir)).to.throw(/unknown error/);
    });
  });
  describe('directoryExists()', () => {
    before(() => {
      makeDir(testFileDir);
    });
    it('Returns true for existing directory', () => {
      expect(directoryExists(existingTestDir)).to.be.true;
    });
    it('Returns false for non-existing directory', () => {
      expect(directoryExists(nonExistingTestDir)).to.be.false;
      expect(dir(nonExistingTestDir)).to.not.exist; // verify
    });
    after(() => {
      removeDirAndContents(testFileDir);
    });
  });
  describe('writeFile()', () => {
    before(() => {
      makeDir(testFileDir);
    });
    it('Successfully writes a file when destDir does not end with /', () => {
      const testFileDir = CWD + "/tmp";
      expect(writeFile("data", "tmpFile", testFileDir)).to.be.ok;
      expect(file(testFileDir + "/tmpFile")).to.exist; // verify
    });
    it('Successfully writes a file when destDir ends with /', () => {
      const testFileDir = CWD + "/tmp/";
      expect(writeFile("data", "tmpFile", testFileDir)).to.be.ok;
      expect(file(testFileDir + "tmpFile")).to.exist; // verify
    });
    it('Throws error when destination does not exist', () => {
      expect(() => writeFile("data", "tmpFile", nonExistingTestDir)).to.throw(/doesn't exist/);
      expect(dir(nonExistingTestDir)).to.not.exist; // verify
    });
    after(() => {
      removeDirAndContents(testFileDir);
    });
  });
  describe('fileExists()', () => {
    before(() => {
      makeDir(testFileDir);
    });
    it('Returns true for existing file', () => {
      const existingFilePath = existingTestDir + "/tmpFile";
      expect(writeFile("data", "tmpFile", testFileDir)).to.be.ok;
      expect(fileExists(existingFilePath)).to.be.true;
      expect(file(existingFilePath)).to.exist; // verify
    });
    it('Returns false for non-existing file', () => {
      const nonExistingFilePath = nonExistingTestDir + "/tmpFile";
      expect(fileExists(nonExistingFilePath)).to.be.false;
      expect(file(nonExistingFilePath)).to.not.exist; // verify
    });
    after(() => {
      removeDirAndContents(testFileDir);
    });
  });
  describe('readJsonFile()', () => {
    before(() => {
      makeDir(testFileDir);
      writeFile('[{"key":"value"}]', "sampleJson", testFileDir);
    });
    it('Reads and parses JSON file', () => {
      const testJsonData = readJsonFile(testFileDir + "/sampleJson")
      expect(testJsonData[0].key).to.equal("value");
    });
    after(() => {
      removeDirAndContents(testFileDir);
    });
  });
});
