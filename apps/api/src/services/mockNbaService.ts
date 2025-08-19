import { prisma } from '../prisma.js';

// NBA Teams data with realistic information
export const NBA_TEAMS = [
  // Eastern Conference - Atlantic Division
  { abbreviation: 'BOS', fullName: 'Boston Celtics', city: 'Boston', conference: 'EASTERN', division: 'Atlantic', primaryColor: '#007A33', secondaryColor: '#BA9653' },
  { abbreviation: 'BKN', fullName: 'Brooklyn Nets', city: 'Brooklyn', conference: 'EASTERN', division: 'Atlantic', primaryColor: '#000000', secondaryColor: '#FFFFFF' },
  { abbreviation: 'NYK', fullName: 'New York Knicks', city: 'New York', conference: 'EASTERN', division: 'Atlantic', primaryColor: '#006BB6', secondaryColor: '#F58426' },
  { abbreviation: 'PHI', fullName: 'Philadelphia 76ers', city: 'Philadelphia', conference: 'EASTERN', division: 'Atlantic', primaryColor: '#006BB6', secondaryColor: '#ED174C' },
  { abbreviation: 'TOR', fullName: 'Toronto Raptors', city: 'Toronto', conference: 'EASTERN', division: 'Atlantic', primaryColor: '#CE1141', secondaryColor: '#000000' },
  
  // Eastern Conference - Central Division
  { abbreviation: 'CHI', fullName: 'Chicago Bulls', city: 'Chicago', conference: 'EASTERN', division: 'Central', primaryColor: '#CE1141', secondaryColor: '#000000' },
  { abbreviation: 'CLE', fullName: 'Cleveland Cavaliers', city: 'Cleveland', conference: 'EASTERN', division: 'Central', primaryColor: '#860038', secondaryColor: '#FDBB30' },
  { abbreviation: 'DET', fullName: 'Detroit Pistons', city: 'Detroit', conference: 'EASTERN', division: 'Central', primaryColor: '#C8102E', secondaryColor: '#1D42BA' },
  { abbreviation: 'IND', fullName: 'Indiana Pacers', city: 'Indiana', conference: 'EASTERN', division: 'Central', primaryColor: '#002D62', secondaryColor: '#FDBB30' },
  { abbreviation: 'MIL', fullName: 'Milwaukee Bucks', city: 'Milwaukee', conference: 'EASTERN', division: 'Central', primaryColor: '#00471B', secondaryColor: '#EEE1C6' },
  
  // Eastern Conference - Southeast Division
  { abbreviation: 'ATL', fullName: 'Atlanta Hawks', city: 'Atlanta', conference: 'EASTERN', division: 'Southeast', primaryColor: '#E03A3E', secondaryColor: '#C1D32F' },
  { abbreviation: 'CHA', fullName: 'Charlotte Hornets', city: 'Charlotte', conference: 'EASTERN', division: 'Southeast', primaryColor: '#1D1160', secondaryColor: '#00788C' },
  { abbreviation: 'MIA', fullName: 'Miami Heat', city: 'Miami', conference: 'EASTERN', division: 'Southeast', primaryColor: '#98002E', secondaryColor: '#F9A01B' },
  { abbreviation: 'ORL', fullName: 'Orlando Magic', city: 'Orlando', conference: 'EASTERN', division: 'Southeast', primaryColor: '#0077C0', secondaryColor: '#C4CED4' },
  { abbreviation: 'WAS', fullName: 'Washington Wizards', city: 'Washington', conference: 'EASTERN', division: 'Southeast', primaryColor: '#002B5C', secondaryColor: '#E31837' },
  
  // Western Conference - Northwest Division
  { abbreviation: 'DEN', fullName: 'Denver Nuggets', city: 'Denver', conference: 'WESTERN', division: 'Northwest', primaryColor: '#0E2240', secondaryColor: '#FEC524' },
  { abbreviation: 'MIN', fullName: 'Minnesota Timberwolves', city: 'Minnesota', conference: 'WESTERN', division: 'Northwest', primaryColor: '#0C2340', secondaryColor: '#236192' },
  { abbreviation: 'OKC', fullName: 'Oklahoma City Thunder', city: 'Oklahoma City', conference: 'WESTERN', division: 'Northwest', primaryColor: '#007AC1', secondaryColor: '#EF3B24' },
  { abbreviation: 'POR', fullName: 'Portland Trail Blazers', city: 'Portland', conference: 'WESTERN', division: 'Northwest', primaryColor: '#E03A3E', secondaryColor: '#000000' },
  { abbreviation: 'UTA', fullName: 'Utah Jazz', city: 'Utah', conference: 'WESTERN', division: 'Northwest', primaryColor: '#002B5C', secondaryColor: '#00471B' },
  
  // Western Conference - Pacific Division
  { abbreviation: 'GSW', fullName: 'Golden State Warriors', city: 'Golden State', conference: 'WESTERN', division: 'Pacific', primaryColor: '#1D428A', secondaryColor: '#FFC72C' },
  { abbreviation: 'LAC', fullName: 'LA Clippers', city: 'Los Angeles', conference: 'WESTERN', division: 'Pacific', primaryColor: '#C8102E', secondaryColor: '#1D428A' },
  { abbreviation: 'LAL', fullName: 'Los Angeles Lakers', city: 'Los Angeles', conference: 'WESTERN', division: 'Pacific', primaryColor: '#552583', secondaryColor: '#FDB927' },
  { abbreviation: 'PHX', fullName: 'Phoenix Suns', city: 'Phoenix', conference: 'WESTERN', division: 'Pacific', primaryColor: '#1D1160', secondaryColor: '#E56020' },
  { abbreviation: 'SAC', fullName: 'Sacramento Kings', city: 'Sacramento', conference: 'WESTERN', division: 'Pacific', primaryColor: '#5A2D81', secondaryColor: '#63727A' },
  
  // Western Conference - Southwest Division
  { abbreviation: 'DAL', fullName: 'Dallas Mavericks', city: 'Dallas', conference: 'WESTERN', division: 'Southwest', primaryColor: '#00538C', secondaryColor: '#002F5F' },
  { abbreviation: 'HOU', fullName: 'Houston Rockets', city: 'Houston', conference: 'WESTERN', division: 'Southwest', primaryColor: '#CE1141', secondaryColor: '#000000' },
  { abbreviation: 'MEM', fullName: 'Memphis Grizzlies', city: 'Memphis', conference: 'WESTERN', division: 'Southwest', primaryColor: '#5D76A9', secondaryColor: '#12173F' },
  { abbreviation: 'NOP', fullName: 'New Orleans Pelicans', city: 'New Orleans', conference: 'WESTERN', division: 'Southwest', primaryColor: '#0C2340', secondaryColor: '#C8102E' },
  { abbreviation: 'SAS', fullName: 'San Antonio Spurs', city: 'San Antonio', conference: 'WESTERN', division: 'Southwest', primaryColor: '#C4CED4', secondaryColor: '#000000' },
];

