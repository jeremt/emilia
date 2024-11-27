import { parseEpub } from '@gxl/epub-parser';
import { JSDOM } from 'jsdom';

const epubObj = await parseEpub('./le-cercle-des-illusionnistes.epub', {
	type: 'path'
});

if (epubObj.sections === undefined) {
	throw new Error('No section');
}

const stats: Record<
	string,
	{ words: number; letters: number; percentLetters: number; percentWords: number }
> = {};

for (const section of epubObj.sections) {
	const dom = new JSDOM(section.htmlString);
	const document = dom.window.document;
	let currentPerso: string | null = null;
	for (const paragraph of document.querySelectorAll('p')) {
		if (paragraph.className === 'personnage') {
			currentPerso = paragraph.querySelector('.smallcaps')!.textContent!;
			currentPerso = currentPerso.replace(',', '');
			if (currentPerso.startsWith('Avril')) {
				currentPerso = 'Avril';
			}
			if (stats[currentPerso] === undefined) {
				stats[currentPerso] = { words: 0, letters: 0, percentLetters: 0, percentWords: 0 };
			}
			const dialog = paragraph.textContent;
			let trimmedDialog = dialog!.split('–')[1];
			if (trimmedDialog === undefined) {
				// L’ANTIQUAIRE, souriant ... Alors ? Vous la prenez ?
				if (dialog?.startsWith(currentPerso)) {
					trimmedDialog = dialog.slice(currentPerso.length);
				}
			}
			stats[currentPerso].letters += trimmedDialog!.length;
			stats[currentPerso].words += trimmedDialog.split(' ').length;
		}
		if (paragraph.className === 'texte' && currentPerso) {
			const dialog = paragraph.textContent!;
			stats[currentPerso].letters += dialog.length;
			stats[currentPerso].words += dialog.split(' ').length;
		}
	}
}

let totalLetters = 0;
let totalWords = 0;
for (const [, { words, letters }] of Object.entries(stats)) {
	totalLetters += letters;
	totalWords += words;
}

for (const perso of Object.keys(stats)) {
	stats[perso].percentLetters = stats[perso].letters / totalLetters;
	stats[perso].percentWords = stats[perso].words / totalWords;
}

const sortedStats = Object.entries(stats).toSorted((a, b) => b[1].words - a[1].words);
for (const [perso, { words, percentWords, letters, percentLetters }] of sortedStats) {
	console.log(
		`${perso} a ${words} mots (${(percentWords * 100).toFixed(2)}%) et ${letters} lettres (${(percentLetters * 100).toFixed(2)}%)`
	);
}

console.log('');
console.log('Nombre de personnages : ', sortedStats.length);
console.log('Nombre de mots : ', totalWords);
console.log('Nombre de lettres : ', totalLetters);
