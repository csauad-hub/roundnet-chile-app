import { cn, getInitials, avatarColor } from '@/lib/utils'
const SIZES = { sm:'w-7 h-7 text-[10px]', md:'w-9 h-9 text-xs', lg:'w-12 h-12 text-sm', xl:'w-14 h-14 text-base' }
export default function Avatar({ name, src, size='md', className }: { name:string; src?:string|null; size?:'sm'|'md'|'lg'|'xl'; className?:string }) {
  const cls = cn('avatar flex-shrink-0', SIZES[size], !src && avatarColor(name), className)
  if (src) return <img src={src} alt={name} className={cn(cls, 'object-cover')} />
  return <div className={cls}>{getInitials(name)}</div>
}