import { BaseLogic } from 'client/logic/Logic';
import { Point } from 'client/utils/Point';

export interface SavedMap {
	name: string;
	path: string;
	area: string;
	stage: number;
	logics: BaseLogic[];
	width: number;
	height: number;
	tiles: number[];
	start: Point;
	back?: {
		tiles: number[];
		width: number;
		height: number;
	};
	intro?: string;
	music?: string;
}
