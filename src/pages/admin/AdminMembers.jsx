import { useState, useMemo } from 'react'
import { formatCurrency, formatDate, inputStyle, labelStyle } from '../../lib/utils'

export default function AdminMembers({ members, onUpdate, onDelete }) {
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [sortBy, setSortBy] = useState('last') // last / total / count

  // 過濾搜尋
  const filteredMembers = useMemo(() => {
    let list = [...members]
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        (m.tag || '').toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      if (sortBy === 'total') return b.totalSpent - a.totalSpent
      if (sortBy === 'count') return b.totalOrders - a.totalOrders
      return new Date(b.lastOrderAt) - new Date(a.lastOrderAt)
    })
    return list
  }, [members, search, sortBy])

  // 統計
  const totalSpent = members.reduce((s, m) => s + m.totalSpent, 0)
  const avgPerMember = members.length > 0 ? Math.round(totalSpent / members.length) : 0
  const vipCount = members.filter(m => m.totalOrders >= 3).length

  return (
    <div>
      {/* 統計卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '10px', marginBottom: '14px'
      }}>
        <StatCard label="會員總數" value={members.length} bg="#dceefb" color="var(--blue-dark)" icon="👥" />
        <StatCard label="VIP 會員" value={vipCount} bg="#ffe5c4" color="var(--orange-dark)" icon="⭐" subtitle="3 次以上消費" />
        <StatCard label="人均消費" value={formatCurrency(avgPerMember)} bg="#d4eed4" color="#2d6b2d" icon="💵" />
      </div>

      {/* 搜尋 + 排序 */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '14px',
        flexWrap: 'wrap', alignItems: 'center'
      }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 搜尋姓名 / 電話 / 標籤"
          style={{ ...inputStyle, flex: '1 1 200px', maxWidth: '400px' }} />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ ...inputStyle, width: 'auto', flex: '0 0 auto' }}>
          <option value="last">最近下單</option>
          <option value="total">消費金額</option>
          <option value="count">訂單次數</option>
        </select>
      </div>

      {/* 會員列表 */}
      {filteredMembers.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px',
          color: 'var(--muted)', background: 'var(--cream-light)',
          borderRadius: '16px', fontSize: '13px'
        }}>
          {search ? '找不到符合的會員' : '尚無會員資料(客戶下單後自動建立)'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredMembers.map(m => (
            <div key={m.phone} onClick={() => setEditing(m)} style={{
              background: '#fff', border: '2px solid var(--line)',
              borderRadius: '14px', padding: '14px', cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }} onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--orange-light)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,140,66,0.1)'
            }} onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--line)'
              e.currentTarget.style.boxShadow = 'none'
            }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                  {/* 頭像 */}
                  <div className="fredoka" style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: m.totalOrders >= 3 ? 'var(--orange)' : 'var(--cream-light)',
                    color: m.totalOrders >= 3 ? '#fff' : 'var(--brown)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 700, flexShrink: 0
                  }}>{m.name.charAt(0)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span className="fredoka" style={{
                        fontWeight: 700, color: 'var(--brown)', fontSize: '14px'
                      }}>{m.name}</span>
                      {m.totalOrders >= 3 && (
                        <span className="fredoka" style={{
                          fontSize: '10px', background: 'var(--orange)', color: '#fff',
                          padding: '2px 8px', borderRadius: '999px', fontWeight: 700
                        }}>⭐ VIP</span>
                      )}
                      {m.tag && (
                        <span style={{
                          fontSize: '10px', background: 'var(--blue-light)', color: 'var(--blue-dark)',
                          padding: '2px 8px', borderRadius: '999px', fontWeight: 600
                        }}>{m.tag}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                      {m.phone}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="fredoka" style={{
                    fontSize: '17px', fontWeight: 700, color: 'var(--orange-dark)'
                  }}>{formatCurrency(m.totalSpent)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {m.totalOrders} 次訂單
                  </div>
                </div>
              </div>
              <div style={{
                marginTop: '10px', paddingTop: '10px',
                borderTop: '1px dashed var(--line)',
                fontSize: '11px', color: 'var(--muted)',
                display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px'
              }}>
                <span>初次:{formatDate(m.firstOrderAt)}</span>
                <span>最近:{formatDate(m.lastOrderAt)}</span>
              </div>
              {m.note && (
                <div style={{
                  marginTop: '8px', padding: '6px 10px',
                  background: '#fff8e8', borderRadius: '8px',
                  fontSize: '11px', color: 'var(--brown)', fontStyle: 'italic'
                }}>📌 {m.note}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <MemberEditor member={editing}
          onSave={async (m) => { await onUpdate(m.phone, { name: m.name, note: m.note, tag: m.tag }); setEditing(null) }}
          onCancel={() => setEditing(null)}
          onDelete={async (phone) => { await onDelete(phone); setEditing(null) }} />
      )}
    </div>
  )
}

function StatCard({ label, value, color, bg, icon, subtitle }) {
  return (
    <div style={{ background: bg, borderRadius: '14px', padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '11px', color, fontWeight: 600 }}>{label}</div>
          {subtitle && <div style={{ fontSize: '10px', color, opacity: 0.7, marginTop: '2px' }}>{subtitle}</div>}
        </div>
        <div style={{ fontSize: '16px' }}>{icon}</div>
      </div>
      <div className="fredoka" style={{ fontSize: '20px', fontWeight: 700, color, marginTop: '4px' }}>
        {value}
      </div>
    </div>
  )
}

function MemberEditor({ member, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState({ ...member })

  return (
    <div onClick={onCancel} className="modal-overlay">
      <div onClick={e => e.stopPropagation()} className="modal-box" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="fredoka" style={{ fontSize: '18px', margin: 0, color: 'var(--brown)', fontWeight: 700 }}>
            會員資料
          </h2>
          <button onClick={onCancel} style={{
            background: 'var(--cream-light)', border: 'none',
            width: '32px', height: '32px', borderRadius: '50%',
            fontSize: '14px', cursor: 'pointer', color: 'var(--brown)'
          }}>✕</button>
        </div>

        {/* 唯讀資訊 */}
        <div style={{
          background: 'var(--cream-light)', borderRadius: '12px',
          padding: '12px 14px', marginBottom: '16px',
          fontSize: '12px', color: 'var(--brown)'
        }}>
          <div style={{ marginBottom: '4px' }}>📞 {member.phone}</div>
          <div style={{ marginBottom: '4px' }}>📦 累積訂單:{member.totalOrders} 次</div>
          <div style={{ marginBottom: '4px' }}>💰 累積消費:{formatCurrency(member.totalSpent)}</div>
          <div style={{ marginBottom: '4px' }}>📅 初次下單:{formatDate(member.firstOrderAt)}</div>
          <div>🕐 最近下單:{formatDate(member.lastOrderAt)}</div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>姓名</label>
          <input type="text" style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>標籤(可選,例:常客、過敏)</label>
          <input type="text" style={inputStyle} value={form.tag || ''} onChange={e => setForm({ ...form, tag: e.target.value })}
            placeholder="例:常客、過敏體質、生日 6/1" />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>備註</label>
          <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
            value={form.note || ''} onChange={e => setForm({ ...form, note: e.target.value })}
            placeholder="例:偏好低糖、不要堅果" />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => { if (confirm(`確定刪除會員「${member.name}」?\n注意:這只會刪除會員資料,不會影響歷史訂單。`)) onDelete(member.phone) }} style={{
            padding: '10px 16px', background: '#fff', color: 'var(--red)',
            border: '2px solid var(--red-light)', borderRadius: '999px',
            fontSize: '13px', cursor: 'pointer', fontWeight: 600
          }}>🗑 刪除</button>
          <div style={{ flex: 1 }} />
          <button onClick={onCancel} style={{
            padding: '10px 18px', background: 'transparent',
            border: '2px solid var(--line)', borderRadius: '999px',
            fontSize: '13px', cursor: 'pointer', color: 'var(--muted)', fontWeight: 600
          }}>取消</button>
          <button onClick={() => onSave(form)} className="fredoka btn-orange" style={{
            padding: '11px 24px', background: 'var(--orange)', color: '#fff',
            border: 'none', borderRadius: '999px',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer'
          }}>儲存</button>
        </div>
      </div>
    </div>
  )
}
