import { StaticHazard } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { getDistance } from 'client/utils/math';

const KILL_TIME = 250;
const KILL_TICK = 100;
const KILL_DISTANCE = 14;
const COOLDOWN_TIME = 400;

export class StaticHazardController extends LogicController<StaticHazard> {
	init(logic: StaticHazard) {
		this.schedule(logic.delay, 'emit', logic);
	}
	emit(logic: StaticHazard) {
		this.edit(logic, {
			idle: false,
		});
		const killTime = this.registry.areaInfo.staticHazardKillTime ?? KILL_TIME;
		const time = this.registry.areaInfo.staticHazardTime ?? 1000;
		for (let i = killTime; i < time - KILL_TIME; i += KILL_TICK) {
			this.schedule(i, 'kill', logic, `kill-${i}`);
		}
		this.schedule(time, 'setIdle', logic);
		const areaInfo = this.registry.areaInfo;
		if (areaInfo.staticHazardSound) {
			this.sound(logic, `{area}/SOUNDZ/${areaInfo.staticHazardSound}`);
		}
	}
	setIdle(logic: StaticHazard) {
		this.edit(logic, {
			idle: true,
		});
		this.schedule(logic.period + COOLDOWN_TIME, 'emit', logic);
	}
	kill(logic: StaticHazard) {
		const grunts = this.registry.getGruntsNear(logic.coord, 1);
		grunts.forEach(grunt => {
			if (getDistance(logic.position, this.Grunt.getMovePosition(grunt)) < KILL_DISTANCE) {
				this.Death.setDeathAction(
					grunt,
					this.registry.areaInfo.staticHazardDeath ?? 'SINK',
				);
			}
		});
	}
}
