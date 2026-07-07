import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SiteSetting } from '../types';
import { Settings, Save, RefreshCw } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('site_settings').select('*').order('key');
    setSettings(data || []);
    const vals: Record<string, string> = {};
    (data || []).forEach((s: SiteSetting) => { vals[s.key] = s.value || ''; });
    setValues(vals);
    setLoading(false);
  }

  const saveSettings = async () => {
    setSaving(true);
    const updates = settings.map(s => ({
      id: s.id,
      key: s.key,
      value: values[s.key] || '',
      updated_at: new Date().toISOString(),
    }));
    for (const u of updates) {
      await supabase.from('site_settings').update({ value: u.value, updated_at: u.updated_at }).eq('id', u.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const LABELS: Record<string, string> = {
    site_name: 'Название на сайта',
    site_tagline: 'Слоган',
    contact_email: 'Имейл за контакт',
    contact_phone: 'Телефон за контакт',
    contact_address: 'Адрес',
    shipping_cost: 'Цена за доставка (лв.)',
    free_shipping_threshold: 'Праг за безплатна доставка (лв.)',
    currency: 'Валута',
    footer_text: 'Текст в Footer',
    social_facebook: 'Facebook URL',
    social_instagram: 'Instagram URL',
    google_maps_url: 'Google Maps URL',
  };

  if (loading) return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => <div key={i} className="skeleton rounded-xl h-14" />)}
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 font-serif flex items-center gap-2">
          <Settings size={22} /> Настройки
        </h1>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      {saved && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-medium">
          Настройките са записани успешно!
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {settings.map(s => (
          <div key={s.key}>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
              {LABELS[s.key] || s.key}
            </label>
            {s.description && <p className="text-xs text-gray-400 mb-1.5">{s.description}</p>}
            <input
              value={values[s.key] || ''}
              onChange={e => setValues(v => ({ ...v, [s.key]: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b] transition-colors"
            />
          </div>
        ))}
      </div>

      <button
        onClick={saveSettings}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-[#c0392b] hover:bg-[#e74c3c] disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
      >
        <Save size={16} />
        {saving ? 'Записване...' : 'Запази настройките'}
      </button>
    </div>
  );
}
