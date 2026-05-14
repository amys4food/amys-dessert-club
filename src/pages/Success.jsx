import QRCodeBox from '../components/QRCode'
import { DAY_LABELS } from '../lib/utils'

export default function Success({ order, settings, onBack }) {
  if (!order) return null
  const dow = new Date(order.pickupDate).getDay()
  
  const qrText = [
    `【${settings.shopName}】訂購確認`,
    `訂單編號:${order.orderNo}`,
    `訂購人:${order.name}`,
    `電話:${order.phone}`,
    `取貨日:${order.pickupDate} (週${DAY_LABELS[dow]})`,
    `取貨地點:${order.pickupLocation}`,
    ``,
    `訂購明細:`,
    ...order.items.map(i => `• ${i.name} × ${i.qty} = NT$${i.price * i.qty}`),
    ``,
    `合計:NT$ ${order.total} (取貨付款)`,
    order.note ? `備註:${order.note}` : '',
    `下單時間:${new Date(order.createdAt).toLocaleString('zh-TW')}`
  ].filter(Boolean).join('\n')

  return (
    <div style={{ padding: '40px 28px', background: 'var(--paper)', minHeight: '520px' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'var(--mint)', margin: '0 auto 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '30px', color: 'var(--paper)', fontWeight: 300
        }}>✓</div>
        <div className="script" style={{ fontSize: '30px', color: 'var(--caramel)', marginBottom: '4px' }}>
          Thank you
        </div>
        <h2 className="serif" style={{ fontSize: '22px', margin: '0 0 6px 0', color: 'var(--ink)', fontWeight: 400 }}>
          訂購成功
        </h2>
        <p className="sans" style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
          Amy 已收到您的訂單
        </p>

        {/* QR Code */}
        <div style={{
          background: 'var(--paper)', border: '2px solid var(--ink)',
          borderRadius: '12px', padding: '24px 20px', marginTop: '24px', textAlign: 'center'
        }}>
          <div className="sans" style={{
            fontSize: '10px', letterSpacing: '3px', color: 'var(--caramel)',
            fontWeight: 600, marginBottom: '14px'
          }}>ORDER QR CODE</div>
          <div style={{
            background: '#ffffff', padding: '12px', borderRadius: '8px',
            display: 'inline-block', marginBottom: '14px'
          }}>
            <QRCodeBox text={qrText} size={180} />
          </div>
          <div className="sans" style={{ fontSize: '12px', color: 'var(--cocoa)', lineHeight: 1.7 }}>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--ink)' }}>
              請截圖或掃描保存訂購資料
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
              用手機相機掃描即可查看完整訂單
            </div>
          </div>
          <div className="sans" style={{
            marginTop: '14px', padding: '8px 12px',
            background: 'var(--cream)', borderRadius: '6px',
            fontSize: '13px', fontWeight: 600, color: 'var(--ink)',
            fontFamily: 'monospace', letterSpacing: '1px'
          }}>{order.orderNo}</div>
        </div>

        {/* 訂單細節 */}
        <div style={{
          background: 'var(--cream)', borderRadius: '8px',
          padding: '20px', marginTop: '18px', textAlign: 'left'
        }}>
          <div className="sans" style={{ fontSize: '10px', letterSpacing: '2.5px', color: 'var(--caramel)', fontWeight: 600, marginBottom: '12px' }}>
            ORDER DETAILS
          </div>
          {[
            ['訂購人', order.name],
            ['聯絡電話', order.phone],
            ['取貨日期', `${order.pickupDate} (週${DAY_LABELS[dow]})`],
            ['取貨地點', order.pickupLocation]
          ].map(([k, v]) => (
            <div key={k} className="sans" style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '6px 0', fontSize: '13px'
            }}>
              <span style={{ color: 'var(--muted)' }}>{k}</span>
              <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{v}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--line)', marginTop: '10px', paddingTop: '10px' }}>
            {order.items.map(i => (
              <div key={i.id} className="sans" style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '12px', padding: '3px 0', color: 'var(--cocoa)'
              }}>
                <span>{i.name} × {i.qty}</span>
                <span>NT$ {i.price * i.qty}</span>
              </div>
            ))}
            <div className="sans" style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '15px', fontWeight: 600, color: 'var(--ink)',
              marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--line)'
            }}>
              <span>合計 · 取貨付款</span>
              <span>NT$ {order.total}</span>
            </div>
          </div>
          {order.note && (
            <div className="sans" style={{
              marginTop: '10px', padding: '8px 10px',
              background: 'var(--paper)', borderRadius: '5px',
              fontSize: '12px', color: 'var(--cocoa)', fontStyle: 'italic'
            }}>備註:{order.note}</div>
          )}
        </div>

        <button onClick={onBack} className="sans btn-primary" style={{
          padding: '12px 32px', background: 'var(--ink)', color: 'var(--paper)',
          border: 'none', borderRadius: '6px', fontWeight: 600,
          fontSize: '13px', cursor: 'pointer', marginTop: '20px', letterSpacing: '1px'
        }}>繼續選購</button>
        <p className="sans" style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '14px' }}>
          👆 請截圖保留此頁面作為訂購憑證
        </p>
      </div>
    </div>
  )
}
