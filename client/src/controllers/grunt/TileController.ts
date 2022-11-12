import { DIRECTIONS, getTileDirection } from 'client/data/data';
import { WATER_TOOLS } from 'client/data/GruntInfo';
import {
	BaseLogic,
	Brickz,
	Fort,
	GiantRock,
	Grunt,
	GruntPuddle,
	HelpBook,
	HiddenPickup,
	Pickup,
	Switch,
	Voice,
	Wormhole,
	WormholeTrigger,
} from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { coordToPosition, pointAdd } from 'client/utils/math';
import { Point } from 'client/utils/Point';
import { SPIKEZ_VOICES } from 'client/data/GruntVoices';

const SPIKES_HURT_DELAY = 1000;
const SPIKES_DAMAGE = 2;

const CRUMBLE_DELAY = 1000;

export class TileController extends LogicController<Grunt> {
	get Pickup() {
		return this.controllers.Pickup;
	}
	updateTile(coord: Point) {
		const grunt = this.registry.gruntTargets.get(coord);
		if (grunt) {
			this.checkTileDeath(grunt);
		}
		const puddle = this.registry.getLogicAt<GruntPuddle>(coord, 'GruntPuddle');
		if (puddle) {
			this.controllers.GruntPuddle.checkTile(puddle);
		}
	}
	checkTile(logic: Grunt) {
		if (this.checkTileDeath(logic)) {
			return true;
		}
		this.checkAlert(logic);
		let handled = false;
		this.registry.tileLogics.get(logic.coord)?.forEach(tileLogic => {
			handled = handled || this.checkTileLogic(logic, tileLogic);
		});
		if (handled) {
			return true;
		}
		const tile = this.registry.getTile(logic.coord);
		const isRunning = logic.action?.kind == 'Move' && logic.action.run;

		const dir = getTileDirection(tile);
		if (dir) {
			if (isRunning) {
				this.Death.explode(logic);
				return true;
			}
			this.edit(logic, {
				task: undefined,
			});
			const target = pointAdd(logic.coord, DIRECTIONS[dir]);
			this.Move.move(logic, target);
			return true;
		}
		return false;
	}
	checkAlert(logic: Grunt) {
		this.registry.gruntTargets.forEach(grunt => {
			if (grunt.ai && this.Attack.posesThreat(grunt, logic)) {
				this.AI.onAlert(grunt, logic);
			}
		});
	}
	checkTileLogic(logic: Grunt, tileLogic: BaseLogic) {
		switch (tileLogic.kind) {
			case 'Pickup':
				if (this.controllers.Pickup.pickup(tileLogic as Pickup, logic)) {
					return true;
				}
			case 'HelpBook':
				if (this.controllers.Pickup.pickupHelpBook(tileLogic as HelpBook, logic)) {
					return true;
				}
			case 'Switch':
				this.controllers.Switch.press(tileLogic as Switch, logic);
				return false;
			case 'Fort':
				return this.controllers.Fort.checkWin(tileLogic as Fort, logic);
			case 'ToobSpikez':
				if (WATER_TOOLS.includes(logic.tool ?? '')) {
					this.loseToob(logic);
				}
				return false;
			case 'WormholeTrigger':
				this.controllers.WormholeTrigger.activate(tileLogic as WormholeTrigger, logic);
				return false;
			case 'Wormhole':
				const wormhole = tileLogic as Wormhole;
				if (!wormhole.ephemeral && wormhole.state == 'Open') {
					this.Grunt.teleport(logic, wormhole.target);
					this.controllers.Wormhole.use(wormhole);
					return true;
				} else {
					return false;
				}
			case 'Voice':
				const voice = tileLogic as Voice;
				if (logic.team == 0) {
					this.controllers.Voice.trigger(voice, logic);
				}
				return false;
		}
		return false;
	}
	hurt(logic: Grunt, tag = 'hurt', count = 0) {
		const tool = this.Tool.getTool(logic);
		const canHurt = tool != 'GRAVITYBOOTZ' && tool != 'WINGZ';
		if (canHurt) {
			const nextHealth = Math.max(0, logic.health - SPIKES_DAMAGE);
			this.edit(logic, {
				health: nextHealth,
			});
		}
		if (logic.health == 0) {
			this.Death.goo(logic);
		} else {
			if (canHurt && tag == 'hurt' && count % 3 == 0) {
				this.speak(logic.id, 'VOICES/DAMAGETILE/DAMAGE', SPIKEZ_VOICES);
			}
			this.schedule(SPIKES_HURT_DELAY, 'hurt', logic, tag, tag, count + 1);
		}
	}
	checkTileDeath(logic: Grunt) {
		const coord = logic.coord;
		const traits = this.registry.getTileTraits(coord);
		if (traits.includes('crumble')) {
			this.schedule(CRUMBLE_DELAY, 'crumble', logic, `crumble-${coord.x},${coord.y}`, coord);
		}
		const tool = this.Tool.getTool(logic);
		if (traits.includes('pain')) {
			const existingHurtTask = this.registry.tasks.get(`${logic.id}.hurt`);
			if (!existingHurtTask || existingHurtTask.cancelTime) {
				this.hurt(logic);
			}
			if (tool?.startsWith('TOOB')) {
				this.loseToob(logic);
			} else if (tool == 'SPRING') {
				this.loseSpring(logic);
			}
		} else {
			this.cancel(logic, 'hurt');
		}
		if (traits.includes('solid') || traits.includes('nogo')) {
			this.Death.explode(logic);
			return true;
		}
		if (tool == 'WINGZ') {
			if (traits.includes('fly')) {
				this.Move.startFlying(logic);
				return false;
			} else {
				this.Move.stopFlying(logic);
				return false;
			}
		}
		if (traits.includes('hole')) {
			this.Death.setDeathAction(logic, 'HOLE');
			this.speak(logic.id, 'VOICES/DEATHZ/HOLE', ['A', 'B', 'C', 'D']);
			this.sound(logic, 'GRUNTZ/SOUNDZ/DEATHZ/DEATHZHOLEZ1', ['A', 'B']);
			return true;
		}
		if (traits.includes('water')) {
			if (tool == 'TOOB') {
				this.Move.startSwimming(logic);
				return true;
			} else if (!WATER_TOOLS.includes(tool ?? '')) {
				this.Death.setDeathAction(logic, 'SINK');
				this.sound(logic, 'GRUNTZ/SOUNDZ/DEATHZ/DEATHZSINK1', ['A', 'B', 'C']);
				return true;
			}
		} else if (tool == 'TOOBWATER') {
			this.Move.endSwimming(logic);
			return true;
		}
		if (traits.includes('death')) {
			this.Death.setDeathAction(logic, this.registry.areaInfo.death ?? 'SINK');
			this.sound(logic, 'GRUNTZ/SOUNDZ/DEATHZ/DEATHZSINK1', ['A', 'B', 'C']);
			return true;
		}
		return false;
	}
	crumble(logic: Grunt, coord: Point) {
		this.registry.toggleTile(coord);
		this.Tile.updateTile(coord);
	}
	breakTile(target: Point, ignoreExplosion = false, grunt?: Grunt) {
		const giantRock = this.registry.getLogicAt<GiantRock>(target, 'GiantRock');
		const hiddenPickup = this.registry.getLogicAt<HiddenPickup>(target, 'HiddenPickup');
		const brickz = this.registry.getLogicAt<Brickz>(target, 'Brickz');
		if (giantRock) {
			this.controllers.GiantRock.break(giantRock);
		} else if (brickz) {
			this.controllers.Brickz.break(brickz, ignoreExplosion, grunt);
		} else if (hiddenPickup) {
			this.controllers.HiddenPickup.reveal(hiddenPickup);
		} else {
			this.registry.toggleTile(target);
		}
	}
	explodeTile(target: Point, includeMiddle = false) {
		for (let x = -1; x <= 1; x++) {
			for (let y = -1; y <= 1; y++) {
				// Don't explode the source of the explosion
				if (!includeMiddle && x == 0 && y == 0) {
					continue;
				}
				const tile = { x: x + target.x, y: y + target.y };
				const traits = this.registry.getTileTraits(tile);
				if (traits.includes('break')) {
					this.breakTile(tile, true);
				}
				const grunt = this.registry.gruntTargets.get(tile);
				if (grunt && grunt.powerup != 'INVULNERABILITY') {
					this.Death.explode(grunt);
				}
			}
		}
		this.animate(
			'GAME/ANIZ/EXPLOSION3',
			'GAME/IMAGEZ/EXPLOSION',
			coordToPosition(target),
			'GAME/SOUNDZ/EXPLOSION1',
		);
	}
	loseSpring(logic: Grunt) {
		this.sound(logic, 'GRUNTZ/SOUNDZ/SPRINGGRUNT/SPRINGGRUNTD1S1');
		this.animate(
			'GRUNTZ/ANIZ/SPRINGGRUNT/LOSEITEM',
			'GRUNTZ/IMAGEZ/SPRINGGRUNT/LOSEITEM',
			logic.position,
			'GRUNTZ/SOUNDZ/SPRINGGRUNT/LOSEITEM',
		);
		this.edit(logic, {
			tool: undefined,
			rate: 600,
		});
	}
	loseToob(logic: Grunt) {
		this.sound(logic, 'GRUNTZ/SOUNDZ/TOOBGRUNT/TOOBZGRUNTD1', ['A', 'B']);
		this.animate(
			'GRUNTZ/ANIZ/TOOBGRUNT/LOSEITEM',
			'GRUNTZ/IMAGEZ/TOOBGRUNT/LOSEITEM',
			logic.position,
			'GRUNTZ/SOUNDZ/TOOBGRUNT/LOSEITEM',
		);
		this.edit(logic, {
			tool: undefined,
			rate: 600,
		});
	}
}
