"use client";

import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import axios from 'axios';
import AppShell from '@/components/AppShell';
import Modal from '@/components/Modal';
import RequestForm from '@/components/RequestForm';
import { StatusBadge } from '@/components/StatusBadge';
import { useSession } from '@/components/SessionProvider';
import api from '@/lib/axios';
import type { Product, StockRequest } from '@/lib/types';

const fetcher = (url: string) => api.get(url).then((response) => response.data);

export default function RequestsPage() {
  const { user } = useSession();
  const { mutate } = useSWRConfig();
  const { data: requests } = useSWR<StockRequest[]>(user ? '/requests' : null, fetcher);
  const { data: products } = useSWR<Product[]>(user ? '/products' : null, fetcher);
  const [openForm, setOpenForm] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [pickupUploadingId, setPickupUploadingId] = useState<string | null>(null);
  const [pickupError, setPickupError] = useState('');

  const createRequest = async (payload: { productId: string; quantity: number; type: 'STOCK_OUT' | 'BORROW'; reason: string }) => {
    try {
      setSubmitError('');
      await api.post('/requests', payload);
      setOpenForm(false);
      mutate('/requests');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setSubmitError((error.response?.data as { error?: string } | undefined)?.error || 'Failed to create request');
        return;
      }
      setSubmitError('Failed to create request');
    }
  };

  const uploadPickupConfirmation = async (requestId: string, file: File) => {
    try {
      setPickupError('');
      setPickupUploadingId(requestId);
      const formData = new FormData();
      formData.append('image', file);
      await api.patch(`/requests/${requestId}/pickup-confirmation`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      mutate('/requests');
      mutate('/dashboard/summary');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setPickupError((error.response?.data as { error?: string } | undefined)?.error || 'Failed to upload pickup confirmation');
        return;
      }
      setPickupError('Failed to upload pickup confirmation');
    } finally {
      setPickupUploadingId(null);
    }
  };

  return (
    <AppShell
      title="Request Center"
      description="Create stock-out or borrow requests and track approval progress with full visibility."
    >
      {user?.role === 'STAFF' && (
        <section className="flex justify-end">
          <button onClick={() => setOpenForm(true)} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-bold text-white shadow-md shadow-primary/30 transition-colors hover:bg-blue-700">
            <span className="material-symbols-outlined">add</span>
            <span>New Request</span>
          </button>
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {pickupError && (
          <div className="mx-6 mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {pickupError}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Requester</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Product</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Quantity</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Reason</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {requests?.map((request) => (
                <tr key={request.id} className="align-top transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{request.requester.name}</p>
                    <p className="text-sm text-slate-500">{request.requester.department}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{request.product.name}</p>
                    <p className="text-sm text-slate-500">{request.product.sku}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{request.type.replaceAll('_', ' ')}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{request.quantity}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{request.reason || '-'}</td>
                  <td className="px-6 py-4"><StatusBadge value={request.status} /></td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Created {new Date(request.createdAt).toLocaleString()}</p>
                      {request.approvals.map((approval) => (
                        <div key={approval.id} className="rounded-lg bg-slate-50 px-3 py-2">
                          <p className="text-sm font-semibold text-slate-900">Stage {approval.stage}: {approval.approver.name}</p>
                          <p className="text-xs text-slate-500">{approval.status}{approval.comment ? ` - ${approval.comment}` : ''}</p>
                        </div>
                      ))}
                      {request.pickupImage && (
                        <a href={request.pickupImage} target="_blank" rel="noreferrer" className="inline-flex text-sm font-semibold text-blue-700 hover:underline">
                          View pickup image
                        </a>
                      )}
                      {user?.id === request.requester.id && request.status === 'WAITING_PICKUP_CONFIRMATION' && (
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700">
                          <span className="material-symbols-outlined text-base">photo_camera</span>
                          {pickupUploadingId === request.id ? 'Uploading...' : 'Confirm Pickup (Upload Photo)'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={pickupUploadingId === request.id}
                            onChange={(event) => {
                              const selected = event.target.files?.[0];
                              if (selected) {
                                uploadPickupConfirmation(request.id, selected);
                              }
                              event.currentTarget.value = '';
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!requests?.length && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={openForm} onClose={() => setOpenForm(false)} title="Create Request">
        {submitError && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {submitError}
          </div>
        )}
        <RequestForm products={products ?? []} onSubmit={createRequest} />
      </Modal>
    </AppShell>
  );
}
