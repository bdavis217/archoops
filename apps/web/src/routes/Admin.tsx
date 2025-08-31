import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Game {
  id: string;
  homeTeam: { name: string; abbreviation: string };
  awayTeam: { name: string; abbreviation: string };
  gameDate: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  predictions: { id: string }[];
}

interface GameCompletionForm {
  gameId: string;
  homeScore: number;
  awayScore: number;
}

const Admin: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch upcoming games
  const { data: upcomingGames, isLoading: loadingGames } = useQuery({
    queryKey: ['games', 'upcoming'],
    queryFn: async () => {
      const response = await fetch('/api/games/upcoming', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch games');
      return response.json();
    },
  });

  // Fetch games needing completion
  const { data: gamesNeedingUpdates } = useQuery({
    queryKey: ['admin', 'games-needing-updates'],
    queryFn: async () => {
      const response = await fetch('/api/admin/games/needing-updates', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch games needing updates');
      return response.json();
    },
  });

  // Complete game mutation
  const completeGameMutation = useMutation({
    mutationFn: async ({ gameId, homeScore, awayScore }: GameCompletionForm) => {
      const response = await fetch(`/api/admin/games/${gameId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ homeScore, awayScore }),
      });
      if (!response.ok) throw new Error('Failed to complete game');
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Game completed successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['points'] }); // Refresh points too
      setShowCompleteForm(false);
      setSelectedGame(null);
      setHomeScore(0);
      setAwayScore(0);
      alert(`Game completed! ${data.homeScore} - ${data.awayScore}`);
    },
  });

  // Simulate game completion
  const simulateGameMutation = useMutation({
    mutationFn: async (gameId: string) => {
      const response = await fetch(`/api/admin/games/${gameId}/simulate-completion`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to simulate game completion: ${error}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Game simulated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['points'] }); // Refresh points too
    },
    onError: (error) => {
      console.error('Simulation failed:', error);
      alert(`Simulation failed: ${error.message}`);
    },
  });

  // Process all completed games
  const processCompletedMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/scoring/process-completed', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to process completed games (${response.status})`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Process completed games success:', data);
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      queryClient.invalidateQueries({ queryKey: ['points'] });
      alert(data.message || 'Successfully processed all completed games!');
    },
    onError: (error) => {
      console.error('Process completed games error:', error);
      alert(`Error: ${error.message}`);
    },
  });

  const handleCompleteGame = (game: Game) => {
    setSelectedGame(game);
    setHomeScore(0);
    setAwayScore(0);
    setShowCompleteForm(true);
  };

  const handleSubmitCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGame) {
      completeGameMutation.mutate({
        gameId: selectedGame.id,
        homeScore,
        awayScore,
      });
    }
  };

  if (loadingGames) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage games and scoring</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <button
            onClick={() => processCompletedMutation.mutate()}
            disabled={processCompletedMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {processCompletedMutation.isPending ? 'Processing...' : 'Process All Completed Games'}
          </button>
        </div>
      </div>

      {/* Games Needing Updates */}
      {gamesNeedingUpdates && gamesNeedingUpdates.length > 0 && (
        <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">
            Games Needing Completion ({gamesNeedingUpdates.length})
          </h2>
          <div className="space-y-4">
            {gamesNeedingUpdates.map((game: Game) => (
              <div key={game.id} className="flex items-center justify-between p-4 bg-white rounded-md border">
                <div>
                  <div className="font-medium">
                    🏠 <span className="text-blue-600">{game.homeTeam?.name || game.homeTeam?.abbreviation || 'Home'}</span> vs ✈️ <span className="text-red-600">{game.awayTeam?.name || game.awayTeam?.abbreviation || 'Away'}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(game.gameDate).toLocaleString()} • {game.predictions?.length || 0} predictions
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCompleteGame(game)}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    Complete Manually
                  </button>
                  <button
                    onClick={() => simulateGameMutation.mutate(game.id)}
                    disabled={simulateGameMutation.isPending}
                    className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm disabled:opacity-50"
                    title="Generate random scores and complete this game"
                  >
                    {simulateGameMutation.isPending ? '🎲 Simulating...' : '🎲 Simulate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Upcoming Games */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">All Upcoming Games</h2>
        </div>
        <div className="p-6">
          {upcomingGames && upcomingGames.length > 0 ? (
            <div className="space-y-4">
              {upcomingGames.map((game: Game) => (
                              <div key={game.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <div className="font-medium">
                    🏠 <span className="text-blue-600">{game.homeTeam?.name || game.homeTeam?.abbreviation || 'Home'}</span> vs ✈️ <span className="text-red-600">{game.awayTeam?.name || game.awayTeam?.abbreviation || 'Away'}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(game.gameDate).toLocaleString()} • Status: {game.status}
                    {game.predictions && ` • ${game.predictions.length} predictions`}
                  </div>
                  {game.homeScore !== undefined && game.awayScore !== undefined && (
                    <div className="text-sm font-medium text-green-600">
                      Final: {game.homeTeam?.abbreviation || 'HOME'} {game.homeScore} - {game.awayScore} {game.awayTeam?.abbreviation || 'AWAY'}
                    </div>
                  )}
                </div>
                  <div className="flex gap-2">
                    {game.status !== 'COMPLETED' && (
                      <>
                        <button
                          onClick={() => handleCompleteGame(game)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => simulateGameMutation.mutate(game.id)}
                          disabled={simulateGameMutation.isPending}
                          className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm disabled:opacity-50"
                          title="Generate random scores and complete this game"
                        >
                          {simulateGameMutation.isPending ? '🎲 Simulating...' : '🎲 Simulate'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No upcoming games found</p>
          )}
        </div>
      </div>

      {/* Complete Game Modal */}
      {showCompleteForm && selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Complete Game: {selectedGame.homeTeam?.name || selectedGame.homeTeam?.abbreviation || 'Home'} vs {selectedGame.awayTeam?.name || selectedGame.awayTeam?.abbreviation || 'Away'}
            </h3>
            <form onSubmit={handleSubmitCompletion}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="font-bold text-blue-600">🏠 {selectedGame.homeTeam?.name || selectedGame.homeTeam?.abbreviation || 'Home Team'}</span> (Home) Score
                  </label>
                  <input
                    type="number"
                    value={homeScore}
                    onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="0"
                    max="200"
                    required
                    placeholder="Enter home team score"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="font-bold text-red-600">✈️ {selectedGame.awayTeam?.name || selectedGame.awayTeam?.abbreviation || 'Away Team'}</span> (Away) Score
                  </label>
                  <input
                    type="number"
                    value={awayScore}
                    onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="0"
                    max="200"
                    required
                    placeholder="Enter away team score"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={completeGameMutation.isPending}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {completeGameMutation.isPending ? 'Completing...' : 'Complete Game'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompleteForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
