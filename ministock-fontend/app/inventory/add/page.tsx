"use client";

import Link from 'next/link';
import api from '@/lib/axios';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import ProductForm from '@/components/ProductForm';

export default function AddProduct() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [savedProduct, setSavedProduct] = useState<any>(null);

    const handleFormSubmit = async (data: any) => {
        setLoading(true);
        try {
            const res = await api.post('/products', data);
            setSavedProduct(res.data);
            // Don't redirect immediately so they can see/print the QR
        } catch (error) {
            console.error(error);
            alert('Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = () => {
        const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            let downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${savedProduct.sku}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    }

    return (
        <div className="bg-background-light font-display text-slate-900 antialiased min-h-screen">
            <div className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-primary">
                                <span className="material-symbols-outlined text-3xl">inventory_2</span>
                                <h1 className="text-xl font-bold tracking-tight text-slate-900">StockManager</h1>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <nav className="flex gap-6">
                                <Link className="text-sm font-medium text-slate-600 hover:text-primary transition-colors" href="/">Dashboard</Link>
                                <Link className="text-sm font-medium text-primary" href="/inventory/add">Inventory</Link>
                                <Link className="text-sm font-medium text-slate-600 hover:text-primary transition-colors" href="/history">History</Link>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>



            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900">Add New Product</h2>
                    <p className="mt-1 text-slate-500">Enter product details below.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
                            <ProductForm
                                onSubmit={handleFormSubmit}
                                loading={loading}
                                onCancel={() => router.push('/')}
                                submitLabel="Save Product"
                            />

                            {savedProduct && (
                                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                                    <button type="button" onClick={() => {
                                        setSavedProduct(null);
                                        // We might need a key to reset form, or just reload page?
                                        // Easiest is to reload or just reset savedProduct allows adding another if form clears?
                                        // ProductForm internal state doesn't reset automatically unless we pass a key or method.
                                        // Let's add a key based on savedProduct to reset it?
                                        // actually we can just reload the page for a clean slate or manage it better.
                                        window.location.reload();
                                    }} className="bg-slate-900 text-white text-sm font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:bg-slate-800 flex items-center gap-2">
                                        Add Another
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center sticky top-24">
                            <h3 className="text-lg font-bold">QR Code</h3>
                            <div className="mt-4 p-4 bg-white rounded-lg border border-slate-100 flex items-center justify-center">
                                {savedProduct ? (
                                    <QRCodeCanvas
                                        id="qr-code"
                                        value={JSON.stringify({
                                            id: savedProduct.id,
                                            sku: savedProduct.sku,
                                            name: savedProduct.name,
                                            price: savedProduct.price,
                                            quantity: savedProduct.quantity,
                                            unit: savedProduct.unit
                                        })}
                                        size={200}
                                        level={"H"}
                                    />
                                ) : (
                                    <div className="w-[200px] h-[200px] bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-2">
                                        <span className="material-symbols-outlined text-4xl">qr_code_2</span>
                                        <span className="text-xs">Saved product QR will appear here</span>
                                    </div>
                                )}
                            </div>

                            {savedProduct && (
                                <div className="mt-6 w-full flex flex-col gap-3">
                                    <p className="text-sm font-medium text-slate-900">{savedProduct.name}</p>
                                    <p className="text-xs text-slate-500 font-mono bg-slate-100 py-1 px-2 rounded">{savedProduct.sku}</p>
                                    <button
                                        onClick={downloadQR}
                                        className="w-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all"
                                    >
                                        <span className="material-symbols-outlined">download</span> Download PNG
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="w-full bg-primary text-white hover:bg-blue-600 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                                    >
                                        <span className="material-symbols-outlined">print</span> Print Label
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div >
            </main >
        </div >
    );
}
