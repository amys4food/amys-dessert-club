import { DAY_LABELS, statusLabel, statusColor, formatCurrency } from '../../lib/utils'

export default function AdminOrders({ orders, onUpdateStatus, onDelete }) {
  const pending = orders.filter(o => o.status === 'pending')
  const confirmed = orders.filter(o => o.status === 'confirmed')
  const completed = orders.filter(o => o.status === 'completed')
  const totalRev = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)

  return (
    <div>
      {/* 統計卡片 - 手機單欄,平板以上多欄 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '10px',
        marginBottom: '18px'
      }}>
        <StatCard label="待處理" value={pending.length} color="#a87600" bg="#fff3d6" />
        <StatCard label="已確認" value={confirmed.length} color="#2c5aa0" bg="#dceefb" />
        <StatCard label="已完成" value={completed.length} color="#2d6b2d" bg="#d4eed4" />
        <StatCard label="累積營收" value={formatCurrency(totalRev)} color="#f26a2d" bg="#ffe5c4" />
      </div>

      {orders.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px',
          color: 'var(--muted)', background: 'var(--cream-light)',
          borderRadius: '16px', fontSize: '13px'
        }}>尚無訂單</div>
      ) : orders.map(o => {
        const dow = new Date(o.pickupDate).getDay()
        const sc = statusColor(o.status)
        return (
          <div key={o.id} style={{
            background: '#fff', border: '2px solid var(--line)',
            borderRadius: '16px', padding: '14px', marginBottom: '10px'
          }}>
            {/* 第一行:訂單編號 + 狀態 + 金額 (手機改直式) */}
            <div className="order-card-row" style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', marginBottom: '10px', gap: '10px'
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span className="fredoka" style={{
                    fontWeight: 700, color: 'var(--brown)', fontSize: '14px',
                    fontFamily: 'monospace'
                  }}>{o.orderNo}</span>
                  <span className="fredoka" style={{
                    fontSize: '10px', padding: '3px 9px', borderRadius: '999px',
                    background: sc.bg, color: sc.fg, fontWeight: 700
                  }}>{statusLabel(o.status)}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--brown)', fontWeight: 600 }}>
                  {o.name} · {o.phone}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                  {o.pickupDate} (週{DAY_LABELS[dow]}) · {o.pickupLocation}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="fredoka" style={{
                  color: 'var(--orange-dark)', fontWeight: 700, fontSize: '18px'
                }}>${o.total}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  {o.items.reduce((s, i) => s + i.qty, 0)} 份
                </div>
              </div>
            </div>

            {/* 品項 */}
            <div style={{
              fontSize: '12px', color: 'var(--brown)',
              padding: '8px 0', borderTop: '1px dashed var(--line)',
              lineHeight: 1.6
            }}>
              {o.items.map(i => `${i.name} × ${i.qty}`).join(' · ')}
            </div>

            {o.note && (
              <div style={{
                fontSize: '12px', color: 'var(--brown)',
                marginTop: '4px', padding: '8px 12px',
                background: '#fff8e8', borderRadius: '8px', fontStyle: 'italic'
              }}>📝 {o.note}</div>
            )}

            {/* 操作按鈕 */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {o.status === 'pending' && (
                <button onClick={() => onUpdateStatus(o.id, 'confirmed')} style={btn('var(--blue)', '#fff')}>
                  ✓ 確認訂單
                </button>
              )}
              {o.status === 'confirmed' && (
                <button onClick={() => onUpdateStatus(o.id, 'completed')} style={btn('var(--green)', '#fff')}>
                  ✓ 完成取貨
                </button>
              )}
              {(o.status === 'pending' || o.status === 'confirmed') && (
                <button onClick={() => { if (confirm('確定取消此訂單?')) onUpdateStatus(o.id, 'cancelled') }}
                  style={btn('#fff', 'var(--red)', '2px solid var(--line)')}>
                  取消訂單
                </button>
              )}
              {/* 完成或取消的訂單可刪除 */}
              {(o.status === 'completed' || o.status === 'cancelled') && (
                <button onClick={() => { if (confirm(`確定刪除訂單 ${o.orderNo}?此操作無法復原。`)) onDelete(o.id) }}
                  style={btn('#fff', 'var(--red)', '2px solid var(--red-light)')}>
                  🗑 刪除訂單
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StatCard({ label, value, color, bg }) {
  return (
    <div style={{
      background: bg, borderRadius: '14px', padding: '14px 16px'
    }}>
      <div style={{ fontSize: '11px', color, fontWeight: 600, marginBottom: '4px' }}>
        {label}
      </div>
      <div className="fredoka" style={{ fontSize: '20px', fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  )
}

function btn(bg, fg, border) {
  return {
    padding: '8px 14px', background: bg, color: fg,
    border: border || 'none', borderRadius: '999px',
    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
    fontFamily: 'Fredoka, Noto Sans TC, sans-serif'
  }
}
