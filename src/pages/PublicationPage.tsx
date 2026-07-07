import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Publication } from '../types';
import { ArrowLeft, Calendar, Eye, Tag } from 'lucide-react';

export default function PublicationPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [pub, setPub] = useState<Publication | null>(null);
  const [related, setRelated] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('publications')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (!data) { navigate('/news'); return; }
      setPub(data);
      await supabase.from('publications').update({ view_count: (data.view_count || 0) + 1 }).eq('id', data.id);
      const { data: rel } = await supabase
        .from('publications')
        .select('*')
        .eq('is_published', true)
        .eq('category', data.category)
        .neq('id', data.id)
        .limit(3);
      setRelated(rel || []);
      setLoading(false);
    }
    load();
  }, [slug, navigate]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-20" />)}
    </div>
  );
  if (!pub) return null;

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Cover */}
      {pub.cover_image && (
        <div className="h-72 sm:h-96 overflow-hidden relative">
          <img src={pub.cover_image} alt={pub.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4">
        <div className={`${pub.cover_image ? '-mt-20 relative z-10' : 'pt-8'}`}>
          <div className={`${pub.cover_image ? 'bg-white rounded-t-3xl p-8 pt-10' : ''}`}>
            <Link to="/news" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#c0392b] mb-4 transition-colors">
              <ArrowLeft size={14} /> Всички статии
            </Link>

            <span className="text-[10px] font-bold uppercase tracking-widest text-[#c0392b] block mb-3 capitalize">
              {pub.category}
            </span>

            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-gray-900 mb-4 leading-tight">
              {pub.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-6 pb-6 border-b border-gray-100">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {pub.published_at ? new Date(pub.published_at).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={11} /> {pub.view_count} прегледа
              </span>
              {pub.tags?.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <Tag size={11} />
                  {pub.tags.map(t => (
                    <span key={t} className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 text-[10px]">{t}</span>
                  ))}
                </div>
              )}
            </div>

            {pub.excerpt && (
              <p className="text-gray-600 text-lg leading-relaxed mb-6 font-medium italic">
                {pub.excerpt}
              </p>
            )}
          </div>

          <div className={`${pub.cover_image ? 'bg-white px-8 pb-10' : ''}`}>
            <div
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: pub.content || '' }}
            />
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="py-10">
            <h2 className="font-serif font-bold text-xl text-gray-900 mb-5">Свързани статии</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(r => (
                <Link key={r.id} to={`/news/${r.slug}`}
                  className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 card-hover">
                  {r.cover_image && (
                    <div className="h-32 overflow-hidden">
                      <img src={r.cover_image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-[#c0392b] transition-colors">
                      {r.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
