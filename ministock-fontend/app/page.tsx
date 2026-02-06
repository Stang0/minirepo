"use client";

import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/axios';
import useSWR, { useSWRConfig } from 'swr';
import { clsx } from 'clsx';
import { useMemo, useState } from 'react';
import Modal from '@/components/Modal';
import ProductForm from '@/components/ProductForm';
import { QRCodeCanvas } from 'qrcode.react';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function Overview() {
  const { mutate } = useSWRConfig();
  const { data: products, error } = useSWR('/products', fetcher, { refreshInterval: 5000 });

  const [activeQrProduct, setActiveQrProduct] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const handleUpdateProduct = async (data: any) => {
    if (!editingProduct) return;
    try {
      await api.patch(`/products/${editingProduct.id}`, data);
      mutate('/products');
      setEditingProduct(null);
    } catch (error) {
      console.error(error);
      alert('Failed to update product');
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code-modal') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${activeQrProduct?.sku || 'product'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  }

  const stats = useMemo(() => {
    if (!products) return { total: 0, lowStock: 0, value: 0 };
    return {
      total: products.length,
      lowStock: products.filter((p: any) => p.status === 'LOW_STOCK' || p.quantity < 10).length,
      value: products.reduce((acc: number, p: any) => acc + (p.price || 0) * (p.quantity || 0), 0)
    };
  }, [products]);

  const isLoading = !products && !error;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-8 pb-20">

            <div className="flex flex-col gap-2">
              <h1 className="text-slate-900 text-3xl md:text-4xl font-black leading-tight tracking-tight">Inventory Overview</h1>
              <p className="text-slate-500 text-base font-normal">Manage your stock, track inventory levels, and generate QR codes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-3 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Items</p>
                  <div className="bg-blue-50 p-2 rounded-lg text-primary">
                    <span className="material-symbols-outlined">inventory_2</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-slate-900 text-3xl font-bold">{stats.total}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Low Stock Alerts</p>
                  <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-slate-900 text-3xl font-bold">{stats.lowStock}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Value</p>
                  <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                    <span className="material-symbols-outlined">attach_money</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-slate-900 text-3xl font-bold">${stats.value.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="relative w-full md:w-96 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                </div>
                <input className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-all" placeholder="Search by product code or name..." type="text" />
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm">
                  <span className="material-symbols-outlined">filter_list</span>
                  <span>Filter</span>
                </button>
                <Link href="/inventory/add" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg transition-colors shadow-md shadow-primary/30">
                  <span className="material-symbols-outlined">add</span>
                  <span>Add Product</span>
                </Link>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-40">Product Code</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-40">Stock Level</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-48">Price</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-24 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {isLoading && (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading inventory...</td></tr>
                    )}
                    {products && products.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No products found. Add one to get started.</td></tr>
                    )}
                    {products?.map((product: any) => (
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">#{product.sku}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-md bg-slate-100 bg-cover bg-center border border-slate-200 flex items-center justify-center text-xs text-slate-400">
                              {product.image ? <img src={product.image} className="w-full h-full object-cover rounded-md" /> : "Img"}
                            </div>
                            <span className="text-sm font-bold text-slate-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={clsx("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                            product.quantity > 10 ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                              product.quantity > 0 ? "bg-amber-100 text-amber-700 border-amber-200" :
                                "bg-rose-100 text-rose-700 border-rose-200"
                          )}>
                            <span className={clsx("size-1.5 rounded-full",
                              product.quantity > 10 ? "bg-emerald-500" :
                                product.quantity > 0 ? "bg-amber-500" :
                                  "bg-rose-500"
                            )}></span>
                            {product.quantity > 0 ? `In Stock (${product.quantity})` : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                          ${product.price}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setActiveQrProduct(product)}
                              className="text-slate-400 hover:text-primary p-2 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Generate QR Code"
                            >
                              <span className="material-symbols-outlined text-xl">qr_code_2</span>
                            </button>
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Edit Item"
                            >
                              <span className="material-symbols-outlined text-xl">edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Modal
        isOpen={!!activeQrProduct}
        onClose={() => setActiveQrProduct(null)}
        title="Product QR Code"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
            {activeQrProduct && (
              <QRCodeCanvas
                id="qr-code-modal"
                value={JSON.stringify({
                  id: activeQrProduct.id,
                  sku: activeQrProduct.sku,
                  name: activeQrProduct.name,
                  price: activeQrProduct.price,
                  quantity: activeQrProduct.quantity
                })}
                size={250}
                level={"H"}
              />
            )}
          </div>

          {activeQrProduct && (
            <div className="text-center space-y-1">
              <p className="font-bold text-lg text-slate-900">{activeQrProduct.name}</p>
              <p className="font-mono text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded inline-block">{activeQrProduct.sku}</p>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <button
              onClick={downloadQR}
              className="flex-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined">download</span> Download
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 bg-primary text-white hover:bg-blue-600 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <span className="material-symbols-outlined">print</span> Print
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title="Edit Product"
      >
        {editingProduct && (
          <ProductForm
            initialData={editingProduct}
            onSubmit={handleUpdateProduct}
            onCancel={() => setEditingProduct(null)}
            submitLabel="Save Changes"
          />
        )}
      </Modal>
    </div>
  );
}
