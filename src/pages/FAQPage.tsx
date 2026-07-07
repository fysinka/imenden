import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ = [
  {
    q: 'Как разбирам кой има имен ден днес?',
    a: 'На страницата "Днес" автоматично виждате именния ден за текущата дата. Можете също да проверявате в календара за всяка друга дата.',
  },
  {
    q: 'Откъде идват данните за именните дни?',
    a: 'Данните са базирани на православния календар и народните традиции в България. Консултирали сме се с историци и богослови за максимална точност.',
  },
  {
    q: 'Мога ли да поръчам тениска без регистрация?',
    a: 'Да! Можете да поръчате всеки продукт без да се регистрирате. Просто добавете продуктите в количката, попълнете данните си и поръчайте.',
  },
  {
    q: 'Как работи персонализацията на тениски?',
    a: 'При тениските с персонализация ще намерите инструмент, с който можете да изберете цвят, размер, позиция на щампата, да качите изображение или да добавите текст. Преглеждате визуален preview в реално време.',
  },
  {
    q: 'Колко струва доставката?',
    a: 'Доставката е 5.99 лв. При поръчки над 80 лв. доставката е БЕЗПЛАТНА. Доставяме в рамките на 1-3 работни дни.',
  },
  {
    q: 'Как плащам при доставката?',
    a: 'Приемаме плащане в брой при доставка (наложен платеж). Не е необходима банкова карта.',
  },
  {
    q: 'Мога ли да върна или заменя продукт?',
    a: 'Да, имате право да върнете или замените стандартен продукт в рамките на 14 дни. Персонализираните продукти не подлежат на връщане, освен при производствен дефект.',
  },
  {
    q: 'Как се свързвам с вас при проблем с поръчката?',
    a: 'Можете да се свържете с нас чрез страницата "Обратна връзка", по телефон +359 888 123 456 или по имейл info@imenden.org.',
  },
  {
    q: 'Работи ли сайтът на мобилни устройства?',
    a: 'Да! Сайтът е напълно оптимизиран за мобилни устройства, таблети и компютри.',
  },
  {
    q: 'Как да добавя коментар или грешка в календара?',
    a: 'Ако забележите грешка или искате да добавите информация, пишете ни чрез формата за обратна връзка. Ще прегледаме вашето предложение и ще го добавим при верификация.',
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="bg-hero py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest mb-3">
            <HelpCircle size={12} /> Помощ
          </div>
          <h1 className="font-serif font-bold text-4xl text-white mb-2">Въпроси & Отговори</h1>
          <p className="text-white/60">Намерете отговори на най-често задаваните въпроси.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-3">
        {FAQ.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-4 text-left"
            >
              <span className="font-medium text-gray-900 pr-4">{item.q}</span>
              <ChevronDown
                size={18}
                className={`text-gray-400 shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                open === i ? 'max-h-48' : 'max-h-0'
              }`}
            >
              <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-3">
                {item.a}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
