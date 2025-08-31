import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { LeaderboardTable } from '../components/LeaderboardTable';
import type { Leaderboard, LeaderboardEntry } from '@archoops/types';

interface ClassOption {
  id: string;
  name: string;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch user's classes on mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch leaderboard when class selection changes
  useEffect(() => {
    if (selectedClassId) {
      fetchLeaderboard(selectedClassId);
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      setIsLoadingClasses(true);
      setError(null);

      const endpoint = (user.role === 'TEACHER' || user.role === 'ADMIN')
        ? '/api/teacher/classes'
        : '/api/student/classes';

      const response = await fetch(endpoint, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }

      const data = await response.json();
      
      if (data.length === 0) {
        setError((user.role === 'TEACHER' || user.role === 'ADMIN')
          ? 'You haven\'t created any classes yet. Create a class to see leaderboards.'
          : 'You haven\'t joined any classes yet. Join a class to see leaderboards.'
        );
        return;
      }

      setClasses(data);
      // Auto-select first class
      setSelectedClassId(data[0].id);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load classes. Please try again.');
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const fetchLeaderboard = async (classId: string) => {
    try {
      setIsLoadingLeaderboard(true);
      setError(null);

      const response = await fetch(`/api/predictions/leaderboard/${classId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have access to this class leaderboard');
        }
        throw new Error('Failed to fetch leaderboard');
      }

      const leaderboard: Leaderboard = await response.json();
      setLeaderboardData(leaderboard.entries);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard. Please try again.');
      setLeaderboardData([]);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);

  if (isLoadingClasses) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-48 mb-6"></div>
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="h-6 bg-neutral-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-neutral-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <h1 className="text-3xl font-bold text-neutral-900">Leaderboard</h1>
          </div>
          <p className="text-neutral-600">
            See how you rank against your classmates in prediction accuracy and points earned.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {classes.length > 0 && (
          <>
            {/* Class Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {(user.role === 'TEACHER' || user.role === 'ADMIN') ? 'Select Class' : 'Select Class to View'}
              </label>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="relative w-full md:w-64 bg-white border border-neutral-300 rounded-lg px-3 py-2 text-left cursor-pointer hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <span className="block truncate">
                    {selectedClass ? selectedClass.name : 'Select a class...'}
                  </span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg 
                      className={`h-5 w-5 text-neutral-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full md:w-64 bg-white shadow-lg max-h-60 rounded-lg border border-neutral-200 overflow-auto">
                    {classes.map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => {
                          setSelectedClassId(cls.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-neutral-100 ${
                          selectedClassId === cls.id ? 'bg-blue-50 text-blue-900' : 'text-neutral-900'
                        }`}
                      >
                        {cls.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Leaderboard Table */}
            {selectedClassId && (
              <LeaderboardTable
                entries={leaderboardData}
                currentUserId={user.id}
                isLoading={isLoadingLeaderboard}
              />
            )}
          </>
        )}

        {/* Empty State for No Classes */}
        {classes.length === 0 && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 text-center">
            <svg className="h-12 w-12 text-neutral-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No Classes Found</h3>
            <p className="text-neutral-600 mb-4">
              {user.role === 'teacher' 
                ? 'Create your first class to see student leaderboards.'
                : 'Join a class to see leaderboards and compete with classmates.'
              }
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>

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
