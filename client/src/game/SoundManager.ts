import { Rect, TILE_SIZE } from 'client/utils/math';
import { Point } from 'client/utils/Point';
import { getOrSet } from 'client/utils/utils';
import { Level } from './Level';

const RADIUS = 16 * TILE_SIZE;

export interface SoundPoint {
	rect: Rect;
	volume: number;
	tag?: string;
}

export interface Sound {
	audio: HTMLAudioElement;
	path: string;
	points: SoundPoint[];
}

export class SoundManager {
	musicTimeout = -1;
	music = true;
	sound = true;
	pool = new Map<string, HTMLAudioElement[]>();
	sounds = new Map<string, Sound>();
	frameSounds = new Map<string, Sound>();

	constructor(readonly level: Level) {}

	setSound(sound: boolean) {
		this.sound = sound;
		this.sounds.forEach(sound => {
			sound.audio.volume = 0;
		});
	}
	setMusic(music: boolean) {
		this.music = music;
		if (music) {
			this.playMusic();
		} else {
			window.MIDIjs?.stop();
			clearTimeout(this.musicTimeout);
		}
	}
	playSound(path: string, rect: Rect, volume: number = 0.5, loopTag?: string) {
		const sound =
			(loopTag && this.sounds.get(path)) ||
			getOrSet(this.frameSounds, path, () => ({
				audio: this.getAudio(path),
				path,
				points: [],
			}));
		if (loopTag) {
			sound.audio.loop = true;
			const existingSound = sound.points.find(point => point.tag == loopTag);
			if (existingSound) {
				existingSound.rect = rect;
				existingSound.volume = volume;
				return;
			}
		}
		sound.points.push({
			rect,
			volume,
			tag: loopTag,
		});
	}
	clearSound(path: string, tag: string) {
		const sound = this.sounds.get(path);
		if (!sound) {
			return;
		}
		sound.points = sound.points.filter(point => point.tag != tag);
		if (sound.points.length == 0) {
			sound.audio.pause();
			sound.audio.currentTime = 0;
			this.pool.get(path)?.push(sound.audio);
			this.sounds.delete(path);
		}
	}
	getAudio(path: string) {
		const pool = getOrSet(this.pool, path, () => []);
		if (pool.length > 0) {
			return pool.pop()!;
		}
		const audio = document.createElement('audio');
		const sound = this.level.resources.getSound(path);
		if (sound) {
			audio.src = sound.url;
		}
		audio.addEventListener('ended', () => {
			this.sounds.delete(path);
			audio.currentTime = 0;
			pool.push(audio);
		});
		return audio;
	}
	getSoundRect(position: Point) {
		return {
			left: position.x - RADIUS,
			right: position.x + RADIUS,
			top: position.y - RADIUS,
			bottom: position.y + RADIUS,
		};
	}
	playMusic() {
		if (!this.music) {
			return;
		}
		const intro = `/assets/music/${this.level.map.intro}.MID`;
		const theme = `/assets/music/${this.level.map.music}.MID`;
		window.MIDIjs?.get_duration(intro, introDuration => {
			window.MIDIjs.get_duration(theme, themeDuration => {
				if (!this.level.alive) {
					return;
				}
				if (!this.music) {
					return;
				}
				window.MIDIjs.play(intro);
				const playTheme = () => {
					if (!this.level.alive) {
						return;
					}
					window.MIDIjs.play(theme);
					this.musicTimeout = setTimeout(playTheme, themeDuration * 1000 + 1000) as any;
				};
				this.musicTimeout = setTimeout(playTheme, introDuration * 1000 + 1000) as any;
			});
		});
	}
	flush(midpoint: Point) {
		this.frameSounds.forEach(sound => {
			this.sounds.set(sound.path, sound);
			sound.audio.volume = 0;
			sound.audio.play();
		});
		this.frameSounds.clear();
		if (this.sound) {
			this.sounds.forEach(sound => {
				let volume = 0;
				sound.points.forEach(point => {
					if (point.rect.right > point.rect.left && point.rect.bottom > point.rect.top) {
						const x =
							(midpoint.x - point.rect.left) / (point.rect.right - point.rect.left);
						const dx = Math.max(0, x > 0.5 ? 1 - x : x) * 2;
						const y =
							(midpoint.y - point.rect.top) / (point.rect.bottom - point.rect.top);
						const dy = Math.max(0, y > 0.5 ? 1 - y : y) * 2;
						const offset =
							Math.pow(Math.min(dx, dy), 0.5) +
							(point.volume > 1 ? point.volume - 1 : 0);
						volume = Math.max(volume, point.volume * offset);
					} else {
						volume = Math.max(volume, point.volume);
					}
				});
				sound.audio.volume = Math.min(1, volume) || 0;
			});
		}
	}
	stop() {
		window.MIDIjs?.stop();
		clearTimeout(this.musicTimeout);
		this.sounds.forEach(sound => {
			sound.audio.pause();
			sound.audio.srcObject = null;
		});
	}
}
