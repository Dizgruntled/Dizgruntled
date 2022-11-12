import { ColorMapRez } from 'client/rez/GruntPalette';
import { getWorldRez, WorldRez } from 'client/rez/getWorldRez';
import { RezFile } from 'client/rez/RezFile';
import { getOrSet } from 'client/utils/utils';
import { AnimationRez, getAnimationRez } from './getAnimationRez';
import { getImageRez, ImageRez } from './getImageRez';
import { getPaletteRez, PaletteRez } from './getPaletteRez';
import { getTileSetRez, TileSetRez } from './getTileSetRez';
import { createTexture } from 'twgl.js';
import { getSoundRez, SoundRez } from './getSoundRez';

export class Resources {
	animations: Map<string, AnimationRez> = new Map();
	images: Map<string, ImageRez> = new Map();
	tileSets: Map<string, TileSetRez> = new Map();
	worlds: Map<string, WorldRez> = new Map();
	palettes: Map<string, PaletteRez> = new Map();
	colorMaps: Map<string, ColorMapRez> = new Map();
	sounds: Map<string, SoundRez> = new Map();
	textures: Map<HTMLCanvasElement, WebGLTexture> = new Map();

	constructor(
		readonly gl: WebGL2RenderingContext,
		readonly rez: RezFile,
		readonly vrz: RezFile,
	) {}

	getAnimation = (
		imagesPath: string,
		animationPath?: string,
		palette?: ColorMapRez,
		color?: string,
	): AnimationRez | undefined => {
		const palettePath = palette ? `#${palette.name}` : color ? `${color}` : '';
		const fullPath = `${animationPath ?? ''}:${imagesPath}${palettePath}`;

		return getOrSet(this.animations, fullPath, () => {
			return getAnimationRez(
				this.rez,
				this.getImage,
				imagesPath,
				animationPath ? animationPath + '.ANI' : '',
				palette,
				color,
			);
		});
	};

	getColorMapRez = (color: string) => {
		return getOrSet(this.colorMaps, color, () => {
			const green = this.getPalette('GRUNTZ/PALETTEZ/GREENTOOL');
			const current = this.getPalette(`GRUNTZ/PALETTEZ/${color}TOOL`);

			if (!green || !current) {
				return undefined;
			}

			const colorMap = new Map<string, string>();
			green.colors.forEach((color, i) => {
				colorMap.set(color, current.colors[i]);
			});
			return {
				name: color,
				colorMap,
				colors: current.colors,
			};
		});
	};

	getImage = (path: string, palette?: ColorMapRez, color?: string): ImageRez | undefined => {
		const pathWithPalette = palette
			? `${path}#${palette.name}`
			: color
			? `${path}${color}`
			: path;

		return getOrSet(this.images, pathWithPalette, () => {
			return getImageRez(
				this.rez,
				path.endsWith('.PID') ? path : path + '.PID',
				palette,
				color,
			);
		});
	};

	getPalette = (path: string): PaletteRez | undefined => {
		return getOrSet(this.palettes, path, () => {
			return getPaletteRez(this.rez, path + '.PAL');
		});
	};

	getSound = (path: string): SoundRez | undefined => {
		return getOrSet(this.sounds, path, () => {
			const isVoice = path.startsWith('VOICES/');
			const rez = isVoice ? this.vrz : this.rez;
			return getSoundRez(rez, path + '.WAV');
		});
	};

	getTexture = (canvas: HTMLCanvasElement) => {
		return getOrSet(this.textures, canvas, () =>
			createTexture(this.gl, {
				src: canvas,
				minMag: this.gl.NEAREST,
			}),
		);
	};

	getTileSet = (path: string): TileSetRez | undefined => {
		return getOrSet(this.tileSets, path, () => {
			return getTileSetRez(this.rez, path, this.getImage);
		});
	};

	getWorld = (path: string): WorldRez | undefined => {
		return getOrSet(this.worlds, path, () => {
			return getWorldRez(this.rez, path + '.WWD');
		});
	};

	destroy() {
		this.textures.forEach(texture => this.gl.deleteTexture(texture));

		this.animations.clear();
		this.images.clear();
		this.tileSets.clear();
		this.worlds.clear();
		this.palettes.clear();
		this.colorMaps.clear();
		this.textures.clear();
	}
}
