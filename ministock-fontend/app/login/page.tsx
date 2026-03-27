"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useSession } from '@/components/SessionProvider';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useSession();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [loading, router, user]);

  const submitLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(formData.username, formData.password);
    } catch (loginError: unknown) {
      if (axios.isAxiosError(loginError)) {
        setError((loginError.response?.data as { error?: string } | undefined)?.error || 'Login failed');
      } else {
        setError('Login failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <div className="relative hidden overflow-hidden bg-primary md:flex md:w-1/2 lg:w-3/5">
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-primary/40 to-primary/10 mix-blend-multiply" />
        <img
          alt="Modern Warehouse"
          className="absolute inset-0 h-full w-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKuEEdskHaKk6pif8hzCpsIJVlbxBP1vRzTuPQednt3e9p37rYYqxcIAch1eop997cQ0CmwFVYd0PVl7mA0OGmTGEKYo_ar5uu9NYrEda_fpSvtQrj_-aoK16uf6ufJ59Cn-tzhvhMKUsJ6GAtHg86LT4P-lHrfba5_CeLUxtSwCdlBY89o2IP7zoKIJFYVg0RKOehwi5IGvfBVo8qfaDEe5haTbO_WoylZikjl9_NFN9kpNn2FL9fdtmQPUSzNl3mvrIBrj3l7nBN"
        />
      </div>

      <div className="flex w-full items-center justify-center bg-surface-container px-8 py-12 md:w-1/2 lg:w-2/5">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
            </div>
            <span className="headline-font text-2xl font-extrabold tracking-tight text-primary">Mini Stock</span>
          </div>

          <div className="mb-10">
            <h1 className="headline-font mb-2 text-3xl font-extrabold text-slate-900">Welcome back</h1>
            <p className="body-font text-slate-500">Please enter your details to sign in.</p>
          </div>

          <form className="space-y-6" onSubmit={submitLogin}>
            <div>
              <label className="body-font mb-2 block text-sm font-bold text-slate-900" htmlFor="username">Username</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="material-symbols-outlined text-xl text-slate-400">person</span>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={(event) => setFormData({ ...formData, username: event.target.value })}
                  className="body-font block w-full rounded-xl border border-outline-variant bg-white py-3 pl-11 pr-4 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Enter username"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="body-font block text-sm font-bold text-slate-900" htmlFor="password">Password</label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="material-symbols-outlined text-xl text-slate-400">lock</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  className="body-font block w-full rounded-xl border border-outline-variant bg-white py-3 pl-11 pr-12 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-primary"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input className="h-4 w-4 cursor-pointer rounded-sm border-outline-variant text-primary focus:ring-primary" id="remember-me" name="remember-me" type="checkbox" />
                <label className="body-font ml-2 block cursor-pointer text-sm text-slate-500" htmlFor="remember-me">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <span className="body-font font-bold text-primary">Contact Admin</span>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button className="headline-font w-full rounded-xl bg-primary px-6 py-4 text-base font-bold text-white shadow-[0_4px_12px_-1px_rgba(19,91,236,0.25)] transition-all duration-150 hover:bg-blue-700 active:scale-[0.98]" type="submit" disabled={submitting}>
                {submitting ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
