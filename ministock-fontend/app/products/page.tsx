"use client";

import { useMemo, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { QRCodeCanvas } from 'qrcode.react';
import AppShell from '@/components/AppShell';
import Modal from '@/components/Modal';
import ProductForm, { type ProductFormData } from '@/components/ProductForm';
import { StatusBadge } from '@/components/StatusBadge';
import { useSession } from '@/components/SessionProvider';
import api from '@/lib/axios';
import type { Product } from '@/lib/types';

const fetcher = (url: string) => api.get(url).then((response) => response.data);

export default function ProductsPage() {
  const { user } = useSession();
  const { mutate } = useSWRConfig();
  const { data: products } = useSWR<Product[]>(user ? '/products' : null, fetcher);
  const [activeQrProduct, setActiveQrProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [scanCode, setScanCode] = useState('');
  const [scanResult, setScanResult] = useState<Product | null>(null);

  const stats = useMemo(() => {
    if (!products) return { total: 0, low: 0, value: 0 };
    return {
      total: products.length,
      low: products.filter((product) => product.status === 'LOW_STOCK' || product.status === 'OUT_OF_STOCK').length,
      value: products.reduce((sum, product) => sum + (product.price ?? 0) * product.quantity, 0)
    };
  }, [products]);

  const saveProduct = async (payload: ProductFormData) => {
    if (editingProduct) {
      await api.patch(`/products/${editingProduct.id}`, payload);
    } else {
      await api.post('/products', payload);
    }
    setAddingProduct(false);
    setEditingProduct(null);
    mutate('/products');
  };

  const scanProduct = async () => {
    if (!scanCode.trim()) return;
    try {
      const trimmedCode = scanCode.trim();
      const parsedPayload = (() => {
        try {
          return JSON.parse(trimmedCode) as { id?: string; sku?: string };
        } catch {
          return null;
        }
      })();

      const lookupValue = parsedPayload?.id || parsedPayload?.sku || trimmedCode;
      const response = await api.get(`/products/scan/${encodeURIComponent(lookupValue)}`);
      setScanResult(response.data);
    } catch {
      window.alert('Product not found');
      setScanResult(null);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    mutate('/products');
  };

  return (
    <AppShell
      title="Inventory Overview"
      description="Manage your stock, track inventory levels, and generate QR codes."
    >
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Total Items</p>
            <div className="rounded-lg bg-blue-50 p-2 text-primary">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Low Stock Alerts</p>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <span className="material-symbols-outlined">warning</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.low}</p>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Total Value</p>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <span className="material-symbols-outlined">attach_money</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">${stats.value.toLocaleString()}</p>
        </div>
      </section>

      <section className="flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
        <div className="relative w-full md:w-96">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="material-symbols-outlined text-slate-400">search</span>
          </div>
          <input
            value={scanCode}
            onChange={(event) => setScanCode(event.target.value)}
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-slate-900 placeholder-slate-400 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm"
            placeholder="Search by product code, QR code, or name..."
            type="text"
          />
        </div>
        <div className="flex w-full gap-3 md:w-auto">
          <button onClick={scanProduct} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 md:flex-none">
            <span className="material-symbols-outlined">qr_code_scanner</span>
            <span>Scan</span>
          </button>
          {user?.role === 'ADMIN' && (
            <button onClick={() => setAddingProduct(true)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-bold text-white shadow-md shadow-primary/30 transition-colors hover:bg-blue-700 md:flex-none">
              <span className="material-symbols-outlined">add</span>
              <span>Add Product</span>
            </button>
          )}
        </div>
      </section>

      {scanResult && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Scan Result</h2>
          <div className="mt-4 grid gap-2 text-sm text-slate-600">
            <p><span className="font-bold text-slate-900">Product:</span> {scanResult.name}</p>
            <p><span className="font-bold text-slate-900">SKU:</span> {scanResult.sku}</p>
            <p><span className="font-bold text-slate-900">Stock:</span> {scanResult.quantity} {scanResult.unit}</p>
            <p><span className="font-bold text-slate-900">QR:</span> {scanResult.qrCode || 'No QR assigned yet'}</p>
            <p><span className="font-bold text-slate-900">Request Status:</span> {scanResult.requests?.[0] ? scanResult.requests[0].status.replaceAll('_', ' ') : '-'}</p>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="w-40 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Product Code</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                <th className="w-40 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Stock Level</th>
                <th className="w-48 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">QR Code</th>
                <th className="w-24 px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products?.map((product) => (
                <tr key={product.id} className="group transition-colors hover:bg-slate-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-600">#{product.sku}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-xs text-slate-400">
                        {product.image ? <img src={product.image} alt={product.name} className="h-full w-full rounded-md object-cover" /> : 'Img'}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900">{product.name}</span>
                        <p className="text-xs text-slate-500">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge value={product.status || 'IN_STOCK'} />
                    <p className="mt-2 text-xs text-slate-500">{product.quantity} {product.unit}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{product.qrCode || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setActiveQrProduct(product)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary" title="Generate QR Code">
                        <span className="material-symbols-outlined text-xl">qr_code_2</span>
                      </button>
                      {user?.role === 'ADMIN' && (
                        <>
                          <button onClick={() => setEditingProduct(product)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" title="Edit Item">
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button onClick={() => deleteProduct(product.id)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600" title="Delete Item">
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={Boolean(activeQrProduct)} onClose={() => setActiveQrProduct(null)} title="Product QR Code">
        {activeQrProduct && (
          <div className="flex flex-col items-center gap-4 text-center">
            <QRCodeCanvas
              value={JSON.stringify({
                id: activeQrProduct.id,
                sku: activeQrProduct.sku,
                name: activeQrProduct.name,
                quantity: activeQrProduct.quantity,
                unit: activeQrProduct.unit,
                status: activeQrProduct.status
              })}
              size={240}
            />
            <p className="text-lg font-bold text-slate-900">{activeQrProduct.name}</p>
            <p className="font-mono text-sm text-slate-500">
              Available: {activeQrProduct.quantity} {activeQrProduct.unit}
            </p>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={addingProduct || Boolean(editingProduct)}
        onClose={() => {
          setAddingProduct(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
      >
        <ProductForm key={editingProduct?.id ?? 'new-product'} initialData={editingProduct ?? undefined} onSubmit={saveProduct} />
      </Modal>
    </AppShell>
  );
}
