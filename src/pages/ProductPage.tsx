import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product, ProductReview } from '../types';
import { Star, ShoppingCart, ArrowLeft, Package, Truck, Shield, ChevronLeft, ChevronRight, Heart, Share2, Palette } from 'lucide-react';
import { useCart } from '../store/cartStore';
import TshirtCustomizer from './TshirtCustomizer';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: prod } = await supabase
        .from('products')
        .select('*, product_images(*), categories(*)')
        .eq('slug', slug)
        .maybeSingle();

      if (!prod) { navigate('/shop'); return; }
      setProduct(prod as Product);
      if (prod.available_sizes?.length > 0) setSelectedSize(prod.available_sizes[0]);

      const [rev, rel] = await Promise.all([
        supabase.from('product_reviews').select('*').eq('product_id', prod.id).eq('is_approved', true).order('created_at', { ascending: false }),
        supabase.from('products').select('*, product_images(*)').eq('category_id', prod.category_id).neq('id', prod.id).eq('is_active', true).limit(4),
      ]);
      setReviews(rev.data || []);
      setRelated(rel.data as Product[] || []);
      setLoading(false);
    }
    load();
  }, [slug, navigate]);

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="skeleton rounded-3xl h-96" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton rounded-xl h-10" />)}
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const images = (product as unknown as { product_images?: typeof product.images }).product_images || product.images || [];
  const mainImage = images[activeImage]?.url || 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800';
  const selectedColor = product.available_colors?.[selectedColorIdx];

  const handleAddToCart = () => {
    if (product.is_customizable) { setShowCustomizer(true); return; }
    addItem(product, quantity, selectedSize, selectedColor);
    navigate('/cart');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    await supabase.from('product_reviews').insert({
      product_id: product.id,
      author_name: reviewName,
      rating: reviewRating,
      comment: reviewComment,
    });
    setReviewSuccess(true);
    setReviewSubmitting(false);
    setShowReviewForm(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link to="/shop" className="flex items-center gap-1 hover:text-[#c0392b] transition-colors">
            <ArrowLeft size={13} /> Магазин
          </Link>
          <span>/</span>
          <span className="text-gray-700">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {/* Images */}
          <div>
            <div className="relative rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm mb-3 aspect-square">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover animate-fadeIn"
                key={activeImage}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(i => Math.max(0, i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActiveImage(i => Math.min(images.length - 1, i + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors shrink-0 ${
                      i === activeImage ? 'border-[#c0392b]' : 'border-gray-200'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="font-serif font-bold text-2xl text-gray-900">{product.name}</h1>
                <div className="flex gap-2 shrink-0">
                  <button className="p-2 rounded-xl border border-gray-200 hover:border-[#c0392b] text-gray-400 hover:text-[#c0392b] transition-colors">
                    <Heart size={16} />
                  </button>
                  <button className="p-2 rounded-xl border border-gray-200 hover:border-gray-400 text-gray-400 transition-colors">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < Math.round(product.rating) ? 'text-[#d4a017] fill-current' : 'text-gray-200'} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">{product.rating?.toFixed(1)} ({product.review_count} рецензии)</span>
                <span className="text-gray-200">•</span>
                <span className="text-sm text-gray-500">{product.sold_count} продадени</span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#c0392b]">{product.price.toFixed(2)} лв.</span>
                {product.compare_price && (
                  <span className="text-lg text-gray-400 line-through">{product.compare_price.toFixed(2)} лв.</span>
                )}
                {product.compare_price && (
                  <span className="bg-[#c0392b]/10 text-[#c0392b] text-xs font-bold px-2 py-0.5 rounded-full">
                    -{Math.round((1 - product.price / product.compare_price) * 100)}%
                  </span>
                )}
              </div>
            </div>

            {product.short_description && (
              <p className="text-gray-600 text-sm leading-relaxed">{product.short_description}</p>
            )}

            {/* Colors */}
            {product.available_colors && product.available_colors.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Цвят: <span className="font-normal text-gray-500">{selectedColor?.name}</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {product.available_colors.map((color, i) => (
                    <button
                      key={color.hex}
                      onClick={() => setSelectedColorIdx(i)}
                      title={color.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        i === selectedColorIdx ? 'border-[#1a1a2e] scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.available_sizes && product.available_sizes.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Размер</label>
                <div className="flex gap-2 flex-wrap">
                  {product.available_sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a1a2e]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            {!product.is_customizable && (
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Количество</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors text-lg font-bold"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-semibold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors text-lg font-bold"
                  >
                    +
                  </button>
                  <span className="text-xs text-gray-400">от {product.stock_quantity} в наличност</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#c0392b] hover:bg-[#e74c3c] disabled:opacity-50 text-white font-semibold rounded-2xl transition-colors"
              >
                {product.is_customizable ? (
                  <><Palette size={18} /> Персонализирай</>
                ) : (
                  <><ShoppingCart size={18} /> Добави в количката</>
                )}
              </button>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, text: 'Безплатна доставка над 80 лв.' },
                { icon: Package, text: 'Доставка 1-3 дни' },
                { icon: Shield, text: 'Гаранция за качество' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center text-center gap-1 bg-gray-50 rounded-xl p-3">
                  <Icon size={16} className="text-gray-400" />
                  <span className="text-[10px] text-gray-500 leading-tight">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description + Reviews */}
        {product.description && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-8">
            <h2 className="font-serif font-bold text-xl text-gray-900 mb-4">Описание</h2>
            <div className="prose text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif font-bold text-xl text-gray-900">Рецензии ({reviews.length})</h2>
            <button
              onClick={() => setShowReviewForm(v => !v)}
              className="px-4 py-2 bg-[#1a1a2e] text-white text-sm font-medium rounded-xl hover:bg-[#c0392b] transition-colors"
            >
              Напишете рецензия
            </button>
          </div>

          {reviewSuccess && (
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl text-sm">
              Благодарим! Вашата рецензия е изпратена за преглед.
            </div>
          )}

          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="mb-6 p-5 bg-gray-50 rounded-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Вашето име</label>
                  <input
                    value={reviewName}
                    onChange={e => setReviewName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Оценка</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(r => (
                      <button key={r} type="button" onClick={() => setReviewRating(r)}>
                        <Star size={20} className={r <= reviewRating ? 'text-[#d4a017] fill-current' : 'text-gray-300'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Коментар</label>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b] resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="px-5 py-2 bg-[#c0392b] text-white text-sm font-semibold rounded-xl hover:bg-[#e74c3c] disabled:opacity-50 transition-colors"
              >
                {reviewSubmitting ? 'Изпращане...' : 'Изпрати'}
              </button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm">Все още няма рецензии. Бъдете пръв!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#1a1a2e]/10 flex items-center justify-center text-xs font-bold text-[#1a1a2e]">
                      {r.author_name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.author_name}</p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={11} className={i < r.rating ? 'text-[#d4a017] fill-current' : 'text-gray-200'} />
                        ))}
                      </div>
                    </div>
                    <span className="ml-auto text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString('bg-BG')}
                    </span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="font-serif font-bold text-xl text-gray-900 mb-5">Свързани продукти</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map(p => {
                const imgs = p.images || [];
                const imgs2 = (p as unknown as { product_images?: typeof p.images }).product_images || imgs;
              const img = imgs2.find(i => i.is_primary)?.url || imgs2[0]?.url || 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=400';
                return (
                  <Link key={p.id} to={`/shop/${p.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm card-hover">
                    <div className="h-36 overflow-hidden bg-gray-50">
                      <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-[#c0392b] transition-colors">{p.name}</p>
                      <p className="text-[#c0392b] font-bold text-sm">{p.price.toFixed(2)} лв.</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showCustomizer && product && (
        <TshirtCustomizer
          product={product}
          onClose={() => setShowCustomizer(false)}
          onDone={(customization) => {
            addItem(product, 1, customization.size, customization.color, customization);
            setShowCustomizer(false);
            navigate('/cart');
          }}
        />
      )}
    </div>
  );
}
