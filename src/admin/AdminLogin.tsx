import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Sun, Lock, Mail, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/admin/dashboard');
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError('Невалиден имейл или парола.');
      setLoading(false);
      return;
    }
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c0392b] to-[#e74c3c] flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Sun size={24} className="text-white" />
          </div>
          <h1 className="text-white font-bold text-2xl font-serif">Имен ден</h1>
          <p className="text-white/40 text-sm mt-1">Административен панел</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-7">
          <h2 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
            <Lock size={18} className="text-[#c0392b]" /> Вход
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/60 text-xs font-medium block mb-1.5">Имейл</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="admin@imenden.org"
                  className="w-full pl-9 pr-4 py-3 bg-white/8 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#c0392b]"
                />
              </div>
            </div>

            <div>
              <label className="text-white/60 text-xs font-medium block mb-1.5">Парола</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 bg-white/8 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#c0392b]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#c0392b] hover:bg-[#e74c3c] disabled:opacity-60 text-white font-semibold rounded-xl transition-colors mt-2"
            >
              {loading ? 'Влизане...' : 'Вход'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Достъпът е само за администратори.
        </p>
      </div>
    </div>
  );
}
