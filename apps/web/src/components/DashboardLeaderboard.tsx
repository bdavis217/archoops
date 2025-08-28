import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { ClassSummary, LeaderboardEntry, UserPointsSummary } from '@archoops/types';

export function DashboardLeaderboard() {
  const { user } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch user's classes
  const { data: classes } = useQuery({
    queryKey: ['classes', user?.role],
    queryFn: async (): Promise<ClassSummary[]> => {
      const endpoint = user?.role === 'teacher' ? '/api/teacher/classes' : '/api/student/classes';
      const response = await fetch(endpoint, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }
      return response.json();
    },
    enabled: !!user,
  });

  // Set default class if not selected and classes are available
  React.useEffect(() => {
    if (classes && classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  // Fetch leaderboard for selected class
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['leaderboard', selectedClassId],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      if (!selectedClassId) return [];
      const response = await fetch(`/api/predictions/leaderboard/${selectedClassId}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const data = await response.json();
      return data.entries; // The API returns { entries: LeaderboardEntry[], ... }
    },
    enabled: !!selectedClassId,
  });

  // Fetch user's points summary
  const { data: pointsSummary } = useQuery({
    queryKey: ['points', 'summary'],
    queryFn: async (): Promise<UserPointsSummary> => {
      const response = await fetch('/api/me/points/summary', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch points summary');
      }
      return response.json();
    },
  });

  const selectedClass = classes?.find(c => c.id === selectedClassId);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-yellow-500 text-lg">🥇</span>;
      case 2:
        return <span className="text-gray-400 text-lg">🥈</span>;
      case 3:
        return <span className="text-amber-600 text-lg">🥉</span>;
      default:
        return <span className="text-neutral-500 font-medium">#{rank}</span>;
    }
  };

  if (!classes || classes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 font-display mb-4">
          Leaderboard
        </h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Join a Class</h3>
          <p className="text-neutral-600 mb-4">
            Join a class to see how you rank against your classmates!
          </p>
          <a 
            href="/classes" 
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Join Class
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold text-neutral-900 font-display mb-4">
        Leaderboard
      </h2>
      
      {/* Class Selector Dropdown */}
      {classes && classes.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Select Class to View
          </label>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="relative w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-left cursor-pointer hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <span className="block truncate text-sm">
                {selectedClass ? selectedClass.name : 'Select a class...'}
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg 
                  className={`h-4 w-4 text-neutral-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-48 rounded-lg border border-neutral-200 overflow-auto">
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 ${
                      selectedClassId === cls.id ? 'bg-orange-50 text-orange-900' : 'text-neutral-900'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{cls.name}</div>
                      <div className="text-xs text-neutral-500">Code: {cls.joinCode}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Leaderboard Table - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {leaderboardLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4 p-3">
                <div className="h-4 bg-neutral-200 rounded w-8"></div>
                <div className="h-4 bg-neutral-200 rounded w-32"></div>
                <div className="h-4 bg-neutral-200 rounded w-16 ml-auto"></div>
              </div>
            ))}
          </div>
        ) : leaderboard && leaderboard.length > 0 ? (
          <>
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-sm font-medium text-neutral-500 px-3 py-2 border-b border-neutral-200 sticky top-0 bg-white">
                <span>Rank</span>
                <span>User</span>
                <span>Points</span>
                <span>Accuracy</span>
              </div>
              {leaderboard.map((entry, index) => {
                const isCurrentUser = entry.userId === user?.id;
                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isCurrentUser 
                        ? 'bg-yellow-50 border-2 border-yellow-300' 
                        : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {getRankIcon(index + 1)}
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {entry.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className={`font-medium ${isCurrentUser ? 'text-yellow-900' : 'text-neutral-900'}`}>
                          {isCurrentUser ? `${entry.displayName} (You)` : entry.displayName}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`font-bold ${isCurrentUser ? 'text-yellow-900' : 'text-neutral-900'}`}>
                        {entry.totalPoints}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${isCurrentUser ? 'text-yellow-900' : 'text-neutral-900'}`}>
                          {entry.accuracyPercentage.toFixed(1)}%
                        </span>
                        <div className="w-12 bg-neutral-200 rounded-full h-1">
                          <div 
                            className="bg-green-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(entry.accuracyPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-neutral-500">No rankings available yet.</p>
            <p className="text-sm text-neutral-400 mt-1">Make some predictions to get started!</p>
          </div>
        )}
      </div>
      
      {/* My Coins Earned Section - Fixed at bottom */}
      {pointsSummary && (
        <div className="mt-6 pt-6 border-t border-neutral-200 flex-shrink-0">
          <h4 className="font-semibold text-neutral-900 mb-3">My Coins Earned</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🏆</span>
                <span className="text-sm font-medium text-neutral-700">Weekly High Accuracy</span>
              </div>
              <span className="font-bold text-orange-600">+{pointsSummary.pointsThisWeek || 0}</span>
            </div>
            
            {pointsSummary.recentEarnings && pointsSummary.recentEarnings.length > 0 ? (
              pointsSummary.recentEarnings.slice(0, 3).map((earning: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">⭐</span>
                    <span className="text-neutral-600">{earning.description || 'Correct Prediction'}</span>
                  </div>
                  <span className="font-medium text-green-600">+{earning.points}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-between p-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-base">⭐</span>
                  <span className="text-neutral-600">Golden State Warriors vs. LA Lakers</span>
                </div>
                <span className="font-medium text-green-600">+25</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </div>
  );
}
