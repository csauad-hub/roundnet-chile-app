import { createClient } from '@/lib/supabase/server'
import { Trophy, MapPin, Calendar, Users, ExternalLink } from 'lucide-react'

const statusLabel: Record<string, string> = {
  upcoming: 'Próximo',
  ongoing: 'En curso',
  finished: 'Finalizado',
  cancelled: 'Cancelado',
}

const statusStyle: Record<string, { color: string; bg: string; border: string }> = {
  upcoming: { color: '#00E5FF', bg: 'rgba(0,229,255,0.1)',  border: 'rgba(0,229,255,0.25)' },
  ongoing:  { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)' },
  finished: { color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
  cancelled:{ color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)' },
}

export default async function TorneosPage() {
  const supabase = createClient()
  const { data: torneos } = await supabase
    .from('tournaments')
    .select('*')
    .order('date', { ascending: true })

  const upcoming = torneos?.filter(t => t.status === 'upcoming' || t.status === 'ongoing') ?? []
  const past = torneos?.filter(t => t.status === 'finished' || t.status === 'cancelled') ?? []

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: '#0d0d1a' }}>
      <div className="max-w-2xl mx-auto space-y-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={20} style={{ color: '#00E5FF' }} />
            <h1 className="text-2xl font-bold text-white">Torneos</h1>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Todos los torneos de Roundnet Chile
          </p>
        </div>

        {upcoming.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Próximos &amp; En curso
            </h2>
            <div className="space-y-3">
              {upcoming.map(t => {
                const s = statusStyle[t.status] ?? statusStyle.upcoming
                return (
                  <div key={t.id} className="rounded-2xl border p-5" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-semibold text-white text-base">{t.name}</h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                        {statusLabel[t.status] ?? t.status}
                      </span>
                    </div>
                    <div className="space-y-1.5 mb-4">
                      {t.date && (
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          <Calendar size={13} />
                          {new Date(t.date).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      )}
                      {(t.city || t.location) && (
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          <MapPin size={13} />
                          {[t.city, t.location].filter(Boolean).join(' · ')}
                        </div>
                      )}
                      {t.category && (
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          <Users size={13} />
                          {t.category}{t.max_teams && ` · Máx ${t.max_teams} equipos`}
                        </div>
                      )}
                    </div>
                    {t.description && <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.description}</p>}
                    <div className="flex items-center gap-3">
                      {t.fwango_url && (
                        <a href={t.fwango_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg hover:opacity-80"
                          style={{ background: 'linear-gradient(135deg,#00E5FF22,#7B2FFF22)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.3)' }}
                        >
                          <ExternalLink size={13} />
                          Inscribirse en Fwango
                        </a>
                      )}
                      {t.price_per_team && (
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          ${t.price_per_team.toLocaleString('es-CL')} / equipo
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Pasados
            </h2>
            <div className="space-y-2">
              {past.map(t => {
                const s = statusStyle[t.status] ?? statusStyle.finished
                return (
                  <div key={t.id} className="flex items-center justify-between px-4 py-3 rounded-xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div>
                      <p className="text-sm font-medium text-white">{t.name}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {t.city}{t.date && ` · ${new Date(t.date).toLocaleDateString('es-CL')}`}
                      </p>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                      {statusLabel[t.status] ?? t.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {(!torneos || torneos.length === 0) && (
          <div className="text-center py-20" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <Trophy size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No hay torneos publicados aún.</p>
          </div>
        )}
      </div>
    </div>
  )
}
