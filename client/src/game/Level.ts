import {
	pointToStr,
	ORIGIN,
	TILE_SIZE,
	positionToCoord,
	coordToPosition,
	pointAdd,
	pointSub,
} from 'client/utils/math';
import { Point } from 'client/utils/Point';
import { NO_ID, Registry } from 'client/logic/Registry';
import { getLogicControllers, LogicControllers } from 'client/logic/getLogicControllers';
import { createTexture, getFormatAndTypeForInternalFormat } from 'twgl.js';
import { getBoxDrawer } from '../draw/BoxDrawer';
import { getLogicViews } from '../draw/getLogicViews';
import { getSpriteDrawer } from '../draw/SpriteDrawer';
import { getTileDrawer } from '../draw/TileDrawer';
import { Resources } from '../rez/Resources';
import { TileSetRez } from '../rez/getTileSetRez';
import { Grunt, Team } from 'client/logic/Logic';
import { LogicView } from '../draw/LogicView';
import { SpriteBank } from '../draw/SpriteBank';
import { SideBar } from '../draw/SideBar';
import { InputController } from './InputController';
import { shuffle } from 'client/utils/utils';
import { GruntView } from '../views/GruntView';
import { ENTRY_VOICES } from 'client/data/GruntVoices';
import { CommandController } from './CommandController';
import { GameHooks } from './GameHooks';
import { SavedMap } from './SavedMap';
import { SoundManager } from './SoundManager';

const SCREEN_CENTER = {
	x: 512,
	y: 384,
};

export class Level {
	registry: Registry;
	input: InputController;
	command: CommandController;
	area: string;
	backTileSet?: TileSetRez;
	tileSet?: TileSetRez;
	backMapTexture?: WebGLTexture;
	mapTexture: WebGLTexture;
	tileArray?: Uint8Array;
	spriteBank: SpriteBank;
	sideBar: SideBar;

	resumeTime: number = 0;
	pauseTime?: number;
	scrollOffset: Point;
	sortDirty = false;

	controllers: LogicControllers;
	views: { [kind: string]: LogicView<any> };
	sounds = new SoundManager(this);
	alive = true;

	constructor(
		readonly resources: Resources,
		readonly map: SavedMap,
		readonly hooks: GameHooks,
		readonly teamIndex: number,
	) {
		const seed: number[] = [];
		for (let i = 0; i < 1000; i++) {
			seed.push(i);
		}
		shuffle(seed);

		this.scrollOffset = { x: 0, y: 0 };
		const controllers = {} as { [name: string]: any };
		this.registry = new Registry(this.map, seed, controllers);
		this.input = new InputController(this);
		this.command = new CommandController(this);
		this.area = map.area;
		this.tileSet = resources.getTileSet(`${map.area}/TILEZ/ACTION`);
		this.backTileSet = map.back ? resources.getTileSet(`${this.area}/TILEZ/BACK`) : undefined;
		this.spriteBank = new SpriteBank(resources, this.registry);

		this.controllers = getLogicControllers(this.registry);
		this.views = getLogicViews(this);
		Object.assign(controllers, this.controllers);

		this.sideBar = new SideBar(this, { x: 1104, y: 240 });

		const offset = pointSub(map.start, SCREEN_CENTER);
		this.setScroll(offset.x, offset.y);

		const gl = this.resources.gl;
		if (map.back) {
			const backArray = this.getTileArray(
				map.back.width,
				map.back.height,
				new Uint32Array(map.back.tiles),
				this.backTileSet,
			);
			this.backMapTexture = createTexture(gl, {
				src: backArray,
				width: map.back.width,
				height: map.back.height,
				minMag: gl.NEAREST,
			});
		}
		this.tileArray = this.getTileArray(
			map.width,
			map.height,
			this.registry.tiles,
			this.tileSet,
		);
		this.mapTexture = createTexture(gl, {
			src: this.tileArray,
			width: map.width,
			height: map.height,
			minMag: gl.NEAREST,
		});
	}

