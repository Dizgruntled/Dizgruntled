import { RezFile } from 'client/rez/RezFile';
import { Resources } from '../rez/Resources';
import { Level } from './Level';
import { getWorldRez, WorldRez } from 'client/rez/getWorldRez';
import { GameHooks, SaveMetadata } from './GameHooks';
import { SavedLevel, saveLevel } from './saveLevel';
import { getDb, StoredGame } from './FileLoader';
import Pako from 'pako';
import { buildLogic } from 'client/logic/buildLogic';
import { BaseLogic, Team } from 'client/logic/Logic';
import { NO_ID } from 'client/logic/Registry';
import { ORIGIN } from 'client/utils/math';
import { loadLevel, loadSavedLevel } from './loadLevel';
import { SavedMap } from './SavedMap';

export class Game {
	resources?: Resources;
	level?: Level | undefined;
	rezProgress = 0;
	vrzProgress = 0;
	music = localStorage.getItem('music') != 'n';
	sound = localStorage.getItem('sound') != 'n';

	constructor(
		readonly canvas: HTMLCanvasElement,
		rez: RezFile,
		vrz: RezFile,
		readonly hooks: GameHooks,
	) {
		const gl = canvas.getContext('webgl2');
		if (!gl) {
			throw new Error('WebGL2 not supported');
		}
		this.resources = new Resources(gl, rez, vrz);

		const getPoint = (x: number, y: number) => {
			const rect = this.canvas.getBoundingClientRect();
			const zoom = rect.width / this.canvas.width;
			return {
				x: (x - rect.left) / zoom,
				y: (y - rect.top) / zoom,
			};
		};
		document.addEventListener('keydown', (e: KeyboardEvent) => {
			this.level?.input.onKeyDown(e.code);
		});
		document.addEventListener('keyup', (e: KeyboardEvent) => {
			this.level?.input.onKeyUp(e.code);
		});

		this.canvas.addEventListener('mousedown', e => {
			e.preventDefault();
			if (this.level) {
				const point = getPoint(e.clientX, e.clientY);
				if (e.button == 1) {
					this.level.input.startScroll(point);
				} else {
					this.level.input.startDrag(point);
				}
			}
		});
		this.canvas.addEventListener('mousemove', e => {
			if (this.level) {
				const point = getPoint(e.clientX, e.clientY);
				if (e.button == 1) {
					this.level.input.updateScroll(point);
				} else {
					this.level.input.updateDrag(point);
				}
			}
		});
		this.canvas.addEventListener('mouseup', e => {
			e.preventDefault();
			if (this.level) {
				if (e.button == 1) {
					this.level.input.endScroll();
				} else {
					this.level.input.endDrag(e.shiftKey, e.button == 0);
				}
			}
		});
		this.canvas.addEventListener('touchstart', e => {
			e.preventDefault();
			if (this.level) {
				const touch = e.touches[0];
				const point = getPoint(touch.clientX, touch.clientY);
				if (e.touches.length == 2) {
					this.level.input.startScroll(point);
				} else {
					this.level.input.startDrag(point);
				}
			}
		});
		this.canvas.addEventListener('touchmove', e => {
			e.preventDefault();
			if (this.level) {
				const touch = e.touches[0];
				const point = getPoint(touch.clientX, touch.clientY);
				if (e.touches.length == 2) {
					this.level.input.updateScroll(point);
				} else {
					this.level.input.updateDrag(point);
				}
			}
		});
		this.canvas.addEventListener('touchend', e => {
			e.preventDefault();
			if (this.level) {
				if (e.touches.length == 1) {
					this.level.input.endScroll();
				} else {
					this.level.input.endDrag();
				}
			}
		});
		this.canvas.addEventListener('wheel', e => {
			e.preventDefault();
			if (this.level) {
				this.level.scrollOffset.x += e.deltaX;
				this.level.scrollOffset.y += e.deltaY;
			}
		});

		window.addEventListener('beforeunload', () => {
			if (!this.level) {
				return;
			}
			this.save(
				{
					description: 'Autosave',
					path: this.level.map.path,
					name: this.level.map.name,
					time: Date.now(),
				},
				true,
			);
		});
	}
	loadLevel(name: string, worldPath: string) {
		if (!this.resources) {
			return;
		}
		const world = this.resources.getWorld(worldPath);
		if (world) {
			this.loadWorldRez(name, worldPath, world);
		} else {
			this.level = undefined;
			console.warn('Missing world', worldPath);
		}
	}
	loadCustomLevel(name: string, path: string, buffer: ArrayBuffer) {
		const worldRez = this.getCustomWorldRez(buffer);
		if (worldRez) {
			this.loadWorldRez(name, path, worldRez);
		}
	}
	getCustomWorldRez(buffer: ArrayBuffer) {
		const rez = new RezFile(buffer);
		rez.nodes.set('custom', {
			offset: 0,
			size: buffer.byteLength,
			name: 'custom',
			isFolder: false,
		});
		return getWorldRez(rez, 'custom');
	}
	loadWorldRez(name: string, path: string, world: WorldRez, savedLevel?: SavedLevel) {
		if (this.level) {
			this.level.stop();
		}
		const team = this.getTeam();
		const map = this.getMap(name, path, world, team);
		this.loadMap(map, team, savedLevel);
	}
	loadMap(map: SavedMap, team: Team, savedLevel?: SavedLevel) {
		if (!this.resources) {
			return;
		}
		const level = new Level(this.resources, map, this.hooks, team.index);
		level.sounds.setSound(this.sound);
		level.sounds.setMusic(this.music);
		map.logics.forEach(logic => {
			const id = level.registry.addLogic({ ...logic });
			logic.id = id;
		});
		if (savedLevel) {
			loadLevel(level, savedLevel);
			level.changeTiles();
		}
		level.processChanges(savedLevel != undefined);
		level.resumeTime = Math.floor(performance.now()) - (savedLevel ? savedLevel.time : 0);
		if (!savedLevel) {
			const team = level.getTeam();
			level.controllers.Team.calculateOffset(team);
			level.speakEntrance();
		}
		level.start();
		this.level = level;
	}
	getTeam(teamIndex = 0): Team {
		return {
			id: NO_ID,
			kind: 'Team' as const,
			index: teamIndex,
			position: ORIGIN,
			coord: ORIGIN,
			color: 'ORANGE',
			gooCount: 0,
			ovens: [false, false, false, false],
			megaphoneItems: [],
			megaphoneOffset: 1,
			slots: [],
			warpstoneCount: 0,
			stats: {
				time: 0,
				survivorz: 0,
				deathz: 0,
				toolz: 0,
				totalToolz: 0,
				toyz: 0,
				totalToyz: 0,
				powerupz: 0,
				totalPowerupz: 0,
				coinz: 0,
				totalCoinz: 0,
				secretz: 0,
				totalSecretz: 0,
				letterz: '',
			},
		};
	}
	getMap(name: string, path: string, world: WorldRez, team: Team) {
		const area = `AREA` + world.area;
		const logics = [team] as BaseLogic[];
		world.logics.forEach(logicRez => {
			const logic = buildLogic(logicRez);
			if (logic) {
				logics.push(logic);
			}
		});
		const stageMatch = path.match(/([0-9]+)$/);
		const stage = stageMatch ? ((parseInt(stageMatch[1], 10) - 1) % 4) + 1 : 1;
		const intro = `A${world.area}_I${world.id % 2 ? '1' : '0'}`;
		const music = `A${world.area}_A${world.id % 2 ? '1' : '0'}`;
		return {
			name,
			path,
			area,
			logics,
			back: world.back
				? {
						...world.back,
						tiles: [...world.back.tiles],
				  }
				: undefined,
			tiles: [...world.tiles],
			intro,
			music,
			stage,
			width: world.width,
			height: world.height,
			start: world.start,
		};
	}
	resume() {
		this.level?.resume();
	}
	save(metadata: SaveMetadata, overwrite = false) {
		const db = getDb();
		if (!this.level || !db) {
			return;
		}
		if (this.level.getTeam().won) {
			return;
		}
		const save = saveLevel(this.level, this.level.registry.time);
		const json = JSON.stringify(save);
		const buffer = Pako.deflate(json).buffer;
		const blob = new Blob([buffer]);
		const tx = db.transaction(['savez'], 'readwrite');
		const savezStore = tx.objectStore('savez');
		const savezRequest = savezStore.getAll();
		savezRequest.onsuccess = () => {
			const autosave =
				metadata.description == 'Autosave' &&
				savezRequest.result.find((save: StoredGame) => save.description == 'Autosave');
			const tx2 = db.transaction(['savez'], 'readwrite');
			const store = tx2.objectStore('savez');
			const update = { ...metadata, save: blob } as StoredGame;
			if (autosave) {
				update.id = autosave.id;
			}
			const saveRequest = store.put(update);
			saveRequest.onerror = e => {
				console.warn('Save failed', e);
			};
		};
	}
	load(row: StoredGame) {
		if (!this.resources) {
			return;
		}
		this.level?.stop();
		const loadSave = async (world: WorldRez) => {
			const savedLevel = await loadSavedLevel(row);
			const team = this.getTeam(0);
			const map = this.getMap(row.name, row.path, world, team);
			this.loadMap(map, team, savedLevel);
		};
		if (row.path.startsWith('CUSTOM/')) {
			const id = parseInt(row.path.substring('CUSTOM/'.length), 10);
			const db = getDb();
			if (!db) {
				return;
			}
			const tx = db.transaction('mapz', 'readonly');
			const store = tx.objectStore('mapz');
			const request = store.get(id);
			request.onsuccess = () => {
				const blob = request.result.map as Blob;
				blob.arrayBuffer().then(buffer => {
					const worldRez = this.getCustomWorldRez(buffer);
					if (worldRez) {
						loadSave(worldRez);
					}
				});
			};
		} else {
			const world = this.resources.getWorld(row.path);
			if (world) {
				loadSave(world);
			}
		}
	}
	stop() {
		this.level?.stop();
	}
	setMusic(music: boolean) {
		this.music = music;
		this.level?.sounds.setMusic(music);
	}

	setSound(sound: boolean) {
		this.sound = sound;
		this.level?.sounds.setSound(sound);
	}

	destroy() {
		if (this.level) {
			this.level.stop();
		}
		this.resources?.destroy();
	}
}
