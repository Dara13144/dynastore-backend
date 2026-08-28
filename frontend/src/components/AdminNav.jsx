import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Film, Radio, CreditCard, Users, LayoutDashboard, ArrowLeft, Cloud } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminNav = ({ title, subtitle, actionButton }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    {
      name: 'Dashboard Overview',
      path: '/admin',
      icon: LayoutDashboard,
      color: 'text-amber-400',
      activeBg: 'bg-amber-500 text-black shadow-gold-sm font-black'
    },
    {
      name: 'GAME & Store Catalog',
      path: '/admin/movies',
      icon: Film,
      color: 'text-amber-400',
      activeBg: 'bg-amber-500 text-black shadow-gold-sm font-black'
    },
    {
      name: 'ABA PayWay E-Commerce',
      path: '/admin/payway',
      icon: CreditCard,
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-500 text-black shadow-md font-black'
    },
    {
      name: 'Users & Wallet Balances',
      path: '/admin/users',
      icon: Users,
      color: 'text-purple-400',
      activeBg: 'bg-purple-500 text-white shadow-md font-black'
    },
    {
      name: 'Supabase Cloud & Storage',
      path: '/admin/supabase',
      icon: Cloud,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-500 text-black shadow-md font-black'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Bar with Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-gray-800 p-2.5 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            to="/"
            className="px-3.5 py-2 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all mr-2"
            title="Back to Public Website"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Website
          </Link>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-2xl text-xs flex items-center gap-2 transition-all ${
                  isActive
                    ? item.activeBg
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60 font-semibold'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : item.color}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-300">
          <ShieldAlert className="w-3.5 h-3.5 text-theme-gold" />
          <span>Admin: {user?.email || 'Super Admin'}</span>
        </div>
      </div>

      {/* Header Info */}
      {(title || actionButton) && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              {title}
            </h1>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>

          {actionButton && <div>{actionButton}</div>}
        </div>
      )}

    </div>
  );
};

export default AdminNav;
