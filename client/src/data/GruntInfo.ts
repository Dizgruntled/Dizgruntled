export interface ToolInfo {
	damage: number;
	deathDuration?: number[];
	itemDuration?: number[];
	attackDelay?: number[];
	attackIdleDelay?: number[];
	struckDelay?: number[];
	itemRecharge?: number;
	healthLoss?: number;
	rate: number;
	recharge: number;
	range?: number;
	throwDuration?: number;
	attackSounds?: string[];
}

export const WATER_TOOLS = ['TOOB', 'TOOBWATER', 'WINGZ'];
export const RANGED_TOOLS = ['BOOMERANG', 'NERFGUN', 'ROCK', 'GUNHAT', 'WELDER', 'WINGZ'];

export const ToolInfos: { [name: string]: ToolInfo } = {
	NORMAL: {
		attackDelay: [290],
		attackIdleDelay: [350],
		struckDelay: [430],
		recharge: 2000,
		rate: 600,
		damage: 1,
	},
	REAPER: {
		attackDelay: [700],
		attackIdleDelay: [700],
		struckDelay: [430],
		recharge: 0,
		rate: 800,
		damage: 100,
	},
	HAREKRISHNA: {
		attackDelay: [600],
		attackIdleDelay: [400],
		recharge: 0,
		rate: 600,
		damage: 0,
	},
	BOMB: {
		attackDelay: [1500],
		attackIdleDelay: [450],
		struckDelay: [430],
		recharge: 0,
		rate: 600,
		damage: 1,
	},
	BOOMERANG: {
		attackDelay: [400],
		attackIdleDelay: [320],
		attackSounds: ['BOOMERANGGRUNT/BOOMERANGZGRUNTPS1', 'BOOMERANGGRUNT/BOOMERANGZGRUNTPS2'],
		struckDelay: [240],
		recharge: 6000,
		throwDuration: 500,
		rate: 600,
		range: 6,
		damage: 6,
	},
	BRICK: {
		attackDelay: [430],
		attackIdleDelay: [230],
		deathDuration: [3200],
		struckDelay: [420],
		recharge: 2500,
		itemRecharge: 15000,
		rate: 600,
		damage: 4,
	},
	CLUB: {
		attackDelay: [370],
		attackIdleDelay: [350],
		struckDelay: [550],
		recharge: 3500,
		rate: 600,
		damage: 8,
		attackSounds: ['NORMALGRUNT/SWINGLOW1', 'NORMALGRUNT/SWINGLOW2'],
	},
	GAUNTLETZ: {
		attackDelay: [300, 430],
		attackIdleDelay: [300, 430],
		struckDelay: [430, 430],
		recharge: 2750,
		itemRecharge: 2750,
		rate: 600,
		damage: 5,
	},
	GLOVEZ: {
		attackDelay: [200],
		attackIdleDelay: [280],
		struckDelay: [430],
		recharge: 2000,
		rate: 600,
		damage: 1,
	},
	GOOBER: {
		attackDelay: [250],
		attackIdleDelay: [270],
		deathDuration: [2730],
		struckDelay: [590],
		recharge: 2250,
		itemRecharge: 2250,
		rate: 600,
		damage: 2,
	},
	GRAVITYBOOTZ: {
		attackDelay: [475],
		attackIdleDelay: [475],
		struckDelay: [430],
		recharge: 2250,
		rate: 600,
		damage: 3,
	},
	GUNHAT: {
		attackDelay: [360],
		attackIdleDelay: [200],
		struckDelay: [310],
		deathDuration: [1200],
		recharge: 10000,
		rate: 600,
		range: 6,
		throwDuration: 1800,
		damage: 10,
		attackSounds: ['GUNHATGRUNT/GUNHATGRUNTA1'],
	},
	NERFGUN: {
		attackDelay: [350],
		attackIdleDelay: [350],
		recharge: 5000,
		struckDelay: [430],
		throwDuration: 1800,
		rate: 600,
		range: 5,
		damage: 1,
	},
	ROCK: {
		attackDelay: [300],
		attackIdleDelay: [340],
		deathDuration: [2310],
		struckDelay: [490],
		recharge: 8000,
		rate: 600,
		range: 4,
		throwDuration: 1000,
		damage: 8,
		attackSounds: ['ROCKGRUNT/ROCKZGRUNTI2'],
	},
	SHIELD: {
		attackDelay: [300],
		attackIdleDelay: [300],
		struckDelay: [430],
		recharge: 2000,
		rate: 600,
		damage: 1,
	},
	SHOVEL: {
		attackDelay: [300],
		attackIdleDelay: [330],
		struckDelay: [480],
		deathDuration: [1400],
		recharge: 3000,
		itemRecharge: 3000,
		rate: 600,
		damage: 6,
	},
	SPRING: {
		attackDelay: [525],
		attackIdleDelay: [525],
		struckDelay: [1900, 620],
		recharge: 2750,
		attackSounds: ['SPRINGGRUNT/SPRINGGRUNTA1S1', 'SPRINGGRUNT/SPRINGGRUNTA1S2'],
		rate: 720,
		damage: 5,
	},
	SPY: {
		attackDelay: [325],
		attackIdleDelay: [325],
		struckDelay: [430],
		recharge: 2500,
		itemRecharge: 5000,
		rate: 500,
		damage: 4,
	},
	SWORD: {
		attackDelay: [300],
		attackIdleDelay: [300],
		struckDelay: [430],
		deathDuration: [2100],
		recharge: 4000,
		rate: 600,
		damage: 10,
		attackSounds: ['NORMALGRUNT/SWINGHIGH1', 'NORMALGRUNT/SWINGHIGH2'],
	},
	TIMEBOMB: {
		attackDelay: [700],
		attackIdleDelay: [700],
		struckDelay: [430],
		recharge: 8000,
		rate: 600,
		damage: 0,
	},
	TOOB: {
		attackDelay: [340],
		attackIdleDelay: [340],
		struckDelay: [430],
		recharge: 2250,
		rate: 600,
		damage: 2,
		attackSounds: ['TOOBGRUNT/TOOBZGRUNTA1', 'TOOBGRUNT/TOOBZGRUNTA2'],
	},
	TOOBWATER: {
		attackDelay: [340],
		attackIdleDelay: [340],
		struckDelay: [430],
		recharge: 2250,
		rate: 1000,
		damage: 2,
		attackSounds: ['TOOBGRUNT/TOOBZWATERGRUNTA1'],
	},
	WAND: {
		attackDelay: [500],
		attackIdleDelay: [500],
		itemDuration: [5590, 1120],
		struckDelay: [430],
		recharge: 2000,
		itemRecharge: 15000,
		rate: 600,
		healthLoss: 25,
		damage: 0,
	},
	WARPSTONEZ: {
		recharge: 2000,
		rate: 800,
		damage: 0,
	},
	WELDER: {
		attackDelay: [250],
		attackIdleDelay: [250],
		struckDelay: [430],
		recharge: 15000,
		deathDuration: [2250],
		throwDuration: 1500,
		rate: 600,
		range: 4,
		damage: 20,
		attackSounds: ['WELDERGRUNT/WELDERZGRUNTA1S2'],
	},
	WINGZ: {
		attackDelay: [450],
		attackIdleDelay: [450],
		deathDuration: [3150],
		struckDelay: [430],
		recharge: 5000,
		rate: 600,
		range: 5,
		damage: 2,
	},
};

