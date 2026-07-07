import { Sun, Heart, Globe, Star, Users, Award, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const TEAM = [
  { name: 'Мария Иванова', role: 'Основател & Главен редактор', img: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { name: 'Георги Петров', role: 'Технически директор', img: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { name: 'Десислава Тодорова', role: 'Историк & Съдържателен редактор', img: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200' },
];

const STATS = [
  { value: '366', label: 'Дни в календара' },
  { value: '2000+', label: 'Имена в базата' },
  { value: '50+', label: 'Исторически факта' },
  { value: '100+', label: 'Уникални продукта' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Hero */}
      <div className="bg-hero py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,white,transparent)]" />
        </div>
        <div className="max-w-4xl mx-auto relative">
          <h1 className="font-serif font-bold text-4xl sm:text-5xl text-white mb-4">За нас</h1>
          <p className="text-white/70 text-lg max-w-2xl">
            Imenden.org е България's любим онлайн именник и народен календар.
            Нашата мисия е да пазим и популяризираме богатите традиции и история на народния ни календар.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14 space-y-16">
        {/* Mission */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-2 text-[#c0392b] text-xs font-semibold uppercase tracking-wider mb-3">
              <Target size={14} /> Нашата мисия
            </div>
            <h2 className="font-serif font-bold text-3xl text-gray-900 mb-4">
              Пазим народната памет жива
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Imenden.org е създаден с любов към България и нейните традиции.
              Вярваме, че именните дни, народните празници и историческите факти са
              безценно наследство, което трябва да се пази и предава.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Нашата платформа обединява съвременните технологии с вековните традиции,
              предоставяйки на всеки достъп до богата информация за именните дни,
              православния календар и националните ни празници.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
                <p className="font-serif font-bold text-3xl text-[#c0392b] mb-1">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section>
          <h2 className="font-serif font-bold text-2xl text-gray-900 mb-8 text-center">Нашите ценности</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: Heart, color: 'text-red-500 bg-red-50', title: 'Обич към България', desc: 'Всичко, което правим, е вдъхновено от любовта ни към Родината и нейните традиции.' },
              { icon: Star, color: 'text-amber-500 bg-amber-50', title: 'Точност и качество', desc: 'Информацията ни е внимателно проверена от историци и православни богослови.' },
              { icon: Globe, color: 'text-blue-500 bg-blue-50', title: 'Достъпност', desc: 'Стремим се информацията да бъде достъпна за всички — безплатно, по всяко време.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section>
          <div className="flex items-center gap-2 text-[#c0392b] text-xs font-semibold uppercase tracking-wider mb-3 justify-center">
            <Users size={14} /> Нашият екип
          </div>
          <h2 className="font-serif font-bold text-2xl text-gray-900 mb-8 text-center">Хората зад проекта</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TEAM.map(({ name, role, img }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm group hover:shadow-md transition-shadow">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-gray-100 group-hover:border-[#c0392b] transition-colors">
                  <img src={img} alt={name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold text-gray-900">{name}</h3>
                <p className="text-[#c0392b] text-xs mt-1">{role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Awards */}
        <section className="bg-[#1a1a2e] rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-[#c0392b]/20 flex items-center justify-center shrink-0">
            <Award size={28} className="text-[#c0392b]" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-white font-bold text-lg mb-1">Признание</h3>
            <p className="text-white/60 text-sm">
              Imenden.org е отличен като един от най-пълните и достоверни онлайн ресурси за
              именни дни и народни традиции в България.
            </p>
          </div>
          <Link to="/feedback" className="shrink-0 px-5 py-3 bg-[#c0392b] hover:bg-[#e74c3c] text-white text-sm font-semibold rounded-2xl transition-colors whitespace-nowrap">
            Свържете се
          </Link>
        </section>

        {/* Logo section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c0392b] to-[#e74c3c] flex items-center justify-center">
              <Sun size={24} className="text-white" />
            </div>
            <span className="font-serif font-bold text-2xl text-gray-900">Имен ден .org</span>
          </div>
          <p className="text-gray-500 text-sm">Вашият ежедневен народен календар</p>
        </div>
      </div>
    </div>
  );
}
