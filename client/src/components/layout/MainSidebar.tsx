'use client';

import React from 'react';
import { MessageSquare, Users, Phone, Shield, Settings, LogOut, Search } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index';
import { logout } from '../../store/slices/authSlice';

interface MainSidebarProps {
  activeTab: 'chats' | 'contacts' | 'calls' | 'settings';
  setActiveTab: (tab: 'chats' | 'contacts' | 'calls' | 'settings') => void;
  onOpenGroupModal: () => void;
  onOpenSearchModal: () => void;
  onOpenAdminPanel?: () => void;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenGroupModal,
  onOpenSearchModal,
  onOpenAdminPanel
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return null;

  return (
    <aside className="w-20 bg-dark-sidebar border-r border-slate-800/80 flex flex-col items-center justify-between py-6 z-20 flex-shrink-0">
      {/* App Logo & User Avatar */}
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-600/30">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>

        <button
          onClick={() => setActiveTab('settings')}
          className="group relative transition-transform hover:scale-105"
          title="View Profile & Settings"
        >
          <Avatar src={user.avatar} name={user.name} status={user.status} size="md" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col items-center gap-4">
        <button
          onClick={onOpenSearchModal}
          className="p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          title="Global Search (Ctrl+K)"
        >
          <Search className="w-6 h-6" />
        </button>

        <button
          onClick={() => setActiveTab('chats')}
          className={`p-3 rounded-2xl transition-all relative ${
            activeTab === 'chats'
              ? 'bg-brand-600/20 text-brand-400 shadow-inner'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Chats"
        >
          <MessageSquare className="w-6 h-6" />
          {activeTab === 'chats' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`p-3 rounded-2xl transition-all relative ${
            activeTab === 'contacts'
              ? 'bg-brand-600/20 text-brand-400 shadow-inner'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Contacts & Users"
        >
          <Users className="w-6 h-6" />
          {activeTab === 'contacts' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('calls')}
          className={`p-3 rounded-2xl transition-all relative ${
            activeTab === 'calls'
              ? 'bg-brand-600/20 text-brand-400 shadow-inner'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Call Logs"
        >
          <Phone className="w-6 h-6" />
          {activeTab === 'calls' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-full" />
          )}
        </button>

        {user.role === 'admin' && onOpenAdminPanel && (
          <button
            onClick={onOpenAdminPanel}
            className="p-3 rounded-2xl text-amber-400 hover:bg-amber-400/10 transition-all"
            title="Admin Panel"
          >
            <Shield className="w-6 h-6" />
          </button>
        )}
      </nav>

      {/* Footer controls */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => setActiveTab('settings')}
          className={`p-3 rounded-2xl transition-all ${
            activeTab === 'settings'
              ? 'bg-brand-600/20 text-brand-400'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Settings"
        >
          <Settings className="w-6 h-6" />
        </button>

        <button
          onClick={() => dispatch(logout())}
          className="p-3 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          title="Sign Out"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </aside>
  );
};
