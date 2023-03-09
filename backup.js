const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const MIN_FONT_SIZE = 14;
const MIN_LETTER_SPACING = 0;
const MIN_WORD_SPACING = 0;
const INVALID_TEXT_JUSTIFY = 'justify';
const MAX_PARAGRAPH_WORDS = 20;
const MAX_UPPERCASE_PARAGRAPH_WORDS = 10;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // 1. Takes a web URL as input
  const url = 'https://www.aidentic.io/';
  await page.goto(url);

  // 2. Takes a screenshot of the page
  const screenshotPath = path.join(__dirname, 'screenshot', `${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath });

  // 3. Analyses the page and identifies all the HTML elements that do not respect the rules
  const invalidElements = await page.evaluate((minFontSize, minLetterSpacing, minWordSpacing, invalidTextJustify, maxParagraphWords, maxUppercaseParagraphWords) => {
    const invalidElements = {
      fontSize: [],
      letterSpacing: [],
      wordSpacing: [],
      textJustify: [],
      paragraphWords: [],
      uppercaseParagraphWords: []
    };

    // Helper function to check if a string is in uppercase
    const isUppercase = (str) => str.toUpperCase() === str;

    // Helper function to count words in a string
    const countWords = (str) => str.trim().split(/\s+/).length;

    // Helper function to check a paragraph's word count and uppercase ratio
    const checkParagraph = (p) => {
      const words = countWords(p.textContent);
      if (words > maxParagraphWords) {
        invalidElements.paragraphWords.push(p);
      } else if (isUppercase(p.textContent) && words > maxUppercaseParagraphWords) {
        invalidElements.uppercaseParagraphWords.push(p);
      }
    };

    // Helper function to check an element's CSS styles
    const checkStyles = (el) => {
      const computedStyles = window.getComputedStyle(el);
      const fontSize = parseFloat(computedStyles.getPropertyValue('font-size'));
      const letterSpacing = parseFloat(computedStyles.getPropertyValue('letter-spacing'));
      const wordSpacing = parseFloat(computedStyles.getPropertyValue('word-spacing'));
      const textJustify = computedStyles.getPropertyValue('text-align');

      if (fontSize < minFontSize) {
        invalidElements.fontSize.push(el);
      }

      if (letterSpacing < minLetterSpacing) {
        invalidElements.letterSpacing.push(el);
      }

      if (wordSpacing < minWordSpacing) {
        invalidElements.wordSpacing.push(el);
      }

      if (textJustify === invalidTextJustify) {
        invalidElements.textJustify.push(el);
      }

      if (el.tagName.toLowerCase() === 'p') {
        checkParagraph(el);
      }
    };

    // Iterate through all elements and check their styles
    document.querySelectorAll('*').forEach((el) => {
      checkStyles(el);
    });

    return invalidElements;
  }, MIN_FONT_SIZE, MIN_LETTER_SPACING, MIN_WORD_SPACING, INVALID_TEXT_JUSTIFY, MAX_PARAGRAPH_WORDS, MAX_UPPERCASE_PARAGRAPH_WORDS);

    // 4. Stores those HTML elements in a dedicated object (including the tag type, the CSS classes and the IDs), one per each rule
    const errors = [
        { name: 'fontSize', elements: invalidElements.fontSize },
        { name: 'letterSpacing', elements: invalidElements.letterSpacing },
        { name: 'wordSpacing', elements: invalidElements.wordSpacing },
        { name: 'textJustify', elements: invalidElements.textJustify },
        { name: 'paragraphWords', elements: invalidElements.paragraphWords },
        { name: 'uppercaseParagraphWords', elements: invalidElements.uppercaseParagraphWords },
      ];
    
      const errorsObj = {};
      for (const error of errors) {
        errorsObj[error.name] = error.elements.map(el => {
          const { tagName, id, className } = el;
          return {
            tag: tagName,
            id,
            classes: className.split(' ')
          };
        });
      }
    
      // 5. Stores all the rules-objects in an array
      const errorsArray = errors.map(error => {
        return {
          rule: error.name,
          errors: error.elements.length
        };
      });
    
      // 6. Prints those objects in a clean JSON file (null, 2) and saves the JSON file in the folder “JSON”
      const errorsJson = JSON.stringify(errorsObj, null, 2);
      const jsonPath = path.join(__dirname, 'JSON', `${Date.now()}.json`);
      fs.writeFileSync(jsonPath, errorsJson);
    
      // 7. Highlights the concerned HTML elements on the page screenshot with a dedicated pastel-orange border and stores it in the dedicated folder “screenshot”
      const highlightedScreenshotPath = path.join(__dirname, 'screenshot', `${Date.now()}_highlighted.png`);
    
      for (const error of errors) {
        const borderStyle = '4px solid #FFA07A';
        for (const element of error.elements) {
          await page.evaluate((el, border) => {
            el.style.border = border;
          }, element, borderStyle);
        }
      }
    
      await page.screenshot({ path: highlightedScreenshotPath });
    
      // 8. Opens the screenshot with the highlighted HTML tags in a dedicated window
      const highlightedScreenshotUrl = `file://${highlightedScreenshotPath}`;
      const newPage = await browser.newPage();
      await newPage.goto(highlightedScreenshotUrl);
    
      // 9. Console logs the number of issues identified per rule, with the following message: “rule: X n. Errors identified”
      for (const error of errorsArray) {
        console.log(`${error.rule}: ${error.errors} Errors identified`);
      }
    
      await browser.close();
    })();
    


    const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const MIN_FONT_SIZE = 14;
