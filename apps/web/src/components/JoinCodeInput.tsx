import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { JoinClassInputSchema, JoinClassInput } from '@archoops/types';

interface JoinCodeInputProps {
  onSubmit: (data: JoinClassInput) => Promise<void>;
  isLoading: boolean;
}

export function JoinCodeInput({ onSubmit, isLoading }: JoinCodeInputProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<JoinClassInput>({
    resolver: zodResolver(JoinClassInputSchema),
  });

  const code = watch('code', '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setValue('code', value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-neutral-700 mb-3">
          Enter Class Join Code
        </label>
        <div className="space-y-4">
          <div className="relative">
            <input
              {...register('code')}
              type="text"
              id="code"
              value={code}
              onChange={handleInputChange}
              maxLength={6}
              className={`input text-center font-mono text-xl tracking-[0.3em] uppercase ${
                errors.code ? 'input-error' : ''
              } ${code.length === 6 ? 'border-success-300 bg-success-50' : ''}`}
              placeholder="ABC123"
              autoFocus
            />
            {code.length === 6 && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">
              {code.length}/6 characters
            </span>
            <div className="flex space-x-1">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    i < code.length 
                      ? 'bg-primary-500' 
                      : 'bg-neutral-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="btn-secondary w-full"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="loading-spinner mr-3 h-4 w-4"></div>
                Joining Class...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Join Class
              </div>
            )}
          </button>
        </div>
        
        {errors.code && (
          <p className="mt-3 text-sm text-error-600 flex items-center" role="alert">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.code.message}
          </p>
        )}
        
        <div className="mt-4 p-3 bg-neutral-50 rounded-xl">
          <p className="text-xs text-neutral-600 text-center">
            💡 Ask your teacher for the 6-character class code
          </p>
        </div>
      </div>
    </form>
  );
}
