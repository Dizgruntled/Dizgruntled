export interface AreaInfo {
	id: number;
	staticHazardTime?: number;
	staticHazardKillTime?: number;
	staticHazardDeath?: string;
	staticHazardSound?: string;
	poopHitSound?: string;
	death?: string;
}

export function getAreaInfo(area: string) {
	const index = parseInt(area.substring(4), 10) - 1;
	return areaInfos[index];
}

const areaInfos: AreaInfo[] = [
	{
		death: 'SINK',
		id: 1,
	},
	{
		death: 'SINK',
		id: 2,
	},
	{
		staticHazardDeath: 'EXPLODE',
		staticHazardTime: 1050,
		staticHazardSound: 'LAVAGEYSER',
		poopHitSound: 'BIRDHAZARDHIT',
		death: 'BURN',
		id: 3,
	},
	{
		staticHazardDeath: 'EXPLODE',
		staticHazardTime: 2480,
		staticHazardSound: 'CANDLEUP',
		poopHitSound: 'PLANEHAZARDHIT',
		death: 'FALL',
		id: 4,
	},
	{
		staticHazardDeath: 'FALL',
		staticHazardKillTime: 1400,
		staticHazardTime: 4280,
		staticHazardSound: 'TRAPDOOROPEN',
		death: 'FALL',
		id: 5,
	},
	{
		staticHazardDeath: 'ELECTROCUTE',
		staticHazardTime: 1760,
		death: 'MELT',
		id: 6,
	},
	{
		staticHazardDeath: 'EXPLODE',
		staticHazardTime: 1560,
		death: 'SINK',
		id: 7,
	},
	{
		staticHazardDeath: 'EXPLODE',
		staticHazardTime: 1050,
		staticHazardSound: 'LAVAGEYSER',
		death: 'FALL',
		id: 8,
	},
];
