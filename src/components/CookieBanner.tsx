import { useState, useEffect } from 'react';
import { Cookie, X, Check } from 'lucide-react';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookies-accepted');
    if (!accepted) {
      const t = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookies-accepted', 'true');
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem('cookies-accepted', 'false');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[200] animate-fadeIn">
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-[#c0392b]/20 flex items-center justify-center shrink-0">
            <Cookie size={18} className="text-[#c0392b]" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-1">Използваме бисквитки</h4>
            <p className="text-white/60 text-xs leading-relaxed">
              Използваме бисквитки за подобряване на потребителското изживяване. Моля, изберете предпочитанията си.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={accept}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#c0392b] hover:bg-[#e74c3c] text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <Check size={13} /> Приемам
          </button>
          <button
            onClick={decline}
            className="py-2 px-3 bg-white/8 hover:bg-white/12 text-white/60 text-xs rounded-xl transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
