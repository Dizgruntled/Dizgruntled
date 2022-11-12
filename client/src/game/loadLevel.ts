import { BaseLogic } from 'client/logic/Logic';
import Pako from 'pako';
import { StoredGame } from './FileLoader';
import { Level } from './Level';
import { RemovedLogic, SavedLevel } from './saveLevel';

export function loadLevel(level: Level, saved: SavedLevel) {
	level.registry.time = saved.time;
	saved.changedLogics.forEach(logic => {
		if ((logic as RemovedLogic).removed) {
			level.registry.removeLogic(logic.id);
		} else if (level.registry.getLogic(logic.id)) {
			level.registry.editLogic(logic as BaseLogic, logic);
		} else {
			level.registry.addLogic(logic as BaseLogic, true);
		}
	});
	for (let i = 0; i < saved.changedTiles.length; i += 2) {
		level.registry.tiles[saved.changedTiles[i]] = saved.changedTiles[i + 1];
	}
	level.scrollOffset.x = saved.scrollOffset.x;
	level.scrollOffset.y = saved.scrollOffset.y;
	level.registry.nextId = saved.nextId;
	saved.frames.forEach(frame => {
		for (const key in frame.tasks) {
			const args = frame.tasks[key];
			const [controller, method, parent, tag] = key.split('.');
			const id = parent ? parseInt(parent, 10) : undefined;
			level.registry.schedule(
				controller,
				frame.time - saved.time,
				method,
				level.registry.getLogic(id),
				tag || undefined,
				...args,
			);
		}
	});
}

export function loadSavedLevel(storedGame: StoredGame): Promise<SavedLevel> {
	return new Promise(fulfil => {
		storedGame.save.arrayBuffer().then(buffer => {
			fulfil(JSON.parse(Pako.inflate(buffer, { to: 'string' })));
		});
	});
}
