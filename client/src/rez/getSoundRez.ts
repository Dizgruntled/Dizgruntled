import { RezFile } from 'client/rez/RezFile';

export interface SoundRez {
	url: string;
}

export function getSoundRez(rez: RezFile, path: string): SoundRez | undefined {
	const wav = rez.getNode(path);
	if (!wav) {
		return undefined;
	}
	const array = rez.array.slice(wav.offset, wav.offset + wav.size);
	const audio = document.createElement('audio');
	const blob = new Blob([array.buffer], { type: 'audio/wav' });
	return {
		url: URL.createObjectURL(blob),
	};
}
