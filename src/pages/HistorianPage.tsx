import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  FileText,
  Send,
  ChevronRight,
  History,
  Calendar,
  User,
  MapPin,
  BookOpen,
  Scroll,
  Castle,
  Crown,
  Swords,
  Sparkles,
  Loader2,
  MessageSquare,
} from 'lucide-react';

interface HistoricalTopic {
  id: string;
  title: string;
  category: string;
  icon: typeof History;
}

interface DayData {
  nameDay?: { names: string[]; description?: string };
  holidays: { name: string; description?: string; type: string }[];
  churchHolidays: { name: string; description?: string; type: string }[];
  historicalEvents: { year?: number; title: string; description?: string; category: string }[];
  famousPeople: { name: string; year?: number; event_type: string; profession?: string; description?: string }[];
}

const TOPICS: HistoricalTopic[] = [
  { id: 'founders', title: 'Какво знаете за основателите на България?', category: 'history', icon: Crown },
  { id: 'holidays', title: 'Историята на българските празници', category: 'traditions', icon: Calendar },
  { id: 'names', title: 'Откъде идват българските имена?', category: 'culture', icon: User },
  { id: 'battles', title: 'Великите български битки', category: 'history', icon: Swords },
  { id: 'monasteries', title: 'Български манастири', category: 'religion', icon: Castle },
  { id: 'folklore', title: 'Народни традиции и обичаи', category: 'traditions', icon: Scroll },
];

