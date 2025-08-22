import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { AccountSettingsModal } from '../components/AccountSettingsModal';
import { useQuery } from '@tanstack/react-query';

interface ProfileStats {
  totalClasses: number;
  totalStudents: number;
  totalLessons: number;
  joinDate: string;
}

interface Class {
  id: string;
  name: string;
  joinCode: string;
  createdAt: string;
  studentCount?: number;
}

interface Lesson {
  id: string;
  title: string;
  createdAt: string;
  progresses: {
    completed: boolean;
  }[];
}

export default function Profile() {
  const { user } = useAuth();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Fetch profile stats for teachers
  const { data: profileStats } = useQuery<ProfileStats>({
    queryKey: ['profile', 'stats', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/profile/stats', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch profile stats');
      return response.json();
    },
    enabled: !!user && user.role === 'teacher',
  });

  // Fetch recent classes for teachers
  const { data: recentClasses } = useQuery<Class[]>({
    queryKey: ['profile', 'classes', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/teacher/classes', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch classes');
      return response.json();
    },
    enabled: !!user && user.role === 'teacher',
  });

  // Fetch recent lessons for teachers
  const { data: recentLessons } = useQuery<Lesson[]>({
    queryKey: ['profile', 'lessons', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/lessons', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch lessons');
      return response.json();
    },
    enabled: !!user && user.role === 'teacher',
  });



  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-strong ring-4 ring-white">
              <span className="text-white font-bold text-3xl">
                {user.displayName.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-neutral-900">{user.displayName}</h1>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-block w-3 h-3 rounded-full ${
                  user.role === 'teacher' ? 'bg-secondary-400' : 'bg-success-400'
                }`} />
                <span className="text-neutral-600 capitalize font-medium">{user.role}</span>
              </div>

              <p className="text-neutral-600 mb-1">{user.email}</p>
              {profileStats && (
                <p className="text-sm text-neutral-500">
                  Member since {formatDate(profileStats.joinDate)}
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setIsSettingsModalOpen(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors focus-ring font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Only for Teachers */}
        {user.role === 'teacher' && profileStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 font-medium mb-1">Total Classes</p>
                  <p className="text-3xl font-bold text-neutral-900">{profileStats.totalClasses}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 font-medium mb-1">Total Students</p>
                  <p className="text-3xl font-bold text-neutral-900">{profileStats.totalStudents}</p>
                </div>
                <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 font-medium mb-1">Lessons Created</p>
                  <p className="text-3xl font-bold text-neutral-900">{profileStats.totalLessons}</p>
                </div>
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Classes - Only for Teachers */}
          {user.role === 'teacher' && (
            <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Your Classes</h2>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {recentClasses && Array.isArray(recentClasses) && recentClasses.length > 0 ? (
                  recentClasses.slice(0, 3).map((classItem) => (
                    <div key={classItem.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">{classItem.name}</h3>
                        <p className="text-sm text-neutral-600">
                          {classItem.studentCount || 0} student{(classItem.studentCount || 0) !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Code: {classItem.joinCode}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neutral-500">
                          Created {formatDate(classItem.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p>No classes created yet</p>
                    <p className="text-sm">Create your first class to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Lessons - Only for Teachers */}
          {user.role === 'teacher' && (
            <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Your Lessons</h2>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {recentLessons && Array.isArray(recentLessons) && recentLessons.length > 0 ? (
                  recentLessons.slice(0, 3).map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 mb-1">{lesson.title}</h3>
                        <p className="text-sm text-neutral-600">
                          {lesson.progresses && Array.isArray(lesson.progresses) 
                            ? lesson.progresses.filter(p => p.completed).length 
                            : 0} completions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neutral-500">
                          {formatDate(lesson.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p>No lessons created yet</p>
                    <p className="text-sm">Create your first lesson to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Account Summary - For all users */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Account Summary</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                <div>
                  <h3 className="font-semibold text-neutral-900">Email Address</h3>
                  <p className="text-sm text-neutral-600">{user.email}</p>
                </div>
                <span className="text-sm text-success-600 font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                <div>
                  <h3 className="font-semibold text-neutral-900">Account Type</h3>
                  <p className="text-sm text-neutral-600 capitalize">{user.role} Account</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'teacher' 
                    ? 'bg-secondary-100 text-secondary-800' 
                    : 'bg-success-100 text-success-800'
                }`}>
                  {user.role}
                </span>
              </div>

              {profileStats && (
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-neutral-900">Member Since</h3>
                    <p className="text-sm text-neutral-600">{formatDate(profileStats.joinDate)}</p>
                  </div>
                  <span className="text-sm text-neutral-500 font-medium">
                    {Math.floor((new Date().getTime() - new Date(profileStats.joinDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Account Settings Modal */}
        <AccountSettingsModal 
          isOpen={isSettingsModalOpen} 
          onClose={() => setIsSettingsModalOpen(false)} 
        />
      </div>
    </div>
  );
}
