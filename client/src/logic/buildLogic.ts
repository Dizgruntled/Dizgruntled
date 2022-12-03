import { AI, COLORS, DIRECTIONS } from 'client/data/data';
import { getToolInfo } from 'client/data/GruntInfo';
import { BaseLogic } from 'client/logic/Logic';
import { getPickupItem, getPickupItemFromImage, TOOLS, TOYS } from 'client/logic/Pickup';
import { positionToCoord, snapPosition, TILE_SIZE } from 'client/utils/math';
import { LogicRez } from 'client/rez/getWorldRez';
import { RezFile } from 'client/rez/RezFile';
import { getHelpText } from 'client/data/HelpText';

const AMBIENT_PREFIX = 'AREA1/ANIZ/AMBIENT_';

const AI_TOOLS = {
	Bomber: 'BOMB',
	Brick: 'BRICK',
	Gauntletz: 'GAUNTLETZ',
	Goober: 'GOOBER',
	Shovel: 'SHOVEL',
	TimeBomb: 'TIMEBOMB',
	Wand: 'WAND',
};
const TEAM_COLORS = ['ORANGE', 'GREEN', 'BLUE', 'RED'];

function getLinks(data: RezFile) {
	const links: number[] = [];
	for (let i = 0; i <= 2; i++) {
		const rect = data.readRect(i * 4);
		if (rect.left) {
			links.push(rect.left);
		}
		if (rect.top) {
			links.push(rect.top);
		}
		if (rect.right) {
			links.push(rect.right);
		}
		if (rect.bottom) {
			links.push(rect.bottom);
		}
	}
	return links.map(id => ({
		x: (id - (id % 256)) / 256,
		y: id % 256,
	}));
}

