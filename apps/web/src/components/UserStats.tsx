import { useState, useEffect } from 'react';

interface UserStats {
  totalPoints: number;
  totalPredictions: number;
  correctPredictions: number;
  accuracyPercentage: number;
  currentStreak: number;
  averageRank: number | null;
  classCount: number;
}

interface UserStatsProps {
  compact?: boolean;
}

export function UserStats({ compact = false }: UserStatsProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/predictions/my-stats', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${compact ? 'flex items-center space-x-2' : 'space-y-2'}`}>
        <div className="h-4 bg-neutral-200 rounded w-16"></div>
        {!compact && <div className="h-3 bg-neutral-200 rounded w-12"></div>}
      </div>
    );
  }

  if (error || !stats) {
    return null; // Silently fail for header display
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-3 text-sm">
        {/* Points */}
        <div className="flex items-center space-x-1">
          <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-neutral-700">{stats.totalPoints.toLocaleString()}</span>
        </div>
        
        {/* Streak */}
        {stats.currentStreak > 0 && (
          <div className="flex items-center space-x-1">
            <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
            <span className="font-medium text-orange-600">{stats.currentStreak}</span>
          </div>
        )}
        
        {/* Rank */}
        {stats.averageRank && (
          <div className="text-neutral-600">
            #{stats.averageRank}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
      <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
        <svg className="h-5 w-5 text-amber-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Your Stats
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalPoints.toLocaleString()}</div>
          <div className="text-xs text-neutral-600">Points</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.accuracyPercentage.toFixed(1)}%</div>
          <div className="text-xs text-neutral-600">Accuracy</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.correctPredictions}/{stats.totalPredictions}</div>
          <div className="text-xs text-neutral-600">Correct</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${stats.currentStreak > 0 ? 'text-orange-600' : 'text-neutral-400'}`}>
            {stats.currentStreak > 0 && (
              <svg className="h-5 w-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            )}
            {stats.currentStreak}
          </div>
          <div className="text-xs text-neutral-600">Streak</div>
        </div>
      </div>

      {stats.averageRank && stats.classCount > 0 && (
        <div className="mt-4 pt-3 border-t border-neutral-200 text-center">
          <div className="text-sm text-neutral-600">
            Average Rank: <span className="font-medium text-neutral-900">#{stats.averageRank}</span>
            {stats.classCount > 1 && (
              <span className="ml-1 text-xs">across {stats.classCount} classes</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
