
"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

interface ProductFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    loading?: boolean;
    onCancel?: () => void;
    submitLabel?: string;
}

export default function ProductForm({ initialData, onSubmit, loading: externalLoading, onCancel, submitLabel = "Save Product" }: ProductFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: 'Electronics',
        quantity: 10,
        unit: 'pcs',
        price: '',
        image: '',
        entryDate: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                sku: initialData.sku || '',
                category: initialData.category || 'Electronics',
                quantity: initialData.quantity || 0,
                unit: initialData.unit || 'pcs',
                price: initialData.price || '',
                image: initialData.image || '',
                entryDate: new Date().toISOString().split('T')[0]
            });
        }
    }, [initialData]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            setLoading(true);
            const res = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, image: res.data.url }));
        } catch (error) {
            console.error(error);
            alert('Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const isLoading = loading || externalLoading;

    return (
        <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">badge</span> Identification
                </h3>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="col-span-1 sm:col-span-2">
                        <label className="block text-sm font-medium leading-6">Product Name</label>
                        <div className="mt-2">
                            <input
                                type="text"
                                required
                                className="block w-full rounded-lg border-0 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary bg-white sm:text-sm"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium leading-6">Product ID (SKU)</label>
                        <div className="mt-2">
                            <input
                                type="text"
                                required
                                className="block w-full rounded-lg border-0 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary bg-white sm:text-sm"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                disabled={!!initialData}
                            />
                        </div>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium leading-6">Category</label>
                        <div className="mt-2">
                            <select
                                className="block w-full rounded-lg border-0 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary bg-white sm:text-sm"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option>Electronics</option>
                                <option>Office Supplies</option>
                                <option>Furniture</option>
                                <option>Accessories</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>


            <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">sell</span> Pricing & Media
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="col-span-1">
                        <label className="block text-sm font-medium leading-6">Price</label>
                        <div className="mt-2 relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-slate-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                className="block w-full rounded-lg border-0 py-3 pl-7 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary bg-white sm:text-sm"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium leading-6">Product Image</label>
                        <div className="mt-2 text-center">
                            <div className="flex items-center gap-4">
                                {formData.image && (
                                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => (e.currentTarget.src = 'https://placehold.co/400?text=No+Image')}
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="block w-full text-sm text-slate-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-primary
                                            hover:file:bg-blue-100
                                        "
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            </div>
                            <input type="hidden" value={formData.image} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">warehouse</span> Inventory Details
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div className="col-span-1">
                        <label className="block text-sm font-medium leading-6">Quantity</label>
                        <div className="mt-2">
                            <input
                                type="number"
                                className="block w-full rounded-lg border-0 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary bg-white sm:text-sm"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium leading-6">Unit Type</label>
                        <div className="mt-2">
                            <select
                                className="block w-full rounded-lg border-0 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary bg-white sm:text-sm"
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            >
                                <option>pcs</option>
                                <option>box</option>
                                <option>kg</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-sm font-semibold text-slate-700 px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:bg-blue-600 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">save</span>
                    {isLoading ? 'Saving...' : submitLabel}
                </button>
            </div>
        </form>
    );
}
