import { LogicView } from 'client/draw/LogicView';
import { SpotLight } from 'client/logic/Logic';
import { TILE_SIZE } from 'client/utils/math';

export class SpotLightView extends LogicView<SpotLight> {
	init(logic: SpotLight) {
		this.update(logic);
	}
	update(logic: SpotLight) {
		this.draw(logic, {
			image: `AREA5/IMAGEZ/SPOTLIGHT/FRAME001`,
			color: '#ff6666',
			tween: {
				startTime: logic.actionTime,
				pauseTime: logic.pauseTime,
				endTime: logic.actionTime + logic.rate * 2,
				radialOffset: { x: logic.radius * TILE_SIZE, y: 0 },
				clockwise: logic.clockwise,
			},
			opacity: 0.6,
		});
	}
}
