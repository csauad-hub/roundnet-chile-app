import { Newspaper, Plus } from 'lucide-react'
import Link from 'next/link'

export default function NoticiasPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Noticias</h1>
          <p className="text-gray-400 mt-1">Gestión de noticias y comunicados</p>
        </div>
        <button
          disabled
          className="flex items-center gap-2 bg-[#00E5FF]/20 text-[#00E5FF]/40 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Nueva Noticia
        </button>
      </div>

      {/* Coming Soon */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Newspaper className="w-8 h-8 text-gray-500" />
        </div>
        <h2 className="text-white font-semibold text-lg mb-2">Módulo en desarrollo</h2>
        <p className="text-gray-400 text-sm max-w-sm">
          La gestión de noticias estará disponible próximamente. Por ahora, las noticias se
          pueden publicar directamente en la comunidad.
        </p>
        <Link
          href="/comunidad"
          className="mt-6 text-[#00E5FF] text-sm hover:underline"
        >
          Ir a Comunidad →
        </Link>
      </div>
    </div>
  )
}
