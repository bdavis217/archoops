import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PointsHistoryResponse, PointsTransaction, PointsBreakdown } from '@archoops/types';

interface PointsHistoryProps {
  userId?: string;
  limit?: number;
}

export function PointsHistory({ limit = 20 }: PointsHistoryProps) {
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set());

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['points', 'history', limit],
    queryFn: async ({ pageParam }): Promise<PointsHistoryResponse> => {
      const params = new URLSearchParams();
      params.set('limit', limit.toString());
      if (pageParam) {
        params.set('cursor', pageParam);
      }
      
      const response = await fetch(`/api/me/points?${params}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch points history');
      }
      return response.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });

  const toggleExpanded = (transactionId: string) => {
    const newExpanded = new Set(expandedTransactions);
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId);
    } else {
      newExpanded.add(transactionId);
    }
    setExpandedTransactions(newExpanded);
  };

  const formatReason = (reason: string) => {
    switch (reason) {
      case 'prediction': return 'Game Prediction';
      case 'bonus': return 'Bonus Points';
      case 'lesson': return 'Lesson Completion';
      case 'penalty': return 'Penalty';
      default: return reason;
    }
  };

  const getReasonColor = (reason: string, points: number) => {
    if (points < 0) return 'text-red-600 bg-red-50';
    
    switch (reason) {
      case 'prediction': return 'text-blue-600 bg-blue-50';
      case 'bonus': return 'text-green-600 bg-green-50';
      case 'lesson': return 'text-purple-600 bg-purple-50';
      default: return 'text-neutral-600 bg-neutral-50';
    }
  };

  const renderBreakdown = (breakdown: PointsBreakdown) => {
    return (
      <div className="mt-3 p-3 bg-neutral-50 rounded-lg text-sm">
        <h4 className="font-medium text-neutral-900 mb-2">Points Breakdown</h4>
        <div className="space-y-1 text-neutral-600">
          {breakdown.winnerPoints > 0 && (
            <div className="flex justify-between">
              <span>Winner Prediction {breakdown.details.winnerCorrect ? '✓' : '✗'}</span>
              <span className="font-medium">+{breakdown.winnerPoints}</span>
            </div>
          )}
          {breakdown.scorePoints > 0 && (
            <div className="flex justify-between">
              <span>Score Accuracy</span>
              <span className="font-medium">+{breakdown.scorePoints}</span>
            </div>
          )}
          {breakdown.playerStatPoints > 0 && (
            <div className="flex justify-between">
              <span>Player Stats</span>
              <span className="font-medium">+{breakdown.playerStatPoints}</span>
            </div>
          )}
          {breakdown.bonusPoints > 0 && (
            <div className="flex justify-between">
              <span>Bonus</span>
              <span className="font-medium">+{breakdown.bonusPoints}</span>
            </div>
          )}
          <div className="border-t border-neutral-200 pt-1 mt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>+{breakdown.totalPoints}</span>
          </div>
        </div>
        
        {breakdown.details.playerStatAccuracy && breakdown.details.playerStatAccuracy.length > 0 && (
          <div className="mt-3">
            <h5 className="font-medium text-neutral-900 mb-1">Player Stats Detail</h5>
            <div className="space-y-1">
              {breakdown.details.playerStatAccuracy.map((stat, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span>{stat.playerName} {stat.statType}</span>
                  <span>Predicted: {stat.predicted}, Actual: {stat.actual} (+{stat.points})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="h-4 bg-neutral-200 rounded w-32"></div>
              <div className="h-6 bg-neutral-200 rounded w-16"></div>
            </div>
            <div className="h-3 bg-neutral-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-600">Failed to load points history</p>
      </div>
    );
  }

  const allTransactions = data?.pages.flatMap(page => page.transactions) || [];

  if (allTransactions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">★</span>
        </div>
        <h3 className="text-lg font-medium text-neutral-900 mb-2">No Points Yet</h3>
        <p className="text-neutral-600">Make some game predictions to start earning points!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allTransactions.map((transaction) => (
        <div key={transaction.id} className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReasonColor(transaction.reason, transaction.points)}`}>
                  {formatReason(transaction.reason)}
                </span>
                <span className="text-xs text-neutral-500">
                  {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              
              {transaction.breakdown && (
                <button
                  onClick={() => toggleExpanded(transaction.id)}
                  className="text-sm text-neutral-600 hover:text-neutral-900 flex items-center space-x-1"
                >
                  <span>View breakdown</span>
                  <span className={`transform transition-transform ${expandedTransactions.has(transaction.id) ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
              )}
            </div>
            
            <div className={`text-lg font-semibold ${transaction.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.points >= 0 ? '+' : ''}{transaction.points}
            </div>
          </div>
          
          {expandedTransactions.has(transaction.id) && transaction.breakdown && (
            renderBreakdown(transaction.breakdown)
          )}
        </div>
      ))}
      
      {hasNextPage && (
        <div className="text-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700 disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
