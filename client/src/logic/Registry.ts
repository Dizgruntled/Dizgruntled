import {
	coordToPosition,
	getDistance,
	pointAdd,
	pointSub,
	positionToCoord,
} from 'client/utils/math';
import { Point } from 'client/utils/Point';
import { BaseLogic, Grunt, Team } from './Logic';

import { TileMap, TileStack } from 'client/utils/TileStack';
import { getTileTypes } from 'client/data/TileTypes';
import { AreaInfo, getAreaInfo } from 'client/data/AreaInfo';
import { TileTraits } from 'client/data/TileTraits';
import { TileToggles } from 'client/data/TileToggles';
import { SavedMap } from 'client/game/SavedMap';

export interface Task {
	controller: string;
	method: string;
	cancel?: string;
	tag?: string;
	parent?: number;
	cancelTime?: number;
	args: any[];
}

export interface TaskFrame {
	time: number;
	tasks: Task[];
	prev?: TaskFrame;
	next?: TaskFrame;
}

export interface AnimateEffect {
	kind: 'Animate';
	animation: string;
	images: string;
	sound?: string;
	color?: string;
	position: Point;
	volume?: number;
}
export interface HelpEffect {
	kind: 'Help';
	text: string;
}
export interface SoundEffect {
	kind: 'Sound';
	sound: string;
	position: Point;
	volume?: number;
	loopTag?: string;
}
export interface ClearSoundEffect {
	kind: 'ClearSound';
	sound: string;
	tag: string;
}
export interface SpeakEffect {
	kind: 'Speak';
	gruntId: number;
	sound: string;
	variants?: string[];
}
export interface SaveEffect {
	kind: 'Save';
}

export interface ScrollEffect {
	kind: 'Scroll';
	position: Point;
}

export interface WinEffect {
	kind: 'Win';
}

export type Effect =
	| AnimateEffect
	| HelpEffect
	| SoundEffect
	| ScrollEffect
	| ClearSoundEffect
	| SpeakEffect
	| SaveEffect
	| WinEffect;

export const NO_ID = 0;

type Controller = { [method: string]: (...args: any[]) => void };

export class Registry {
	time: number = 0;
	nextId: number;
	areaInfo: AreaInfo;
	logics = new Map<number, BaseLogic>();
	gruntTargets = new TileMap<Grunt>();
	tileLogics = new TileStack<BaseLogic>();
	changes: (Partial<BaseLogic> & { id: number })[] = [];
	additions: number[] = [];
	removals = new Set<BaseLogic>();
	changed = new Set<number>();
	taskHead: TaskFrame;
	tiles: Uint32Array;
	tileTypes = new Map<number, string>();
	tileIds = new Map<string, number>();
	links = new TileStack<BaseLogic>();
	changedTiles = new TileMap<number>();
	redPyramids: Point[] = [];
	tasks = new Map<string, Task>();
	effects: Effect[] = [];
	teams = new Map<number, Team>();
	changedLogics = new Set<number>();