export interface MockGame {
  id: string;
  homeTeamAbbr: string;
  awayTeamAbbr: string;
  gameDate: Date;
  season: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
  homeScore?: number;
  awayScore?: number;
  isFakeGame?: boolean;
}

export class MockNbaService {
  /**
   * Initialize teams in the database if they don't exist
   */
  static async initializeTeams(): Promise<void> {
    for (const teamData of NBA_TEAMS) {
      await prisma.team.upsert({
        where: { abbreviation: teamData.abbreviation },
        update: {},
        create: teamData,
      });
    }
  }

  /**
   * Generate upcoming games for the next 10 days
   */
  static async generateUpcomingGames(): Promise<MockGame[]> {
    const games: MockGame[] = [];
    const startDate = new Date();
    const currentSeason = this.getCurrentSeason();
    
    // Generate 3-5 games per day for the next 10 days
    for (let day = 0; day < 10; day++) {
      const gameDate = new Date(startDate);
      gameDate.setDate(startDate.getDate() + day);
      
      // Skip games on Sundays (less common in NBA)
      if (gameDate.getDay() === 0) continue;
      
      const gamesPerDay = Math.floor(Math.random() * 3) + 3; // 3-5 games
      
      for (let gameNum = 0; gameNum < gamesPerDay; gameNum++) {
        const homeTeam = NBA_TEAMS[Math.floor(Math.random() * NBA_TEAMS.length)];
        let awayTeam = NBA_TEAMS[Math.floor(Math.random() * NBA_TEAMS.length)];
        
        // Ensure different teams
        while (awayTeam.abbreviation === homeTeam.abbreviation) {
          awayTeam = NBA_TEAMS[Math.floor(Math.random() * NBA_TEAMS.length)];
        }
        
        // Set realistic game times (7:00 PM, 7:30 PM, 8:00 PM, etc.)
        const gameHour = 19 + Math.floor(gameNum / 2); // 7 PM, 8 PM, 9 PM
        const gameMinute = (gameNum % 2) * 30; // :00 or :30
        gameDate.setHours(gameHour, gameMinute, 0, 0);
        
        games.push({
          id: `mock-${gameDate.getTime()}-${homeTeam.abbreviation}-${awayTeam.abbreviation}`,
          homeTeamAbbr: homeTeam.abbreviation,
          awayTeamAbbr: awayTeam.abbreviation,
          gameDate: new Date(gameDate),
          season: currentSeason,
          status: 'SCHEDULED',
        });
      }
    }
    
    return games;
  }

