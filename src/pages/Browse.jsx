import ProductCard from '../components/ProductCard'

export default function Browse({ settings, products, pickups, cart, cartTotal, cartCount, onAddToCart, onUpdateQty, onShowDetail, onCheckout }) {
  const activeProducts = products.filter(p => p.active)

  return (
    <div>
      {/* Hero */}
      <div style={{
        padding: '56px 32px 48px',
        background: `linear-gradient(180deg, var(--paper) 0%, var(--cream) 100%)`,
        textAlign: 'center', borderBottom: '1px solid var(--line)'
      }}>
        <div className="sans" style={{
          fontSize: '10px', letterSpacing: '4px', color: 'var(--caramel)',
          fontWeight: 600, marginBottom: '18px', textTransform: 'uppercase'
        }}>Handmade · Est. 2024</div>
        <h1 className="serif" style={{
          fontSize: '42px', fontWeight: 400, margin: '0 0 14px 0',
          color: 'var(--ink)', letterSpacing: '-1px', lineHeight: 1.1
        }}>{settings.shopName}</h1>
        <div style={{ width: '32px', height: '1px', background: 'var(--caramel)', margin: '16px auto' }} />
        <p className="sans" style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, letterSpacing: '1.5px' }}>
          {settings.subtitle}
        </p>
      </div>

      {/* Story */}
      <div style={{ padding: '36px 32px', textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
        <p className="sans" style={{ fontSize: '14px', lineHeight: 1.9, color: 'var(--cocoa)', margin: 0 }}>
          {settings.story}
        </p>
      </div>

      {/* Products */}
      <div style={{ padding: '20px 20px 32px', background: 'var(--cream)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px', paddingTop: '16px' }}>
          <div className="sans" style={{
            fontSize: '10px', letterSpacing: '3px', color: 'var(--caramel)',
            fontWeight: 600, marginBottom: '6px'
          }}>OUR MENU</div>
          <h2 className="serif" style={{ fontSize: '28px', margin: 0, color: 'var(--ink)', fontWeight: 400 }}>
            本週手作甜點
          </h2>
        </div>
        {activeProducts.length === 0 ? (
          <div className="sans" style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)' }}>
            目前暫無商品
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '18px'
          }}>
            {activeProducts.map(p => (
              <ProductCard key={p.id} product={p} cart={cart}
                onAddToCart={onAddToCart} onUpdateQty={onUpdateQty} onShowDetail={onShowDetail} />
            ))}
          </div>
        )}
      </div>

      {/* Sticky Cart Bar */}
      {cart.length > 0 && (
        <div style={{
          background: 'var(--ink)', color: 'var(--paper)',
          padding: '16px 22px', position: 'sticky', bottom: 0,
          boxShadow: '0 -8px 24px rgba(0,0,0,0.12)', zIndex: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div className="sans">
              <div style={{ fontSize: '11px', color: 'var(--soft-muted)', letterSpacing: '1.5px', marginBottom: '2px' }}>
                YOUR CART · {cartCount} 件
              </div>
              <div style={{ fontSize: '20px', fontWeight: 500 }}>NT$ {cartTotal}</div>
            </div>
            <button onClick={onCheckout} className="sans btn-primary" style={{
              padding: '11px 26px', background: 'var(--paper)', color: 'var(--ink)',
              border: 'none', borderRadius: '6px',
              fontWeight: 600, fontSize: '13px', cursor: 'pointer', letterSpacing: '0.5px'
            }}>前往結帳</button>
          </div>
        </div>
      )}

      {/* How to Order */}
      <div style={{ padding: '40px 28px', background: 'var(--paper)', borderTop: '1px solid var(--line)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="sans" style={{
            fontSize: '10px', letterSpacing: '3px', color: 'var(--caramel)',
            fontWeight: 600, marginBottom: '6px'
          }}>HOW TO ORDER</div>
          <h3 className="serif" style={{ fontSize: '22px', margin: 0, color: 'var(--ink)', fontWeight: 400 }}>
            訂購與取貨
          </h3>
        </div>
        <div className="sans" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '14px', maxWidth: '620px', margin: '0 auto'
        }}>
          {[
            { n: '01', t: '線上下單', d: '選擇喜愛的甜點加入購物車' },
            { n: '02', t: '預購制', d: `取貨前 ${settings.leadDays} 天截止訂購` },
            { n: '03', t: '取貨日', d: `${pickups.filter(p => p.active).length} 個固定取貨時段` },
            { n: '04', t: '取貨付款', d: '取貨時直接付現' }
          ].map(s => (
            <div key={s.n} style={{ padding: '20px 14px', textAlign: 'center' }}>
              <div className="serif" style={{ fontSize: '22px', color: 'var(--caramel)', fontWeight: 300, marginBottom: '10px' }}>
                {s.n}
              </div>
              <div style={{ width: '20px', height: '1px', background: 'var(--line)', margin: '0 auto 10px' }} />
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>{s.t}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '28px 28px 24px', background: 'var(--ink)', color: 'var(--paper)', textAlign: 'center' }}>
        <div className="script" style={{ fontSize: '22px', color: 'var(--paper)', marginBottom: '4px' }}>
          {settings.shopName}
        </div>
        <div className="sans" style={{ fontSize: '11px', color: 'var(--soft-muted)', letterSpacing: '1px', marginBottom: '12px' }}>
          {settings.tagline}
        </div>
        <div className="sans" style={{ fontSize: '11px', color: 'var(--soft-muted)' }}>
          {[
            settings.contactLine && `LINE ${settings.contactLine}`,
            settings.contactPhone && `Tel ${settings.contactPhone}`,
            '© 2025'
          ].filter(Boolean).join('  ·  ')}
        </div>
      </div>
    </div>
  )
}
