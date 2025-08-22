import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { AccountSettingsModal } from '../components/AccountSettingsModal';

export default function Settings() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />
      <AccountSettingsModal isOpen={true} onClose={handleClose} />
    </div>
  );
}
