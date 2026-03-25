import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Trophy, Users, Plus, ArrowRight } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = createClient()
  const [{ count: torneos }, { count: usuarios }] = await Promise.all([
    supabase.from('tournaments').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div>
      <h1 className="font-display font-black text-xl text-slate-800 mb-4">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <Trophy size={20} className="text-blue-500 mb-2" />
          <p className="font-display font-black text-3xl text-blue-600">{torneos ?? 0}</p>
          <p className="text-xs text-slate-500 mt-0.5">Torneos</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <Users size={20} className="text-green-500 mb-2" />
          <p className="font-display font-black text-3xl text-green-600">{usuarios ?? 0}</p>
          <p className="text-xs text-slate-500 mt-0.5">Usuarios</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-2">
        <h2 className="font-semibold text-sm text-slate-700 mb-3">Acciones rápidas</h2>
        <Link href="/admin/torneos/nuevo" className="flex items-center justify-between w-full bg-blue-600 text-white font-bold text-sm px-4 py-3 rounded-xl hover:bg-blue-700">
          <span className="flex items-center gap-2"><Plus size={16} /> Nuevo torneo</span>
          <ArrowRight size={16} />
        </Link>
        <Link href="/admin/usuarios" className="flex items-center justify-between w-full bg-slate-100 text-slate-700 font-semibold text-sm px-4 py-3 rounded-xl hover:bg-slate-200">
          <span className="flex items-center gap-2"><Users size={16} /> Ver usuarios</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
