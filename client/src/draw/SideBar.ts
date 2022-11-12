import { Level } from 'client/game/Level';
import { Team } from 'client/logic/Logic';
import { getPickupIndex } from 'client/logic/Pickup';
import { pointAdd } from 'client/utils/math';
import { Point } from 'client/utils/Point';

const SLOT_COUNT = 4;

export class SideBar {
	position: Point;
	selectedTab = 'Gruntz';
	back: HTMLCanvasElement;
	hoverTags = new Set<string>();
	clickedTags = new Set<string>();
	constructor(readonly level: Level, position: Point) {
		this.position = position;
		this.back = document.createElement('canvas');
		this.back.width = 32;
		this.back.height = 32;
		const backCtx = this.back.getContext('2d');
		backCtx?.fillRect(0, 0, 32, 32);
	}
	setTab(tab: string) {
		this.selectedTab = tab;
		this.update();
	}
	updateHover(hoverTags: Set<string>) {
		this.hoverTags = hoverTags;
		this.update();
	}
	update() {
		this.level.spriteBank.clearPrefix('SideBar-');
		this.drawImage('Background', 'MAINBAR/FRAME001', { x: 0, y: 0 });
		this.level.spriteBank.add(undefined, {
			tag: 'SideBar-Back',
			image: this.back,
			position: pointAdd(
				{
					x: -64,
					y: 250,
				},
				this.position,
			),
			zIndex: 500100,
			fixed: true,
			width: 160,
			height: 300,
		});
		this.drawTabs();
		switch (this.selectedTab) {
			case 'Gruntz':
				return this.drawGruntzPanel();
			case 'Resource':
				return this.drawResourcePanel();
			case 'Game':
				return this.drawGamePanel();
		}
	}
	drawImage(tag: string, image: string, offset: Point, zIndex: number = 1) {
		this.level.spriteBank.add(undefined, {
			tag: 'SideBar-' + tag,
			image: 'GAME/IMAGEZ/STATUSBAR/' + image,
			zIndex: 500100 + zIndex,
			fixed: true,
			position: pointAdd(offset, this.position),
		});
	}
	drawTabs() {
		this.drawImage(
			'Tab-Gruntz',
			`TABZ/GRUNTZTAB/FRAME${this.selectedTab == 'Gruntz' ? '003' : '001'}`,
			{
				x: -60,
				y: -88,
			},
		);
		this.drawImage(
			'Tab-Resource',
			`TABZ/RESOURCETAB/FRAME${this.selectedTab == 'Resource' ? '003' : '001'}`,
			{
				x: -28,
				y: -88,
			},
		);
		this.drawImage(
			'Tab-Statz',
			`TABZ/STATZTAB/FRAME${this.selectedTab == 'Statz' ? '003' : '001'}`,
			{
				x: 2,
				y: -88,
			},
		);
		this.drawImage(
			'Tab-Multiplayer',
			`TABZ/MULTIPLAYERTAB/FRAME${this.selectedTab == 'Multiplayer' ? '003' : '001'}`,
			{
				x: 32,
				y: -88,
			},
		);
		this.drawImage(
			'Tab-Game',
			`TABZ/GAMETAB/FRAME${this.selectedTab == 'Game' ? '003' : '001'}`,
			{
				x: 62,
				y: -88,
			},
		);
	}
	drawGruntzPanel() {
		this.level.spriteBank.add(undefined, {
			tag: 'SideBar-WellGooBottom',
			image: 'GAME/IMAGEZ/STATUSBAR/TABZ/GRUNTZTAB/WELLGOO/FRAME002',
			position: pointAdd(
				{
					x: 41,
					y: 200,
				},
				this.position,
			),
			zIndex: 500102,
			palette: 'ORANGE',
			fixed: true,
		});
		const team = this.level.getTeam();
		if (team) {
			const height = team.gooCount * 45;
			this.level.spriteBank.add(undefined, {
				tag: 'SideBar-WellGoo',
				image: 'GAME/IMAGEZ/STATUSBAR/TABZ/GRUNTZTAB/WELLGOO/FRAME001',
				position: pointAdd(
					{
						x: 41,
						y: 198 - height,
					},
					this.position,
				),
				height,
				zIndex: 500102,
				palette: 'ORANGE',
				fixed: true,
			});
			this.drawOven(team, 0);
			this.drawOven(team, 1);
			this.drawOven(team, 2);
			this.drawOven(team, 3);
		}
		this.drawImage('WellText', 'TABZ/GRUNTZTAB/WELLTEXT/FRAME001', {
			x: 32,
			y: 114,
		});
		this.drawImage('Well', 'TABZ/GRUNTZTAB/WELL/FRAME001', {
			x: 35,
			y: 92,
		});
		this.drawImage('TitleText', 'TABZ/GRUNTZTAB/TITLETEXT/FRAME001', {
			x: -20,
			y: -57,
		});
		this.drawImage('OvenzText', 'TABZ/GRUNTZTAB/OVENZTEXT/FRAME001', {
			x: -50,
			y: -20,
		});
	}
	drawOven(team: Team, index: number) {
		const y = 20 + index * 60;
		const full = team.ovens[index];
		this.level.spriteBank.add(undefined, {
			tag: `SideBar-GruntOven-${index}`,
			image: `GAME/IMAGEZ/STATUSBAR/TABZ/GRUNTZTAB/GRUNTOVEN/FRAME${full ? '026' : '001'}`,
			position: pointAdd({ x: -32, y }, this.position),
			zIndex: 500102,
			palette: 'ORANGE',
			fixed: true,
		});
	}
	drawResourcePanel() {
		this.drawResourcesPanelBackground();
		const team = this.level.getTeam();
		if (team) {
			const nextItem = team.megaphoneItems[team.megaphoneOffset];
			if (nextItem) {
				const itemIndex = getPickupIndex(nextItem).toString().padStart(3, '0');
				this.level.spriteBank.add(undefined, {
					tag: 'SideBar-NextItem',
					image: `GAME/IMAGEZ/INGAMEICONZ/GREYCHIPZ/FRAME${itemIndex}`,
					zIndex: 500100 + 3,
					fixed: true,
					position: pointAdd({ x: 4, y: -12 }, this.position),
				});
			} else {
				this.level.spriteBank.clear(undefined, 'NextItem');
			}
			team.slots.forEach((slot, index) => {
				const y = index % SLOT_COUNT;
				const x = (index - y) / SLOT_COUNT;
				if (slot) {
					const itemIndex = getPickupIndex(slot.item).toString().padStart(3, '0');
					this.level.spriteBank.add(undefined, {
						tag: `SideBar-Item-${index}`,
						image: `GAME/IMAGEZ/INGAMEICONZ/NORMCHIPZ/FRAME${itemIndex}`,
						zIndex: 500100 + 3,
						fixed: true,
						position: pointAdd({ x: -39 + 42 * x, y: 38 }, this.position),
						tween: {
							target: pointAdd({ x: -39 + 42 * x, y: 188 - 34 * y }, this.position),
							startTime: slot.time,
							endTime: slot.time + 1000,
						},
					});
				} else {
					this.level.spriteBank.clear(undefined, `SideBar-Item-${index}`);
				}
			});
		}
	}
	drawResourcesPanelBackground() {
		this.drawImage('UpperBackground', 'TABZ/RESOURCETAB/UPPERBACKGROUND/FRAME001', {
			x: 0,
			y: 42,
		});
		this.drawImage('TitleText', 'TABZ/RESOURCETAB/TITLETEXT/FRAME001', { x: -20, y: -57 });
		this.level.spriteBank.add(undefined, {
			tag: 'SideBar-Machine',
			image: 'GAME/IMAGEZ/STATUSBAR/TABZ/RESOURCETAB/MACHINE/FRAME001',
			zIndex: 500102,
			palette: 'ORANGE',
			fixed: true,
			position: pointAdd({ x: -47, y: -15 }, this.position),
		});
		this.drawImage('Framework', 'TABZ/RESOURCETAB/FRAMEWORK/FRAME001', { x: 0, y: 140 }, 5);
		this.drawImage('MainBackground', 'TABZ/RESOURCETAB/MAINBACKGROUND/FRAME001', {
			x: 0,
			y: 140,
		});
		this.drawImage('TopShredder', 'TABZ/RESOURCETAB/TOPSHREDDER/FRAME001', {
			x: 0,
			y: 214,
		});
		this.drawImage(
			'BottomShredder',
			'TABZ/RESOURCETAB/BOTTOMSHREDDER/FRAME001',
			{
				x: 0,
				y: 228,
			},
			4,
		);
		this.drawImage('MachineBackground', 'TABZ/RESOURCETAB/MACHINEBACKGROUND/FRAME001', {
			x: -56,
			y: -15,
		});
	}
	drawGamePanel() {
		this.drawImage('Warpstone', `TABZ/GAMETAB/WARPSTONE/FRAME001`, {
			x: 0,
			y: -177,
		});
		const warpstoneCount = this.level.map.stage - 1 + this.level.getTeam().warpstoneCount;
		if (warpstoneCount > 0) {
			this.drawImage('Warpstone1', `TABZ/GAMETAB/WARPSTONE/FRAME002`, {
				x: -27,
				y: -199,
			});
		}
		if (warpstoneCount > 1) {
			this.drawImage('Warpstone2', `TABZ/GAMETAB/WARPSTONE/FRAME003`, {
				x: 26,
				y: -204,
			});
		}
		if (warpstoneCount > 2) {
			this.drawImage('Warpstone3', `TABZ/GAMETAB/WARPSTONE/FRAME004`, {
				x: -26,
				y: -152,
			});
		}
		if (warpstoneCount > 3) {
			this.drawImage('Warpstone4', `TABZ/GAMETAB/WARPSTONE/FRAME005`, {
				x: 26,
				y: -157,
			});
		}
		this.drawImage('TitleText', 'TABZ/GAMETAB/TITLETEXT/FRAME001', { x: -20, y: -57 });
		this.drawImage(
			'PauseText',
			`TABZ/GAMETAB/PAUSE/FRAME${this.hoverTags.has('SideBar-PauseText') ? '002' : '001'}`,
			{
				x: 0,
				y: -15,
			},
		);
		this.drawImage(
			'SaveText',
			`TABZ/GAMETAB/SAVE/FRAME${this.hoverTags.has('SideBar-SaveText') ? '002' : '001'}`,
			{
				x: 0,
				y: 25,
			},
		);
		this.drawImage(
			'LoadText',
			`TABZ/GAMETAB/LOAD/FRAME${this.hoverTags.has('SideBar-LoadText') ? '002' : '001'}`,
			{
				x: 0,
				y: 65,
			},
		);
		this.drawImage(
			'QuitText',
			`TABZ/GAMETAB/QUIT/FRAME${this.hoverTags.has('SideBar-QuitText') ? '002' : '001'}`,
			{
				x: 0,
				y: 180,
			},
		);
		this.drawImage(
			'Destruct',
			`TABZ/GAMETAB/DESTRUCT/FRAME${
				this.clickedTags.has('SideBar-Destruct') ? '002' : '001'
			}`,
			{
				x: 0,
				y: 218,
			},
		);
	}
}
