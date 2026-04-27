export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Trophy, Instagram, ExternalLink, BookOpen } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'
import BlogFeed from './BlogFeed'

export default async function ComunidadPage() {
  const supabase = await createClient()

  const [{ count: players }, { count: tournaments }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('visible_in_directory', true),
    supabase.from('tournaments').select('*', { count: 'exact', head: true }).eq('status', 'finished'),
  ])

  return (
    <div className="flex flex-col min-h-screen animate-in">
      <Topbar title="Comunidad" />
      <main className="flex-1 pb-24 bg-slate-50">

        {/* Estadísticas */}
        <section className="px-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-5 text-center">
              <p className="text-3xl font-black text-blue-600 mb-1">{players ?? 0}</p>
              <p className="text-xs font-medium text-slate-500">Jugadores</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-3xl font-black text-blue-600 mb-1">{tournaments ?? 0}</p>
              <p className="text-xs font-medium text-slate-500">Torneos realizados</p>
            </div>
          </div>
        </section>

        {/* ¿Qué es Roundnet? */}
        <section className="px-4 mt-4">
          <div className="card p-5">
            <h2 className="font-display font-black text-base text-slate-800 mb-3">¿Qué es Roundnet?</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              El roundnet es un deporte 2 vs 2 que se juega en 360°, sin límites de cancha y en cualquier
              superficie —pasto, arena o cemento—, lo que lo convierte en un juego dinámico, explosivo y
              lleno de acción en cada punto.
            </p>
            <p className="text-sm leading-relaxed text-slate-600 mt-3">
              Se aprende rápido, se disfruta desde la primera ronda y engancha de inmediato. Si buscas algo
              diferente con una comunidad apasionada que crece cada día, este es tu momento: ¡lánzate a
              probarlo y sé parte de la familia roundnet!
            </p>
          </div>
        </section>

        {/* Recursos y redes */}
        <section className="px-4 mt-4">
          <h2 className="section-title mb-2.5">Recursos y redes</h2>
          <div className="flex flex-col gap-2">
            <a
              href="https://www.instagram.com/roundnet.chile"
              target="_blank"
              rel="noopener noreferrer"
              className="card flex items-center gap-4 px-4 py-4"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-pink-50">
                <Instagram size={20} className="text-pink-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Instagram</p>
                <p className="text-xs text-slate-400">@roundnet.chile</p>
              </div>
              <ExternalLink size={14} className="text-slate-300" />
            </a>

            <a
              href="https://static1.squarespace.com/static/5f4677d15add242b3dd3415e/t/6944a77d4353cb04a495437e/1766107005771/IRF+Rules+RRR+Updates+%2810.17.25%29+%281%29.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="card flex items-center gap-4 px-4 py-4"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50">
                <BookOpen size={20} className="text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Reglas oficiales IRF</p>
                <p className="text-xs text-slate-400">Reglamento internacional actualizado</p>
              </div>
              <ExternalLink size={14} className="text-slate-300" />
            </a>

            <Link
              href="/torneos"
              className="card flex items-center gap-4 px-4 py-4"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50">
                <Trophy size={20} className="text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Torneos</p>
                <p className="text-xs text-slate-400">Ver calendario de torneos</p>
              </div>
              <ExternalLink size={14} className="text-slate-300" />
            </Link>
          </div>
        </section>

        {/* Foro / Blog de comunidad */}
        <BlogFeed />

      </main>
      <BottomNav />
    </div>
  )
}
