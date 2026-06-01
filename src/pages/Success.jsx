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
    ...order.items.map(i => `• ${i.name} × ${i.qty} = $${i.price * i.qty}`),
    ``,
    `合計:$${order.total} (取貨付款)`,
    order.note ? `備註:${order.note}` : '',
    `下單時間:${new Date(order.createdAt).toLocaleString('zh-TW')}`
  ].filter(Boolean).join('\n')

  return (
    <div className="responsive-container" style={{ padding: '32px 20px', background: 'var(--cream-bg)', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
        <div style={{
          width: '70px', height: '70px', borderRadius: '50%',
          background: 'var(--green)', margin: '0 auto 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '36px', color: '#fff', fontWeight: 700,
          boxShadow: '0 8px 20px rgba(107,181,107,0.3)'
        }}>✓</div>
        <div className="caveat" style={{ fontSize: '36px', color: 'var(--orange-dark)', marginBottom: '4px' }}>
          Thank you!
        </div>
        <h2 className="fredoka" style={{ fontSize: '26px', margin: '0 0 6px 0', color: 'var(--brown)', fontWeight: 700 }}>
          訂購成功
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
          Amy 已收到您的訂單
        </p>

        {/* QR Code */}
        <div style={{
          background: '#fff', border: '3px solid var(--orange)',
          borderRadius: '20px', padding: '24px 20px', marginTop: '24px'
        }}>
          <div className="fredoka" style={{
            fontSize: '12px', letterSpacing: '2px',
            color: 'var(--orange-dark)', fontWeight: 700, marginBottom: '14px'
          }}>ORDER QR CODE</div>
          <div style={{ background: '#fff', padding: '8px', borderRadius: '12px', display: 'inline-block', marginBottom: '12px' }}>
            <QRCodeBox text={qrText} size={180} />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--brown)', lineHeight: 1.7, fontWeight: 600, marginBottom: '4px' }}>
            請截圖或掃描保存訂購資料
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
            用手機相機掃描即可查看完整訂單
          </div>
          <div className="fredoka" style={{
            marginTop: '14px', padding: '10px 14px',
            background: 'var(--cream-light)', borderRadius: '12px',
            fontSize: '15px', fontWeight: 700, color: 'var(--brown)',
            letterSpacing: '1px'
          }}>{order.orderNo}</div>
        </div>

        {/* 訂單明細 */}
        <div style={{
          background: 'var(--cream-light)', borderRadius: '16px',
          padding: '20px', marginTop: '16px', textAlign: 'left'
        }}>
          <div className="fredoka" style={{
            fontSize: '12px', letterSpacing: '2px',
            color: 'var(--orange-dark)', fontWeight: 700, marginBottom: '12px'
          }}>ORDER DETAILS</div>
          {[
            ['訂購人', order.name], ['聯絡電話', order.phone],
            ['取貨日期', `${order.pickupDate} (週${DAY_LABELS[dow]})`],
            ['取貨地點', order.pickupLocation]
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '13px' }}>
              <span style={{ color: 'var(--muted)' }}>{k}</span>
              <span style={{ color: 'var(--brown)', fontWeight: 600 }}>{v}</span>
            </div>
          ))}
          <div style={{ borderTop: '2px dashed var(--line)', marginTop: '10px', paddingTop: '10px' }}>
            {order.items.map(i => (
              <div key={i.id} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '12px', padding: '3px 0', color: 'var(--brown)'
              }}>
                <span>{i.name} × {i.qty}</span>
                <span>${i.price * i.qty}</span>
              </div>
            ))}
            <div className="fredoka" style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '17px', fontWeight: 700, color: 'var(--orange-dark)',
              marginTop: '10px', paddingTop: '10px', borderTop: '2px dashed var(--line)'
            }}>
              <span>合計 · 取貨付款</span>
              <span>${order.total}</span>
            </div>
          </div>
          {order.note && (
            <div style={{
              marginTop: '10px', padding: '8px 10px',
              background: '#fff', borderRadius: '8px',
              fontSize: '12px', color: 'var(--brown)', fontStyle: 'italic'
            }}>備註:{order.note}</div>
          )}
        </div>

        <button onClick={onBack} className="fredoka btn-orange" style={{
          padding: '14px 36px', background: 'var(--orange)', color: '#fff',
          border: 'none', borderRadius: '999px', fontWeight: 700,
          fontSize: '14px', cursor: 'pointer', marginTop: '22px'
        }}>繼續選購</button>
        <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '12px' }}>
          👆 請截圖保留此頁面作為訂購憑證
        </p>
      </div>
    </div>
  )
}
