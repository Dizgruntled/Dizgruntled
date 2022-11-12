import { LogicView } from 'client/draw/LogicView';
import { CheckpointFlag } from 'client/logic/Logic';

export class CheckpointFlagView extends LogicView<CheckpointFlag> {
	init(logic: CheckpointFlag) {
		this.draw(logic, {
			image: `GAME/IMAGEZ/CHECKPOINTFLAG/FRAME001`,
		});
	}
	update(logic: CheckpointFlag) {
		this.draw(logic, {
			animation: 'GAME/ANIZ/CHECKPOINTFLAGSET',
			images: 'GAME/IMAGEZ/CHECKPOINTFLAG',
		});
	}
}
