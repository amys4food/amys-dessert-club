import { useState, useMemo, useRef } from 'react'
import CartItem from '../components/CartItem'
import { getPickupDates, inputStyle, labelStyle } from '../lib/utils'

export default function Checkout({ cart, cartTotal, pickups, settings, onUpdateQty, onRemoveItem, onSubmitOrder, onBack }) {
  const [form, setForm] = useState({ name: '', phone: '', pickupDate: '', pickupLocation: '', pickupRuleId: '', note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  // 用 ref 額外擋一層,避免 React state 更新延遲導致的重複觸發
  const submittingRef = useRef(false)

  const pickupDates = useMemo(() => getPickupDates(pickups, settings.leadDays), [pickups, settings.leadDays])
  const seen = new Set()
  const groupedDates = []
  pickupDates.forEach(d => {
    const k = d.iso + '|' + d.ruleId
    if (!seen.has(k)) { seen.add(k); groupedDates.push(d) }
  })

  const canSubmit = form.name.trim() && /^09\d{8}$/.test(form.phone.replace(/\D/g,'')) && form.pickupDate && cart.length > 0 && !submitting

  async function handleSubmit() {
    // 第一道防線:state 檢查
    if (!canSubmit) return
    
    // 第二道防線:ref 檢查(防 React state 延遲)
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    setErrorMsg('')
    
    try {
      await onSubmitOrder({ ...form, items: cart, total: cartTotal })
      // 成功後不要 reset submitting → 等頁面跳到 success 頁
      // 避免顧客看到「處理中」消失後又能再按一次
    } catch (err) {
      // 顯示友善錯誤訊息
      const msg = err?.friendlyMessage || err?.message || '訂單送出時發生問題,請稍後再試一次。'
      setErrorMsg(msg)
      
      // 失敗才恢復按鈕
      submittingRef.current = false
      setSubmitting(false)
      
      // 完整錯誤寫到 console 給工程師檢查
      console.error('[Checkout] Submit error:', err)
    }
  }

  return (
    <div className="responsive-container" style={{ padding: '24px 16px', background: 'var(--cream-bg)', minHeight: '100vh' }}>
      <button onClick={onBack} disabled={submitting} className="fredoka btn-ghost" style={{
        background: 'transparent', border: 'none',
        color: submitting ? 'var(--soft-muted)' : 'var(--brown)',
        cursor: submitting ? 'not-allowed' : 'pointer',
        fontSize: '14px', marginBottom: '16px',
        padding: '6px 10px', borderRadius: '8px', fontWeight: 600
      }}>← 繼續選購</button>

      <h2 className="fredoka" style={{
        fontSize: '28px', margin: '0 0 4px 0', color: 'var(--blue-dark)', fontWeight: 700
      }}>CHECKOUT</h2>
      <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>確認訂購資訊</div>

      {/* 訂購商品 */}
      <Card title="🛒 訂購商品" subtitle={`共 ${cart.reduce((s,i)=>s+i.qty,0)} 件`}>
        {cart.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.4 }}>🛒</div>
            <div>購物車是空的</div>
            <button onClick={onBack} className="fredoka btn-orange" style={{
              marginTop: '14px', padding: '10px 22px',
              background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: '999px',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer'
            }}>去選購甜點</button>
          </div>
        ) : (
          <>
            {cart.map((i, idx) => (
              <CartItem key={i.id} item={i} isLast={idx === cart.length - 1}
                onUpdateQty={(delta) => !submitting && onUpdateQty(i.id, delta)}
                onRemove={() => !submitting && onRemoveItem(i.id)} />
            ))}
            <div style={{
              padding: '14px 16px', background: 'var(--cream-light)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderTop: '2px dashed var(--line)'
            }}>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>商品合計</div>
              <div className="fredoka" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--orange-dark)' }}>
                ${cartTotal}
              </div>
            </div>
          </>
        )}
      </Card>

      {/* 聯絡資訊 */}
      <Card title="📞 聯絡資訊">
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>姓名</label>
            <input style={inputStyle} type="text" value={form.name}
              disabled={submitting}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="請輸入您的姓名" />
          </div>
          <div>
            <label style={labelStyle}>手機號碼</label>
            <input style={inputStyle} type="tel" value={form.phone}
              disabled={submitting}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="09XXXXXXXX" />
          </div>
        </div>
      </Card>

      {/* 取貨日 */}
      <Card title="📅 取貨日期" subtitle={`需於取貨日 ${settings.leadDays} 天前訂購`}>
        <div style={{ padding: '14px 16px' }}>
          {groupedDates.length === 0 ? (
            <div style={{ padding: '20px', background: 'var(--cream-light)', borderRadius: '12px', fontSize: '12px', color: 'var(--muted)', textAlign: 'center' }}>
              目前無可預約日期
            </div>
          ) : (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '8px', maxHeight: '260px', overflowY: 'auto', padding: '2px'
            }}>
              {groupedDates.map(d => {
                const selected = form.pickupDate === d.iso && form.pickupRuleId === d.ruleId
                return (
                  <button key={d.iso + d.ruleId}
                    disabled={submitting}
                    onClick={() => setForm({ ...form, pickupDate: d.iso, pickupLocation: d.location, pickupRuleId: d.ruleId })}
                    style={{
                      padding: '12px 14px', borderRadius: '12px',
                      border: selected ? '2px solid var(--orange)' : '2px solid var(--line)',
                      background: selected ? '#fff5e9' : '#fff',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      textAlign: 'left', color: 'var(--brown)',
                      fontFamily: 'inherit',
                      opacity: submitting ? 0.6 : 1
                    }}>
                    <div className="fredoka" style={{ fontWeight: 700, fontSize: '14px' }}>{d.display} {d.dayLabel}</div>
                    <div style={{ fontSize: '11px', color: 'var(--orange-dark)', marginTop: '3px' }}>{d.location}</div>
                    {d.note && <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{d.note}</div>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </Card>

      {/* 備註 */}
      <Card title="📝 備註(可選)">
        <div style={{ padding: '14px 16px' }}>
          <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
            value={form.note}
            disabled={submitting}
            onChange={e => setForm({ ...form, note: e.target.value })}
            placeholder="如有需求請留言,例如過敏、禮盒包裝等" />
        </div>
      </Card>

      <div style={{
        background: '#fff3d6', borderRadius: '12px',
        padding: '12px 16px', fontSize: '13px', color: 'var(--brown)',
        marginBottom: '16px', lineHeight: 1.6, fontWeight: 500
      }}>
        💰 本店採取貨付款,無需先轉帳,取貨時現場付現即可。
      </div>

      {/* 錯誤訊息 - 友善中文 */}
      {errorMsg && (
        <div style={{
          background: '#faeae8', border: '2px solid #f0c0bb',
          borderRadius: '12px',
          padding: '14px 16px', fontSize: '13px', color: '#8b2a1f',
          marginBottom: '16px', lineHeight: 1.7, fontWeight: 500,
          display: 'flex', alignItems: 'flex-start', gap: '10px'
        }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
          <div>{errorMsg}</div>
        </div>
      )}

      <button onClick={handleSubmit} disabled={!canSubmit} className="fredoka" style={{
        width: '100%', padding: '16px',
        background: canSubmit ? 'var(--orange)' : 'var(--soft-muted)',
        color: '#fff', border: 'none', borderRadius: '999px',
        fontSize: '16px', fontWeight: 700,
        cursor: canSubmit ? 'pointer' : 'not-allowed',
        transition: 'background 0.2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
      }}>
        {submitting && (
          <span style={{
            width: '16px', height: '16px',
            border: '2.5px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            display: 'inline-block'
          }} />
        )}
        <span>{submitting ? '訂單送出中...' : `確認訂購 · $${cartTotal}`}</span>
      </button>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function Card({ title, subtitle, children }) {
  return (
    <div style={{
      background: 'var(--cream-card)', borderRadius: '20px',
      overflow: 'hidden', marginBottom: '14px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      <div style={{
        padding: '14px 16px', borderBottom: '2px dashed var(--line)',
        background: 'var(--cream-light)'
      }}>
        <div className="fredoka" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brown)' }}>
          {title}
        </div>
        {subtitle && <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  )
}
