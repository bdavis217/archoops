import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GameSummary, Game, CreatePrediction } from '@archoops/types';
import { GameCard } from './GameCard';
import { PredictionForm } from './PredictionForm';

export function UpcomingGamesList() {
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
    mutationFn: async ({ prediction, existingPredictionId }: { prediction: CreatePrediction, existingPredictionId?: string }) => {
      if (existingPredictionId) {
        // Update existing prediction
        console.log('Updating prediction with ID:', existingPredictionId);
        console.log('Update payload:', JSON.stringify(prediction, null, 2));
        const response = await fetch(`/api/predictions/${existingPredictionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(prediction),
        });
        console.log('Update response status:', response.status);
        if (!response.ok) {
          const error = await response.json();
          console.log('Update error response:', error);
          throw new Error(error.message || 'Failed to update prediction');
        }
        return response.json();
      } else {
        // Create new prediction
        const response = await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(prediction),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create prediction');
        }
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
      setShowPredictionForm(false);
      setSelectedGame(null);
      setSelectedPrediction(null);
    },
  });

  // Delete prediction mutation
  const deletePredictionMutation = useMutation({
    mutationFn: async (predictionId: string) => {
      const response = await fetch(`/api/predictions/${predictionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete prediction');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });

  const handlePredict = async (gameId: string) => {
    // Fetch full game details
    try {
      const response = await fetch(`/api/games/${gameId}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch game details');
      }
      const game: Game = await response.json();
      setSelectedGame(game);
      
      // Check if user has existing prediction for this game
      const existingPrediction = getUserPredictionForGame(gameId);
      setSelectedPrediction(existingPrediction || null);
      
      setShowPredictionForm(true);
    } catch (error) {
      console.error('Error fetching game:', error);
    }
  };

  const handleRemovePrediction = async (gameId: string) => {
    const existingPrediction = getUserPredictionForGame(gameId);
    if (existingPrediction && window.confirm('Are you sure you want to remove your prediction for this game?')) {
      try {
        await deletePredictionMutation.mutateAsync(existingPrediction.id);
      } catch (error) {
        console.error('Error removing prediction:', error);
        alert('Failed to remove prediction. Please try again.');
      }
    }
  };

  const handleSubmitPrediction = async (prediction: CreatePrediction) => {
    await createPredictionMutation.mutateAsync({ 
      prediction, 
      existingPredictionId: selectedPrediction?.id 
    });
  };

  const getUserPredictionForGame = (gameId: string) => {
    return predictions?.find((p: any) => p.gameId === gameId);
  };

  const getPredictionStatus = (gameId: string, gameStatus: string) => {
    const prediction = getUserPredictionForGame(gameId);
    if (!prediction) return undefined;
    
    if (gameStatus === 'COMPLETED') {
      return prediction.accuracyScore && prediction.accuracyScore > 50 ? 'correct' : 'incorrect';
    }
    return 'pending';
  };

  if (gamesLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-neutral-900">Upcoming Games</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse">
              <div className="flex justify-between items-center mb-4">
                <div className="h-4 bg-neutral-200 rounded w-24"></div>
                <div className="h-6 bg-neutral-200 rounded-full w-16"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-neutral-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-12"></div>
                    <div className="h-3 bg-neutral-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="text-lg font-medium text-neutral-300">VS</div>
                <div className="flex items-center space-x-3">
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-12"></div>
                    <div className="h-3 bg-neutral-200 rounded w-20"></div>
                  </div>
                  <div className="w-12 h-12 bg-neutral-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏀</div>
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Upcoming Games</h3>
        <p className="text-neutral-600">
          Check back later for new games to predict on, or try some practice games!
        </p>
      </div>
    );
  }

  // Group games by date
  const gamesByDate = games.reduce((acc, game) => {
    const date = new Date(game.gameDate).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(game);
    return acc;
  }, {} as Record<string, GameSummary[]>);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-900">Upcoming Games</h2>
        <div className="text-sm text-neutral-600">
          {games.length} games available for predictions
        </div>
      </div>

      {Object.entries(gamesByDate).map(([date, dayGames]) => {
        const gameDate = new Date(date);
        const isToday = gameDate.toDateString() === new Date().toDateString();
        const isTomorrow = gameDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
        
        let dateLabel = gameDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        });
        
        if (isToday) dateLabel = `Today, ${dateLabel.split(', ')[1]}`;
        if (isTomorrow) dateLabel = `Tomorrow, ${dateLabel.split(', ')[1]}`;

        return (
          <div key={date} className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-800 border-b border-neutral-200 pb-2">
              {dateLabel}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dayGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onPredict={handlePredict}
                  onRemovePrediction={handleRemovePrediction}
                  hasPrediction={!!getUserPredictionForGame(game.id)}
                  predictionStatus={getPredictionStatus(game.id, game.status)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Prediction Form Modal */}
      {showPredictionForm && selectedGame && (
        <PredictionForm
          game={selectedGame}
          onSubmit={handleSubmitPrediction}
          onCancel={() => {
            setShowPredictionForm(false);
            setSelectedGame(null);
            setSelectedPrediction(null);
          }}
          isLoading={createPredictionMutation.isPending}
          existingPrediction={selectedPrediction ? {
            gameId: selectedPrediction.gameId,
            predictionType: selectedPrediction.predictionType,
            predictedWinner: selectedPrediction.predictedWinner,
            predictedHomeScore: selectedPrediction.predictedHomeScore,
            predictedAwayScore: selectedPrediction.predictedAwayScore,
          } : undefined}
          isUpdate={!!selectedPrediction}
        />
      )}
    </div>
  );
}
