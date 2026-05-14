export default function ProductDetail({ product, cart, onClose, onAdd, onUpdateQty }) {
  const inCart = cart.find(i => i.id === product.id)
  const qty = inCart ? inCart.qty : 0
  const atMax = qty >= product.stock
  const soldOut = product.stock <= 0

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(45,26,16,0.55)',
      zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--paper)', borderRadius: '10px',
        maxWidth: '440px', width: '100%', maxHeight: '92vh', overflowY: 'auto',
        border: '1px solid var(--line)', overflow: 'hidden'
      }}>
        <div style={{
          aspectRatio: '4/3', background: 'var(--ivory)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden'
        }}>
          {product.image
            ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: '120px', opacity: 0.9 }}>{product.emoji || '🍰'}</span>
          }
          <button onClick={onClose} style={{
            position: 'absolute', top: '14px', right: '14px',
            background: 'var(--paper)', border: 'none',
            width: '32px', height: '32px', borderRadius: '50%',
            cursor: 'pointer', fontSize: '14px', color: 'var(--ink)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}>✕</button>
        </div>
        <div style={{ padding: '24px' }}>
          {product.tagline && (
            <div className="sans" style={{
              fontSize: '10px', letterSpacing: '2.5px', color: 'var(--caramel)',
              fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px'
            }}>{product.tagline}</div>
          )}
          <h2 className="serif" style={{ fontSize: '22px', margin: '0 0 12px 0', color: 'var(--ink)', fontWeight: 500, lineHeight: 1.3 }}>
            {product.name}
          </h2>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: '12px',
            marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--line)'
          }}>
            <span className="serif" style={{ fontSize: '26px', fontWeight: 500, color: 'var(--ink)' }}>NT$ {product.price}</span>
            <span className="sans" style={{ fontSize: '12px', color: 'var(--muted)' }}>庫存 {product.stock} 份</span>
          </div>
          <p className="sans" style={{ fontSize: '14px', color: 'var(--cocoa)', lineHeight: 1.9, margin: '0 0 22px 0' }}>
            {product.desc}
          </p>
          {soldOut ? (
            <button disabled className="sans" style={{
              width: '100%', padding: '13px',
              background: 'var(--soft-muted)', color: 'var(--paper)',
              border: 'none', borderRadius: '6px',
              fontSize: '13px', fontWeight: 600, cursor: 'not-allowed', letterSpacing: '1.5px'
            }}>SOLD OUT</button>
          ) : qty === 0 ? (
            <button onClick={onAdd} className="sans btn-primary" style={{
              width: '100%', padding: '13px',
              background: 'var(--ink)', color: 'var(--paper)',
              border: 'none', borderRadius: '6px',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', letterSpacing: '1.5px'
            }}>加入購物車</button>
          ) : (
            <div className="sans" style={{
              display: 'flex', alignItems: 'center',
              background: 'var(--ink)', borderRadius: '6px', overflow: 'hidden'
            }}>
              <button onClick={() => onUpdateQty(-1)} className="qty-btn" style={qtyBigBtnStyle()}>−</button>
              <div style={{
                flex: 1.4, textAlign: 'center', color: 'var(--paper)',
                fontSize: '15px', fontWeight: 600,
                borderLeft: '1px solid rgba(255,255,255,0.15)',
                borderRight: '1px solid rgba(255,255,255,0.15)',
                padding: '13px 0'
              }}>{qty} 份</div>
              <button onClick={() => onUpdateQty(1)} className="qty-btn" disabled={atMax}
                style={{ ...qtyBigBtnStyle(), cursor: atMax ? 'not-allowed' : 'pointer', opacity: atMax ? 0.35 : 1 }}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function qtyBigBtnStyle() {
  return {
    flex: 1, padding: '13px 0', background: 'transparent',
    border: 'none', color: 'var(--paper)', fontSize: '20px', cursor: 'pointer'
  }
}
