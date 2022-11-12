import { Point } from 'client/utils/Point';
import { GruntPuddle } from '../logic/Logic';
import { LogicController } from '../logic/LogicController';

const EXCLUDE_TILES = new Set(['solid', 'water', 'death', 'hole']);

export class GruntPuddleController extends LogicController<GruntPuddle> {
	checkTile(logic: GruntPuddle) {
		if (!this.canPlacePuddle(logic.coord)) {
			this.destroy(logic);
		}
	}
	canPlacePuddle(coord: Point) {
		if (this.registry.getLogicAt(coord, 'GruntPuddle')) {
			return false;
		}
		const traits = this.registry.getTileTraits(coord);
		return !traits.some(trait => EXCLUDE_TILES.has(trait));
	}
}
