import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, Check, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function FeedbackPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) { setError('Моля попълнете задължителните полета.'); return; }
    setSubmitting(true);
    setError('');
    const { error: err } = await supabase.from('contact_messages').insert({
      name, email: email || null, phone: phone || null, subject: subject || null, message,
    });
    if (err) { setError('Грешка при изпращане. Опитайте отново.'); setSubmitting(false); return; }
    setSuccess(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="bg-hero py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest mb-3">
            <MessageSquare size={12} /> Контакт
          </div>
          <h1 className="font-serif font-bold text-4xl text-white mb-2">Обратна връзка</h1>
          <p className="text-white/60">Свържете се с нас — ще отговорим до 24 часа.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {success ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check size={28} className="text-green-600" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2 font-serif">Съобщението е изпратено!</h3>
                <p className="text-gray-500 text-sm">Ще отговорим до 24 часа. Благодарим за обратната връзка!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
                <h2 className="font-bold text-xl text-gray-900 font-serif mb-2">Изпратете съобщение</h2>

                {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Три имена *</label>
                    <input value={name} onChange={e => setName(e.target.value)} required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Имейл</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Телефон</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Тема</label>
                    <select value={subject} onChange={e => setSubject(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b] bg-white">
                      <option value="">Изберете тема</option>
                      <option value="order">Поръчка</option>
                      <option value="product">Продукт</option>
                      <option value="calendar">Календар / именни дни</option>
                      <option value="other">Друго</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Съобщение *</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={5}
                    placeholder="Напишете вашето съобщение тук..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b] resize-none" />
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#c0392b] hover:bg-[#e74c3c] disabled:opacity-60 text-white font-semibold rounded-2xl transition-colors">
                  <Send size={18} /> {submitting ? 'Изпращане...' : 'Изпрати съобщение'}
                </button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 p-5 space-y-4">
              <h3 className="font-bold text-gray-900 font-serif">Контактна информация</h3>
              {[
                { icon: Phone, label: 'Телефон', value: '+359 888 123 456', href: 'tel:+359888123456' },
                { icon: Mail, label: 'Имейл', value: 'info@imenden.org', href: 'mailto:info@imenden.org' },
                { icon: MapPin, label: 'Адрес', value: 'гр. София, България', href: null },
                { icon: Clock, label: 'Работно време', value: 'Пн–Пт: 9:00–18:00', href: null },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#c0392b]/10 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-[#c0392b]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm font-medium text-gray-900 hover:text-[#c0392b] transition-colors">{value}</a>
                    ) : (
                      <p className="text-sm font-medium text-gray-900">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d46785.54088781427!2d23.27873!3d42.6977082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40aa8682cb317bf5%3A0x400a01269bf5e60!2sSofia%2C%20Bulgaria!5e0!3m2!1sen!2s!4v1700000000000"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Карта"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
