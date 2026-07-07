import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  NameDay, Holiday, ChurchHoliday, FolkTradition,
  HistoricalEvent, FamousPerson, MoveableFeast,
} from '../types';
import {
  Plus, Edit2, Trash2, X, Check, Star, Globe, Church,
  Feather, AlertCircle, Link as LinkIcon, BookOpen, User2, Sparkles,
} from 'lucide-react';

type Tab = 'namedays' | 'holidays' | 'church' | 'traditions' | 'historical' | 'famous' | 'moveable';

type AnyEntry = Partial<NameDay & Holiday & ChurchHoliday & FolkTradition & HistoricalEvent & FamousPerson & MoveableFeast>;

const TABLE_MAP: Record<Tab, string> = {
  namedays: 'name_days',
  holidays: 'holidays',
  church: 'church_holidays',
  traditions: 'folk_traditions',
  historical: 'historical_events',
  famous: 'famous_people',
  moveable: 'moveable_feasts',
};

export default function AdminCalendar() {
  const [tab, setTab] = useState<Tab>('namedays');
  const [data, setData] = useState<Record<Tab, AnyEntry[]>>({
    namedays: [], holidays: [], church: [], traditions: [],
    historical: [], famous: [], moveable: [],
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AnyEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [nd, hol, ch, tr, hist, fam, mov] = await Promise.all([
      supabase.from('name_days').select('*').order('date_key'),
      supabase.from('holidays').select('*').order('date_key'),
      supabase.from('church_holidays').select('*').order('date_key'),
      supabase.from('folk_traditions').select('*').order('title'),
      supabase.from('historical_events').select('*').order('date_key'),
      supabase.from('famous_people').select('*').order('name'),
      supabase.from('moveable_feasts').select('*').order('date'),
    ]);
    setData({
      namedays: nd.data || [],
      holidays: hol.data || [],
      church: ch.data || [],
      traditions: tr.data || [],
      historical: hist.data || [],
      famous: fam.data || [],
      moveable: mov.data || [],
    });
    setLoading(false);
  }

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);

    let payload: Record<string, unknown> = { link: editing.link || null };

    if (tab === 'namedays') {
      const names = typeof editing.names === 'string'
        ? (editing.names as unknown as string).split(',').map(n => n.trim())
        : editing.names || [];
      payload = { ...payload, date_key: editing.date_key, names, description: editing.description || null };
    } else if (tab === 'holidays') {
      payload = { ...payload, date_key: editing.date_key, name: editing.name, type: editing.type || 'national', description: editing.description || null };
    } else if (tab === 'church') {
      payload = { ...payload, date_key: editing.date_key, name: editing.name, type: editing.type || 'saint', description: editing.description || null, is_great_feast: editing.is_great_feast || false };
    } else if (tab === 'traditions') {
      payload = { ...payload, date_key: editing.date_key || null, title: editing.title || '', content: editing.content || null, proverb: editing.proverb || null, category: editing.category || 'general' };
    } else if (tab === 'historical') {
      payload = { ...payload, date_key: editing.date_key, year: editing.year || null, title: editing.title || '', description: editing.description || null, category: editing.category || 'general' };
    } else if (tab === 'famous') {
      payload = { ...payload, date_key: editing.date_key, name: editing.name || '', event_type: editing.event_type || 'born', year: editing.year || null, profession: editing.profession || null, nationality: editing.nationality || null, description: editing.description || null };
    } else if (tab === 'moveable') {
      payload = { ...payload, feast_key: editing.feast_key || '', year: editing.year || new Date().getFullYear(), date: editing.date || '', name: editing.name || '', description: editing.description || null, is_great_feast: editing.is_great_feast || false };
    }

    if (editing.id) {
      await supabase.from(TABLE_MAP[tab]).update(payload).eq('id', editing.id);
    } else {
      await supabase.from(TABLE_MAP[tab]).insert(payload);
    }

    await load();
    setEditing(null);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from(TABLE_MAP[tab]).delete().eq('id', deleteId);
    await load();
    setDeleteId(null);
  };

  const TABS: { id: Tab; label: string; short: string; icon: React.ElementType }[] = [
    { id: 'namedays', label: 'Именни дни', short: 'Имена', icon: Star },
    { id: 'holidays', label: 'Официални', short: 'Офиц.', icon: Globe },
    { id: 'church', label: 'Църковни', short: 'Църква', icon: Church },
    { id: 'traditions', label: 'Традиции', short: 'Традиц.', icon: Feather },
    { id: 'historical', label: 'История', short: 'История', icon: BookOpen },
    { id: 'famous', label: 'Личности', short: 'Личности', icon: User2 },
    { id: 'moveable', label: 'Подвижни', short: 'Подвиж.', icon: Sparkles },
  ];

  const currentData = data[tab];

  const getLabel = (item: AnyEntry) => {
    if (tab === 'namedays') return (item.names as string[] | undefined)?.join(', ') || '';
    if (tab === 'traditions' || tab === 'historical') return item.title || '';
    return item.name || '';
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Управление на Календара</h1>
        <button
          onClick={() => setEditing({ date_key: '' })}
          className="flex items-center gap-2 px-4 py-2 bg-[#c0392b] hover:bg-[#e74c3c] text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus size={16} /> Добави
        </button>
      </div>

      <div className="flex flex-wrap gap-1 bg-white border border-gray-200 rounded-2xl p-1">
        {TABS.map(({ id, short, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-medium transition-all min-w-[70px] ${
              tab === id ? 'bg-[#1a1a2e] text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon size={13} />
            <span>{short}</span>
            <span className={`text-[10px] px-1 py-0.5 rounded-full ${tab === id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {data[id].length}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Зареждане...</div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
            {currentData.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50">
                {item.date_key && (
                  <span className="font-mono text-xs font-bold text-[#c0392b] bg-[#c0392b]/10 px-2 py-1 rounded-lg shrink-0">
                    {item.date_key}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{getLabel(item)}</p>
                  {item.link && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <LinkIcon size={10} className="text-blue-500 shrink-0" />
                      <span className="text-xs text-blue-600 truncate max-w-[280px]">{item.link}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      if (tab === 'namedays') {
                        setEditing({ ...item, names: item.names as unknown as string[] });
                      } else {
                        setEditing({ ...item });
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-[#c0392b] transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(item.id as string)}
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
          <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-scaleIn overflow-y-auto max-h-[95vh]">
            <div className="bg-[#1a1a2e] px-6 py-4 flex items-center justify-between sticky top-0 rounded-t-3xl sm:rounded-t-3xl">
              <h3 className="text-white font-bold">{editing.id ? 'Редактирай' : 'Нов запис'}</h3>
              <button onClick={() => setEditing(null)} className="p-2 rounded-xl bg-white/10 text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Common: date_key */}
              {tab !== 'moveable' && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Дата (ММ-ДД){tab !== 'traditions' && ' *'}</label>
                  <input
                    value={editing.date_key || ''}
                    onChange={e => setEditing(p => ({ ...p!, date_key: e.target.value }))}
                    placeholder="07-03"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                  />
                </div>
              )}

              {/* Namedays */}
              {tab === 'namedays' && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Имена (разделени с запетая) *</label>
                  <input
                    value={Array.isArray(editing.names) ? (editing.names as string[]).join(', ') : ''}
                    onChange={e => setEditing(p => ({ ...p!, names: e.target.value.split(',').map(n => n.trim()) as unknown as string[] }))}
                    placeholder="Иван, Ивана, Ивайло"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                  />
                </div>
              )}

              {/* Holidays / Church */}
              {(tab === 'holidays' || tab === 'church' || tab === 'famous' || tab === 'moveable') && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Наименование *</label>
                  <input
                    value={editing.name || ''}
                    onChange={e => setEditing(p => ({ ...p!, name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                  />
                </div>
              )}

              {/* Traditions / Historical */}
              {(tab === 'traditions' || tab === 'historical') && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Заглавие *</label>
                  <input
                    value={editing.title || ''}
                    onChange={e => setEditing(p => ({ ...p!, title: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                  />
                </div>
              )}

              {/* Historical: year */}
              {(tab === 'historical' || tab === 'famous' || tab === 'moveable') && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Година</label>
                  <input
                    type="number"
                    value={editing.year || ''}
                    onChange={e => setEditing(p => ({ ...p!, year: parseInt(e.target.value) || undefined }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                  />
                </div>
              )}

              {/* Famous: event_type, profession */}
              {tab === 'famous' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Тип събитие</label>
                    <select
                      value={editing.event_type || 'born'}
                      onChange={e => setEditing(p => ({ ...p!, event_type: e.target.value as 'born' | 'died' }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#c0392b]"
                    >
                      <option value="born">Роден/а</option>
                      <option value="died">Починал/а</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Професия</label>
                    <input
                      value={editing.profession || ''}
                      onChange={e => setEditing(p => ({ ...p!, profession: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                    />
                  </div>
                </>
              )}

              {/* Moveable feasts: feast_key, date */}
              {tab === 'moveable' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Ключ</label>
                    <input
                      value={editing.feast_key || ''}
                      onChange={e => setEditing(p => ({ ...p!, feast_key: e.target.value }))}
                      placeholder="easter"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Дата (ГГГГ-ММ-ДД) *</label>
                    <input
                      value={editing.date || ''}
                      onChange={e => setEditing(p => ({ ...p!, date: e.target.value }))}
                      placeholder="2026-04-12"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                    />
                  </div>
                </>
              )}

              {/* Church / Moveable: is_great_feast */}
              {(tab === 'church' || tab === 'moveable') && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.is_great_feast || false}
                    onChange={e => setEditing(p => ({ ...p!, is_great_feast: e.target.checked }))}
                    className="accent-[#c0392b]"
                  />
                  <span className="text-sm text-gray-700">Голям празник</span>
                </label>
              )}

              {/* Traditions: content, proverb */}
              {tab === 'traditions' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Съдържание</label>
                    <textarea
                      value={editing.content || ''}
                      onChange={e => setEditing(p => ({ ...p!, content: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b] resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Поговорка</label>
                    <input
                      value={editing.proverb || ''}
                      onChange={e => setEditing(p => ({ ...p!, proverb: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                    />
                  </div>
                </>
              )}

              {/* Description for most tabs */}
              {tab !== 'traditions' && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Описание</label>
                  <textarea
                    value={editing.description || ''}
                    onChange={e => setEditing(p => ({ ...p!, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b] resize-none"
                  />
                </div>
              )}

              {/* Link — for EVERY tab */}
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 space-y-2">
                <label className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                  <LinkIcon size={12} /> Линк към статия
                </label>
                <input
                  value={editing.link || ''}
                  onChange={e => setEditing(p => ({ ...p!, link: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 border border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white"
                />
                <p className="text-[11px] text-blue-500">Когато е зададен, ще се появи бутон "Към статията" в модала на деня.</p>
              </div>

              <div className="flex gap-3 pt-1">
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
