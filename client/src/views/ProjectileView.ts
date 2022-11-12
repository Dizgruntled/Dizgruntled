import { LogicView } from 'client/draw/LogicView';
import { Projectile } from 'client/logic/Logic';

export class ProjectileView extends LogicView<Projectile> {
	init(logic: Projectile) {
		this.update(logic);
	}
	update(logic: Projectile) {
		const time = this.level.registry.time;
		if (logic.state == 'Fly') {
			const isBoomerang = logic.type == 'BOOMERANG';
			const position = isBoomerang
				? {
						x: (logic.position.x + logic.target.x) / 2,
						y: (logic.position.y + logic.target.y) / 2,
				  }
				: logic.position;
			const radialOffset = isBoomerang
				? {
						x: logic.position.x - position.x,
						y: logic.position.y - position.y,
				  }
				: undefined;

			this.draw(logic, {
				animation: `GRUNTZ/ANIZ/${logic.type}GRUNT/PROJECTILE${
					logic.type == 'WINGZ' || isBoomerang ? '1' : '2'
				}`,
				images: `GRUNTZ/IMAGEZ/${logic.type}GRUNT/PROJECTILE/OBJECT`,
				position,
				tween: {
					target: isBoomerang ? undefined : logic.target,
					startTime: logic.startTime,
					endTime: logic.startTime + logic.duration,
					arc: logic.type == 'WINGZ' || isBoomerang ? 0 : 60,
					radialOffset,
				},
				offsetY: isBoomerang ? -10 : 0,
				zIndex: 100401,
				time,
			});
			this.draw(logic, {
				animation: `GRUNTZ/ANIZ/${logic.type}GRUNT/PROJECTILE1`,
				images: `GRUNTZ/IMAGEZ/${logic.type}GRUNT/PROJECTILE/SHADOW`,
				position,
				tween: {
					target: isBoomerang ? undefined : logic.target,
					startTime: logic.startTime,
					endTime: logic.startTime + logic.duration,
					radialOffset,
				},
				tag: 'Shadow',
				zIndex: 100400,
				time,
				opacity: 0.5,
			});
		} else if (logic.state == 'Fall') {
			this.draw(logic, {
				animation: `GRUNTZ/ANIZ/${logic.type}GRUNT/PROJECTILEFALL`,
				images: `GRUNTZ/IMAGEZ/${logic.type}GRUNT/PROJECTILE/OBJECT`,
				position: logic.target,
				zIndex: 100401,
				time,
			});
			this.clear(logic, 'Shadow');
		} else if (logic.state == 'Impact') {
			this.draw(logic, {
				animation: `GRUNTZ/ANIZ/${logic.type}GRUNT/PROJECTILEIMPACT`,
				images: `GRUNTZ/IMAGEZ/${logic.type}GRUNT/PROJECTILE/OBJECT`,
				position: logic.target,
				zIndex: 100401,
				time,
			});
			this.clear(logic, 'Shadow');
		}
	}
}
