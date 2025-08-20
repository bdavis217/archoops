import React, { useState, useEffect } from 'react';
import { CreateLesson, UpdateLesson } from '@archoops/types';

interface LessonFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  existingLesson?: {
    title: string;
    description: string;
  };
  isUpdate?: boolean;
}

export function LessonForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false,
  existingLesson,
  isUpdate = false
}: LessonFormProps) {
  const [title, setTitle] = useState(existingLesson?.title || '');
  const [description, setDescription] = useState(existingLesson?.description || '');
  const [error, setError] = useState<string | null>(null);

  // Update form state when existingLesson prop changes
  useEffect(() => {
    if (existingLesson) {
      setTitle(existingLesson.title);
      setDescription(existingLesson.description);
    } else {
      // Reset to defaults for new lesson
      setTitle('');
      setDescription('');
    }
  }, [existingLesson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (title.length > 200) {
      setError('Title must be less than 200 characters');
      return;
    }

    if (description.length > 1000) {
      setError('Description must be less than 1000 characters');
      return;
    }

    try {
      const lessonData = {
        title: title.trim(),
        description: description.trim(),
      };

      await onSubmit(lessonData);
    } catch (err) {
      console.error('Lesson submission error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save lesson');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-strong border border-neutral-200 animate-bounce-in">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900 font-display">
                {isUpdate ? 'Edit Lesson' : 'Create New Lesson'}
              </h3>
              <p className="text-sm text-neutral-500">
                {isUpdate ? 'Update lesson details' : 'Create engaging educational content'}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-2xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-error-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-error-800">{error}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
                Lesson Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="e.g., Understanding NBA Player Statistics"
                required
                autoFocus
                maxLength={200}
              />
              <p className="text-xs text-neutral-500 mt-1">
                {title.length}/200 characters
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input min-h-[120px] resize-none"
                placeholder="Describe what students will learn in this lesson..."
                required
                maxLength={1000}
                rows={5}
              />
              <p className="text-xs text-neutral-500 mt-1">
                {description.length}/1000 characters
              </p>
            </div>

            {!isUpdate && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">Next Step</p>
                    <p className="text-sm text-blue-700">
                      After creating the lesson, you'll be able to upload a video file and add interactive elements.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="btn-outline w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full sm:w-auto"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="loading-spinner mr-2 h-4 w-4"></div>
                    {isUpdate ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isUpdate ? 'Update Lesson' : 'Create Lesson'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
