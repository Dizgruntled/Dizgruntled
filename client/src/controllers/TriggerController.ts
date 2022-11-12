import { Trigger } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';

export class TriggerController extends LogicController<Trigger> {
	init(logic: Trigger) {
		this.restore(logic);
		if (this.registry.getTileTraits(logic.coord).includes('auto')) {
			if (logic.delay) {
				this.schedule(logic.delay, 'loop', logic);
			} else {
				this.loop(logic);
			}
		}
	}
	restore(logic: Trigger) {
		logic.links.forEach(point => this.registry.links.add(point, logic));
	}
	toggle(logic: Trigger) {
		const currentTile = this.registry.getTile(logic.coord);
		if (logic.delay) {
			this.schedule(logic.delay, 'down', logic, 'down');
		} else {
			this.down(logic);
		}
		if (logic.duration) {
			this.schedule(logic.duration + (logic.delay ?? 0), 'up', logic, 'up', currentTile);
		}
	}
	down(logic: Trigger) {
		if (logic.tile) {
			this.registry.setTile(logic.coord, logic.tile);
		} else {
			this.registry.toggleTile(logic.coord);
		}
		this.Tile.updateTile(logic.coord);
	}
	up(logic: Trigger, currentTile: number) {
		if (logic.tile) {
			this.registry.setTile(logic.coord, currentTile);
		} else {
			this.registry.toggleTile(logic.coord);
		}
		this.Tile.updateTile(logic.coord);
	}
	loop(logic: Trigger) {
		this.registry.toggleTile(logic.coord);
		this.Tile.updateTile(logic.coord);
		if (logic.duration) {
			this.schedule(logic.duration, 'down', logic, 'down');
			if (logic.release) {
				this.schedule(logic.duration + logic.release, 'loop', logic);
			}
		}
	}
}
