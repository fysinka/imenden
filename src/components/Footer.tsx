import { Link } from 'react-router-dom';
import { Sun, Instagram, Facebook, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-embroidery-dark bg-repeat bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 relative overflow-hidden">
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-600/95 via-orange-600/95 to-red-600/95" />

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sun size={20} className="text-white" />
              </div>
              <span className="text-white font-bold text-xl font-serif">Imenden.org</span>
            </Link>
            <p className="text-white/80 text-sm leading-relaxed mb-5">
              Вашият български именник — именни дни, календар, традиции и подаръци за вашите близки.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110">
                <Facebook size={18} className="text-white" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110">
                <Instagram size={18} className="text-white" />
              </a>
              <a href="mailto:info@imenden.org"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110">
                <Mail size={18} className="text-white" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Навигация</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/', label: 'Днес' },
                { to: '/calendar', label: 'Календар' },
                { to: '/shop', label: 'Магазин' },
                { to: '/news', label: 'Новини' },
                { to: '/ai-services', label: 'AI Услуги' },
                { to: '/about', label: 'За нас' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-150">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Магазин</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/shop', label: 'Всички продукти' },
                { to: '/shop?cat=tenishki', label: 'Тениски' },
                { to: '/shop?cat=suveniri', label: 'Сувенири' },
                { to: '/shop?cat=bijuta', label: 'Бижута' },
                { to: '/cart', label: 'Количка' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-150">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Контакт</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="tel:+359888123456" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Phone size={14} />
                  </div>
                  +359 888 123 456
                </a>
              </li>
              <li>
                <a href="mailto:info@imenden.org" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Mail size={14} />
                  </div>
                  info@imenden.org
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin size={14} />
                </div>
                София, България
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>&copy; {year} Imenden.org. Всички права запазени.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-white transition-colors">Поверителност</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Условия</Link>
            <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
          <p className="flex items-center gap-1.5">
            Направено с <Heart size={12} className="text-red-300 fill-current" /> в България
          </p>
        </div>
      </div>
    </footer>
  );
}
