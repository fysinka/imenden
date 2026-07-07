import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, Gift } from 'lucide-react';
import { useCart } from '../store/cartStore';

export default function CartPage() {
  const { state, removeItem, updateQuantity, total, itemCount } = useCart();
  const navigate = useNavigate();
  const SHIPPING = 5.99;
  const FREE_SHIPPING_THRESHOLD = 80;
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING;
  const grandTotal = total + shipping;

  if (state.items.length === 0) return (
    <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fadeIn">
        <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={40} className="text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 font-serif mb-2">Количката е празна</h2>
        <p className="text-gray-500 mb-6">Разгледайте нашите продукти с български народни мотиви и намерете нещо специално.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg">
          <Gift size={18} /> Към магазина
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/shop" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 transition-colors">
            <ArrowLeft size={15} /> Магазин
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
            <ShoppingBag size={22} className="text-amber-600" />
            Количка ({itemCount})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item, idx) => {
              const imgs = (item.product as unknown as { product_images?: typeof item.product.images }).product_images || item.product.images || [];
              const img = imgs.find(i => i.is_primary)?.url || imgs[0]?.url ||
                'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=200';

              return (
                <div key={idx} className="bg-white rounded-2xl border-2 border-gray-200 p-4 flex gap-4 animate-fadeIn">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                    <img src={img} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{item.product.name}</h3>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.selectedSize && (
                        <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">{item.selectedSize}</span>
                      )}
                      {item.selectedColor && (
                        <span className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                          <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: item.selectedColor.hex }} />
                          {item.selectedColor.name}
                        </span>
                      )}
                      {item.customization && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          Персонализирана
                        </span>
                      )}
                    </div>

                    {item.customization?.customText && (
                      <p className="text-xs text-gray-400 mb-2 italic truncate max-w-xs">"{item.customization.customText}"</p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => item.quantity > 1 ? updateQuantity(item.product.id, item.quantity - 1) : removeItem(idx)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-amber-600">{(item.product.price * item.quantity).toFixed(2)} лв.</span>
                        <button onClick={() => removeItem(idx)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sticky top-24 shadow-sm">
              <h2 className="font-bold text-gray-900 font-serif text-lg mb-4">Обобщение</h2>

              <div className="space-y-3 mb-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Продукти</span>
                  <span>{total.toFixed(2)} лв.</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Доставка</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">Безплатна!</span>
                  ) : (
                    <span>{shipping.toFixed(2)} лв.</span>
                  )}
                </div>
                {shipping > 0 && total > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 animate-fadeIn">
                    <p className="text-xs text-amber-800">
                      <strong>Добавете още {(FREE_SHIPPING_THRESHOLD - total).toFixed(2)} лв.</strong> и спечелете безплатна доставка!
                    </p>
                    <div className="mt-2 h-2 bg-amber-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-gray-100 pt-4 mb-5">
                <div className="flex justify-between font-bold text-xl">
                  <span>Общо</span>
                  <span className="text-amber-600">{grandTotal.toFixed(2)} лв.</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-lg"
              >
                Продължи <ArrowRight size={18} />
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                Плащане при доставка · Без регистрация
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
