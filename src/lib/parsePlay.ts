import { parseEpub } from '@gxl/epub-parser';
import smallTalk from '$lib/small-talk.epub?raw';
// import { JSDOM } from 'jsdom';

export const parsePlay = async () => {
	const epubObj = await parseEpub(smallTalk, { type: 'buffer' });
	const { htmlString } = epubObj.sections![5]; // contain all the text
	return htmlString;
};
