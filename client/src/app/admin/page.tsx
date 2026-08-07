'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import { api } from '../../lib/api';
import { Shield, Users, MessageSquare, Phone, Radio, ArrowLeft } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    api.get('/admin/stats').then((res) => setStats(res.data)).catch(() => {});
    api.get('/admin/users').then((res: any) => setUsersList(res.users || [])).catch(() => {});
  }, [user]);

  const handleToggleBlock = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/toggle-block`);
      const res: any = await api.get('/admin/users');
      setUsersList(res.users || []);
    } catch (e) {}
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTitle || !broadcastMessage) return;
    try {
      const res: any = await api.post('/admin/broadcast', {
        title: broadcastTitle,
        message: broadcastMessage
      });
      setBroadcastStatus(res.message || 'Broadcast sent!');
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-dark-bg p-8 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-3 rounded-2xl bg-dark-sidebar border border-slate-800 hover:border-slate-700 text-slate-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-amber-400" /> Admin Command Center
              </h1>
              <p className="text-xs text-slate-400">System Monitoring & Platform Controls</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="p-4 rounded-xl bg-brand-600/20 text-brand-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Registered Users</p>
                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="p-4 rounded-xl bg-emerald-600/20 text-emerald-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Active Online Users</p>
                <h3 className="text-2xl font-bold">{stats.activeUsers}</h3>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="p-4 rounded-xl bg-indigo-600/20 text-indigo-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Messages Sent</p>
                <h3 className="text-2xl font-bold">{stats.totalMessages}</h3>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="p-4 rounded-xl bg-amber-600/20 text-amber-400">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Calls Logged</p>
                <h3 className="text-2xl font-bold">{stats.totalCalls}</h3>
              </div>
            </div>
          </div>
        )}

        {/* System Broadcast */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-400" /> Broadcast System Notification
          </h2>

          {broadcastStatus && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              {broadcastStatus}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Notification Title"
              placeholder="System Maintenance Alert"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
            />
            <Input
              label="Message Body"
              placeholder="PulseChat will undergo scheduled upgrades at 02:00 UTC."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
            />
          </div>
          <Button variant="primary" onClick={handleSendBroadcast}>
            Send Broadcast to All Users
          </Button>
        </div>

        {/* User Management Table */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold">User Management & Permissions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-white/5">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <Avatar src={u.avatar} name={u.name} size="sm" />
                      <div>
                        <p className="font-semibold text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-400">@{u.username}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isBlocked
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {u.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant={u.isBlocked ? 'secondary' : 'danger'}
                        onClick={() => handleToggleBlock(u._id)}
                      >
                        {u.isBlocked ? 'Unblock' : 'Block'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
