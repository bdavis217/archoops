import React, { useState, useEffect, useRef } from 'react';
import { LessonWithProgress, UpdateLessonProgress } from '@archoops/types';

interface LessonPlayerProps {
  lesson: LessonWithProgress;
  onProgressUpdate?: (progress: UpdateLessonProgress) => Promise<void>;
  onClose: () => void;
  isStudent?: boolean;
}

export function LessonPlayer({ lesson, onProgressUpdate, onClose, isStudent = false }: LessonPlayerProps) {
  const [showControls, setShowControls] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const isGenially = Boolean(lesson.embedCode && /genially\.com|view\.genially\.com/i.test(lesson.embedCode));

  const progress = lesson.progress?.progress || 0;
  const completed = lesson.progress?.completed || false;

  // Track time spent on lesson for progress
  useEffect(() => {
    if (!isStudent) return;

    if (hasStarted && !intervalRef.current) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Date.now() - startTimeRef.current;
          setTimeSpent(prev => prev + elapsed);
          startTimeRef.current = Date.now();

          // Update progress based on time spent (rough estimation)
          // Genially tends to be shorter; estimate 2 minutes for Genially, 5 minutes otherwise
          const estimatedTotalMs = isGenially ? (2 * 60 * 1000) : (5 * 60 * 1000);
          const estimatedProgress = Math.min((timeSpent + elapsed) / estimatedTotalMs, 1);
          
          if (estimatedProgress > progress) {
            onProgressUpdate?.({
              progress: estimatedProgress,
              lastCheckpoint: Math.floor(estimatedProgress * 100).toString(),
            });
          }
        }
      }, 10000); // Update every 10 seconds for quicker feedback
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [hasStarted, isStudent, onProgressUpdate, progress, timeSpent, isGenially]);

  // Listen for completion events from Genially via postMessage if available
  useEffect(() => {
    if (!isStudent || !isGenially) return;
    const handleMessage = (event: MessageEvent) => {
      try {
        const origin = event.origin || '';
        if (!/genially\.com|view\.genially\.com/i.test(origin)) return;
        const data = event.data;
        const asString = typeof data === 'string' ? data : JSON.stringify(data || '');
        if (/finish|finished|complete|completed|end|ended/i.test(asString)) {
          onProgressUpdate?.({ progress: 1, lastCheckpoint: '100' });
        }
      } catch {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isStudent, isGenially, onProgressUpdate]);

  const hideControlsAfterDelay = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    hideControlsAfterDelay();
  };

  const handleStartLesson = () => {
    setHasStarted(true);
    if (isStudent && !progress) {
      onProgressUpdate?.({
        progress: 0.1, // 10% for starting
        lastCheckpoint: '0',
      });
    }
  };

  const handleMarkComplete = () => {
    if (isStudent) {
      onProgressUpdate?.({
        progress: 1.0,
        lastCheckpoint: '100',
      });
    }
  };

  // Sanitize and prepare embed code for safe rendering
  const sanitizeEmbedCode = (embedCode: string) => {
    // Basic sanitization - in production, you'd want more robust sanitization
    // For now, we'll trust teacher input but could add DOMPurify or similar
    return embedCode;
  };

  const overallProgress = completed ? 100 : Math.round(progress * 100);

  return (
    <>
      <style>{`
        .lesson-embed-container {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .lesson-embed-container > div {
          width: 100% !important;
          height: 100% !important;
          position: relative !important;
          padding-bottom: 0 !important;
        }
        .lesson-embed-container > div > div {
          width: 100% !important;
          height: 100% !important;
          position: relative !important;
          padding-bottom: 0 !important;
        }
        .lesson-embed-container iframe {
          border: none !important;
          width: 100% !important;
          height: 100% !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
        }
      `}</style>
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Always-visible close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 bg-black/50 text-white/80 hover:text-white hover:bg-black/70 p-3 rounded-full transition-colors backdrop-blur-sm"
        title="Back to Lessons"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Header - Always visible */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-4 pr-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            {/* ArcHoops branding */}
            <div className="flex items-center mr-6">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8 0-1.4.4-2.7 1-3.8l2.4 2.4c-.2.4-.4.9-.4 1.4 0 1.7 1.3 3 3 3s3-1.3 3-3-1.3-3-3-3c-.5 0-.9.1-1.4.4L6.2 7C7.3 4.4 9.5 2.5 12 2.5c4.4 0 8 3.6 8 8s-3.6 8-8 8z"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <span className="text-white/80 text-sm font-medium">ArcHoops</span>
            </div>
            
            <div className="flex-1">
              <h1 className="text-white font-semibold text-lg">{lesson.title}</h1>
              {isStudent && (
                <div className="flex items-center mt-1">
                  <span className="text-white/80 text-sm mr-3">Progress: {Math.round(overallProgress)}%</span>
                  {completed && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Completed
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className="flex-1 relative"
        onMouseMove={handleMouseMove}
      >
        {!hasStarted ? (
          // Start screen
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-900 to-blue-900">
            <div className="text-center max-w-lg mx-auto p-8">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">{lesson.title}</h2>
              <p className="text-white/80 mb-8 leading-relaxed">{lesson.description}</p>
              {isStudent && progress > 0 && (
                <div className="mb-6">
                  <div className="bg-white/20 rounded-full h-2 mb-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  <p className="text-white/60 text-sm">Continue from {Math.round(overallProgress)}%</p>
                </div>
              )}
              <button
                onClick={handleStartLesson}
                className="bg-white text-purple-900 px-8 py-3 rounded-full font-semibold hover:bg-white/90 transition-colors inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                {progress > 0 ? 'Continue Lesson' : 'Start Lesson'}
              </button>
            </div>
          </div>
        ) : (
          // Embed content
          <div className="w-full h-full bg-white overflow-hidden">
            {lesson.embedCode ? (
              <div 
                className="w-full h-full lesson-embed-container"
                dangerouslySetInnerHTML={{ 
                  __html: sanitizeEmbedCode(lesson.embedCode) 
                }}
              />
            ) : lesson.videoUrl ? (
              // Fallback for legacy video files
              <div className="flex items-center justify-center h-full">
                <video
                  src={`http://localhost:3001${lesson.videoUrl}`}
                  controls
                  className="max-w-full max-h-full"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                  </svg>
                  <p>No content available for this lesson</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      {hasStarted && (
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isStudent && (
                <>
                  <span className="text-white text-sm">
                    Progress: {Math.round(overallProgress)}%
                  </span>
                  <div className="bg-white/20 rounded-full h-2 w-32">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {isStudent && !completed && (
                <button
                  onClick={handleMarkComplete}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Mark Complete
                </button>
              )}
              
              <div className="text-white/60 text-xs">
                Powered by ArcHoops Learning Platform
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}