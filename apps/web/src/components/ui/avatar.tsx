import { cn } from '@/lib/utils'

const SIZES = { sm: 'h-6 w-6 text-[10px]', md: 'h-8 w-8 text-xs', lg: 'h-10 w-10 text-sm', xl: 'h-14 w-14 text-base' }

interface AvatarProps {
  name?: string
  src?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'
  return (
    <div className={cn('rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden', SIZES[size], className)}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  )
}