// Historical knowledge base
const KNOWLEDGE: Record<string, { title: string; content: string }> = {
  'основател': {
    title: 'Основателите на България',
    content: `**Великите българи, които създадоха държавата ни:**

**Хан Аспарух (641-701)**
Основателят на Първата българска държава (681 г.). След поражението от хазарите, Аспарух повежда прабългарите на запад и пресича река Дунав. Обединява прабългарите, славяните и местното население в мощна държава. Загива в битка с хазарите.

**Хан Крум (755-814)**
Един от най-великите български владетели. Разширява границите на България от Балкана до Карпатите. Победител над византийския император Никифор I, чийто череп направил чаша за вино. Издал първия писан български закон.

**Цар Борис I († 907)**
Покръстителят на България. Приема християнството през 864 г., което обединява народа. Създава Преславската и Охридската книжовни школы.

**Цар Симеон I (864-927)**
Златният век на българската култура. България достига най-голямото си териториално разширение и културен разцвет. Наричан "полуимператор".

**Асен и Петър**
Основателите на Втората българска държава (1185 г.) след почти 200 години византийско владичество.`,
  },
  'празник': {
    title: 'История на българските празници',
    content: `**Българските празници - мост между минало и настояще:**

**Йордановден (6 януари)**
Празник на Светото Кръщение на Исус Христос. Традицията изисква водосвет и хвърляне на кръста в ледена вода. Жените раждат лесно през годината, а водата носи здраве.

**Гергьовден (6 май)**
Един от най-важните пролетни празници. На този ден се отбелязва денят на Свети Георги Победоносец. Традиция изисква да се коли агне и да се извършват обреди за здраве и плодородие.

**Димитровден (26 октомври)**
Есенен празник, посветен на Свети Димитър Солунски. Счита се за граница между лятото и зимата.

**Никулден (6 декември)**
Зимен празник в чест на Свети Николай Чудотворец, покровител на моряците и търговците. Според традицията на този ден трябва да се яде риба.

**Кукери традиции**
Древни ритуали за прогонване на злите духове. Кукерите обличат страшни маски и звънтила, танцуват из селата за здраве и берекет.`,
  },
  'имена': {
    title: 'Произход на българските имена',
    content: `**Славянски български имена:**
Повечето български имена имат славянски корени, въпреки че имат различен произход.

**Етимологични групи:**

1. **Еврейски произход** - Имена от Библията:
   - Иван (от Йоан - "Бог е милостив")
   - Мария ("възлюбена")
   - Петър ("камък, скала")
   - Анна ("благодат")

2. **Гръцки произход** - Разпространени чрез християнството:
   - Георги ("земеделец")
   - Димитър (от Деметра - богинята на плодородието)
   - Катерина ("чиста")
   - Елена ("светлина")

3. **Славянски автохтонни имена:**
   - Явор, Дъбравка (от дървета)
   - Владимир ("владеещ света")
   - Мирослав ("славен мир")
   - Радослав ("радостна слава")

4. **Прабългарски следи:**
   - Аспарух, Крум, Тервел (от ханските имена)

Името носи сила и идентичност. В българската традиция името се избира старателно за детето.`,
  },
  'битк': {
    title: 'Великите български битки',
    content: `**България векове на битки и победи:**

**Битка при Онгъла (680 г.)**
Аспарух побеждава византийците и създава Първата българска държава.

**Битка при Върбишкия проход (811 г.)**
Хан Крум унищожава византийската армия. Император Никифор I загива, а черепът му става чаша.

**Битка при Ахелой (917 г.)**
Цар Симеон I разбива византийците - едно от най-големите поражения на Византия.

**Битка при Лёвен (1394 г.)**
Българите под ръководството на Иван Шишман се борят срещу османците.

**Обсадата на Варна (1444 г.)**
Кръждашката битка срещу османците, въпреки поражението бележи героична страница.

**Априлско въстание (1876 г.)**
Битка за свобода - Васил Левски, Христо Ботев, четите на Бенковски и Каблешков.

**Сръбско-българска война (1885 г.)**
Съединението на България печели битката при Сливница.`,
  },
  'манастир': {
    title: 'Български манастири',
    content: `**Светините на България - манастирите:**

**Рилски манастир "Св. Иван Рилски"**
Най-големият и най-почитаният български манастир. Основан от Иван Рилски през X век в Рила планина. Вписан в Списъка на световното наследство на ЮНЕСКО.

**Бачковски манастир "Успение Богородично"**
Вторият по големина манастир, разположен в Родопите. Основан през 1083 г. Известен с чудотворната икона на Богородица.

**Троянски манастир "Успение Богородично"**
Третият по големина манастир в България. Разположен в Стара планина, основан през XVI век.

**Преображенски манастир**
Средновековен манастир край Велико Търново. Известен с възрожденската си архитектура и стенописи.

**Зографски манастир "Св. Георги"**
Български манастир в Света гора (Атон), Гърция. Запазва българската православна традиция през вековете.

Манастирите са били центрове на културата, просветата и книжовността през османското иго.`,
  },
  'традици': {
    title: 'Народни традиции и обичаи',
    content: `**Българските традиции - живо наследство:**

**Бабуване и Марта**
На 1 март е Баба Марта - хората си подаряват мартеници за здраве. Червено за кръвта, бяло за жената и млякото. Носим докато видим лястовица или разцъфнато дърво.

**Кукеруване**
Мъже обличат страшни костюми с маски и звънтила. Танцуват из селата за да прогонят злите духове и да донесат здраве, плодородие и добив.

**Лазаруване**
На Лазаровден млади моми обикалят домовете, пеят лазарски песни и благославят за здраве и женитба. Традиция от езически времена.

**Коледуване**
Коледарите пеят песни за Христос и благославят домовете. Традиция, която съчетава християнски и езически елементи.

**Сватбени обичаи**
Българската сватба е цял ритуал - правене на хляб, бръснене на зета, сваляне на венца, влачване.

**Слави**
Празнуване на именен ден - маса за всички гости, песни и българско гостоприемство.`,
  },
  '681': {
    title: 'Годината 681 - Създаване на България',
    content: `**681 година - началото на българската държавност:**

Тази година бележи официалното признаване на Първата българска държава от Византия. Хан Аспарух, след като е победен от хазарите в родните му степи, повежда прабългарите на запад.

**Какво се случва:**
- Аспарух пресича река Дунав и се установява в Добруджа
- Сключва съюз със славянските племена
- Побеждава византийската армия
- Византия плаща данък и признава България

**Многонационална държава:**
Първата българска държава обединява:
- Прабългари (войнишко съсловие)
- Славяни (земеделци)
- Местно тракийско население

Така се поставя началото на над 1300 години българска държавност.`,
  },
};

const CATEGORIES: Record<string, string> = {
  history: 'История',
  traditions: 'Традиции',
  culture: 'Култура',
  religion: 'Религия',
};

