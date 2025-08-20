import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserPointsSummary } from '@archoops/types';
import { PointsHistory } from './PointsHistory';

export function PointsDashboard() {
  const { data: pointsSummary, isLoading, error } = useQuery({
    queryKey: ['points', 'summary'],
    queryFn: async (): Promise<UserPointsSummary> => {
      const response = await fetch('/api/me/points/summary', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch points summary');
      }
      return response.json();
    },
    retry: 1, // Only retry once on failure
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-neutral-200 p-6">
              <div className="h-4 bg-neutral-200 rounded w-24 mb-3"></div>
              <div className="h-8 bg-neutral-200 rounded w-16"></div>
            </div>
          ))}
        </div>
        <div className="animate-pulse bg-white rounded-xl border border-neutral-200 p-6">
          <div className="h-6 bg-neutral-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-medium text-neutral-900 mb-2">Unable to Load Points</h3>
        <p className="text-neutral-600 mb-4">
          There was an issue loading your points data. Please try refreshing the page.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  const summary = pointsSummary!;

  return (
    <div className="space-y-6">
      {/* Points Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">★</span>
            </div>
            <h3 className="font-semibold text-neutral-900">Total Points</h3>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{summary.totalPoints.toLocaleString()}</p>
          {summary.pointsThisWeek > 0 && (
            <p className="text-sm text-neutral-600 mt-1">+{summary.pointsThisWeek} this week</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">🎯</span>
            </div>
            <h3 className="font-semibold text-neutral-900">Accuracy</h3>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{summary.accuracyPercentage.toFixed(1)}%</p>
          <p className="text-sm text-neutral-600 mt-1">
            {summary.correctPredictions} of {summary.totalPredictions} correct
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">🔥</span>
            </div>
            <h3 className="font-semibold text-neutral-900">Current Streak</h3>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{summary.currentStreak}</p>
          <p className="text-sm text-neutral-600 mt-1">Best: {summary.bestStreak}</p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Points This Week</span>
              <span className="font-semibold text-green-600">+{summary.pointsThisWeek}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Points This Month</span>
              <span className="font-semibold text-blue-600">+{summary.pointsThisMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Total Predictions</span>
              <span className="font-semibold text-neutral-900">{summary.totalPredictions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Correct Predictions</span>
              <span className="font-semibold text-neutral-900">{summary.correctPredictions}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Achievements</h3>
          <div className="space-y-3">
            {summary.currentStreak >= 5 && (
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="font-medium text-neutral-900">Hot Streak!</p>
                  <p className="text-sm text-neutral-600">{summary.currentStreak} correct in a row</p>
                </div>
              </div>
            )}
            
            {summary.accuracyPercentage >= 80 && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="font-medium text-neutral-900">Sharp Shooter</p>
                  <p className="text-sm text-neutral-600">80%+ accuracy rate</p>
                </div>
              </div>
            )}
            
            {summary.totalPoints >= 1000 && (
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="font-medium text-neutral-900">Point Master</p>
                  <p className="text-sm text-neutral-600">1,000+ total points</p>
                </div>
              </div>
            )}
            
            {summary.totalPredictions === 0 && (
              <div className="text-center py-4 text-neutral-500">
                <p>Make your first prediction to start earning achievements!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Points History */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Points History</h3>
        <PointsHistory limit={10} />
      </div>
    </div>
  );
}
