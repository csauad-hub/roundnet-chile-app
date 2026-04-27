'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Heart, Plus, Send, ChevronDown, ChevronUp, X } from 'lucide-react'

type PostCategory = 'tecnica' | 'general' | 'ayuda' | 'humor'

const CATEGORY_LABELS: Record<PostCategory, string> = {
  tecnica: 'Técnica',
  general: 'General',
  ayuda: 'Ayuda',
  humor: 'Humor',
}

const CATEGORY_COLORS: Record<PostCategory, string> = {
  tecnica: 'bg-blue-100 text-blue-700',
  general: 'bg-slate-100 text-slate-600',
  ayuda: 'bg-amber-100 text-amber-700',
  humor: 'bg-green-100 text-green-700',
}

interface Author {
  full_name: string | null
  avatar_url: string | null
}

interface Post {
  id: string
  author_id: string
  author: Author | null
  category: PostCategory
  content: string
  likes_count: number
  comments_count: number
  user_has_liked: boolean
  created_at: string
}

interface Comment {
  id: string
  post_id: string
  author_id: string
  author: Author | null
  content: string
  created_at: string
}

function Avatar({ name, url, size = 7 }: { name: string; url?: string | null; size?: number }) {
  const sizeClass = `w-${size} h-${size}`
  const textClass = size <= 7 ? 'text-[10px]' : 'text-sm'
  if (url) {
    return <img src={url} alt={name} className={`${sizeClass} rounded-full object-cover flex-shrink-0`} />
  }
  return (
    <div className={`${sizeClass} rounded-full bg-blue-600 flex items-center justify-center text-white font-black ${textClass} flex-shrink-0`}>
      {name[0].toUpperCase()}
    </div>
  )
}

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}

function normalizeAuthor(raw: unknown): Author | null {
  if (!raw) return null
  const obj = Array.isArray(raw) ? raw[0] : raw
  return obj as Author ?? null
}

