import React from 'react';
import { LessonSummary } from '@archoops/types';

interface LessonCardProps {
  lesson: LessonSummary;
  isTeacher?: boolean;
  onView?: (lessonId: string) => void;
  onEdit?: (lessonId: string) => void;
  onDelete?: (lessonId: string) => void;
}

export function LessonCard({ 
  lesson, 
  isTeacher = false, 
  onView, 
  onEdit, 
  onDelete
}: LessonCardProps) {
  const progressPercent = lesson.completed ? 100 : Math.round((lesson.progress || 0) * 100);

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900 font-display mb-2">
              {lesson.title}
            </h3>
            <p className="text-sm text-neutral-600 line-clamp-3">
              {lesson.description}
            </p>
          </div>
          
          {/* Status indicator for students */}
          {!isTeacher && (
            <div className="ml-4 flex-shrink-0">
              {lesson.completed ? (
                <div className="flex items-center text-success-600">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Complete</span>
                </div>
              ) : lesson.progress && lesson.progress > 0 ? (
                <div className="flex items-center text-amber-600">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">In Progress</span>
                </div>
              ) : (
                <div className="flex items-center text-neutral-500">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-medium">Not Started</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress bar for students */}
        {!isTeacher && lesson.progress !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-neutral-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center text-xs text-neutral-500 mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Created {new Date(lesson.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView?.(lesson.id)}
            className="btn-primary btn-sm flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M9 16v-1a3 3 0 016 0v1M12 7a4 4 0 00-4 4h8a4 4 0 00-4-4z" />
            </svg>
            {isTeacher ? 'View' : lesson.completed ? 'Review' : lesson.progress && lesson.progress > 0 ? 'Continue' : 'Start'}
          </button>

          {isTeacher && (
            <>
              <button
                onClick={() => onEdit?.(lesson.id)}
                className="btn-outline btn-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              
              <button
                onClick={() => onDelete?.(lesson.id)}
                className="btn-outline btn-sm text-error-600 border-error-300 hover:bg-error-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
