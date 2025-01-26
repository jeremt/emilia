// import { parsePlay } from '$lib/parsePlay';
import dialogs from '$lib/test.json';

export const load = async () => {
	const characters = new Set<string>();
	for (const dialog of dialogs) {
		if (dialog.type === 'dialog') {
			characters.add(dialog.name);
		}
	}
	return {
		dialogs,
		characters
	};
};
