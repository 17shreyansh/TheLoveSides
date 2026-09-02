import React, { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut, 
  Menu, 
  X, 
  Users, 
  Image as ImageIcon,
  FolderTree,
  Layers,
  Box,
  Settings,
  Percent,
  Truck,
  Shield,
  RotateCcw,
  Star,
  FileText,
  History,
  Ticket
} from 'lucide-react';
import clsx from 'clsx';

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    {
      label: 'Overview',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      ]
    },
    {
      label: 'Catalog',
      items: [
        { name: 'Products', href: '/products', icon: Package },
        { name: 'Rooms', href: '/rooms', icon: FolderTree },
        { name: 'Collections', href: '/collections', icon: Layers },
        { name: 'Reviews', href: '/reviews', icon: Star },
      ]
    },
    {
      label: 'Inventory',
      items: [
        { name: 'Stock Management', href: '/inventory', icon: Box },
      ]
    },
    {
      label: 'Sales & Customers',
      items: [
        { name: 'Orders', href: '/orders', icon: ShoppingCart },
        { name: 'Returns', href: '/returns', icon: RotateCcw },
        { name: 'Customers', href: '/customers', icon: Users },
      ]
    },
    {
      label: 'Marketing',
      items: [
        { name: 'Coupons', href: '/coupons', icon: Ticket },
      ]
    },
    {
      label: 'Content',
      items: [
        { name: 'Media', href: '/media', icon: ImageIcon },
        { name: 'CMS Pages', href: '/cms', icon: FileText },
      ]
    },
    {
      label: 'System & Settings',
      items: [
        { name: 'General Settings', href: '/settings', icon: Settings },
        { name: 'Tax Rules', href: '/settings/taxes', icon: Percent },
        { name: 'Shipping Zones', href: '/settings/shipping', icon: Truck },
        { name: 'Users & Roles', href: '/settings/users', icon: Shield },
        { name: 'Audit Logs', href: '/settings/audit-logs', icon: History },
      ]
    }
  ];

  return (
    <div className="h-screen w-full bg-gray-50 flex overflow-hidden font-sans">
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 bg-[#0B1120] w-64 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full lg:shrink-0 flex flex-col border-r border-white/5",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 bg-[#0B1120] shrink-0 sticky top-0 z-10 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-brand-accent to-blue-600 flex items-center justify-center shadow-lg shadow-brand-accent/20">
              <span className="font-bold text-white text-lg leading-none">T</span>
            </div>
            <span className="font-bold text-[15px] text-white tracking-wide">TheLoveSides</span>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 hide-scrollbar">
          {navigation.map((group) => (
            <div key={group.label}>
              <h3 className="px-3 text-[11px] font-semibold text-gray-400/80 uppercase tracking-widest mb-3">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={clsx(
                        "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative",
                        isActive 
                          ? "bg-brand-accent/10 text-brand-accent shadow-sm" 
                          : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-accent rounded-r-full shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>
                      )}
                      <item.icon className={clsx(
                        "w-4 h-4 transition-colors", 
                        isActive ? "text-brand-accent" : "text-gray-400 group-hover:text-gray-300"
                      )} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="shrink-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Contextual Title - optional, can be injected via context later */}
            <div className="hidden sm:block">
               {/* <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1> */}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer py-1.5 px-2.5 rounded-full border border-gray-200/60">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-accent to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {user.firstName?.charAt(0)}
              </div>
              <div className="hidden sm:block text-left pr-2">
                <p className="text-[13px] font-semibold text-gray-900 leading-tight">{user.firstName} {user.lastName}</p>
                <p className="text-[11px] text-gray-500 font-medium">{user.role?.name || 'Administrator'}</p>
              </div>
            </div>
            <div className="h-5 w-px bg-gray-200"></div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 p-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Custom Styles for hiding scrollbar cleanly on sidebar */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
