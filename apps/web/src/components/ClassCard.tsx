import React, { useState } from 'react';
import { ClassSummary } from '@archoops/types';

interface ClassCardProps {
  classData: ClassSummary;
  onDelete?: (classId: string) => void;
  onRotateCode?: (classId: string) => void;
  onLeave?: (classId: string) => void;
  isTeacher?: boolean;
}

export function ClassCard({ classData, onDelete, onRotateCode, onLeave, isTeacher = false }: ClassCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(classData.joinCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy join code:', error);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      onDelete(classData.id);
    }
  };

  const handleRotateCode = () => {
    if (onRotateCode && window.confirm('Are you sure you want to rotate the join code? Students will need the new code to join.')) {
      onRotateCode(classData.id);
    }
  };

  const handleLeave = () => {
    if (onLeave && window.confirm('Are you sure you want to leave this class? You can always join again with the class code.')) {
      onLeave(classData.id);
    }
  };

  return (
    <div className="card-hover group">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M9 7h6m-6 4h6m-6 4h6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 font-display group-hover:text-primary-600 transition-colors">
                  {classData.name}
                </h3>
                <p className="text-sm text-neutral-500">
                  {classData.studentCount || 0} student{(classData.studentCount || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {(isTeacher || onLeave) && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-all duration-200 focus-ring opacity-0 group-hover:opacity-100"
                aria-label="More options"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {showActions && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-strong py-2 z-20 border border-neutral-200 animate-slide-down">
                  {isTeacher ? (
                    <>
                      <button
                        onClick={handleRotateCode}
                        className="flex items-center w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Rotate Join Code
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center w-full text-left px-4 py-2.5 text-sm text-error-600 hover:bg-error-50 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Class
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleLeave}
                      className="flex items-center w-full text-left px-4 py-2.5 text-sm text-warning-600 hover:bg-warning-50 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-3 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Leave Class
                    </button>
                  )}
                </div>
              )}

              {showActions && (
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />
              )}
            </div>
          )}
        </div>

        {/* Join Code Section */}
        <div className="bg-neutral-50 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-1">
                Class Code
              </p>
              <code className="text-lg font-mono font-bold text-primary-600 tracking-wider">
                {classData.joinCode}
              </code>
            </div>
            <button
              onClick={handleCopyCode}
              className={`p-2.5 rounded-xl transition-all duration-200 focus-ring ${
                copySuccess 
                  ? 'bg-success-100 text-success-600' 
                  : 'bg-white text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 shadow-soft'
              }`}
              title={copySuccess ? 'Copied!' : 'Copy join code'}
            >
              {copySuccess ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Class Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl">
            <p className="text-xl font-bold text-secondary-700">0</p>
            <p className="text-xs text-secondary-600 font-medium">Predictions</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-success-50 to-success-100 rounded-xl">
            <p className="text-xl font-bold text-success-700">0</p>
            <p className="text-xs text-success-600 font-medium">Lessons</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Created {new Date(classData.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success-400 rounded-full"></div>
            <span>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
