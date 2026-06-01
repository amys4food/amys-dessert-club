import { Heart, Crown, Star, Sparkles } from './HandDrawnDecor'

const DECOR_ICONS = [Heart, Crown, Star, Heart]
const DECOR_COLORS = ['#e63946', '#4a89dc', '#4a89dc', '#ff8c42']

export default function ProductCard({ product, index = 0, cart, onAddToCart, onUpdateQty, onShowDetail }) {
  const soldOut = product.stock <= 0
  const low = product.stock > 0 && product.stock <= 3
  const inCart = cart.find(i => i.id === product.id)
  const qty = inCart ? inCart.qty : 0
  const atMax = qty >= product.stock

  // 為每張卡選一個裝飾圖示
  const DecorIcon = DECOR_ICONS[index % DECOR_ICONS.length]
  const decorColor = DECOR_COLORS[index % DECOR_COLORS.length]

  return (
    <div className="pcard product-card">
      {/* 手繪裝飾(右上角) */}
      <div style={{ position: 'absolute', top: '10px', right: '14px', zIndex: 2 }}>
        <DecorIcon size={22} color={decorColor} />
      </div>

      {/* 標籤(左上角) */}
      {product.tag && !soldOut && (
        <div style={{
          position: 'absolute', top: '10px', left: '10px', zIndex: 2,
          background: '#fff', color: 'var(--orange-dark)',
          fontSize: '10px', fontWeight: 700,
          padding: '4px 10px', borderRadius: '999px',
          border: '1.5px solid var(--orange)',
          fontFamily: 'Fredoka, sans-serif'
        }}>{product.tag}</div>
      )}

      {/* 商品圖片 */}
      <div onClick={() => onShowDetail(product)} style={{
        aspectRatio: '1/1', background: 'var(--cream-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
        padding: '20px'
      }}>
        {product.image
          ? <img src={product.image} alt={product.name} style={{ width: '90%', height: '90%', objectFit: 'cover', borderRadius: '50%' }} />
          : <div style={{
              width: '100%', aspectRatio: '1/1', borderRadius: '50%',
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '64px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
            }}>{product.emoji || '🍰'}</div>
        }
        {soldOut && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(45,26,16,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span className="fredoka" style={{
              background: '#fff', color: 'var(--ink)',
              padding: '6px 18px', borderRadius: '999px',
              fontSize: '13px', fontWeight: 700, letterSpacing: '1px'
            }}>SOLD OUT</span>
          </div>
        )}
        {low && !soldOut && (
          <div className="fredoka" style={{
            position: 'absolute', top: '50%', right: '8px',
            background: 'var(--red)', color: '#fff',
            fontSize: '10px', padding: '4px 10px', borderRadius: '999px',
            fontWeight: 700
          }}>剩 {product.stock}</div>
        )}
      </div>

      {/* 文字 */}
      <div onClick={() => onShowDetail(product)} style={{
        padding: '14px 16px 12px', flex: 1, display: 'flex', flexDirection: 'column',
        cursor: 'pointer', textAlign: 'center'
      }}>
        <h3 className="fredoka" style={{
          fontSize: '15px', fontWeight: 600, margin: '0 0 6px 0',
          color: 'var(--brown)', lineHeight: 1.3
        }}>{product.name}</h3>
        <div className="fredoka" style={{
          fontSize: '20px', fontWeight: 700, color: 'var(--orange-dark)'
        }}>${product.price}</div>
      </div>

      {/* 數量增減 / 加入購物車按鈕 */}
      <div style={{ padding: '0 14px 14px' }}>
        {soldOut ? (
          <div className="fredoka" style={{
            padding: '10px', textAlign: 'center',
            background: 'var(--cream-light)', color: 'var(--muted)',
            borderRadius: '999px', fontSize: '12px', fontWeight: 600
          }}>已售完</div>
        ) : qty === 0 ? (
          <button onClick={() => onAddToCart(product)} className="fredoka btn-orange" style={{
            width: '100%', padding: '10px',
            background: 'var(--orange)', color: '#fff',
            border: 'none', borderRadius: '999px',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer'
          }}>+ 加入購物車</button>
        ) : (
          <div className="fredoka" style={{
            display: 'flex', alignItems: 'center',
            background: 'var(--orange)', borderRadius: '999px', overflow: 'hidden'
          }}>
            <button onClick={() => onUpdateQty(product.id, -1)} className="qty-btn" style={qtyBtnStyle()}>−</button>
            <div style={{
              flex: 1.2, textAlign: 'center', color: '#fff',
              fontSize: '14px', fontWeight: 700, padding: '10px 0',
              borderLeft: '1px solid rgba(255,255,255,0.25)',
              borderRight: '1px solid rgba(255,255,255,0.25)'
            }}>{qty}</div>
            <button onClick={() => onUpdateQty(product.id, 1)} className="qty-btn" disabled={atMax}
              style={{ ...qtyBtnStyle(), cursor: atMax ? 'not-allowed' : 'pointer', opacity: atMax ? 0.4 : 1 }}>+</button>
          </div>
        )}
      </div>
    </div>
  )
}

function qtyBtnStyle() {
  return {
    flex: 1, padding: '10px 0', background: 'transparent',
    border: 'none', color: '#fff', fontSize: '18px',
    cursor: 'pointer', fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }
}
