import { Rect } from 'client/utils/math';
import { TileMap } from 'client/utils/TileStack';
import { Point } from 'client/utils/Point';
import { TeamStats } from 'client/game/GameHooks';

export interface BaseLogic {
	id: number;
	kind: string;
	position: Point;
	coord: Point;
}

export interface Brickz extends BaseLogic {
	kind: 'Brickz';
	hidden: boolean[];
	value: string;
}

export interface CheckpointFlag extends BaseLogic {
	kind: 'CheckpointFlag';
	links: Point[];
	reached: boolean;
}

export interface EyeCandy extends BaseLogic {
	kind: 'EyeCandy';
	animate: boolean;
	animation?: string;
	graphic: string;
	behind: boolean;
}

export interface Fort extends BaseLogic {
	kind: 'Fort';
	team: number;
	animation: string;
}

export interface FortressFlag extends BaseLogic {
	kind: 'Fortress';
	team: number;
}

export interface DeathAction {
	kind: 'Death';
	death: string;
}

export interface MoveAction {
	kind: 'Move';
	target: Point;
	startTime: number;
	run?: boolean;
}

export interface WinAction {
	kind: 'Win';
}

export interface EnterAction {
	kind: 'Enter';
	drop?: boolean;
}

export interface PickupAction {
	kind: 'Pickup';
	item: string;
}
export interface ToolAction {
	kind: 'Tool';
	variant?: number;
}
export interface PlayAction {
	kind: 'Play';
	break?: boolean;
	own?: boolean;
	toy: string;
	spell?: number;
	rate?: number;
	target?: Point;
	distance?: number;
}
export interface AttackAction {
	kind: 'Attack';
	variant: number;
}
export interface IdleAction {
	kind: 'Idle';
}
export interface AttackIdleAction {
	kind: 'AttackIdle';
}
export interface StruckAction {
	kind: 'Struck';
	variant: number;
	target?: Point;
}

export interface FollowTask {
	kind: 'Follow';
	gruntId: number;
}
export interface FleeTask {
	kind: 'Flee';
	enemyId: number;
}
export interface WalkTask {
	kind: 'Walk';
	mesh: TileMap<number>;
	target: Point;
	enemyId?: number;
	useTool: boolean;
	useToy: boolean;
}

export interface Grunt extends BaseLogic {
	kind: 'Grunt';
	alertDistance?: number;
	facing: string;
	brick?: string;
	tool?: string;
	toy?: string;
	spell?: number;
	powerup?: string;
	color: string;
	ai?: string;
	health: number;
	stamina: number;
	toyTime?: number;
	flight?: number;
	flying?: boolean;
	team: number;
	rate: number;
	action:
		| IdleAction
		| MoveAction
		| DeathAction
		| PickupAction
		| WinAction
		| EnterAction
		| ToolAction
		| PlayAction
		| AttackAction
		| AttackIdleAction
		| StruckAction;
	actionTime: number;
	task?: FleeTask | FollowTask | WalkTask;
	wanderRect?: Rect;
	guardPoint?: Point;
}

export interface GruntCreationPoint extends BaseLogic {
	kind: 'GruntCreationPoint';
	team: number;
}

export interface GruntPuddle extends BaseLogic {
	kind: 'GruntPuddle';
	color: string;
	actionTime?: number;
}

export interface HelpBook extends BaseLogic {
	kind: 'HelpBook';
	text: string;
}

export interface HiddenPickup extends BaseLogic {
	kind: 'HiddenPickup';
	item?: string;
	team?: number;
	toy?: string;
	megaphoneOrder?: number;
	megaphoneItem?: string;
	tile: number;
	spell?: number;
}

export interface Projectile extends BaseLogic {
	kind: 'Projectile';
	type: string;
	damage: number;
	damagedGrunts: number[];
	direction?: string;
	duration: number;
	ownerId: number;
	target: Point;
	startTime: number;
	state: 'Fly' | 'Fall' | 'Impact';
}

