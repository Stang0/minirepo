"use client";

import { useState } from 'react';
import type { SessionUser } from '@/lib/types';

interface UserFormData {
  name: string;
  username: string;
  role: SessionUser['role'];
  department: string;
  password: string;
}

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (payload: UserFormData) => Promise<void>;
}

export default function UserForm({ initialData, onSubmit }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: initialData?.name ?? '',
    username: initialData?.username ?? '',
    role: initialData?.role ?? 'STAFF',
    department: initialData?.department ?? '',
    password: initialData ? '' : 'demo1234'
  });

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit(formData);
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="Full name"
          value={formData.name}
          onChange={(event) => setFormData({ ...formData, name: event.target.value })}
          required
        />
        <input
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="Username"
          value={formData.username}
          onChange={(event) => setFormData({ ...formData, username: event.target.value })}
          required
        />
        <select
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          value={formData.role}
          onChange={(event) => setFormData({ ...formData, role: event.target.value as SessionUser['role'] })}
        >
          <option value="STAFF">Staff</option>
          <option value="DEPARTMENT_MANAGER">Department Manager</option>
          <option value="STORE_MANAGER">Store Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
        <input
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="Department"
          value={formData.department}
          onChange={(event) => setFormData({ ...formData, department: event.target.value })}
          required
        />
      </div>

      <input
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
        placeholder={initialData ? 'Leave blank to keep current password' : 'Password'}
        value={formData.password}
        onChange={(event) => setFormData({ ...formData, password: event.target.value })}
      />

      <button type="submit" className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">
        Save User
      </button>
    </form>
  );
}
