import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  MessageSquare,
  Send,
  ChevronRight,
  Heart,
  Star,
  Gift,
  Sparkles,
  Copy,
  Check,
  Loader2,
  User,
  Calendar,
  X,
  RefreshCw,
} from 'lucide-react';

const OCCASIONS = [
  { value: 'nameday', label: 'Имен ден', icon: Star, emoji: '⭐' },
  { value: 'birthday', label: 'Рожден ден', icon: Gift, emoji: '🎂' },
  { value: 'anniversary', label: 'Годишнина', icon: Heart, emoji: '💕' },
  { value: 'holiday', label: 'Празник', icon: Calendar, emoji: '🎉' },
];

const TONES = [
  { value: 'warm', label: 'Топл', desc: 'Сърдечен и близък', color: 'rose' },
  { value: 'formal', label: 'Официален', desc: 'Елегантен и уважителен', color: 'blue' },
  { value: 'funny', label: 'Весел', desc: 'Шеговит и забавен', color: 'amber' },
  { value: 'poetic', label: 'Поетичен', desc: 'Красив и вдъхновяващ', color: 'purple' },
  { value: 'religious', label: 'Религиозен', desc: 'С духовен смисъл', color: 'emerald' },
];

const MESSAGE_TEMPLATES: Record<string, Record<string, string[]>> = {
  nameday: {
    warm: [
      'Честит имен ден, {name}! Нека този ден ти донесе много радост, здраве и щастие. Всички, които те обичаме, ти желаем най-доброто!',
      'Светъл имен ден, {name}! Нека светата сила на твоя покровител те пази и води през целия живот!',
      'Именските дни са по-специални за хората с златно сърце. Честит имен ден, {name}! Бъди винаги обичан и ценен!',
    ],
    formal: [
      'Поздравления по повод именния Ви ден! Нека здраве, благополучие и късмет са Ваши верни спътници в живота.',
      'С уважение поздравяваме {name} по случай именния ден! Пожелаваме Ви дълъг живот, изпълнен с хармония и постижения.',
      '{name}, приемете най-сърдечните поздрави за именния ден! Нека този ден Ви донесе радост и удовлетворение.',
    ],
    funny: [
      'Ето че дойде и твоят ден, {name}! Поне веднъж в годината си protagonista - честит имен ден и много подаръци!',
      'Честит имен ден! {name}, днес всички песни са за теб, тортата е за теб, а калориите - не се брои!',
      'За {name} днешният ден е най-важният! И не защото е в IT, а защото е имен ден!',
    ],
    poetic: [
      'Като слънце над Балкана, така грее твоят ден, {name}! Честит имен ден със светлината на България!',
      '{name}, нека в този ден, именният ти път да бъде осеян с рози, а сърцето - с любов!',
      'Сърцето ти е като българска песен, {name}. Нека именият ден бъде акорд на щастие!',
    ],
    religious: [
      'Честит имен ден, {name}! Нека Свети {saint} те пази и води по пътя на правдата. Бог да те благослови!',
      '{name}, в твоя имен ден нека Божието благословение се срее над теб като утринна роса!',
      'Светата традиция обединява семейството и приятелите. Честит имен ден, {name}!',
    ],
  },
  birthday: [
    'Честит рожден ден, {name}! Нека тази нова година ти донесе мечтите, които преследваш, и любовта, която заслужаваш!',
    'Днес е твоият ден, {name}! Роден денът е повод за празник за всички, които те обичат!',
    '{name}, честит рожден ден! Нека всяка следваща година ти носи повече усмивки, по-малко стрес и много приключения!',
  ],
  anniversary: [
    'Годишнината е време за спомени и мечти. {name}, честит празник! Нека любовта ви бъде вечна!',
    'Честита годишнина! {name}, нека всеки ден заедно бъде по-красив от предишния!',
  ],
  holiday: [
    'Весел празник, {name}! Нека радостта, надеждата и любовта озаряват деня ти!',
    'Празниците са за споделяне. {name}, честит празник и много щастие!',
  ],
};

const NAMES_TO_SAINTS: Record<string, string> = {
  'иван': 'Йоан Кръстител',
  'мария': 'Света Богородица',
  'георги': 'Свети Георги',
  'димитър': 'Свети Димитър',
  'никола': 'Свети Николай',
  'елена': 'Света Елена',
  'петър': 'Свети Петър',
  'стефан': 'Свети Стефан',
  'анна': 'Света Анна',
  'катерина': 'Света Екатерина',
};

