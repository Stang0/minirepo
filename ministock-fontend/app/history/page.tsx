"use client";

import Sidebar from '@/components/Sidebar';
import api from '@/lib/axios';
import useSWR from 'swr';
import { clsx } from 'clsx';
import { useMemo } from 'react';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function History() {
    const { data: transactions, error } = useSWR('/transactions', fetcher);

    const stats = useMemo(() => {
        if (!transactions) return { in: 0, out: 0 };
        return {
            in: transactions.filter((t: any) => t.type === 'IN').reduce((acc: number, t: any) => acc + t.quantity, 0),
            out: transactions.filter((t: any) => t.type === 'OUT').reduce((acc: number, t: any) => acc + t.quantity, 0)
        };
    }, [transactions]);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light">
            <Sidebar />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-6">

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Transaction History</h2>
                                <p className="text-slate-500 mt-1">Track and manage all stock movements.</p>
                            </div>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col p-5 bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-4 opacity-10">
                                <span className="material-symbols-outlined text-6xl text-primary">arrow_circle_down</span>
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                    <span className="material-symbols-outlined">input</span>
                                </div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Stock In</p>
                            </div>
                            <p className="text-3xl font-black text-slate-900">{stats.in}</p>
                        </div>

                        <div className="flex flex-col p-5 bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-4 opacity-10">
                                <span className="material-symbols-outlined text-6xl text-orange-500">arrow_circle_up</span>
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                    <span className="material-symbols-outlined">output</span>
                                </div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Stock Out</p>
                            </div>
                            <p className="text-3xl font-black text-slate-900">{stats.out}</p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Date & Time</th>
                                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Product</th>
                                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Quantity</th>
                                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {transactions?.map((t: any) => (
                                        <tr key={t.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <p className="text-sm font-bold text-slate-900">{new Date(t.date).toLocaleDateString()}</p>
                                                <p className="text-xs text-slate-500">{new Date(t.date).toLocaleTimeString()}</p>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
                                                    t.type === 'IN' ? "bg-green-100 text-green-700 border-green-200" : "bg-orange-100 text-orange-700 border-orange-200"
                                                )}>
                                                    <span className={clsx("w-1.5 h-1.5 rounded-full", t.type === 'IN' ? "bg-green-500" : "bg-orange-500")}></span>
                                                    {t.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{t.Product?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-slate-500">SKU: {t.Product?.sku}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right font-bold">
                                                {t.type === 'IN' ? '+' : '-'}{t.quantity}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-slate-500">{t.notes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
