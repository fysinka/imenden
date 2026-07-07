import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShoppingBag, Package, MessageSquare, Newspaper, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Order } from '../types';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    orders: 0, pendingOrders: 0, products: 0, messages: 0, publications: 0,
    todayOrders: 0, totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0];
      const [orders, products, messages, publications] = await Promise.all([
        supabase.from('orders').select('id, status, total, created_at, customer_name, order_number'),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('contact_messages').select('id', { count: 'exact' }).eq('is_read', false),
        supabase.from('publications').select('id', { count: 'exact' }),
      ]);

      const allOrders = orders.data || [];
      const totalRevenue = allOrders.reduce((s: number, o: Order) => s + (o.total || 0), 0);
      const todayOrders = allOrders.filter((o: Order) => o.created_at?.startsWith(today)).length;
      const pending = allOrders.filter((o: Order) => o.status === 'pending').length;

      setStats({
        orders: allOrders.length,
        pendingOrders: pending,
        products: products.count || 0,
        messages: messages.count || 0,
        publications: publications.count || 0,
        todayOrders,
        totalRevenue,
      });
      setRecentOrders(allOrders.slice(-5).reverse() as Order[]);
      setLoading(false);
    }
    load();
  }, []);

  const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Чакаща', cls: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Потвърдена', cls: 'bg-blue-100 text-blue-700' },
    processing: { label: 'В обработка', cls: 'bg-purple-100 text-purple-700' },
    shipped: { label: 'Изпратена', cls: 'bg-indigo-100 text-indigo-700' },
    delivered: { label: 'Доставена', cls: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Отказана', cls: 'bg-red-100 text-red-700' },
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-28" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Добре дошли в административния панел на Имен ден
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Общо поръчки', value: stats.orders, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50', sub: `+${stats.todayOrders} днес` },
          { label: 'Чакащи поръчки', value: stats.pendingOrders, icon: Clock, color: 'text-yellow-600 bg-yellow-50', sub: 'Изискват внимание' },
          { label: 'Продукти', value: stats.products, icon: Package, color: 'text-green-600 bg-green-50', sub: 'Активни' },
          { label: 'Приходи', value: `${stats.totalRevenue.toFixed(2)} лв.`, icon: TrendingUp, color: 'text-[#c0392b] bg-red-50', sub: 'Всички поръчки' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Непрочетени съобщения', value: stats.messages, icon: MessageSquare, href: null },
          { label: 'Публикации', value: stats.publications, icon: Newspaper, href: null },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
              <Icon size={16} className="text-gray-500" />
            </div>
            <div>
              <p className="font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
        <div className="bg-[#1a1a2e] rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle size={18} className="text-green-400" />
          <div>
            <p className="text-white font-semibold text-sm">Системата работи</p>
            <p className="text-white/40 text-xs">Всички услуги са активни</p>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Последни поръчки</h2>
          <a href="/admin/orders" className="text-xs text-[#c0392b] hover:underline">Виж всички</a>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            <AlertCircle size={24} className="mx-auto mb-2 text-gray-300" />
            Няма поръчки все още
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Номер', 'Клиент', 'Сума', 'Статус', 'Дата'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{order.order_number}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{order.customer_name}</td>
                    <td className="px-4 py-3 font-semibold text-[#c0392b]">{order.total?.toFixed(2)} лв.</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CONFIG[order.status]?.cls || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_CONFIG[order.status]?.label || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('bg-BG') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