export interface TimeBomb extends BaseLogic {
	kind: 'TimeBomb';
	fast: boolean;
}

export interface Trigger extends BaseLogic {
	kind: 'Trigger';
	delay?: number;
	duration?: number;
	release?: number;
	tile?: number;
	links: Point[];
}

export interface GiantRock extends BaseLogic {
	kind: 'GiantRock';
	tiles: number[];
	megaphoneOrder?: number;
	megaphoneItem?: string;
	item?: string;
	effectTime?: number;
	spell?: number;
	toy?: string;
	team?: number;
}

export interface ObjectDropper extends BaseLogic {
	kind: 'ObjectDropper';
	direction: string;
	rate: number;
	startTime: number;
	cooldownTime: number;
	target: Point;
}
export interface Poop extends BaseLogic {
	kind: 'Poop';
	hit: boolean;
	actionTime: number;
}

export interface Pickup extends BaseLogic {
	kind: 'Pickup';
	item: string;
	team?: number;
	toy?: string;
	megaphoneItem?: string;
	megaphoneOrder?: number;
	respawnTime?: number;
	effectTime?: number;
	spell?: number;
}

export interface RainCloud extends BaseLogic {
	kind: 'RainCloud';
	rate: number;
	delay: number;
	points: Point[];
	target?: Point;
	startTime: number;
}

export interface RollingBall extends BaseLogic {
	kind: 'RollingBall';
	death?: string;
	direction: string;
	rate: number;
	startTime: number;
	target: Point;
}

export interface Sound extends BaseLogic {
	kind: 'Sound';
	volume: number;
	rect: Rect;
	sound: string;
	paused: boolean;
	playTimes: number[];
	pauseTimes: number[];
}

export interface SpotLight extends BaseLogic {
	kind: 'SpotLight';
	actionTime: number;
	pauseTime?: number;
	radius: number;
	rate: number;
	clockwise: boolean;
}
export interface Slime extends BaseLogic {
	kind: 'Slime';
	direction: string;
	start: Point;
	end: Point;
	rate: number;
	target: Point;
	startTime: number;
	clockwise: boolean;
}

export interface StaticHazard extends BaseLogic {
	kind: 'StaticHazard';
	delay: number;
	idle: boolean;
	period: number;
}

export interface Team extends BaseLogic {
	kind: 'Team';
	index: number;
	color: string;
	gooCount: number;
	ovens: boolean[];
	slots: (
		| {
				item: string;
				time: number;
		  }
		| undefined
	)[];
	megaphoneItems: string[];
	megaphoneOffset: number;
	warpstoneCount: number;
	stats: TeamStats;
	won?: boolean;
}

export interface ToobSpikez extends BaseLogic {
	kind: 'ToobSpikez';
	direction: string;
}

export interface Switch extends BaseLogic {
	kind: 'Switch';
	disabled: boolean;
	pressed: boolean;
	item?: number;
	links: Point[];
}

export interface Wormhole extends BaseLogic {
	kind: 'Wormhole';
	duration?: number;
	exit?: Point;
	ephemeral?: boolean;
	type: 'Red' | 'Blue' | 'Green';
	state: 'Opening' | 'Open' | 'Closing';
	target: Point;
}

export interface WormholeTrigger extends BaseLogic {
	kind: 'WormholeTrigger';
	enter: Point;
	exit: Point;
	target: Point;
	duration: number;
}

export interface UFO extends BaseLogic {
	kind: 'UFO';
	rate: number;
	delay: number;
	rotateRate: number;
	rotateStartTime: number;
	clockwise: boolean;
	points: Point[];
	startTime: number;
	target?: Point;
}

export interface Voice extends BaseLogic {
	kind: 'Voice';
	rect: Rect;
	group: number;
	variant: number;
	spoken: boolean;
}
