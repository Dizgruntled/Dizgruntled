import { LogicView } from 'client/draw/LogicView';
import { Sound } from 'client/logic/Logic';

export class SoundView extends LogicView<Sound> {
	init(logic: Sound) {
		this.update(logic);
	}
	update(logic: Sound) {
		if (!logic.paused) {
			this.level.sounds.playSound(
				`${this.level.area}/SOUNDZ/AMBIENT/${logic.sound}`,
				logic.rect,
				logic.volume * 0.2,
				logic.pauseTimes[0] == 0 ? `${logic.id}.loop` : undefined,
			);
		}
	}
}
