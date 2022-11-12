import { LogicView } from 'client/draw/LogicView';
import { UFO } from 'client/logic/Logic';
import { getDistance, TILE_SIZE } from 'client/utils/math';

const SPOTLIGHT_RADIUS = 64;

export class UFOView extends LogicView<UFO> {
	init(logic: UFO) {
		this.update(logic);
	}
	update(logic: UFO) {
		const time = (logic.rate * getDistance(logic.position, logic.target)) / TILE_SIZE;
		this.draw(logic, {
			animation: `AREA8/ANIZ/UFO`,
			images: `AREA8/IMAGEZ/UFO`,
			tween: logic.target
				? {
						target: logic.target,
						startTime: logic.startTime,
						endTime: logic.startTime + time,
				  }
				: undefined,
			opacity: 0.6,
			zIndex: 100400,
		});
		this.draw(logic, {
			tag: 'spotlight-1',
			image: `AREA8/IMAGEZ/SPOTLIGHT/FRAME001`,
			color: '#ffffff',
			tween: {
				radialStartTime: logic.rotateStartTime,
				radialEndTime: logic.rotateStartTime + logic.rotateRate * 2,
				startTime: logic.startTime,
				endTime: logic.startTime + time,
				target: logic.target,
				radialOffset: { x: SPOTLIGHT_RADIUS, y: 0 },
				clockwise: logic.clockwise,
			},
			opacity: 0.4,
			zIndex: 100400,
		});
		this.draw(logic, {
			tag: 'spotlight-2',
			image: `AREA8/IMAGEZ/SPOTLIGHT/FRAME001`,
			color: '#ffffff',
			tween: {
				radialStartTime: logic.rotateStartTime,
				radialEndTime: logic.rotateStartTime + logic.rotateRate * 2,
				startTime: logic.startTime,
				endTime: logic.startTime + time,
				radialOffset: { x: -SPOTLIGHT_RADIUS, y: 0 },
				target: logic.target,
				clockwise: logic.clockwise,
			},
			opacity: 0.4,
			zIndex: 100400,
		});
	}
}
