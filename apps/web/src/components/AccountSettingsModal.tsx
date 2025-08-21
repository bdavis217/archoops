import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'security' | 'notifications' | 'privacy'>('security');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notifications, setNotifications] = useState({
    emailGameResults: true,
    emailStudentActivity: true,
    emailNewLessons: false,
    inAppNotifications: true,
  });
  const [privacy, setPrivacy] = useState({
    shareUsageData: true,
    allowAnalytics: true,
    profileVisibility: 'private' as 'public' | 'private',
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 10) {
      alert('Password must be at least 10 characters long');
      return;
    }

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }

      alert('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (error) {
      console.error('Password change error:', error);
      alert(error instanceof Error ? error.message : 'Failed to change password');
    }
  };

  const handleNotificationSave = async () => {
    try {
      const response = await fetch('/api/profile/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(notifications),
      });

      if (!response.ok) {
        throw new Error('Failed to save notification preferences');
      }

      alert('Notification preferences saved');
    } catch (error) {
      console.error('Notification save error:', error);
      alert('Failed to save notification preferences');
    }
  };

  const handlePrivacySave = async () => {
    try {
      const response = await fetch('/api/profile/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(privacy),
      });

      if (!response.ok) {
        throw new Error('Failed to save privacy settings');
      }

      alert('Privacy settings saved');
    } catch (error) {
      console.error('Privacy save error:', error);
      alert('Failed to save privacy settings');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900">Account Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-neutral-50 p-4 border-r border-neutral-200">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'security'
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Security</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h9a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Notifications</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'privacy'
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Privacy</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Security Settings</h3>
                  
                  {/* Current Account Info */}
                  <div className="bg-neutral-50 rounded-xl p-4 mb-6">
                    <h4 className="font-medium text-neutral-900 mb-2">Account Information</h4>
                    <p className="text-sm text-neutral-600 mb-1">Email: {user?.email}</p>
                    <p className="text-sm text-neutral-600">Role: {user?.role}</p>
                  </div>

                  {/* Password Change */}
                  <div className="border border-neutral-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-neutral-900">Password</h4>
                        <p className="text-sm text-neutral-600">Keep your account secure with a strong password</p>
                      </div>
                      <button
                        onClick={() => setIsChangingPassword(!isChangingPassword)}
                        className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {isChangingPassword ? 'Cancel' : 'Change Password'}
                      </button>
                    </div>

                    {isChangingPassword && (
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            minLength={10}
                            required
                          />
                          <p className="text-xs text-neutral-500 mt-1">Must be at least 10 characters long</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            Update Password
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsChangingPassword(false)}
                            className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl">
                      <div>
                        <h4 className="font-medium text-neutral-900">Game Results</h4>
                        <p className="text-sm text-neutral-600">Get notified when games finish and predictions are scored</p>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, emailGameResults: !prev.emailGameResults }))}
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          notifications.emailGameResults ? 'bg-primary-600' : 'bg-neutral-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                          notifications.emailGameResults ? 'translate-x-6' : 'translate-x-0.5'
                        }`}></div>
                      </button>
                    </div>

                    {user?.role === 'teacher' && (
                      <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl">
                        <div>
                          <h4 className="font-medium text-neutral-900">Student Activity</h4>
                          <p className="text-sm text-neutral-600">Get notified about student predictions and lesson completions</p>
                        </div>
                        <button
                          onClick={() => setNotifications(prev => ({ ...prev, emailStudentActivity: !prev.emailStudentActivity }))}
                          className={`w-12 h-6 rounded-full relative transition-colors ${
                            notifications.emailStudentActivity ? 'bg-primary-600' : 'bg-neutral-300'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                            notifications.emailStudentActivity ? 'translate-x-6' : 'translate-x-0.5'
                          }`}></div>
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl">
                      <div>
                        <h4 className="font-medium text-neutral-900">New Lessons</h4>
                        <p className="text-sm text-neutral-600">Get notified when new lessons are available</p>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, emailNewLessons: !prev.emailNewLessons }))}
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          notifications.emailNewLessons ? 'bg-primary-600' : 'bg-neutral-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                          notifications.emailNewLessons ? 'translate-x-6' : 'translate-x-0.5'
                        }`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl">
                      <div>
                        <h4 className="font-medium text-neutral-900">In-App Notifications</h4>
                        <p className="text-sm text-neutral-600">Show notifications while using the app</p>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, inAppNotifications: !prev.inAppNotifications }))}
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          notifications.inAppNotifications ? 'bg-primary-600' : 'bg-neutral-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                          notifications.inAppNotifications ? 'translate-x-6' : 'translate-x-0.5'
                        }`}></div>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleNotificationSave}
                    className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Save Notification Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Privacy Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl">
                      <div>
                        <h4 className="font-medium text-neutral-900">Usage Data</h4>
                        <p className="text-sm text-neutral-600">Help improve ArcHoops by sharing anonymous usage data</p>
                      </div>
                      <button
                        onClick={() => setPrivacy(prev => ({ ...prev, shareUsageData: !prev.shareUsageData }))}
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          privacy.shareUsageData ? 'bg-primary-600' : 'bg-neutral-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                          privacy.shareUsageData ? 'translate-x-6' : 'translate-x-0.5'
                        }`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl">
                      <div>
                        <h4 className="font-medium text-neutral-900">Analytics</h4>
                        <p className="text-sm text-neutral-600">Allow analytics to help us understand how features are used</p>
                      </div>
                      <button
                        onClick={() => setPrivacy(prev => ({ ...prev, allowAnalytics: !prev.allowAnalytics }))}
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          privacy.allowAnalytics ? 'bg-primary-600' : 'bg-neutral-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                          privacy.allowAnalytics ? 'translate-x-6' : 'translate-x-0.5'
                        }`}></div>
                      </button>
                    </div>

                    <div className="p-4 border border-neutral-200 rounded-xl">
                      <h4 className="font-medium text-neutral-900 mb-2">Profile Visibility</h4>
                      <p className="text-sm text-neutral-600 mb-4">Control who can see your profile information</p>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="profileVisibility"
                            value="private"
                            checked={privacy.profileVisibility === 'private'}
                            onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as 'private' }))}
                            className="mr-3 text-primary-600"
                          />
                          <span className="text-sm">Private - Only you can see your profile</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="profileVisibility"
                            value="public"
                            checked={privacy.profileVisibility === 'public'}
                            onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as 'public' }))}
                            className="mr-3 text-primary-600"
                          />
                          <span className="text-sm">Public - Other users can see your profile</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePrivacySave}
                    className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Save Privacy Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
