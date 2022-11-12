import { Point } from 'client/utils/Point';
import { RezFile } from 'client/rez/RezFile';
import { ImageRez } from './getImageRez';

export interface TileSetRez {
	canvas: HTMLCanvasElement;
	points: Map<number, Point>;
}

export function getTileSetRez(
	rez: RezFile,
	path: string,
	getImage: (path: string) => ImageRez | undefined,
): TileSetRez | undefined {
	const canvas = document.createElement('canvas');
	canvas.width = 1024;
	canvas.height = 512;
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		return undefined;
	}

	const points = new Map<number, Point>();

	const children = rez.ls(path);
	children?.forEach((child, i) => {
		const id = parseInt(child.name.split('.')[0], 10);
		const x = (i % 32) * 32;
		const y = Math.floor(i / 32) * 32;
		points.set(id, { x, y });
		const image = getImage(`${path}/${child.name}`);
		if (image) {
			const tileCtx = image.canvas.getContext('2d');
			if (tileCtx) {
				ctx.putImageData(tileCtx.getImageData(0, 0, 32, 32), x, y);
			}
		}
	});

	return {
		canvas,
		points,
	};
}
