import { RANGED_TOOLS, WATER_TOOLS } from 'client/data/GruntInfo';
import { Grunt } from 'client/logic/Logic';
import { pointAdd, coordToPosition } from 'client/utils/math';
import { Point } from 'client/utils/Point';
import {
	BAD_COMMAND_VOICES,
	SELECT_VOICES,
	LITERALLY_FUMING_SELECT_VOICES,
	ANGRY_SELECT_VOICES,
	ATTACK_COMMAND_VOICES,
	GOOD_COMMAND_VOICES,
} from 'client/data/GruntVoices';
import { Level } from './Level';
import { ClickInfo, DragItem } from './InputController';
import { GruntView } from '../views/GruntView';

export class CommandController {
	selection: Grunt[] = [];
	angryGrunt?: {
		grunt: Grunt;
		count: number;
	};

	constructor(readonly level: Level) {}

	checkGrunts(info: ClickInfo, tile: Point, shift: boolean) {
		if (info.directGrunt && info.directGrunt.toy && this.selection.includes(info.directGrunt)) {
			info.nextDragItem = this.dragToy(info.directGrunt);
		}

		this.updateSelection(info, shift);
		this.selection = this.selection.filter(
			grunt => !this.level.controllers.GruntDeath.isDying(grunt),
		);

		const time = Math.floor(performance.now()) - this.level.resumeTime;
		this.level.registry.time = time;

		if (info.selection.size > 0) {
			const someGrunt = info.selection.values().next().value as Grunt;
			this.speakSelect(info, someGrunt);
		} else {
			this.angryGrunt = undefined;
		}
		if (info.selection.size == 0 && this.selection.length > 0 && info.isDirectClick) {
			this.issueCommand(tile, info);
		}
	}
	dragToy(grunt: Grunt): DragItem | undefined {
		const offset = { x: 20, y: 30 };
		const sprite = this.level.spriteBank.add(undefined, {
			tag: 'Toy',
			images: `GAME/IMAGEZ/CURSORZ/${grunt.toy}Z`,
			position: pointAdd(this.level.input.cursor, pointAdd(this.level.scrollOffset, offset)),
			zIndex: 300103,
		});
		if (sprite) {
			return {
				kind: 'TOY' as const,
				tag: 'Toy',
				offset,
				location: grunt.position,
			};
		} else {
			return undefined;
		}
	}
	updateSelection(clickInfo: ClickInfo, shift = false) {
		const gruntView = this.level.views.Grunt as GruntView;
		if (!shift && clickInfo.selection.size > 0) {
			this.selection.forEach(grunt => gruntView.deselect(grunt));
			this.selection.length = 0;
		}
		clickInfo.selection.forEach(grunt => {
			const selectedIndex = this.selection.findIndex(
				selectedGrunt => selectedGrunt.id == grunt.id,
			);
			if (shift && clickInfo.isDirectClick && selectedIndex >= 0) {
				gruntView.deselect(this.selection[selectedIndex]);
				this.selection.splice(selectedIndex, 1);
			} else {
				gruntView.select(grunt);
				this.selection.push(grunt);
			}
		});
	}
	issueCommand(target: Point, info: ClickInfo) {
		const walkingGrunts = this.selection.filter(
			grunt => grunt.tool != 'SPRING' && !WATER_TOOLS.includes(grunt.tool ?? ''),
		);
		const floatingGrunts = this.selection.filter(grunt =>
			WATER_TOOLS.includes(grunt.tool ?? ''),
		);
		const springingGrunts = this.selection.filter(grunt => grunt.tool == 'SPRING');
		const movingGrunts: Grunt[] = [];
		if (walkingGrunts.length > 0) {
			movingGrunts.push(...this.navigateGrunts(target, info, walkingGrunts));
		}
		if (floatingGrunts.length > 0) {
			movingGrunts.push(...this.navigateGrunts(target, info, floatingGrunts));
		}
		if (springingGrunts.length > 0) {
			movingGrunts.push(...this.navigateGrunts(target, info, springingGrunts));
		}
		if (movingGrunts.length > 0) {
			this.speakCommand(info, movingGrunts[0]);
		} else {
			const view = this.level.views.Grunt as GruntView;
			view.speak(this.selection[0], 'VOICES/ACKNOWLEDGE/BADCOMMAND', BAD_COMMAND_VOICES);
		}

		this.level.spriteBank.add(undefined, {
			tag: 'cursor',
			animation: 'GAME/ANIZ/TARGETCURSOR',
			images: 'GAME/IMAGEZ/LIGHTING/TARGETCURSOR',
			color: info.targetEnemyGrunt
				? '#aa0000'
				: info.useToy
				? '#ff00aa'
				: info.useTool
				? '#0066ff'
				: '#00aa00',
			position: coordToPosition(target),
			zIndex: 300300,
			time: this.level.registry.time,
			cleanup: true,
		});
	}
	navigateGrunts(target: Point, info: ClickInfo, grunts: Grunt[]) {
		const flood = this.level.controllers.Grunt.getFlood(grunts[0], target);
		const Grunt = this.level.controllers.Grunt;
		const movingGrunts = grunts.filter(grunt => {
			const coord = grunt.coord;
			const isRangedTool = this.level.controllers.GruntAttack.canUseRangedTool(grunt, target);
			return flood.findPath(coord) || isRangedTool;
		});
		if (movingGrunts.length == 0) {
			return [];
		}
		const mesh = flood.getMesh();
		movingGrunts
			.sort((a, b) => flood.getDistance(a.coord) - flood.getDistance(b.coord))
			.forEach(grunt => {
				this.level.controllers.GruntMove.walk(grunt, {
					mesh,
					useTool: info.useTool,
					useToy: info.useToy,
					target,
					enemyId: info.targetEnemyGrunt?.id,
				});
			});
		return movingGrunts;
	}
	speakSelect(info: ClickInfo, grunt: Grunt) {
		let voices = SELECT_VOICES;
		if (info.directGrunt) {
			if (this.angryGrunt?.grunt == info.directGrunt) {
				this.angryGrunt.count++;
				if (this.angryGrunt.count > 4) {
					voices = LITERALLY_FUMING_SELECT_VOICES;
				} else if (this.angryGrunt.count > 2) {
					voices = ANGRY_SELECT_VOICES;
				}
			} else {
				this.angryGrunt = {
					grunt: info.directGrunt,
					count: 0,
				};
			}
		}
		const view = this.level.views.Grunt as GruntView;
		view.speak(grunt, 'VOICES/ACKNOWLEDGE/SELECTGRUNT', voices);
	}
	speakCommand(info: ClickInfo, grunt: Grunt) {
		const view = this.level.views.Grunt as GruntView;
		if (info.targetEnemyGrunt) {
			view.speak(grunt, 'VOICES/ACKNOWLEDGE/COMMANDATTACK', ATTACK_COMMAND_VOICES);
		} else {
			view.speak(grunt, 'VOICES/ACKNOWLEDGE/GOODCOMMAND', GOOD_COMMAND_VOICES);
		}
	}
}