const builders = {
	BehindCandy(logic: LogicRez) {
		return { kind: 'EyeCandy', graphic: logic.graphic, behind: true };
	},
	BehindCandyAni(logic: LogicRez) {
		return {
			kind: 'EyeCandy',
			animate: true,
			animation: logic.animation,
			graphic: logic.graphic,
			behind: true,
		};
	},
	Brickz(logic: LogicRez, data: RezFile) {
		const moveRect = data.readRect(0);
		return {
			kind: 'Brickz',
			hidden: [
				moveRect.left == 0,
				moveRect.top == 0,
				moveRect.right == 0,
				moveRect.bottom == 0,
			],
			value: [],
			position: snapPosition(data.readPosition()),
		};
	},
	CheckpointTrigger(logic: LogicRez, data: RezFile) {
		return {
			kind: 'CheckpointFlag',
			position: snapPosition(data.readPosition()),
			links: getLinks(data),
			reached: false,
		};
	},
	CoveredPowerup(logic: LogicRez, data: RezFile) {
		const powerup = data.readPowerup();
		const tile = data.readSmarts();
		const score = data.readScore();
		const megaphoneItem = getPickupItem(data.readPoints());
		const item = getPickupItem(powerup);
		return {
			kind: 'HiddenPickup',
			item,
			tile,
			position: snapPosition(data.readPosition()),
			megaphoneOrder: item == 'TOYBOX' ? undefined : score,
			megaphoneItem,
			spell: item == 'SCROLL' ? data.readFaceDir() : undefined,
		};
	},
	DoNothing(logic: LogicRez, data: RezFile) {
		return { kind: 'EyeCandy', graphic: logic.graphic, behind: true };
	},
	EyeCandy(logic: LogicRez) {
		return { kind: 'EyeCandy', graphic: logic.graphic, behind: false };
	},
	EyeCandyAni(logic: LogicRez) {
		return {
			kind: 'EyeCandy',
			animate: true,
			animation: logic.animation,
			graphic: logic.graphic,
			behind: false,
		};
	},
	ExitTrigger(logic: LogicRez, data: RezFile) {
		return {
			kind: 'Fort',
			team: data.readSmarts(),
			position: snapPosition(data.readPosition()),
			animation: 'IDLE',
		};
	},
	FortressFlag(logic: LogicRez, data: RezFile) {
		return { kind: 'FortressFlag', team: data.readSmarts() };
	},
	GiantRock(logic: LogicRez, data: RezFile) {
		const moveRect = data.readRect(0);
		const hitRect = data.readRect(4);
		const attackRect = data.readRect(8);
		const megaphoneOrder = data.readScore();
		const megaphoneItem = getPickupItem(data.readPoints());
		const item = getPickupItem(data.readPowerup());
		const effectTime = item == 'SCROLL' ? undefined : data.readFaceDir();
		return {
			kind: 'GiantRock',
			tiles: [
				moveRect.left,
				moveRect.top,
				moveRect.right,
				hitRect.left,
				hitRect.top,
				hitRect.right,
				attackRect.left,
				attackRect.top,
				attackRect.right,
			],
			position: snapPosition(data.readPosition()),
			megaphoneItem,
			megaphoneOrder,
			item,
			effectTime,
			spell: item == 'SCROLL' ? data.readFaceDir() : undefined,
			toy: item == 'TOYBOX' ? data.readFaceDir() : undefined,
			team: item == 'TOYBOX' ? data.readSmarts() : undefined,
		};
	},
	GlobalAmbientSound(logic: LogicRez, data: RezFile) {
		const moveRect = data.readRect(0);
		return {
			kind: 'Sound',
			sound: logic.animation.substring(AMBIENT_PREFIX.length),
			volume: data.readDamage() / 100,
			rect: {
				left: data.readMinX(),
				right: data.readMaxX(),
				top: data.readMinY(),
				bottom: data.readMaxY(),
			},
			playTimes: [moveRect.left, moveRect.top],
			pauseTimes: [moveRect.right, moveRect.bottom],
			paused: moveRect.right > 0,
		};
	},
	GruntCreationPoint(logic: LogicRez, data: RezFile) {
		return {
			kind: 'GruntCreationPoint',
			team: data.readPoints(),
			position: snapPosition(data.readPosition()),
		};
	},
	GruntPuddle(logic: LogicRez, data: RezFile) {
		return {
			kind: 'GruntPuddle',
			color: COLORS[data.readPoints()],
			position: snapPosition(data.readPosition()),
		};
	},
	GruntStartingPoint(logic: LogicRez, data: RezFile) {
		const ai = AI[data.readPoints()];
		const powerup = data.readPowerup();
		const damage = data.readDamage();
		const team = data.readSmarts();
		const color = !ai && team > 0 ? TEAM_COLORS[team] : COLORS[data.readPoints()];
		const tool = AI_TOOLS[ai] ?? (powerup ? TOOLS[powerup - 1] : undefined);
		const info = getToolInfo(tool);
		const alertDistance = data.readDirection() || undefined;
		const wanderRect = data.readRect(0);
		const position = snapPosition(data.readPosition());
		const guardPoint =
			ai == 'ObjectGuard'
				? {
						x: data.readMinX(),
						y: data.readMaxX(),
				  }
				: positionToCoord(position);
		return {
			kind: 'Grunt',
			facing: 'SOUTH',
			tool,
			toy: damage ? TOYS[damage - 23] : undefined,
			color,
			ai,
			team,
			health: 20,
			stamina: 20,
			flight: 20,
			alertDistance,
			wanderRect,
			guardPoint,
			action: {
				kind: team == 0 ? 'Enter' : 'Idle',
			},
			position:
				// data.readSmarts() == 0
				// ? snapPosition({ x: 4 * 32, y: 4 * 32 })
				// :
				position,
			rate: info.rate,
			actionTime: 0,
		};
	},
	GuardPoint(logic: LogicRez, data: RezFile) {
		return { kind: 'GuardPoint', position: snapPosition(data.readPosition()) };
	},
	InGameIcon(logic: LogicRez, data: RezFile) {
		const item = getPickupItemFromImage(logic.graphic);
		const megaphoneOrder = data.readScore();
		const megaphoneItem = getPickupItem(data.readPoints());
		const respawnTime = data.readDamage();
		const effectTime = item == 'SCROLL' || item == 'WAND' ? undefined : data.readFaceDir();
		return {
			kind: 'Pickup',
			item,
			position: snapPosition(data.readPosition()),
			megaphoneItem,
			megaphoneOrder,
			respawnTime,
			effectTime,
			toy: item == 'TOYBOX' ? data.readPoints() : undefined,
			team: item == 'TOYBOX' ? data.readScore() : undefined,
			spell: item == 'SCROLL' || item == 'WAND' ? data.readFaceDir() : undefined,
		};
	},

	InGameText(logic: LogicRez, data: RezFile) {
		const textOffset = data.readSmarts();
		return {
			kind: 'HelpBook',
			text: getHelpText(textOffset),
			position: snapPosition(data.readPosition()),
		};
	},

	KitchenSlime(logic: LogicRez, data: RezFile) {
		return {
			kind: 'Slime',
			direction: logic.graphic.substring(logic.graphic.lastIndexOf('_') + 1),
			start: positionToCoord(data.readPosition()),
			end: { x: data.readSpeedX(), y: data.readSpeedY() },
			target: { x: data.readSpeedX(), y: data.readSpeedY() },
			rate: data.readSpeed(),
			clockwise: data.readDirection() == 0,
			position: snapPosition(data.readPosition()),
			startTime: 0,
		};
	},

	ObjectDropper(logic: LogicRez, data: RezFile) {
		return {
			kind: 'ObjectDropper',
			cooldownTime: 0,
			direction: logic.graphic.substring(logic.graphic.lastIndexOf('_') + 1),
			rate: data.readSpeed(),
			position: snapPosition(data.readPosition()),
		};
	},

	RainCloud(logic: LogicRez, data: RezFile) {
		const points = [positionToCoord(data.readPosition())];
		for (let i = 0; i <= 2; i++) {
			const rect = data.readRect(i * 4);
			if (rect.left) {
				points.push({ x: rect.left, y: rect.top });
			}
			if (rect.right) {
				points.push({ x: rect.right, y: rect.bottom });
			}
		}
		return {
			kind: 'RainCloud',
			rate: data.readSpeed() || 1000,
			delay: data.readDamage(),
			points,
			position: snapPosition(data.readPosition()),
			startTime: 0,
			target: points[1],
		};
	},

	RollingBall(logic: LogicRez, data: RezFile) {
		const parts = logic.graphic.split('/');
		const direction = parts[2].substring(parts[2].indexOf('_') + 1);
		const dir = DIRECTIONS[direction];
		const position = snapPosition(data.readPosition());
		return {
			kind: 'RollingBall',
			direction,
			position,
			rate: data.readSpeed() || 1000,
			startTime: 0,
			target: {
				x: dir.x * TILE_SIZE + position.x,
				y: dir.y * TILE_SIZE + position.y,
			},
		};
	},
	SecretLevelTrigger(logic: LogicRez, data: RezFile) {
		return { kind: 'SecretLevelTrigger', position: snapPosition(data.readPosition()) };
	},
	SecretTeleporterTrigger(logic: LogicRez, data: RezFile) {
		return {
			kind: 'WormholeTrigger',
			enter: { x: data.readScore(), y: data.readPoints() },
			exit: { x: data.readPowerup(), y: data.readDamage() },
			target: { x: data.readSpeedX(), y: data.readSpeedY() },
			duration: data.readSpeed(),
			position: snapPosition(data.readPosition()),
		};
	},
	SpotLight(logic: LogicRez, data: RezFile) {
		return {
			kind: 'SpotLight',
			actionTime: 0,
			radius: data.readSmarts(),
			rate: data.readDamage(),
			clockwise: data.readDirection() == 1,
			position: snapPosition(data.readPosition()),
		};
	},
	StaticHazard(logic: LogicRez, data: RezFile) {
		const delay = data.readPoints();
		return {
			kind: 'StaticHazard',
			delay,
			idle: delay > 0,
			period: data.readDamage(),
			position: snapPosition(data.readPosition()),
		};
	},
	Teleporter(logic: LogicRez, data: RezFile) {
		return {
			kind: 'Wormhole',
			position: snapPosition(data.readPosition()),
			target: { x: data.readSpeedX(), y: data.readSpeedY() },
			type: data.readSmarts() == 1 ? 'Blue' : 'Green',
			state: 'Open',
		};
	},
	TileSecretTrigger(logic: LogicRez, data: RezFile) {
		return {
			kind: 'Trigger',
			delay: data.readPoints(),
			tile: data.readSmarts(),
			duration: data.readDamage(),
			links: getLinks(data),
			position: snapPosition(data.readPosition()),
			pressed: false,
		};
	},
	TileTrigger(logic: LogicRez, data: RezFile) {
		const duration = data.readDamage();
		const release = data.readHealth();
		return {
			kind: 'Trigger',
			delay: data.readPoints(),
			duration,
			release: release > 0 ? release : duration,
			links: getLinks(data),
			position: snapPosition(data.readPosition()),
		};
	},
	TileTriggerSwitch(logic: LogicRez, data: RezFile) {
		return {
			kind: 'Switch',
			disabled: false,
			pressed: false,
			item: data.readSmarts(),
			links: getLinks(data),
			position: snapPosition(data.readPosition()),
		};
	},
	ToobSpikez(logic: LogicRez, data: RezFile) {
		return {
			kind: 'ToobSpikez',
			direction: logic.graphic.endsWith('HORIZ') ? 'HORIZ' : 'VERT',
			position: snapPosition(data.readPosition()),
		};
	},
	UFO(logic: LogicRez, data: RezFile) {
		const points = [positionToCoord(data.readPosition())];
		for (let i = 0; i <= 2; i++) {
			const rect = data.readRect(i * 4);
			if (rect.left) {
				points.push({ x: rect.left, y: rect.top });
			}
			if (rect.right) {
				points.push({ x: rect.right, y: rect.bottom });
			}
		}
		return {
			kind: 'UFO',
			rate: data.readSpeed() || 1000,
			delay: data.readDamage(),
			rotateRate: data.readFaceDir() || 3000,
			rotateStartTime: 0,
			clockwise: data.readDirection() == 1,
			points,
			position: snapPosition(data.readPosition()),
			startTime: 0,
			target: points[1],
		};
	},
	VoiceTrigger(logic: LogicRez, data: RezFile) {
		return {
			kind: 'Voice',
			position: snapPosition(data.readPosition()),
			rect: data.readRect(0),
			group: data.readSmarts() - 811,
			variant: data.readHealth(),
			spoken: false,
		};
	},
	WayPoint(logic: LogicRez, data: RezFile) {
		return {
			kind: 'WayPoint',
			position: snapPosition(data.readPosition()),
		};
	},
};

export function buildLogic(logicRez: LogicRez): BaseLogic | undefined {
	const builder = builders[logicRez.kind];
	if (!builder) {
		console.warn('Missing logic', logicRez.kind);
		return undefined;
	}
	const data = new RezFile(logicRez.data.buffer);
	const logic = builder(logicRez, data);
	if (!logic) {
		return undefined;
	}
	return {
		id: 0,
		position: data.readPosition(),
		coord: positionToCoord(data.readPosition()),
		...logic,
	};
}
