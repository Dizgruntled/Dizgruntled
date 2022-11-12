import { Projectile } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import {
	getDistance,
	getLinearPosition,
	getRadialPosition,
	positionToCoord,
} from 'client/utils/math';
import { Point } from 'client/utils/Point';

const HIT_DISTANCE = 16;
const LOST_BOOMERANG_ACTIONS = ['Play', 'Death', 'Win'];
const HIT_TICK = 50;
const IMPACT_DURATION = 500;

export class ProjectileController extends LogicController<Projectile> {
	init(logic: Projectile) {
		this.schedule(logic.duration, 'impact', logic);
		if (logic.type == 'BOOMERANG' || logic.type == 'WINGZ') {
			this.schedule(HIT_TICK, 'flyingHit', logic, 'hitter');
		}
	}
	flyingHit(logic: Projectile) {
		const t = Math.max(0, Math.min(1, (this.registry.time - logic.startTime) / logic.duration));
		const position =
			logic.type == 'WINGZ'
				? getLinearPosition(logic.position, logic.target, t)
				: this.getBoomerangPosition(logic, t);
		this.hit(logic, position);
		this.schedule(HIT_TICK, 'flyingHit', logic, 'hitter');
	}
	getBoomerangPosition(logic: Projectile, t: number) {
		const position = {
			x: (logic.position.x + logic.target.x) / 2,
			y: (logic.position.y + logic.target.y) / 2,
		};
		const radialOffset = {
			x: logic.position.x - position.x,
			y: logic.position.y - position.y,
		};
		return getRadialPosition(position, radialOffset, t);
	}
	hit(logic: Projectile, position: Point) {
		const damagedGrunts = new Set(logic.damagedGrunts);
		this.registry.getGruntsNear(positionToCoord(position)).forEach(grunt => {
			if (grunt.id == logic.ownerId || logic.damagedGrunts.includes(grunt.id)) {
				return;
			}
			const distance = getDistance(position, this.Grunt.getMovePosition(grunt));
			if (distance < HIT_DISTANCE && !damagedGrunts.has(grunt.id)) {
				this.Attack.struckByProjectile(grunt, logic);
				damagedGrunts.add(grunt.id);
			}
		});
		if (damagedGrunts.size > logic.damagedGrunts.length) {
			this.edit(logic, {
				damagedGrunts: [...damagedGrunts],
			});
		}
	}
	impact(logic: Projectile) {
		if (logic.type == 'BOOMERANG') {
			this.returnBoomerang(logic);
			return;
		}
		this.edit(logic, {
			state: 'Impact',
		});
		const sound = this.getSoundName(logic);
		if (sound) {
			this.sound(logic, sound);
		}
		this.schedule(IMPACT_DURATION, 'destroy', logic);
		this.hit(logic, logic.target);
	}
	returnBoomerang(logic: Projectile) {
		const grunt = this.registry.gruntTargets.get(logic.coord);
		if (
			grunt &&
			grunt.id == logic.ownerId &&
			grunt.tool == undefined &&
			!LOST_BOOMERANG_ACTIONS.includes(grunt.action.kind)
		) {
			this.edit(grunt, {
				tool: 'BOOMERANG',
			});
		}
		this.destroy(logic);
	}
	getSoundName(logic: Projectile) {
		switch (logic.type) {
			case 'BOOMERANG':
				// TODO noise for BOOMERANG impact
				return undefined;
			case 'ROCK':
				return 'GRUNTZ/SOUNDZ/ROCKGRUNT/ROCKZGRUNTPROJECTILE';
			case 'WELDER':
				return 'GRUNTZ/SOUNDZ/WELDERGRUNT/WELDERGRUNTPROJIMPACT';
			case 'GUNHAT':
				return 'GRUNTZ/SOUNDZ/GUNHATGRUNT/GUNHATGRUNTPROJIMPACT';
			case 'NERFGUN':
				// TODO noise for NERFGUN impact
				return undefined;
			case 'WINGZ':
				// TODO noise for WINGZ impact
				return undefined;
		}
		return undefined;
	}
}
