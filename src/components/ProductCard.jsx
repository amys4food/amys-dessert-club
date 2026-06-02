import { Heart, Crown, Star } from './HandDrawnDecor'

const DECOR_ICONS = [Heart, Crown, Star, Heart]
const DECOR_COLORS = ['#e63946', '#4a89dc', '#4a89dc', '#ff8c42']

/**
 * 商品卡 - 統一版
 * 
 * 改動重點:
 * 1. 拿掉「+ 加入購物車」直接加購按鈕(避免顧客誤點)
 * 2. 拿掉卡片上的數量加減按鈕(統一在彈窗操作)
 * 3. 改成「查看詳情」按鈕,點了開啟彈窗
 * 4. 如果商品已在購物車,顯示「購物車已有 X 份」提示
 */
export default function ProductCard({ product, index = 0, cart, onShowDetail }) {
  const soldOut = product.stock <= 0
  const low = product.stock > 0 && product.stock <= 3
  const inCart = cart.find(i => i.id === product.id)
  const qtyInCart = inCart ? inCart.qty : 0

  // 裝飾圖示
  const DecorIcon = DECOR_ICONS[index % DECOR_ICONS.length]
  const decorColor = DECOR_COLORS[index % DECOR_COLORS.length]

  return (
    <div className="pcard product-card" onClick={() => onShowDetail(product)}
      style={{ cursor: 'pointer' }}>
      {/* 手繪裝飾 */}
      <div style={{ position: 'absolute', top: '10px', right: '14px', zIndex: 2 }}>
        <DecorIcon size={22} color={decorColor} />
      </div>

      {/* 標籤 */}
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

      {/* 圖片 */}
      <div style={{
        aspectRatio: '1/1', background: 'var(--cream-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', padding: '20px'
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

        {/* 已在購物車徽章 */}
        {qtyInCart > 0 && (
          <div className="fredoka" style={{
            position: 'absolute', bottom: '8px', left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--orange)', color: '#fff',
            fontSize: '10px', fontWeight: 700,
            padding: '3px 10px', borderRadius: '999px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }}>🛒 已加入 {qtyInCart}</div>
        )}
      </div>

      {/* 文字 */}
      <div style={{
        padding: '14px 16px 12px', flex: 1, display: 'flex', flexDirection: 'column',
        textAlign: 'center'
      }}>
        <h3 className="fredoka" style={{
          fontSize: '15px', fontWeight: 600, margin: '0 0 6px 0',
          color: 'var(--brown)', lineHeight: 1.3
        }}>{product.name}</h3>
        <div className="fredoka" style={{
          fontSize: '20px', fontWeight: 700, color: 'var(--orange-dark)'
        }}>${product.price}</div>
      </div>

      {/* 統一按鈕:查看詳情 */}
      <div style={{ padding: '0 14px 14px' }}>
        {soldOut ? (
          <div className="fredoka" style={{
            padding: '10px', textAlign: 'center',
            background: 'var(--cream-light)', color: 'var(--muted)',
            borderRadius: '999px', fontSize: '12px', fontWeight: 600
          }}>已售完</div>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); onShowDetail(product) }}
            className="fredoka btn-orange" style={{
              width: '100%', padding: '10px',
              background: qtyInCart > 0 ? '#fff' : 'var(--orange)',
              color: qtyInCart > 0 ? 'var(--orange-dark)' : '#fff',
              border: qtyInCart > 0 ? '2px solid var(--orange)' : 'none',
              borderRadius: '999px',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer'
            }}>
            {qtyInCart > 0 ? '查看 / 加購' : '選擇數量'}
          </button>
        )}
      </div>
    </div>
  )
}