const MIN_LETTER_SPACING = 0;
const MIN_WORD_SPACING = 0;
const INVALID_TEXT_JUSTIFY = 'justify';
const MAX_PARAGRAPH_WORDS = 20;
const MAX_UPPERCASE_PARAGRAPH_WORDS = 10;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // 1. Takes a web URL as input
  const url = 'https://www.google.com/';
  await page.goto(url);

  // 2. Takes a screenshot of the page
  const screenshotPath = path.join(__dirname, 'screenshot', `${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath });

  // 3. Analyses the page and identifies all the HTML elements that do not respect the rules
  const invalidElements = await page.evaluate((minFontSize, minLetterSpacing, minWordSpacing, invalidTextJustify, maxParagraphWords, maxUppercaseParagraphWords) => {
    const invalidElements = {
      fontSize: [],
      letterSpacing: [],
      wordSpacing: [],
      textJustify: [],
      paragraphWords: [],
      uppercaseParagraphWords: []
    };

    // Helper function to check if a string is in uppercase
    const isUppercase = (str) => str.toUpperCase() === str;

    // Helper function to count words in a string
    const countWords = (str) => str.trim().split(/\s+/).length;

    // Helper function to check a paragraph's word count and uppercase ratio
    const checkParagraph = (p) => {
      const words = countWords(p.textContent);
      if (words > maxParagraphWords) {
        invalidElements.paragraphWords.push(p);
      } else if (isUppercase(p.textContent) && words > maxUppercaseParagraphWords) {
        invalidElements.uppercaseParagraphWords.push(p);
      }
    };

    // Helper function to check an element's CSS styles
    const checkStyles = (el) => {
      const computedStyles = window.getComputedStyle(el);
      const fontSize = parseFloat(computedStyles.getPropertyValue('font-size'));
      const letterSpacing = parseFloat(computedStyles.getPropertyValue('letter-spacing'));
      const wordSpacing = parseFloat(computedStyles.getPropertyValue('word-spacing'));
      const textJustify = computedStyles.getPropertyValue('text-align');

      if (fontSize < minFontSize) {
        invalidElements.fontSize.push(el);
      }

      if (letterSpacing < minLetterSpacing) {
        invalidElements.letterSpacing.push(el);
      }

      if (wordSpacing < minWordSpacing) {
        invalidElements.wordSpacing.push(el);
      }

      if (textJustify === invalidTextJustify) {
        invalidElements.textJustify.push(el);
      }

      if (el.tagName.toLowerCase() === 'p') {
        checkParagraph(el);
      }
    };

    // Iterate through all elements and check their styles
    document.querySelectorAll('*').forEach((el) => {
      checkStyles(el);
    });

    return invalidElements;
  }, MIN_FONT_SIZE, MIN_LETTER_SPACING, MIN_WORD_SPACING, INVALID_TEXT_JUSTIFY, MAX_PARAGRAPH_WORDS, MAX_UPPERCASE_PARAGRAPH_WORDS);

    // 4. Stores those HTML elements in a dedicated object (including the tag type, the CSS classes and the IDs), one per each rule
    const errors = [
        { name: 'fontSize', elements: invalidElements.fontSize },
        { name: 'letterSpacing', elements: invalidElements.letterSpacing },
        { name: 'wordSpacing', elements: invalidElements.wordSpacing },
        { name: 'textJustify', elements: invalidElements.textJustify },
        { name: 'paragraphWords', elements: invalidElements.paragraphWords },
        { name: 'uppercaseParagraphWords', elements: invalidElements.uppercaseParagraphWords },
      ];
    
      const errorsObj = {};
      for (const error of errors) {
        errorsObj[error.name] = error.elements.map(el => {
          const { tagName, id, className } = el;
          return {
            tag: tagName,
            id,
            classes: className.split(' ')
          };
        });
      }
    
      // 5. Stores all the rules-objects in an array
      const errorsArray = errors.map(error => {
        return {
          rule: error.name,
          errors: error.elements.length
        };
      });
    
      // 6. Prints those objects in a clean JSON file (null, 2) and saves the JSON file in the folder “JSON”
      const errorsJson = JSON.stringify(errorsObj, null, 2);
      const jsonPath = path.join(__dirname, 'JSON', `${Date.now()}.json`);
      fs.writeFileSync(jsonPath, errorsJson);
    
      // 7. Highlights the concerned HTML elements on the page screenshot with a dedicated pastel-orange border and stores it in the dedicated folder “screenshot”
      const highlightedScreenshotPath = path.join(__dirname, 'screenshot', `${Date.now()}_highlighted.png`);
    
      for (const error of errors) {
        const borderStyle = '4px solid #FFA07A';
        for (const element of error.elements) {
          await page.evaluate((el, border) => {
            el.style.border = border;
          }, element, borderStyle);
        }
      }
    
      await page.screenshot({ path: highlightedScreenshotPath });
    
      // 8. Opens the screenshot with the highlighted HTML tags in a dedicated window
        const highlightedScreenshotUrl = `file://${highlightedScreenshotPath}`;
        const newPage = await browser.newPage();
        await newPage.goto(highlightedScreenshotUrl);

        // 9. Prints in the console the summary of the errors detected, grouped by type
        console.log('Error summary:');
        for (const error of errorsArray) {
            console.log(`${error.rule}: ${error.errors} errors`);
        }

        // 10. Closes the browser
        await browser.close();
})();
    
