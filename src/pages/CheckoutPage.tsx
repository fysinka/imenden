import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../store/cartStore';
import { supabase } from '../lib/supabase';
import { Check, ArrowLeft, Truck, Package, Phone, MapPin, Mail, User, FileText } from 'lucide-react';

export default function CheckoutPage() {
  const { state, clearCart, total } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNum, setOrderNum] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const SHIPPING = total >= 80 ? 0 : 5.99;
  const grandTotal = total + SHIPPING;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Моля въведете вашето име';
    if (!phone.trim()) e.phone = 'Моля въведете телефон';
    if (phone && !/^[+]?[\d\s\-()]{7,}$/.test(phone)) e.phone = 'Невалиден телефонен номер';
    if (!address.trim()) e.address = 'Моля въведете адрес';
    if (!city.trim()) e.city = 'Моля въведете град';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Невалиден имейл';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: name,
        customer_phone: phone,
        customer_email: email || null,
        delivery_address: address,
        city,
        note: note || null,
        subtotal: total,
        shipping_cost: SHIPPING,
        total: grandTotal,
        payment_method: 'cash_on_delivery',
      })
      .select()
      .maybeSingle();

    if (orderError || !order) {
      setSubmitting(false);
      alert('Грешка при поръчката. Опитайте отново.');
      return;
    }

    await supabase.from('order_items').insert(
      state.items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
        customization: item.customization || {},
      }))
    );

    setOrderNum(order.order_number);
    setSuccess(true);
    clearCart();
    setSubmitting(false);
  };

  if (success) return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-sm border border-gray-100 animate-scaleIn">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <Check size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-serif">Поръчката е приета!</h2>
        <p className="text-gray-500 mb-1">Номер на поръчката:</p>
        <p className="font-bold text-[#c0392b] text-lg mb-5">{orderNum}</p>
        <p className="text-gray-600 text-sm mb-6">
          Ще се свържем с вас на посочения телефон, за да потвърдим поръчката и да уточним детайлите за доставката.
        </p>
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-sm text-gray-600 space-y-1">
          <p><strong>Доставка:</strong> 1-3 работни дни</p>
          <p><strong>Плащане:</strong> При доставка</p>
        </div>
        <Link to="/" className="block w-full py-3 bg-[#c0392b] hover:bg-[#e74c3c] text-white font-semibold rounded-2xl transition-colors">
          Към началото
        </Link>
      </div>
    </div>
  );

  if (state.items.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/cart" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#c0392b] transition-colors">
            <ArrowLeft size={15} /> Количка
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-gray-900 font-serif">Оформяне на поръчка</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-6 space-y-5">
              <h2 className="font-bold text-gray-900 font-serif text-lg">Данни за доставка</h2>

              <Field label="Три имена *" error={errors.name}>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Иван Петров"
                    className={inputClass(!!errors.name)}
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Телефон *" error={errors.phone}>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+359 888 123 456"
                      type="tel"
                      className={inputClass(!!errors.phone)}
                      style={{ paddingLeft: '2.25rem' }}
                    />
                  </div>
                </Field>

                <Field label="Имейл (по желание)" error={errors.email}>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      type="email"
                      className={inputClass(!!errors.email)}
                      style={{ paddingLeft: '2.25rem' }}
                    />
                  </div>
                </Field>
              </div>

              <Field label="Адрес за доставка *" error={errors.address}>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="ул. Витоша 1, ет. 3, ап. 5"
                    className={inputClass(!!errors.address)}
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
              </Field>

              <Field label="Град *" error={errors.city}>
                <input
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="София"
                  className={inputClass(!!errors.city)}
                />
              </Field>

              <Field label="Бележка (по желание)">
                <div className="relative">
                  <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Допълнителни инструкции за доставката..."
                    rows={3}
                    className={`${inputClass(false)} resize-none`}
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
              </Field>

              {/* Delivery info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { icon: Truck, title: 'Метод на доставка', text: 'Куриер (1-3 раб. дни)' },
                  { icon: Package, title: 'Плащане', text: 'В брой при доставка' },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Icon size={18} className="text-[#c0392b] shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">{title}</p>
                      <p className="text-sm font-semibold text-gray-900">{text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#c0392b] hover:bg-[#e74c3c] disabled:opacity-60 text-white font-bold rounded-2xl transition-colors text-base"
              >
                {submitting ? 'Изпращане...' : `Поръчай — ${grandTotal.toFixed(2)} лв.`}
              </button>

              <p className="text-center text-xs text-gray-400">
                С поръчката приемате нашите{' '}
                <Link to="/terms" className="text-[#c0392b] hover:underline">Общи условия</Link>
              </p>
            </form>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-100 p-5 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4 font-serif">Вашата поръчка</h2>
              <div className="space-y-3 mb-4">
                {state.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{item.product.name}</p>
                      <p className="text-gray-400 text-xs">
                        {item.selectedSize && `${item.selectedSize} · `}
                        {item.selectedColor?.name && `${item.selectedColor.name} · `}
                        x{item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold shrink-0 ml-2">{(item.product.price * item.quantity).toFixed(2)} лв.</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Продукти</span><span>{total.toFixed(2)} лв.</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Доставка</span>
                  {SHIPPING === 0 ? <span className="text-green-600">Безплатна</span> : <span>{SHIPPING.toFixed(2)} лв.</span>}
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                  <span>Общо</span>
                  <span className="text-[#c0392b]">{grandTotal.toFixed(2)} лв.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full px-3.5 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${
    hasError ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#c0392b]'
  }`;
}
