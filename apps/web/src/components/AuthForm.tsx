import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignupInputSchema, LoginInputSchema, SignupInput, LoginInput } from '@archoops/types';
import { PasswordStrength } from './PasswordStrength';

interface SignupFormProps {
  onSubmit: (data: SignupInput) => Promise<void>;
  isLoading: boolean;
}

export function SignupForm({ onSubmit, isLoading }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(SignupInputSchema),
    defaultValues: {
      role: 'student',
    },
  });

  const password = watch('password', '');
  const role = watch('role');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-neutral-700 mb-2">
          Display Name
        </label>
        <input
          {...register('displayName')}
          type="text"
          id="displayName"
          className={`input ${errors.displayName ? 'input-error' : ''}`}
          placeholder="Enter your display name"
        />
        {errors.displayName && (
          <p className="mt-2 text-sm text-error-600 flex items-center" role="alert">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.displayName.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
          Email Address
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          className={`input ${errors.email ? 'input-error' : ''}`}
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="mt-2 text-sm text-error-600 flex items-center" role="alert">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
            placeholder="Enter your password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 focus-ring"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            )}
          </button>
        </div>
        <PasswordStrength password={password} />
        {errors.password && (
          <p className="mt-2 text-sm text-error-600 flex items-center" role="alert">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <fieldset>
          <legend className="block text-sm font-medium text-neutral-700 mb-3">I am a...</legend>
          <div className="grid grid-cols-2 gap-3">
            <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              role === 'student' 
                ? 'border-success-300 bg-success-50 text-success-700' 
                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
            }`}>
              <input
                {...register('role')}
                type="radio"
                value="student"
                className="sr-only"
              />
              <div className="flex flex-col items-center text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  role === 'student' ? 'bg-success-200' : 'bg-neutral-200'
                }`}>
                  🎓
                </div>
                <span className="text-sm font-medium">Student</span>
              </div>
              {role === 'student' && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </label>
            <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              role === 'teacher' 
                ? 'border-secondary-300 bg-secondary-50 text-secondary-700' 
                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
            }`}>
              <input
                {...register('role')}
                type="radio"
                value="teacher"
                className="sr-only"
              />
              <div className="flex flex-col items-center text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  role === 'teacher' ? 'bg-secondary-200' : 'bg-neutral-200'
                }`}>
                  👩‍🏫
                </div>
                <span className="text-sm font-medium">Teacher</span>
              </div>
              {role === 'teacher' && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </label>
          </div>
        </fieldset>
        {errors.role && (
          <p className="mt-2 text-sm text-error-600 flex items-center" role="alert">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.role.message}
          </p>
        )}
      </div>

      {role === 'student' && (
        <div className="animate-slide-down">
          <label htmlFor="classJoinCode" className="block text-sm font-medium text-neutral-700 mb-2">
            Class Join Code <span className="text-neutral-500">(Optional)</span>
          </label>
          <input
            {...register('classJoinCode')}
            type="text"
            id="classJoinCode"
            className={`input uppercase tracking-wider font-mono ${errors.classJoinCode ? 'input-error' : ''}`}
            placeholder="ABC123"
            maxLength={6}
          />
          <p className="mt-1 text-xs text-neutral-500">
            Ask your teacher for the 6-character class code
          </p>
          {errors.classJoinCode && (
            <p className="mt-2 text-sm text-error-600 flex items-center" role="alert">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.classJoinCode.message}
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full btn-lg"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="loading-spinner mr-3 h-5 w-5"></div>
            Creating Account...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Create Account
          </div>
        )}
      </button>
    </form>
  );
}

interface LoginFormProps {
  onSubmit: (data: LoginInput) => Promise<void>;
  isLoading: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginInputSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
          Email Address
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          className={`input ${errors.email ? 'input-error' : ''}`}
          placeholder="Enter your email"
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-2 text-sm text-error-600 flex items-center" role="alert">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 focus-ring"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-2 text-sm text-error-600 flex items-center" role="alert">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full btn-lg"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="loading-spinner mr-3 h-5 w-5"></div>
            Signing In...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In
          </div>
        )}
      </button>
      
      <div className="text-center mt-4">
        <Link 
          to="/forgot-password" 
          className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          Forgot your password?
        </Link>
      </div>
    </form>
  );
}