  /**
   * Generate some completed games with scores for historical data
   */
  static async generateHistoricalGames(count: number = 50): Promise<MockGame[]> {
    const games: MockGame[] = [];
    const currentSeason = this.getCurrentSeason();
    
    for (let i = 0; i < count; i++) {
      const gameDate = new Date();
      gameDate.setDate(gameDate.getDate() - Math.floor(Math.random() * 30) - 1); // 1-30 days ago
      
      const homeTeam = NBA_TEAMS[Math.floor(Math.random() * NBA_TEAMS.length)];
      let awayTeam = NBA_TEAMS[Math.floor(Math.random() * NBA_TEAMS.length)];
      
      while (awayTeam.abbreviation === homeTeam.abbreviation) {
        awayTeam = NBA_TEAMS[Math.floor(Math.random() * NBA_TEAMS.length)];
      }
      
      // Generate realistic NBA scores (typically 95-130 points)
      const homeScore = Math.floor(Math.random() * 35) + 95;
      const awayScore = Math.floor(Math.random() * 35) + 95;
      
      games.push({
        id: `mock-historical-${gameDate.getTime()}-${homeTeam.abbreviation}-${awayTeam.abbreviation}`,
        homeTeamAbbr: homeTeam.abbreviation,
        awayTeamAbbr: awayTeam.abbreviation,
        gameDate,
        season: currentSeason,
        status: 'COMPLETED',
        homeScore,
        awayScore,
      });
    }
    
    return games;
  }

  /**
   * Create fake practice games for off-season or educational purposes
   */
  static async generateFakeGames(count: number = 10): Promise<MockGame[]> {
    const games: MockGame[] = [];
    const currentSeason = this.getCurrentSeason();
    
    // Create interesting matchups for practice
    const interestingMatchups = [
      ['LAL', 'BOS'], ['GSW', 'CLE'], ['MIA', 'SAS'],
      ['CHI', 'DET'], ['NYK', 'BKN'], ['PHX', 'LAC'],
      ['DEN', 'MIL'], ['DAL', 'HOU'], ['ATL', 'MIA'],
      ['POR', 'UTA'], ['OKC', 'MIN'], ['PHI', 'TOR']
    ];
    
    for (let i = 0; i < Math.min(count, interestingMatchups.length); i++) {
      const [homeTeamAbbr, awayTeamAbbr] = interestingMatchups[i];
      const gameDate = new Date();
      gameDate.setDate(gameDate.getDate() + i + 1);
      gameDate.setHours(20, 0, 0, 0); // 8:00 PM
      
      games.push({
        id: `fake-game-${i + 1}`,
        homeTeamAbbr,
        awayTeamAbbr,
        gameDate,
        season: currentSeason,
        status: 'SCHEDULED',
        isFakeGame: true,
      });
    }
    
    return games;
  }

  /**
   * Seed the database with teams and initial games
   */
  static async seedDatabase(): Promise<void> {
    console.log('🏀 Initializing NBA teams...');
    await this.initializeTeams();
    
    console.log('📅 Generating upcoming games...');
    const upcomingGames = await this.generateUpcomingGames();
    
    console.log('📊 Generating historical games...');
    const historicalGames = await this.generateHistoricalGames();
    
    console.log('🎮 Generating practice games...');
    const fakeGames = await this.generateFakeGames();
    
    const allGames = [...upcomingGames, ...historicalGames, ...fakeGames];
    
    console.log(`💾 Saving ${allGames.length} games to database...`);
    
    for (const gameData of allGames) {
      const homeTeam = await prisma.team.findUnique({
        where: { abbreviation: gameData.homeTeamAbbr }
      });
      const awayTeam = await prisma.team.findUnique({
        where: { abbreviation: gameData.awayTeamAbbr }
      });
      
      if (homeTeam && awayTeam) {
        await prisma.game.upsert({
          where: { id: gameData.id },
          update: {},
          create: {
            id: gameData.id,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            gameDate: gameData.gameDate,
            season: gameData.season,
            status: gameData.status,
            homeScore: gameData.homeScore,
            awayScore: gameData.awayScore,
            isFakeGame: gameData.isFakeGame || false,
          },
        });
      }
    }
    
    console.log('✅ Database seeded successfully!');
  }

  /**
   * Get current NBA season string (e.g., "2024-25")
   */
  private static getCurrentSeason(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed
    
    // NBA season runs from October to June of the following year
    if (month >= 10) {
      return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
      return `${year - 1}-${year.toString().slice(-2)}`;
    }
  }

  /**
   * Simulate a live game with score updates
   */
  static async simulateLiveGame(gameId: string): Promise<void> {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) return;
    
    // Start with 0-0 and gradually increase scores
    let homeScore = 0;
    let awayScore = 0;
    
    await prisma.game.update({
      where: { id: gameId },
      data: { status: 'LIVE', homeScore, awayScore },
    });
    
    // Simulate score updates over time (for demo purposes, rapid updates)
    const interval = setInterval(async () => {
      // Random score increases (0-3 points per update)
      homeScore += Math.floor(Math.random() * 4);
      awayScore += Math.floor(Math.random() * 4);
      
      await prisma.game.update({
        where: { id: gameId },
        data: { homeScore, awayScore },
      });
      
      // End simulation when scores reach realistic totals
      if (homeScore > 100 || awayScore > 100) {
        await prisma.game.update({
          where: { id: gameId },
          data: { status: 'COMPLETED' },
        });
        clearInterval(interval);
      }
    }, 5000); // Update every 5 seconds
  }
}
