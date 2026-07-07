import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, Church, Globe, BookOpen, User2, Feather, Flame, Sparkles, ArrowRight } from 'lucide-react';
import { DayData } from '../types';


interface Props {
  date: Date;
  data: DayData | null;
  loading: boolean;
  onClose: () => void;
}

const BG_MONTHS = ['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември'];
const BG_DAYS = ['Неделя','Понеделник','Вторник','Сряда','Четвъртък','Петък','Събота'];

export default function DayModal({ date, data, loading, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 modal-backdrop" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a1a2e] to-[#0f3460] px-6 py-5 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">
                {BG_DAYS[date.getDay()]}
              </p>
              <h2 className="text-white font-bold text-2xl font-serif">
                {date.getDate()} {BG_MONTHS[date.getMonth()]} {date.getFullYear()}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl skeleton" />
              ))}
            </div>
          ) : (
            <>
              {/* Name days */}
              {data?.nameDay && (
                <Section icon={<Star size={16} className="text-[#d4a017]" />} title="Именни дни" color="amber">
                  <div className="flex flex-wrap gap-2">
                    {data.nameDay.names.map((n) => (
                      <span key={n} className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-sm font-medium">
                        {n}
                      </span>
                    ))}
                  </div>
                  {data.nameDay.description && (
                    <p className="mt-2 text-gray-600 text-sm">{data.nameDay.description}</p>
                  )}
                </Section>
              )}

              {/* Official holidays */}
              {data?.holidays && data.holidays.length > 0 && (
                <Section icon={<Globe size={16} className="text-[#c0392b]" />} title="Официални празници" color="red">
                  <div className="space-y-2">
                    {data.holidays.map((h) => (
                      <div key={h.id}>
                        <p className="font-medium text-gray-900 text-sm">{h.name}</p>
                        {h.description && <p className="text-gray-500 text-xs">{h.description}</p>}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Church holidays */}
              {data?.churchHolidays && data.churchHolidays.length > 0 && (
                <Section icon={<Church size={16} className="text-blue-600" />} title="Църковни празници" color="blue">
                  <div className="space-y-2">
                    {data.churchHolidays.map((h) => (
                      <div key={h.id} className="flex items-start gap-2">
                        {h.is_great_feast && <Flame size={12} className="text-orange-500 mt-0.5 shrink-0" />}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{h.name}</p>
                          {h.description && <p className="text-gray-500 text-xs">{h.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Moveable feasts */}
              {data?.moveableFeasts && data.moveableFeasts.length > 0 && (
                <Section icon={<Sparkles size={16} className="text-green-600" />} title="Подвижни празници" color="green">
                  <div className="space-y-2">
                    {data.moveableFeasts.map((f) => (
                      <div key={f.id} className="flex items-start gap-2">
                        {f.is_great_feast && <Flame size={12} className="text-orange-500 mt-0.5 shrink-0" />}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{f.name}</p>
                          {f.description && <p className="text-gray-500 text-xs">{f.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Historical events */}
              {data?.historicalEvents && data.historicalEvents.length > 0 && (
                <Section icon={<BookOpen size={16} className="text-green-600" />} title="Исторически събития" color="green">
                  <div className="space-y-3">
                    {data.historicalEvents.map((e) => (
                      <div key={e.id}>
                        <p className="font-medium text-gray-900 text-sm">
                          {e.year && <span className="text-green-600 font-bold">{e.year} г. — </span>}
                          {e.title}
                        </p>
                        {e.description && <p className="text-gray-500 text-xs mt-0.5">{e.description}</p>}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Famous people */}
              {data?.famousPeople && data.famousPeople.length > 0 && (
                <Section icon={<User2 size={16} className="text-purple-600" />} title="Известни личности" color="purple">
                  <div className="space-y-3">
                    {data.famousPeople.map((p) => (
                      <div key={p.id} className="flex items-start gap-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          p.event_type === 'born'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {p.event_type === 'born' ? 'Роден/а' : 'Починал/а'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {p.name} {p.year && <span className="text-gray-500 font-normal">({p.year})</span>}
                          </p>
                          {p.profession && <p className="text-gray-500 text-xs">{p.profession}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Folk traditions */}
              {data?.folkTraditions && data.folkTraditions.length > 0 && (
                <Section icon={<Feather size={16} className="text-orange-600" />} title="Народни традиции" color="orange">
                  <div className="space-y-3">
                    {data.folkTraditions.map((t) => (
                      <div key={t.id}>
                        <p className="font-semibold text-gray-900 text-sm mb-1">{t.title}</p>
                        {t.content && <p className="text-gray-600 text-sm">{t.content}</p>}
                        {t.proverb && (
                          <blockquote className="mt-2 pl-3 border-l-2 border-orange-300 text-gray-500 text-xs italic">
                            „{t.proverb}"
                          </blockquote>
                        )}
                        {t.link && (
                          <a
                            href={t.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-colors"
                          >
                            Към статията <ArrowRight size={13} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {!data?.nameDay && !data?.holidays?.length && !data?.churchHolidays?.length && !data?.moveableFeasts?.length && (
                <div className="text-center py-8 text-gray-400">
                  <p>Няма специална информация за тази дата.</p>
                </div>
              )}


            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  color,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    amber: 'bg-amber-50 border-amber-100',
    red: 'bg-red-50 border-red-100',
    blue: 'bg-blue-50 border-blue-100',
    green: 'bg-green-50 border-green-100',
    purple: 'bg-purple-50 border-purple-100',
    orange: 'bg-orange-50 border-orange-100',
  };
  return (
    <div className={`rounded-2xl border p-4 ${colorMap[color] || 'bg-gray-50 border-gray-100'}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}
