import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { NameDay, Holiday, ChurchHoliday, FolkTradition } from '../types';
import { Plus, Edit2, Trash2, X, Check, Star, Globe, Church, Feather, AlertCircle, Link as LinkIcon } from 'lucide-react';

type Tab = 'namedays' | 'holidays' | 'church' | 'traditions';

export default function AdminCalendar() {
  const [tab, setTab] = useState<Tab>('namedays');
  const [nameDays, setNameDays] = useState<NameDay[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [churchHolidays, setChurchHolidays] = useState<ChurchHoliday[]>([]);
  const [traditions, setTraditions] = useState<FolkTradition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<NameDay | Holiday | ChurchHoliday | FolkTradition> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [nd, hol, ch, tr] = await Promise.all([
      supabase.from('name_days').select('*').order('date_key'),
      supabase.from('holidays').select('*').order('date_key'),
      supabase.from('church_holidays').select('*').order('date_key'),
      supabase.from('folk_traditions').select('*').order('title'),
    ]);
    setNameDays(nd.data || []);
    setHolidays(hol.data || []);
    setChurchHolidays(ch.data || []);
    setTraditions(tr.data || []);
    setLoading(false);
  }

  const saveNameDay = async () => {
    if (!editing) return;
    setSaving(true);
    const nd = editing as Partial<NameDay>;
    const names = typeof nd.names === 'string'
      ? (nd.names as unknown as string).split(',').map(n => n.trim())
      : nd.names || [];
    const payload = { date_key: nd.date_key, names, description: nd.description || null };
    if (nd.id) {
      await supabase.from('name_days').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', nd.id);
    } else {
      await supabase.from('name_days').upsert(payload, { onConflict: 'date_key' });
    }
    await load(); setEditing(null); setSaving(false);
  };

  const saveHoliday = async () => {
    if (!editing) return;
    setSaving(true);
    const h = editing as Partial<Holiday>;
    const payload = { date_key: h.date_key, name: h.name, type: h.type || 'national', description: h.description || null };
    if (h.id) {
      await supabase.from('holidays').update(payload).eq('id', h.id);
    } else {
      await supabase.from('holidays').insert(payload);
    }
    await load(); setEditing(null); setSaving(false);
  };

  const saveChurch = async () => {
    if (!editing) return;
    setSaving(true);
    const h = editing as Partial<ChurchHoliday>;
    const payload = {
      date_key: h.date_key, name: h.name, type: h.type || 'saint',
      description: h.description || null, is_great_feast: h.is_great_feast || false,
    };
    if (h.id) {
      await supabase.from('church_holidays').update(payload).eq('id', h.id);
    } else {
      await supabase.from('church_holidays').insert(payload);
    }
    await load(); setEditing(null); setSaving(false);
  };

  const saveTradition = async () => {
    if (!editing) return;
    setSaving(true);
    const t = editing as Partial<FolkTradition>;
    const payload = {
      date_key: t.date_key || null,
      title: t.title || '',
      content: t.content || null,
      proverb: t.proverb || null,
      link: t.link || null,
      category: t.category || 'general',
    };
    if (t.id) {
      await supabase.from('folk_traditions').update(payload).eq('id', t.id);
    } else {
      await supabase.from('folk_traditions').insert(payload);
    }
    await load(); setEditing(null); setSaving(false);
  };

  const handleSave = () => {
    if (tab === 'namedays') saveNameDay();
    else if (tab === 'holidays') saveHoliday();
    else if (tab === 'church') saveChurch();
    else saveTradition();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const tableMap: Record<Tab, string> = {
      namedays: 'name_days',
      holidays: 'holidays',
      church: 'church_holidays',
      traditions: 'folk_traditions',
    };
    await supabase.from(tableMap[tab]).delete().eq('id', deleteId);
    await load();
    setDeleteId(null);
  };

  const TABS = [
    { id: 'namedays' as Tab, label: 'Именни дни', icon: Star, count: nameDays.length },
    { id: 'holidays' as Tab, label: 'Официални празници', icon: Globe, count: holidays.length },
    { id: 'church' as Tab, label: 'Църковни', icon: Church, count: churchHolidays.length },
    { id: 'traditions' as Tab, label: 'Народни традиции', icon: Feather, count: traditions.length },
  ];

  const currentData = tab === 'namedays' ? nameDays
    : tab === 'holidays' ? holidays
    : tab === 'church' ? churchHolidays
    : traditions;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Управление на Календара</h1>
        <button
          onClick={() => setEditing({ date_key: '' })}
          className="flex items-center gap-2 px-4 py-2 bg-[#c0392b] hover:bg-[#e74c3c] text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus size={16} /> Добави запис
        </button>
      </div>

      <div className="flex flex-wrap gap-1 bg-white border border-gray-200 rounded-2xl p-1">
        {TABS.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all min-w-[110px] ${
              tab === id ? 'bg-[#1a1a2e] text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Зареждане...</div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
            {(currentData as Array<{ id: string; date_key?: string; name?: string; names?: string[]; title?: string; link?: string }>).map(item => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50">
                {item.date_key && (
                  <span className="font-mono text-xs font-bold text-[#c0392b] bg-[#c0392b]/10 px-2 py-1 rounded-lg shrink-0">
                    {item.date_key}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {tab === 'namedays'
                      ? (item as NameDay).names?.join(', ')
                      : tab === 'traditions'
                      ? (item as FolkTradition).title
                      : (item as Holiday).name}
                  </p>
                  {tab === 'traditions' && item.link && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <LinkIcon size={10} className="text-orange-500 shrink-0" />
                      <span className="text-xs text-orange-600 truncate max-w-[300px]">{item.link}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      if (tab === 'namedays') {
                        const nd = item as NameDay;
                        setEditing({ ...nd, names: nd.names as unknown as string[] });
                      } else {
                        setEditing(item as FolkTradition | Holiday | ChurchHoliday);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-[#c0392b] transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {currentData.length === 0 && (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">Няма записи</div>
            )}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 modal-backdrop" onClick={() => setEditing(null)} />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-scaleIn overflow-y-auto max-h-[95vh]">
            <div className="bg-[#1a1a2e] px-6 py-4 flex items-center justify-between sticky top-0 rounded-t-3xl sm:rounded-t-3xl">
              <h3 className="text-white font-bold">
                {(editing as { id?: string }).id ? 'Редактирай' : 'Нов запис'}
              </h3>
              <button onClick={() => setEditing(null)} className="p-2 rounded-xl bg-white/10 text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {tab !== 'traditions' && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Дата (ММ-ДД) *</label>
                  <input
                    value={(editing as { date_key?: string }).date_key || ''}
                    onChange={e => setEditing(p => ({ ...p!, date_key: e.target.value }))}
                    placeholder="07-03"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                  />
                </div>
              )}

              {tab === 'namedays' && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Имена (разделени с запетая) *</label>
                  <input
                    value={Array.isArray((editing as NameDay).names) ? (editing as NameDay).names?.join(', ') : ''}
                    onChange={e => setEditing(p => ({ ...p!, names: e.target.value.split(',').map(n => n.trim()) as unknown as string[] }))}
                    placeholder="Иван, Ивана, Ивайло"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                  />
                </div>
              )}

              {(tab === 'holidays' || tab === 'church') && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Наименование *</label>
                  <input
                    value={(editing as Holiday).name || ''}
                    onChange={e => setEditing(p => ({ ...p!, name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                  />
                </div>
              )}

              {tab === 'traditions' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Дата (ММ-ДД)</label>
                    <input
                      value={(editing as FolkTradition).date_key || ''}
                      onChange={e => setEditing(p => ({ ...p!, date_key: e.target.value }))}
                      placeholder="07-20"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Заглавие *</label>
                    <input
                      value={(editing as FolkTradition).title || ''}
                      onChange={e => setEditing(p => ({ ...p!, title: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Съдържание</label>
                    <textarea
                      value={(editing as FolkTradition).content || ''}
                      onChange={e => setEditing(p => ({ ...p!, content: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b] resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Поговорка</label>
                    <input
                      value={(editing as FolkTradition).proverb || ''}
                      onChange={e => setEditing(p => ({ ...p!, proverb: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mb-1">
                      <LinkIcon size={12} className="text-orange-500" /> Линк към статия
                    </label>
                    <input
                      value={(editing as FolkTradition).link || ''}
                      onChange={e => setEditing(p => ({ ...p!, link: e.target.value }))}
                      placeholder="https://..."
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Когато е зададен, ще се появи бутон "Към статията" в модала на деня.</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Категория</label>
                    <input
                      value={(editing as FolkTradition).category || ''}
                      onChange={e => setEditing(p => ({ ...p!, category: e.target.value }))}
                      placeholder="general"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                    />
                  </div>
                </>
              )}

              {tab !== 'traditions' && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Описание</label>
                  <textarea
                    value={(editing as { description?: string }).description || ''}
                    onChange={e => setEditing(p => ({ ...p!, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b] resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#c0392b] hover:bg-[#e74c3c] disabled:opacity-60 text-white font-semibold rounded-xl text-sm"
                >
                  <Check size={16} /> {saving ? 'Записване...' : 'Запази'}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm"
                >
                  Отказ
                </button>
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
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm">
                Изтрий
              </button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm">
                Отказ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
