import React from 'react';
import { GameSummary } from '@archoops/types';

interface GameCardProps {
  game: GameSummary;
  onPredict?: (gameId: string) => void;
  hasPrediction?: boolean;
  predictionStatus?: 'pending' | 'correct' | 'incorrect';
}

export function GameCard({ game, onPredict, hasPrediction, predictionStatus }: GameCardProps) {
  const gameDate = new Date(game.gameDate);
  const isLive = game.status === 'LIVE';
  const isCompleted = game.status === 'COMPLETED';
  const isScheduled = game.status === 'SCHEDULED';
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = () => {
    if (isLive) return 'text-red-600 bg-red-50';
    if (isCompleted) return 'text-gray-600 bg-gray-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getPredictionStatusColor = () => {
    if (predictionStatus === 'correct') return 'text-green-600 bg-green-50 border-green-200';
    if (predictionStatus === 'incorrect') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-soft hover:shadow-hover transition-all duration-200">
      {/* Header with date and status */}
      <div className="px-4 py-3 border-b border-neutral-100 flex justify-between items-center">
        <div className="text-sm text-neutral-600">
          {formatDate(gameDate)} • {formatTime(gameDate)}
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {isLive && '🔴 LIVE'}
          {isCompleted && '✅ FINAL'}
          {isScheduled && '⏰ SCHEDULED'}
          {game.isFakeGame && ' (Practice)'}
        </div>
      </div>

      {/* Teams and Score */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          {/* Away Team */}
          <div className="flex items-center space-x-3 flex-1">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm"
              style={{ backgroundColor: game.awayTeam.primaryColor }}
            >
              {game.awayTeam.abbreviation}
            </div>
            <div>
              <div className="font-semibold text-neutral-900">{game.awayTeam.abbreviation}</div>
              <div className="text-sm text-neutral-600">{game.awayTeam.fullName}</div>
            </div>
          </div>

          {/* Score or VS */}
          <div className="px-4 text-center">
            {isCompleted && game.awayScore !== undefined && game.homeScore !== undefined ? (
              <div className="text-2xl font-bold text-neutral-900">
                {game.awayScore} - {game.homeScore}
              </div>
            ) : (
              <div className="text-lg font-medium text-neutral-500">VS</div>
            )}
          </div>

          {/* Home Team */}
          <div className="flex items-center space-x-3 flex-1 justify-end">
            <div className="text-right">
              <div className="font-semibold text-neutral-900">{game.homeTeam.abbreviation}</div>
              <div className="text-sm text-neutral-600">{game.homeTeam.fullName}</div>
            </div>
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm"
              style={{ backgroundColor: game.homeTeam.primaryColor }}
            >
              {game.homeTeam.abbreviation}
            </div>
          </div>
        </div>

        {/* Prediction Status */}
        {hasPrediction && (
          <div className={`mb-3 px-3 py-2 rounded-lg border text-sm font-medium ${getPredictionStatusColor()}`}>
            {predictionStatus === 'pending' && '🎯 Prediction submitted'}
            {predictionStatus === 'correct' && '🎉 Correct prediction! +points'}
            {predictionStatus === 'incorrect' && '😔 Prediction was incorrect'}
          </div>
        )}

        {/* Action Button */}
        {onPredict && isScheduled && !hasPrediction && (
          <button
            onClick={() => onPredict(game.id)}
            className="w-full py-2.5 px-4 gradient-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Make Prediction
          </button>
        )}

        {hasPrediction && isScheduled && (
          <button
            onClick={() => onPredict && onPredict(game.id)}
            className="w-full py-2.5 px-4 bg-neutral-100 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Update Prediction
          </button>
        )}

        {(isLive || isCompleted) && !onPredict && (
          <div className="text-center text-sm text-neutral-500 py-2">
            {isLive ? 'Game in progress' : 'Game completed'}
          </div>
        )}
      </div>
    </div>
  );
}
