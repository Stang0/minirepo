"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white flex-shrink-0 transition-all duration-300 h-screen sticky top-0">
            <div className="flex h-full flex-col justify-between p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-3 items-center px-2 py-2">
                        <div className="flex flex-col">
                            <h1 className="text-slate-900 text-base font-bold leading-normal">StockManager</h1>
                            <p className="text-slate-500 text-xs font-medium leading-normal">Admin Portal</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-4">
                        <Link
                            href="/"
                            className={clsx(
                                "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group",
                                isActive('/')
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "text-slate-600 hover:bg-slate-100"
                            )}
                        >
                            <span className={clsx("material-symbols-outlined", isActive('/') ? "fill-1" : "group-hover:text-primary")}>dashboard</span>
                            <p className="text-sm font-medium leading-normal">Overview</p>
                        </Link>

                        <Link
                            href="/inventory/add"
                            className={clsx(
                                "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group",
                                isActive('/inventory/add')
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "text-slate-600 hover:bg-slate-100"
                            )}
                        >
                            <span className={clsx("material-symbols-outlined", isActive('/inventory/add') ? "fill-1" : "group-hover:text-primary")}>add_box</span>
                            <p className="text-sm font-medium leading-normal">Add Product</p>
                        </Link>

                        <Link
                            href="/history"
                            className={clsx(
                                "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group",
                                isActive('/history')
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "text-slate-600 hover:bg-slate-100"
                            )}
                        >
                            <span className={clsx("material-symbols-outlined", isActive('/history') ? "fill-1" : "group-hover:text-primary")}>history</span>
                            <p className="text-sm font-medium leading-normal">History</p>
                        </Link>
                    </div>
                </div>


            </div>
        </aside>
    );
}
