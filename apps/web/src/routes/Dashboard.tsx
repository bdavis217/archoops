import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { ClassCard } from '../components/ClassCard';
import { JoinCodeInput } from '../components/JoinCodeInput';
import { UserStats } from '../components/UserStats';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClassSummary, CreateClassInput, JoinClassInput } from '@archoops/types';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showJoinClass, setShowJoinClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch classes based on user role
  const { data: classes, isLoading } = useQuery({
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

  // Create class mutation (teacher only)
  const createClassMutation = useMutation({
    mutationFn: async (data: CreateClassInput) => {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create class');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setShowCreateClass(false);
      setNewClassName('');
      setSuccess('Class created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Join class mutation (student only)
  const joinClassMutation = useMutation({
    mutationFn: async (data: JoinClassInput) => {
      const response = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to join class');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setShowJoinClass(false);
      setSuccess('Successfully joined class!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Leave class mutation (student only)
  const leaveClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      const response = await fetch(`/api/classes/${classId}/leave`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to leave class');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setSuccess('Successfully left the class.');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Delete class mutation (teacher only)
  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to delete class');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setSuccess('Class deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
  });

  // Rotate code mutation (teacher only)
  const rotateCodeMutation = useMutation({
    mutationFn: async (classId: string) => {
      const response = await fetch(`/api/classes/${classId}/rotate-code`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to rotate join code');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setSuccess('Join code updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
  });

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    
    setError(null);
    createClassMutation.mutate({ name: newClassName.trim() });
  };

  const handleJoinClass = async (data: JoinClassInput) => {
    setError(null);
    joinClassMutation.mutate(data);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen gradient-court">
      <Header />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-in">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 font-display text-balance">
              Welcome back, <span className="text-primary-600">{user.displayName}</span>! 🏀
            </h1>
            <div className="mt-3 flex items-center justify-center sm:justify-start space-x-3">
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                user.role === 'teacher' 
                  ? 'bg-secondary-100 text-secondary-800' 
                  : 'bg-success-100 text-success-800'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  user.role === 'teacher' ? 'bg-secondary-500' : 'bg-success-500'
                }`} />
                {user.role === 'teacher' ? '👩‍🏫 Teacher' : '🎓 Student'} Dashboard
              </div>
              <div className="hidden sm:flex items-center text-neutral-500 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-2xl animate-slide-down">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-success-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-success-800">{success}</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-2xl animate-slide-down">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-error-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-error-800">{error}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-neutral-900 font-display mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/games')}
              className="group bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl p-6 text-left transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-2xl">🏀</span>
                </div>
                <h3 className="font-semibold text-neutral-900">Game Predictions</h3>
              </div>
              <p className="text-sm text-neutral-600 mb-2">
                Predict NBA game outcomes and earn points for accuracy
              </p>
              <div className="text-xs text-blue-600 font-medium">
                Start Predicting →
              </div>
            </button>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 opacity-60">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="font-semibold text-neutral-900">Lessons</h3>
              </div>
              <p className="text-sm text-neutral-600 mb-2">
                Interactive video lessons on sports analytics
              </p>
              <div className="text-xs text-purple-600 font-medium">
                Coming Soon
              </div>
            </div>

            <button
              onClick={() => navigate('/leaderboard')}
              className="group bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 rounded-xl p-6 text-left transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 group-hover:bg-amber-200 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="font-semibold text-neutral-900">Leaderboard</h3>
              </div>
              <p className="text-sm text-neutral-600 mb-2">
                See how you rank against your classmates
              </p>
              <div className="text-xs text-amber-600 font-medium">
                View Rankings →
              </div>
            </button>
          </div>
        </div>

        {/* User Stats Summary */}
        <div className="mb-8">
          <UserStats />
        </div>

        {/* Quick Stats Cards - Only for teachers */}
        {user.role === 'teacher' && classes && classes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in">
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M9 7h6m-6 4h6m-6 4h6" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{classes.length}</p>
              <p className="text-sm text-neutral-500">Active Classes</p>
            </div>
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-neutral-900">
                {classes.reduce((total, cls) => total + (cls.studentCount || 0), 0)}
              </p>
              <p className="text-sm text-neutral-500">Total Students</p>
            </div>
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-neutral-900">0</p>
              <p className="text-sm text-neutral-500">Predictions Made</p>
            </div>
          </div>
        )}

        {/* My Classes Section */}
        <div className="card animate-in">
          <div className="px-6 py-5 border-b border-neutral-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 font-display">My Classes</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {user.role === 'teacher' 
                    ? 'Manage your classes and track student progress'
                    : 'View your enrolled classes and upcoming games'
                  }
                </p>
              </div>
              {user.role === 'teacher' ? (
                <button
                  onClick={() => setShowCreateClass(true)}
                  className="btn-primary btn-lg group"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Class
                </button>
              ) : (
                <button
                  onClick={() => setShowJoinClass(true)}
                  className="btn-secondary btn-lg group"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Join Class
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-neutral-500 font-medium">Loading your classes...</p>
                <p className="text-sm text-neutral-400 mt-1">This won't take long!</p>
              </div>
            ) : classes && classes.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {classes.map((cls, index) => (
                  <div 
                    key={cls.id}
                    className="animate-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ClassCard
                      classData={cls}
                      isTeacher={user.role === 'teacher'}
                      onDelete={user.role === 'teacher' ? (classId) => deleteClassMutation.mutate(classId) : undefined}
                      onRotateCode={user.role === 'teacher' ? (classId) => rotateCodeMutation.mutate(classId) : undefined}
                      onLeave={user.role === 'student' ? (classId) => leaveClassMutation.mutate(classId) : undefined}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-neutral-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M9 7h6m-6 4h6m-6 4h6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  {user.role === 'teacher' ? 'No classes created yet' : 'No classes joined yet'}
                </h3>
                <p className="text-neutral-500 max-w-md mx-auto text-balance">
                  {user.role === 'teacher' 
                    ? "Create your first class to start engaging students with sports analytics and data science!"
                    : "Join a class to start making predictions, learning about data science, and competing with classmates!"
                  }
                </p>
                <div className="mt-6">
                  {user.role === 'teacher' ? (
                    <button
                      onClick={() => setShowCreateClass(true)}
                      className="btn-primary"
                    >
                      Create Your First Class
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowJoinClass(true)}
                      className="btn-secondary"
                    >
                      Join Your First Class
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Class Modal */}
        {showCreateClass && (
          <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-strong border border-neutral-200 animate-bounce-in">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 font-display">Create New Class</h3>
                    <p className="text-sm text-neutral-500">Start engaging students with sports analytics</p>
                  </div>
                </div>
                
                <form onSubmit={handleCreateClass} className="space-y-6">
                  <div>
                    <label htmlFor="className" className="block text-sm font-medium text-neutral-700 mb-2">
                      Class Name
                    </label>
                    <input
                      type="text"
                      id="className"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      className="input"
                      placeholder="e.g., Period 3 Data Science, Basketball Analytics 101"
                      required
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateClass(false);
                        setNewClassName('');
                        setError(null);
                      }}
                      className="btn-outline w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createClassMutation.isPending}
                      className="btn-primary w-full sm:w-auto"
                    >
                      {createClassMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="loading-spinner mr-2 h-4 w-4"></div>
                          Creating...
                        </div>
                      ) : (
                        'Create Class'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Join Class Modal */}
        {showJoinClass && (
          <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-strong border border-neutral-200 animate-bounce-in">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-secondary-100 rounded-2xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 font-display">Join Class</h3>
                    <p className="text-sm text-neutral-500">Enter your teacher's class code</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <JoinCodeInput 
                    onSubmit={handleJoinClass} 
                    isLoading={joinClassMutation.isPending} 
                  />
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setShowJoinClass(false);
                        setError(null);
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
