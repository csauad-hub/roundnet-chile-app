import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'
import { MOCK_TOURNAMENTS, MOCK_PLAYERS, MOCK_NEWS, STATS } from '@/lib/mock-data'
import { formatDate, formatCLP, STATUS_LABELS, STATUS_STYLES, cn, timeAgo, CATEGORY_STYLES, CATEGORY_LABELS, LEVEL_LABELS, avatarColor, getInitials } from '@/lib/utils'
export default function HomePage() {
  const next = MOCK_TOURNAMENTS.find(t => t.status==='open') ?? MOCK_TOURNAMENTS[0]
  return (<div className="flex flex-col min-h-screen animate-in"><Topbar /><main className="flex-1 pb-24">
    <div className="mx-4 mt-4 bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl p-6 relative overflow-hidden shadow-lg">
      <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/5" />
      <div className="absolute bottom-0 left-0 right-0 h-1 opacity-40" style={{background:'linear-gradient(90deg,#C8102E 50%,white 50%)'}} />
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase bg-white/15 text-white/90 px-3 py-1.5 rounded-full mb-3">🏆 Próximo Torneo</span>
      <h1 className="font-display font-black text-3xl text-white leading-tight">{next.name}</h1>
      <p className="text-sm text-white/70 mt-2">{next.location} · {next.city}</p>
      <Link href="/torneos" className="inline-block mt-4 bg-white text-blue-700 font-display font-bold text-xs px-5 py-2.5 rounded-full shadow-md">Ver detalles →</Link>
    </div>
    <div className="flex gap-2.5 px-4 mt-4 overflow-x-auto pb-1">
      {[{num:STATS.players,label:'Jugadores'},{num:STATS.tournaments_2024,label:'Torneos 2024'},{num:STATS.regions,label:'Regiones'},{num:STATS.active_tournaments,label:'Activos'}].map(s => (
        <div key={s.label} className="card flex-shrink-0 px-5 py-4 text-center min-w-[88px]"><p className="font-display font-black text-2xl text-blue-600 leading-none">{s.num}</p><p className="text-[11px] text-slate-500 mt-1 font-medium">{s.label}</p></div>
      ))}
    </div>
    <div className="mt-5">
      <div className="flex items-center justify-between px-4 mb-2.5"><h2 className="section-title">Últimas noticias</h2><Link href="/comunidad" className="text-xs font-semibold text-blue-600 flex items-center gap-0.5">Ver todo <ChevronRight size={14} /></Link></div>
      <div className="px-4 flex flex-col gap-2.5">
        {MOCK_NEWS.slice(0,3).map(n => (<div key={n.id} className="card flex gap-3 px-4 py-3.5"><div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl bg-blue-50">{n.category==='Selección Chile'?'🌍':n.category==='Resultados'?'🏆':n.category==='Reglamento'?'📋':'📸'}</div><div className="flex-1 min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{n.category}</p><p className="text-sm font-semibold text-slate-800 leading-snug mt-0.5">{n.title}</p><p className="text-[11px] text-slate-400 mt-1">{formatDate(n.published_at)}</p></div></div>))}
      </div>
    </div>
    <div className="mt-5">
      <div className="flex items-center justify-between px-4 mb-2.5"><h2 className="section-title">Top Ranking</h2><Link href="/torneos" className="text-xs font-semibold text-blue-600 flex items-center gap-0.5">Ver completo <ChevronRight size={14} /></Link></div>
      <div className="px-4 flex flex-col gap-2">
        {MOCK_PLAYERS.slice(0,3).map((p,i) => (<div key={p.id} className={cn('card flex items-center gap-3 px-4 py-3',i===0&&'border-yellow-300 bg-yellow-50/60',i===1&&'border-slate-300',i===2&&'border-orange-200')}><div className={cn('font-display font-black text-lg w-7 text-center',i===0&&'text-yellow-500',i===1&&'text-slate-400',i===2&&'text-orange-400')}>{['🥇','🥈','🥉'][i]}</div><div className={cn('avatar w-9 h-9 text-xs',avatarColor(p.full_name))}>{getInitials(p.full_name)}</div><div className="flex-1"><p className="font-semibold text-sm">{p.full_name}</p><p className="text-xs text-slate-400">{p.city}</p></div><div className="text-right"><p className="font-display font-black text-lg text-blue-600">{p.ranking_points.toLocaleString('es-CL')}</p><p className="text-[10px] text-slate-400">puntos</p></div></div>))}
      </div>
    </div>
  </main><BottomNav /></div>)
}