import { useState } from 'react'
import { inputStyle, labelStyle } from '../../lib/utils'

export default function AdminSettings({ settings, onSave }) {
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try { await onSave(form); alert('已儲存') }
    catch (err) { alert('儲存失敗:' + err.message) }
    setSaving(false)
  }

  const fields = [
    { k: 'shopName', l: '店家名稱', t: 'text' },
    { k: 'tagline', l: '英文標語', t: 'text' },
    { k: 'subtitle', l: '副標題', t: 'text' },
    { k: 'story', l: '品牌故事', t: 'textarea' },
    { k: 'since', l: '創立年份(顯示在 SINCE 徽章)', t: 'text' },
    { k: 'contactLine', l: 'LINE ID', t: 'text' },
    { k: 'contactPhone', l: '聯絡電話', t: 'text' },
    { k: 'leadDays', l: '預購前置天數', t: 'number' }
  ]

  return (
    <div style={{
      background: '#fff', borderRadius: '16px',
      padding: '20px', border: '2px solid var(--line)'
    }}>
      <h3 className="fredoka" style={{
        margin: '0 0 16px 0', fontSize: '16px',
        color: 'var(--brown)', fontWeight: 700
      }}>🏪 店家資訊</h3>
      {fields.map(f => (
        <div key={f.k} style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>{f.l}</label>
          {f.t === 'textarea'
            ? <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
                value={form[f.k] || ''}
                onChange={e => setForm({ ...form, [f.k]: e.target.value })} />
            : <input type={f.t} style={inputStyle}
                value={form[f.k] || (f.t === 'number' ? 0 : '')}
                onChange={e => setForm({ ...form, [f.k]: f.t === 'number' ? parseInt(e.target.value) || 0 : e.target.value })} />
          }
        </div>
      ))}
      <button onClick={handleSave} disabled={saving} className="fredoka btn-orange" style={{
        padding: '12px 28px', background: 'var(--orange)', color: '#fff',
        border: 'none', borderRadius: '999px',
        fontSize: '14px', fontWeight: 700, cursor: 'pointer',
        marginTop: '8px'
      }}>{saving ? '儲存中...' : '💾 儲存設定'}</button>
    </div>
  )
}
