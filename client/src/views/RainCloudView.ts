import { LogicView } from 'client/draw/LogicView';
import { RainCloud } from 'client/logic/Logic';
import { getDistance, TILE_SIZE } from 'client/utils/math';

export class RainCloudView extends LogicView<RainCloud> {
	init(logic: RainCloud) {
		this.update(logic);
	}
	update(logic: RainCloud) {
		const time = (logic.rate * getDistance(logic.position, logic.target)) / TILE_SIZE;
		this.draw(logic, {
			image: `AREA7/IMAGEZ/RAINCLOUD/FRAME001`,
			color: '#000000',
			tween: logic.target
				? {
						startTime: logic.startTime,
						endTime: logic.startTime + time,
						target: logic.target,
				  }
				: undefined,
		});
	}
}
