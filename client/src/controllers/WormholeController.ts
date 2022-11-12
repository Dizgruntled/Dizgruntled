import { Wormhole } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { coordToPosition } from 'client/utils/math';
import { Point } from 'client/utils/Point';

const OPEN_DURATION = 1000;
const CLOSE_DURATION = 1000;
const EPHEMERAL_DURATION = 3370;
const GREEN_DELAY = EPHEMERAL_DURATION + OPEN_DURATION + CLOSE_DURATION;

export class WormholeController extends LogicController<Wormhole> {
	init(logic: Wormhole) {
		this.open(logic);
	}
	open(logic: Wormhole) {
		if (logic.state == 'Opening') {
			this.sound(logic, 'GAME/SOUNDZ/TELEPORTEROPEN');
			this.schedule(OPEN_DURATION, 'finishOpen', logic);
		} else {
			this.sound(logic, 'GAME/SOUNDZ/TELEPORTLOOP', undefined, 0.5, `${logic.id}.loop`);
		}
	}
	finishOpen(logic: Wormhole) {
		this.edit(logic, {
			state: 'Open',
		});
		this.sound(logic, 'GAME/SOUNDZ/TELEPORTLOOP', undefined, 0.5, `${logic.id}.loop`);
		if (logic.duration) {
			this.schedule(logic.duration, 'close', logic);
		}
		if (!logic.ephemeral) {
			const grunt = this.registry.gruntTargets.get(logic.coord);
			if (grunt) {
				this.Grunt.teleport(grunt, logic.target);
				this.use(logic);
			}
		}
	}
	use(logic: Wormhole) {
		this.close(logic);
		this.spawn<Wormhole>({
			kind: 'Wormhole',
			duration: EPHEMERAL_DURATION,
			ephemeral: true,
			coord: logic.target,
			position: coordToPosition(logic.target),
			state: 'Opening',
			target: logic.target,
			type: logic.type,
		});
		if (logic.exit) {
			this.spawn<Wormhole>({
				kind: 'Wormhole',
				coord: logic.exit,
				position: coordToPosition(logic.exit),
				state: 'Opening',
				type: logic.type,
				target: logic.coord,
			});
		}
		if (logic.type == 'Green') {
			this.schedule(
				GREEN_DELAY,
				'reopen',
				undefined,
				'reopen',
				logic.coord,
				logic.target,
				logic.type,
			);
		}
	}
	reopen(logic: Wormhole, coord: Point, target: Point, type: Wormhole['type']) {
		this.spawn<Wormhole>({
			kind: 'Wormhole',
			coord,
			position: coordToPosition(coord),
			state: 'Opening',
			target: target,
			type,
		});
	}
	close(logic: Wormhole) {
		this.edit(logic, {
			state: 'Closing',
		});
		this.clearSound('GAME/SOUNDZ/TELEPORTLOOP', `${logic.id}.loop`);
		this.sound(logic, 'GAME/SOUNDZ/TELEPORTERCLOSE');
		this.schedule(CLOSE_DURATION, 'destroy', logic);
	}
}
