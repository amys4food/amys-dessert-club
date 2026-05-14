export default function CartItem({ item, isLast, onUpdateQty, onRemove }) {
  return (
    <div className="sans" style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '16px 20px',
      borderBottom: isLast ? 'none' : '1px solid var(--line)'
    }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '8px',
        background: 'var(--ivory)', flexShrink: 0, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '34px'
      }}>
        {item.image
          ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : item.emoji || '🍰'
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {item.tagline && (
          <div style={{
            fontSize: '9px', letterSpacing: '1.5px', color: 'var(--caramel)',
            fontWeight: 600, textTransform: 'uppercase', marginBottom: '3px'
          }}>{item.tagline}</div>
        )}
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px', lineHeight: 1.3 }}>
          {item.name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
          NT$ {item.price} /份
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'var(--cream)', borderRadius: '6px',
          border: '1px solid var(--line)', overflow: 'hidden'
        }}>
          <button onClick={() => onUpdateQty(-1)} className="cart-qty-btn" disabled={item.qty <= 1}
            style={cartBtnStyle(item.qty <= 1)}>−</button>
          <div style={{ minWidth: '32px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', padding: '0 6px' }}>
            {item.qty}
          </div>
          <button onClick={() => onUpdateQty(1)} className="cart-qty-btn" disabled={item.qty >= item.max}
            style={cartBtnStyle(item.qty >= item.max)}>+</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>
            NT$ {item.price * item.qty}
          </div>
          <button onClick={onRemove} className="remove-btn" title="移除" style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--soft-muted)', fontSize: '14px', padding: '2px 4px'
          }}>✕</button>
        </div>
      </div>
    </div>
  )
}

function cartBtnStyle(disabled) {
  return {
    width: '30px', height: '30px', background: 'transparent', border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '16px', color: 'var(--ink)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }
}
