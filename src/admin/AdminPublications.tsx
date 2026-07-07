import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Publication } from '../types';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, X, Check, AlertCircle } from 'lucide-react';

const EMPTY: Partial<Publication> = {
  title: '', slug: '', content: '', excerpt: '', cover_image: '',
  category: 'general', tags: [], is_published: false,
};

export default function AdminPublications() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Partial<Publication> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('publications').select('*').order('created_at', { ascending: false });
    setPublications(data || []);
    setLoading(false);
  }

  const save = async () => {
    if (!editing?.title) return;
    setSaving(true);
    const slug = editing.slug || editing.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '');
    const payload = {
      title: editing.title,
      slug,
      content: editing.content || null,
      excerpt: editing.excerpt || null,
      cover_image: editing.cover_image || null,
      category: editing.category || 'general',
      tags: editing.tags || [],
      is_published: editing.is_published || false,
      published_at: editing.is_published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (editing.id) {
      await supabase.from('publications').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('publications').insert(payload);
    }
    await load();
    setEditing(null);
    setSaving(false);
  };

  const togglePublish = async (pub: Publication) => {
    await supabase.from('publications').update({
      is_published: !pub.is_published,
      published_at: !pub.is_published ? new Date().toISOString() : null,
    }).eq('id', pub.id);
    setPublications(prev => prev.map(p => p.id === pub.id ? { ...p, is_published: !p.is_published } : p));
  };

  const deletePub = async (id: string) => {
    await supabase.from('publications').delete().eq('id', id);
    setPublications(prev => prev.filter(p => p.id !== id));
    setDeleteId(null);
  };

  const filtered = publications.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Публикации</h1>
        <button onClick={() => setEditing({ ...EMPTY })}
          className="flex items-center gap-2 px-4 py-2 bg-[#c0392b] hover:bg-[#e74c3c] text-white text-sm font-semibold rounded-xl transition-colors">
          <Plus size={16} /> Нова публикация
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Търси публикации..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Зареждане...</div> : (
          <div className="divide-y divide-gray-50">
            {filtered.map(pub => (
              <div key={pub.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50">
                {pub.cover_image && (
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img src={pub.cover_image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 line-clamp-1">{pub.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400 capitalize">{pub.category}</span>
                    <span className="text-gray-200">•</span>
                    <span className="text-xs text-gray-400">{pub.view_count} прегледа</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pub.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {pub.is_published ? 'Публикувана' : 'Чернова'}
                  </span>
                  <button onClick={() => togglePublish(pub)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors" title="Промени статус">
                    {pub.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => setEditing(pub)} className="p-1.5 text-gray-400 hover:text-[#c0392b] transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setDeleteId(pub.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">Няма публикации</div>
            )}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 modal-backdrop" onClick={() => setEditing(null)} />
          <div className="relative w-full sm:max-w-2xl max-h-[95vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto animate-scaleIn">
            <div className="sticky top-0 bg-[#1a1a2e] px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold">{editing.id ? 'Редактирай' : 'Нова публикация'}</h3>
              <button onClick={() => setEditing(null)} className="p-2 rounded-xl bg-white/10 text-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Заглавие *</label>
                <input value={editing.title || ''} onChange={e => setEditing(p => ({ ...p!, title: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">URL (slug)</label>
                  <input value={editing.slug || ''} onChange={e => setEditing(p => ({ ...p!, slug: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Категория</label>
                  <select value={editing.category || 'general'} onChange={e => setEditing(p => ({ ...p!, category: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#c0392b]">
                    <option value="general">Общо</option>
                    <option value="традиции">Традиции</option>
                    <option value="история">История</option>
                    <option value="религия">Религия</option>
                    <option value="именни дни">Именни дни</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Снимка (URL)</label>
                <input value={editing.cover_image || ''} onChange={e => setEditing(p => ({ ...p!, cover_image: e.target.value }))}
                  placeholder="https://images.pexels.com/..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Извадка</label>
                <textarea value={editing.excerpt || ''} onChange={e => setEditing(p => ({ ...p!, excerpt: e.target.value }))} rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b] resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Съдържание (HTML)</label>
                <textarea value={editing.content || ''} onChange={e => setEditing(p => ({ ...p!, content: e.target.value }))} rows={8}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b] resize-none font-mono" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.is_published || false} onChange={e => setEditing(p => ({ ...p!, is_published: e.target.checked }))} className="accent-[#c0392b]" />
                <span className="text-sm text-gray-700 font-medium">Публикувай веднага</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#c0392b] hover:bg-[#e74c3c] disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                  <Check size={16} /> {saving ? 'Записване...' : 'Запази'}
                </button>
                <button onClick={() => setEditing(null)} className="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm">Отказ</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 modal-backdrop" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scaleIn">
            <AlertCircle size={24} className="text-red-500 mx-auto mb-3" />
            <h3 className="text-center font-bold text-gray-900 mb-2">Изтриване</h3>
            <p className="text-center text-gray-500 text-sm mb-5">Тази операция е необратима.</p>
            <div className="flex gap-3">
              <button onClick={() => deletePub(deleteId)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm">Изтрий</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm">Отказ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
