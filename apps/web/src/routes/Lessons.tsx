import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { LessonCard } from '../components/LessonCard';
import { LessonForm } from '../components/LessonForm';

import { LessonPlayer } from '../components/LessonPlayer';
import { 
  LessonSummary, 
  CreateLesson, 
  UpdateLesson, 
  Lesson,
  LessonWithProgress,
  UpdateLessonProgress 
} from '@archoops/types';

export default function Lessons() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<{ id: string; title: string; description: string; embedCode?: string } | null>(null);

  const [playingLesson, setPlayingLesson] = useState<LessonWithProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isTeacher = user?.role === 'teacher';

  // Fetch lessons
  const { data: lessons, isLoading, error: lessonsError } = useQuery({
    queryKey: ['lessons'],
    queryFn: async (): Promise<LessonSummary[]> => {
      const response = await fetch('/api/lessons', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch lessons');
      }
      return response.json();
    },
    enabled: !!user,
  });

  // Create lesson mutation
  const createLessonMutation = useMutation({
    mutationFn: async (data: CreateLesson) => {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create lesson');
      }
      return response.json();
    },
    onSuccess: (newLesson) => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      setShowCreateForm(false);
      setSuccess('Lesson created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Update lesson mutation
  const updateLessonMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLesson }) => {
      const response = await fetch(`/api/lessons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update lesson');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      setEditingLesson(null);
      setSuccess('Lesson updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Delete lesson mutation
  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete lesson');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      setSuccess('Lesson deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Update progress mutation (students only)
  const updateProgressMutation = useMutation({
    mutationFn: async ({ lessonId, progress }: { lessonId: string; progress: UpdateLessonProgress }) => {
      const response = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(progress),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update progress');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });

  const handleCreateLesson = async (data: CreateLesson) => {
    setError(null);
    createLessonMutation.mutate(data);
  };

  const handleUpdateLesson = async (data: UpdateLesson) => {
    if (!editingLesson) return;
    setError(null);
    updateLessonMutation.mutate({ id: editingLesson.id, data });
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }
    deleteLessonMutation.mutate(lessonId);
  };

  const handleViewLesson = async (lessonId: string) => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch lesson details');
      }
      const lesson = await response.json();
      setPlayingLesson(lesson);
    } catch (err) {
      setError('Failed to load lesson');
    }
  };



  const handleProgressUpdate = async (progress: UpdateLessonProgress) => {
    if (!playingLesson) return;
    updateProgressMutation.mutate({ lessonId: playingLesson.id, progress });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen gradient-court">
      <Header />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 animate-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 font-display">
                📚 Interactive Lessons
              </h1>
              <p className="mt-2 text-lg text-neutral-600">
                {isTeacher 
                  ? 'Create and manage educational content for your students'
                  : 'Learn data science through sports analytics'
                }
              </p>
            </div>
            
            {isTeacher && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary btn-lg mt-4 sm:mt-0 group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Lesson
              </button>
            )}
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

        {/* Lessons Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-neutral-500 font-medium">Loading lessons...</p>
          </div>
        ) : lessons && lessons.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson, index) => (
              <div 
                key={lesson.id}
                className="animate-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <LessonCard
                  lesson={lesson}
                  isTeacher={isTeacher}
                  onView={handleViewLesson}
                  onEdit={isTeacher ? async (id) => {
                    try {
                      const response = await fetch(`/api/lessons/${id}`, { credentials: 'include' });
                      if (!response.ok) throw new Error('Failed to fetch lesson');
                      const lessonData = await response.json();
                      setEditingLesson({
                        id: lessonData.id,
                        title: lessonData.title,
                        description: lessonData.description,
                        embedCode: lessonData.embedCode,
                      });
                    } catch (err) {
                      setError('Failed to load lesson for editing');
                    }
                  } : undefined}
                  onDelete={isTeacher ? handleDeleteLesson : undefined}
                  onUploadVideo={undefined}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              {isTeacher ? 'No lessons created yet' : 'No lessons available yet'}
            </h3>
            <p className="text-neutral-500 max-w-md mx-auto text-balance">
              {isTeacher 
                ? "Create your first lesson to start teaching students about sports analytics and data science!"
                : "Your teachers haven't created any lessons yet. Check back soon for exciting educational content!"
              }
            </p>
            {isTeacher && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn-primary"
                >
                  Create Your First Lesson
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateForm && (
        <LessonForm
          onSubmit={handleCreateLesson}
          onCancel={() => {
            setShowCreateForm(false);
            setError(null);
          }}
          isLoading={createLessonMutation.isPending}
        />
      )}

      {editingLesson && (
        <LessonForm
          onSubmit={handleUpdateLesson}
          onCancel={() => {
            setEditingLesson(null);
            setError(null);
          }}
          isLoading={updateLessonMutation.isPending}
          existingLesson={editingLesson}
          isUpdate={true}
        />
      )}



      {playingLesson && (
        <LessonPlayer
          lesson={playingLesson}
          onProgressUpdate={!isTeacher ? handleProgressUpdate : undefined}
          onClose={() => setPlayingLesson(null)}
          isStudent={!isTeacher}
        />
      )}
    </div>
  );
}
