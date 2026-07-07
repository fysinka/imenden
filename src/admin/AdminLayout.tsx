import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Sun, LayoutDashboard, Package, ShoppingBag, Newspaper, Calendar,
  Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Поръчки', icon: ShoppingBag },
  { to: '/admin/products', label: 'Продукти', icon: Package },
  { to: '/admin/publications', label: 'Публикации', icon: Newspaper },
  { to: '/admin/calendar', label: 'Календар', icon: Calendar },
  { to: '/admin/settings', label: 'Настройки', icon: Settings },
];

export default function AdminLayout() {
  const [session, setSession] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate('/admin/login'); return; }
      setSession(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, s) => {
      (async () => {
        if (!s) navigate('/admin/login');
      })();
    });
    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (session === null) return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#c0392b] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isActive = (to: string) => location.pathname === to;

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/10">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c0392b] to-[#e74c3c] flex items-center justify-center">
            <Sun size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm font-serif">Имен ден</p>
            <p className="text-white/40 text-[10px]">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive(to)
                ? 'bg-[#c0392b]/20 text-[#e74c3c] border border-[#c0392b]/30'
                : 'text-white/60 hover:text-white hover:bg-white/8'
            }`}
          >
            <Icon size={17} />
            <span className="flex-1">{label}</span>
            {isActive(to) && <ChevronRight size={14} className="text-[#c0392b]" />}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          <Sun size={14} /> Виж сайта
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={14} /> Изход
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-[#1a1a2e] shrink-0 fixed h-full z-40">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-[#1a1a2e] animate-slideInLeft">
            <div className="absolute top-4 right-4">
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1 text-sm text-gray-500 hidden sm:block">
            {NAV.find(n => n.to === location.pathname)?.label || 'Admin Panel'}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={14} /> Изход
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
