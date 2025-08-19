import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/AuthForm';
import { LoginInput } from '@archoops/types';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleLogin = async (data: LoginInput) => {
    try {
      setError(null);
      await login(data);
      navigate(from, { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen gradient-court flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-in">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-medium">
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" strokeWidth={2} />
                <circle cx="12" cy="12" r="3" strokeWidth={2} />
                <path d="M12 3v6m0 6v6" strokeWidth={2} />
                <path d="M3 12h6m6 0h6" strokeWidth={2} />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 font-display text-balance">
            Welcome back to <span className="text-primary-600">ArcHoops</span>! 🏀
          </h2>
          <p className="mt-3 text-neutral-600">
            Ready to dive into sports analytics and data science?
          </p>
          <p className="mt-4 text-sm text-neutral-500">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Login Form Card */}
        <div className="card p-8">
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-2xl animate-slide-down">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-error-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-error-800" role="alert">{error}</p>
              </div>
            </div>
          )}

          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-neutral-500">
          <p>Empowering the next generation of diverse STEM leaders</p>
          <p className="mt-1">through sports analytics</p>
        </div>
      </div>
    </div>
  );
}
