import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Publication } from '../types';
import { Search, Newspaper, Calendar, Eye } from 'lucide-react';

const CATEGORIES = ['Всички', 'календар', 'традиции', 'история', 'религия', 'именни дни', 'general'];

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Всички');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('publications')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      setPublications(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = publications.filter(p => {
    const matchesSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'Всички' || p.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="bg-hero py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest mb-3">
            <Newspaper size={12} /> Публикации
          </div>
          <h1 className="font-serif font-bold text-4xl text-white mb-4">Новини & Статии</h1>
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Търси статии..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/40"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${
                category === c
                  ? 'bg-[#c0392b] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#c0392b]'
              }`}
            >
              {c === 'general' ? 'Общо' : c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-72" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Няма намерени публикации</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {filtered[0] && (
              <Link to={`/news/${filtered[0].slug}`} className="group block mb-8 rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 card-hover">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {filtered[0].cover_image && (
                    <div className="h-56 md:h-auto overflow-hidden">
                      <img src={filtered[0].cover_image} alt={filtered[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-8 flex flex-col justify-center">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#c0392b] mb-3 capitalize">
                      {filtered[0].category}
                    </span>
                    <h2 className="font-serif font-bold text-2xl text-gray-900 mb-3 group-hover:text-[#c0392b] transition-colors">
                      {filtered[0].title}
                    </h2>
                    {filtered[0].excerpt && (
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">{filtered[0].excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {filtered[0].published_at ? new Date(filtered[0].published_at).toLocaleDateString('bg-BG') : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={11} /> {filtered[0].view_count} прегледа
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.slice(1).map(pub => (
                <Link key={pub.id} to={`/news/${pub.slug}`}
                  className="group block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden card-hover hover:shadow-md transition-all duration-300">
                  {pub.cover_image && (
                    <div className="h-44 overflow-hidden">
                      <img src={pub.cover_image} alt={pub.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#c0392b] capitalize block mb-1">
                      {pub.category}
                    </span>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#c0392b] transition-colors">
                      {pub.title}
                    </h3>
                    {pub.excerpt && (
                      <p className="text-gray-500 text-xs line-clamp-2 mb-3">{pub.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {pub.published_at ? new Date(pub.published_at).toLocaleDateString('bg-BG') : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={10} /> {pub.view_count}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
