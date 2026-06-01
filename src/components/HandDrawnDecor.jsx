// 手繪風裝飾元素

export function Heart({ size = 24, color = '#e63946', filled = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={filled ? color : 'none'}/>
    </svg>
  )
}

export function Crown({ size = 24, color = '#4a89dc' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l4 7 5-9 5 9 4-7v12H3V8z"/>
      <circle cx="3" cy="6" r="1.5" fill={color}/>
      <circle cx="12" cy="3" r="1.5" fill={color}/>
      <circle cx="21" cy="6" r="1.5" fill={color}/>
    </svg>
  )
}

export function Star({ size = 24, color = '#4a89dc', filled = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

export function Sparkles({ color = '#ff8c42' }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <line x1="20" y1="4" x2="20" y2="12"/>
      <line x1="20" y1="28" x2="20" y2="36"/>
      <line x1="4" y1="20" x2="12" y2="20"/>
      <line x1="28" y1="20" x2="36" y2="20"/>
      <line x1="8" y1="8" x2="14" y2="14"/>
      <line x1="26" y1="26" x2="32" y2="32"/>
      <line x1="32" y1="8" x2="26" y2="14"/>
      <line x1="14" y1="26" x2="8" y2="32"/>
    </svg>
  )
}

export function Squiggle({ color = '#ff8c42', width = 60 }) {
  return (
    <svg width={width} height="12" viewBox="0 0 60 12" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <path d="M2 6 Q 9 1, 15 6 T 28 6 T 43 6 T 58 6"/>
    </svg>
  )
}

export function Cloud({ children, color = '#4a89dc', bgColor = '#ffffff' }) {
  return (
    <div style={{
      display: 'inline-block', position: 'relative',
      background: bgColor, color: color,
      padding: '8px 16px', borderRadius: '20px',
      border: `2px solid ${color}`, fontSize: '12px', fontWeight: 700
    }}>
      {children}
      <div style={{
        position: 'absolute', bottom: '-8px', left: '12px',
        width: '14px', height: '14px', background: bgColor,
        border: `2px solid ${color}`,
        borderTop: 'none', borderLeft: 'none', borderRadius: '0 0 50% 0',
        transform: 'rotate(45deg)'
      }} />
    </div>
  )
}

// 圓圈虛線(像 Pinterest 圖那種圍商品的)
export function CircleFrame({ children, color = '#ff8c42', size = 280 }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg width={size} height={size} viewBox="0 0 200 200" style={{ position: 'absolute', top: '-10px', left: '-10px', pointerEvents: 'none', overflow: 'visible' }}>
        <ellipse cx="100" cy="100" rx="95" ry="92" 
          fill="none" stroke={color} strokeWidth="3" 
          strokeDasharray="2 6" strokeLinecap="round" 
          transform="rotate(-5 100 100)"/>
      </svg>
      {children}
    </div>
  )
}

// 「SINCE 2012」徽章
export function Badge({ text, color = '#4a89dc', textColor = '#ffffff' }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '80px', height: '80px', background: color, color: textColor,
      borderRadius: '50%', fontFamily: 'Fredoka, sans-serif', fontWeight: 700,
      fontSize: '14px', textAlign: 'center', lineHeight: 1.2,
      transform: 'rotate(-10deg)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      position: 'relative'
    }}>
      {/* 鋸齒邊 */}
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: 'absolute', top: 0, left: 0 }}>
        {Array.from({ length: 18 }).map((_, i) => {
          const angle = (i * 20) * Math.PI / 180
          const r1 = 40, r2 = 38
          const x1 = 40 + Math.cos(angle) * r1
          const y1 = 40 + Math.sin(angle) * r1
          const x2 = 40 + Math.cos(angle + 0.18) * r2
          const y2 = 40 + Math.sin(angle + 0.18) * r2
          return <polygon key={i} points={`40,40 ${x1},${y1} ${x2},${y2}`} fill={color} />
        })}
      </svg>
      <span style={{ position: 'relative', zIndex: 1 }}>{text}</span>
    </div>
  )
}
