import { BrickzController } from 'client/controllers/BrickzController';
import { CheckpointFlagController } from 'client/controllers/CheckpointFlagController';
import { FortController } from 'client/controllers/FortController';
import { GiantRockController } from 'client/controllers/GiantRockController';
import { AIController } from 'client/controllers/grunt/AIController';
import { AttackController } from 'client/controllers/grunt/AttackController';
import { DeathController } from 'client/controllers/grunt/DeathController';
import { MoveController } from 'client/controllers/grunt/MoveController';
import { TileController } from 'client/controllers/grunt/TileController';
import { ToolController } from 'client/controllers/grunt/ToolController';
import { ToyController } from 'client/controllers/grunt/ToyController';
import { GruntPuddleController } from 'client/controllers/GruntPuddleController';
import { HiddenPickupController } from 'client/controllers/HiddenPickupController';
import { ObjectDropperController } from 'client/controllers/ObjectDropperController';
import { PickupController } from 'client/controllers/PickupController';
import { PoopController } from 'client/controllers/PoopController';
import { ProjectileController } from 'client/controllers/ProjectileController';
import { RainCloudController } from 'client/controllers/RainCloudController';
import { RollingBallController } from 'client/controllers/RollingBallController';
import { SlimeController } from 'client/controllers/SlimeController';
import { SoundController } from 'client/controllers/SoundController';
import { SpotLightController } from 'client/controllers/SpotLightController';
import { StaticHazardController } from 'client/controllers/StaticHazardController';
import { SwitchController } from 'client/controllers/SwitchController';
import { TeamController } from 'client/controllers/TeamController';
import { TimeBombController } from 'client/controllers/TimeBombController';
import { TriggerController } from 'client/controllers/TriggerController';
import { UFOController } from 'client/controllers/UFOController';
import { VoiceController } from 'client/controllers/VoiceController';
import { WormholeController } from 'client/controllers/WormholeController';
import { WormholeTriggerController } from 'client/controllers/WormholeTriggerController';
import { GruntController } from '../controllers/GruntController';
import { Registry } from './Registry';

export interface LogicControllers {
	Brickz: BrickzController;
	CheckpointFlag: CheckpointFlagController;
	Fort: FortController;
	GiantRock: GiantRockController;
	Grunt: GruntController;
	GruntAI: AIController;
	GruntAttack: AttackController;
	GruntDeath: DeathController;
	GruntPuddle: GruntPuddleController;
	GruntMove: MoveController;
	GruntTile: TileController;
	GruntTool: ToolController;
	GruntToy: ToyController;
	HiddenPickup: HiddenPickupController;
	ObjectDropper: ObjectDropperController;
	Pickup: PickupController;
	Projectile: ProjectileController;
	RainCloud: RainCloudController;
	RollingBall: RollingBallController;
	Slime: SlimeController;
	SpotLight: SpotLightController;
	StaticHazard: StaticHazardController;
	Switch: SwitchController;
	Team: TeamController;
	TimeBomb: TimeBombController;
	Trigger: TriggerController;
	UFO: UFOController;
	Wormhole: WormholeController;
	WormholeTrigger: WormholeTriggerController;
	Voice: VoiceController;
}

export function getLogicControllers(registry: Registry) {
	const controllers: any = {};

	controllers.Brickz = new BrickzController('Brickz', registry, controllers);
	controllers.CheckpointFlag = new CheckpointFlagController(
		'CheckpointFlag',
		registry,
		controllers,
	);
	controllers.Fort = new FortController('Fort', registry, controllers);
	controllers.GiantRock = new GiantRockController('GiantRock', registry, controllers);
	controllers.Grunt = new GruntController('Grunt', registry, controllers);
	controllers.GruntAI = new AIController('GruntAI', registry, controllers);
	controllers.GruntAttack = new AttackController('GruntAttack', registry, controllers);
	controllers.GruntDeath = new DeathController('GruntDeath', registry, controllers);
	controllers.GruntMove = new MoveController('GruntMove', registry, controllers);
	controllers.GruntPuddle = new GruntPuddleController('GruntPuddle', registry, controllers);
	controllers.GruntTile = new TileController('GruntTile', registry, controllers);
	controllers.GruntTool = new ToolController('GruntTool', registry, controllers);
	controllers.GruntToy = new ToyController('GruntToy', registry, controllers);
	controllers.HiddenPickup = new HiddenPickupController('HiddenPickup', registry, controllers);
	controllers.ObjectDropper = new ObjectDropperController('ObjectDropper', registry, controllers);
	controllers.Pickup = new PickupController('Pickup', registry, controllers);
	controllers.Poop = new PoopController('Poop', registry, controllers);
	controllers.Projectile = new ProjectileController('Projectile', registry, controllers);
	controllers.RainCloud = new RainCloudController('RainCloud', registry, controllers);
	controllers.RollingBall = new RollingBallController('RollingBall', registry, controllers);
	controllers.Slime = new SlimeController('Slime', registry, controllers);
	controllers.Sound = new SoundController('Sound', registry, controllers);
	controllers.SpotLight = new SpotLightController('SpotLight', registry, controllers);
	controllers.StaticHazard = new StaticHazardController('StaticHazard', registry, controllers);
	controllers.Switch = new SwitchController('Switch', registry, controllers);
	controllers.Team = new TeamController('Team', registry, controllers);
	controllers.TimeBomb = new TimeBombController('TimeBomb', registry, controllers);
	controllers.Trigger = new TriggerController('Trigger', registry, controllers);
	controllers.UFO = new UFOController('UFO', registry, controllers);
	controllers.Wormhole = new WormholeController('Wormhole', registry, controllers);
	controllers.WormholeTrigger = new WormholeTriggerController(
		'WormholeTrigger',
		registry,
		controllers,
	);
	controllers.Voice = new VoiceController('Voice', registry, controllers);

	return controllers as LogicControllers;
}
