import { TeamStats } from 'client/game/GameHooks';
import styled from 'styled-components';
import { Button, ButtonRow, Overlay, Section, TextContainer, TopBar } from './Boxes';

interface Props {
	stats: TeamStats;
	close: () => void;
}

const Table = styled.table`
	th {
		text-align: right;
		padding: 10px;
	}
	td {
		text-align: left;
		padding: 10px;
	}
`;

export function StatsDialog({ stats, close }: Props) {
	return (
		<Overlay>
			<Section>
				<TopBar>Level Completed!</TopBar>
				<TextContainer>
					<Table>
						<tbody>
							<tr>
								<th>TIME:</th>
								<td>{stats.time}</td>
							</tr>
							<tr>
								<th>SURVIVORZ:</th>
								<td>{stats.survivorz}</td>
							</tr>
							<tr>
								<th>DEATHZ:</th>
								<td>{stats.deathz}</td>
							</tr>
							<tr>
								<th>TOOLZ:</th>
								<td>
									{stats.toolz} OF {stats.totalToolz}
								</td>
							</tr>
							<tr>
								<th>TOYZ:</th>
								<td>
									{stats.toyz} OF {stats.totalToyz}
								</td>
							</tr>
							<tr>
								<th>POWERUPZ:</th>
								<td>
									{stats.powerupz} OF {stats.totalPowerupz}
								</td>
							</tr>
							<tr>
								<th>COINZ:</th>
								<td>
									{stats.coinz} OF {stats.totalCoinz}
								</td>
							</tr>
							<tr>
								<th>SECRETZ:</th>
								<td>
									{stats.secretz} OF {stats.totalSecretz}
								</td>
							</tr>
							<tr>
								<th>WARP LETTERZ:</th>
								<td>{stats.letterz.toUpperCase().split('').join(' ')}</td>
							</tr>
						</tbody>
					</Table>
					<ButtonRow>
						<Button onClick={close}>End Level</Button>
					</ButtonRow>
				</TextContainer>
			</Section>
		</Overlay>
	);
}
