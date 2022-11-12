const helpText = new Map([
	[32771, `Gruntz`],
	[32772, `Copyright © 1998, Monolith Productions Inc.`],
	[32773, `Unable to set the game state.`],
	[32774, `Unable to restore the game.`],
	[32775, `Unable to change to the level.`],
	[32776, `Unable to set the video mode.`],
	[32777, `Unable to continue the game.`],
	[32778, `Unable to initialize the game.`],
	[32779, `Unable to load the resource file.`],
	[
		32780,
		`This version of Gruntz is still locked.  Please contact Monolith Productions via email at GruntzInfo@lith.com to unlock it.`,
	],
	[
		32781,
		`This version of Gruntz has expired.  Please contact Monolith Productions via email at GruntzInfo@lith.com for a newer version.`,
	],
	[
		32782,
		`The specified key is not correct.  Please contact Monolith Productions via email at GruntzInfo@lith.com for the correct key to unlock this version.`,
	],
	[
		32783,
		`This version of Gruntz is for registered alpha testers only and is still locked.  If you are a registered Gruntz alpha tester, please contact Monolith Productions via email at GruntzInfo@lith.com to obtain your unlock information.`,
	],
	[32784, `Unable to load the resource file.`],
	[32785, `Unable to initialize the engine.`],
	[32786, `Can't initialize the sound manager.`],
	[32787, `Can't initialize DirectSound.`],
	[32788, `Can't initialize DirectDraw.`],
	[32789, `Can't initialize the page manager.`],
	[32790, `Can't get the primary surface.  DirectX 5 is required.`],
	[32791, `Can't create the background page.`],
	[32792, `Can't create the work page.`],
	[32793, `Can't create the view page.`],
	[32794, `Unable to set the DirectDraw RGB format.`],
	[32795, `Unable to set the DirectDraw display mode.`],
	[32796, `Unable to get the DirectDraw capabilities.`],
	[32797, `Unable to set the DirectDraw cooperative level.`],
	[32798, `Unable to create the DirectDraw object.`],
	[32799, `Unable to change the color depth.`],
	[32800, `Unable to access the Gruntz CD-ROM.`],
	[32801, `Gruntz CD-ROM not found. Run in Spawn Mode?`],
	[32802, `Can't get game settings`],
	[32803, `Please insert the Gruntz CD-ROM into the drive.`],
	[32989, `Unable to find a trigger switch ID for the switch that was just pressed/depressed.`],
	[32990, `Unable to find a trigger ID that matches the smarts value of this switch.`],
	[32991, `Bad in-game text ID.`],
	[
		32992,
		`Congratulationz!  You just found the warpstone piece for this level!  Now bring it into the fort before the King loses all of his hair! -- Oh, wait, the King doesn't have any hair.`,
	],
	[32996, `Failed to add all the status bar items.`],
	[
		33032,
		`Welcome to the Gruntz training levelz!  Select a Grunt by LEFT-CLICKING on him, and then move him by RIGHT-CLICKING where you want to go.\n\n\nClick a mouse button or press any key to continue...`,
	],
	[33033, `Now go across the bridge.  Don't worry, Gruntz will not walk into water.`],
	[
		33034,
		`To progress past the checkered pyramidz and raise the checkered flag, a Grunt must stand on the pressure plate.`,
	],
	[
		33035,
		`The object of each level is to find the warpstone piece and take it into the fort where the King is patiently waiting.  If you forget it, or lose it, you will not be able to progress to the next level.`,
	],
	[
		33036,
		`This level will teach you how to use toolz.  If you look a bit to the north you will see a pair of GAUNTLETZ.  Go get them.  Don't forget to select your Grunt by LEFT-CLICKING on him first though!`,
	],
	[
		33037,
		`Your mouse cursor will change when you can use a tool.  To use the gauntletz, just move the mouse over something that looks breakable and LEFT-CLICK on it. HINT - try rockz!`,
	],
	[
		33038,
		`You need two Gruntz, one on each pressure plate, to move on.  Suck up all the goo puddlez and create a new Grunt from the Gruntz page on the status bar.  Let's see some TEAMWORK here!`,
	],
	[
		33039,
		`Gruntz can walk on spikez, but they will lose some health.  The longer Gruntz stand on the spikez, the more health they will lose, so try to avoid spikez whenever possible!`,
	],
	[
		33040,
		`With goober strawz, Gruntz can attack enemy Gruntz and suck up goo puddlez. To use the goober straw to suck up a goo puddle, just LEFT-CLICK on a goo puddle.`,
	],
	[
		33041,
		`When one of your Gruntz sucks up a puddle of goo, the goo will appear in your GOO WELL.  To see the well, click on the status bar tab with the small Grunt head on it.`,
	],
	[
		33042,
		`When your goo well is full, a new Grunt will bake in one of your empty GRUNT OVENZ.  You can create a new Grunt by LEFT-CLICKING on a fully baked Grunt oven and dropping him on a flashing pad!  BEWARE - when a Grunt is dropped onto a pad, he will squash anyone that is standing on that pad!`,
	],
	[
		33043,
		`If you ever get stuck or make a mistake and cannot finish the level, you can press the RED DESTRUCT BUTTON on the game tab on the status bar.  All of your Gruntz will blow up and you can try the level again.`,
	],
	[
		33044,
		`This level will teach you about combat basicz and toyz.  First go pick up the megaphone.`,
	],
	[
		33045,
		`Whenever a Grunt picks up a megaphone, a new item will come down from your GRUNT MACHINE.  You can then give this item to ANY of your Gruntz.  To see the Grunt machine, click on the status bar tab with the small shovel on it.`,
	],
	[
		33046,
		`Underneath that rock below is a SQUEAK TOY!  Toyz distract Gruntz.  If you haven't already done so, give your Grunt the gauntletz from the resource tab and then go break the rock.  You will need this toy to get past the next enemy Grunt.  He has a big CLUB so be sure not to attack him!`,
	],
	[
		33047,
		`If you RIGHT-CLICK on your Grunt, you will see his ACTION OPTIONZ.  The action optionz show what Tool and Toy a Grunt is carrying.  To close the action optionz box, just LEFT-CLICK anywhere outside of the box.`,
	],
	[33048, `This level will teach you about switchez, pyramidz, and puzzlez.`],
	[
		33049,
		`A CURVED ARROW on a switch means that it's a TOGGLE SWITCH.  This green toggle switch will toggle the green pyramidz up or down each time a Grunt steps on it.  Step on and off of it a few times to see how it works.`,
	],
	[
		33050,
		`A STRAIGHT ARROW on a switch means that it's a HOLD SWITCH.  You must keep a Grunt standing on this switch in order to keep the pyramidz down.  Step on and off of it a few times to see how it works.`,
	],
	[
		33051,
		`A black ONCE-ONLY SWITCH can only be activated once and will not come back up when a Gruntz steps off of it.  So look for the black pyramidz that might move before you tell a Grunt to step on it.`,
	],
	[
		33052,
		`Purple MULTIGRUNT SWITCHEZ require you to have a Grunt standing on each of them at the same time.`,
	],
	[33053, `When one orange UP-DOWN SWITCH goes down, another one goes up.`],
	[
		33054,
		`Silver TIMER SWITCHEZ keep silver pyramidz down for different lengths of time. Press it a few times until you learn the timing of the silver pyramidz. BE CAREFUL not to let the pyramidz come up onto a Grunt or he will be killed!`,
	],
	[
		33055,
		`When a Grunt walks onto an arrow, he will ONLY walk in the direction that the arrow is pointing.  Yellow switchez change the direction of the two-directional arrowz.`,
	],
	[
		33056,
		`BE CAREFUL not to let Gruntz on arrowz trample other Gruntz... they will squash them!`,
	],
	[
		33057,
		`Remember that if you get stuck or make a mistake and cannot finish the level, you can press the red DESTRUCT button on the game tab on the status bar and try again.`,
	],
	[
		33058,
		`You can attack an enemy Grunt by RIGHT-CLICKING on him.  You only need to right-click one time to fight.  After that, your Grunt will automatically keep fighting for you.  To insure victory, be sure to give your Grunt the gauntletz from the Grunt machine before you attack.`,
	],
	[
		33059,
		`Gruntz love Zap Cola!  A can of Zap Cola will give a Grunt a little health, a 2 liter bottle of Zap Cola will give a Grunt more health, and a keg of Zap Cola will give a Grunt full health!`,
	],
	[
		33060,
		`To see more of the map, move your cursor ALL THE WAY to one of the four edges of your monitor or use the arrow keyz.`,
	],
	[
		33061,
		`Remember, NEVER RIGHT-CLICK ON HOLEZ or your Gruntz will walk into them and die!  You can fill holez by using the shovel and LEFT-CLICKING on them.`,
	],
	[
		33062,
		`You have successfully completed the training levels and acquired all 4 warpstone pieces in the training area.  You are now ready to advance to Rocky Roadz.`,
	],
	[
		33063,
		`DON'T EVER RIGHT-CLICK ON HOLEZ or your Gruntz will walk into them and die!  If you have SHOVELZ, you can LEFT-CLICK to fill in holez, or to dig out moundz.  To see how shovelz work, try using the shovel on the dirt mound to the left, and on the hole to the right.`,
	],
	[33064, `Click a mouse button or press any key to continue...`],
	[33065, `Times Up!`],
	[33066, `Mission Succeeded!`],
	[33067, `Mission Failed!`],
	[33068, `Game Paused`],
	[
		33069,
		`The small gauntletz icon on the pressure plate on your left means that only a Grunt with gauntletz can activate it.`,
	],
	[
		33070,
		`These bookz contain valuable information that will help you learn about Gruntz.  Be sure to read them all!  If you ever want to see the information again, just have a Grunt walk onto the book again.`,
	],
	[
		33071,
		`Practice using your squeak toy a few times by RIGHT-CLICKING on your Grunt to bring up the action optionz, LEFT-CLICKING on the squeak toy icon, and then LEFT-CLICKING on the ground nearby.  Your Grunt will place the toy down inside a toy box.  Just pick up the toy box to get the toy back.`,
	],
	[
		33088,
		`There's no telling what will happen when you step on a SECRET SWITCH.  But you'll have to hurry because you only have a certain amount of time before the effectz wear off!`,
	],
	[
		33089,
		`Remember, if you have a Toy, you can use it to get past an enemy Grunt without fighting him!  You can either fight the enemy Grunt below, or you can distract him with your beach ball and then sneak past him.`,
	],
	[
		33091,
		`Dirt moundz are just like rockz, you never know what may be underneath them!  If you find an item under a dirt mound, be sure to fill in the hole before you pick it up!`,
	],
	[
		33093,
		`Always look ahead to the next set of pressure platez to see what toolz or toyz you will need to move on.  If you look below, you will see that you need both a gauntletz Grunt and a shovelz Grunt.`,
	],
	[
		33095,
		`Beware of the rolling boulderz of doooom! Muahahahah...*cough* *wheeze* *hack* *ahem* sorry... just watch out for the rolling rockz, ok?`,
	],
	[
		33096,
		`Remember that each time a Grunt picks up a megaphone, a new item will come down from your Grunt machine!  Don't forget to see what it is!`,
	],
	[33097, `Unable to load the voice resource file.`],
	[33143, `the giant rock`],
	[33144, `holy shovelz!`],
	[33145, `Gruntz, start your enginez`],
	[33146, `I get by with a little help from my friendz`],
	[33147, `spyz like us`],
	[33148, `brick layerz have all the fun`],
	[33149, `the Grunt that was left behind`],
	[33150, `I want a rock right now!`],
	[33151, `toobin it`],
	[33152, `la la la la la bomba`],
	[33153, `now who put that warpstone piece there?!`],
	[33154, `Guardz!  There's a thief on the premisez!`],
	[33155, `just wing it`],
	[33156, `candlez and cupcakez and bombz, oh my!`],
	[33157, `you take the high road and I'll take the low`],
	[33158, `the intersection`],
	[33159, `swordz akimbo`],
	[33160, `I've always wanted to be a welder`],
	[33161, `back from the dead and into the pool`],
	[33162, `keep your eye on the ball`],
	[33163, `you should never play near electrical outletz!`],
	[33164, `pay no attention to the grunt with the shield`],
	[33165, `the big split up`],
	[33166, `with four Gruntz, you can take on the world!`],
	[33167, `come back with a friend`],
	[33168, `save that squeak toy!`],
	[33169, `golf anyone?`],
	[33170, `where's my buddy?`],
	[33171, `use those sponge gunz!`],
	[33172, `would you like some holez to go with that?`],
	[33173, `could someone get those purple switchez for me?`],
	[33174, `the final battle`],
	[33175, `Basic Controlz`],
	[33176, `Toolz and Toyz`],
	[33177, `Combat Exercisez`],
	[33178, `Pyramidz, Bridgez, and Switchez`],
	[33179, `Loading...`],
	[33180, `Multiplayer Level`],
	[33181, `Custom Multiplayer Level`],
	[33182, `Battlez Level`],
	[33183, `Custom Battlez Level`],
	[33184, `Custom Questz Level`],
	[33185, `Questz Level`],
	[33186, `Training Stage 1`],
	[33187, `Training Stage 2`],
	[33188, `Training Stage 3`],
	[33189, `Training Stage 4`],
	[33190, `Saving...`],
	[33191, `Quicksaving...`],
	[33192, `Quickloading...`],
	[33193, `Please Wait...`],
	[33194, `Since you have cheated, you may not save your game.`],
	[33195, `training`],
	[33196, `Secret Level`],
	[33197, `?????`],
	[33198, `Rocky Roadz`],
	[33199, `Gruntziclez`],
	[33200, `Trouble in the Tropicz`],
	[33201, `High on Sweetz`],
	[33202, `High Rollerz`],
	[33203, `Honey, I Shrunk the Gruntz!`],
	[33204, `The Miniature Masterz`],
	[33205, `Gruntz in Space`],
	[
		33240,
		`Blue switchez are exactly like green switchez except that green switchez always control green pyramidz, and blue switchez always control bridgez.  So when you see a blue switch, look around for the bridgez that it might control!`,
	],
	[
		33241,
		`The brown and colored squares ahead are brickz!  Brickz break from top to bottom.  Brown brickz can safely be broken with a pair of gauntletz, gold brickz cannot be broken with gauntletz, and red brickz will destroy your gauntletz when you break them.`,
	],
	[
		33242,
		`Be careful when breaking rockz because sometimes there are exploding TIMEBOMBZ inside!  What should you do if you find one?  *RUN!*`,
	],
	[
		33243,
		`CAUTION - Brown brickz might actually be colored brickz that you just can't see!  Only a Grunt with SPY GEAR can see these special brickz.  Be sure to spy ALL of the brickz before you break them!  To use spy gear, move the mouse over something that you want to spy and LEFT-CLICK on it.`,
	],
	[
		33244,
		`When you give a GO-KART to an enemy Grunt, he will ride around the map randomly until the go-kart breaks.  The next enemy you will encounter has a club.  Since clubz are stronger than gauntletz and shovelz, you will need to use the go-kart in order to get past him.`,
	],
	[
		33245,
		`Iconz with red sparklez circling around them are powerupz!  Powerupz take effect immediately and wear off after a certain amount of time.  A spinning gravestone is an INVISIBILITY powerup.  An invisible Grunt cannot be seen by enemy Gruntz.  Once you get it, sneak past those enemiez!`,
	],
	[
		33246,
		`The silver squarez you see ahead are BRICK PADZ.  A Grunt with BRICK LAYING TOOLZ can build brickz on top of brick padz!  You cannot get those gauntletz until you destroy the rolling ballz.  HINT - One of your Gruntz will need to go around and get the brick laying tool on the other side!`,
	],
	[
		33247,
		`Sometimes you have to leave Gruntz behind in order to move forward in the level.  Don't worry, as long as you get the warpstone piece to the fort, all of your Gruntz will be saved!`,
	],
	[
		33248,
		`A spinning wheel is a SUPERSPEED powerup.  Since it only lasts for a limited time, you might want to think about where you're going to go before you pick up a superspeed powerup.`,
	],
	[
		33249,
		`Did you know that you can select multiple Gruntz by clicking the left mouse button somewhere, holding the button down, and drawing a rectangle around the Gruntz that you want to select?  You did?  Hey, have you played this game before?`,
	],
	[
		33250,
		`Did you know that some toyz last longer than other toyz before they break?  You did?  Well did you know that BEACHBALLZ last longer than JACK-IN-THE-BOXZ?  Really??  Wow!  Where are you getting your information from?`,
	],
	[
		33251,
		`A TOOBZ Grunt can go in and out of water as long as he has his toob!  BE CAREFUL - If a toobz Grunt walks over SPIKEZ on the ground or big silver TOOB SPIKEZ, he will lose his toob!`,
	],
	[
		33252,
		`A spinning suit of armor is a REACTIVE ARMOR powerup.  If a Grunt gets attacked while he has a REACTIVE ARMOR powerup, then the attacker will take 75 percent of the damage!`,
	],
	[
		33253,
		`Did you know that in addition to a secret teleporter, there is also a secret switch on every level?  As the levels progress, secret switchez and secret teleporterz will become much more difficult to find!`,
	],
	[
		33254,
		`To use BOMBZ, RIGHT-CLICK on your bombz Grunt, select the bomb icon, and then LEFT-CLICK where you want to go.  Your bombz Grunt will run to that location and explode so be sure to make it count!  HINT - Do it from where you are standing right now!`,
	],
	[
		33255,
		`Whenever a BOMBZ Grunt explodes, any rockz, Gruntz, or brickz that are in the explosion will be destroyed!`,
	],
	[
		33256,
		`Whatever you do, please don't break that giant volcano.  Our artists put a lot of effort into making it and they would probably be pretty mad if you broke it.  Thanks again for your cooperation.\n\nSincerely, the Gruntz level design team.`,
	],
	[
		33257,
		`A spinning sickle is a DEATH TOUCH powerup.  A Grunt with death touch can kill any Grunt with a single touch!`,
	],
	[
		33258,
		`Did you know that whenever a Grunt steps on a red switch, EVERY red pyramid in the entire level moves up or down?  Oh, we knew you did.  We were just uh... testing you!  Yeah!`,
	],
	[33259, `Any Grunt that is hit by BOXING GLOVEZ will get pushed backward.`],
	[
		33260,
		`When you break a black BOMB BRICK, something really cool happens.  Heheh... *boss walks in* "Uh yes sir, we were just informing the player that bomb brickz explode when you break them.  No sir, we would never present the player with false information, sir!" *gulp*`,
	],
	[
		33261,
		`mmmmmmm!  Those CUPCAKEZ sure look tasty!  But rather than eating them, why don't you try smashing them with your gauntletz instead?`,
	],
	[
		33262,
		`A Grunt with WINGZ can fly over water, holez, spikez, and any land that would normally cause death.  When a wingz Grunt is flying, keep your eye on the GREY BAR that will appear above the Grunt!  When that bar runs out, the wingz will fall off!`,
	],
	[
		33263,
		`A spinning picket sign is a CONVERSION powerup.  When your Grunt has conversion, any Grunt that he attacks will become yours to control permanently!  MOVE QUICKLY - A Grunt with conversion will constantly lose health until he dies.  Converting an enemy Grunt will give you more health.`,
	],
	[
		33264,
		`A Grunt with SHIELDZ will take half damage from any normal attack and will take NO DAMAGE AT ALL from bare handz, glovez, or shieldz.`,
	],
	[
		33265,
		`With ROCKZ, Gruntz can attack from long distancez!  To throw a rock to a specific location, RIGHT-CLICK on your rockz Grunt to bring up his action optionz, select the rockz icon, and then LEFT-CLICK where you want to throw it!  You can also attack by simply RIGHT-CLICKING on an enemy.`,
	],
	[
		33266,
		`Did you know that pressing the 'T' key is a shortcut for right clicking on a Grunt and selecting his tool and that the 'Y' key is a shortcut for right clicking on a Grunt and selecting his toy?`,
	],
	[
		33267,
		`Go ahead.  Try it without watching it first.  We DARE ya!  *boss walks in*  "Uh hello sir!  No sir, we were not trying to mislead the player, sir!  We were just telling them to always learn the timing before trying to pass a timed section and to always save their game first!" *gulp*`,
	],
	[
		33268,
		`A Grunt with BOOMERANGZ can hit multiple Gruntz with a single throw, but if you're not careful, you'll hit your own Gruntz with it!  When a Grunt throws a boomerang, he MUST be standing at the same spot that the boomerang was thrown from in order to catch it again.`,
	],
	[
		33269,
		`In addition to attacking enemy Gruntz, a Grunt with SPRINGZ can jump safely over any single bed of spikez, any single hole, or any one-space gap between bridgez.  BE CAREFUL - If a springz Grunt jumps directly onto a bed of spikez, the spring will break!`,
	],
	[
		33270,
		`Did you know that TELEPORTERZ come in a few different colorz?  A GREEN teleporter can be used over and over, a BLUE teleporter can only be used once, and a RED teleporter is a secret teleporter that will only stay open for a certain period of time.`,
	],
	[
		33271,
		`SCROLLZ are TOYZ that you can use once to cast a spell!  To cast a spell, use the action optionz and LEFT-CLICK on the scroll icon.  Once the spell is cast, the scroll will be gone.  A WHITE scroll will FREEZE all enemiez nearby.  Frozen Gruntz will shatter if they are hit.`,
	],
	[
		33272,
		`BATTLEZ mode is very different from QUESTZ mode.  The object of battlez is to take over all of the enemy FORTZ before they take over yours.  To take over an enemy fort, one of your Gruntz must walk onto it!  It is strongly recommended that you play the Questz training levelz before playing battlez.`,
	],
	[
		33273,
		`You will notice that on the GRUNTZ TAB on the status bar, your GOO WELL is constantly filling up with goo.  When the well is full, you can create a Grunt by clicking on a Grunt oven and dropping him on one of your flashing padz!  Take over enemy fortz to gain control of their flashing padz!`,
	],
	[
		33274,
		`You will notice that on the RESOURCE TAB on the status bar, you are always getting new toolz, toyz, and brickz.  Brickz can only be given to a Grunt with BRICK LAYING TOOLZ.  Equip your Gruntz with these toolz and toyz by clicking on them and dropping them on your Gruntz!`,
	],
	[33275, `1869577261`],
	[33276, ` Monolith internal review copy.  Do not distribute.  We know who you are.`],
	[
		33278,
		`Watch out for the red BOMBER GRUNTZ.  If one of your Gruntz gets too close, a bomber Grunt will run straight at your Grunt and try to blow him up.  To avoid getting blown to bitz, just move your Grunt out of the way once the bomber Grunt starts running!`,
	],
	[
		33279,
		`There can only be one goo puddle per space on the level.  If you kill an enemy Grunt on top of a goo puddle, there will only be one puddle left there after he dies!  So if you are collecting goo puddlez, be sure not to kill an enemy Grunt if he is already standing on a goo puddle!`,
	],
	[
		33280,
		`Beware of the black TOOL THIEF Grunt!  If he sees a Grunt with a tool, he will steal it and attack with it and the only way to get it back is to kill him!  HINT - If you are forced to cross pathz with a tool thief, be sure to let him steal your weakest tool and then kill him!`,
	],
	[
		33281,
		`When you are ready to distract the enemy Grunt with your squeak toy, use the action optionz to select the squeak toy icon and then LEFT-CLICK on the enemy Grunt rather than on the ground.  When he's playing with the toy, quickly sneak past him!`,
	],
	[
		33282,
		`The warpstone display will show you how many warpstone pieces you have acquired.  When you acquire all 4 pieces, your Gruntz will be able to advance to the next area.  To see the warpstone display, click on the status bar tab with the joystick on it, and look at the top.`,
	],
	[
		33284,
		`Whatever you do, please uh... don't um... break that giant rock by the warpstone piece.  Thank you for your cooperation.\n\nSincerely, the Gruntz level design team.`,
	],
	[
		33285,
		`Did you know that a Grunt can carry one Tool and one Toy?  If a Grunt that has a Tool picks up a different Tool, he will throw away the first Tool and it will be gone forever.  Similarly, if a Grunt that has a Toy picks up a different Toy, the first Toy will be gone forever.`,
	],
	[
		33286,
		`Remember to always try to give toolz to your bare-handed Gruntz and to always look ahead in the level to try to figure out which toolz you will need.`,
	],
	[
		33287,
		`The next enemy you will encounter has a sword.  Swordz are the strongest short-range toolz in the game.  You won't be able to beat a swordz Grunt with gauntletz, shovelz, or even clubz, so you will need to use the go-kart in order to get past him.`,
	],
	[
		33288,
		`It is important to know which toolz are stronger than other toolz.  Always remember that shovelz are stronger than gauntletz, and clubz are stronger than both shovelz and gauntletz!`,
	],
	[
		33289,
		`If you have a toy, be sure to save it for an enemy Grunt that you cannot defeat by fighting.  Since your gauntletz Grunt can easily defeat a brick laying toolz grunt, be sure to save the jack-in-the-box for the clubz Grunt below.`,
	],
	[
		33290,
		`If you recall from the training levelz, when your goo well is full, you can create a new Grunt by LEFT-CLICKING on a fully baked Grunt oven and dropping him on a flashing pad!  To see the Grunt ovenz, click on the status bar tab with the small Grunt head on it.`,
	],
	[
		33291,
		`If you recall from the training levelz, when you want to use a toy on an enemy Grunt, first you need to RIGHT-CLICK on your Grunt who has the toy.  This will bring up his action optionz.  Then you need to LEFT-CLICK on the toy icon to select it, and then LEFT-CLICK on the enemy Grunt.`,
	],
	[
		33292,
		`Somewhere on every level is an invisible secret teleporter trigger.  If one of your Gruntz steps on it, a red secret teleporter will open up for a certain amount of time.  If you find a secret teleporter, try to get one of your Gruntz into it before it closes!`,
	],
	[
		33293,
		`Gruntz with warpstone piecez can pick up and use toyz, but they will not be able to attack other Gruntz, and they will not be able to pick up toolz.`,
	],
	[
		33294,
		`When you give a MONSTER WHEEL toy to an enemy Grunt, he will ride around the map randomly until the monster wheel breaks.`,
	],
	[
		33295,
		`Gruntz are extremely dumb creaturez.  Besides walking into water, Gruntz will do whatever you tell them.  You must be VERY careful because Gruntz will always take the shortest path to wherever you tell them to go, even if that means walking over a hole, off a bridge, or into a fire pit!`,
	],
	[
		33296,
		`Watch out for BIRD SHADOWZ!  If a bird flies over one of your Gruntz, it will drop a large poop on the ground that will squash any Gruntz that are underneath it.`,
	],
	[
		33297,
		`Remember that brown brickz can safely be broken with a pair of gauntletz, gold brickz cannot be broken with gauntletz, and red brickz will destroy your gauntletz when you break them.  So never let a Grunt with gauntletz break a red brick unless he will not need his gauntletz anymore.`,
	],
	[
		33298,
		`Some bridgez will rise up for a certain length of time and then sink down for a certain length of time.  These are called TOGGLE BRIDGEZ.  The only way to get Gruntz past toggle bridgez is to wait for them to rise up and then walk your Gruntz over them before they sink down again.`,
	],
	[
		33299,
		`Before you pick up the warpstone piece, make sure that you have a clear path into the fort.  You can use your spy Grunt to figure out which brickz you can break, and then you can use your gauntletz Grunt to break them.`,
	],
	[
		33300,
		`Always try to give toolz to your bare-handed Gruntz.  If you find a new tool and all of your Gruntz already have toolz, then give it to one of your Gruntz that has a tool that you don't need anymore.  Always look ahead in the level to try to figure out which toolz you will need.`,
	],
	[
		33301,
		`Whenever you have to fight an enemy Grunt with a powerful weapon and none of your Gruntz have any toyz, make sure that you attack the enemy Grunt with ALL of your available Gruntz!`,
	],
	[
		33302,
		`Man.  If there were only a switch somewhere that would make the bridge in the center come up.  Too bad it's not in plain view.  Oops!  uh... you didn't hear that from us, okay?`,
	],
	[
		33303,
		`Gruntz can only carry one tool at a time.  When your Grunt picks up the GOOBER STRAW above the rock, he will throw away the gauntletz and they will be gone forever.`,
	],
	[
		33304,
		`Up ahead is a swordz Grunt.  Remember that swordz are the most powerful short-range toolz in the game.  If only you had a toy to distract him with!  Oh wait... you probably do have a toy to distract him with.  Uh... nevermind then.`,
	],
	[
		33305,
		`If you recall from the training levelz, you should always press silver timer switchez a few times to learn the timing of the silver pyramidz before you try to get past them.  It is also a good idea to save your game before you attempt puzzlez where you might lose Gruntz such as this one.`,
	],
	[
		33306,
		`Whenever a Grunt uses a tool or attacks, he temporarily loses his stamina and a blue STAMINA BAR will appear above his head.  The stamina bar indicates how long a Grunt must wait before he regains his strength and can use a tool again.  When the bar disappears, he can use his tool again.`,
	],
	[
		33307,
		`When a wingz Grunt attacks, he will shoot tornadoez that can hit multiple Gruntz!  Any Grunt hit by a tornado will be knocked in a random direction so be careful not to accidentally hit your own Gruntz!  To use wingz to attack, either RIGHT-CLICK on an enemy, or use the action optionz.`,
	],
	[
		33308,
		`When in doubt, BLOW STUFF UP!  Remember that when you tell a bomb Grunt to light his bomb, he will run VERY fast.  Just stand out of the path of the rolling ball, use the action optionz to select the bombz icon, and then GO!`,
	],
	[
		33309,
		`Take a look at your Grunt machine on the status bar.  If you see a shovel inside it, that means that there is still a megaphone somewhere on the level that you haven't picked up yet.  hmm... now what could you possibly need a shovel for?`,
	],
	[
		33310,
		`You can't take on a goober strawz Grunt with your bare handz.  You had better make a run for those gauntletz!`,
	],
	[
		33311,
		`Watch out for PLANE SHADOWZ!  If a plane flies over one of your Gruntz, it will drop a large package on the ground that will squash any Gruntz that are underneath it.`,
	],
	[
		33312,
		`Although SPONGE GUNZ are the weakest of all the long range toolz, whenever you hit an enemy Grunt with a sponge gun ball, the enemy Grunt will be pushed backward.  Sponge gunz work just like all the other long-range toolz.  You can fire them to any location that is within range.`,
	],
	[
		33313,
		`Remember, it's always a good idea to save your game before you attempt difficult puzzlez.  Have you saved your game lately?`,
	],
	[
		33314,
		`Watch out for STAR SEARCH SPOTLIGHTZ!  If a star search spotlight passes over a Grunt, that Grunt will be forced to sing Karaoke.  Once he shows that he cannot sing, a hole will open up underneath him and take him out of the spotlight and out of the game.`,
	],
	[
		33315,
		`Patience is a virtue.  It might be a good idea to wait for the large gap between the groups of 8-ballz before you move on!`,
	],
	[
		33316,
		`When you give POGO STICKZ to an enemy Grunt, he will bounce around the map randomly until the pogo stick breaks.`,
	],
	[
		33317,
		`WELDER'S KITZ shoot fireballz and are the most powerful long-range toolz in the game.  In fact, a single fireball will kill most Gruntz!  To use welder's kitz, either RIGHT-CLICK on an enemy Grunt, or use the action optionz to select the welderz icon and then LEFT-CLICK to fire it.`,
	],
	[
		33318,
		`The spinning crest on the other side of the steps is an INVULNERABILITY powerup.  Walking into a hole or being run over by a rolling ball will kill a Grunt with invulnerability, but an invulnerable Grunt cannot be damaged by enemy Gruntz or by explosionz.`,
	],
	[
		33319,
		`An ORANGE scroll will cast a RESURRECTION spell.  Resurrection spellz will turn all goo puddlez nearby into Gruntz!  Resurrected Gruntz come back to life with only a little bit of health.`,
	],
	[
		33320,
		`Ever heard of SAFE SPOTZ?  Safe spotz are spaces that Gruntz can stand forever and nothing will hurt them.  Always look to see if there are any safe spotz in the middle of difficult puzzlez such as this one.  If you find any safe spotz, get your Gruntz to them!`,
	],
	[
		33321,
		`This level is a bit different from the previous levelz.  Your first goal is to get the gauntletz and get into the teleporter.  In order to do this, you will need to release the giant 8-ball to the left.  Watch the 8-ball closely as you progress...  if it breaks, you lose.`,
	],
	[
		33322,
		`Nice job!  Ya know, it's times like these when it's a REALLY good idea to save your game.`,
	],
	[
		33323,
		`There are 6 once-only switchez scattered around the level that you will need to press in order to move on.  So what are you waiting for?  Go and find them all!`,
	],
	[
		33324,
		`If you look ahead, you will see a dark red TIMEBOMBER Grunt.  Timebomberz always have TIMEBOMBZ and will use them to attack your Gruntz and to blow things up in order to get to your Gruntz.`,
	],
	[
		33325,
		`Conserve those wingz!  When you need to fly somewhere, always try to take the route that minimizes the time that you are in the air.  Remember, when you're on the ground, you are not wasting valuable flying time!`,
	],
	[
		33326,
		`Watch out for green KITCHEN SLIMEZ.  Any Grunt that touches a kitchen slime will be instantly melted into a puddle of goo.`,
	],
	[
		33327,
		`You've only got one toy so it's probably a good idea to lure that swordz Grunt as far away from the orange switchez as possible before you give it to him.  Unless of course, you want to fight him after the toy wears off... which is probably NOT a good idea.`,
	],
	[
		33328,
		`The best way to fight against multiple enemy Gruntz is to fight them one at a time.  Don't get too close, or they both will see you!  When the first enemy comes down, give him the old shovelz, gauntletz, brick laying toolz combo!`,
	],
	[
		33329,
		`If you DOUBLE-CLICK on one of your Gruntz, a small SIDE TAB will appear on the side of status bar.  Each side tab represents one of your Gruntz.  You can find a Grunt anywhere on the map by LEFT-CLICKING on his side tab.  You can RIGHT-CLICK on a side tab to remove it.  Try it out!`,
	],
	[
		33330,
		`TIMEBOMBZ can be used to attack enemy Gruntz, or to blow stuff up!  To use a timebomb, either RIGHT-CLICK on an enemy Grunt, or use the action optionz to select the timebombz icon and then LEFT-CLICK wherever you want to place it.  Don't forget to move away from the explosion!`,
	],
	[
		33331,
		`If you want to break something and you don't have any gauntletz or bombz, you can sometimes get a bomber Grunt to blow it up for you!  Just position yourself between the bomber Grunt and the object that you want break and then let the bomber see you!  Don't forget to move though!`,
	],
	[
		33332,
		`Ever heard of the old hit-and-run technique?  It's where you tell your Grunt to attack an enemy Grunt, and then tell him to run away after he hits the enemy.  The hit-and-run technique works especially well if the enemy won't chase after your Grunt!`,
	],
	[
		33333,
		`Don't walk into the blue teleporter unless you have already baked two Gruntz in the ovenz!`,
	],
	[
		33334,
		`Watch out for THUNDER CLOUD SHADOWZ!  If a thunder cloud floats over one of your Gruntz, a bolt of lightning will electrocute him to death!`,
	],
	[
		33335,
		`GRAVITY BOOTZ have two uses.  First, a Grunt with GRAVITY BOOTZ can walk on spikez for as long as you want without taking any damage at all.  Second, a Grunt with gravity bootz will not get knocked around when he gets hit by any of the toolz that have a knock effect like boxing glovez.`,
	],
	[
		33336,
		`You're probably wondering how your single Grunt is supposed to take on 4 swordz Gruntz all by himself aren't you?  Try using the arrowz!`,
	],
	[
		33337,
		`Don't press that yellow switch until you're ready!  You'll need a hole-in-one to continue.`,
	],
	[
		33338,
		`It's always a good idea to save your game before you step on a secret switch.  That way, you can try the secret section as many times as you want!`,
	],
	[
		33339,
		`You start out with two Gruntz in different locations on this level.  You will have to use them both in order to finish the level.  Good luck!`,
	],
	[
		33340,
		`A spinning pill is a ROIDZ powerup.  A Grunt with roidz will never lose stamina from using a tool.  This means that a Grunt with roidz can attack or use a tool over and over without waiting.`,
	],
	[
		33341,
		`MAGIC WANDZ are toolz that are used by Gruntz to cast Spellz, and cannot be used to attack enemy Gruntz.  A RED wand will cast a ROLLING BALLZ spell.  Use wandz sparingly because each time a Grunt uses a wand to cast a spell, he will lose a quarter of a full bar of health!`,
	],
	[
		33342,
		`A GREEN scroll will cast a HEALTH spell.  Health spellz will give all Gruntz nearby full health except for the Grunt who cast the spell!  Be sure to get as close as possible to your other Gruntz to make sure that they are all within the range of the spell!`,
	],
	[
		33343,
		`Did you know that you can knock your own Gruntz around with sponge gunz?  Just have a sponge gunz Grunt fire to a location, and then have another Grunt walk there before the ball hits.  HINT - if a Grunt gets hit by a sponge gun ball when he is on an arrow, he will still be knocked back!`,
	],
	[
		33352,
		`Watch out for white TOYER Gruntz!  If you LEFT-CLICK on a toyer Grunt, you can see what toy he is carrying.  If a toyer Grunt gets next to one of your Gruntz, he will use his toy on your Grunt.  You should avoid toyer Gruntz at all costz!`,
	],
	[
		33353,
		`Don't ever let a tool thief get next to your Gruntz!  If you want to give a toy to a tool thief, lay it down on the ground in a toy box and try to lure the tool thief over it!`,
	],
	[
		33355,
		`Did you know that you can always tell the behavior of an enemy Grunt by his color?  Light green Gruntz are chaserz, dark purple Gruntz will only chase for a short distance, and dark green Gruntz will only chase and attack Gruntz that have a weaker tool than they do.`,
	],
	[
		33356,
		`Each set of BRICKZ in the game are randomly colored.  You can always see your own brickz, but you will need a Grunt with SPY GEAR to be able to see the enemy's brickz.  To use spy gear, move the mouse over a brick and LEFT-CLICK on it.`,
	],
	[
		33357,
		`Brickz can be broken with gauntletz, bombz, and timebombz.  Brown brickz are normal brickz, gold brickz cannot be broken with gauntletz, red brickz will destroy gauntletz, and blue brickz will teleport all nearby Gruntz to a random location.`,
	],
]);

export function getHelpText(offset: number) {
	return helpText.get(offset);
}
