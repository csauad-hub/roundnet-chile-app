'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2 } from 'lucide-react'

type Tournament = { id: string; name: string; city: string; date: string; status: string }

export default function AdminTorneos() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('tournaments').select('id,name,city,date,status').order('date', { ascending: false })
      .then(({ data }) => { setTournaments(data ?? []); setLoading(false) })
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este torneo? Esta acción no se puede deshacer.')) return
    const { error } = await supabase.from('tournaments').delete().eq('id', id)
    if (!error) setTournaments(t => t.filter(x => x.id !== id))
    else alert('Error al eliminar: ' + error.message)
  }

  const statusColor: Record<string, string> = {
    open: 'bg-green-100 text-green-700',
    closed: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    finished: 'bg-slate-100 text-slate-500',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display font-black text-xl text-slate-800">Torneos</h1>
        <Link href="/admin/torneos/nuevo" className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={14} /> Nuevo
        </Link>
      </div>
      {loading ? (
        <p className="text-sm text-slate-400 text-center py-8">Cargando...</p>
      ) : tournaments.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No hay torneos todavía.</p>
      ) : (
        <div className="space-y-2">
          {tournaments.map(t => (
            <div key={t.id} className="bg-white rounded-xl p-3 border border-slate-200 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-800 truncate">{t.name}</p>
                <p className="text-xs text-slate-400">{t.date} · {t.city}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[t.status] ?? 'bg-slate-100 text-slate-500'}`}>
                {t.status}
              </span>
              <div className="flex gap-1">
                <Link href={`/admin/torneos/${t.id}`} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                  <Pencil size={14} />
                </Link>
                <button onClick={() => handleDelete(t.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
