import { Level } from 'client/game/Level';
import { BrickzView } from 'client/views/BrickzView';
import { CheckpointFlagView } from 'client/views/CheckpointFlagView';
import { EyeCandyView } from 'client/views/EyeCandyView';
import { FortressFlagView } from 'client/views/FortressFlagView';
import { FortView } from 'client/views/FortView';
import { GruntCreationPointView } from 'client/views/GruntCreationPointView';
import { GruntPuddleView } from 'client/views/GruntPuddleView';
import { GruntView } from 'client/views/GruntView';
import { HelpBookView } from 'client/views/HelpBookView';
import { ObjectDropperView } from 'client/views/ObjectDropperView';
import { PickupView } from 'client/views/PickupView';
import { PoopView } from 'client/views/PoopView';
import { ProjectileView } from 'client/views/ProjectileView';
import { RainCloudView } from 'client/views/RainCloudView';
import { RollingBallView } from 'client/views/RollingBallView';
import { SlimeView } from 'client/views/SlimeView';
import { SoundView } from 'client/views/SoundView';
import { SpotLightView } from 'client/views/SpotLightView';
import { StaticHazardView } from 'client/views/StaticHazardView';
import { SwitchView } from 'client/views/SwitchView';
import { TeamView } from 'client/views/TeamView';
import { TimeBombView } from 'client/views/TimeBombView';
import { ToobSpikezView } from 'client/views/ToobSpikezView';
import { UFOView } from 'client/views/UFOView';
import { WormholeView } from 'client/views/WormholeView';
import { LogicView } from './LogicView';

export function getLogicViews(level: Level) {
	const views: { [kind: string]: LogicView<any> } = {};

	views.Brickz = new BrickzView(level);
	views.CheckpointFlag = new CheckpointFlagView(level);
	views.EyeCandy = new EyeCandyView(level);
	views.FortressFlag = new FortressFlagView(level);
	views.Fort = new FortView(level);
	views.GruntCreationPoint = new GruntCreationPointView(level);
	views.GruntPuddle = new GruntPuddleView(level);
	views.Grunt = new GruntView(level);
	views.HelpBook = new HelpBookView(level);
	views.ObjectDropper = new ObjectDropperView(level);
	views.Poop = new PoopView(level);
	views.Pickup = new PickupView(level);
	views.Projectile = new ProjectileView(level);
	views.RainCloud = new RainCloudView(level);
	views.RollingBall = new RollingBallView(level);
	views.Slime = new SlimeView(level);
	views.Sound = new SoundView(level);
	views.SpotLight = new SpotLightView(level);
	views.StaticHazard = new StaticHazardView(level);
	views.Switch = new SwitchView(level);
	views.Team = new TeamView(level);
	views.TimeBomb = new TimeBombView(level);
	views.ToobSpikez = new ToobSpikezView(level);
	views.UFO = new UFOView(level);
	views.Wormhole = new WormholeView(level);

	return views;
}
