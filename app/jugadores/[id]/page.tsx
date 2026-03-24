import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Trophy, Calendar } from 'lucide-react'
import { MOCK_PLAYERS } from '@/lib/mock-data'
import { LEVEL_LABELS, formatDate, cn, avatarColor, getInitials } from '@/lib/utils'
import BottomNav from '@/components/layout/BottomNav'
export default function PlayerDetailPage({ params }: { params: { id: string } }) {
  const player = MOCK_PLAYERS.find(p => p.id===params.id)
  if (!player) notFound()
  return (<div className="flex flex-col min-h-screen animate-in">
    <div className="top-stripe" />
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200"><div className="flex items-center gap-3 px-4 py-3"><Link href="/jugadores"><ArrowLeft size={20} className="text-slate-600" /></Link><span className="font-display font-bold text-sm flex-1">Perfil</span></div></div>
    <main className="flex-1 pb-24">
      <div className="bg-gradient-to-br from-blue-50 to-slate-100 px-5 pt-6 pb-8 border-b border-slate-200 flex flex-col items-center text-center">
        <div className={cn('avatar w-20 h-20 text-2xl border-4 border-white shadow-md mb-3',avatarColor(player.full_name))}>{getInitials(player.full_name)}</div>
        <h1 className="font-display font-black text-xl text-slate-800">{player.full_name}</h1>
        <p className="text-sm text-slate-500 mt-1">@{player.username}</p>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><MapPin size={11} />{player.city}, {player.region}</p>
        <div className="flex gap-2 mt-3">
          <span className="badge bg-blue-100 text-blue-700">{LEVEL_LABELS[player.level]}</span>
          {player.looking_for_partner && <span className="badge bg-emerald-100 text-emerald-700">🟢 Buscando pareja</span>}
        </div>
      </div>
      <div className="px-5 py-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[{label:'Ranking',value:player.ranking_position?'#'+player.ranking_position:'—'},{label:'Puntos',value:player.ranking_points.toLocaleString('es-CL')},{label:'Torneos',value:player.tournaments_played}].map(s => (<div key={s.label} className="card p-4 text-center"><p className="font-display font-black text-xl text-blue-600">{s.value}</p><p className="text-[10px] text-slate-400 mt-1 font-medium">{s.label}</p></div>))}
        </div>
        <div className="card p-4">
          <h3 className="font-semibold text-sm text-slate-700 mb-3">Info</h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm"><Trophy size={14} className="text-blue-400" /><span className="text-slate-500">Nivel:</span><span className="font-medium text-slate-700">{LEVEL_LABELS[player.level]}</span></div>
            <div className="flex items-center gap-2 text-sm"><Calendar size={14} className="text-blue-400" /><span className="text-slate-500">Miembro desde:</span><span className="font-medium text-slate-700">{formatDate(player.created_at)}</span></div>
          </div>
        </div>
        <button className="btn-primary w-full">Conectar</button>
      </div>
    </main><BottomNav />
  </div>)
}