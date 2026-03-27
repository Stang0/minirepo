"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useSession } from './SessionProvider';

const ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'dashboard', roles: ['STAFF', 'DEPARTMENT_MANAGER', 'STORE_MANAGER', 'ADMIN'] },
  { href: '/products', label: 'Products', icon: 'inventory_2', roles: ['STAFF', 'DEPARTMENT_MANAGER', 'STORE_MANAGER', 'ADMIN'] },
  { href: '/requests', label: 'Requests', icon: 'assignment', roles: ['STAFF', 'DEPARTMENT_MANAGER', 'STORE_MANAGER', 'ADMIN'] },
  { href: '/approvals', label: 'Approvals', icon: 'fact_check', roles: ['DEPARTMENT_MANAGER', 'STORE_MANAGER', 'ADMIN'] },
  { href: '/history', label: 'History & Logs', icon: 'history', roles: ['STAFF', 'DEPARTMENT_MANAGER', 'STORE_MANAGER', 'ADMIN'] },
  { href: '/admin', label: 'Admin', icon: 'admin_panel_settings', roles: ['ADMIN'] }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useSession();

  if (!user) return null;

  const menuItems = ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-2xl">inventory_2</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold leading-normal text-slate-900">Mini Stock</h1>
              <p className="text-xs font-medium leading-normal text-slate-500">Admin Portal</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1">
            {menuItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors',
                    active ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <span className={clsx('material-symbols-outlined', active ? 'fill' : 'text-slate-500 group-hover:text-primary')}>{item.icon}</span>
                  <p className={clsx('text-sm leading-normal', active ? 'font-bold' : 'font-medium')}>{item.label}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
              {user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-bold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.role.replaceAll('_', ' ')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-100 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span className="truncate">Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
