// Thanks to kijanek6 for documenting the format https://gooroosgruntz.proboards.com/thread/2046/games-file-format-specifications

import { ColorMapRez } from 'client/rez/GruntPalette';
import { RezFile } from 'client/rez/RezFile';
import { componentToHex, getOrSet, rgbToHex } from 'client/utils/utils';

export interface ImageRez {
	canvas: HTMLCanvasElement;
	offsetX: number;
	offsetY: number;
}

export function getImageRez(
	rez: RezFile,
	path: string,
	palette?: ColorMapRez,
	color?: string,
): ImageRez | undefined {
	const node = rez.getNode(path);
	if (!node) {
		console.log('Missing image rez', path);
		return undefined;
	}
	rez.seek(node.offset);

	const flags = rez.readIntAt(4);
	const transparent = (flags & 1) == 1;
	const rle = (flags & 32) == 32;
	const ownPalette = (flags & 128) == 128;

	const width = rez.readIntAt(8);
	const height = rez.readIntAt(12);

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		return undefined;
	}

	const offsetX = rez.readIntAt(16);
	const offsetY = rez.readIntAt(20);

	const colors: string[] = [];
	const size = node.size;
	let n = 0;

	if (ownPalette) {
		// Read the palette

		for (let i = size - 768; i < size; i += 3) {
			const r = rez.readAt(i);
			const g = rez.readAt(i + 1);
			const b = rez.readAt(i + 2);
			if (r == 255 && g == 0 && b == 132) {
				colors.push('transparent');
			} else if (r == 252 && g == 2 && b == 132) {
				colors.push('transparent');
			} else {
				colors.push(rgbToHex(r, g, b));
			}
			n++;
		}
	} else if (color) {
		for (let i = 0; i < 256; i++) {
			colors.push(color + componentToHex(i));
		}
	}
	const black = '#000000';

	n = 32;
	let x = 0;
	let y = 0;

	const map = new Map<number, number>();

	// Read the pixels
	if (rle) {
		while (y < height) {
			let byte = rez.readAt(n);
			n++;
			if (byte > 128) {
				ctx.fillStyle = black;
				let i = byte - 128;
				while (i-- > 0 && y < height) {
					if (!transparent) {
						ctx.fillRect(x, y, 1, 1);
					}
					x++;
					if (x == width) {
						x = 0;
						y++;
					}
				}
			} else {
				let i = byte;
				while (i-- > 0 && y < height) {
					byte = rez.readAt(n);
					n++;
					let color = colors[byte];
					if (palette) {
						color = palette.colorMap.get(color) ?? color;
					}
					ctx.fillStyle = color;
					ctx.fillRect(x, y, 1, 1);
					const count = getOrSet(map, byte, () => 0);
					map.set(byte, count);
					x++;
					if (x == width) {
						x = 0;
						y++;
					}
				}
			}
		}
	} else {
		while (y < height) {
			let byte = rez.readAt(n);
			n++;
			let i;
			if (byte > 192) {
				i = byte - 192;
				byte = rez.readAt(n);
				n++;
			} else {
				i = 1;
			}
			while (i-- > 0 && y < height) {
				let color = colors[byte];
				if (palette) {
					color = palette.colorMap.get(color) ?? color;
				}
				ctx.fillStyle = color;
				ctx.fillRect(x, y, 1, 1);
				if (!ownPalette) {
					console.log(x, y, color);
				}
				x++;
				if (x == width) {
					x = 0;
					y++;
				}
			}
		}
	}
	return { canvas, offsetX, offsetY };
}
