import { RezFile } from 'client/rez/RezFile';
import { rgbToHex } from 'client/utils/utils';

export interface PaletteRez {
	colors: string[];
}

export function getPaletteRez(rez: RezFile, path: string): PaletteRez | undefined {
	const node = rez.getNode(path);
	if (!node) {
		return;
	}
	rez.seek(node.offset);

	const colors: string[] = [];

	for (let i = 0; i < node.size; i += 3) {
		const r = rez.readAt(i);
		const g = rez.readAt(i + 1);
		const b = rez.readAt(i + 2);
		colors.push(rgbToHex(r, g, b));
	}

	return {
		colors,
	};
}
