export interface UpcomingGame {
	id: string;
	startTimeIso: string;
	homeTeamId: string;
	awayTeamId: string;
}

export interface GameStatus {
	id: string;
	quarter: number;
	clock: string; // MM:SS
	score: { home: number; away: number };
	status: 'scheduled' | 'live' | 'final';
}

export interface HistoricalTeamStats {
	teamId: string;
	season: string;
	wins: number;
	losses: number;
	ppg: number;
	oppg: number;
}

export interface GameBoxScore {
	gameId: string;
	players: Array<{ playerId: string; teamId: string; pts: number; reb: number; ast: number }>;
}

export type GameEvent =
	| { type: 'score'; teamId: string; points: number; gameClock: string }
	| { type: 'foul'; teamId: string; playerId: string; gameClock: string };

export interface NbaProvider {
	getUpcomingGames(params: { date?: string }): Promise<UpcomingGame[]>;
	getGameStatus(gameId: string): Promise<GameStatus>;
	getHistoricalTeamStats(params: { teamId: string; season: string }): Promise<HistoricalTeamStats>;
	getGameBoxScore(gameId: string): Promise<GameBoxScore>;
	streamGameEvents(gameId: string, onEvent: (event: GameEvent) => void): { unsubscribe: () => void };
}

export class MockNbaProvider implements NbaProvider {
	async getUpcomingGames(): Promise<UpcomingGame[]> {
		return [
			{ id: 'g1', startTimeIso: new Date().toISOString(), homeTeamId: 'LAL', awayTeamId: 'GSW' },
			{ id: 'g2', startTimeIso: new Date().toISOString(), homeTeamId: 'BOS', awayTeamId: 'NYK' },
		];
	}
	async getGameStatus(gameId: string): Promise<GameStatus> {
		return { id: gameId, quarter: 2, clock: '05:32', score: { home: 54, away: 49 }, status: 'live' };
	}
	async getHistoricalTeamStats({ teamId, season }: { teamId: string; season: string }): Promise<HistoricalTeamStats> {
		return { teamId, season, wins: 50, losses: 32, ppg: 112.3, oppg: 109.4 };
	}
	async getGameBoxScore(gameId: string): Promise<GameBoxScore> {
		return { gameId, players: [{ playerId: 'p1', teamId: 'LAL', pts: 28, reb: 8, ast: 7 }] };
	}
	streamGameEvents(_gameId: string, onEvent: (event: GameEvent) => void) {
		const interval = setInterval(() => {
			onEvent({ type: 'score', teamId: 'LAL', points: 2, gameClock: '04:12' });
		}, 2000);
		return { unsubscribe: () => clearInterval(interval) };
	}
}
