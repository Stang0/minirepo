"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { useSession } from './SessionProvider';

interface AppShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function AppShell({ title, description, children, actions }: AppShellProps) {
  const router = useRouter();
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <div className="rounded-xl border border-slate-200 bg-white px-8 py-6 text-sm font-semibold text-slate-500 shadow-xl">
          Loading workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light">
      <Sidebar />
      <main className="relative flex flex-1 flex-col overflow-hidden bg-background-light">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-8 pb-20">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-4xl">{title}</h1>
              <p className="text-base font-normal text-slate-500">{description}</p>
            </div>
            {actions && (
              <div className="flex justify-end">
                {actions}
              </div>
            )}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
