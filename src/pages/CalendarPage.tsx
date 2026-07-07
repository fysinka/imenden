import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, X, Star, Sparkles, Calendar as CalendarIcon, BookOpen, Globe, User2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NameDay, Holiday, ChurchHoliday, MoveableFeast, HistoricalEvent, FamousPerson, DayData } from '../types';
import DayModal from '../components/DayModal';

const BG_MONTHS = ['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември'];
const BG_DAYS_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];

function pad(n: number) { return String(n).padStart(2, '0'); }

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

export default function CalendarPage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loadingDay, setLoadingDay] = useState(false);
  const [nameDays, setNameDays] = useState<Record<string, NameDay>>({});
  const [holidays, setHolidays] = useState<Record<string, Holiday[]>>({});
  const [churchHolidays, setChurchHolidays] = useState<Record<string, ChurchHoliday[]>>({});
  const [moveableFeasts, setMoveableFeasts] = useState<Record<string, MoveableFeast[]>>({});
  const [histEvents, setHistEvents] = useState<Record<string, HistoricalEvent[]>>({});
  const [famousPeople, setFamousPeople] = useState<Record<string, FamousPerson[]>>({});
  const [searchDate, setSearchDate] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState<NameDay[]>([]);
  const [searchError, setSearchError] = useState('');
  const [showYearPicker, setShowYearPicker] = useState(false);

  const loadMonthData = useCallback(async (year: number, month: number) => {
    const monthStr = pad(month + 1);
    const [nd, hol, ch, mf] = await Promise.all([
      supabase.from('name_days').select('*').like('date_key', `${monthStr}-%`),
      supabase.from('holidays').select('*').like('date_key', `${monthStr}-%`),
      supabase.from('church_holidays').select('*').like('date_key', `${monthStr}-%`),
      supabase.from('moveable_feasts').select('*').eq('year', year).gte('date', `${year}-${monthStr}-01`).lt('date', `${year}-${(month + 1) % 12 === 0 ? 1 : (month + 1) % 12}-01`),
      supabase.from('historical_events').select('*').like('date_key', `${monthStr}-%`),
      supabase.from('famous_people').select('*').like('date_key', `${monthStr}-%`),
    ]);

    const ndMap: Record<string, NameDay> = {};
    (nd.data || []).forEach((n: NameDay) => { ndMap[n.date_key] = n; });
    setNameDays(ndMap);

    const holMap: Record<string, Holiday[]> = {};
    (hol.data || []).forEach((h: Holiday) => {
      if (!holMap[h.date_key]) holMap[h.date_key] = [];
      holMap[h.date_key].push(h);
    });
    setHolidays(holMap);

    const chMap: Record<string, ChurchHoliday[]> = {};
    (ch.data || []).forEach((h: ChurchHoliday) => {
      if (!chMap[h.date_key]) chMap[h.date_key] = [];
      chMap[h.date_key].push(h);
    });
    setChurchHolidays(chMap);

    const mfMap: Record<string, MoveableFeast[]> = {};
    (mf.data || []).forEach((f: MoveableFeast) => {
      const dk = f.date.slice(5);
      if (!mfMap[dk]) mfMap[dk] = [];
      mfMap[dk].push(f);
    });
    setMoveableFeasts(mfMap);

    const evMap: Record<string, HistoricalEvent[]> = {};
    (ev.data || []).forEach((e: HistoricalEvent) => {
      if (!evMap[e.date_key]) evMap[e.date_key] = [];
      evMap[e.date_key].push(e);
    });
    setHistEvents(evMap);

    const famMap: Record<string, FamousPerson[]> = {};
    (fam.data || []).forEach((p: FamousPerson) => {
      if (!famMap[p.date_key]) famMap[p.date_key] = [];
      famMap[p.date_key].push(p);
    });
    setFamousPeople(famMap);
  }, []);

  useEffect(() => { loadMonthData(viewYear, viewMonth); }, [viewYear, viewMonth, loadMonthData]);

  const openDay = async (date: Date) => {
    setSelectedDate(date);
    setLoadingDay(true);
    const key = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const month = date.getMonth() + 1;
    const dateStr = date.toISOString().slice(0, 10);
    const [nd, hol, ch, mf, ev, fam, trad] = await Promise.all([
      supabase.from('name_days').select('*').eq('date_key', key).maybeSingle(),
      supabase.from('holidays').select('*').eq('date_key', key),
      supabase.from('church_holidays').select('*').eq('date_key', key),
      supabase.from('moveable_feasts').select('*').eq('year', date.getFullYear()).eq('date', dateStr),
      supabase.from('historical_events').select('*').eq('date_key', key),
      supabase.from('famous_people').select('*').eq('date_key', key),
      supabase.from('folk_traditions').select('*').or(`date_key.eq.${key},month.eq.${month}`).limit(3),
    ]);
    setDayData({
      nameDay: nd.data || undefined,
      holidays: hol.data || [],
      churchHolidays: ch.data || [],
      moveableFeasts: mf.data || [],
      historicalEvents: ev.data || [],
      famousPeople: fam.data || [],
      folkTraditions: trad.data || [],
    });
    setLoadingDay(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleDateSearch = () => {
    setSearchError('');
    const [d, m, y] = searchDate.split(/[.\/\-]/).map(Number);
    if (!d || !m || isNaN(d) || isNaN(m)) {
      setSearchError('Въведете дата в формат ДД.ММ или ДД.ММ.ГГГГ');
      return;
    }
    const year = y || today.getFullYear();
    const date = new Date(year, m - 1, d);
    if (isNaN(date.getTime())) { setSearchError('Невалидна дата'); return; }
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
    openDay(date);
  };

  const handleNameSearch = async () => {
    if (!searchName.trim()) return;
    const { data } = await supabase
      .from('name_days')
      .select('*')
      .ilike('names', `%${searchName}%`)
      .limit(10);
    setSearchResults(data || []);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const years = Array.from({ length: 20 }, (_, i) => today.getFullYear() - 10 + i);

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-embroidery opacity-20" />
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-10 px-4 relative">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-serif font-bold text-4xl text-white mb-2 flex items-center gap-3">
              <CalendarIcon size={36} />
              Календар
            </h1>
            <p className="text-white/80 mb-6">Търси дата или име</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              {/* Date search */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                  <input
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDateSearch()}
                    placeholder="24.05 или 24.05.2025"
                    className="w-full pl-10 pr-3 py-3 bg-white/15 border border-white/30 rounded-xl text-white placeholder-white/50 text-sm focus:outline-none focus:bg-white/25"
                  />
                </div>
                <button onClick={handleDateSearch} className="px-4 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors">
                  Търси
                </button>
              </div>

              {/* Name search */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Star size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                  <input
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNameSearch()}
                    placeholder="Търси име: Иван"
                    className="w-full pl-10 pr-3 py-3 bg-white/15 border border-white/30 rounded-xl text-white placeholder-white/50 text-sm focus:outline-none focus:bg-white/25"
                  />
                </div>
                <button onClick={handleNameSearch} className="px-4 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors">
                  Намери
                </button>
              </div>
            </div>

            {searchError && <p className="mt-3 text-white/90 text-sm">{searchError}</p>}

            {/* Name search results */}
            {searchResults.length > 0 && (
              <div className="mt-4 bg-white rounded-xl p-4 shadow-lg animate-fadeIn">
                <h3 className="font-semibold text-gray-900 mb-2">Резултати за "{searchName}"</h3>
                <div className="space-y-2">
                  {searchResults.map(nd => (
                    <button
                      key={nd.id}
                      onClick={() => {
                        const [m, d] = nd.date_key.split('-');
                        setViewMonth(parseInt(m) - 1);
                        setViewYear(today.getFullYear());
                        openDay(new Date(today.getFullYear(), parseInt(m) - 1, parseInt(d)));
                        setSearchResults([]);
                        setSearchName('');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-100 transition-colors flex justify-between items-center"
                    >
                      <span className="font-medium text-gray-900">{nd.names.join(', ')}</span>
                      <span className="text-sm text-amber-600">{nd.date_key}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Calendar container */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 overflow-hidden">
          {/* Calendar header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 sm:px-6 py-4 flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-white transition-colors"
            >
              <ChevronLeft size={22} />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowYearPicker(v => !v)}
                  className="text-white font-bold text-2xl font-serif hover:bg-white/20 px-3 py-1 rounded-lg transition-colors"
                >
                  {viewYear}
                </button>
                {showYearPicker && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-28 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden z-10">
                    <div className="max-h-40 overflow-y-auto">
                      {years.map(y => (
                        <button
                          key={y}
                          onClick={() => { setViewYear(y); setShowYearPicker(false); }}
                          className={`w-full text-center py-2 text-sm hover:bg-amber-100 transition-colors ${
                            y === viewYear ? 'font-bold bg-amber-100' : ''
                          }`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <h2 className="text-white font-serif font-bold text-2xl">
                {BG_MONTHS[viewMonth]}
              </h2>
            </div>

            <button
              onClick={nextMonth}
              className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-white transition-colors"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 bg-amber-50">
            {BG_DAYS_SHORT.map((d, i) => (
              <div
                key={d}
                className={`py-3 text-center text-xs font-bold uppercase tracking-wider ${
                  i >= 5 ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[90px] bg-gray-50 border-b border-r border-gray-100" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const key = `${pad(viewMonth + 1)}-${pad(day)}`;
              const nd = nameDays[key];
              const hol = holidays[key] || [];
              const ch = churchHolidays[key] || [];
              const mf = moveableFeasts[key] || [];
              const ev = histEvents[key] || [];
              const fam = famousPeople[key] || [];
              const isWeekend = (firstDay + i) % 7 >= 5;
              const isHoliday = hol.length > 0 || mf.length > 0;
              const colIndex = (firstDay + i) % 7;
              const isLastCol = colIndex === 6 || i === daysInMonth - 1;

              return (
                <button
                  key={day}
                  onClick={() => openDay(new Date(viewYear, viewMonth, day))}
                  className={`min-h-[70px] sm:min-h-[90px] p-1.5 text-left border-b border-r transition-all hover:bg-amber-50 hover:z-10 relative group ${
                    isLastCol ? 'border-r-0' : ''
                  } ${isToday(day) ? 'bg-amber-100 ring-2 ring-amber-500 ring-inset' : 'border-gray-100'}`}
                >
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                    isToday(day)
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md'
                      : isHoliday
                      ? 'bg-red-100 text-red-700'
                      : isWeekend
                      ? 'text-red-600'
                      : 'text-gray-800'
                  }`}>
                    {day}
                  </span>

                  <div className="space-y-0.5 mt-1">
                    {nd && (
                      <p className="text-[9px] sm:text-[10px] text-amber-700 font-medium leading-tight truncate">
                        <Star size={8} className="inline mr-0.5" />
                        {nd.names.join(', ')}
                      </p>
                    )}
                    {hol.length > 0 && (
                      <p className="text-[9px] sm:text-[10px] text-red-600 font-medium leading-tight truncate">
                        <Sparkles size={8} className="inline mr-0.5" />
                        {hol[0].name.length > 12 ? hol[0].name.slice(0, 12) + '…' : hol[0].name}
                      </p>
                    )}
                    {ch.length > 0 && !hol.length && (
                      <p className="text-[9px] sm:text-[10px] text-purple-600 leading-tight truncate">
                        {ch[0].name.length > 12 ? ch[0].name.slice(0, 12) + '…' : ch[0].name}
                      </p>
                    )}
                    {mf.length > 0 && !hol.length && (
                      <p className="text-[9px] sm:text-[10px] text-green-600 font-medium leading-tight truncate">
                        <Sparkles size={8} className="inline mr-0.5" />
                        {mf[0].name.length > 14 ? mf[0].name.slice(0, 14) + '…' : mf[0].name}
                      </p>
                    )}
                    {ev.length > 0 && (
                      <p className="text-[9px] sm:text-[10px] text-indigo-600 leading-tight truncate">
                        <Globe size={8} className="inline mr-0.5" />
                        {ev[0].title.length > 16 ? ev[0].title.slice(0, 16) + '…' : ev[0].title}
                      </p>
                    )}
                    {fam.length > 0 && (
                      <p className="text-[9px] sm:text-[10px] text-pink-600 leading-tight truncate">
                        <User2 size={8} className="inline mr-0.5" />
                        {fam[0].name}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 px-1">
          {[
            { color: 'bg-gradient-to-br from-amber-500 to-orange-500', label: 'Днес' },
            { color: 'bg-amber-100', label: 'Именен ден', icon: Star },
            { color: 'bg-red-100', label: 'Официален празник', icon: Sparkles },
            { color: 'bg-green-100', label: 'Подвижен празник', icon: Sparkles },
            { color: 'bg-indigo-100', label: 'Историческо събитие', icon: Globe },
            { color: 'bg-pink-100', label: 'Известна личност', icon: User2 },
            { color: 'bg-purple-100', label: 'Църковен празник' },
          ].map(({ color, label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-gray-600">
              {Icon ? (
                <div className={`w-5 h-5 rounded-full ${color} flex items-center justify-center`}>
                  <Icon size={10} className="text-white" />
                </div>
              ) : (
                <span className={`w-4 h-4 rounded-full ${color}`} />
              )}
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedDate && (
        <DayModal
          date={selectedDate}
          data={dayData}
          loading={loadingDay}
          onClose={() => { setSelectedDate(null); setDayData(null); }}
        />
      )}
    </div>
  );
}
