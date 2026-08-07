'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/index';
import { MainSidebar } from '../components/layout/MainSidebar';
import { ChatList } from '../components/chat/ChatList';
import { ChatWindow } from '../components/chat/ChatWindow';
import { GroupModal } from '../components/chat/GroupModal';
import { ContactsModal } from '../components/contacts/ContactsModal';
import { SettingsModal } from '../components/settings/SettingsModal';
import { api } from '../lib/api';
import { setAuth, setLoading } from '../store/slices/authSlice';
import { setChats } from '../store/slices/chatSlice';
import { MessageSquare } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const { chats, activeChatId } = useSelector((state: RootState) => state.chat);

  const [activeTab, setActiveTab] = useState<'chats' | 'contacts' | 'calls' | 'settings'>('chats');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Authenticate user on load
  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('pulsechat_token');
      if (!storedToken) {
        router.push('/login');
        return;
      }

      try {
        const res = await api.get('/auth/me');
        dispatch(setAuth({ user: res.data, token: storedToken }));

        // Load initial user chats
        const chatsRes = await api.get('/chats');
        dispatch(setChats(chatsRes.data));
      } catch (err) {
        router.push('/login');
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchMe();
  }, []);

  if (isLoading || !user) {
    return (
      <div className="h-screen w-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Loading PulseChat Workspace...</p>
        </div>
      </div>
    );
  }

  const activeChat = chats.find((c) => c._id === activeChatId);

  return (
    <div className="h-screen w-screen flex bg-dark-bg overflow-hidden">
      {/* Navigation Main Sidebar */}
      <MainSidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'contacts') setIsContactsModalOpen(true);
          else if (tab === 'settings') setIsSettingsModalOpen(true);
          else setActiveTab(tab);
        }}
        onOpenGroupModal={() => setIsGroupModalOpen(true)}
        onOpenSearchModal={() => setIsContactsModalOpen(true)}
        onOpenAdminPanel={() => router.push('/admin')}
      />

      {/* Chat List Sidebar */}
      <ChatList onOpenCreateGroup={() => setIsGroupModalOpen(true)} />

      {/* Main Active Chat Window or Welcome Screen */}
      {activeChat ? (
        <ChatWindow chat={activeChat} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-dark-bg text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-600/30 to-indigo-600/30 border border-brand-500/20 flex items-center justify-center mb-6 shadow-2xl animate-pulse-slow">
            <MessageSquare className="w-12 h-12 text-brand-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">PulseChat Real-Time Platform</h2>
          <p className="text-sm text-slate-400 max-w-sm">
            Select a conversation from the left sidebar or start a new group chat to begin messaging and HD WebRTC calling.
          </p>
        </div>
      )}

      {/* Modals */}
      <GroupModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} />
      <ContactsModal isOpen={isContactsModalOpen} onClose={() => setIsContactsModalOpen(false)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </div>
  );
}
