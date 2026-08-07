'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { api } from '../../lib/api';
import { IUserSummary } from '@pulsechat/shared';
import { Check, Users } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setChats, setActiveChatId } from '../../store/slices/chatSlice';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GroupModal: React.FC<GroupModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [usersList, setUsersList] = useState<IUserSummary[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (search.trim()) {
      api.get(`/users/search?q=${search}`).then((res) => setUsersList(res.data)).catch(() => {});
    }
  }, [search]);

  const toggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((uId) => uId !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUserIds.length === 0) return;
    setIsLoading(true);
    try {
      const res = await api.post('/chats/group', {
        name: groupName,
        description,
        members: selectedUserIds
      });
      // Refresh chats list
      const chatsRes = await api.get('/chats');
      dispatch(setChats(chatsRes.data));
      dispatch(setActiveChatId(res.data._id));
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Group Chat">
      <div className="space-y-4">
        <Input
          label="Group Name"
          placeholder="e.g. Engineering Core"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <Input
          label="Group Description"
          placeholder="Brief topic description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
            Add Members
          </label>
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Search Results */}
        <div className="max-h-48 overflow-y-auto space-y-2 py-1">
          {usersList.map((u) => {
            const isSelected = selectedUserIds.includes(u._id);
            return (
              <div
                key={u._id}
                onClick={() => toggleSelectUser(u._id)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                  isSelected ? 'bg-brand-600/20 border border-brand-500/40' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar src={u.avatar} name={u.name} size="sm" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{u.name}</h4>
                    <p className="text-[10px] text-slate-400">@{u.username}</p>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-brand-400" />}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateGroup}
            isLoading={isLoading}
            disabled={!groupName.trim() || selectedUserIds.length === 0}
          >
            Create Group ({selectedUserIds.length})
          </Button>
        </div>
      </div>
    </Modal>
  );
};
