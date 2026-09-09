'use client'
import { useEffect, useState } from 'react'
import { getScoreColor } from '@/lib/utils'

const SIZES = { sm: 40, md: 56, lg: 80, xl: 120 }
const STROKES = { sm: 3, md: 4, lg: 5, xl: 7 }
const FONTS = { sm: 11, md: 14, lg: 20, xl: 30 }

interface ScoreRingProps {
  score: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  animate?: boolean
}

export function ScoreRing({ score, size = 'md', label, animate = true }: ScoreRingProps) {
  const [mounted, setMounted] = useState(false)
  const [displayed, setDisplayed] = useState(score)

  useEffect(() => {
    setMounted(true)
    if (!animate) {
      setDisplayed(score)
      return
    }
    let cur = 0
    const step = Math.max(1, Math.ceil(score / 25))
    const t = setInterval(() => {
      cur = Math.min(cur + step, score)
      setDisplayed(cur)
      if (cur >= score) clearInterval(t)
    }, 20)
    return () => clearInterval(t)
  }, [score, animate])

  const px = SIZES[size] || 56
  const sw = STROKES[size] || 4
  const fs = FONTS[size] || 14
  const r = (px - sw * 2) / 2
  const circ = 2 * Math.PI * r
  const currentVal = mounted ? displayed : score
  const offset = circ - (currentVal / 100) * circ
  const color = getScoreColor(score)

  return (
    <div className="flex flex-col items-center gap-0.5 select-none" suppressHydrationWarning>
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        style={{ transform: 'rotate(-90deg)' }}
        aria-label={`Score: ${score}`}
      >
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={sw}
        />
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
        <text
          x={px / 2}
          y={px / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={fs}
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${px / 2}px ${px / 2}px` }}
        >
          {currentVal}
        </text>
      </svg>
      {label && <span className="text-[11px] font-mono font-medium text-[var(--text-3)]">{label}</span>}
    </div>
  )
}

