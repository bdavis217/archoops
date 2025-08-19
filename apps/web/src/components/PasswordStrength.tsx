import React from 'react';
import zxcvbn from 'zxcvbn';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const result = zxcvbn(password);
  const score = result.score; // 0-4
  const feedback = result.feedback;

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-error-500';
      case 2:
        return 'bg-warning-500';
      case 3:
        return 'bg-secondary-500';
      case 4:
        return 'bg-success-500';
      default:
        return 'bg-neutral-300';
    }
  };

  const getStrengthText = (score: number) => {
    switch (score) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  const getStrengthIcon = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 2:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 3:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 4:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-3">
      <div className="flex space-x-1 mb-3">
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              level <= score ? getStrengthColor(score) : 'bg-neutral-200'
            }`}
          />
        ))}
      </div>
      <div className="text-sm">
        <div className={`flex items-center font-medium mb-2 ${
          score <= 1 ? 'text-error-600' : 
          score === 2 ? 'text-warning-600' :
          score === 3 ? 'text-secondary-600' : 'text-success-600'
        }`}>
          {getStrengthIcon(score)}
          <span className="ml-2">{getStrengthText(score)}</span>
        </div>
        {feedback.warning && (
          <div className="p-3 bg-error-50 border border-error-200 rounded-xl mb-2">
            <p className="text-error-700 text-xs font-medium">{feedback.warning}</p>
          </div>
        )}
        {feedback.suggestions.length > 0 && (
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
            <p className="text-neutral-600 text-xs font-medium mb-1">💡 Suggestions:</p>
            <ul className="text-neutral-600 space-y-1">
              {feedback.suggestions.map((suggestion, index) => (
                <li key={index} className="text-xs flex items-start">
                  <span className="text-neutral-400 mr-2">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
