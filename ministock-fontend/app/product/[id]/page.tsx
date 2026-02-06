
"use client";

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import api from '@/lib/axios';
import Link from 'next/link';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function ProductDetail() {
    const { id } = useParams();
    const { data: product, error, isLoading } = useSWR(id ? `/products/id/${id}` : null, fetcher);

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (error) return <div className="flex h-screen items-center justify-center text-red-500">Failed to load product</div>;
    if (!product) return <div className="flex h-screen items-center justify-center">Product not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="h-64 w-full bg-slate-100 relative">
                    <img
                        src={product.image || 'https://placehold.co/400?text=No+Image'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-sm
                        ${product.quantity > 10 ? 'bg-emerald-100 text-emerald-700' :
                            product.quantity > 0 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}
                    >
                        {product.quantity > 10 ? 'In Stock' : product.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
                        <p className="text-slate-500 text-sm mt-1">{product.category}</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-center">
                            <p className="text-xs text-slate-500">Price</p>
                            <p className="text-lg font-bold text-primary">${product.price}</p>
                        </div>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <div className="text-center">
                            <p className="text-xs text-slate-500">Stock</p>
                            <p className="text-lg font-bold text-slate-900">{product.quantity} {product.unit}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Product SKU</label>
                        <div className="p-3 bg-slate-100 rounded-lg font-mono text-sm text-slate-700">
                            {product.sku}
                        </div>
                    </div>

                    <div className="pt-4">
                        <Link
                            href="/"
                            className="block w-full bg-slate-900 text-white text-center font-semibold py-3 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            Back to Inventory
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
