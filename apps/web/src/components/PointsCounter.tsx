import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserPointsSummary } from '@archoops/types';

export function PointsCounter() {
  const { data: pointsSummary, isLoading, error } = useQuery({
    queryKey: ['points', 'summary'],
    queryFn: async (): Promise<UserPointsSummary> => {
      const response = await fetch('/api/me/points/summary', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch points summary');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 1, // Only retry once on failure
  });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg px-3 py-1.5">
        <div className="animate-pulse">
          <div className="w-6 h-6 bg-yellow-200 rounded-full"></div>
        </div>
        <div className="animate-pulse">
          <div className="w-12 h-4 bg-yellow-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 bg-gradient-to-r from-red-50 to-red-50 border border-red-200 rounded-lg px-3 py-1.5">
        <div className="flex items-center justify-center w-6 h-6 bg-red-200 rounded-full">
          <span className="text-red-600 text-xs font-bold">!</span>
        </div>
        <span className="text-sm text-red-600">Points unavailable</span>
      </div>
    );
  }

  const totalPoints = pointsSummary?.totalPoints || 0;
  const pointsThisWeek = pointsSummary?.pointsThisWeek || 0;

  return (
    <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg px-3 py-1.5 hover:from-yellow-100 hover:to-orange-100 transition-colors">
      <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
        <span className="text-white text-xs font-bold">★</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-neutral-900">
          {totalPoints.toLocaleString()}
        </span>
        {pointsThisWeek > 0 && (
          <span className="text-xs text-neutral-600">
            +{pointsThisWeek} this week
          </span>
        )}
      </div>
    </div>
  );
}
