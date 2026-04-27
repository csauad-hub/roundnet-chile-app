export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, Newspaper } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'

const CATEGORY_COLORS: Record<string, string> = {
  Resultados: 'bg-green-100 text-green-700',
  Torneos:    'bg-blue-100 text-blue-700',
  Comunidad:  'bg-purple-100 text-purple-700',
  Reglamento: 'bg-amber-100 text-amber-700',
  General:    'bg-slate-100 text-slate-600',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default async function NoticiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: noticia } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single()

  if (!noticia) notFound()

  const categoryColor = noticia.category ? (CATEGORY_COLORS[noticia.category] ?? 'bg-slate-100 text-slate-600') : null

  return (
    <div className="flex flex-col min-h-screen animate-in">
      <Topbar title="Noticias" />
      <main className="flex-1 pb-24 bg-slate-50">

        {/* Back */}
        <div className="px-4 pt-4 pb-2">
          <Link href="/noticias" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft size={16} />
            Volver a noticias
          </Link>
        </div>

        {/* Imagen destacada */}
        {noticia.image_url ? (
          <div className="mx-4 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
            <img src={noticia.image_url} alt={noticia.title} className="w-full h-52 object-cover" />
          </div>
        ) : (
          <div className="mx-4 rounded-2xl overflow-hidden h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-slate-100">
            <Newspaper size={36} className="text-blue-200" />
          </div>
        )}

        {/* Contenido */}
        <div className="px-4 pt-4 pb-6">
          <div className="card p-5">
            {/* Categoría */}
            {noticia.category && categoryColor && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${categoryColor}`}>
                {noticia.category}
              </span>
            )}

            {/* Título */}
            <h1 className="font-display font-black text-slate-800 text-xl leading-snug mt-3">
              {noticia.title}
            </h1>

            {/* Fecha */}
            {(noticia.published_at || noticia.created_at) && (
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-2">
                <Calendar size={12} />
                {formatDate(noticia.published_at ?? noticia.created_at)}
              </div>
            )}

            {/* Descripción — respeta saltos de línea */}
            {noticia.description && (
              <div className="mt-4 space-y-3">
                {noticia.description.split('\n').filter((p: string) => p.trim()).map((paragraph: string, i: number) => (
                  <p key={i} className="text-sm text-slate-600 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {/* Link externo */}
            {noticia.link && (
              <a
                href={noticia.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold text-sm py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <ExternalLink size={15} />
                Ver nota completa
              </a>
            )}
          </div>

          {/* Más noticias */}
          <div className="mt-4">
            <Link href="/noticias"
              className="card flex items-center justify-center gap-2 py-3 text-sm font-semibold text-blue-600">
              Ver todas las noticias
            </Link>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
