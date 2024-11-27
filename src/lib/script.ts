import { parseEpub } from '@gxl/epub-parser';
import { JSDOM } from 'jsdom';

const epubObj = await parseEpub('./small-talk.epub', {
	type: 'path'
});

const { htmlString } = epubObj.sections![5]; // contain all the text

const dom = new JSDOM(htmlString);
const document = dom.window.document;

const paragraphs = document.querySelectorAll('p.txt_noind');
const dialogs = Array.from(paragraphs)
	.map((p) => {
		const personSpan = p.querySelector('span.pers');
		const person = personSpan?.textContent ? personSpan.textContent?.trim() : '';

		const pClone = p.cloneNode(true) as HTMLParagraphElement;
		const personSpanInClone = pClone.querySelector('span.pers');
		if (personSpanInClone) {
			personSpanInClone.remove();
		}

		const text = pClone.textContent?.trim();

		return { person, text };
	})
	.reduce(
		(result, dialog) => {
			if (dialog.person === '') {
				if (result[result.length - 1].text === undefined) {
					result[result.length - 1].text = dialog.text;
				} else {
					result[result.length - 1].text += dialog.text ?? '';
				}
				return result;
			}
			return [...result, dialog];
		},
		[] as { person: string; text?: string }[]
	);

const toActor = {
	JUSTINE: 'CAMILLE',
	TIMOTHÉE: 'JIMMY',
	NARRATEUR: 'JC SAMI SACHA',
	CHARLIE: 'JEREMIE',
	REINE: 'MARIE-FRANCOISE',
	GALINA: 'MARINE',
	GILLES: 'ETIENNE',
	KEVIN: 'ETIENNE',
	'L’EXPERTE': 'VALERIE',
	LUCILLE: 'VALERIE',
	SOLANGE: 'VALERIE',
	CHRISTIANE: 'VALERIE', // mime
	MARGUERITE: 'GHANIA',
	FRANÇOISE: 'GHANIA',
	STÉPHANIE: 'GHANIA',
	GHYSLAINE: 'EMMA',
	GINETTE: 'EMMA',
	BERNADETTE: 'EMMA',
	'AMÉLIE BEAUREGARD': 'RYM',
	DIANE: 'RYM',
	SYLVIE: 'RYM',
	LIETTE: 'RYM',
	ANITA: 'OLIVIA',
	RACHEL: 'OLIVIA',
	GEORGES: 'JC',
	MARCEL: 'JC',
	YVES: 'SACHA',
	'MARC-ANTOINE': 'SACHA',
	'JEAN-LOUIS': 'SAMI',
	ÉMILE: 'SAMI'
};

const charactersByWords = dialogs
	.map(({ person, text }) => {
		return { person, characters: text?.length, words: text?.split(/\s+/).length ?? 0 };
	})
	.reduce(
		(result, { person, words }) => {
			if (person === 'CHARLIE' || person === 'CHARLIE. Y') {
				person = 'CHARLIE.';
			}
			if (person.indexOf('.') !== -1) {
				person = person.slice(0, person.indexOf('.'));
			}
			if (person === 'CHORALE') {
				person = 'LA CHORALE';
			}
			person = toActor[person as keyof typeof toActor] || person;
			return {
				...result,
				[person]: result[person] ? result[person] + words : words
			};
		},
		{} as Record<string, number>
	);

const sorted = Object.entries(charactersByWords).toSorted((a, b) => b[1] - a[1]);

let total = 0;
for (const [, count] of sorted) {
	total += count;
}

console.log(
	sorted.map(([name, count]) => {
		return { name, count, percent: `${((count / total) * 100).toFixed(2)}%` };
	})
);
