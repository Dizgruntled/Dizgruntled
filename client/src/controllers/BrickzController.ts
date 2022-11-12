import { Brickz, Grunt, HiddenPickup } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';

const PREFIX = 'BRICKZ_';
const BRICK_COLORS = {
	N: '',
	Y: 'GOLD',
	R: 'RED',
	B: 'BLUE',
	K: 'BLACK',
};

export class BrickzController extends LogicController<Brickz> {
	init(logic: Brickz) {
		this.restore(logic);
	}
	restore(logic: Brickz) {
		const tile = this.registry.getTile(logic.coord);
		const tileType = this.registry.tileTypes.get(tile);
		logic.value = (tileType as string).substring(PREFIX.length);
	}
	break(logic: Brickz, ignoreExplosion = false, grunt?: Grunt) {
		const color = logic.value[logic.value.length - 1];
		const nextColor = logic.value.substring(0, logic.value.length - 1);
		if (!ignoreExplosion && color == 'K') {
			this.Tile.explodeTile(logic.coord);
		}
		if (grunt?.tool == 'GAUNTLETZ') {
			if (color == 'Y') {
				// Reveal a gold brick when hit
				this.reveal(logic, grunt.team);
				this.sound(logic, 'GRUNTZ/SOUNDZ/NORMALGRUNT/IMPACTMM1');
				return;
			} else if (color == 'R') {
				this.edit(grunt, {
					tool: undefined,
				});
			}
		}
		this.animate(
			'GAME/ANIZ/BRICKBREAK',
			`GAME/IMAGEZ/${BRICK_COLORS[color]}BRICKBREAK`,
			logic.position,
			'GAME/SOUNDZ/BRICKBREAK',
		);
		this.edit(logic, {
			value: nextColor,
		});
		this.updateTile(logic);
		if (nextColor.length == 0) {
			const pickup = this.registry.getLogicAt<HiddenPickup>(logic.coord, 'HiddenPickup');
			if (pickup) {
				this.controllers.HiddenPickup.reveal(pickup);
			}
		}
	}
	updateTile(logic: Brickz) {
		const tileId = this.registry.tileIds.get(
			logic.value.length ? `BRICKZ_${logic.value}` : 'METAL_TILE',
		);
		if (tileId) {
			this.registry.setTile(logic.coord, tileId);
			this.Tile.updateTile(logic.coord);
		}
	}
	addBrick(logic: Brickz, brick = 'N') {
		this.edit(logic, {
			value: logic.value + brick,
		});
		this.updateTile(logic);
	}
	reveal(logic: Brickz, team: number) {
		const nextHidden = [...logic.hidden];
		nextHidden[team] = false;
		this.edit(logic, {
			hidden: nextHidden,
		});
		const currentTileId = this.registry.tileIds.get(`BRICKZ_${logic.value}`);
		if (currentTileId) {
			this.registry.setTile(logic.coord, currentTileId);
		}
	}
}