export function getToolInfo(item: string | undefined): ToolInfo {
	if (!item) {
		return ToolInfos.NORMAL;
	}
	return ToolInfos[item.startsWith('WARPSTONEZ') ? 'WARPSTONEZ' : item] ?? ToolInfos.NORMAL;
}

export interface ToyInfo {
	duration: number;
	breakDuration: number;
	rate?: number;
	tiles?: number;
}

export function getToyInfo(item: string): ToyInfo {
	return ToyInfos[item];
}

export const ToyInfos = {
	BABYWALKER: {
		duration: 5000,
		breakDuration: 2080,
		rate: 1200,
		tiles: 1,
	},
	BEACHBALL: {
		duration: 25000,
		breakDuration: 2080,
	},
	BIGWHEEL: {
		duration: 15000,
		breakDuration: 2080,
		rate: 600,
		tiles: 3,
	},
	GOKART: {
		duration: 20000,
		breakDuration: 2080,
		rate: 600,
		tiles: 4,
	},
	JACKINTHEBOX: {
		duration: 20000,
		breakDuration: 2080,
	},
	JUMPROPE: {
		duration: 15000,
		breakDuration: 2080,
	},
	POGOSTICK: {
		duration: 10000,
		breakDuration: 2080,
		rate: 600,
		tiles: 2,
	},
	SCROLL: {
		duration: 4200,
		breakDuration: 1700,
	},
	SQUEAKTOY: {
		duration: 10000,
		breakDuration: 2080,
	},
	YOYO: {
		duration: 5000,
		breakDuration: 2080,
	},
};

export const ProjectileRates = {
	Rock: 1000,
	Gunhat: 1500,
	Boomerang: 200,
	NerfGun: 1500,
	Welder: 1500,
	Wingz: 500,
};

// [Hazardz]
// CrumbleTileDelay                    = (DWORD)1000
// RollingBallrate               = (DWORD)1000
// ObjectDropperrate             = (DWORD)600 // 300
// ObjectDropperDelay                  = (DWORD)5000
// DroppedObjectrate             = (DWORD)200 // 100
// DroppedObjectYOffset                = 160
// SpotLightHazardTime                 = (DWORD)3000
// SpotLightHazardStopTime             = (DWORD)3000
// UFOSpotLightHazardStopTime          = (DWORD)500
// KitchenSlimerate              = (DWORD)2000
// RainCloudFlashTime                  = (DWORD)2000
// AniPad                              = 500

// [Grunt]
// IdleDelay                           = (DWORD)32000
// CombatTimeout                       = (DWORD)5000
// KnockBackrate                 = (DWORD)150
// RessurectAIType                     = 4 // Defender
// RessurectAIRadius                   = 2
// DecayTime                           = (DWORD)3000
// SafeFlashTime                       = 30
// EntranceSafeTime                    = (DWORD)7000
// MovingDeathTime                     = (DWORD)1000
// FadeTransparency                    = 128
// AccelerateFlash                     = 0
// PlayerDefenderRadius                = 2
//