	constructor(
		readonly map: SavedMap,
		readonly seed: number[],
		readonly controllers: { [name: string]: Controller },
	) {
		this.areaInfo = getAreaInfo(map.area);
		this.nextId = 1;
		this.taskHead = { time: 0, tasks: [] };
		this.tiles = new Uint32Array(map.tiles);

		getTileTypes(this.areaInfo.id).forEach((value, i) => {
			this.tileTypes.set(i + 1, value);
		});
		this.tileTypes.forEach((type, id) => {
			if (!this.tileIds.has(type)) {
				this.tileIds.set(type, id);
			}
		});

		for (let x = 0; x < map.width; x++) {
			for (let y = 0; y < map.height; y++) {
				const point = { x, y };
				if (this.getTileTraits(point).includes('redPyramid')) {
					this.redPyramids.push(point);
				}
			}
		}
	}
	getRandom(low: number, high: number, offset: number) {
		const i = this.seed[(this.time * 37 + offset) % this.seed.length];
		return Math.floor((i / 1000) * (high - low) + low);
	}
	getRandomAt(low: number, high: number, point: Point) {
		return this.getRandom(low, high, point.x * 23 + point.y * 29);
	}
	getTile(coord: Point) {
		return this.tiles[coord.y * this.map.width + coord.x];
	}
	setTile(coord: Point, tile: number) {
		this.changedTiles.set(coord, this.tiles[coord.x + coord.y * this.map.width]);
		this.tiles[coord.x + coord.y * this.map.width] = tile;
	}
	isValidTile(coord: Point) {
		return (
			coord.x >= 0 && coord.y >= 0 && coord.x < this.map.width && coord.y < this.map.height
		);
	}
	toggleTile(coord: Point, nextTile?: number) {
		const tile = this.getTile(coord);
		const tileType = this.tileTypes.get(tile) ?? 'None';
		const toggleType = TileToggles[tileType];
		if (!toggleType) {
			return;
		}
		const [nextType, animation, images, sound] = toggleType;
		if (animation) {
			this.effects.push({
				kind: 'Animate',
				animation,
				images,
				sound,
				position: coordToPosition(coord),
			});
		}
		this.setTile(coord, nextTile ? nextTile : this.tileIds.get(nextType) ?? 1);
	}
	getTileTraits(coord: Point): string[] {
		const tile = this.getTile(coord);
		const type = tile > 100000 ? 'DEATH' : this.tileTypes.get(tile);
		return type ? TileTraits[type] ?? [] : [];
	}
	getTileTraitsAt(position: Point) {
		const coord = positionToCoord(position);
		return this.getTileTraits(coord);
	}
	addLogic<T extends BaseLogic>(logic: Omit<T, 'id'>, restoreId = false) {
		const logicWithId = logic as T;
		logicWithId.id = restoreId ? (logic as any).id : this.nextId++;
		this.logics.set(logicWithId.id, logicWithId);
		this.updateLogicPosition(logicWithId, logicWithId.position);
		this.additions.push(logicWithId.id);
		return logicWithId.id;
	}
	getLogic<T extends BaseLogic>(id: number | undefined, kind?: T['kind']): T | undefined {
		if (id == undefined) {
			return undefined;
		}
		const logic = this.logics.get(id) as T | undefined;
		if (kind && logic?.kind != kind) {
			return undefined;
		} else {
			return logic;
		}
	}
	getLogicAt<T extends BaseLogic>(coord: Point, kind: T['kind']): T | undefined {
		return this.tileLogics.get(coord)?.find(logic => logic.kind == kind) as T | undefined;
	}
	getGruntsNear(coord: Point, offset = 0): Grunt[] {
		const grunts = new Set<Grunt>();
		for (let x = -offset; x <= offset; x++) {
			for (let y = -offset; y <= offset; y++) {
				const tile = pointAdd(coord, { x, y });
				const target = this.gruntTargets.get(tile);
				if (target) {
					grunts.add(target);
				}
				this.tileLogics.get(tile)?.forEach(logic => {
					if (logic.kind == 'Grunt') {
						grunts.add(logic as Grunt);
					}
				});
			}
		}
		return [...grunts];
	}
	getLogicsNear<T extends BaseLogic>(coord: Point, offset = 1, kind?: T['kind']): T[] {
		const logics = new Set<T>();
		for (let x = -offset; x <= offset; x++) {
			for (let y = -offset; y <= offset; y++) {
				const tile = pointAdd(coord, { x, y });
				this.tileLogics.get(tile)?.forEach(logic => {
					if (kind == undefined || logic.kind == kind) {
						logics.add(logic as T);
					}
				});
			}
		}
		return [...logics];
	}
	canMoveBetween(from: Point, to: Point) {
		const distance = getDistance(from, to);
		if (distance > 2) {
			// Diagonal jump requires 4 empty tiles
			const dir = pointSub(to, from);
			const topLeftTraits = this.getTileTraits({ x: from.x, y: from.y + dir.y / 2 });
			const topRightTraits = this.getTileTraits({
				x: from.x + dir.x / 2,
				y: from.y,
			});
			const bottomLeftTraits = this.getTileTraits({
				x: from.x + dir.x / 2,
				y: from.y + dir.y,
			});
			const bottomRightTraits = this.getTileTraits({
				x: from.x + dir.x,
				y: from.y + dir.y / 2,
			});
			if (
				topLeftTraits.includes('solid') ||
				topRightTraits.includes('solid') ||
				bottomLeftTraits.includes('solid') ||
				bottomRightTraits.includes('solid')
			) {
				return false;
			}
		} else if (distance > 1 && distance < 2) {
			// Diagonal walk requires 2 empty tiles
			const dir = pointSub(to, from);
			const leftTraits = this.getTileTraits({ x: from.x, y: from.y + dir.y });
			const rightTraits = this.getTileTraits({ x: from.x + dir.x, y: from.y });
			if (leftTraits.includes('solid') || rightTraits.includes('solid')) {
				return false;
			}
		}
		return true;
	}
	findFirstTaskFrameAfter(time: number): TaskFrame | undefined {
		while (this.taskHead.time > time) {
			if (this.taskHead.prev) {
				if (this.taskHead.prev.time > time) {
					this.taskHead = this.taskHead.prev;
				} else {
					return this.taskHead;
				}
			} else {
				return this.taskHead;
			}
		}
		while (this.taskHead.time <= time) {
			if (this.taskHead.next) {
				this.taskHead = this.taskHead.next;
			} else {
				return undefined;
			}
		}
		return this.taskHead;
	}
	moveTaskHead(time: number, create = false): TaskFrame | undefined {
		while (this.taskHead.time < time) {
			const next = this.taskHead.next;
			if (next) {
				if (next.time > time) {
					if (!create) {
						return undefined;
					}
					const frame = {
						time,
						next: next,
						prev: this.taskHead,
						tasks: [],
					};
					next.prev = frame;
					this.taskHead.next = frame;
					this.taskHead = frame;
				} else {
					this.taskHead = next;
				}
			} else {
				if (!create) {
					return undefined;
				}
				const frame = {
					time,
					prev: this.taskHead,
					tasks: [],
				};
				this.taskHead.next = frame;
				this.taskHead = frame;
			}
		}
		while (this.taskHead.time > time) {
			const current = this.taskHead;
			const prev = current.prev;
			if (prev) {
				if (prev.time < time) {
					if (!create) {
						return undefined;
					}
					const frame = {
						time,
						prev,
						next: current,
						tasks: [],
					};
					prev.next = frame;
					current.prev = frame;
					this.taskHead = frame;
				} else {
					this.taskHead = prev;
				}
			} else {
				if (!create) {
					return undefined;
				}
				const frame = {
					time,
					next: this.taskHead,
					tasks: [],
				};
				current.prev = frame;
				this.taskHead = frame;
			}
		}
		return this.taskHead;
	}
	sound(logic: BaseLogic, sound: string, variants?: string[], volume = 1) {
		if (variants) {
			const index = this.getRandomAt(0, variants.length, logic.position);
			const variety = variants[index];
			sound = sound + variety;
		}
		this.effects.push({
			kind: 'Sound',
			sound,
			position: logic.position,
			volume,
		});
	}
	cancel(parent: BaseLogic, tag: string = 'main') {
		const path = `${parent ? parent.id : ''}.${tag}`;
		const task = this.tasks.get(path);
		if (task) {
			if (task.cancel) {
				const logic = this.getLogic(task.parent);
				this.controllers[task.controller][task.cancel](logic, ...task.args);
			}
			task.cancelTime = this.time;
		}
	}
	schedule<Args extends any[]>(
		controller: string,
		delay: number,
		method: string,
		parent?: BaseLogic | undefined,
		tag?: string,
		...args: Args
	) {
		const task: Task = {
			controller,
			method,
			parent: parent ? parent.id : undefined,
			tag,
			args,
		};
		if (parent || tag) {
			const path = `${parent ? parent.id : ''}.${tag ?? 'main'}`;
			const currentTask = this.tasks.get(path);
			if (currentTask && !currentTask.cancelTime) {
				if (currentTask.cancel) {
					const logic = this.getLogic(currentTask.parent);
					this.controllers[task.controller][currentTask.cancel](
						logic,
						...currentTask.args,
					);
				}
				currentTask.cancelTime = this.time;
			}
			this.tasks.set(path, task);
		}
		this.moveTaskHead(this.time + delay, true)?.tasks.push(task);
		return task;
	}
	editLogic<T extends BaseLogic>(logic: T, delta: Partial<T>) {
		this.changedLogics.add(logic.id);
		const registryLogic = this.getLogic(logic.id);
		if (registryLogic) {
			if (delta.position) {
				this.updateLogicPosition(registryLogic, delta.position);
			}
			Object.assign(registryLogic, delta);
			this.changed.add(logic.id);
		}
	}
	removeLogic(id: number) {
		const logic = this.getLogic(id);
		if (logic) {
			this.removals.add(logic);
			this.updateLogicPosition(logic);
			this.logics.delete(id);
		}
		this.tasks.forEach(task => {
			if (task.parent == id) {
				if (task.cancel) {
					const logic = this.getLogic(task.parent);
					this.controllers[task.controller][task.cancel](logic, ...task.args);
				}
				task.cancelTime = this.time;
			}
		});
	}
	updateLogicPosition(logic: BaseLogic, nextPosition?: Point) {
		this.tileLogics.remove(logic.coord, logic);
		if (nextPosition) {
			logic.coord = positionToCoord(nextPosition);
			this.tileLogics.add(logic.coord, logic);
		}
	}
	flush() {
		this.additions.length = 0;
		this.effects.length = 0;
		this.changed.clear();
		this.removals.clear();
		this.changedTiles.clear();
	}
}