export default function BlogFeed() {
  const supabase = createClient()

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [showNewPost, setShowNewPost] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState<PostCategory>('general')
  const [submitting, setSubmitting] = useState(false)
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [filterCategory, setFilterCategory] = useState<PostCategory | 'all'>('all')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
      await fetchPosts(user?.id ?? null)
    }
    init()
  }, [])

  const fetchPosts = async (uid: string | null) => {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('id, author_id, category, content, likes_count, comments_count, created_at, author:profiles!author_id(full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (!data) { setLoading(false); return }

    let likedIds = new Set<string>()
    if (uid) {
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', uid)
        .in('post_id', data.map(p => p.id))
      likedIds = new Set((likes ?? []).map(l => l.post_id))
    }

    setPosts(data.map(p => ({
      ...p,
      author: normalizeAuthor(p.author),
      user_has_liked: likedIds.has(p.id),
    })))
    setLoading(false)
  }

  const handleLike = async (post: Post) => {
    if (!userId) return
    const liked = post.user_has_liked
    setPosts(prev => prev.map(p => p.id === post.id
      ? { ...p, user_has_liked: !liked, likes_count: liked ? p.likes_count - 1 : p.likes_count + 1 }
      : p
    ))
    if (liked) {
      await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', userId)
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: userId })
    }
  }

  const handleNewPost = async () => {
    if (!userId || !newContent.trim() || submitting) return
    setSubmitting(true)
    const { data, error } = await supabase
      .from('posts')
      .insert({ author_id: userId, category: newCategory, content: newContent.trim() })
      .select('id, author_id, category, content, likes_count, comments_count, created_at, author:profiles!author_id(full_name, avatar_url)')
      .single()

    if (!error && data) {
      setPosts(prev => [{ ...data, author: normalizeAuthor(data.author), user_has_liked: false }, ...prev])
      setNewContent('')
      setShowNewPost(false)
    }
    setSubmitting(false)
  }

  const togglePost = async (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null)
      return
    }
    setExpandedPost(postId)
    if (comments[postId]) return
    const { data } = await supabase
      .from('post_comments')
      .select('id, post_id, author_id, content, created_at, author:profiles!author_id(full_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    setComments(prev => ({ ...prev, [postId]: (data ?? []).map(c => ({ ...c, author: normalizeAuthor(c.author) })) }))
  }

  const handleComment = async (postId: string) => {
    const content = newComment[postId]?.trim()
    if (!userId || !content) return
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, author_id: userId, content })
      .select('id, post_id, author_id, content, created_at, author:profiles!author_id(full_name, avatar_url)')
      .single()

    if (!error && data) {
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] ?? []), { ...data, author: normalizeAuthor(data.author) }] }))
      setNewComment(prev => ({ ...prev, [postId]: '' }))
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
    }
  }

  const filteredPosts = filterCategory === 'all' ? posts : posts.filter(p => p.category === filterCategory)

  return (
    <section className="px-4 mt-4 mb-2">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="section-title">Foro de la comunidad</h2>
        {userId && (
          <button
            onClick={() => setShowNewPost(v => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full active:scale-95 transition-transform"
          >
            <Plus size={13} /> Publicar
          </button>
        )}
      </div>

      {/* Filtros por categoría */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
        {(['all', 'tecnica', 'general', 'ayuda', 'humor'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`flex-shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors ${
              filterCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {cat === 'all' ? 'Todo' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Formulario nueva publicación */}
      {showNewPost && (
        <div className="card p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-slate-800">Nueva publicación</p>
            <button onClick={() => setShowNewPost(false)}>
              <X size={16} className="text-slate-400" />
            </button>
          </div>
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {(Object.keys(CATEGORY_LABELS) as PostCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setNewCategory(cat)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  newCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="¿Qué quieres compartir con la comunidad?"
            rows={4}
            className="w-full text-sm text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400"
          />
          <button
            onClick={handleNewPost}
            disabled={submitting || !newContent.trim()}
            className="mt-2 w-full bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            {submitting ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      )}

      {/* Lista de posts */}
      {loading ? (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-slate-100" />
                <div className="flex-1">
                  <div className="h-2.5 bg-slate-100 rounded w-1/3 mb-1.5" />
                  <div className="h-2 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded w-full mb-1.5" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="card p-8 text-center">
          <MessageSquare size={32} className="mx-auto mb-3 text-slate-200" />
          <p className="text-sm font-semibold text-slate-500">
            {filterCategory === 'all' ? 'Sé el primero en publicar' : `Sin publicaciones de ${CATEGORY_LABELS[filterCategory]}`}
          </p>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Comparte preguntas, técnicas o lo que quieras sobre roundnet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredPosts.map(post => {
            const isExpanded = expandedPost === post.id
            const authorName = post.author?.full_name || 'Jugador'
            const postComments = comments[post.id] ?? []

            return (
              <div key={post.id} className="card overflow-hidden">
                <div className="p-4">
                  {/* Header del post */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <Avatar name={authorName} url={post.author?.avatar_url} size={7} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{authorName}</p>
                      <p className="text-[10px] text-slate-400">{formatTime(post.created_at)}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${CATEGORY_COLORS[post.category]}`}>
                      {CATEGORY_LABELS[post.category]}
                    </span>
                  </div>

                  {/* Contenido */}
                  <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>

                  {/* Acciones */}
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => handleLike(post)}
                      className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${post.user_has_liked ? 'text-red-500' : 'text-slate-400'}`}
                    >
                      <Heart size={14} fill={post.user_has_liked ? 'currentColor' : 'none'} />
                      {post.likes_count}
                    </button>
                    <button
                      onClick={() => togglePost(post.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-400"
                    >
                      <MessageSquare size={14} />
                      {post.comments_count} {post.comments_count === 1 ? 'comentario' : 'comentarios'}
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                </div>

                {/* Sección de comentarios */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                    {postComments.length === 0 ? (
                      <p className="text-xs text-slate-400 py-1 mb-2">Sin comentarios aún. ¡Sé el primero!</p>
                    ) : (
                      <div className="flex flex-col gap-3 mb-3">
                        {postComments.map(c => {
                          const cName = c.author?.full_name || 'Jugador'
                          return (
                            <div key={c.id} className="flex gap-2">
                              <Avatar name={cName} url={c.author?.avatar_url} size={6} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-1.5">
                                  <p className="text-[11px] font-semibold text-slate-700">{cName}</p>
                                  <p className="text-[10px] text-slate-400">{formatTime(c.created_at)}</p>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{c.content}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {userId ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={newComment[post.id] ?? ''}
                          onChange={e => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') handleComment(post.id) }}
                          placeholder="Escribe un comentario..."
                          className="flex-1 text-xs bg-white border border-slate-200 rounded-full px-3 py-2 focus:outline-none focus:border-blue-400"
                        />
                        <button
                          onClick={() => handleComment(post.id)}
                          disabled={!newComment[post.id]?.trim()}
                          className="text-blue-600 disabled:text-slate-300 transition-colors"
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Inicia sesión para comentar.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
