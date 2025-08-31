import React, { useState, useEffect } from 'react';
import { Game, CreatePrediction, Prediction, PredictionTypeSchema } from '@archoops/types';

interface PredictionFormProps {
  game: Game;
  onSubmit: (prediction: CreatePrediction) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  existingPrediction?: Prediction;
  isUpdate?: boolean;
}

export function PredictionForm({ 
  game, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  existingPrediction,
  isUpdate = false
}: PredictionFormProps) {
  const [predictionType, setPredictionType] = useState<'GAME_WINNER' | 'FINAL_SCORE' | 'TEAM_THREES'>(
    (existingPrediction?.predictionType as any) || 'GAME_WINNER'
  );
  const [predictedWinner, setPredictedWinner] = useState<string>(
    existingPrediction?.predictedWinner || ''
  );
  const [predictedHomeScore, setPredictedHomeScore] = useState<number>(
    existingPrediction?.predictedHomeScore || 0
  );
  const [predictedAwayScore, setPredictedAwayScore] = useState<number>(
    existingPrediction?.predictedAwayScore || 0
  );
  const [predictedHomeThrees, setPredictedHomeThrees] = useState<number>(
    existingPrediction?.predictedHomeThrees || 0
  );
  const [predictedAwayThrees, setPredictedAwayThrees] = useState<number>(
    existingPrediction?.predictedAwayThrees || 0
  );

  // Auto-select winner based on scores
  React.useEffect(() => {
    if (predictionType === 'FINAL_SCORE' && predictedHomeScore > 0 && predictedAwayScore > 0) {
      if (predictedHomeScore > predictedAwayScore) {
        setPredictedWinner(game.homeTeam.abbreviation);
      } else if (predictedAwayScore > predictedHomeScore) {
        setPredictedWinner(game.awayTeam.abbreviation);
      }
    }
  }, [predictedHomeScore, predictedAwayScore, predictionType, game.homeTeam.abbreviation, game.awayTeam.abbreviation]);
  const [error, setError] = useState<string | null>(null);

  // Update state when existingPrediction prop changes
  useEffect(() => {
    if (existingPrediction) {
      setPredictionType(existingPrediction.predictionType as 'GAME_WINNER' | 'FINAL_SCORE' | 'TEAM_THREES');
      setPredictedWinner(existingPrediction.predictedWinner || '');
      setPredictedHomeScore(existingPrediction.predictedHomeScore || 0);
      setPredictedAwayScore(existingPrediction.predictedAwayScore || 0);
      setPredictedHomeThrees(existingPrediction.predictedHomeThrees || 0);
      setPredictedAwayThrees(existingPrediction.predictedAwayThrees || 0);
    } else {
      // Reset to defaults for new prediction
      setPredictionType('GAME_WINNER');
      setPredictedWinner('');
      setPredictedHomeScore(0);
      setPredictedAwayScore(0);
      setPredictedHomeThrees(0);
      setPredictedAwayThrees(0);
    }
  }, [existingPrediction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const prediction: CreatePrediction = {
        ...(isUpdate ? {} : { gameId: game.id }), // Only include gameId for new predictions
        predictionType,
        ...(predictionType === 'GAME_WINNER' && { predictedWinner }),
        ...(predictionType === 'FINAL_SCORE' && { 
          predictedWinner,
          predictedHomeScore,
          predictedAwayScore 
        }),
        ...(predictionType === 'TEAM_THREES' && {
          predictedHomeThrees,
          predictedAwayThrees,
        }),
      } as CreatePrediction;



      // Validation
      if (predictionType === 'GAME_WINNER' && !predictedWinner) {
        setError('Please select a winner');
        return;
      }

      if (predictionType === 'FINAL_SCORE') {
        // Check for zero scores
        if (predictedHomeScore === 0 || predictedAwayScore === 0) {
          setError('Both teams must score at least 1 point');
          return;
        }
        
        // Check for negative scores
        if (predictedHomeScore < 0 || predictedAwayScore < 0) {
          setError('Scores cannot be negative');
          return;
        }
        
        // Check for ties
        if (predictedHomeScore === predictedAwayScore) {
          setError('NBA games cannot end in a tie - one team must win');
          return;
        }

        // Winner validation (should be auto-selected, but just in case)
        if (!predictedWinner) {
          setError('Winner should be automatically selected based on scores');
          return;
        }
      }

      if (predictionType === 'TEAM_THREES') {
        if (predictedHomeThrees < 0 || predictedAwayThrees < 0) {
          setError('3-pointers made cannot be negative');
          return;
        }
        if (predictedHomeThrees > 99 || predictedAwayThrees > 99) {
          setError('Please enter a value between 0 and 99');
          return;
        }
      }

      await onSubmit(prediction);
    } catch (err) {
      console.error('Prediction submission error:', err);
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        setError(err.message);
      } else {
        console.error('Unknown error:', err);
        setError('Failed to submit prediction');
      }
    }
  };

  const gameDate = new Date(game.gameDate);
  const timeUntilGame = gameDate.getTime() - Date.now();
  const hoursUntilGame = Math.floor(timeUntilGame / (1000 * 60 * 60));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-neutral-900">
              {existingPrediction ? 'Update Prediction' : 'Make Prediction'}
            </h2>
            <button
              onClick={onCancel}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Game Info */}
          <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-6 h-6 rounded text-white text-xs flex items-center justify-center font-bold"
                  style={{ backgroundColor: game.awayTeam.primaryColor }}
                >
                  {game.awayTeam.abbreviation.slice(0, 2)}
                </div>
                <span className="font-medium">{game.awayTeam.abbreviation}</span>
                <span className="text-neutral-500">@</span>
                <span className="font-medium">{game.homeTeam.abbreviation}</span>
                <div 
                  className="w-6 h-6 rounded text-white text-xs flex items-center justify-center font-bold"
                  style={{ backgroundColor: game.homeTeam.primaryColor }}
                >
                  {game.homeTeam.abbreviation.slice(0, 2)}
                </div>
              </div>
              <div className="text-neutral-600">
                {gameDate.toLocaleDateString()} {gameDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {hoursUntilGame > 0 && (
              <div className="mt-2 text-xs text-neutral-500">
                Game starts in {hoursUntilGame} hours
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Prediction Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Prediction Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPredictionType('GAME_WINNER')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  predictionType === 'GAME_WINNER'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="font-medium">Winner Only</div>
                <div className="text-xs opacity-75">10 points</div>
              </button>
              <button
                type="button"
                onClick={() => setPredictionType('FINAL_SCORE')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  predictionType === 'FINAL_SCORE'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="font-medium">Final Score</div>
                <div className="text-xs opacity-75">Up to 50 points</div>
              </button>
              <button
                type="button"
                onClick={() => setPredictionType('TEAM_THREES')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  predictionType === 'TEAM_THREES'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="font-medium">3 Pointers</div>
                <div className="text-xs opacity-75">Up to 25 points</div>
              </button>
            </div>
          </div>

          {/* Winner Selection */}
          {predictionType === 'GAME_WINNER' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Who will win?
                <span className="ml-2 text-xs text-gray-500">
                  Current: {predictedWinner || 'None selected'}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPredictedWinner(game.awayTeam.abbreviation);
                  }}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    predictedWinner === game.awayTeam.abbreviation
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded text-white text-sm flex items-center justify-center font-bold"
                      style={{ backgroundColor: game.awayTeam.primaryColor }}
                    >
                      {game.awayTeam.abbreviation.slice(0, 2)}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{game.awayTeam.abbreviation}</div>
                      <div className="text-sm text-neutral-600">{game.awayTeam.city}</div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPredictedWinner(game.homeTeam.abbreviation);
                  }}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    predictedWinner === game.homeTeam.abbreviation
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded text-white text-sm flex items-center justify-center font-bold"
                      style={{ backgroundColor: game.homeTeam.primaryColor }}
                    >
                      {game.homeTeam.abbreviation.slice(0, 2)}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{game.homeTeam.abbreviation}</div>
                      <div className="text-sm text-neutral-600">{game.homeTeam.city}</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Score Prediction */}
          {predictionType === 'FINAL_SCORE' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Final Score
              </label>
              <div className="grid grid-cols-3 gap-3 items-center">
                <div>
                  <label className="block text-xs text-neutral-600 mb-1">
                    {game.awayTeam.abbreviation}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={predictedAwayScore}
                    onChange={(e) => setPredictedAwayScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="text-center text-neutral-500 font-medium">-</div>
                <div>
                  <label className="block text-xs text-neutral-600 mb-1">
                    {game.homeTeam.abbreviation}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={predictedHomeScore}
                    onChange={(e) => setPredictedHomeScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-2 text-xs text-neutral-500">
                NBA games typically range from 95-130 points per team
              </div>
            </div>
          )}

          {/* Team Threes Prediction */}
          {predictionType === 'TEAM_THREES' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                3 Pointers Made
              </label>
              <div className="grid grid-cols-3 gap-3 items-center">
                <div>
                  <label className="block text-xs text-neutral-600 mb-1">
                    {game.awayTeam.abbreviation}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={predictedAwayThrees}
                    onChange={(e) => setPredictedAwayThrees(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="text-center text-neutral-500 font-medium">-</div>
                <div>
                  <label className="block text-xs text-neutral-600 mb-1">
                    {game.homeTeam.abbreviation}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={predictedHomeThrees}
                    onChange={(e) => setPredictedHomeThrees(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-2 text-xs text-neutral-500">
                Typical NBA team 3PM range: 8-18
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 gradient-primary text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : existingPrediction ? 'Update' : 'Submit'} Prediction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
