'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../store/slices/authSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { emailOrUsername, password });
      dispatch(setAuth({ user: res.data.user, token: res.data.tokens.accessToken }));
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (email: string) => {
    setEmailOrUsername(email);
    setPassword('password123');
  };

  return (
    <div className="h-screen w-full bg-dark-bg relative overflow-y-auto overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="min-h-full w-full flex flex-col justify-center items-center p-4 py-8 relative z-10">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl border border-white/10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-600/30 mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-xs text-slate-400 mt-1">Sign in to your PulseChat workspace</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email or Username"
            placeholder="alex@pulsechat.com"
            leftIcon={<Mail className="w-4 h-4" />}
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Sign In
          </Button>
        </form>

        {/* Demo Quick Fill Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 text-center">
            Quick Demo Login Accounts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('alex@pulsechat.com')}
              className="px-3 py-2 rounded-xl glass-card text-xs text-slate-300 hover:text-white hover:border-brand-500 transition-all text-left truncate"
            >
              👤 Alex Morgan
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('sarah@pulsechat.com')}
              className="px-3 py-2 rounded-xl glass-card text-xs text-slate-300 hover:text-white hover:border-brand-500 transition-all text-left truncate"
            >
              👤 Sarah Connor
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('david@pulsechat.com')}
              className="px-3 py-2 rounded-xl glass-card text-xs text-slate-300 hover:text-white hover:border-brand-500 transition-all text-left truncate"
            >
              👤 David Beckham
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@pulsechat.com')}
              className="px-3 py-2 rounded-xl glass-card text-xs text-amber-300 hover:text-amber-200 hover:border-amber-500 transition-all text-left truncate"
            >
              👑 System Admin
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-brand-400 hover:underline font-semibold">
            Create account
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
