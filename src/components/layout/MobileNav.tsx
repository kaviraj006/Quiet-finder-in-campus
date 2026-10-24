'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, BarChart3, PlusCircle, Bookmark, User } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Explore', icon: Map },
    { href: '/rankings', label: 'Rankings', icon: BarChart3 },
    { href: '/report', label: 'Report', icon: PlusCircle, isMain: true },
    { href: '/saved', label: 'Saved', icon: Bookmark },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        if (link.isMain) {
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center justify-center -mt-5"
            >
              <div className="w-12 h-12 rounded-full bg-teal-800 dark:bg-teal-600 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 active:scale-95 transition-transform">
                <PlusCircle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-semibold text-teal-800 dark:text-teal-400 mt-0.5">
                {link.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-teal-800 dark:text-teal-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-teal-800 dark:text-teal-400' : 'text-slate-400'}`} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
