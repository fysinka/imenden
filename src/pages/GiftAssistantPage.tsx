import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product, ProductColor } from '../types';
import { useCart } from '../store/cartStore';
import {
  Sparkles,
  Gift,
  Heart,
  User,
  Cake,
  Users,
  Briefcase,
  Palette,
  Music,
  BookOpen,
  Dumbbell,
  Plane,
  Gamepad2,
  Camera,
  Coffee,
  Leaf,
  Star,
  Check,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  X,
  TrendingUp,
  Zap,
  Moon,
  Sun,
  Compass,
} from 'lucide-react';

// Session ID generator
const getSessionId = () => {
  let sessionId = localStorage.getItem('gift_assistant_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('gift_assistant_session', sessionId);
  }
  return sessionId;
};

const OCCASIONS = [
  { value: 'nameday', label: 'Имен ден', icon: Star, color: 'bg-amber-500' },
  { value: 'birthday', label: 'Рожден ден', icon: Cake, color: 'bg-pink-500' },
  { value: 'anniversary', label: 'Годишнина', icon: Heart, color: 'bg-red-500' },
  { value: 'holiday', label: 'Празник', icon: Gift, color: 'bg-green-500' },
  { value: 'other', label: 'Друго', icon: Sparkles, color: 'bg-purple-500' },
];

const AGE_RANGES = [
  { value: 'child', label: 'Дете (0-12)', icon: '👶' },
  { value: 'teen', label: 'Тийнейджър (13-17)', icon: '🧑' },
  { value: 'young_adult', label: 'Млад възрастен (18-30)', icon: '👤' },
  { value: 'adult', label: 'Възрастен (31-55)', icon: '🧔' },
  { value: 'senior', label: 'Възрастен (55+)', icon: '👴' },
];

const RELATIONSHIPS = [
  { value: 'family', label: 'Семейство', icon: Users },
  { value: 'friend', label: 'Приятел', icon: Heart },
  { value: 'partner', label: 'Партньор', icon: Heart },
  { value: 'colleague', label: 'Колега', icon: Briefcase },
  { value: 'other', label: 'Друго', icon: User },
];

const INTERESTS = [
  { value: 'art', label: 'Изкуство', icon: Palette },
  { value: 'music', label: 'Музика', icon: Music },
  { value: 'reading', label: 'Четене', icon: BookOpen },
  { value: 'sports', label: 'Спорт', icon: Dumbbell },
  { value: 'travel', label: 'Пътувания', icon: Plane },
  { value: 'gaming', label: 'Игри', icon: Gamepad2 },
  { value: 'photography', label: 'Фотография', icon: Camera },
  { value: 'cooking', label: 'Готвене', icon: Coffee },
  { value: 'nature', label: 'Природа', icon: Leaf },
  { value: 'fashion', label: 'Мода', icon: Star },
];

const PERSONALITY_TRAITS = [
  { value: 'creative', label: 'Креативен', icon: Palette },
  { value: 'practical', label: 'Практичен', icon: Briefcase },
  { value: 'adventurous', label: 'Приключенски', icon: Compass },
  { value: 'calm', label: 'Спокоен', icon: Moon },
  { value: 'energetic', label: 'Енергичен', icon: Zap },
  { value: 'sentimental', label: 'Сентиментален', icon: Heart },
  { value: 'intellectual', label: 'Интелектуален', icon: BookOpen },
  { value: 'social', label: 'Социален', icon: Sun },
];

const BUDGET_OPTIONS = [
  { min: 0, max: 30, label: 'До 30 лв.' },
  { min: 30, max: 50, label: '30-50 лв.' },
  { min: 50, max: 80, label: '50-80 лв.' },
  { min: 80, max: 120, label: '80-120 лв.' },
  { min: 120, max: 200, label: '120-200 лв.' },
  { min: 200, max: 1000, label: 'Над 200 лв.' },
];

interface SessionData {
  occasion?: string;
  recipient_name?: string;
  recipient_gender?: string;
  recipient_age_range?: string;
  relationship?: string;
  interests: string[];
  budget_min: number;
  budget_max: number;
  personality_traits: string[];
  additional_notes?: string;
  recommended_products?: { product_id: string; score: number; reason: string }[];
}

interface ScoredProduct extends Product {
  score: number;
  reason: string;
  primaryImage?: string;
}

