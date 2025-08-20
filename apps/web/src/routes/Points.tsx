import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { PointsDashboard } from '../components/PointsDashboard';

export default function Points() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">My Points</h1>
          <p className="text-neutral-600">
            Track your prediction accuracy and points earned from NBA game predictions.
          </p>
        </div>
        
        <PointsDashboard />
      </main>
    </div>
  );
}
