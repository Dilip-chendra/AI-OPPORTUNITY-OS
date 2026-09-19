import React from 'react'

interface BrandLogoProps {
  size?: number
  className?: string
}

export function BrandLogo({ size = 32, className = '' }: BrandLogoProps) {
  const iconSize = Math.round(size * 0.58)
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-lg bg-zinc-100 border border-white/50 shadow-xs flex items-center justify-center text-zinc-950 shrink-0 select-none ${className}`}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" strokeDasharray="3 3" />
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.75" />
        <path d="M12 3V7M12 17V21M3 12H7M17 12H21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="12" cy="12" r="1.5" fill="#06B6D4" />
      </svg>
    </div>
  )
}
