export default function ProductCard({ product, cart, onAddToCart, onUpdateQty, onShowDetail }) {
  const soldOut = product.stock <= 0
  const low = product.stock > 0 && product.stock <= 3
  const inCart = cart.find(i => i.id === product.id)
  const qty = inCart ? inCart.qty : 0
  const atMax = qty >= product.stock

  return (
    <div className="pcard" style={{
      background: 'var(--paper)', borderRadius: '10px', overflow: 'hidden',
      border: '1px solid var(--line)', display: 'flex', flexDirection: 'column'
    }}>
      <div onClick={() => onShowDetail(product)} style={{
        aspectRatio: '4/3', background: 'var(--ivory)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', cursor: 'pointer'
      }}>
        {product.image
          ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '72px', opacity: 0.85 }}>{product.emoji || '🍰'}</span>
        }
        {product.tag && (
          <div className="sans" style={{
            position: 'absolute', top: '12px', left: '12px',
            background: 'var(--paper)', color: 'var(--brick-dark)',
            fontSize: '10px', fontWeight: 600, letterSpacing: '1.2px',
            padding: '4px 10px', borderRadius: '3px', textTransform: 'uppercase'
          }}>
            {product.tag}
          </div>
        )}
        {soldOut && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(45,26,16,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span className="sans" style={{
              background: 'var(--paper)', color: 'var(--ink)',
              padding: '6px 18px', borderRadius: '3px',
              fontSize: '11px', fontWeight: 600, letterSpacing: '2px'
            }}>SOLD OUT</span>
          </div>
        )}
        {low && !soldOut && (
          <div className="sans" style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'var(--brick)', color: 'var(--paper)',
            fontSize: '10px', padding: '3px 9px', borderRadius: '3px',
            fontWeight: 600
          }}>剩 {product.stock}</div>
        )}
      </div>

      <div onClick={() => onShowDetail(product)} style={{
        padding: '16px 18px 12px', flex: 1, display: 'flex', flexDirection: 'column', cursor: 'pointer'
      }}>
        {product.tagline && (
          <div className="sans" style={{
            fontSize: '9px', letterSpacing: '2px', color: 'var(--caramel)',
            textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600
          }}>{product.tagline}</div>
        )}
        <h3 className="serif" style={{ fontSize: '16px', fontWeight: 500, margin: '0 0 8px 0', color: 'var(--ink)', lineHeight: 1.3 }}>
          {product.name}
        </h3>
        <p className="sans" style={{
          fontSize: '12px', color: 'var(--muted)', margin: '0 0 10px 0',
          lineHeight: 1.7, flex: 1, display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>{product.desc}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span className="sans" style={{ fontSize: '10px', color: 'var(--muted)' }}>NT$ </span>
          <span className="serif" style={{ fontSize: '20px', fontWeight: 500, color: 'var(--ink)' }}>{product.price}</span>
        </div>
      </div>

      <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--line)', marginTop: 'auto' }}>
        {soldOut ? (
          <div className="sans" style={{
            marginTop: '12px', padding: '10px', textAlign: 'center',
            background: 'var(--cream)', color: 'var(--muted)',
            borderRadius: '6px', fontSize: '12px', fontWeight: 600, letterSpacing: '1.5px'
          }}>SOLD OUT</div>
        ) : qty === 0 ? (
          <button onClick={() => onAddToCart(product)} className="sans btn-primary" style={{
            marginTop: '12px', width: '100%', padding: '10px',
            background: 'var(--ink)', color: 'var(--paper)',
            border: 'none', borderRadius: '6px',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer', letterSpacing: '1.5px'
          }}>+ 加入購物車</button>
        ) : (
          <div className="sans" style={{
            marginTop: '12px', display: 'flex', alignItems: 'center',
            background: 'var(--ink)', borderRadius: '6px', overflow: 'hidden'
          }}>
            <button onClick={() => onUpdateQty(product.id, -1)} className="qty-btn" style={qtyButtonStyle()}>−</button>
            <div style={{
              flex: 1.2, textAlign: 'center', color: 'var(--paper)',
              fontSize: '14px', fontWeight: 600,
              borderLeft: '1px solid rgba(255,255,255,0.15)',
              borderRight: '1px solid rgba(255,255,255,0.15)',
              padding: '10px 0'
            }}>{qty} 份</div>
            <button onClick={() => onUpdateQty(product.id, 1)} className="qty-btn" disabled={atMax}
              style={{ ...qtyButtonStyle(), cursor: atMax ? 'not-allowed' : 'pointer', opacity: atMax ? 0.35 : 1 }}>+</button>
          </div>
        )}
      </div>
    </div>
  )
}

function qtyButtonStyle() {
  return {
    flex: 1, padding: '10px 0', background: 'transparent',
    border: 'none', color: 'var(--paper)', fontSize: '18px',
    cursor: 'pointer', fontWeight: 300,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }
}