export default function HistorianPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<{ title: string; content: string } | null>(null);
  const [nameDayInfo, setNameDayInfo] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(false);
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    // Get today's info
    const now = new Date();
    const dateKey = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setTodayDate(dateKey);

    async function loadTodayInfo() {
      const { data } = await supabase
        .from('name_days')
        .select('*')
        .eq('date_key', dateKey)
        .maybeSingle();

      if (data) {
        setNameDayInfo({
          nameDay: { names: data.names || [], description: data.description },
          holidays: [],
          churchHolidays: [],
          historicalEvents: [],
          famousPeople: [],
        });
      }
    }
    loadTodayInfo();
  }, []);

  const findAnswer = (query: string) => {
    const q = query.toLowerCase();

    // Check keywords
    if (q.includes('основател') || q.includes('аспарух') || q.includes('крум') || q.includes('борис') || q.includes('симеон')) {
      return KNOWLEDGE['основател'];
    }
    if (q.includes('празник') || q.includes('гергьовден') || q.includes('йордан') || q.includes('никулден') || q.includes('димитровден')) {
      return KNOWLEDGE['празник'];
    }
    if (q.includes('име') || q.includes('произход') || q.includes('значение')) {
      return KNOWLEDGE['имена'];
    }
    if (q.includes('битк') || q.includes('война') || q.includes('побед') || q.includes('армия')) {
      return KNOWLEDGE['битк'];
    }
    if (q.includes('манастир') || q.includes('монастыр') || q.includes('рил') || q.includes('бачков')) {
      return KNOWLEDGE['манастир'];
    }
    if (q.includes('традици') || q.includes('обичай') || q.includes('кукери') || q.includes('мартен') || q.includes('колед')) {
      return KNOWLEDGE['традици'];
    }
    if (q.includes('681') || q.includes('основав') || q.includes('първата държав')) {
      return KNOWLEDGE['681'];
    }

    return null;
  };

  const handleAsk = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);

    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const result = findAnswer(query);
    if (result) {
      setAnswer(result);
    } else {
      setAnswer({
        title: 'Не намерих информация',
        content: `Не можах да намеря конкретна информация за "${query}".

**Можете да попитате за:**
- Основателите на България (Аспарух, Крум, Борис, Симеон)
- Българските празници (Гергьовден, Йордановден, Никулден)
- Произхода на българските имена
- Великите български битки
- Български манастири
- Народни традиции и обичаи

Задайте въпрос отново с една от тези теми!`,
      });
    }

    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(question);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff7ed] via-[#fef3e2] to-[#f8f7f4]">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="absolute top-4 right-4 opacity-20">
          <Scroll size={120} className="text-white" />
        </div>
        <div className="max-w-3xl mx-auto relative">
          <Link to="/ai-services" className="inline-flex items-center gap-1 text-white/60 text-xs hover:text-white transition-colors mb-4">
            <ChevronRight size={14} className="rotate-180" />
            AI Услуги
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white">
                AI Исторически разказвач
              </h1>
              <p className="text-white/70 text-sm">Задайте въпрос за българска история и традиции</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          {/* Today's name day */}
          {nameDayInfo?.nameDay && (
            <div className="bg-amber-50 rounded-2xl p-4 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Днес имен ден празнуват</p>
                <p className="font-semibold text-gray-900">{nameDayInfo.nameDay.names.join(', ')}</p>
              </div>
            </div>
          )}

          {/* Question input */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="relative">
              <MessageSquare size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Задайте въпрос за българска история, традиции или именни дни..."
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!question.trim() || loading}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all ${
                  question.trim() && !loading
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </form>

          {/* Quick topics */}
          {!answer && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">Изберете тема или задайте въпрос</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleAsk(topic.title)}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-amber-50 hover:from-amber-50 hover:to-orange-50 rounded-xl border border-gray-100 hover:border-amber-200 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                      <topic.icon size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-amber-700 transition-colors">{topic.title}</p>
                      <p className="text-xs text-gray-500">{CATEGORIES[topic.category]}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 ml-auto group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Sparkles size={28} className="text-white" />
              </div>
              <p className="text-gray-600">Търся информация...</p>
            </div>
          )}

          {/* Answer */}
          {answer && !loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-bold text-2xl text-gray-900">{answer.title}</h2>
                <button
                  onClick={() => {
                    setAnswer(null);
                    setQuestion('');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Нов въпрос
                </button>
              </div>

              <div className="prose prose-sm max-w-none bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {answer.content.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <h3 key={i} className="font-bold text-lg text-gray-900 mt-4 mb-2">
                          {line.replace(/\*\*/g, '')}
                        </h3>
                      );
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <p key={i} className="ml-4 text-gray-700">
                          • {line.slice(2)}
                        </p>
                      );
                    }
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              </div>

              {/* Topic suggestions */}
              <div className="flex flex-wrap gap-2 pt-4">
                {['Основатели на България', 'Български битки', 'Манастири', 'Традиции'].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleAsk(topic)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-700 rounded-full text-sm transition-colors"
                  >
                    {topic}
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
