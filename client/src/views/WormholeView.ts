import { LogicView } from 'client/draw/LogicView';
import { Wormhole } from 'client/logic/Logic';

const COLORS = {
	Blue: '#0088ff',
	Green: '#00ff00',
	Red: '#ff0000',
};
const ANI = {
	Closing: 'TELEPORTERCLOSE',
	Opening: 'TELEPORTEROPEN',
	Open: 'TELEPORTER',
};

export class WormholeView extends LogicView<Wormhole> {
	init(logic: Wormhole) {
		this.updateAnimation(logic);
	}
	update(logic: Wormhole) {
		this.updateAnimation(logic);
	}
	updateAnimation(logic: Wormhole) {
		this.draw(logic, {
			animation: `GAME/ANIZ/${ANI[logic.state]}`,
			color: COLORS[logic.type],
			images: `GAME/IMAGEZ/WORMHOLE`,
			time: this.level.registry.time,
			zIndex: 80,
		});
	}
}
