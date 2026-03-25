import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Trophy, Users, Newspaper, LogOut } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?next=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/')

  const displayName = profile?.full_name || user.email || 'Admin'

  const navItems = [
    { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
    { href: '/admin/torneos', label: 'Torneos', Icon: Trophy },
    { href: '/admin/usuarios', label: 'Usuarios', Icon: Users },
    { href: '/admin/noticias', label: 'Noticias', Icon: Newspaper },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#0d0d1a' }}>
      {/* Top gradient bar */}
      <div className="h-1" style={{ background: 'linear-gradient(90deg, #00E5FF 0%, #7B2FFF 50%, #00E5FF 100%)' }} />

      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #00E5FF, #7B2FFF)', color: '#0d0d1a' }}>
            R
          </div>
          <span className="font-semibold text-sm" style={{ color: '#00E5FF' }}>Panel Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{displayName}</span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors" style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <LogOut size={12} />
              Salir
            </button>
          </form>
        </div>
      </header>

      {/* Nav */}
      <nav className="flex gap-1 px-4 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        {navItems.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Main content */}
      <main className="p-4 mx-auto max-w-4xl">
        {children}
      </main>
    </div>
  )
}
