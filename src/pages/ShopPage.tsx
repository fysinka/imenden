import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';
import { Search, Filter, X, Star, ShoppingCart, SlidersHorizontal, ChevronDown, ShoppingBag } from 'lucide-react';
import { useCart } from '../store/cartStore';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Препоръчани' },
  { value: 'price_asc', label: 'Цена: ниска → висока' },
  { value: 'price_desc', label: 'Цена: висока → ниска' },
  { value: 'rating', label: 'Най-добри оценки' },
  { value: 'newest', label: 'Най-нови' },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || '');
  const [sortBy, setSortBy] = useState('featured');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [prod, cat] = await Promise.all([
        supabase.from('products').select('*, product_images(*)').eq('is_active', true),
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
      ]);
      setProducts((prod.data as Product[]) || []);
      setCategories(cat.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let items = [...products];

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategory) {
      items = items.filter(p => {
        const cat = p.category as unknown as Category;
        return cat?.slug === selectedCategory;
      });
    }

    if (priceMin) items = items.filter(p => p.price >= Number(priceMin));
    if (priceMax) items = items.filter(p => p.price <= Number(priceMax));
    if (onlyInStock) items = items.filter(p => p.stock_quantity > 0);
    if (onlyDiscounted) items = items.filter(p => !!p.compare_price);

    switch (sortBy) {
      case 'price_asc': items.sort((a, b) => a.price - b.price); break;
      case 'price_desc': items.sort((a, b) => b.price - a.price); break;
      case 'rating': items.sort((a, b) => b.rating - a.rating); break;
      case 'newest': items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      case 'featured': items.sort((a, b) => Number(b.is_featured) - Number(a.is_featured)); break;
    }

    return items;
  }, [products, search, selectedCategory, priceMin, priceMax, sortBy, onlyInStock, onlyDiscounted]);

  const getImage = (p: Product) => {
    const images = (p as unknown as { product_images?: typeof p.images }).product_images || p.images || [];
    return images.find(i => i.is_primary)?.url || images[0]?.url ||
      'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=600';
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setPriceMin('');
    setPriceMax('');
    setOnlyInStock(false);
    setOnlyDiscounted(false);
    setSearchParams({});
  };

  const hasFilters = search || selectedCategory || priceMin || priceMax || onlyInStock || onlyDiscounted;

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-embroidery opacity-20" />
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-10 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-serif font-bold text-4xl text-white mb-2 flex items-center gap-3">
              <ShoppingBag size={36} />
              Магазин
            </h1>
            <p className="text-white/80">Подаръци и сувенири с български народни мотиви</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Side embroidery - desktop only */}
          <div className="hidden xl:block w-10 shrink-0 bg-embroidery-side bg-repeat rounded-l-2xl self-start sticky top-24" style={{ backgroundSize: '30px 80px', height: '600px' }} />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 mb-6">
              {/* Search */}
              <div className="relative flex-1 min-w-48">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Търси продукти..."
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Filters toggle */}
              <button
                onClick={() => setShowFilters(v => !v)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                  showFilters || hasFilters
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                }`}
              >
                <SlidersHorizontal size={16} />
                Филтри
                {hasFilters && <span className="w-2 h-2 bg-amber-400 rounded-full" />}
              </button>

              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-3 text-sm text-gray-500 hover:text-red-600 transition-colors">
                  <X size={14} /> Изчисти
                </button>
              )}
            </div>

            {/* Filters panel */}
            {showFilters && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 mb-6 animate-fadeIn">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Categories */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Категория</label>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      <button onClick={() => setSelectedCategory('')}
                        className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                          !selectedCategory ? 'bg-amber-100 text-amber-800 font-medium border-2 border-amber-300' : 'text-gray-600 hover:bg-gray-50'
                        }`}>
                        Всички ({products.length})
                      </button>
                      {categories.map(c => (
                        <button key={c.id} onClick={() => setSelectedCategory(c.slug)}
                          className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                            selectedCategory === c.slug ? 'bg-amber-100 text-amber-800 font-medium border-2 border-amber-300' : 'text-gray-600 hover:bg-gray-50'
                          }`}>
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Цена (лв.)</label>
                    <div className="flex gap-2">
                      <input value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="от" type="number"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
                      <input value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="до" type="number"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
                    </div>
                  </div>

                  {/* Other */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Допълнително</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={onlyInStock} onChange={e => setOnlyInStock(e.target.checked)} className="accent-amber-500" />
                        <span className="text-sm text-gray-700">Само в наличност</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={onlyDiscounted} onChange={e => setOnlyDiscounted(e.target.checked)} className="accent-amber-500" />
                        <span className="text-sm text-gray-700">Само промо</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Category chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  !selectedCategory ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-amber-400'
                }`}>
                Всички
              </button>
              {categories.map(c => (
                <button key={c.id} onClick={() => setSelectedCategory(c.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    selectedCategory === c.slug ? 'bg-black text-white' : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-black'
                  }`}>
                  {c.name}
                </button>
              ))}
            </div>

            {/* Results count */}
            <p className="text-sm text-gray-500 mb-4">{filtered.length} продукта</p>

            {/* Products grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-72" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <Filter size={40} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Няма намерени продукти</p>
                <button onClick={clearFilters} className="text-amber-600 font-semibold hover:underline">Изчисти филтрите</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} image={getImage(product)} onAddToCart={() => addItem(product)} />
                ))}
              </div>
            )}
          </div>

          {/* Right side embroidery - desktop only */}
          <div className="hidden xl:block w-10 shrink-0 bg-embroidery-side bg-repeat rounded-r-2xl self-start sticky top-24 transform rotate-180" style={{ backgroundSize: '30px 80px', height: '600px' }} />
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, image, onAddToCart }: { product: Product; image: string; onAddToCart: () => void }) {
  return (
    <div className="product-card group">
      <Link to={`/shop/${product.slug}`} className="block">
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={product.name}
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {product.compare_price && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
              ПРОМО
            </div>
          )}
          {product.is_customizable && (
            <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
              ПЕРСОНАЛИЗИРАН
            </div>
          )}
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-white px-3 py-2 rounded-lg">Изчерпано</span>
            </div>
          )}
        </div>
      </Link>

      {/* Black footer */}
      <div className="product-card-footer">
        <Link to={`/shop/${product.slug}`}>
          <p className="text-white font-semibold text-sm line-clamp-1 mb-1 group-hover:text-amber-300 transition-colors">
            {product.name}
          </p>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-300 font-bold">{product.price.toFixed(2)} лв.</span>
            {product.compare_price && (
              <span className="text-white/40 text-xs line-through">{product.compare_price.toFixed(2)}</span>
            )}
          </div>

          {!product.is_customizable && product.stock_quantity > 0 && (
            <button
              onClick={(e) => { e.preventDefault(); onAddToCart(); }}
              className="p-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg transition-colors"
            >
              <ShoppingCart size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} className={i < Math.round(product.rating) ? 'text-amber-400 fill-current' : 'text-white/30'} />
          ))}
          <span className="text-white/50 text-[10px] ml-1">({product.review_count})</span>
        </div>
      </div>
    </div>
  );
}