export default function CongratulationsPage() {
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState('nameday');
  const [tone, setTone] = useState('warm');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameDayDate, setNameDayDate] = useState<string | null>(null);
  const [nameDayNames, setNameDayNames] = useState<string[]>([]);
  const [savedMessages, setSavedMessages] = useState<string[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('saved_congratulations');
    if (saved) {
      setSavedMessages(JSON.parse(saved));
    }
  }, []);

  // Check for name day info
  const checkNameDay = async (searchName: string) => {
    const normalizedName = searchName.toLowerCase().trim();
    const { data } = await supabase
      .from('name_days')
      .select('*')
      .contains('names', [normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1)])
      .maybeSingle();

    if (data) {
      setNameDayDate(data.date_key);
      setNameDayNames(data.names || []);
    } else {
      setNameDayDate(null);
      setNameDayNames([]);
    }
  };

  useEffect(() => {
    if (occasion === 'nameday' && name.trim()) {
      checkNameDay(name);
    }
  }, [name, occasion]);

  const generateMessage = async () => {
    if (!name.trim()) return;

    setLoading(true);

    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 800));

    const templates = MESSAGE_TEMPLATES[occasion] || MESSAGE_TEMPLATES.nameday;
    const toneTemplates = templates[tone] || templates.warm || templates;
    const randomTemplate = toneTemplates[Math.floor(Math.random() * toneTemplates.length)];

    // Replace placeholders
    let message = randomTemplate.replace(/{name}/g, name.trim());

    // Replace saint if religious tone
    if (tone === 'religious') {
      const saint = NAMES_TO_SAINTS[name.toLowerCase()] || 'твоя покровител';
      message = message.replace(/{saint}/g, saint);
    }

    setGeneratedMessage(message);
    setLoading(false);
  };

  const copyToClipboard = async () => {
    if (!generatedMessage) return;
    await navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveMessage = () => {
    if (!generatedMessage) return;
    const updated = [generatedMessage, ...savedMessages].slice(0, 10);
    setSavedMessages(updated);
    localStorage.setItem('saved_congratulations', JSON.stringify(updated));
  };

  const regenerate = () => {
    generateMessage();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf2f8] via-[#fce7f3] to-[#f8f7f4]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#c0392b] to-[#e74c3c] py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="absolute top-4 right-4 opacity-20">
          <Heart size={120} className="text-white" />
        </div>
        <div className="max-w-3xl mx-auto relative">
          <Link to="/ai-services" className="inline-flex items-center gap-1 text-white/60 text-xs hover:text-white transition-colors mb-4">
            <ChevronRight size={14} className="rotate-180" />
            AI Услуги
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <MessageSquare size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white">
                AI Поздравителни съобщения
              </h1>
              <p className="text-white/70 text-sm">Генерирайте уникални поздрави за всеки повод</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          {/* Input form */}
          <div className="space-y-6 mb-8">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <User size={12} />
                Име на именника
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Въведете името..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#c0392b] transition-colors"
              />

              {/* Name day info */}
              {occasion === 'nameday' && nameDayDate && (
                <div className="mt-2 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                  <Calendar size={14} />
                  Имен ден на {nameDayDate.replace('-', ' ')} • {nameDayNames.slice(0, 4).join(', ')}
                </div>
              )}
            </div>

            {/* Occasion */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <Gift size={12} />
                Повод
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {OCCASIONS.map((occ) => {
                  const Icon = occ.icon;
                  const selected = occasion === occ.value;
                  return (
                    <button
                      key={occ.value}
                      onClick={() => setOccasion(occ.value)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        selected
                          ? 'border-[#c0392b] bg-[#c0392b]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl">{occ.emoji}</span>
                      <span className={`font-medium text-sm ${selected ? 'text-[#c0392b]' : 'text-gray-700'}`}>
                        {occ.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <Sparkles size={12} />
                Стил на съобщението
              </label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => {
                  const selected = tone === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${
                        selected
                          ? `border-${t.color}-500 bg-${t.color}-50 text-${t.color}-700`
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                      style={
                        selected
                          ? { borderColor: `var(--${t.color}-500, #f43f5e)`, backgroundColor: `rgb(253 242 248 / 1)` }
                          : {}
                      }
                    >
                      <span className="font-medium text-sm">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={generateMessage}
              disabled={!name.trim() || loading}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
                name.trim() && !loading
                  ? 'bg-gradient-to-r from-[#c0392b] to-[#e74c3c] text-white hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Генериране...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Генерирай поздравление
                </>
              )}
            </button>
          </div>

          {/* Generated message */}
          {generatedMessage && (
            <div className="space-y-4">
              <div className="relative bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
                <button
                  onClick={() => setGeneratedMessage('')}
                  className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </button>

                <p className="text-gray-800 text-lg leading-relaxed pr-8">{generatedMessage}</p>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-rose-100">
                  <button
                    onClick={copyToClipboard}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      copied
                        ? 'bg-green-100 text-green-700'
                        : 'bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Копирано!' : 'Копирай'}
                  </button>

                  <button
                    onClick={regenerate}
                    className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    <RefreshCw size={16} />
                    Ново
                  </button>

                  <button
                    onClick={saveMessage}
                    className="flex items-center gap-2 px-4 py-2 bg-[#c0392b] hover:bg-[#e74c3c] text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Heart size={16} />
                    Запази
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Saved messages */}
          {savedMessages.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setShowSaved(!showSaved)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-4"
              >
                <Heart size={14} className="text-rose-500" />
                Запазени поздравления ({savedMessages.length})
                <ChevronRight
                  size={14}
                  className={`transition-transform ${showSaved ? 'rotate-90' : ''}`}
                />
              </button>

              {showSaved && (
                <div className="space-y-2">
                  {savedMessages.map((msg, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 flex items-start justify-between gap-4"
                    >
                      <p className="flex-1 line-clamp-2">{msg}</p>
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(msg);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors shrink-0"
                      >
                        <Copy size={14} className="text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            Съвети за поздравления
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Изберете топъл тон за близки хора и официален за колеги</li>
            <li>• Добавете лично пожелание след генерирания текст</li>
            <li>• За религиозен тон, името ще бъде свързано със светеца покровител</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
