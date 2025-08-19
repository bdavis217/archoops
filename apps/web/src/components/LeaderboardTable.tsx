import { useState } from 'react';
import { LeaderboardEntry } from '@archoops/types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  isLoading?: boolean;
}

export function LeaderboardTable({ entries, currentUserId, isLoading = false }: LeaderboardTableProps) {
  const [sortBy, setSortBy] = useState<'points' | 'accuracy' | 'streak'>('points');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-neutral-200 rounded w-8"></div>
                <div className="h-4 bg-neutral-200 rounded w-32"></div>
                <div className="h-4 bg-neutral-200 rounded w-16"></div>
                <div className="h-4 bg-neutral-200 rounded w-16"></div>
                <div className="h-4 bg-neutral-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 text-center">
        <svg className="h-12 w-12 text-neutral-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-neutral-900 mb-2">No Rankings Yet</h3>
        <p className="text-neutral-600">
          Make some predictions to see your ranking on the leaderboard!
        </p>
      </div>
    );
  }

  const sortedEntries = [...entries].sort((a, b) => {
    let aValue: number, bValue: number;
    
    switch (sortBy) {
      case 'accuracy':
        aValue = a.accuracyPercentage;
        bValue = b.accuracyPercentage;
        break;
      case 'streak':
        aValue = a.currentStreak;
        bValue = b.currentStreak;
        break;
      case 'points':
      default:
        aValue = a.totalPoints;
        bValue = b.totalPoints;
        break;
    }
    
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const handleSort = (column: 'points' | 'accuracy' | 'streak') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

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

  const SortButton = ({ 
    column, 
    children 
  }: { 
    column: 'points' | 'accuracy' | 'streak'; 
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center space-x-1 text-left hover:text-blue-600 transition-colors"
    >
      <span>{children}</span>
      {sortBy === column && (
        sortOrder === 'desc' 
          ? <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          : <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
      )}
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center space-x-2">
          <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-900">Class Leaderboard</h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                <SortButton column="points">Points</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                <SortButton column="accuracy">Accuracy</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Predictions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                <SortButton column="streak">Current Streak</SortButton>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {sortedEntries.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.userId === currentUserId;
              
              return (
                <tr 
                  key={entry.userId}
                  className={`${
                    isCurrentUser 
                      ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                      : 'hover:bg-neutral-50'
                  } transition-colors`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankIcon(rank)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {entry.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-neutral-900">
                          {entry.displayName}
                          {isCurrentUser && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-neutral-900">
                      {entry.totalPoints.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-neutral-900">
                        {entry.accuracyPercentage.toFixed(1)}%
                      </span>
                      <div className="ml-2 w-16 bg-neutral-200 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(entry.accuracyPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900">
                      <span className="font-medium">{entry.correctPredictions}</span>
                      <span className="text-neutral-500">/{entry.totalPredictions}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {entry.currentStreak > 0 && (
                        <svg className="h-4 w-4 text-orange-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                      )}
                      <span className={`text-sm font-medium ${
                        entry.currentStreak > 0 ? 'text-orange-600' : 'text-neutral-500'
                      }`}>
                        {entry.currentStreak}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile-friendly summary for current user */}
      {entries.length > 0 && (
        <div className="md:hidden px-6 py-4 bg-neutral-50 border-t border-neutral-200">
          {(() => {
            const currentUserEntry = entries.find(entry => entry.userId === currentUserId);
            const currentUserRank = currentUserEntry 
              ? entries.findIndex(entry => entry.userId === currentUserId) + 1 
              : null;
            
            if (currentUserEntry && currentUserRank) {
              return (
                <div className="text-sm">
                  <div className="font-medium text-neutral-900 mb-1">Your Stats</div>
                  <div className="text-neutral-600">
                    Rank #{currentUserRank} • {currentUserEntry.totalPoints} points • {currentUserEntry.accuracyPercentage.toFixed(1)}% accuracy
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
}
