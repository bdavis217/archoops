import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { NextLessonCard } from '../components/NextLessonCard';
import { DashboardGamesList } from '../components/DashboardGamesList';
import { DashboardLeaderboard } from '../components/DashboardLeaderboard';
import { LessonPlayer } from '../components/LessonPlayer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LessonWithProgress, UpdateLessonProgress } from '@archoops/types';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedLesson, setSelectedLesson] = useState<LessonWithProgress | null>(null);
  const [showLessonPlayer, setShowLessonPlayer] = useState(false);
  const queryClient = useQueryClient();

  // Update lesson progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (data: UpdateLessonProgress) => {
      const response = await fetch(`/api/lessons/${selectedLesson?.id}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update progress');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['points'] });
    },
  });

  const handleStartLesson = async (lessonId: string) => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch lesson details');
      }
      const lesson: LessonWithProgress = await response.json();
      setSelectedLesson(lesson);
      setShowLessonPlayer(true);
    } catch (error) {
      console.error('Error fetching lesson:', error);
    }
  };

  const handleProgressUpdate = async (progress: UpdateLessonProgress) => {
    await updateProgressMutation.mutateAsync(progress);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <Header />
        
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 font-display mb-2">
              Welcome, <span className="text-orange-600">{user.displayName}</span>! 🏀
            </h1>
            <p className="text-neutral-600">
              Ready to make some predictions and learn about sports analytics?
            </p>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px] lg:h-auto">
            {/* Left Section - Next Lesson */}
            <div className="lg:col-span-1 h-full">
              <NextLessonCard onStartLesson={handleStartLesson} />
            </div>
            
            {/* Center Section - Upcoming Games */}
            <div className="lg:col-span-1 h-full">
              <DashboardGamesList />
            </div>
            
            {/* Right Section - Leaderboard */}
            <div className="lg:col-span-1 h-full">
              <DashboardLeaderboard />
            </div>
          </div>
        </main>
      </div>

      {/* Lesson Player Modal */}
      {showLessonPlayer && selectedLesson && (
        <div className="fixed inset-0 bg-neutral-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <LessonPlayer
              lesson={selectedLesson}
              onProgressUpdate={handleProgressUpdate}
              onClose={() => {
                setShowLessonPlayer(false);
                setSelectedLesson(null);
              }}
              isStudent={user.role === 'student'}
            />
          </div>
        </div>
      )}
    </>
  );
}
