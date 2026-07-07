import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Zap,
  Search,
  User,
  Calendar,
  Globe,
  TrendingUp,
  Heart,
  Sparkles,
  ChevronRight,
  BookOpen,
  Star,
  Users,
  Award,
} from 'lucide-react';

interface NameAnalysis {
  name: string;
  origin: string;
  meaning: string;
  gender: 'male' | 'female' | 'unisex';
  nameDay?: string;
  nameDayNames?: string[];
  popularity: number;
  famousPeople: string[];
  variants: string[];
  etymology: string;
  folklore: string;
}

// Bulgarian name database with meanings
const BULGARIAN_NAMES: Record<string, NameAnalysis> = {
  'иван': {
    name: 'Иван',
    origin: 'Еврейски',
    meaning: 'Бог е милостив, Божията благодат',
    gender: 'male',
    nameDay: '07.01',
    nameDayNames: ['Иван', 'Иванка', 'Иво', 'Ивайло', 'Ваньо', 'Иво'],
    popularity: 95,
    famousPeople: ['Иван Вазов', 'Иван Денкоглу', 'Иван Асен II'],
    variants: ['Иво', 'Ивайло', 'Ваньо', 'Иванка'],
    etymology: 'От еврейското йоанан - "Бог е милостив". Преминало през гръцкия език като Йоанис и след това в славянския като Иван.',
    folklore: 'Имeто е едно от най-популярните български имена. Хората с това име празнуват на 7 януари - Ивановден.',
  },
  'мария': {
    name: 'Мария',
    origin: 'Еврейски',
    meaning: 'Възлюбена, госпожа, прекрасна',
    gender: 'female',
    nameDay: '15.08',
    nameDayNames: ['Мария', 'Мариана', 'Марияна', 'Мара', 'Маринка', 'Мими'],
    popularity: 98,
    famousPeople: ['Мария Тодорова', 'Мария Гигова'],
    variants: ['Мара', 'Маринка', 'Мими', 'Мариана'],
    etymology: 'От еврейското име Мирям, което означава "възлюбена" или "госпожа".',
    folklore: 'Свято име, носено от Богородица. Жените с това име празнуват на 15 август - Голяма Богородица.',
  },
  'георги': {
    name: 'Георги',
    origin: 'Гръцки',
    meaning: 'Земеделец, обработващ земята',
    gender: 'male',
    nameDay: '06.05',
    nameDayNames: ['Георги', 'Георгина', 'Гинка', 'Геро', 'Георгиana'],
    popularity: 92,
    famousPeople: ['Георги Иванов', 'Георги Бенковски', 'Георги Раковски'],
    variants: ['Гинка', 'Геро', 'Георгина'],
    etymology: 'От гръцкото "георгос" - земеделец, обработващ земята.',
    folklore: 'Гергьовден е един от най-празнуваните именни дни в България. Празнува се на 6 май.',
  },
  'елена': {
    name: 'Елена',
    origin: 'Гръцки',
    meaning: 'Светлина, слънчев лъч, бляскава',
    gender: 'female',
    nameDay: '03.06',
    nameDayNames: ['Елена', 'Елица', 'Лена', 'Ленка', 'Ленче'],
    popularity: 85,
    famousPeople: ['Елена от Троя', 'Елена Рьорих'],
    variants: ['Елица', 'Лена', 'Ленка'],
    etymology: 'От гръцкото "хеление" - светлина, блясък.',
    folklore: 'Името е свързано с легендарната Елена от Троя. В България се празнува на 3 юни - Еленинден.',
  },
  'димитър': {
    name: 'Димитър',
    origin: 'Гръцки',
    meaning: 'Посветен на Деметра, богинята на плодородието',
    gender: 'male',
    nameDay: '26.10',
    nameDayNames: ['Димитър', 'Митке', 'Димитрина', 'Митра', 'Димитър'],
    popularity: 90,
    famousPeople: ['Димитър Талев', 'Димитър Пешев'],
    variants: ['Митко', 'Митке', 'Димитрина'],
    etymology: 'От гръцкото име Деметриос, посветено на богинята Деметра.',
    folklore: 'Димитровден е един от най-важните есенни празници в българския народен календар.',
  },
  'ница': {
    name: 'Никола',
    origin: 'Гръцки',
    meaning: 'Победител на народа',
    gender: 'male',
    nameDay: '06.12',
    nameDayNames: ['Никола', 'Николай', 'Николета', 'Ники', 'Кольо'],
    popularity: 88,
    famousPeople: ['Никола Вапцаров', 'Никола Тесла'],
    variants: ['Николай', 'Кольо', 'Николета', 'Ники'],
    etymology: 'От гръцкото "никао" - побеждавам, и "лаос" - народ.',
    folklore: 'Никулден е зимен празник, посветен на Свети Николай - покровител на моряците и търговците.',
  },
  'стефан': {
    name: 'Стефан',
    origin: 'Гръцки',
    meaning: 'Венец, корона, слава',
    gender: 'male',
    nameDay: '27.12',
    nameDayNames: ['Стефан', 'Стоян', 'Стефка', 'Стамен'],
    popularity: 82,
    famousPeople: ['Стефан Караджа', 'Стефан Стамболов'],
    variants: ['Стоян', 'Стефка', 'Стамен'],
    etymology: 'От гръцкото "стефанос" - венец, корона.',
    folklore: 'Стефановден е последният празник от коледния цикъл.',
  },
  'катерина': {
    name: 'Катерина',
    origin: 'Гръцки',
    meaning: 'Чиста, невинна',
    gender: 'female',
    nameDay: '25.11',
    nameDayNames: ['Катерина', 'Катя', 'Екатерина', 'Кина'],
    popularity: 75,
    famousPeople: ['Екатерина Велика', 'Катерина Нуриева'],
    variants: ['Катя', 'Екатерина', 'Кина'],
    etymology: 'От гръцкото "катарос" - чист, невинен.',
    folklore: 'Катерининден се чества на 25 ноември.',
  },
  'петър': {
    name: 'Петър',
    origin: 'Арамейски/Гръцки',
    meaning: 'Каменен, скала',
    gender: 'male',
    nameDay: '29.06',
    nameDayNames: ['Петър', 'Петрана', 'Петьо', 'Петя', 'Пенко'],
    popularity: 85,
    famousPeople: ['Петър Берон', 'Петър Дънов'],
    variants: ['Петьо', 'Петя', 'Пенко', 'Петрана'],
    etymology: 'От гръцкото "петрос" - камък, скала.',
    folklore: 'Петровден е голям летен празник в българския календар.',
  },
  'анна': {
    name: 'Анна',
    origin: 'Еврейски',
    meaning: 'Благодат, милост',
    gender: 'female',
    nameDay: '09.12',
    nameDayNames: ['Анна', 'Ана', 'Ани', 'Аница', 'Анка'],
    popularity: 80,
    famousPeople: ['Анна Каренина (лит.)', 'Анна Ахматова'],
    variants: ['Ани', 'Аница', 'Анка'],
    etymology: 'От еврейското "ханна" - благодат, милост.',
    folklore: 'Анининден се празнува на 9 декември.',
  },
};

