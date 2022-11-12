import { LogicView } from 'client/draw/LogicView';
import { RollingBall } from 'client/logic/Logic';

export class RollingBallView extends LogicView<RollingBall> {
	init(logic: RollingBall) {
		this.roll(logic);
	}
	update(logic: RollingBall) {
		if (logic.death) {
			this.draw(logic, {
				animation: `${this.level.area}/ANIZ/ROLLINGBALL${logic.death}`,
				images: `${this.level.area}/IMAGEZ/ROLLINGBALL/${
					logic.death == 'EXPLOSION' ? 'EXPLOSION' : 'SINK'
				}`,
				time: this.level.registry.time,
				cleanup: true,
			});
		} else {
			this.roll(logic);
		}
	}
	roll(logic: RollingBall) {
		this.draw(logic, {
			images: `${this.level.area}/IMAGEZ/ROLLINGBALL/${logic.direction}`,
			tween: {
				target: logic.target,
				startTime: logic.startTime,
				endTime: this.level.registry.time + logic.rate,
			},
			time: this.level.registry.time,
		});
	}
}