	getTileArray(width: number, height: number, tiles: Uint32Array, tileSet?: TileSetRez) {
		const tileArray = new Uint8Array(width * height * 4);
		let n = 0;
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const tile = tiles[x + y * width];
				const point = tileSet?.points.get(tile) || { x: 992, y: 480 };
				tileArray[n] = point.x / TILE_SIZE;
				tileArray[n + 1] = point.y / TILE_SIZE;
				tileArray[n + 3] = 0;
				n += 4;
			}
		}
		return tileArray;
	}
	getTeam() {
		return this.registry.teams.get(this.teamIndex)!;
	}
	start() {
		if (!this.tileSet) {
			console.warn('No tiles for level');
			return;
		}
		this.sideBar.update();

		const gl = this.resources.gl;
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		const backTileDrawer =
			this.map.back && this.backMapTexture && this.backTileSet
				? getTileDrawer(
						this.resources,
						this.backTileSet,
						this.backMapTexture,
						this.map.back.width,
						this.map.back.height,
				  )
				: undefined;
		const tileDrawer = getTileDrawer(
			this.resources,
			this.tileSet,
			this.mapTexture,
			this.map.width,
			this.map.height,
		);
		const spriteDrawer = getSpriteDrawer(gl);
		const boxDrawer = getBoxDrawer(gl);

		let lastTime = -1;

		const step = () => {
			const time = Math.floor(performance.now()) - this.resumeTime;
			const delta = time - lastTime;

			if (this.pauseTime == undefined) {
				if (lastTime > -1 && delta > 5000) {
					// It's been too long since we last simulated a frame, pause the game and resume from the last time
					this.pauseTime = lastTime;
					this.hooks.setHelpText('Game Paused');
				}
				this.checkInput(lastTime);
			}

			if (this.pauseTime == undefined) {
				gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
				gl.clearColor(0, 0, 0, 1);
				gl.clear(gl.COLOR_BUFFER_BIT);

				const { x, y } = this.input.getScroll();
				this.setScroll(x * delta * 0.5, y * delta * 0.5);
				this.update(lastTime, time);
				this.registry.time = time;
				if (backTileDrawer) {
					backTileDrawer(this.registry.time, {
						x: this.scrollOffset.x / 5 + this.registry.time / 50,
						y: this.scrollOffset.y / 5,
					});
				}
				tileDrawer(this.registry.time, this.scrollOffset);

				spriteDrawer(this.registry.time, this.scrollOffset, this.spriteBank.list());
				if (this.input.dragBox) {
					boxDrawer(this.input.dragBox, this.scrollOffset);
				}
				this.sounds.flush(pointAdd(this.scrollOffset, SCREEN_CENTER));

				lastTime = time;
			}
			if (this.alive) {
				requestAnimationFrame(step);
			}
		};
		requestAnimationFrame(step);
	}
	speakEntrance() {
		const grunts = [...this.registry.logics.values()].filter(
			logic => logic.kind == 'Grunt' && (logic as Grunt).team == this.teamIndex,
		) as Grunt[];
		if (grunts.length > 0) {
			const index = Math.floor(Math.random() * grunts.length);
			(this.views.Grunt as GruntView).speak(grunts[index], 'VOICES/ENTRANCEZ/', ENTRY_VOICES);
		}
	}
	pause(hideText = false) {
		this.pauseTime = this.registry.time;
		this.hooks.setHelpText(hideText ? ' ' : 'Game Paused');
	}
	resume() {
		const now = Math.floor(performance.now());
		this.resumeTime = now - this.pauseTime!;
		this.pauseTime = undefined;
	}
	checkInput(lastTime: number) {
		const keys = this.input.getKeys(lastTime + this.resumeTime);

		if (keys.includes('KeyY')) {
			this.input.toggleToy();
		}
		if (keys.includes('KeyP')) {
			this.pause();
		}
		if (this.pauseTime != undefined) {
			return;
		}
		if (keys.includes('KeyZ')) {
			const tile = positionToCoord(pointAdd(this.input.cursor, this.scrollOffset));
			const prevGrunt = this.registry.gruntTargets.get(tile);
			if (prevGrunt) {
				this.controllers.GruntDeath.squash(prevGrunt);
			}
			const grunt = {
				id: NO_ID,
				kind: 'Grunt',
				facing: 'SOUTH',
				color: 'ORANGE',
				health: 20,
				stamina: 20,
				rate: 600,
				coord: tile,
				position: coordToPosition(tile),
				team: this.teamIndex,
				actionTime: this.registry.time,
				action: {
					kind: 'Enter',
					drop: true,
				},
			} as const;
			this.registry.addLogic<Grunt>(grunt);
		} else if (keys.includes('KeyX')) {
			const tile = positionToCoord(pointAdd(this.input.cursor, this.scrollOffset));
			const grunt = this.registry.gruntTargets.get(tile);
			if (grunt) {
				this.controllers.GruntDeath.squash(grunt);
			}
		} else if (keys.includes('KeyC')) {
			const tile = positionToCoord(pointAdd(this.input.cursor, this.scrollOffset));
			const grunt = this.registry.gruntTargets.get(tile);
			if (grunt) {
				const tools = ['GAUNTLETZ', 'SHOVEL', 'TOOB', 'TIMEBOMB', 'WINGZ', 'NERFGUN'];
				const index = tools.indexOf(grunt.tool ?? '');
				this.controllers.Pickup.pickup(
					{
						id: NO_ID,
						kind: 'Pickup',
						item: tools[(index + 1) % tools.length],
						coord: ORIGIN,
						position: ORIGIN,
					},
					grunt,
				);
			}
		}
	}
	update(lastTime: number, nextTime: number) {
		let frame = this.registry.findFirstTaskFrameAfter(lastTime);
		while (frame && frame.time <= nextTime) {
			this.registry.time = frame.time;
			for (let i = 0; i < frame.tasks.length; i++) {
				const task = frame.tasks[i];
				if (task.cancelTime == undefined) {
					const task = frame.tasks[i];
					const logic = this.registry.getLogic(task.parent);
					const controller =
						task.controller == 'SpriteBank'
							? this.spriteBank
							: this.controllers[task.controller];
					controller[task.method](logic, ...task.args);
				}
			}
			frame = frame.next;
		}
		this.processChanges();
	}
	processChanges(restore = false) {
		for (let i = 0; i < this.registry.additions.length; i++) {
			const id = this.registry.additions[i];
			const logic = this.registry.getLogic(id);
			if (logic) {
				const controller = this.controllers[logic.kind];
				if (restore) {
					controller?.restore(logic);
				} else {
					controller?.init(logic);
				}
				const view = this.views[logic.kind];
				view?.init(logic);
			}
		}
		this.registry.changed.forEach(id => {
			const logic = this.registry.getLogic(id);
			if (logic) {
				const view = this.views[logic.kind];
				if (view) {
					view.update?.(logic);
				}
			}
		});
		if (this.registry.changedTiles.size > 0) {
			this.changeTiles();
		}
		this.processEffects();
		this.registry.removals.forEach(logic => {
			const view = this.views[logic.kind];
			if (view) {
				view.destroy?.(logic);
			}
			this.spriteBank.clearLogic(logic);
		});
		this.registry.flush();
	}
	processEffects() {
		while (this.registry.effects.length) {
			const effects = [...this.registry.effects];
			this.registry.effects.length = 0;
			effects.forEach(effect => {
				switch (effect.kind) {
					case 'Animate':
						const animation = {
							tag: `effect-${effect.animation}-${pointToStr(effect.position)}`,
							animation: effect.animation.replace('{area}', this.area),
							images: effect.images.replace('{area}', this.area),
							position: effect.position,
							color: effect.color,
							cleanup: true,
							time: this.registry.time,
						};
						this.spriteBank.add(undefined, animation);
						if (effect.sound) {
							this.sounds.playSound(
								effect.sound.replace('{area}', this.area),
								this.sounds.getSoundRect(effect.position),
								effect.volume,
							);
						}
						break;
					case 'Save':
						this.hooks.save({
							description: this.input.buildSaveDescription(),
							path: this.map.path,
							name: this.map.name,
							time: Date.now(),
						});
						break;
					case 'Help':
						this.pauseTime = this.registry.time;
						this.hooks.setHelpText(effect.text);
						break;
					case 'Scroll':
						console.log('WHAT', effect.position.x, effect.position.y);
						this.setScroll(
							effect.position.x - SCREEN_CENTER.x - this.scrollOffset.x,
							effect.position.y - SCREEN_CENTER.y - this.scrollOffset.y,
						);
						break;
					case 'Sound':
						this.sounds.playSound(
							effect.sound.replace('{area}', this.area),
							this.sounds.getSoundRect(effect.position),
							effect.volume,
							effect.loopTag,
						);
						break;
					case 'ClearSound':
						this.sounds.clearSound(
							effect.sound.replace('{area}', this.area),
							effect.tag,
						);
						break;
					case 'Win':
						this.sounds.stop();
						this.pause(true);
						this.hooks.showStats({
							...this.getTeam().stats,
							time: this.registry.time,
						});
						break;
					case 'Speak':
						const grunt = this.registry.getLogic<Grunt>(effect.gruntId, 'Grunt');
						if (grunt) {
							const view = this.views.Grunt as GruntView;
							view.speak(grunt, effect.sound, effect.variants);
						}
						break;
				}
			});
		}
	}
	changeTiles() {
		this.tileArray = this.getTileArray(
			this.map.width,
			this.map.height,
			this.registry.tiles,
			this.tileSet,
		);
		const gl = this.resources.gl;
		const formatType = getFormatAndTypeForInternalFormat(gl.RGBA);
		gl.bindTexture(gl.TEXTURE_2D, this.mapTexture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			this.map.width,
			this.map.height,
			0,
			formatType.format,
			formatType.type,
			this.tileArray!,
		);
	}
	setScroll(x: number, y: number) {
		const gl = this.resources.gl;
		const scrollOffset = this.scrollOffset;
		scrollOffset.x = Math.floor(
			Math.max(
				0,
				Math.min(
					this.map.width * TILE_SIZE - gl.canvas.width + 160,
					scrollOffset.x + Math.floor(x),
				),
			),
		);
		scrollOffset.y = Math.floor(
			Math.max(
				0,
				Math.min(
					this.map.height * TILE_SIZE - gl.canvas.height,
					scrollOffset.y + Math.floor(y),
				),
			),
		);
	}
	stop() {
		this.alive = false;
		this.sounds.stop();
	}
}
