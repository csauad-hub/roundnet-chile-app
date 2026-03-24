'use client'
import { useState } from 'react'
import { Search, Plus, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'
import { MOCK_PLAYERS, MOCK_ENCUENTROS } from '@/lib/mock-data'
import { cn, LEVEL_LABELS, formatDate, avatarColor, getInitials } from '@/lib/utils'
const REGIONS = ['Todas','Metropolitana','Valparaíso','Biobío','Antofagasta','Araucanía','Coquimbo']
export default function JugadoresPage() {
  const [tab, setTab] = useState<'directorio'|'encuentros'>('directorio')
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('Todas')
  const [onlyLooking, setOnlyLooking] = useState(false)
  const players = MOCK_PLAYERS.filter(p => {
    const mQ = !query || p.full_name.toLowerCase().includes(query.toLowerCase()) || p.city.toLowerCase().includes(query.toLowerCase())
    const mR = region==='Todas' || p.region===region
    const mL = !onlyLooking || p.looking_for_partner
    return mQ && mR && mL
  })
  return (<div className="flex flex-col min-h-screen animate-in"><Topbar title="Jugadores" />
    <div className="flex bg-white border-b border-slate-200">
      {(['directorio','encuentros'] as const).map(t => (<button key={t} onClick={() => setTab(t)} className={cn('tab-item flex-1 text-center',tab===t&&'active')}>{t==='directorio'?'Directorio':'Encuentros'}</button>))}
    </div>
    <main className="flex-1 pb-24">
      {tab==='directorio' && (<>
        <div className="px-4 pt-3"><div className="card flex items-center gap-2.5 px-4 py-2.5"><Search size={15} className="text-slate-400" /><input type="text" placeholder="Buscar jugador o ciudad..." value={query} onChange={e => setQuery(e.target.value)} className="flex-1 text-sm outline-none bg-transparent placeholder-slate-400" /></div></div>
        <div className="flex gap-2 px-4 py-2.5 overflow-x-auto">
          {REGIONS.map(r => (<button key={r} onClick={() => setRegion(r)} className={cn('flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold font-display border-2 transition-all',region===r?'bg-blue-600 border-blue-600 text-white':'bg-white border-slate-200 text-slate-500')}>{r}</button>))}
        </div>
        <div className="px-4 pb-3 flex items-center gap-2">
          <button onClick={() => setOnlyLooking(!onlyLooking)} className={cn('flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border-2 transition-all',onlyLooking?'bg-emerald-600 border-emerald-600 text-white':'bg-white border-slate-200 text-slate-500')}>🟢 Buscando pareja</button>
          <p className="text-xs text-slate-400">{players.length} jugadores</p>
        </div>
        <div className="px-4 flex flex-col gap-2.5 pb-4">
          {players.map(p => (<Link key={p.id} href={'/jugadores/'+p.id}><div className="card flex items-center gap-3 px-4 py-3.5 hover:border-blue-200">
            <div className={cn('avatar w-12 h-12 text-sm border-2 border-transparent',avatarColor(p.full_name))}>{getInitials(p.full_name)}</div>
            <div className="flex-1 min-w-0"><p className="font-bold text-sm">{p.full_name}</p><p className="text-xs text-slate-400">@{p.username} · {p.city}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {p.looking_for_partner && <span className="badge bg-emerald-50 text-emerald-700">🟢 Buscando pareja</span>}
                <span className="badge bg-blue-50 text-blue-700">{LEVEL_LABELS[p.level]}</span>
              </div>
            </div>
            <button className="border-2 border-blue-600 text-blue-600 px-3 py-2 rounded-lg text-xs font-bold font-display" onClick={e => {e.preventDefault();alert('Próximamente')}}>Conectar</button>
          </div></Link>))}
        </div>
      </>)}
      {tab==='encuentros' && (<div className="px-4 pt-4">
        <div className="flex flex-col gap-2.5 mb-4">
          {MOCK_ENCUENTROS.map(e => (<div key={e.id} className="card border-l-4 border-l-blue-500 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-bold text-sm">{e.title}</p><div className="flex gap-2 mt-1 text-xs text-slate-500"><span className="flex items-center gap-1"><MapPin size={11} />{e.location}</span><span className="flex items-center gap-1"><Clock size={11} />{formatDate(e.date)}</span></div></div>
              <span className="font-display font-black text-sm text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl flex-shrink-0">{e.time}</span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex">{e.participants.slice(0,4).map((p,i) => (<div key={p.id} style={{marginLeft:i>0?-8:0,zIndex:4-i}} className={cn('avatar w-7 h-7 text-[10px] border-2 border-white',avatarColor(p.full_name))}>{getInitials(p.full_name)}</div>))}</div>
              <span className="text-xs text-slate-500">{e.participants.length} jugadores · <span className="font-semibold text-emerald-600">{e.max_participants-e.participants.length} cupos</span></span>
              <button className="ml-auto bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold font-display">Unirse</button>
            </div>
          </div>))}
        </div>
        <button className="w-full py-3.5 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 font-display font-bold text-sm flex items-center justify-center gap-2"><Plus size={16} />Crear encuentro</button>
      </div>)}
    </main><BottomNav /></div>)
}