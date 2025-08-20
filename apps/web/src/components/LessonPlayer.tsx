import React, { useState, useRef, useEffect } from 'react';
import { LessonWithProgress, UpdateLessonProgress } from '@archoops/types';

interface LessonPlayerProps {
  lesson: LessonWithProgress;
  onProgressUpdate?: (progress: UpdateLessonProgress) => Promise<void>;
  onClose: () => void;
  isStudent?: boolean;
}

export function LessonPlayer({ lesson, onProgressUpdate, onClose, isStudent = false }: LessonPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const progress = lesson.progress?.progress || 0;
  const completed = lesson.progress?.completed || false;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const total = video.duration;
      setCurrentTime(current);
      
      if (isStudent && total > 0) {
        const newProgress = current / total;
        
        // Update progress every 10 seconds or when video ends
        if (newProgress - lastProgressUpdate > 0.05 || newProgress >= 0.99) {
          setLastProgressUpdate(newProgress);
          onProgressUpdate?.({
            progress: Math.min(newProgress, 1),
            lastCheckpoint: current.toString(),
          });
        }
      }
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Resume from last checkpoint for students
    if (isStudent && lesson.progress?.lastCheckpoint) {
      const lastTime = parseFloat(lesson.progress.lastCheckpoint);
      if (lastTime > 0) {
        video.currentTime = lastTime;
      }
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [isStudent, lesson.progress, lastProgressUpdate, onProgressUpdate]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const newVolume = parseFloat(e.target.value) / 100;
    
    if (video) {
      video.volume = newVolume;
    }
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const hideControlsAfterDelay = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    hideControlsAfterDelay();
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const overallProgress = progress * 100;

  return (
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

      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4 pr-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-white font-semibold text-lg">{lesson.title}</h1>
            {isStudent && (
              <div className="flex items-center mt-2">
                <span className="text-white/80 text-sm mr-3">Overall Progress: {Math.round(overallProgress)}%</span>
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

      {/* Video */}
      <div 
        className="flex-1 relative cursor-pointer"
        onMouseMove={handleMouseMove}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={lesson.videoUrl ? `http://localhost:3001${lesson.videoUrl}` : undefined}
          className="w-full h-full object-contain"
          onLoadedMetadata={() => {
            const video = videoRef.current;
            if (video) {
              setDuration(video.duration);
            }
          }}
        />

        {/* Play/Pause overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="bg-black/50 text-white p-6 rounded-full hover:bg-black/70 transition-colors"
            >
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercent}
            onChange={handleSeek}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
          />
          {isStudent && (
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>Lesson Progress: {Math.round(overallProgress)}%</span>
              <span>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          )}
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-white/80 transition-colors"
            >
              {isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.07 13.061a1 1 0 010-1.122L8.383 8.176A1 1 0 019 8.5V4a1 1 0 01.383-.924z" clipRule="evenodd" />
              </svg>
              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-white/80 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>


    </div>
  );
}
