'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { api } from '../../lib/api';
import { IUserSummary } from '@pulsechat/shared';
import { Search, MessageSquare, ShieldAlert } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setChats, setActiveChatId } from '../../store/slices/chatSlice';

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactsModal: React.FC<ContactsModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<IUserSummary[]>([]);

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    try {
      const res = await api.get(`/users/search?q=${query}`);
      setResults(res.data);
    } catch (e) {}
  };

  const handleStartChat = async (targetUserId: string) => {
    try {
      const res = await api.post('/chats/direct', { targetUserId });
      const chatsRes = await api.get('/chats');
      dispatch(setChats(chatsRes.data));
      dispatch(setActiveChatId(res.data._id));
      onClose();
    } catch (e) {}
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contacts & Search Users">
      <div className="space-y-4">
        <Input
          placeholder="Search by name, @username, or email..."
          leftIcon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <div className="max-h-72 overflow-y-auto space-y-2 py-1">
          {results.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-8">
              {search ? 'No users found matching query' : 'Type to search for users across PulseChat'}
            </p>
          ) : (
            results.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between p-3 rounded-2xl glass-card hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={u.avatar} name={u.name} status={u.status} size="md" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">{u.name}</h4>
                    <p className="text-xs text-slate-400">@{u.username}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleStartChat(u._id)}
                  className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md shadow-brand-600/30"
                  title="Message User"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
