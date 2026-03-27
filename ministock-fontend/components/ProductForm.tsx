"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  price: string | number | null;
  image: string | null;
  minStock: number;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
  submitLabel?: string;
}

export default function ProductForm({
  initialData,
  onSubmit,
  loading: externalLoading,
  onCancel,
  submitLabel = 'Save Product'
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    sku: '',
    category: 'Electronics',
    quantity: 0,
    unit: 'pcs',
    price: '',
    image: '',
    minStock: 5
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialData) return;
    setFormData({
      name: initialData.name || '',
      sku: initialData.sku || '',
      category: initialData.category || 'Electronics',
      quantity: initialData.quantity || 0,
      unit: initialData.unit || 'pcs',
      price: initialData.price || '',
      image: initialData.image || '',
      minStock: initialData.minStock || 5
    });
  }, [initialData]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      setLoading(true);
      const response = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData((current) => ({ ...current, image: response.data.url }));
    } catch (error) {
      console.error(error);
      window.alert('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || externalLoading;

  return (
    <form
      className="space-y-6"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit(formData);
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="Product Name"
          value={formData.name}
          onChange={(event) => setFormData({ ...formData, name: event.target.value })}
          required
        />
        <input
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="SKU"
          value={formData.sku}
          onChange={(event) => setFormData({ ...formData, sku: event.target.value })}
          required
          disabled={Boolean(initialData)}
        />
        <select
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          value={formData.category}
          onChange={(event) => setFormData({ ...formData, category: event.target.value })}
        >
          <option>Electronics</option>
          <option>Office Supplies</option>
          <option>Furniture</option>
          <option>Accessories</option>
          <option>General</option>
        </select>
        <select
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          value={formData.unit}
          onChange={(event) => setFormData({ ...formData, unit: event.target.value })}
        >
          <option>pcs</option>
          <option>box</option>
          <option>kg</option>
          <option>set</option>
        </select>
        <input
          type="number"
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={(event) => setFormData({ ...formData, quantity: Number(event.target.value) })}
          required
        />
        <input
          type="number"
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="Min stock alert"
          value={formData.minStock}
          onChange={(event) => setFormData({ ...formData, minStock: Number(event.target.value) })}
          required
        />
        <input
          type="number"
          step="0.01"
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="Price"
          value={formData.price ?? ''}
          onChange={(event) => setFormData({ ...formData, price: event.target.value })}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
        />
      </div>

      {formData.image && (
        <img src={formData.image} alt="Preview" className="h-36 w-full rounded-2xl object-cover" />
      )}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700">
            Cancel
          </button>
        )}
        <button type="submit" disabled={isLoading} className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white">
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
