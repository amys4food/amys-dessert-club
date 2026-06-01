import { useState } from 'react'
import { DAY_LABELS, inputStyle, labelStyle } from '../../lib/utils'

export default function AdminPickups({ pickups, onSavePickup, onDeletePickup }) {
  const [editing, setEditing] = useState(null)

  return (
    <div>
      <div style={{
        marginBottom: '14px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '8px'
      }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
          設定客戶可選的取貨日與地點
        </div>
        <button onClick={() => setEditing({ dow: 2, location: '', note: '', active: true })}
          className="fredoka btn-orange" style={{
            padding: '10px 20px', background: 'var(--orange)', color: '#fff',
            border: 'none', borderRadius: '999px',
            fontWeight: 700, fontSize: '13px', cursor: 'pointer'
          }}>+ 新增取貨日</button>
      </div>

      {/* 手機改 1 欄,桌機 7 欄 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '8px'
      }}>
        {[0, 1, 2, 3, 4, 5, 6].map(dow => {
          const rules = pickups.filter(p => p.dow === dow)
          return (
            <div key={dow} style={{
              background: rules.length === 0 ? 'var(--cream-light)' : '#fff',
              border: '2px solid var(--line)', borderRadius: '14px',
              padding: '12px', minHeight: '120px'
            }}>
              <div className="fredoka" style={{
                fontWeight: 700, color: 'var(--brown)', marginBottom: '8px',
                fontSize: '13px', textAlign: 'center',
                paddingBottom: '6px', borderBottom: '2px dashed var(--line)'
              }}>週{DAY_LABELS[dow]}</div>
              {rules.length === 0 ? (
                <div style={{ fontSize: '11px', color: 'var(--soft-muted)', textAlign: 'center', padding: '14px 0' }}>
                  未設定
                </div>
              ) : rules.map(r => (
                <div key={r.id} onClick={() => setEditing(r)} style={{
                  padding: '8px', background: r.active ? 'var(--cream-light)' : '#f0e8d0',
                  borderRadius: '10px', marginBottom: '4px', cursor: 'pointer',
                  fontSize: '11px',
                  border: `1.5px solid ${r.active ? 'var(--line)' : 'var(--soft-muted)'}`,
                  textAlign: 'center', opacity: r.active ? 1 : 0.6
                }}>
                  <div className="fredoka" style={{ fontWeight: 600, color: 'var(--brown)' }}>{r.location}</div>
                  {r.note && <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{r.note}</div>}
                  {!r.active && <div style={{ fontSize: '10px', color: 'var(--red)', marginTop: '2px' }}>停用</div>}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {editing && (
        <PickupEditor pickup={editing}
          onSave={async (pk) => { await onSavePickup(pk); setEditing(null) }}
          onCancel={() => setEditing(null)}
          onDelete={async (id) => { await onDeletePickup(id); setEditing(null) }} />
      )}
    </div>
  )
}

function PickupEditor({ pickup, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState(pickup)
  const isNew = !pickup.id

  return (
    <div onClick={onCancel} className="modal-overlay">
      <div onClick={e => e.stopPropagation()} className="modal-box" style={{ padding: '24px', maxWidth: '420px' }}>
        <h2 className="fredoka" style={{ fontSize: '18px', margin: '0 0 18px 0', color: 'var(--brown)', fontWeight: 700 }}>
          {isNew ? '新增取貨日' : '編輯取貨日'}
        </h2>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>星期幾</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {[0, 1, 2, 3, 4, 5, 6].map(dow => (
              <button key={dow} onClick={() => setForm({ ...form, dow })} className="fredoka" style={{
                padding: '10px 0',
                background: form.dow === dow ? 'var(--orange)' : '#fff',
                color: form.dow === dow ? '#fff' : 'var(--brown)',
                border: `2px solid ${form.dow === dow ? 'var(--orange)' : 'var(--line)'}`,
                borderRadius: '10px',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer'
              }}>{DAY_LABELS[dow]}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>取貨地點 *</label>
          <input type="text" style={inputStyle} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>備註(可選)</label>
          <input type="text" style={inputStyle} value={form.note || ''} onChange={e => setForm({ ...form, note: e.target.value })} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '16px', color: 'var(--brown)' }}>
          <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} style={{ width: '18px', height: '18px' }} />
          <span>啟用(客戶可選擇)</span>
        </label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {!isNew && (
            <button onClick={() => { if (confirm('刪除此取貨日?')) onDelete(form.id) }} style={{
              padding: '10px 16px', background: '#fff', color: 'var(--red)',
              border: '2px solid var(--red-light)', borderRadius: '999px',
              fontSize: '13px', cursor: 'pointer', fontWeight: 600
            }}>🗑 刪除</button>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={onCancel} style={{
            padding: '10px 18px', background: 'transparent',
            border: '2px solid var(--line)', borderRadius: '999px',
            fontSize: '13px', cursor: 'pointer', color: 'var(--muted)', fontWeight: 600
          }}>取消</button>
          <button onClick={() => { if (!form.location.trim()) { alert('請填取貨地點'); return } onSave(form) }}
            className="fredoka btn-orange" style={{
              padding: '11px 24px', background: 'var(--orange)', color: '#fff',
              border: 'none', borderRadius: '999px',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer'
            }}>儲存</button>
        </div>
      </div>
    </div>
  )
}
