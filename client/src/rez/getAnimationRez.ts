import { ColorMapRez } from 'client/rez/GruntPalette';
import { RezFile } from 'client/rez/RezFile';
import { ImageRez } from './getImageRez';

export type GetImage = (
	path: string,
	palette?: ColorMapRez,
	color?: string,
) => ImageRez | undefined;

export interface AnimationRez {
	images: (ImageRez | undefined)[];
	durations: number[];
}

export function getAnimationRez(
	rez: RezFile,
	getImage: GetImage,
	imagesPath: string,
	animationPath?: string,
	palette?: ColorMapRez,
	color?: string,
): AnimationRez | undefined {
	const images: (ImageRez | undefined)[] = [];
	const durations: number[] = [];

	if (animationPath) {
		const node = rez.getNode(animationPath);
		if (!node) {
			return undefined;
		}
		rez.seek(node.offset);
		const frameCount = rez.readIntAt(12);
		let n = rez.readIntAt(16) + 32;
		for (let i = 0; i < frameCount; i++) {
			const index = rez
				.readHalfAt(n + 8)
				.toString()
				.padStart(3, '0');
			const image = getImage(`${imagesPath}/FRAME${index}`, palette, color);
			rez.seek(node.offset);
			const duration = rez.readHalfAt(n + 10);
			if (image) {
				images.push(image);
				durations.push(duration);
			} else {
				images.push(undefined);
				durations.push(duration);
			}
			// Check for effect
			let j = 0;
			if ((rez.readAt(n) & 2) == 2) {
				let b = 1;
				while (b) {
					b = rez.readAt(n + 20 + j);
					j++;
					if (b == 0) {
						break;
					}
				}
			}
			n += 20 + j;
		}
		if (images.length == 0) {
			return undefined;
		}
		return {
			images,
			durations,
		};
	} else {
		const frames = rez.ls(imagesPath);
		if (!frames) {
			console.warn('Missing animation path', imagesPath);
			return {
				images: [],
				durations: [],
			};
		}
		frames.forEach(frame => {
			const image = getImage(`${imagesPath}/${frame.name}`, palette, color);
			if (image) {
				images.push(image);
				durations.push(100);
			} else {
				console.log('Missing animation image', imagesPath, frame.name);
			}
		});
		if (images.length == 0) {
			return undefined;
		}
		return {
			images,
			durations,
		};
	}
}
