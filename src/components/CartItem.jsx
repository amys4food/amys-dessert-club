export default function CartItem({ item, isLast, onUpdateQty, onRemove }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '14px 16px',
      borderBottom: isLast ? 'none' : '1px dashed var(--line)'
    }}>
      <div style={{
        width: '60px', height: '60px', borderRadius: '50%',
        background: 'var(--cream-light)', flexShrink: 0, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px'
      }}>
        {item.image
          ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : item.emoji || '🍰'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="fredoka" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--brown)', marginBottom: '4px', lineHeight: 1.3 }}>
          {item.name}
        </div>
        <div className="fredoka" style={{ fontSize: '14px', color: 'var(--orange-dark)', fontWeight: 700 }}>
          ${item.price} <span style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: 400 }}>/份</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'var(--cream-light)', borderRadius: '999px',
          border: '1.5px solid var(--line)', overflow: 'hidden'
        }}>
          <button onClick={() => onUpdateQty(-1)} className="cart-qty-btn" disabled={item.qty <= 1} style={btnStyle(item.qty <= 1)}>−</button>
          <div className="fredoka" style={{ minWidth: '28px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--brown)' }}>
            {item.qty}
          </div>
          <button onClick={() => onUpdateQty(1)} className="cart-qty-btn" disabled={item.qty >= item.max} style={btnStyle(item.qty >= item.max)}>+</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="fredoka" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brown)' }}>
            ${item.price * item.qty}
          </div>
          <button onClick={onRemove} className="remove-btn" style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--soft-muted)', fontSize: '14px', padding: '2px 4px'
          }}>✕</button>
        </div>
      </div>
    </div>
  )
}

function btnStyle(disabled) {
  return {
    width: '28px', height: '28px', background: 'transparent', border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '15px', color: 'var(--brown)', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }
}
