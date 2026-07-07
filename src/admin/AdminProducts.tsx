import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';
import { Plus, Search, Edit2, Trash2, Star, Package, X, Check, AlertCircle } from 'lucide-react';

const EMPTY: Partial<Product> = {
  name: '', slug: '', description: '', short_description: '', price: 0,
  stock_quantity: 0, is_active: true, is_featured: false, is_customizable: false,
  available_sizes: [], available_colors: [], product_type: 'standard', tags: [],
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [prod, cat] = await Promise.all([
      supabase.from('products').select('*, product_images(*), categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order'),
    ]);
    setProducts(prod.data as Product[] || []);
    setCategories(cat.data || []);
    setLoading(false);
  }

  const save = async () => {
    if (!editing?.name || !editing.price) return;
    setSaving(true);
    const slug = editing.slug || editing.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const payload = {
      name: editing.name,
      slug,
      description: editing.description || null,
      short_description: editing.short_description || null,
      price: Number(editing.price),
      compare_price: editing.compare_price ? Number(editing.compare_price) : null,
      stock_quantity: Number(editing.stock_quantity) || 0,
      category_id: editing.category_id || null,
      is_active: editing.is_active !== false,
      is_featured: editing.is_featured || false,
      is_customizable: editing.is_customizable || false,
      available_sizes: editing.available_sizes || [],
      available_colors: editing.available_colors || [],
      product_type: editing.product_type || 'standard',
      tags: editing.tags || [],
      updated_at: new Date().toISOString(),
    };

    if (editing.id) {
      await supabase.from('products').update(payload).eq('id', editing.id);
    } else {
      const { data: newProd } = await supabase.from('products').insert(payload).select().maybeSingle();
      if (newProd && imageUrl) {
        await supabase.from('product_images').insert({ product_id: newProd.id, url: imageUrl, is_primary: true });
      }
    }

    if (editing.id && imageUrl) {
      await supabase.from('product_images').insert({ product_id: editing.id, url: imageUrl, is_primary: false });
    }

    await load();
    setEditing(null);
    setImageUrl('');
    setSaving(false);
  };

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeleteId(null);
  };

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Продукти</h1>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="flex items-center gap-2 px-4 py-2 bg-[#c0392b] hover:bg-[#e74c3c] text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus size={16} /> Добави продукт
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Търси продукти..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Зареждане...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Продукт', 'Цена', 'Наличност', 'Рейтинг', 'Статус', 'Действия'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(prod => {
                  const prodImgs = (prod as unknown as { product_images?: typeof prod.images }).product_images || prod.images || [];
                  const img = prodImgs.find(i => i.is_primary)?.url || prodImgs[0]?.url;
                  return (
                    <tr key={prod.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <Package size={16} className="text-gray-300 m-auto mt-2.5" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{prod.name}</p>
                            {prod.is_featured && <span className="text-[10px] font-bold text-[#d4a017]">★ Препоръчан</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#c0392b] whitespace-nowrap">{prod.price.toFixed(2)} лв.</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${prod.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {prod.stock_quantity > 0 ? `${prod.stock_quantity} бр.` : 'Изчерпано'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-[#d4a017] fill-current" />
                          <span className="text-xs text-gray-600">{prod.rating?.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${prod.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {prod.is_active ? 'Активен' : 'Неактивен'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => setEditing(prod)} className="p-1.5 text-gray-400 hover:text-[#c0392b] transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeleteId(prod.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Няма намерени продукти</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 modal-backdrop" onClick={() => setEditing(null)} />
          <div className="relative w-full sm:max-w-2xl max-h-[95vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto animate-scaleIn">
            <div className="sticky top-0 bg-[#1a1a2e] px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold">{editing.id ? 'Редактирай продукт' : 'Нов продукт'}</h3>
              <button onClick={() => setEditing(null)} className="p-2 rounded-xl bg-white/10 text-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Название *</label>
                  <input value={editing.name || ''} onChange={e => setEditing(p => ({ ...p!, name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Slug (URL)</label>
                  <input value={editing.slug || ''} onChange={e => setEditing(p => ({ ...p!, slug: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Цена *</label>
                  <input type="number" step="0.01" value={editing.price || ''} onChange={e => setEditing(p => ({ ...p!, price: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Старо цена</label>
                  <input type="number" step="0.01" value={editing.compare_price || ''} onChange={e => setEditing(p => ({ ...p!, compare_price: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Наличност</label>
                  <input type="number" value={editing.stock_quantity || 0} onChange={e => setEditing(p => ({ ...p!, stock_quantity: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Категория</label>
                  <select value={editing.category_id || ''} onChange={e => setEditing(p => ({ ...p!, category_id: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b] bg-white">
                    <option value="">Без категория</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Кратко описание</label>
                <input value={editing.short_description || ''} onChange={e => setEditing(p => ({ ...p!, short_description: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Описание</label>
                <textarea value={editing.description || ''} onChange={e => setEditing(p => ({ ...p!, description: e.target.value }))} rows={4}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b] resize-none" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">URL на снимка (Pexels)</label>
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://images.pexels.com/..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]" />
              </div>

              <div className="flex flex-wrap gap-4">
                {[
                  { key: 'is_active', label: 'Активен' },
                  { key: 'is_featured', label: 'Препоръчан' },
                  { key: 'is_customizable', label: 'Персонализируем' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!(editing as Record<string, unknown>)[key]}
                      onChange={e => setEditing(p => ({ ...p!, [key]: e.target.checked }))}
                      className="accent-[#c0392b]" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#c0392b] hover:bg-[#e74c3c] disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                  <Check size={16} /> {saving ? 'Записване...' : 'Запази'}
                </button>
                <button onClick={() => setEditing(null)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm">
                  Отказ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 modal-backdrop" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scaleIn">
            <AlertCircle size={24} className="text-red-500 mx-auto mb-3" />
            <h3 className="text-center font-bold text-gray-900 mb-2">Изтриване на продукт</h3>
            <p className="text-center text-gray-500 text-sm mb-5">Тази операция е необратима. Сигурни ли сте?</p>
            <div className="flex gap-3">
              <button onClick={() => deleteProduct(deleteId)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors text-sm">
                Изтрий
              </button>
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors text-sm">
                Отказ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
