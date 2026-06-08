'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Rss, BarChart3, Bell, Users, Shield, Globe, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = { Home, Rss, BarChart3, Bell, Users, Shield, Globe, FileText };

const navItems = [
  { label: 'Home', path: '/dashboard', icon: 'Home' },
  { label: 'Feed', path: '/feed', icon: 'Rss' },
  { label: 'Analytics', path: '/media-monitoring', icon: 'BarChart3' },
  { label: 'Alerts', path: '/crisis', icon: 'Bell' },
  { label: 'Influencers', path: '/influencers', icon: 'Users' },
  { label: 'Reputation', path: '/reputation', icon: 'Shield' },
  { label: 'Public Opinion', path: '/public-opinion', icon: 'Globe' },
  { label: 'Reports', path: '/media-monitoring', icon: 'FileText' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-950 border-r border-lens-border flex flex-col z-40 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-lens-border shrink-0">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="shrink-0">
          <circle cx="16" cy="16" r="12" stroke="#14b8a6" strokeWidth="2.5" />
          <circle cx="16" cy="16" r="6" stroke="#14b8a6" strokeWidth="2" />
          <circle cx="16" cy="16" r="2" fill="#14b8a6" />
        </svg>
        {!collapsed && (
          <span className="font-display font-bold text-lg tracking-tight text-white">Lens</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.label}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-lens-accent/15 text-lens-accent'
                  : 'text-lens-text-secondary hover:text-lens-text hover:bg-slate-800'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-lens-border text-lens-text-muted hover:text-lens-text transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
