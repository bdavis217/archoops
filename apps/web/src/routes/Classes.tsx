import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { ClassCard } from '../components/ClassCard';
import { JoinCodeInput } from '../components/JoinCodeInput';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClassSummary, CreateClassInput, JoinClassInput } from '@archoops/types';

export default function Classes() {
  const { user } = useAuth();
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-soft">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M9 7h6m-6 4h6m-6 4h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 font-display">
                My Classes
              </h1>
              <p className="text-neutral-600">
                {user.role === 'teacher' 
                  ? 'Manage your classes and track student progress'
                  : 'View and manage your enrolled classes'
                }
              </p>
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

        {/* Quick Stats for Teachers */}
        {user.role === 'teacher' && classes && classes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M9 7h6m-6 4h6m-6 4h6" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{classes.length}</p>
              <p className="text-sm text-neutral-500">Active Classes</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 text-center">
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
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-neutral-900">
                {classes.reduce((total, cls) => total + (cls.activeGames || 0), 0)}
              </p>
              <p className="text-sm text-neutral-500">Active Games</p>
            </div>
          </div>
        )}

        {/* Classes Section */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="px-6 py-5 border-b border-neutral-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 font-display">
                  {user.role === 'teacher' ? 'Your Classes' : 'Enrolled Classes'}
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {user.role === 'teacher' 
                    ? 'Create and manage your classes'
                    : 'Join classes and manage your enrollments'
                  }
                </p>
              </div>
              {user.role === 'teacher' ? (
                <button
                  onClick={() => setShowCreateClass(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Class
                </button>
              ) : (
                <button
                  onClick={() => setShowJoinClass(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group"
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
                <p className="text-neutral-500 max-w-md mx-auto text-balance mb-6">
                  {user.role === 'teacher' 
                    ? "Create your first class to start engaging students with sports analytics and data science!"
                    : "Join a class to start making predictions, learning about data science, and competing with classmates!"
                  }
                </p>
                <div>
                  {user.role === 'teacher' ? (
                    <button
                      onClick={() => setShowCreateClass(true)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all duration-200"
                    >
                      Create Your First Class
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowJoinClass(true)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all duration-200"
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
                  <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
                      className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createClassMutation.isPending}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all duration-200 w-full sm:w-auto disabled:opacity-50"
                    >
                      {createClassMutation.isPending ? (
                        <div className="flex items-center justify-center">
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
                  <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors"
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
