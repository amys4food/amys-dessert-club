export const DAY_LABELS = ['日','一','二','三','四','五','六']

export function getPickupDates(rules, leadDays) {
  const dates = []
  const today = new Date()
  today.setHours(0,0,0,0)
  const byDow = {}
  rules.filter(r => r.active).forEach(r => {
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
          location: rule.location, note: rule.note, ruleId: rule.id, dow
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

export function statusColor(s) {
  return {
    pending: { bg: '#fff3d6', fg: '#a87600' },
    confirmed: { bg: '#dceefb', fg: '#2c5aa0' },
    completed: { bg: '#d4eed4', fg: '#2d6b2d' },
    cancelled: { bg: '#f0e0e0', fg: '#8a4040' }
  }[s] || { bg: '#eee', fg: '#666' }
}

export function formatCurrency(n) {
  return 'NT$ ' + n.toLocaleString('zh-TW')
}

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function formatDateShort(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getMonth()+1}/${d.getDate()}`
}

// 統計工具
export function groupOrdersByDate(orders, period = 'day') {
  const groups = {}
  orders.forEach(o => {
    const date = new Date(o.createdAt || o.created_at)
    let key
    if (period === 'year') key = String(date.getFullYear())
    else if (period === 'month') key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`
    else key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
    if (!groups[key]) groups[key] = { date: key, revenue: 0, count: 0 }
    groups[key].revenue += o.total
    groups[key].count += 1
  })
  return Object.values(groups).sort((a, b) => a.date.localeCompare(b.date))
}

export function getTopProducts(orders, topN = 5) {
  const stats = {}
  orders.forEach(o => {
    (o.items || []).forEach(i => {
      if (!stats[i.name]) stats[i.name] = { name: i.name, qty: 0, revenue: 0 }
      stats[i.name].qty += i.qty
      stats[i.name].revenue += i.price * i.qty
    })
  })
  return Object.values(stats).sort((a, b) => b.qty - a.qty).slice(0, topN)
}

export const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: '12px',
  border: '2px solid var(--line)', fontSize: '14px',
  background: 'var(--cream-card)', color: 'var(--ink)',
  boxSizing: 'border-box', fontFamily: 'inherit'
}

export const labelStyle = {
  fontSize: '12px', color: 'var(--brown)', fontWeight: 600,
  display: 'block', marginBottom: '6px', letterSpacing: '0.3px'
}
