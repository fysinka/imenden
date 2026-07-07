import { Link } from 'react-router-dom';
import { Sparkles, MessageSquare, FileText, Zap, ArrowRight, Star } from 'lucide-react';

const SERVICES = [
  {
    icon: MessageSquare,
    title: 'AI Поздравително съобщение',
    description: 'Генерирайте уникални именни поздравления с изкуствен интелект за вашите близки.',
    badge: 'Активно',
    badgeColor: 'bg-green-500 text-white',
    color: 'from-[#c0392b] to-[#e74c3c]',
    link: '/ai-services/congratulations',
  },
  {
    icon: FileText,
    title: 'AI Исторически разказвач',
    description: 'Задайте въпроси за история, традиции или именни дни и получете изчерпателни отговори.',
    badge: 'Активно',
    badgeColor: 'bg-green-500 text-white',
    color: 'from-amber-500 to-orange-600',
    link: '/ai-services/historian',
  },
  {
    icon: Zap,
    title: 'AI Анализ на имена',
    description: 'Откриете произхода, значението и популярността на вашето или на чуждо име.',
    badge: 'Активно',
    badgeColor: 'bg-green-500 text-white',
    color: 'from-blue-500 to-cyan-600',
    link: '/ai-services/name-analysis',
  },
  {
    icon: Star,
    title: 'AI Подарък Асистент',
    description: 'Получете персонализирани препоръки за подаръци базирани на личността на именника.',
    badge: 'Активно',
    badgeColor: 'bg-green-500 text-white',
    color: 'from-rose-500 to-pink-600',
    link: '/ai-services/gift-assistant',
  },
];

export default function AIServicesPage() {
  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Hero */}
      <div className="bg-hero py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#c0392b]/20 to-transparent" />
        <div className="max-w-4xl mx-auto relative">
          <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest mb-4">
            <Sparkles size={12} />
            <span>Изкуствен Интелект</span>
          </div>
          <h1 className="font-serif font-bold text-4xl sm:text-5xl text-white mb-4">
            AI Услуги
          </h1>
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
            Открийте следващото поколение персонализирани услуги, задвижвани от изкуствен интелект.
            Нашите AI инструменти са специално разработени за именни дни, традиции и българска култура.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#1a1a2e] to-[#0f3460] rounded-3xl p-8 mb-12 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#c0392b]/20 flex items-center justify-center shrink-0">
            <Sparkles size={28} className="text-[#c0392b]" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-xl mb-1">Очаквайте нашите AI функции!</h2>
            <p className="text-white/60 text-sm">
              Работим усилено върху интегрирането на най-новите AI технологии.
              Оставете ни имейл и ще Ви уведомим при стартирането.
            </p>
          </div>
          <button className="shrink-0 flex items-center gap-2 px-5 py-3 bg-[#c0392b] hover:bg-[#e74c3c] text-white text-sm font-semibold rounded-2xl transition-colors whitespace-nowrap">
            Уведоми ме <ArrowRight size={16} />
          </button>
        </div>

        {/* Services grid - all now active */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {SERVICES.map(({ icon: Icon, title, description, badge, badgeColor, color, link }) => (
            <Link
              key={title}
              to={link}
              className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                <Icon size={22} className="text-white" />
              </div>

              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor || 'bg-gray-100 text-gray-500'}`}>
                  {badge}
                </span>
              </div>

              <p className="text-gray-500 text-sm leading-relaxed">{description}</p>

              <div className="mt-4 flex items-center gap-1 text-[#c0392b] text-sm font-medium">
                Започнете тук <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Tech stack */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm mb-6">Нашите AI услуги са задвижвани от</p>
          <div className="flex justify-center flex-wrap gap-4">
            {['OpenAI GPT-4', 'Claude AI', 'Stable Diffusion', 'Google AI'].map(tech => (
              <div key={tech} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 shadow-sm">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
