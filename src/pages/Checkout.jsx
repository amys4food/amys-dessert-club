import { useState, useMemo } from 'react'
import CartItem from '../components/CartItem'
import { getPickupDates, inputStyle, labelStyle } from '../lib/utils'

export default function Checkout({ cart, cartTotal, pickups, settings, onUpdateQty, onRemoveItem, onSubmitOrder, onBack }) {
  const [form, setForm] = useState({
    name: '', phone: '',
    pickupDate: '', pickupLocation: '', pickupRuleId: '',
    note: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const pickupDates = useMemo(() => getPickupDates(pickups, settings.leadDays), [pickups, settings.leadDays])
  
  const seen = new Set()
  const groupedDates = []
  pickupDates.forEach(d => {
    const k = d.iso + '|' + d.ruleId
    if (!seen.has(k)) { seen.add(k); groupedDates.push(d) }
  })

  const canSubmit = form.name.trim() && /^09\d{8}$/.test(form.phone.replace(/\D/g,'')) && form.pickupDate && cart.length > 0 && !submitting

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await onSubmitOrder({ ...form, items: cart, total: cartTotal })
    } catch (err) {
      alert('訂購失敗: ' + err.message)
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '32px 28px', background: 'var(--paper)', minHeight: '520px' }}>
      <button onClick={onBack} className="sans btn-ghost" style={{
        background: 'transparent', border: 'none', color: 'var(--cocoa)',
        cursor: 'pointer', fontSize: '13px', marginBottom: '20px',
        padding: '4px 8px', borderRadius: '4px'
      }}>← 繼續選購</button>

      <div style={{ marginBottom: '28px' }}>
        <div className="sans" style={{
          fontSize: '10px', letterSpacing: '3px', color: 'var(--caramel)',
          fontWeight: 600, marginBottom: '4px'
        }}>CHECKOUT</div>
        <h2 className="serif" style={{ fontSize: '26px', margin: 0, color: 'var(--ink)', fontWeight: 400 }}>
          確認訂購資訊
        </h2>
      </div>

      {/* 訂購商品 */}
      <div style={{
        background: 'var(--paper)', borderRadius: '10px',
        border: '1px solid var(--line)', overflow: 'hidden', marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', background: 'var(--cream)', borderBottom: '1px solid var(--line)'
        }}>
          <div>
            <div className="sans" style={{ fontSize: '10px', letterSpacing: '2.5px', color: 'var(--caramel)', fontWeight: 600 }}>
              YOUR ORDER
            </div>
            <div className="serif" style={{ fontSize: '15px', color: 'var(--ink)', fontWeight: 500, marginTop: '2px' }}>
              訂購商品 · {cart.reduce((s,i) => s+i.qty, 0)} 件
            </div>
          </div>
          <button onClick={onBack} className="sans btn-ghost" style={{
            background: 'transparent', border: '1px solid var(--line)', borderRadius: '4px',
            padding: '6px 12px', fontSize: '11px', color: 'var(--cocoa)',
            cursor: 'pointer', fontWeight: 500
          }}>+ 加選</button>
        </div>
        {cart.length === 0 ? (
          <div className="sans" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.4 }}>🛒</div>
            <div>購物車是空的</div>
            <button onClick={onBack} className="btn-primary" style={{
              marginTop: '16px', padding: '9px 22px',
              background: 'var(--ink)', color: 'var(--paper)',
              border: 'none', borderRadius: '5px',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer', letterSpacing: '1px'
            }}>去選購甜點</button>
          </div>
        ) : (
          <div>
            {cart.map((i, idx) => (
              <CartItem key={i.id} item={i} isLast={idx === cart.length - 1}
                onUpdateQty={(delta) => onUpdateQty(i.id, delta)}
                onRemove={() => onRemoveItem(i.id)} />
            ))}
            <div className="sans" style={{
              padding: '16px 20px', background: 'var(--cream)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderTop: '1px solid var(--line)'
            }}>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>商品合計</div>
              <div className="serif" style={{ fontSize: '22px', fontWeight: 600, color: 'var(--ink)' }}>
                NT$ {cartTotal}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 聯絡資訊 */}
      <div style={{
        background: 'var(--paper)', borderRadius: '10px',
        border: '1px solid var(--line)', padding: '22px 20px', marginBottom: '18px'
      }}>
        <div className="sans" style={{ fontSize: '10px', letterSpacing: '2.5px', color: 'var(--caramel)', fontWeight: 600, marginBottom: '14px' }}>
          CONTACT INFO
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label className="sans" style={labelStyle}>姓名</label>
          <input className="sans" style={inputStyle} type="text" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="請輸入您的姓名" />
        </div>
        <div>
          <label className="sans" style={labelStyle}>手機號碼</label>
          <input className="sans" style={inputStyle} type="tel" value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="09XXXXXXXX" />
        </div>
      </div>

      {/* 取貨日 */}
      <div style={{
        background: 'var(--paper)', borderRadius: '10px',
        border: '1px solid var(--line)', padding: '22px 20px', marginBottom: '18px'
      }}>
        <div className="sans" style={{ fontSize: '10px', letterSpacing: '2.5px', color: 'var(--caramel)', fontWeight: 600, marginBottom: '4px' }}>
          PICKUP DATE
        </div>
        <p className="sans" style={{ fontSize: '11px', color: 'var(--muted)', margin: '0 0 12px 0' }}>
          需於取貨日 {settings.leadDays} 天前訂購
        </p>
        {groupedDates.length === 0 ? (
          <div className="sans" style={{ padding: '20px', background: 'var(--cream)', borderRadius: '6px', fontSize: '12px', color: 'var(--muted)', textAlign: 'center' }}>
            目前無可預約日期
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '8px', maxHeight: '260px', overflowY: 'auto', padding: '2px'
          }}>
            {groupedDates.map(d => {
              const selected = form.pickupDate === d.iso && form.pickupRuleId === d.ruleId
              return (
                <button key={d.iso + d.ruleId}
                  onClick={() => setForm({ ...form, pickupDate: d.iso, pickupLocation: d.location, pickupRuleId: d.ruleId })}
                  className="sans"
                  style={{
                    padding: '12px 14px', borderRadius: '6px',
                    border: selected ? '1.5px solid var(--ink)' : '1px solid var(--line)',
                    background: selected ? 'var(--cream)' : 'var(--paper)',
                    cursor: 'pointer', textAlign: 'left', color: 'var(--ink)'
                  }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{d.display}  {d.dayLabel}</div>
                  <div style={{ fontSize: '11px', color: 'var(--caramel)', marginTop: '3px' }}>{d.location}</div>
                  {d.note && <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{d.note}</div>}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 備註 */}
      <div style={{
        background: 'var(--paper)', borderRadius: '10px',
        border: '1px solid var(--line)', padding: '22px 20px', marginBottom: '18px'
      }}>
        <div className="sans" style={{ fontSize: '10px', letterSpacing: '2.5px', color: 'var(--caramel)', fontWeight: 600, marginBottom: '12px' }}>
          NOTE (OPTIONAL)
        </div>
        <textarea className="sans" style={{ ...inputStyle, minHeight: '64px', resize: 'vertical' }}
          value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
          placeholder="如有需求請留言,例如過敏、禮盒包裝等" />
      </div>

      <div className="sans" style={{
        background: 'var(--cream)', borderRadius: '8px',
        padding: '12px 16px', fontSize: '12px', color: 'var(--cocoa)',
        marginBottom: '18px', border: '1px solid var(--line)', lineHeight: 1.6
      }}>
        💰 本店採取貨付款,無需先轉帳,取貨時現場付現即可。
      </div>

      <button onClick={handleSubmit} disabled={!canSubmit} className="sans" style={{
        width: '100%', padding: '14px',
        background: canSubmit ? 'var(--ink)' : 'var(--soft-muted)',
        color: 'var(--paper)', border: 'none', borderRadius: '6px',
        fontSize: '14px', fontWeight: 600,
        cursor: canSubmit ? 'pointer' : 'not-allowed', letterSpacing: '1.5px'
      }}>
        {submitting ? '處理中...' : `確認訂購 · NT$ ${cartTotal}`}
      </button>
    </div>
  )
}
