"use client";

import { useState } from 'react';
import type { Product } from '@/lib/types';

interface RequestFormProps {
  products: Product[];
  onSubmit: (payload: { productId: string; quantity: number; type: 'STOCK_OUT' | 'BORROW'; reason: string }) => Promise<void>;
}

export default function RequestForm({ products, onSubmit }: RequestFormProps) {
  const [formData, setFormData] = useState({
    productId: products[0]?.id ?? '',
    quantity: 1,
    type: 'STOCK_OUT' as 'STOCK_OUT' | 'BORROW',
    reason: ''
  });
  const selectedProductId = formData.productId || products[0]?.id || '';
  const selectedProduct = products.find((product) => product.id === selectedProductId) || products[0];
  const maxQuantity = Math.max(selectedProduct?.quantity ?? 0, 0);
  const hasStock = maxQuantity > 0;

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!selectedProductId || !hasStock) return;
        await onSubmit({ ...formData, productId: selectedProductId });
        setFormData((current) => ({ ...current, quantity: 1, reason: '' }));
      }}
    >
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Product</label>
        <select
          value={selectedProductId}
          onChange={(event) => {
            const nextProduct = products.find((product) => product.id === event.target.value);
            const nextMaxQuantity = Math.max(nextProduct?.quantity ?? 0, 0);
            setFormData({
              ...formData,
              productId: event.target.value,
              quantity: nextMaxQuantity > 0 ? Math.min(formData.quantity, nextMaxQuantity) : 1
            });
          }}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
          required
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.sku} - {product.name} ({product.quantity} {product.unit})
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Request Type</label>
          <select
            value={formData.type}
            onChange={(event) => setFormData({ ...formData, type: event.target.value as 'STOCK_OUT' | 'BORROW' })}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            <option value="STOCK_OUT">Stock Out</option>
            <option value="BORROW">Borrow</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Quantity</label>
          <input
            type="number"
            min={1}
            max={maxQuantity || 1}
            value={formData.quantity}
            onChange={(event) =>
              setFormData({
                ...formData,
                quantity: Math.min(Math.max(Number(event.target.value), 1), maxQuantity || 1)
              })
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            required
            disabled={!hasStock}
          />
          <p className="mt-2 text-xs text-slate-500">
            {hasStock
              ? `Available stock: ${maxQuantity} ${selectedProduct?.unit || ''}`
              : 'This product is out of stock and cannot be requested right now.'}
          </p>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Reason</label>
        <textarea
          value={formData.reason}
          onChange={(event) => setFormData({ ...formData, reason: event.target.value })}
          className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
          placeholder="Optional context for approvers"
        />
      </div>

      <button
        type="submit"
        disabled={!hasStock}
        className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Submit Request
      </button>
    </form>
  );
}
