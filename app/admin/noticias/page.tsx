'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, ExternalLink, Calendar } from 'lucide-react'

type News = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  link: string | null
  published_at: string | null
  created_at: string
}

export default function AdminNoticias() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('news')
      .select('id,title,description,image_url,link,published_at,created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setNews(data ?? [])
        setLoading(false)
      })
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta noticia?')) return
    await supabase.from('news').delete().eq('id', id)
    setNews(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Noticias</h1>
          <p className="text-gray-400 mt-1">Gestión de noticias y comunicados</p>
        </div>
        <Link
          href="/admin/noticias/nuevo"
          className="flex items-center gap-2 bg-[#00E5FF]/20 text-[#00E5FF] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#00E5FF]/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Noticia
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando...</div>
      ) : news.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-semibold mb-2">No hay noticias aún</p>
          <p className="text-sm">Crea la primera noticia usando el botón de arriba</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Noticia</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Fecha</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Link</th>
                <th className="text-right text-gray-400 text-sm font-medium px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr key={item.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-white font-medium text-sm">{item.title}</p>
                        {item.description && (
                          <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.published_at
                        ? new Date(item.published_at).toLocaleDateString('es-CL')
                        : new Date(item.created_at).toLocaleDateString('es-CL')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver link
                      </a>
                    ) : (
                      <span className="text-gray-600 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/noticias/editar/${item.id}`}
                        className="p-1.5 text-gray-500 hover:text-[#00E5FF] transition-colors rounded"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