export default function NameAnalysisPage() {
  const [searchName, setSearchName] = useState('');
  const [analysis, setAnalysis] = useState<NameAnalysis | null>(null);
  const [notFoundName, setNotFoundName] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('name_analysis_history');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const analyzeName = async (name: string) => {
    if (!name.trim()) return;

    setLoading(true);
    setNotFoundName(null);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 800));

    const normalizedName = name.toLowerCase().trim();
    const found = BULGARIAN_NAMES[normalizedName];

    if (found) {
      setAnalysis(found);
      setNotFoundName(null);

      // Update recent searches
      const updated = [
        found.name,
        ...recentSearches.filter((n) => n.toLowerCase() !== normalizedName),
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('name_analysis_history', JSON.stringify(updated));
    } else {
      setAnalysis(null);
      setNotFoundName(name);
    }

    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeName(searchName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f8f7f4]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="absolute top-4 right-4 opacity-20">
          <Zap size={120} className="text-white" />
        </div>
        <div className="max-w-3xl mx-auto relative">
          <Link to="/ai-services" className="inline-flex items-center gap-1 text-white/60 text-xs hover:text-white transition-colors mb-4">
            <ChevronRight size={14} className="rotate-180" />
            AI Услуги
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Zap size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white">
                AI Анализ на имена
              </h1>
              <p className="text-white/70 text-sm">Открийте произхода и значението на всяко име</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          {/* Search */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Въведете име за анализ (напр. Иван, Мария, Георги...)"
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!searchName.trim() || loading}
                className={`absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                  searchName.trim() && !loading
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? 'Анализ...' : 'Анализ'}
              </button>
            </div>
          </form>

          {/* Recent searches */}
          {recentSearches.length > 0 && !analysis && (
            <div className="mb-8">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">Последни търсения</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setSearchName(name);
                      analyzeName(name);
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Sparkles size={28} className="text-white" />
              </div>
              <p className="text-gray-600">Анализирам името...</p>
            </div>
          )}

          {/* Not found */}
          {notFoundName && !loading && (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <User size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-700 mb-2">Името "{notFoundName}" не е намерено</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Опитайте с друго българско име. В базата се намират най-популярните български имена.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['Иван', 'Мария', 'Георги', 'Елена'].map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setSearchName(name);
                      analyzeName(name);
                    }}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Analysis result */}
          {analysis && !loading && (
            <div className="space-y-6">
              {/* Name header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-bold text-3xl text-gray-900">{analysis.name}</h2>
                  <p className="text-gray-500 flex items-center gap-2 mt-1">
                    <Globe size={14} />
                    произход: {analysis.origin}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <TrendingUp size={14} />
                    {analysis.popularity}% популярност
                  </div>
                </div>
              </div>

              {/* Meaning */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={18} className="text-blue-600" />
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Значение</span>
                </div>
                <p className="text-xl font-semibold text-gray-800">{analysis.meaning}</p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name Day */}
                {analysis.nameDay && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar size={18} className="text-amber-500" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Имен ден</span>
                    </div>
                    <p className="font-bold text-lg text-gray-900 mb-2">{analysis.nameDay}</p>
                    <p className="text-gray-500 text-sm">{analysis.nameDayNames?.join(', ')}</p>
                  </div>
                )}

                {/* Gender */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <User size={18} className="text-purple-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Пол</span>
                  </div>
                  <p className="font-bold text-lg text-gray-900">
                    {analysis.gender === 'male' ? 'Мъжко име' : analysis.gender === 'female' ? 'Женско име' : 'Двуполово име'}
                  </p>
                </div>

                {/* Variants */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={18} className="text-teal-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Варианти</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.variants.map((v) => (
                      <span
                        key={v}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Famous people */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <Award size={18} className="text-blue-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Известни хора</span>
                  </div>
                  <p className="text-gray-700 text-sm">{analysis.famousPeople.join(', ')}</p>
                </div>
              </div>

              {/* Etymology */}
              <div className="bg-amber-50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={18} className="text-amber-600" />
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Етимология</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{analysis.etymology}</p>
              </div>

              {/* Folklore */}
              <div className="bg-rose-50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Heart size={18} className="text-rose-500" />
                  <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Традиции и фолклор</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{analysis.folklore}</p>
              </div>

              {/* Popularity bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Популярност</span>
                  <span className="font-semibold text-blue-600">{analysis.popularity}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000"
                    style={{ width: `${analysis.popularity}%` }}
                  />
                </div>
              </div>

              {/* Search again */}
              <div className="text-center pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setAnalysis(null);
                    setSearchName('');
                    setNotFoundName(null);
                  }}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Търси друго име
                </button>
              </div>
            </div>
          )}

          {/* Popular names */}
          {!analysis && !notFoundName && !loading && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-center">Популярни български имена</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {['Иван', 'Мария', 'Георги', 'Елена', 'Димитър'].map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setSearchName(name);
                      analyzeName(name);
                    }}
                    className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl text-center transition-all hover:shadow-md"
                  >
                    <span className="font-semibold text-gray-800">{name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
