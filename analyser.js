const puppeteer = require('puppeteer-core');
const getContrast = require('get-contrast');
const fs = require('fs');
const path = require('path');
const url = 'https://www.comptoirdesvoyages.fr/';
const minFontSizeSelector = '*, *::before, *::after';
const minFontSize = '14px';
(async () => {
	const browser = await puppeteer.launch({
		executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		headless: false
	});
	const page = await browser.newPage();
	await page.goto(url, {
		waitUntil: 'networkidle0'
	});
	const wrongElements = {
		minFontSize: [],
		letterSpacing: [],
		wordSpacing: [],
		textAlign: [],
		paragraphLength: [],
		uppercaseParagraphs: [],
		contrastRatio: []
	};
	// Find elements that violate the minimum font size rule
	const fontSizes = await page.$$eval(minFontSizeSelector, elements => elements.map(el => ({
		tag: el.tagName,
		classes: el.className,
		id: el.id,
		fontSize: window.getComputedStyle(el).getPropertyValue('font-size')
	})));
	fontSizes.forEach(({
		tag,
		classes,
		id,
		fontSize
	}) => {
		if (fontSize < minFontSize) {
			wrongElements.minFontSize.push({
				tag,
				classes,
				id,
				fontSize
			});
		}
	});
	// Find elements that violate the letter spacing rule
	const letterSpacingSelector = 'p, h1, h2, h3, h4, h5, h6, li, span';
	const letterSpacings = await page.$$eval(letterSpacingSelector, elements => elements.map(el => ({
		tag: el.tagName,
		classes: el.className,
		id: el.id,
		letterSpacing: window.getComputedStyle(el).getPropertyValue('letter-spacing')
	})));
	letterSpacings.forEach(({
		tag,
		classes,
		id,
		letterSpacing
	}) => {
		if (letterSpacing <= 0) {
			wrongElements.letterSpacing.push({
				tag,
				classes,
				id,
				letterSpacing
			});
		}
	});
	// Find elements that violate the word spacing rule
	const wordSpacingSelector = 'p, h1, h2, h3, h4, h5, h6, li, span';
	const wordSpacings = await page.$$eval(wordSpacingSelector, elements => elements.map(el => ({
		tag: el.tagName,
		classes: el.className,
		id: el.id,
		wordSpacing: window.getComputedStyle(el).getPropertyValue('word-spacing')
	})));
	wordSpacings.forEach(({
		tag,
		classes,
		id,
		wordSpacing
	}) => {
		if (wordSpacing <= 0) {
			wrongElements.wordSpacing.push({
				tag,
				classes,
				id,
				wordSpacing
			});
		}
	});
	// Find elements that violate the text alignment rule
	const textJustifySelector = 'p, h1, h2, h3, h4, h5, h6, li, span';
	const textAligns = await page.$$eval(textJustifySelector, elements => elements.map(el => ({
		tag: el.tagName,
		classes: el.className,
		id: el.id,
		textAlign: window.getComputedStyle(el).getPropertyValue('text-align')
	})));
	textAligns.forEach(({
		tag,
		classes,
		id,
		textAlign
	}) => {
		if (textAlign === 'justify') {
			wrongElements.textAlign.push({
				tag,
				classes,
				id,
				textAlign
			});
		}
	});
	// Find paragraphs that violate the length rule
	const paragraphs = await page.$$eval('p', elements => elements.map(el => ({
		words: el.textContent.split(' ').length,
		characters: el.textContent.length,
		tag: el.tagName,
		classes: el.className,
		id: el.id
	})));
	const maxParagraphLength = 100;
	paragraphs.forEach(({
		words,
		characters,
		tag,
		classes,
		id
	}) => {
		if (words > maxParagraphLength) {
			wrongElements.paragraphLength.push({
				tag,
				classes,
				id,
				words,
				characters
			});
		}
	});
	// Find paragraphs that violate the uppercase rule
	const uppercaseParagraphs = await page.$$eval('p', elements => elements.map(el => ({
		text: el.textContent.trim(),
		tag: el.tagName,
		classes: el.className,
		id: el.id
	})));
	uppercaseParagraphs.forEach(({
		text,
		tag,
		classes,
		id
	}) => {
		if (text.length > 0 && text.toUpperCase() === text) {
			wrongElements.uppercaseParagraphs.push({
				tag,
				classes,
				id,
				text
			});
		}
	});
	// Find elements that violate the contrast ratio rule
	const contrastRatioSelector = '*, *::before, *::after';
	const contrastRatios = await page.$$eval(contrastRatioSelector, elements => elements.map(el => ({
		tag: el.tagName,
		classes: el.className,
		id: el.id,
		backgroundColor: window.getComputedStyle(el).getPropertyValue('background-color'),
		color: window.getComputedStyle(el).getPropertyValue('color')
	})).filter(({
		backgroundColor
	}) => {
		// Check if the background color has an alpha value of 1 (i.e. not transparent)
		const match = backgroundColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+),\s*(\d*\.?\d+)\)$/);
		return !match || match[4] === '1';
	}));
	contrastRatios.forEach(({
		tag,
		classes,
		id,
		backgroundColor,
		color
	}) => {
		const ratio = getContrast.ratio(backgroundColor, color);
		if (ratio < 4.5) {
			wrongElements.contrastRatio.push({
				tag,
				classes,
				id,
				backgroundColor,
				color,
				ratio
			});
		}
	});
	// Prints those objects in a clean JSON file (null, 2) and saves the JSON file in the folder “JSON”
	const errorsJson = JSON.stringify(wrongElements, null, 2);
	const jsonPath = path.join(__dirname, 'JSON', `${Date.now()}.json`);
	fs.writeFileSync(jsonPath, errorsJson);

	// Highlights the wrong elements on the page and takes a screenshot
	const screenshotPath = path.join(__dirname, 'screenshot', `${Date.now()}.png`);
	await page.evaluate((wrongElements) => {
		for (let rule in wrongElements) {
			for (let i = 0; i < wrongElements[rule].length; i++) {
				const element = wrongElements[rule][i];
				const elements = document.querySelectorAll(element.selector);
				console.log(rule);
				for (let i = 0; i < elements.length; i++) {
					elements[i].style.border = "2px solid orange";
				}
			}
		}
	}, wrongElements);

	await page.screenshot({ path: screenshotPath, fullPage: true });


	// CONSOLE LOGS
	console.log(`Screenshot saved to ${screenshotPath}`);
	console.log(wrongElements);
	await browser.close();
})();