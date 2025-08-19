import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen gradient-court flex items-center justify-center">
      <div className="text-center">
        {/* Basketball Loading Animation */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-strong animate-bounce-gentle">
            <svg 
              className="w-10 h-10 text-white animate-pulse" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="9" strokeWidth={2} />
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
              <path d="M12 3v6m0 6v6" strokeWidth={2} />
              <path d="M3 12h6m6 0h6" strokeWidth={2} />
            </svg>
          </div>
          
          {/* Bouncing dots */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-neutral-900 font-display mb-2">
          ArcHoops
        </h2>
        <p className="text-neutral-600 animate-pulse">{message}</p>
      </div>
    </div>
  );
}
