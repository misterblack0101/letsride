"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, Package, Home } from 'lucide-react';
import { useCart } from '@/context/cart-context';

interface MobileSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export default function MobileSidebar({ isOpen, onToggle }: MobileSidebarProps) {
    const pathname = usePathname();
    const { itemCount } = useCart();

    const isActive = (path: string) => pathname === path;

    const menuItems = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/products', label: 'All Products', icon: Package },
        { href: '/cart', label: 'Shopping Cart', icon: ShoppingCart, badge: itemCount },
    ];

    return (
        <>
            {/* Hamburger Menu Button */}
            <button
                onClick={onToggle}
                className="btn btn-ghost btn-circle hover:bg-primary/10 hover:text-primary transition-all duration-200 lg:hidden"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Sidebar */}
            {isOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onToggle}
                    />

                    {/* Sidebar Panel */}
                    <div className="absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-base-100 shadow-xl border-r border-base-200 animate-in slide-in-from-left duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-base-200">
                            <h2 className="text-lg font-semibold">Menu</h2>
                            <button
                                onClick={onToggle}
                                className="btn btn-ghost btn-circle btn-sm hover:bg-error/10 hover:text-error transition-all duration-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Navigation Menu */}
                        <div className="p-4">
                            <ul className="menu menu-lg w-full">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <li key={item.href} className="mb-2">
                                            <Link
                                                href={item.href}
                                                onClick={onToggle}
                                                className={`flex items-center gap-3 rounded-lg transition-all duration-200 ${isActive(item.href)
                                                    ? 'bg-primary text-primary-content'
                                                    : 'hover:bg-primary/10 hover:text-primary'
                                                    }`}
                                            >
                                                <Icon className="h-5 w-5" />
                                                <span className="flex-1">{item.label}</span>
                                                {item.badge && item.badge > 0 && (
                                                    <div className="badge badge-secondary badge-sm">
                                                        {item.badge > 9 ? '9+' : item.badge}
                                                    </div>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Footer */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-base-200">
                            <div className="text-center text-sm text-base-content/60">
                                <p>Let's Ride Online</p>
                                <p className="text-xs mt-1">Your cycling companion</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
