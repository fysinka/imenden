import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, ShoppingBag, Calendar, Home, Sparkles, MessageSquare, Info } from 'lucide-react';
import { useCart } from '../store/cartStore';

const NAV_ITEMS = [
  { to: '/', label: 'Днес', icon: Home },
  { to: '/calendar', label: 'Календар', icon: Calendar },
  { to: '/shop', label: 'Магазин', icon: ShoppingBag },
];

const SIDEBAR_ITEMS = [
  { to: '/', label: 'Днес', icon: Home },
  { to: '/calendar', label: 'Календар', icon: Calendar },
  { to: '/shop', label: 'Магазин', icon: ShoppingBag },
  { to: '/cart', label: 'Количка', icon: ShoppingBag },
  { to: '/ai-services', label: 'AI Услуги', icon: Sparkles },
  { to: '/feedback', label: 'Обратна връзка', icon: MessageSquare },
  { to: '/about', label: 'За нас', icon: Info },
];

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <>
      {/* Main Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg'
            : 'bg-gradient-to-r from-amber-500 to-orange-600'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <Sun size={20} className="text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-lg font-serif tracking-tight">
                  Imenden.org
                </span>
                <span className="hidden sm:block text-white/70 text-[10px] tracking-wide">
                  Български именник
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`nav-btn ${isActive(to) ? 'nav-btn-active' : 'bg-black/90 hover:bg-black'}`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}

              {/* Cart Button */}
              <Link to="/cart" className="relative nav-btn bg-black/90 hover:bg-black ml-2">
                <ShoppingBag size={15} />
                Количка
                {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
              </Link>
            </nav>

            {/* Mobile: Cart + Hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <Link to="/cart" className="relative p-2.5 rounded-xl bg-black/90 text-white">
                <ShoppingBag size={18} />
                {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
              </Link>
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2.5 rounded-xl bg-black/90 text-white"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16" />

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 modal-backdrop"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-embroidery-side bg-repeat bg-amber-950 animate-slideInRight overflow-y-auto">
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-amber-950/85" />

            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
                    <Sun size={18} className="text-white" />
                  </div>
                  <span className="text-white font-bold text-lg font-serif">Imenden.org</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {SIDEBAR_ITEMS.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(to)
                        ? 'bg-amber-500 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                ))}
              </nav>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex gap-3 flex-wrap">
                  <Link to="/faq" className="text-xs text-white/50 hover:text-white/80">FAQ</Link>
                  <Link to="/privacy" className="text-xs text-white/50 hover:text-white/80">Поверителност</Link>
                  <Link to="/terms" className="text-xs text-white/50 hover:text-white/80">Условия</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
