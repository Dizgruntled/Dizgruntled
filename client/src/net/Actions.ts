import { Point } from 'client/util/Point';

export interface MoveGruntz {
	kind: 'MoveGruntz';
	gruntz: number[];
	target: Point;
	enemyId?: number;
}

export interface UseItem {
	kind: 'UseTool';
	grunt: number;
	item: string;
	target: Point;
	enemyId?: number;
}

export interface SpawnGrunt {
	kind: 'SpawnGrunt';
	target: Point;
}

export interface AwardItem {
	kind: 'AwardItem';
	grunt: number;
	slot: Point;
}
