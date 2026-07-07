import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { ShoppingCart, Star, ArrowRight } from 'lucide-react';
import { useCart } from '../store/cartStore';

const RECOMMENDATIONS = [
  { to: '/calendar', label: 'Предстоящи именни дни', icon: '📅' },
  { to: '/shop?cat=tenishki', label: 'Персонализирани тениски', icon: '👕' },
  { to: '/ai-services', label: 'AI Пожелание', icon: '✨' },
  { to: '/shop', label: 'Подаръци', icon: '🎁' },
  { to: '/feedback', label: 'Обратна връзка', icon: '💬' },
];

export default function ProductCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCart();
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('is_active', true)
        .limit(10);
      if (data) setProducts(data as Product[]);
    }
    load();
  }, []);

  if (products.length === 0) return null;

  const doubled = [...products, ...products];

  const getImage = (p: Product) => {
    const images = (p as unknown as { product_images?: typeof p.images }).product_images || p.images || [];
    return images.find(i => i.is_primary)?.url || images[0]?.url || 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=400';
  };

  return (
    <section className="relative overflow-hidden">
      {/* Top recommendations bar */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-5 px-4">
        <div className="max-w-7xl mx-auto mb-4">
          <h3 className="text-white font-bold text-lg font-serif flex items-center gap-2">
            Препоръчани
            <Link to="/shop" className="ml-auto text-white/80 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors">
              Виж всички <ArrowRight size={14} />
            </Link>
          </h3>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="scroll-container justify-center flex-wrap">
            {RECOMMENDATIONS.map(({ to, label, icon }) => (
              <Link key={to} to={to} className="rec-card shrink-0 min-w-[140px] bg-white hover:bg-amber-50 transition-colors">
                <span className="text-xl">{icon}</span>
                <span className="font-semibold text-gray-900 text-sm">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Products carousel */}
      <div className="bg-white py-6 border-y-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <h3 className="font-serif font-bold text-xl text-gray-900 flex items-center gap-2">
            Отищи в магазина
            <Link to="/shop" className="ml-auto text-amber-600 text-xs font-medium flex items-center gap-1 hover:underline transition-colors">
              Всички продукти <ArrowRight size={14} />
            </Link>
          </h3>
        </div>

        <div className="relative">
          <div
            ref={trackRef}
            className="flex gap-4 animate-carousel"
            style={{ width: 'max-content' }}
            onMouseEnter={() => { if (trackRef.current) trackRef.current.style.animationPlayState = 'paused'; }}
            onMouseLeave={() => { if (trackRef.current) trackRef.current.style.animationPlayState = 'running'; }}
          >
            {doubled.map((product, idx) => {
              const img = getImage(product);
              return (
                <div key={`${product.id}-${idx}`} className="w-52 shrink-0">
                  <div className="product-card group">
                    <Link to={`/shop/${product.slug}`} className="block">
                      <div className="relative overflow-hidden">
                        <img
                          src={img}
                          alt={product.name}
                          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {product.compare_price && (
                          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg">ПРОМО</div>
                        )}
                      </div>
                    </Link>
                    <div className="product-card-footer">
                      <Link to={`/shop/${product.slug}`}>
                        <p className="text-white font-semibold text-xs line-clamp-1 group-hover:text-amber-300 transition-colors">
                          {product.name}
                        </p>
                      </Link>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-amber-300 font-bold text-sm">{product.price.toFixed(2)} лв.</span>
                        {!product.is_customizable && product.stock_quantity > 0 && (
                          <button
                            onClick={() => addItem(product)}
                            className="p-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-lg transition-colors"
                          >
                            <ShoppingCart size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
