import { parseEpub } from '@gxl/epub-parser';
import { JSDOM } from 'jsdom';
import fs from 'fs';

const outputMode = 'text' as 'human' | 'csv' | 'text';
const groupByScene = false;
const toActors = true;

const actors = {
	Georges: 'SACHA',
	Décembre: 'JIMMY',
	Avril: 'MARINE',
	'L’antiquaire': 'MARIE-FRANCOISE',
	'L’horloger': 'JEAN-CLAUDE',
	Jean: 'JEREMIE',
	Lucien: 'JEREMIE',
	'Le vigile': 'JEREMIE',
	'L’escamoteur': 'ETIENNE',
	Louis: 'ETIENNE',
	'Von Kempelen': 'ETIENNE',
	Louise: 'EMMA',
	'Catherine II': 'EMMA',
	Lallement: 'EMMA',
	Mademoiselle: 'EMMA',
	William: 'GHANIA',
	Antonia: 'GHANIA',
	Suzanne: 'RYM',
	'Le patron': 'RYM',
	'La libraire': 'RYM',
	'La cliente': 'RYM',
	Gérard: 'SAMI',
	Worousky: 'SAMI',
	Marius: 'SAMI',
	Manuel: 'SAMI',
	Margot: 'CAMILLE',
	Jeanne: 'CAMILLE',
	Charles: 'CAMILLE',
	'Le peintre': 'CAMILLE',
	'Le monsieur': 'CAMILLE',
	Catherine: 'VALERIE',
	Madame: 'VALERIE',
	'La télé': 'OLIVIA',
	'Le transistor': 'OLIVIA',
	'La radio': 'OLIVIA',
	Didascalies: 'OLIVIA'
};

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

const dialogs: (
	| { type: 'dialog'; name: keyof typeof actors; actor?: string; text: string }
	| { type: 'scene'; name: string }
)[] = [];

let scene = 0;
for (const section of epubObj.sections.slice(3)) {
	const dom = new JSDOM(section.htmlString);
	const document = dom.window.document;
	const heading = document.querySelector('h1')?.textContent;
	if (heading) {
		scene = parseInt(heading, 10);
	}
	dialogs.push({ type: 'scene', name: heading! });
	let currentPerso: string | null = null;
	for (const paragraph of document.querySelectorAll('p')) {
		if (paragraph.className === 'personnage') {
			currentPerso = paragraph.querySelector('.smallcaps')!.textContent!;
			currentPerso = currentPerso.replace(',', '');
			if (currentPerso.indexOf('Gab') !== -1) {
				currentPerso = 'Madame';
			}
			if (currentPerso.indexOf('Madame') !== -1) {
				currentPerso = 'Madame';
			}
			if (currentPerso.startsWith('Avril')) {
				currentPerso = 'Avril';
			}
			if (currentPerso.indexOf('Jos') !== -1) {
				console.log(currentPerso, paragraph.innerHTML);
			}
			dialogs.push({ type: 'dialog', name: currentPerso as keyof typeof actors, text: '' });
			if (toActors) {
				if (actors[currentPerso] === undefined) {
					console.log(`${currentPerso} is not a valid character: ${paragraph.innerHTML}`);
					continue;
				}
				currentPerso = actors[currentPerso];
			}
			dialogs[dialogs.length - 1].actor = currentPerso;
			if (groupByScene) {
				currentPerso = `${scene}. ${currentPerso}`;
			}
			if (stats[currentPerso] === undefined) {
				stats[currentPerso] = { words: 0, letters: 0, percentLetters: 0, percentWords: 0 };
			}
			const dialog = paragraph.textContent;
			let trimmedDialog = dialog!.split('–')[1];
			if (trimmedDialog === undefined) {
				// L’ANTIQUAIRE, souriant ... Alors ? Vous la prenez ?
				trimmedDialog = 'Alors ? Vous la prenez ?';
			}
			dialogs[dialogs.length - 1].text = trimmedDialog.replaceAll('.', '. ').replaceAll('?', '? ');
			stats[currentPerso].letters += trimmedDialog!.length;
			stats[currentPerso].words += trimmedDialog.split(' ').length;
		}
		if (paragraph.className === 'texte' && currentPerso) {
			const dialog = paragraph.textContent!;
			stats[currentPerso].letters += dialog.length;
			stats[currentPerso].words += dialog.split(' ').length;
			dialogs[dialogs.length - 1].text += dialog.replaceAll('.', '. ').replaceAll('?', '? ');
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

const sortedStats = Object.entries(stats)
	.toSorted((a, b) => b[1].words - a[1].words)
	.toSorted((a, b) => parseInt(a[0]) - parseInt(b[0]));

if (outputMode === 'text') {
	fs.writeFileSync('./test.json', JSON.stringify(dialogs));
	process.exit(1);
}

if (outputMode === 'csv') {
	let header = 'Perso;words;words (in %);letters; letters (in%)';
	if (groupByScene) {
		header = 'Scene;' + header;
	}
	console.log(header);
}

for (const [perso, { words, percentWords, letters, percentLetters }] of sortedStats) {
	if (outputMode === 'csv') {
		const row = [
			words,
			`${(percentWords * 100).toFixed(2)}%`,
			letters,
			`${(percentLetters * 100).toFixed(2)}%`
		];
		if (groupByScene) {
			const [scene, name] = perso.split('. ');
			row.unshift(scene, name);
		} else {
			row.unshift(perso);
		}
		console.log(row.join(';'));
	} else {
		console.log(
			`${perso} a ${words} mots (${(percentWords * 100).toFixed(2)}%) et ${letters} lettres (${(percentLetters * 100).toFixed(2)}%)`
		);
	}
}

if (outputMode === 'human') {
	console.log('');
	console.log('Nombre de personnages : ', sortedStats.length);
	console.log('Nombre de mots : ', totalWords);
	console.log('Nombre de lettres : ', totalLetters);
}