export default function GiftAssistantPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<ScoredProduct[]>([]);
  const [sessionData, setSessionData] = useState<SessionData>({
    interests: [],
    budget_min: 0,
    budget_max: 100,
    personality_traits: [],
  });

  const { addItem } = useCart();

  // Reset state for new session
  const resetSession = () => {
    const newSessionId = crypto.randomUUID();
    localStorage.setItem('gift_assistant_session', newSessionId);
    setStep(1);
    setSessionData({
      interests: [],
      budget_min: 0,
      budget_max: 100,
      personality_traits: [],
    });
    setRecommendedProducts([]);
  };

  // Load products on mount
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('is_active', true)
        .gt('stock_quantity', 0);
      setProducts((data as Product[]) || []);
      setLoading(false);
    }
    loadProducts();
  }, []);

  // AI-like recommendation algorithm
  const analyzeAndRecommend = useCallback(async (data: SessionData) => {
    setAnalyzing(true);

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const sessionId = getSessionId();

    // Score products based on selected criteria
    const scored: ScoredProduct[] = products
      .map((product) => {
        let score = 0;
        const reasons: string[] = [];

        // Budget match (most important)
        const inBudget = product.price >= data.budget_min && product.price <= data.budget_max;
        if (inBudget) {
          score += 40;
          reasons.push('В рамките на бюджета');
        } else if (product.price <= data.budget_max * 1.2) {
          score += 20;
          reasons.push('Близо до бюджета');
        }

        // Occasion matching via tags
        const productTags = product.tags || [];
        if (data.occasion && productTags.includes(data.occasion)) {
          score += 25;
          reasons.push('Перфектен за повода');
        }

        // Interest matching via tags and category
        const matchingInterests = data.interests.filter(
          (i) => productTags.includes(i) || product.name.toLowerCase().includes(i)
        );
        if (matchingInterests.length > 0) {
          score += 15 * matchingInterests.length;
          reasons.push('Съвпада с интересите');
        }

        // Age appropriateness
        if (data.recipient_age_range) {
          if (
            (data.recipient_age_range === 'child' || data.recipient_age_range === 'teen') &&
            productTags.includes('youth')
          ) {
            score += 15;
          }
          if (
            (data.recipient_age_range === 'adult' || data.recipient_age_range === 'senior') &&
            productTags.includes('classic')
          ) {
            score += 15;
          }
        }

        // Gender consideration
        if (data.recipient_gender && productTags.includes(data.recipient_gender)) {
          score += 10;
        }

        // Relationship consideration
        if (data.relationship === 'partner' && productTags.includes('romantic')) {
          score += 20;
          reasons.push('Романтичен избор');
        }

        // Personality traits
        if (data.personality_traits.includes('creative') && product.is_customizable) {
          score += 20;
          reasons.push('Персонализируем');
        }

        // Featured products get slight boost
        if (product.is_featured) {
          score += 5;
        }

        // Rating boost
        score += Math.min(product.rating * 5, 25);

        // Get primary image
        const images = (product as unknown as { product_images?: typeof product.images }).product_images || product.images || [];
        const primaryImage = images.find((i) => i.is_primary)?.url || images[0]?.url;

        return {
          ...product,
          score: Math.max(score, 5),
          reason: reasons.length > 0 ? reasons[0] : 'Препоръчан подарък',
          primaryImage,
        };
      })
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    setRecommendedProducts(scored);

    // Save session to database
    await supabase.from('gift_assistant_sessions').upsert({
      session_id: sessionId,
      ...data,
      recommended_products: scored.map((p) => ({
        product_id: p.id,
        score: p.score,
        reason: p.reason,
      })),
      status: 'completed',
      updated_at: new Date().toISOString(),
    });

    setAnalyzing(false);
    setStep(7);
  }, [products]);

  const handleContinue = () => {
    if (step < 6) {
      setStep(step + 1);
    } else if (step === 6) {
      analyzeAndRecommend(sessionData);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleArrayValue = (field: 'interests' | 'personality_traits', value: string) => {
    setSessionData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const canContinue = () => {
    switch (step) {
      case 1:
        return !!sessionData.occasion;
      case 2:
        return !!sessionData.recipient_name?.trim();
      case 3:
        return !!sessionData.recipient_gender && !!sessionData.recipient_age_range;
      case 4:
        return !!sessionData.relationship;
      case 5:
        return sessionData.interests.length > 0;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const totalSteps = 7;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f4] via-[#fef3e2] to-[#f8f7f4]">
      {/* Header */}
      <div className="bg-hero py-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#c0392b]/30 to-transparent" />
        <div className="absolute top-4 right-4 opacity-20">
          <Gift size={120} className="text-white" />
        </div>
        <div className="max-w-3xl mx-auto relative">
          <Link to="/ai-services" className="inline-flex items-center gap-1 text-white/60 text-xs hover:text-white transition-colors mb-4">
            <ChevronLeft size={14} />
            AI Услуги
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white">
                AI Подарък Асистент
              </h1>
              <p className="text-white/70 text-sm">Персонализирани препоръки за всеки повод</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                  step > i + 1
                    ? 'bg-[#c0392b] text-white'
                    : step === i + 1
                    ? 'bg-[#c0392b] text-white ring-4 ring-[#c0392b]/20'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step > i + 1 ? <Check size={14} /> : i + 1}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#c0392b] to-[#e74c3c] transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-6">
          {/* Step 1: Occasion */}
          {step === 1 && (
            <StepContainer title="За какъв повод е подаръкът?" subtitle="Изберете поводът, за който търсите подарък">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {OCCASIONS.map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    onClick={() => setSessionData((p) => ({ ...p, occasion: value }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      sessionData.occasion === value
                        ? 'border-[#c0392b] bg-[#c0392b]/5 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <span className="font-medium text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </StepContainer>
          )}

          {/* Step 2: Recipient Name */}
          {step === 2 && (
            <StepContainer title="Кой е именникът?" subtitle="Въведете името на човека, който ще получи подаръка">
              <div className="max-w-md mx-auto">
                <input
                  type="text"
                  value={sessionData.recipient_name || ''}
                  onChange={(e) =>
                    setSessionData((p) => ({ ...p, recipient_name: e.target.value }))
                  }
                  placeholder="Име на именника..."
                  className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#c0392b] transition-colors"
                  autoFocus
                />
                <p className="text-center text-gray-400 text-sm mt-3">
                  Това ще ни помогне да персонализираме препоръките
                </p>
              </div>
            </StepContainer>
          )}

          {/* Step 3: Gender & Age */}
          {step === 3 && (
            <StepContainer title="Разкажете за именника" subtitle="Възраст и пол на човека">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
                    Пол
                  </label>
                  <div className="flex gap-3 justify-center">
                    {['male', 'female', 'other'].map((gender) => (
                      <button
                        key={gender}
                        onClick={() => setSessionData((p) => ({ ...p, recipient_gender: gender }))}
                        className={`px-6 py-3 rounded-xl border-2 font-medium transition-all ${
                          sessionData.recipient_gender === gender
                            ? 'border-[#c0392b] bg-[#c0392b] text-white'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {gender === 'male' ? 'Мъж' : gender === 'female' ? 'Жена' : 'Друго'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
                    Възраст
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {AGE_RANGES.map(({ value, label, icon }) => (
                      <button
                        key={value}
                        onClick={() => setSessionData((p) => ({ ...p, recipient_age_range: value }))}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                          sessionData.recipient_age_range === value
                            ? 'border-[#c0392b] bg-[#c0392b]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl">{icon}</span>
                        <span className="text-xs font-medium">{label.split(' (')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </StepContainer>
          )}

          {/* Step 4: Relationship */}
          {step === 4 && (
            <StepContainer title="Каква е връзката ви?" subtitle="Изберете вашето отношение с именника">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {RELATIONSHIPS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setSessionData((p) => ({ ...p, relationship: value }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      sessionData.relationship === value
                        ? 'border-[#c0392b] bg-[#c0392b]/5 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon
                      size={28}
                      className={sessionData.relationship === value ? 'text-[#c0392b]' : 'text-gray-400'}
                    />
                    <span className="font-medium text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </StepContainer>
          )}

          {/* Step 5: Interests */}
          {step === 5 && (
            <StepContainer
              title="Какви са интересите на именника?"
              subtitle="Изберете едно или повече (поне едно)"
            >
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {INTERESTS.map(({ value, label, icon: Icon }) => {
                  const selected = sessionData.interests.includes(value);
                  return (
                    <button
                      key={value}
                      onClick={() => toggleArrayValue('interests', value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        selected
                          ? 'border-[#c0392b] bg-[#c0392b] text-white shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon size={24} className={selected ? 'text-white' : 'text-gray-500'} />
                      <span className="font-medium text-sm">{label}</span>
                    </button>
                  );
                })}
              </div>
            </StepContainer>
          )}

          {/* Step 6: Budget & Extras */}
          {step === 6 && (
            <StepContainer title="Какъв е вашият бюджет?" subtitle="Изберете диапазон и добавете допълнителна информация">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
                    Бюджет за подаръка
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {BUDGET_OPTIONS.map(({ min, max, label }) => {
                      const selected =
                        sessionData.budget_min === min && sessionData.budget_max === max;
                      return (
                        <button
                          key={label}
                          onClick={() =>
                            setSessionData((p) => ({ ...p, budget_min: min, budget_max: max }))
                          }
                          className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                            selected
                              ? 'border-[#c0392b] bg-[#c0392b] text-white'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
                    Черти на личността (по избор)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PERSONALITY_TRAITS.map(({ value, label, icon: Icon }) => {
                      const selected = sessionData.personality_traits.includes(value);
                      return (
                        <button
                          key={value}
                          onClick={() => toggleArrayValue('personality_traits', value)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full border-2 text-sm transition-all ${
                            selected
                              ? 'border-[#c0392b] bg-[#c0392b]/10 text-[#c0392b]'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon size={14} />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
                    Допълнителни бележки (по избор)
                  </label>
                  <textarea
                    value={sessionData.additional_notes || ''}
                    onChange={(e) =>
                      setSessionData((p) => ({ ...p, additional_notes: e.target.value }))
                    }
                    placeholder="Например: обича традиционни подаръци, има алергия към определени материали..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#c0392b] transition-colors text-sm"
                  />
                </div>
              </div>
            </StepContainer>
          )}

          {/* Step 7: Results */}
          {step === 7 && !analyzing && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-xl text-gray-900">
                    Персонализирани препоръки
                  </h2>
                  <p className="text-gray-500 text-sm">
                    За {sessionData.recipient_name} • {OCCASIONS.find((o) => o.value === sessionData.occasion)?.label}
                  </p>
                </div>
                <button
                  onClick={resetSession}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium transition-colors"
                >
                  <RefreshCw size={14} />
                  Започнете наново
                </button>
              </div>

              {recommendedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Gift size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Няма намерени препоръки в този бюджет.</p>
                  <p className="text-gray-400 text-sm mt-1">Опитайте да промените бюджета.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedProducts.map((product, idx) => (
                    <RecommendedProductCard
                      key={product.id}
                      product={product}
                      rank={idx + 1}
                      onAddToCart={() => addItem(product)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analyzing state */}
          {analyzing && (
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#c0392b] to-[#e74c3c] flex items-center justify-center animate-pulse">
                  <Sparkles size={36} className="text-white" />
                </div>
                <div className="absolute -inset-2 rounded-full border-4 border-[#c0392b]/20 animate-ping" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Анализирам предпочитанията...</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Изчислявам най-добрите подаръци за {sessionData.recipient_name}
              </p>
            </div>
          )}

          {/* Navigation */}
          {step < 7 && !analyzing && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  step === 1
                    ? 'opacity-0 pointer-events-none'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ChevronLeft size={16} />
                Назад
              </button>

              <button
                onClick={handleContinue}
                disabled={!canContinue()}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  canContinue()
                    ? 'bg-[#c0392b] hover:bg-[#e74c3c] text-white shadow-lg shadow-[#c0392b]/20'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {step === 6 ? 'Намиране на подаръци' : 'Напред'}
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepContainer({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="font-bold text-xl text-gray-900 mb-1">{title}</h2>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function RecommendedProductCard({
  product,
  rank,
  onAddToCart,
}: {
  product: ScoredProduct;
  rank: number;
  onAddToCart: () => void;
}) {
  const imageUrl =
    product.primaryImage ||
    'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=600';

  return (
    <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
      {/* Rank badge */}
      {rank <= 3 && (
        <div
          className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md ${
            rank === 1
              ? 'bg-gradient-to-br from-amber-400 to-amber-600'
              : rank === 2
              ? 'bg-gradient-to-br from-slate-300 to-slate-500'
              : 'bg-gradient-to-br from-amber-600 to-amber-800'
          }`}
        >
          {rank}
        </div>
      )}

      <Link to={`/shop/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>

      <div className="p-4">
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#c0392b]/10 text-[#c0392b] text-xs font-medium rounded-full mb-2">
          <Sparkles size={10} />
          {product.reason}
        </div>

        <Link to={`/shop/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 hover:text-[#c0392b] transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-lg text-[#c0392b]">{product.price.toFixed(2)} лв.</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#c0392b] hover:bg-[#e74c3c] text-white text-sm font-medium rounded-xl transition-colors"
          >
            <ShoppingCart size={14} />
            Добави
          </button>
        </div>
      </div>
    </div>
  );
}
