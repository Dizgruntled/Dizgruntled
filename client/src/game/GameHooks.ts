export interface SaveMetadata {
	name: string;
	path: string;
	time: number;
	description: string;
}

export interface TeamStats {
	time: number;
	survivorz: number;
	deathz: number;
	toolz: number;
	totalToolz: number;
	toyz: number;
	totalToyz: number;
	powerupz: number;
	totalPowerupz: number;
	coinz: number;
	totalCoinz: number;
	secretz: number;
	totalSecretz: number;
	letterz: string;
}

export interface GameHooks {
	quit: () => void;
	setHelpText: (text: string) => void;
	save: (metadata: SaveMetadata, overwrite?: boolean) => void;
	showSaveDialog: (metadata: SaveMetadata) => void;
	showLoadDialog: () => void;
	showStats: (teamStats: TeamStats) => void;
}
