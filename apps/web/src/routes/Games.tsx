import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { UpcomingGamesList } from '../components/UpcomingGamesList';
import { useQuery } from '@tanstack/react-query';

export default function Games() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'my-predictions' | 'leaderboard'>('upcoming');

  // Fetch user's predictions for My Predictions tab
  const { data: myPredictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ['predictions', 'my'],
    queryFn: async () => {
      const response = await fetch('/api/predictions/my', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch predictions');
      }
      return response.json();
    },
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
              <svg 
                className="w-7 h-7 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" strokeWidth={2} />
                <circle cx="12" cy="12" r="3" strokeWidth={2} />
                <path d="M12 3v6m0 6v6" strokeWidth={2} />
                <path d="M3 12h6m6 0h6" strokeWidth={2} />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 font-display">
                Game Predictions
              </h1>
              <p className="text-neutral-600">
                Predict NBA game outcomes and earn points for accuracy
              </p>
            </div>
          </div>

          {/* Welcome Message for First Time */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="text-4xl">🏀</div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Welcome to ArcHoops Predictions!
                </h3>
                <p className="text-neutral-700 mb-3">
                  Use your knowledge of basketball and data analysis to predict game outcomes. 
                  The more accurate you are, the more points you'll earn!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 font-bold">+10</span>
                    <span className="text-neutral-600">points for correct winner</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 font-bold">+50</span>
                    <span className="text-neutral-600">points for exact score</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-600 font-bold">+2x</span>
                    <span className="text-neutral-600">multiplier for upsets</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-neutral-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Upcoming Games
            </button>
            <button
              onClick={() => setActiveTab('my-predictions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'my-predictions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              My Predictions
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'leaderboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Leaderboard
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="animate-in">
          {activeTab === 'upcoming' && <UpcomingGamesList />}
          
          {activeTab === 'my-predictions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-neutral-900">My Predictions</h2>
                <div className="text-sm text-neutral-600">
                  {myPredictions ? `${myPredictions.length} predictions` : 'Loading...'}
                </div>
              </div>

              {predictionsLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-neutral-600 mt-4">Loading predictions...</p>
                </div>
              )}

              {!predictionsLoading && (!myPredictions || myPredictions.length === 0) && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Predictions Yet</h3>
                  <p className="text-neutral-600 mb-4">
                    Make some predictions on upcoming games to see them here!
                  </p>
                </div>
              )}

              {!predictionsLoading && myPredictions && myPredictions.length > 0 && (
                <div className="grid gap-4">
                  {myPredictions.map((prediction: any) => (
                    <div key={prediction.id} className="bg-white rounded-xl border border-neutral-200 p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium text-neutral-900">
                            {prediction.game?.awayTeam?.abbreviation} @ {prediction.game?.homeTeam?.abbreviation}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {prediction.game?.gameDate ? new Date(prediction.game.gameDate).toLocaleDateString() : 'Unknown date'}
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          prediction.game?.status === 'COMPLETED' 
                            ? prediction.accuracyScore && prediction.accuracyScore > 50
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {prediction.game?.status === 'COMPLETED' 
                            ? prediction.accuracyScore && prediction.accuracyScore > 50 ? 'Correct' : 'Incorrect'
                            : 'Pending'}
                        </div>
                      </div>
                      
                      <div className="text-sm text-neutral-600">
                        <div><strong>Predicted Winner:</strong> {prediction.predictedWinner}</div>
                        {prediction.predictionType === 'FINAL_SCORE' && (
                          <div><strong>Predicted Score:</strong> {prediction.predictedAwayScore} - {prediction.predictedHomeScore}</div>
                        )}
                        {prediction.pointsEarned && (
                          <div className="text-green-600 font-medium mt-1">+{prediction.pointsEarned} points</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'leaderboard' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Class Leaderboard</h3>
              <p className="text-neutral-600 mb-4">
                See how you rank against your classmates
              </p>
              <p className="text-sm text-neutral-500">
                Coming soon! This feature is being built.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
