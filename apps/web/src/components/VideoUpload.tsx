import React, { useState, useRef } from 'react';

interface VideoUploadProps {
  lessonId: string;
  existingVideoUrl?: string;
  onUploadComplete: (videoUrl: string) => void;
  onCancel: () => void;
}

export function VideoUpload({ lessonId, existingVideoUrl, onUploadComplete, onCancel }: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    setError(null);
    
    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only video files (MP4, WebM, OGG) are allowed');
      return;
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 100MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          onUploadComplete(response.videoUrl);
        } else {
          const error = JSON.parse(xhr.responseText);
          setError(error.message || 'Upload failed');
          setUploading(false);
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        setError('Upload failed. Please try again.');
        setUploading(false);
      });

      // Start upload
      xhr.open('POST', `/api/lessons/${lessonId}/upload`);
      xhr.setRequestHeader('credentials', 'include');
      xhr.send(formData);

    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-strong border border-neutral-200 animate-bounce-in">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4a4 4 0 015.5.5c.5.5 1 1.5 1 2.5v1h3a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900 font-display">
                {existingVideoUrl ? 'Replace Video' : 'Upload Video'}
              </h3>
              <p className="text-sm text-neutral-500">
                {existingVideoUrl ? 'Upload a new video to replace the current one' : 'Add a video file to your lesson'}
              </p>
            </div>
          </div>

          {/* Current video info */}
          {existingVideoUrl && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Current Video</p>
                    <p className="text-sm text-blue-600">Video is already uploaded for this lesson</p>
                  </div>
                </div>
                <a
                  href={`http://localhost:3001${existingVideoUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Preview →
                </a>
              </div>
            </div>
          )}

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

          {!file ? (
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary-400 bg-primary-50' 
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
              onDrop={handleDrop}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
            >
              <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                Drop your video here, or click to browse
              </h4>
              <p className="text-sm text-neutral-600 mb-4">
                Supports MP4, WebM, and OGG files up to 100MB
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* File info */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">{file.name}</p>
                    <p className="text-sm text-neutral-600">{formatFileSize(file.size)}</p>
                  </div>
                  {!uploading && (
                    <button
                      onClick={() => setFile(null)}
                      className="text-neutral-400 hover:text-neutral-600 ml-3"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Upload progress */}
              {uploading && (
                <div>
                  <div className="flex items-center justify-between text-sm text-neutral-600 mb-2">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3 mt-6">
            <button
              onClick={onCancel}
              disabled={uploading}
              className="btn-outline w-full sm:w-auto"
            >
              Cancel
            </button>
            {file && !uploading && (
              <button
                onClick={uploadFile}
                className="btn-primary w-full sm:w-auto"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Video
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
