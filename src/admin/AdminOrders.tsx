import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Order, OrderItem } from '../types';
import { Search, X, ChevronDown, Eye, Package, Truck, Check, RefreshCw } from 'lucide-react';

const STATUSES = [
  { value: '', label: 'Всички статуси' },
  { value: 'pending', label: 'Чакаща' },
  { value: 'confirmed', label: 'Потвърдена' },
  { value: 'processing', label: 'В обработка' },
  { value: 'shipped', label: 'Изпратена' },
  { value: 'delivered', label: 'Доставена' },
  { value: 'cancelled', label: 'Отказана' },
];

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  pending: { label: 'Чакаща', cls: 'bg-yellow-100 text-yellow-700', icon: RefreshCw },
  confirmed: { label: 'Потвърдена', cls: 'bg-blue-100 text-blue-700', icon: Check },
  processing: { label: 'В обработка', cls: 'bg-purple-100 text-purple-700', icon: Package },
  shipped: { label: 'Изпратена', cls: 'bg-indigo-100 text-indigo-700', icon: Truck },
  delivered: { label: 'Доставена', cls: 'bg-green-100 text-green-700', icon: Check },
  cancelled: { label: 'Отказана', cls: 'bg-red-100 text-red-700', icon: X },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  const openOrder = async (order: Order) => {
    setSelectedOrder(order);
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    setOrderItems(data || []);
  };

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingStatus(true);
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as Order['status'] } : o));
    if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status: status as Order['status'] } : null);
    setUpdatingStatus(false);
  };

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      o.order_number?.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q);
    return matchesSearch && (!statusFilter || o.status === statusFilter);
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Поръчки</h1>
        <button onClick={loadOrders} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-gray-400 transition-colors">
          <RefreshCw size={15} /> Обнови
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Търси по номер, клиент..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]">
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Зареждане...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Номер', 'Клиент', 'Телефон', 'Сума', 'Статус', 'Дата', 'Действия'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(order => {
                  const cfg = STATUS_CONFIG[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{order.order_number}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{order.customer_name}</td>
                      <td className="px-4 py-3 text-gray-500">{order.customer_phone}</td>
                      <td className="px-4 py-3 font-bold text-[#c0392b] whitespace-nowrap">{order.total?.toFixed(2)} лв.</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg?.cls || 'bg-gray-100 text-gray-600'}`}>
                          {cfg?.label || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('bg-BG') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => openOrder(order)}
                          className="p-1.5 text-gray-400 hover:text-[#c0392b] transition-colors">
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">Няма намерени поръчки</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 modal-backdrop" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full sm:max-w-lg max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto animate-scaleIn">
            <div className="sticky top-0 bg-[#1a1a2e] px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs">Поръчка</p>
                <h3 className="text-white font-bold">{selectedOrder.order_number}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl bg-white/10 text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Клиент', selectedOrder.customer_name],
                  ['Телефон', selectedOrder.customer_phone],
                  ['Имейл', selectedOrder.customer_email || '—'],
                  ['Адрес', selectedOrder.delivery_address],
                  ['Град', selectedOrder.city || '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-gray-400">{k}</p>
                    <p className="font-medium text-gray-900">{v}</p>
                  </div>
                ))}
              </div>

              {selectedOrder.note && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Бележка</p>
                  <p className="text-amber-800">{selectedOrder.note}</p>
                </div>
              )}

              {/* Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Артикули</h4>
                <div className="space-y-2">
                  {orderItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm border border-gray-100 rounded-xl p-3">
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-xs text-gray-400">x{item.quantity}</p>
                        {item.customization && Object.keys(item.customization).length > 0 && (
                          <p className="text-xs text-[#c0392b] mt-0.5">Персонализирана</p>
                        )}
                      </div>
                      <p className="font-bold text-gray-900">{item.total_price?.toFixed(2)} лв.</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600"><span>Продукти</span><span>{selectedOrder.subtotal?.toFixed(2)} лв.</span></div>
                <div className="flex justify-between text-gray-600"><span>Доставка</span><span>{selectedOrder.shipping_cost?.toFixed(2)} лв.</span></div>
                <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200 mt-1">
                  <span>Общо</span><span className="text-[#c0392b]">{selectedOrder.total?.toFixed(2)} лв.</span>
                </div>
              </div>

              {/* Status update */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Промени статус</p>
                <div className="grid grid-cols-3 gap-2">
                  {STATUSES.filter(s => s.value).map(s => {
                    const cfg = STATUS_CONFIG[s.value];
                    const Icon = cfg?.icon;
                    return (
                      <button
                        key={s.value}
                        onClick={() => updateStatus(selectedOrder.id, s.value)}
                        disabled={updatingStatus || selectedOrder.status === s.value}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          selectedOrder.status === s.value
                            ? `${cfg?.cls} opacity-100 ring-1 ring-current`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {Icon && <Icon size={12} />} {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
