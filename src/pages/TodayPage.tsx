import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { NameDay, Holiday, ChurchHoliday, HistoricalEvent, FamousPerson, FolkTradition, Publication } from '../types';
import { Star, Gift, Calendar, Sparkles, BookOpen, Flower2, MessageSquareQuote, ArrowRight, Users, Sparkles as SparklesIcon, Heart } from 'lucide-react';

const BG_MONTHS = ['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември'];
const BG_DAYS = ['Неделя','Понеделник','Вторник','Сряда','Четвъртък','Петък','Събота'];

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function TodayPage() {
  const today = new Date();
  const dateKey = `${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const monthNum = today.getMonth() + 1;

  const [nameDay, setNameDay] = useState<NameDay | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [churchHolidays, setChurchHolidays] = useState<ChurchHoliday[]>([]);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [famous, setFamous] = useState<FamousPerson[]>([]);
  const [traditions, setTraditions] = useState<FolkTradition[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [nd, hol, ch, ev, fam, trad, pub] = await Promise.all([
        supabase.from('name_days').select('*').eq('date_key', dateKey).maybeSingle(),
        supabase.from('holidays').select('*').eq('date_key', dateKey),
        supabase.from('church_holidays').select('*').eq('date_key', dateKey),
        supabase.from('historical_events').select('*').eq('date_key', dateKey).limit(3),
        supabase.from('famous_people').select('*').eq('date_key', dateKey).limit(4),
        supabase.from('folk_traditions').select('*').or(`date_key.eq.${dateKey},month.eq.${monthNum}`).limit(2),
        supabase.from('publications').select('*').eq('is_published', true).order('published_at', { ascending: false }).limit(3),
      ]);
      setNameDay(nd.data);
      setHolidays(hol.data || []);
      setChurchHolidays(ch.data || []);
      setEvents(ev.data || []);
      setFamous(fam.data || []);
      setTraditions(trad.data || []);
      setPublications(pub.data || []);
      setLoading(false);
    }
    load();
  }, [dateKey, monthNum]);

  const wishes = [
    'Пожелай на именника здраве, щастие и много радостни мигове!',
    'Нека този ден донесе само усмивки и хубави изненади!',
    'Късмет и успех във всичко, което предприема!',
  ];
  const wish = wishes[(today.getDate() + today.getMonth()) % wishes.length];

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {/* Hero with gradient */}
      <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-embroidery opacity-30" />
        <div className="max-w-5xl mx-auto relative">
          <div className="flex items-center gap-2 text-white/80 text-xs uppercase tracking-widest mb-2">
            <Calendar size={12} />
            <span>Днешна дата</span>
          </div>
          <h1 className="font-serif font-bold text-4xl sm:text-5xl text-white mb-1">
            {BG_DAYS[today.getDay()]}
          </h1>
          <p className="text-white/90 text-xl">
            {today.getDate()} {BG_MONTHS[today.getMonth()]} {today.getFullYear()}
          </p>
        </div>
      </section>

      {/* Main content with side embroidery */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex gap-0 lg:gap-4">
          {/* Left embroidery - hidden on mobile */}
          <div className="hidden lg:block w-12 shrink-0 bg-embroidery-side bg-repeat rounded-l-2xl" style={{ backgroundSize: '30px 80px' }} />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-6">
                {[...Array(4)].map((_, i) => <div key={i} className="skeleton rounded-3xl h-48" />)}
              </div>
            ) : (
              <div className="space-y-6">
                {/* HIGHLIGHT CARD - Main name day */}
                {nameDay && (
                  <div className="highlight-card animate-fadeIn">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                        <Star size={20} className="text-white fill-white" />
                      </div>
                      <div>
                        <h2 className="font-serif font-bold text-2xl text-amber-900">Именни дни</h2>
                        <p className="text-amber-700 text-sm">Днес празнуват</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {nameDay.names.map((n) => (
                        <span
                          key={n}
                          className="px-4 py-2 bg-white rounded-xl text-amber-900 font-semibold text-sm border-2 border-amber-300 shadow-sm hover:bg-amber-50 transition-colors cursor-default"
                        >
                          {n}
                        </span>
                      ))}
                    </div>

                    {nameDay.description && (
                      <div className="bg-white/60 rounded-xl p-4 border border-amber-200">
                        <p className="text-amber-800 text-sm leading-relaxed">
                          <strong>Произход:</strong> {nameDay.description}
                        </p>
                      </div>
                    )}

                    {/* Quick wishes */}
                    <div className="mt-4 flex items-center gap-2">
                      <MessageSquareQuote size={16} className="text-amber-600" />
                      <p className="text-amber-700 text-sm italic">{wish}</p>
                    </div>
                  </div>
                )}

                {/* Holidays Row */}
                {(holidays.length > 0 || churchHolidays.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {holidays.length > 0 && (
                      <div className="section-card animate-fadeIn">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                            <Star size={16} className="text-red-500 fill-red-500" />
                          </div>
                          <h3 className="font-semibold text-gray-900">Официални празници</h3>
                        </div>
                        <div className="space-y-2">
                          {holidays.map(h => (
                            <div key={h.id}>
                              <p className="font-bold text-gray-900">{h.name}</p>
                              {h.description && <p className="text-sm text-gray-500">{h.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {churchHolidays.length > 0 && (
                      <div className="section-card animate-fadeIn">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Sparkles size={16} className="text-purple-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900">Църковни празници</h3>
                        </div>
                        <div className="space-y-2">
                          {churchHolidays.map(h => (
                            <div key={h.id}>
                              <p className="font-bold text-gray-900">{h.name}</p>
                              {h.description && <p className="text-sm text-gray-500 line-clamp-2">{h.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Historical events */}
                {events.length > 0 && (
                  <div className="section-card animate-fadeIn">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <BookOpen size={16} className="text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg">Исторически събития</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {events.map(e => (
                        <div key={e.id} className="bg-green-50 rounded-xl p-4 border border-green-100">
                          {e.year && <p className="text-green-600 font-bold text-sm mb-1">{e.year} г.</p>}
                          <p className="font-semibold text-gray-900 text-sm">{e.title}</p>
                          {e.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{e.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Famous people */}
                {famous.length > 0 && (
                  <div className="section-card animate-fadeIn">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Users size={16} className="text-indigo-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg">Известни личности</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {famous.map(p => (
                        <div key={p.id} className="bg-white border-2 border-gray-200 rounded-xl p-3 flex items-center gap-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            p.event_type === 'born' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {p.event_type === 'born' ? 'Роден/а' : 'Починал/а'}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                            {p.year && <p className="text-gray-400 text-xs">{p.year}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Folk traditions */}
                {traditions.length > 0 && (
                  <div className="section-card animate-fadeIn">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Flower2 size={16} className="text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg">Народни традиции</h3>
                    </div>
                    <div className="space-y-3">
                      {traditions.map(t => (
                        <div key={t.id} className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-amber-200">
                          <p className="font-semibold text-gray-900 mb-1">{t.title}</p>
                          {t.content && <p className="text-gray-600 text-sm leading-relaxed">{t.content}</p>}
                          {t.proverb && (
                            <blockquote className="mt-2 pl-3 border-l-2 border-amber-400 text-amber-800 text-sm italic">
                              „{t.proverb}"
                            </blockquote>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Calendar CTA */}
                <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                    <Calendar size={24} className="text-white" />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">Разгледай календара</h3>
                    <p className="text-white/60 text-sm">Открий именни дни, празници и исторически факти за всяка дата.</p>
                  </div>
                  <Link
                    to="/calendar"
                    className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all hover:gap-3"
                  >
                    Към календара <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right embroidery - hidden on mobile */}
          <div className="hidden lg:block w-12 shrink-0 bg-embroidery-side bg-repeat rounded-r-2xl transform rotate-180" style={{ backgroundSize: '30px 80px' }} />
        </div>

        {/* Recommendations / Quick Links */}
        <div className="mt-10">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-3xl p-6">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Heart size={18} className="fill-white" />
              Препоръчани
            </h3>
            <div className="scroll-container">
              {[
                { to: '/calendar', label: 'Предстоящи именни дни', icon: Calendar },
                { to: '/shop', label: 'Подаръци', icon: Gift },
                { to: '/shop?cat=tenishki', label: 'Персонализирани тениски', icon: SparklesIcon },
                { to: '/ai-services', label: 'AI Пожелание', icon: Sparkles },
                { to: '/calendar?search=Иван', label: 'Търсене на име', icon: Star },
              ].map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} className="rec-card shrink-0 min-w-[180px]">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-white" />
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Publications */}
        {publications.length > 0 && (
          <div className="mt-10">
            <h2 className="font-serif font-bold text-2xl text-gray-900 mb-5 flex items-center gap-2">
              <BookOpen size={22} className="text-amber-600" />
              Последни публикации
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {publications.map(pub => (
                <Link
                  key={pub.id}
                  to={`/news/${pub.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-amber-400 transition-all card-hover"
                >
                  {pub.cover_image && (
                    <div className="h-40 overflow-hidden">
                      <img src={pub.cover_image} alt={pub.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
                      {pub.category || 'Статия'}
                    </span>
                    <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                      {pub.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
