"use client";

import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import AppShell from '@/components/AppShell';
import Modal from '@/components/Modal';
import UserForm from '@/components/UserForm';
import { useSession } from '@/components/SessionProvider';
import api from '@/lib/axios';
import type { SessionUser } from '@/lib/types';

const fetcher = (url: string) => api.get(url).then((response) => response.data);

export default function AdminPage() {
  const { user } = useSession();
  const { mutate } = useSWRConfig();
  const { data: users } = useSWR<SessionUser[]>(user?.role === 'ADMIN' ? '/users' : null, fetcher);
  const [editingUser, setEditingUser] = useState<SessionUser | null>(null);
  const [openForm, setOpenForm] = useState(false);

  const saveUser = async (payload: Partial<SessionUser>) => {
    if (editingUser) {
      await api.patch(`/users/${editingUser.id}`, payload);
    } else {
      await api.post('/users', payload);
    }
    setEditingUser(null);
    setOpenForm(false);
    mutate('/users');
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    mutate('/users');
  };

  return (
    <AppShell
      title="Admin Panel"
      description="Maintain users and role assignments. Every write action is logged for traceability."
    >
      {user?.role === 'ADMIN' && (
        <section className="flex justify-end">
          <button onClick={() => setOpenForm(true)} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-bold text-white shadow-md shadow-primary/30 transition-colors hover:bg-blue-700">
            <span className="material-symbols-outlined">person_add</span>
            <span>Add User</span>
          </button>
        </section>
      )}

      {user?.role !== 'ADMIN' ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          Admin access is required for this page.
        </div>
      ) : (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Username</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Department</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users?.map((entry) => (
                  <tr key={entry.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{entry.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{entry.username}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{entry.role.replaceAll('_', ' ')}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{entry.department}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setEditingUser(entry)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                          Edit
                        </button>
                        <button onClick={() => deleteUser(entry.id)} className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Modal
        isOpen={openForm || Boolean(editingUser)}
        onClose={() => {
          setOpenForm(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Edit User' : 'Add User'}
      >
        <UserForm key={editingUser?.id ?? 'new-user'} initialData={editingUser ?? undefined} onSubmit={saveUser} />
      </Modal>
    </AppShell>
  );
}
