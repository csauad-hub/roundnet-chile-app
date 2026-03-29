import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Calendar, Newspaper } from 'lucide-react'

type News = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  link: string | null
  published_at: string | null
  created_at: string
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function NoticiasPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase
    .from('news')
    .select('id,title,description,image_url,link,published_at,created_at')
    .order('created_at', { ascending: false })

  const news: News[] = data ?? []
  const featured = news[0] ?? null
  const rest = news.slice(1)

  return (
    <div className="min-h-screen" style={{ background: '#0d0d1a' }}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Noticias</h1>
          <p className="text-gray-400 mt-1">Lo último del roundnet en Chile</p>
        </div>

        {news.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>No hay noticias publicadas todavía.</p>
          </div>
        ) : (
          <>
            {featured && (
              <Link href={`/noticias/${featured.id}`} className="block group mb-8">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:border-[#00E5FF]/30 transition-colors">
                  {featured.image_url ? (
                    <div className="relative h-64 md:h-80">
                      <img
                        src={featured.image_url}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/20 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.12) 0%, rgba(123,47,255,0.12) 100%)' }}>
                      <Newspaper size={40} className="text-white/20" />
                    </div>
                  )}
                  <div className="p-6">
                    <span className="text-xs font-semibold text-[#00E5FF] uppercase tracking-wider">Destacado</span>
                    <h2 className="text-xl md:text-2xl font-bold text-white mt-2 group-hover:text-[#00E5FF] transition-colors">
                      {featured.title}
                    </h2>
                    {featured.description && (
                      <p className="text-gray-400 mt-2 line-clamp-2">{featured.description}</p>
                    )}
                    {featured.published_at && (
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-3">
                        <Calendar size={12} />
                        {formatDate(featured.published_at)}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {rest.map(n => (
                  <Link key={n.id} href={`/noticias/${n.id}`} className="group">
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:border-[#00E5FF]/30 transition-colors h-full flex flex-col">
                      {n.image_url ? (
                        <div className="h-40 overflow-hidden">
                          <img
                            src={n.image_url}
                            alt={n.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="h-32 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.08) 0%, rgba(123,47,255,0.08) 100%)' }}>
                          <Newspaper size={28} className="text-white/15" />
                        </div>
                      )}
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-white font-semibold text-sm group-hover:text-[#00E5FF] transition-colors line-clamp-2">
                          {n.title}
                        </h3>
                        {n.description && (
                          <p className="text-gray-400 text-xs mt-1.5 line-clamp-2 flex-1">{n.description}</p>
                        )}
                        {n.published_at && (
                          <div className="flex items-center gap-1 text-gray-500 text-xs mt-3">
                            <Calendar size={11} />
                            {formatDate(n.published_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
