import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LessonSummary } from '@archoops/types';

interface NextLessonCardProps {
  onStartLesson?: (lessonId: string) => void;
}

export function NextLessonCard({ onStartLesson }: NextLessonCardProps) {
  // Fetch user's next lesson (incomplete lesson or most recent)
  const { data: nextLesson, isLoading } = useQuery({
    queryKey: ['lessons', 'next'],
    queryFn: async (): Promise<LessonSummary | null> => {
      const response = await fetch('/api/lessons/next', { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No lessons available
        }
        throw new Error('Failed to fetch next lesson');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-32 mb-4"></div>
          <div className="aspect-video bg-neutral-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!nextLesson) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 font-display mb-4">
          Next Lesson
        </h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No Lessons Available</h3>
          <p className="text-neutral-600">
            Check back later for new lessons!
          </p>
        </div>
      </div>
    );
  }

  const progressPercent = (nextLesson.progress || 0) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold text-neutral-900 font-display mb-4">
        Next Lesson
      </h2>
      
      {/* Lesson Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 font-display mb-2">
          {nextLesson.title}
        </h3>
        
        {/* Video Thumbnail/Preview */}
        <div className="aspect-video bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg mb-4 relative overflow-hidden group cursor-pointer"
             onClick={() => onStartLesson?.(nextLesson.id)}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:bg-white group-hover:scale-110 transition-all duration-200">
              <svg className="w-8 h-8 text-orange-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {/* Progress Indicator */}
          {progressPercent > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-300"
                style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
              />
            </div>
          )}
        </div>
        
        {/* Description */}
        <p className="text-sm text-neutral-600 mb-4 line-clamp-3">
          {nextLesson.description}
        </p>
        
        {/* Progress Status */}
        {nextLesson.completed ? (
          <div className="flex items-center text-sm text-success-600 mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Completed
          </div>
        ) : progressPercent > 0 ? (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-neutral-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
              />
            </div>
          </div>
        ) : null}
        
        {/* Action Button */}
        <button
          onClick={() => onStartLesson?.(nextLesson.id)}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          {nextLesson.completed ? 'Review Lesson' : progressPercent > 0 ? 'Continue Lesson' : 'Start Lesson'}
        </button>
      </div>
    </div>
  );
}
