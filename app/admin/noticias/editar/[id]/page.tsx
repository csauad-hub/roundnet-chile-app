'use client'
import { useRef, useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Link as LinkIcon } from 'lucide-react'

const CATEGORIES = ['Resultados', 'Torneos', 'Comunidad', 'Reglamento', 'General']

const cls = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20"

export default function EditarNoticiaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    category: 'General',
    description: '',
    image_url: '',
    link: '',
    published_at: '',
  })

  useEffect(() => {
    if (!id) return
    supabase.from('news').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) { setError('Noticia no encontrada'); setFetching(false); return }
      const existingUrl = data.image_url ?? ''
      setForm({
        title: data.title ?? '',
        category: data.category ?? 'General',
        description: data.description ?? '',
        image_url: existingUrl,
        link: data.link ?? '',
        published_at: data.published_at ? data.published_at.split('T')[0] : '',
      })
      if (existingUrl) {
        setImagePreview(existingUrl)
        setImageMode('url')
      }
      setFetching(false)
    })
  }, [id])

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('La imagen no puede superar 10 MB.'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError(null)
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setForm(prev => ({ ...prev, image_url: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('El título es obligatorio.'); return }
    setLoading(true)
    setError(null)

    let image_url: string | null = form.image_url || null

    if (imageMode === 'upload' && imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `news/${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(path, imageFile, { upsert: false })
      if (uploadError) { setError(`Error al subir imagen: ${uploadError.message}`); setLoading(false); return }
      const { data: urlData } = supabase.storage.from('news-images').getPublicUrl(uploadData.path)
      image_url = urlData.publicUrl
    }

    const { error: err } = await supabase.from('news').update({
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim() || null,
      image_url,
      link: form.link.trim() || null,
      published_at: form.published_at || null,
    }).eq('id', id)

    if (err) { setError(err.message); setLoading(false); return }
    router.push('/admin/noticias')
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta noticia permanentemente?')) return
    setLoading(true)
    await supabase.from('news').delete().eq('id', id)
    router.push('/admin/noticias')
    router.refresh()
  }

  if (fetching) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#00E5FF]/30 border-t-[#00E5FF] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Editar Noticia</h1>
          <p className="text-gray-500 mt-1 text-xs font-mono">{id}</p>
        </div>
        <button onClick={handleDelete} disabled={loading}
          className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors disabled:opacity-50">
          Eliminar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">Título <span className="text-red-400">*</span></label>
            <input type="text" name="title" value={form.title} onChange={handle} required className={cls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
            <select name="category" value={form.category} onChange={handle} className={cls}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Descripción / Resumen</label>
          <textarea name="description" value={form.description} onChange={handle} rows={5}
            className={cls + ' resize-none'} />
        </div>

        {/* Imagen */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">Imagen</label>
            <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
              <button type="button" onClick={() => { setImageMode('upload'); clearImage() }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${imageMode === 'upload' ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                <Upload size={12} /> Subir archivo
              </button>
              <button type="button" onClick={() => setImageMode('url')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${imageMode === 'url' ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                <LinkIcon size={12} /> URL
              </button>
            </div>
          </div>

          {imageMode === 'upload' ? (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden border border-white/10 h-48">
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={clearImage}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed border-white/20 rounded-lg py-8 flex flex-col items-center gap-2 text-gray-500 hover:border-[#00E5FF]/40 hover:text-[#00E5FF]/70 transition-colors">
                  <Upload size={24} />
                  <span className="text-sm">Haz click para seleccionar una imagen</span>
                  <span className="text-xs">PNG, JPG, WEBP — máx 10 MB</span>
                </button>
              )}
            </>
          ) : (
            <>
              <input type="url" name="image_url" value={form.image_url} onChange={handle}
                placeholder="https://..." className={cls} />
              {form.image_url && (
                <div className="mt-2 rounded-lg overflow-hidden border border-white/10 h-40">
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Link externo <span className="text-gray-500 text-xs">(opcional)</span></label>
          <input type="url" name="link" value={form.link} onChange={handle}
            placeholder="https://..." className={cls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Fecha de publicación</label>
          <input type="date" name="published_at" value={form.published_at} onChange={handle} className={cls} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="flex-1 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-[#00E5FF] text-black font-semibold hover:bg-[#00E5FF]/90 transition-colors disabled:opacity-50">
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
