import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingScreen } from './components/LoadingScreen';
import './index.css';

const Login = React.lazy(() => import('./routes/Login'));
const Signup = React.lazy(() => import('./routes/Signup'));
const Dashboard = React.lazy(() => import('./routes/Dashboard'));
const Games = React.lazy(() => import('./routes/Games'));
const ForgotPassword = React.lazy(() => import('./routes/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./routes/ResetPassword'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter([
  { 
    path: '/login', 
    element: <React.Suspense fallback={<LoadingScreen message="Loading sign in..." />}><Login /></React.Suspense> 
  },
  { 
    path: '/signup', 
    element: <React.Suspense fallback={<LoadingScreen message="Loading sign up..." />}><Signup /></React.Suspense> 
  },
  { 
    path: '/forgot-password', 
    element: <React.Suspense fallback={<LoadingScreen message="Loading..." />}><ForgotPassword /></React.Suspense> 
  },
  { 
    path: '/reset-password', 
    element: <React.Suspense fallback={<LoadingScreen message="Loading..." />}><ResetPassword /></React.Suspense> 
  },
  { 
    path: '/', 
    element: (
      <ProtectedRoute>
        <React.Suspense fallback={<LoadingScreen message="Loading dashboard..." />}>
          <Dashboard />
        </React.Suspense>
      </ProtectedRoute>
    )
  },
  { 
    path: '/dashboard', 
    element: (
      <ProtectedRoute>
        <React.Suspense fallback={<LoadingScreen message="Loading dashboard..." />}>
          <Dashboard />
        </React.Suspense>
      </ProtectedRoute>
    )
  },
  { 
    path: '/games', 
    element: (
      <ProtectedRoute>
        <React.Suspense fallback={<LoadingScreen message="Loading games..." />}>
          <Games />
        </React.Suspense>
      </ProtectedRoute>
    )
  },
]);

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
