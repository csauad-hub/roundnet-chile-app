'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { approvePost, rejectPost } from './actions'

export function ModerationActions({ postId }: { postId: string }) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null)

  if (done === 'approved') {
    return <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-500/20 text-green-400">Aprobado</span>
  }
  if (done === 'rejected') {
    return <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-500/20 text-red-400">Rechazado</span>
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={async () => {
          setLoading('approve')
          await approvePost(postId)
          setDone('approved')
          setLoading(null)
        }}
        disabled={!!loading}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-500/15 text-green-400 hover:bg-green-500/25 disabled:opacity-40 transition-colors"
      >
        <Check size={13} />
        {loading === 'approve' ? '...' : 'Aprobar'}
      </button>
      <button
        onClick={async () => {
          setLoading('reject')
          await rejectPost(postId)
          setDone('rejected')
          setLoading(null)
        }}
        disabled={!!loading}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-500/15 text-red-400 hover:bg-red-500/25 disabled:opacity-40 transition-colors"
      >
        <X size={13} />
        {loading === 'reject' ? '...' : 'Rechazar'}
      </button>
    </div>
  )
}
