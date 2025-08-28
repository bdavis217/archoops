import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GameSummary, Game, CreatePrediction } from '@archoops/types';
import { PredictionForm } from './PredictionForm';

export function DashboardGamesList() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<any | null>(null);
  const [showPredictionForm, setShowPredictionForm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch upcoming games
  const { data: games, isLoading: gamesLoading } = useQuery({
    queryKey: ['games', 'upcoming'],
    queryFn: async (): Promise<GameSummary[]> => {
      const response = await fetch('/api/games/upcoming', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming games');
      }
      return response.json();
    },
  });

  // Fetch user's predictions
  const { data: predictions } = useQuery({
    queryKey: ['predictions', 'my'],
    queryFn: async () => {
      const response = await fetch('/api/predictions/my', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch predictions');
      }
      return response.json();
    },
  });

  // Create/Update prediction mutation
  const createPredictionMutation = useMutation({
    mutationFn: async (prediction: CreatePrediction) => {
      const isUpdate = selectedPrediction?.id;
      const url = isUpdate 
        ? `/api/predictions/${selectedPrediction.id}`
        : '/api/predictions';
      
      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(prediction),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save prediction');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
      setShowPredictionForm(false);
      setSelectedGame(null);
      setSelectedPrediction(null);
    },
  });

  const getUserPredictionForGame = (gameId: string) => {
    return predictions?.find((p: any) => p.gameId === gameId);
  };

  const handlePredict = async (gameId: string) => {
    try {
      const response = await fetch(`/api/games/${gameId}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch game details');
      }
      const game: Game = await response.json();
      setSelectedGame(game);
      
      const existingPrediction = getUserPredictionForGame(gameId);
      setSelectedPrediction(existingPrediction || null);
      
      setShowPredictionForm(true);
    } catch (error) {
      console.error('Error fetching game:', error);
    }
  };

  const handleSubmitPrediction = async (prediction: CreatePrediction) => {
    await createPredictionMutation.mutateAsync(prediction);
  };

  const formatGameTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    if (isToday) return `Today, ${timeStr}`;
    if (isTomorrow) return `Tomorrow, ${timeStr}`;
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (gamesLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 font-display mb-4">
          Upcoming Games
        </h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-neutral-200 rounded"></div>
                  <div className="h-4 bg-neutral-200 rounded w-24"></div>
                  <div className="w-8 h-8 bg-neutral-200 rounded"></div>
                </div>
                <div className="h-8 bg-neutral-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 font-display mb-4">
          Upcoming Games
        </h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No Games Scheduled</h3>
          <p className="text-neutral-600">
            Check back later for upcoming NBA games!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex flex-col h-full">
        <h2 className="text-xl font-semibold text-neutral-900 font-display mb-4">
          Upcoming Games
        </h2>
        
        {/* Fixed height scrollable container */}
        <div className="flex-1 overflow-y-auto max-h-96 pr-2 -mr-2">
          <div className="space-y-3">
            {games?.map((game) => {
            const userPrediction = getUserPredictionForGame(game.id);
            const hasPrediction = !!userPrediction;
            
            return (
              <div key={game.id} className="border border-neutral-200 rounded-lg p-4 hover:border-neutral-300 transition-colors">
                {/* Game Time */}
                <div className="text-sm text-neutral-500 mb-2">
                  {formatGameTime(game.gameDate)}
                </div>
                
                {/* Teams */}
                <div className="flex items-center justify-between mb-3">
                  {/* Away Team */}
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: game.awayTeam.primaryColor }}
                    >
                      {game.awayTeam.abbreviation}
                    </div>
                    <span className="font-medium text-neutral-900">
                      {game.awayTeam.abbreviation}
                    </span>
                  </div>
                  
                  <span className="text-neutral-400 font-medium">vs</span>
                  
                  {/* Home Team */}
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-neutral-900">
                      {game.homeTeam.abbreviation}
                    </span>
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: game.homeTeam.primaryColor }}
                    >
                      {game.homeTeam.abbreviation}
                    </div>
                  </div>
                </div>
                
                {/* Prediction Status & Action */}
                <div className="flex items-center justify-between">
                  {hasPrediction ? (
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-green-600 font-medium">My Prediction</span>
                      <span className="text-neutral-500 ml-2">
                        {userPrediction.predictedWinner}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-neutral-500">No Prediction Yet</span>
                  )}
                  
                  <button
                    onClick={() => handlePredict(game.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      hasPrediction
                        ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {hasPrediction ? 'Edit Prediction' : 'Make Prediction'}
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        </div>
        
        {/* View All Games Link - Fixed at bottom */}
        <div className="mt-4 pt-4 border-t border-neutral-200 flex-shrink-0">
          <a 
            href="/games" 
            className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center justify-center"
          >
            View All Games
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Prediction Form Modal */}
      {showPredictionForm && selectedGame && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-strong border border-neutral-200 animate-bounce-in">
            <PredictionForm
              game={selectedGame}
              onSubmit={handleSubmitPrediction}
              onCancel={() => {
                setShowPredictionForm(false);
                setSelectedGame(null);
                setSelectedPrediction(null);
              }}
              isLoading={createPredictionMutation.isPending}
              existingPrediction={selectedPrediction}
              isUpdate={!!selectedPrediction?.id}
            />
          </div>
        </div>
      )}
    </>
  );
}
