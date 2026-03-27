"use client";

import useSWR from 'swr';
import AppShell from '@/components/AppShell';
import { useSession } from '@/components/SessionProvider';
import api from '@/lib/axios';
import type { LogResponse, StockRequest } from '@/lib/types';

const fetcher = (url: string) => api.get(url).then((response) => response.data);

export default function HistoryPage() {
  const { user } = useSession();
  const { data: requests } = useSWR<StockRequest[]>(user ? '/requests' : null, fetcher);
  const { data: logs } = useSWR<LogResponse>(user && ['STORE_MANAGER', 'ADMIN'].includes(user.role) ? '/logs' : null, fetcher);

  return (
    <AppShell
      title="History & Logs"
      description="Review request progress, stock deduction history, and audit activity."
    >
      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Request History</h2>
          <div className="mt-5 space-y-4">
            {requests?.map((request) => (
              <div key={request.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="font-bold text-slate-900">{request.product.name}</p>
                <p className="mt-1 text-sm text-slate-600">{request.type.replaceAll('_', ' ')} • {request.quantity} • {request.status.replaceAll('_', ' ')}</p>
                <p className="mt-2 text-xs text-slate-500">{new Date(request.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Audit Activity</h2>
          {logs ? (
            <div className="mt-5 space-y-4">
              {logs.stockMovements.map((movement) => (
                <div key={movement.id} className="rounded-lg bg-slate-950 p-4 text-white">
                  <p className="font-bold">{movement.product.name}</p>
                  <p className="mt-1 text-sm text-slate-300">{movement.type} • qty {movement.quantity} • balance {movement.balanceAfter}</p>
                  <p className="mt-2 text-xs text-slate-400">{movement.createdBy.name} • {new Date(movement.createdAt).toLocaleString()}</p>
                </div>
              ))}
              {logs.logs.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <p className="font-bold text-slate-900">{entry.action}</p>
                  <p className="mt-1 text-sm text-slate-600">{entry.details}</p>
                  <p className="mt-2 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              Detailed audit logs are available to Store Manager and Admin roles.
            </div>
          )}
        </article>
      </section>
    </AppShell>
  );
}
