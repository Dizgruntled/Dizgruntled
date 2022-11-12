import { BaseLogic, Grunt } from 'client/logic/Logic';
import { Point } from 'client/utils/Point';
import { Level } from './Level';

interface SavedFrame {
	time: number;
	tasks: { [key: string]: any[] };
}

export interface SavedLevel {
	frames: SavedFrame[];
	changedLogics: SavedLogic[];
	changedTiles: number[];
	scrollOffset: Point;
	nextId: number;
	time: number;
}
export type RemovedLogic = {
	id: number;
	removed: true;
};
export type SavedLogic = RemovedLogic | { [name: string]: any };

export function saveLevel(level: Level, lastTime: number): SavedLevel {
	const frames = [] as SavedFrame[];
	let frame = level.registry.findFirstTaskFrameAfter(lastTime);
	while (frame) {
		const tasks = {} as { [key: string]: any[] };
		frame.tasks.forEach(task => {
			tasks[
				`${task.controller}.${task.method}.${task.parent ?? ''}.${task.tag ?? 'main'}.${
					task.cancel ?? ''
				}.${task.cancelTime ?? ''}`
			] = task.args;
		});
		frames.push({ time: frame.time, tasks });
		frame = frame.next;
	}
	const changedLogics = [] as SavedLogic[];
	const mapLogics = new Map<number, BaseLogic>();
	level.map.logics.forEach(logic => {
		mapLogics.set(logic.id, logic);
		if (!level.registry.logics.has(logic.id)) {
			changedLogics.push({
				id: logic.id,
				removed: true,
			});
		}
	});
	level.registry.logics.forEach(logic => {
		const originalLogic = mapLogics.get(logic.id);
		if (!originalLogic) {
			changedLogics.push({ ...logic });
		} else if (level.registry.changedLogics.has(logic.id)) {
			const nextLogic = {
				id: logic.id,
			} as SavedLogic;
			let found = false;
			for (const key in logic) {
				if (
					key == 'task' &&
					logic.kind == 'Grunt' &&
					(logic as Grunt).task?.kind == 'Walk'
				) {
					nextLogic[key] = {
						...logic[key],
						mesh: (logic as any).task.mesh.save(),
					};
					found = true;
				} else if (logic[key] != originalLogic[key]) {
					nextLogic[key] = logic[key];
					found = true;
				}
			}
			if (found) {
				changedLogics.push(nextLogic);
			}
		}
	});
	const changedTiles = [] as number[];
	level.registry.tiles.forEach((tile, index) => {
		if (level.map.tiles[index] != tile) {
			changedTiles.push(index, tile);
		}
	});
	const saved = {
		frames,
		changedLogics,
		changedTiles,
		scrollOffset: level.scrollOffset,
		nextId: level.registry.nextId,
		time: level.registry.time,
	};
	return saved;
}
