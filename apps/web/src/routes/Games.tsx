import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { UpcomingGamesList } from '../components/UpcomingGamesList';

export default function Games() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'my-predictions' | 'leaderboard'>('upcoming');

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
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
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">My Predictions</h3>
              <p className="text-neutral-600 mb-4">
                Track your prediction history and accuracy
              </p>
              <p className="text-sm text-neutral-500">
                Coming soon! This feature is being built.
              </p>
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
