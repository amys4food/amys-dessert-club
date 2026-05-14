export const DAY_LABELS = ['日','一','二','三','四','五','六']

export function getPickupDates(pickupRules, leadDays) {
  const dates = []
  const today = new Date()
  today.setHours(0,0,0,0)
  const byDow = {}
  pickupRules.filter(r => r.active).forEach(r => {
    if (!byDow[r.dow]) byDow[r.dow] = []
    byDow[r.dow].push(r)
  })
  for (let i = leadDays; i < 35 && dates.length < 18; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dow = d.getDay()
    if (byDow[dow]) {
      byDow[dow].forEach(rule => {
        dates.push({
          iso: d.toISOString().slice(0,10),
          display: (d.getMonth()+1) + '/' + d.getDate(),
          dayLabel: '週' + DAY_LABELS[dow],
          location: rule.location,
          note: rule.note,
          ruleId: rule.id,
          dow
        })
      })
    }
  }
  return dates
}

export function compressImage(file, maxWidth = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width, hh = img.height
        if (w > maxWidth) { hh = (maxWidth / w) * hh; w = maxWidth }
        canvas.width = w; canvas.height = hh
        canvas.getContext('2d').drawImage(img, 0, 0, w, hh)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function statusLabel(s) {
  return { pending: '待處理', confirmed: '已確認', completed: '已完成', cancelled: '已取消' }[s] || s
}

export function statusBadgeStyle(s) {
  const map = {
    pending: { bg: 'var(--cream)', fg: 'var(--caramel)' },
    confirmed: { bg: '#e8efe6', fg: '#4a6b52' },
    completed: { bg: 'var(--caramel)', fg: 'var(--paper)' },
    cancelled: { bg: '#f0ebe0', fg: 'var(--muted)' }
  }
  const c = map[s] || map.pending
  return {
    fontSize: '10px', padding: '3px 9px', borderRadius: '3px',
    background: c.bg, color: c.fg, fontWeight: 600, letterSpacing: '1px'
  }
}

export const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: '5px',
  border: '1px solid var(--line)', fontSize: '13px',
  background: 'var(--paper)', color: 'var(--ink)', boxSizing: 'border-box'
}

export const labelStyle = {
  fontSize: '11px', color: 'var(--muted)', fontWeight: 600,
  display: 'block', marginBottom: '6px', letterSpacing: '1px', textTransform: 'uppercase'
}
