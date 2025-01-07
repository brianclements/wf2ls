import { expect } from 'chai';

import {
  AppConfig,
  defaultConfig
} from '../src/config.js';
import { convertHtmlToMd } from '../src/md.js';

describe('md.js', () => {
  let testConfig;
  beforeEach(() => {
    testConfig = new AppConfig(defaultConfig)
  });
  describe('convertHtmlToMd()', () => {
    describe('Handles HTML Reserved Characters', () => {
      it.skip('Greater-than', () => { // an issue with turndown, see: https://github.com/mixmark-io/turndown/issues/395 
        let testContentPass = '&gt;'
        let testContentPassResult = '>'
        expect(convertHtmlToMd(testConfig, testContentPass)).to.deep.equal(testContentPassResult);
      });
      it('Less-than', () => {
        let testContentPass = '&lt;'
        let testContentPassResult = '<'
        expect(convertHtmlToMd(testConfig, testContentPass)).to.deep.equal(testContentPassResult);
      });
      it('Ampersand', () => {
        let testContentPass = '&amp;'
        let testContentPassResult = '&'
        expect(convertHtmlToMd(testConfig, testContentPass)).to.deep.equal(testContentPassResult);
      });
      it('Apostrophe', () => {
        let testContentPass = '&apos;'
        let testContentPassResult = "'"
        expect(convertHtmlToMd(testConfig, testContentPass)).to.deep.equal(testContentPassResult);
      });
      it('Quotation Mark', () => {
        let testContentPass = '&quot;'
        let testContentPassResult = '"'
        expect(convertHtmlToMd(testConfig, testContentPass)).to.deep.equal(testContentPassResult);
      });
    });
    it('Preserves newlines outside of html content', () => {
      let testContentPass = '\nNon-html filler\n<a href="https://www.example.com">Example.com</a>\nmore filler'
      let testContentPassResult = '\nNon-html filler\n[Example.com](https://www.example.com)\nmore filler'
      expect(convertHtmlToMd(testConfig, testContentPass)).to.deep.equal(testContentPassResult);
    });
    it('Anchors', () => { // for more rigourous test examples, see acceptance tests in main.test.js 
      let testContentPass = 'Non-html filler <a href="https://www.example.com">Example.com</a> more filler'
      let testContentPassResult = 'Non-html filler [Example.com](https://www.example.com) more filler'
      expect(convertHtmlToMd(testConfig, testContentPass)).to.deep.equal(testContentPassResult);
    });
    it('Bold text', () => {
      let testContentPass = 'Non-html filler <b>bold text</b> more filler'
      let testContentPassResult = 'Non-html filler **bold text** more filler'
      expect(convertHtmlToMd(testConfig, testContentPass)).to.deep.equal(testContentPassResult);
    });
    it('Underline text', () => {
      let testContentPass = 'Non-html filler <u>underline text</u> more filler'
      let testContentPassResult = 'Non-html filler <u>underline text</u> more filler'
      expect(convertHtmlToMd(testConfig, testContentPass)).to.deep.equal(testContentPassResult);
    });
    it('Italic text', () => {
      let testContentPass = 'Non-html filler <i>italic text</i> more filler'
      let testContentPassResult = 'Non-html filler _italic text_ more filler'
      expect(convertHtmlToMd(testConfig, testContentPass)).to.deep.equal(testContentPassResult);
    });
    it('Strike-through text', () => {
      let testContentPass = 'Non-html filler <s>strike-through text</s> more filler'
      let testContentPassResult = 'Non-html filler ~~strike-through text~~ more filler'
      expect(convertHtmlToMd(testConfig, testContentPass)).to.deep.equal(testContentPassResult);
    });
    it('Color highlight', () => {
      // testing subset of default conversions for simplicify. For complete
      // testing of all colors and plugins, see acceptance tests in
      // main.test.js
      let testContentPass = 'Non-html filler <span class=\"colored bc-red\">red highlight</span> more filler'
      let testContentPassResult = 'Non-html filler [[#red]]==red highlight== more filler'
      expect(convertHtmlToMd(testConfig, testContentPass)).to.deep.equal(testContentPassResult);

      testContentPass = 'Non-html filler <span class=\"colored bc-yellow\">yellow highlight</span> more filler'
      testContentPassResult = 'Non-html filler ==yellow highlight== more filler'
      expect(convertHtmlToMd(testConfig, testContentPass)).to.deep.equal(testContentPassResult);

      testContentPass = 'Non-html filler <span class=\"colored bc-green\">green highlight</span> more filler'
      testContentPassResult = 'Non-html filler [[#green]]==green highlight== more filler'
      expect(convertHtmlToMd(testConfig, testContentPass)).to.deep.equal(testContentPassResult);

      testContentPass = 'Non-html filler <span class=\"colored bc-blue\">blue highlight</span> more filler'
      testContentPassResult = 'Non-html filler [[#blue]]==blue highlight== more filler'
      expect(convertHtmlToMd(testConfig, testContentPass)).to.deep.equal(testContentPassResult);
    });
  });
});
