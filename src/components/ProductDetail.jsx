export default function ProductDetail({ product, cart, onClose, onAdd, onUpdateQty }) {
  const inCart = cart.find(i => i.id === product.id)
  const qty = inCart ? inCart.qty : 0
  const atMax = qty >= product.stock
  const soldOut = product.stock <= 0

  return (
    <div onClick={onClose} className="modal-overlay">
      <div onClick={e => e.stopPropagation()} className="modal-box">
        <div style={{
          aspectRatio: '1/1', background: 'var(--cream-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', padding: '30px'
        }}>
          {product.image
            ? <img src={product.image} style={{ width: '85%', height: '85%', objectFit: 'cover', borderRadius: '50%' }} />
            : <div style={{
                width: '85%', aspectRatio: '1/1', borderRadius: '50%',
                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '120px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
              }}>{product.emoji || '🍰'}</div>
          }
          <button onClick={onClose} style={{
            position: 'absolute', top: '14px', right: '14px',
            background: '#fff', border: 'none',
            width: '36px', height: '36px', borderRadius: '50%',
            cursor: 'pointer', fontSize: '16px', color: 'var(--ink)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>✕</button>
        </div>
        <div style={{ padding: '24px' }}>
          {product.tagline && (
            <div className="fredoka" style={{
              fontSize: '11px', letterSpacing: '2px', color: 'var(--orange-dark)',
              fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px'
            }}>{product.tagline}</div>
          )}
          <h2 className="fredoka" style={{
            fontSize: '24px', margin: '0 0 12px 0', color: 'var(--brown)',
            fontWeight: 700, lineHeight: 1.2
          }}>{product.name}</h2>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px',
            paddingBottom: '16px', borderBottom: '2px dashed var(--line)'
          }}>
            <span className="fredoka" style={{ fontSize: '32px', fontWeight: 700, color: 'var(--orange-dark)' }}>${product.price}</span>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>庫存 {product.stock} 份</span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--brown)', lineHeight: 1.8, margin: '0 0 22px 0' }}>
            {product.desc}
          </p>
          {soldOut ? (
            <button disabled className="fredoka" style={{
              width: '100%', padding: '14px',
              background: 'var(--soft-muted)', color: '#fff',
              border: 'none', borderRadius: '999px',
              fontSize: '14px', fontWeight: 600, cursor: 'not-allowed'
            }}>已售完</button>
          ) : qty === 0 ? (
            <button onClick={onAdd} className="fredoka btn-orange" style={{
              width: '100%', padding: '14px',
              background: 'var(--orange)', color: '#fff',
              border: 'none', borderRadius: '999px',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer'
            }}>加入購物車</button>
          ) : (
            <div className="fredoka" style={{
              display: 'flex', alignItems: 'center',
              background: 'var(--orange)', borderRadius: '999px', overflow: 'hidden'
            }}>
              <button onClick={() => onUpdateQty(-1)} className="qty-btn" style={qtyBtnStyle()}>−</button>
              <div style={{
                flex: 1.4, textAlign: 'center', color: '#fff',
                fontSize: '16px', fontWeight: 700, padding: '14px 0',
                borderLeft: '1px solid rgba(255,255,255,0.25)',
                borderRight: '1px solid rgba(255,255,255,0.25)'
              }}>{qty} 份</div>
              <button onClick={() => onUpdateQty(1)} className="qty-btn" disabled={atMax}
                style={{ ...qtyBtnStyle(), cursor: atMax ? 'not-allowed' : 'pointer', opacity: atMax ? 0.4 : 1 }}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function qtyBtnStyle() {
  return {
    flex: 1, padding: '14px 0', background: 'transparent',
    border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer'
  }
}
