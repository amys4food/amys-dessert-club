import { useState, useEffect } from 'react'

/**
 * 商品詳細彈窗 - 重新設計版
 * 
 * 改動重點:
 * 1. 數量選擇器只是「暫存選擇」,不會直接加入購物車
 * 2. 底部主要按鈕「加入購物車｜NT$XXX」明確顯示總價
 * 3. 顯示已在購物車的數量
 * 4. 加入成功後自動關閉,並顯示 toast 提示
 * 5. 新增規格/保存方式/過敏原 3 個資訊區
 */
export default function ProductDetail({ product, cart, onClose, onAddToCart }) {
  // 彈窗內的暫存數量(不是購物車數量!)
  const [selectedQty, setSelectedQty] = useState(1)

  // 已在購物車的數量(只用來顯示,不影響暫存數量)
  const inCart = cart.find(i => i.id === product.id)
  const alreadyInCart = inCart ? inCart.qty : 0

  // 剩餘可加入數量(扣掉已在購物車的)
  const maxCanAdd = Math.max(0, product.stock - alreadyInCart)
  const soldOut = product.stock <= 0
  const fullyInCart = !soldOut && maxCanAdd === 0

  // 暫存數量不能超過可加入上限
  useEffect(() => {
    if (selectedQty > maxCanAdd && maxCanAdd > 0) {
      setSelectedQty(maxCanAdd)
    }
  }, [maxCanAdd])

  // 鎖定背景捲動
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [])

  function decrease() {
    if (selectedQty > 1) setSelectedQty(selectedQty - 1)
  }
  function increase() {
    if (selectedQty < maxCanAdd) setSelectedQty(selectedQty + 1)
  }

  function handleAdd() {
    if (soldOut || fullyInCart) return
    onAddToCart(product, selectedQty)
    // 加入後不要 reset selectedQty,因為彈窗會關閉
  }

  const totalPrice = product.price * selectedQty
  const atMax = selectedQty >= maxCanAdd

  return (
    <div onClick={onClose} className="modal-overlay">
      <div onClick={e => e.stopPropagation()} className="modal-box">
        {/* 商品照片 */}
        <div style={{
          aspectRatio: '1/1', background: 'var(--cream-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', padding: '30px'
        }}>
          {product.image
            ? <img src={product.image} alt={product.name} style={{ width: '85%', height: '85%', objectFit: 'cover', borderRadius: '50%' }} />
            : <div style={{
                width: '85%', aspectRatio: '1/1', borderRadius: '50%',
                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '120px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
              }}>{product.emoji || '🍰'}</div>
          }
          <button onClick={onClose} aria-label="關閉" style={{
            position: 'absolute', top: '14px', right: '14px',
            background: '#fff', border: 'none',
            width: '36px', height: '36px', borderRadius: '50%',
            cursor: 'pointer', fontSize: '16px', color: 'var(--ink)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>✕</button>

          {/* 已在購物車的標示 */}
          {alreadyInCart > 0 && (
            <div className="fredoka" style={{
              position: 'absolute', top: '14px', left: '14px',
              background: 'var(--orange)', color: '#fff',
              padding: '6px 14px', borderRadius: '999px',
              fontSize: '12px', fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>🛒 購物車已有 {alreadyInCart}</div>
          )}
        </div>

        {/* 商品內容 */}
        <div style={{ padding: '24px' }}>
          {product.tagline && (
            <div className="fredoka" style={{
              fontSize: '11px', letterSpacing: '2px', color: 'var(--orange-dark)',
              fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px'
            }}>{product.tagline}</div>
          )}

          {/* 名稱 */}
          <h2 className="fredoka" style={{
            fontSize: '24px', margin: '0 0 12px 0', color: 'var(--brown)',
            fontWeight: 700, lineHeight: 1.2
          }}>{product.name}</h2>

          {/* 價格 + 庫存 */}
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px',
            paddingBottom: '16px', borderBottom: '2px dashed var(--line)',
            flexWrap: 'wrap'
          }}>
            <span className="fredoka" style={{ fontSize: '32px', fontWeight: 700, color: 'var(--orange-dark)' }}>
              ${product.price}
            </span>
            <span style={{
              fontSize: '12px',
              color: soldOut ? 'var(--red)' : product.stock <= 3 ? 'var(--orange-dark)' : 'var(--muted)',
              fontWeight: 600
            }}>
              {soldOut ? '已售完' : `剩餘 ${product.stock} 份`}
            </span>
          </div>

          {/* 商品描述 */}
          {product.desc && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', color: 'var(--brown)', lineHeight: 1.8, margin: 0 }}>
                {product.desc}
              </p>
            </div>
          )}

          {/* 規格 / 保存方式 / 過敏原 - 只有填了才顯示 */}
          {(product.specs || product.storage || product.allergens) && (
            <div style={{
              background: 'var(--cream-light)',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '20px',
              border: '1px dashed var(--line)'
            }}>
              {product.specs && <InfoRow label="📏 規格/尺寸" value={product.specs} />}
              {product.storage && <InfoRow label="🧊 保存方式" value={product.storage} />}
              {product.allergens && <InfoRow label="⚠️ 過敏原" value={product.allergens} important />}
            </div>
          )}

          {/* 售完或全部已加入購物車的狀態 */}
          {soldOut ? (
            <button disabled className="fredoka" style={{
              width: '100%', padding: '16px',
              background: 'var(--soft-muted)', color: '#fff',
              border: 'none', borderRadius: '999px',
              fontSize: '14px', fontWeight: 700, cursor: 'not-allowed'
            }}>已售完</button>
          ) : fullyInCart ? (
            <button disabled className="fredoka" style={{
              width: '100%', padding: '16px',
              background: 'var(--soft-muted)', color: '#fff',
              border: 'none', borderRadius: '999px',
              fontSize: '14px', fontWeight: 700, cursor: 'not-allowed'
            }}>已全部加入購物車({alreadyInCart} 份)</button>
          ) : (
            <>
              {/* 數量選擇器 */}
              <div style={{ marginBottom: '14px' }}>
                <div className="fredoka" style={{
                  fontSize: '12px', color: 'var(--brown)', fontWeight: 600,
                  marginBottom: '10px', letterSpacing: '0.5px'
                }}>選擇數量</div>

                <div className="fredoka" style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  background: 'var(--cream-light)',
                  borderRadius: '999px', padding: '6px',
                  border: '2px solid var(--line)'
                }}>
                  <button onClick={decrease} disabled={selectedQty <= 1}
                    aria-label="減少數量"
                    style={qtyBtnStyle(selectedQty <= 1)}>−</button>

                  <div style={{
                    flex: 1, textAlign: 'center',
                    fontSize: '22px', fontWeight: 700, color: 'var(--brown)'
                  }}>{selectedQty}</div>

                  <button onClick={increase} disabled={atMax}
                    aria-label="增加數量"
                    style={qtyBtnStyle(atMax)}>+</button>
                </div>

                {atMax && maxCanAdd < product.stock && (
                  <div style={{
                    fontSize: '11px', color: 'var(--orange-dark)',
                    marginTop: '8px', textAlign: 'center'
                  }}>
                    最多可再加入 {maxCanAdd} 份(購物車已有 {alreadyInCart} 份)
                  </div>
                )}
              </div>

              {/* 主要按鈕:加入購物車｜NT$XXX */}
              <button onClick={handleAdd} className="fredoka btn-orange" style={{
                width: '100%', padding: '16px',
                background: 'var(--orange)', color: '#fff',
                border: 'none', borderRadius: '999px',
                fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255,140,66,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '6px'
              }}>
                <span>加入購物車</span>
                <span style={{ opacity: 0.6 }}>｜</span>
                <span>NT$ {totalPrice}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, important }) {
  return (
    <div style={{
      display: 'flex', gap: '8px',
      marginBottom: '8px', fontSize: '13px',
      flexWrap: 'wrap'
    }}>
      <span style={{
        color: important ? 'var(--red)' : 'var(--brown)',
        fontWeight: 600,
        flexShrink: 0
      }}>{label}:</span>
      <span style={{
        color: important ? 'var(--red)' : 'var(--brown)',
        flex: 1, lineHeight: 1.6
      }}>{value}</span>
    </div>
  )
}

function qtyBtnStyle(disabled) {
  return {
    width: '44px', height: '44px',
    background: disabled ? 'var(--cream-light)' : 'var(--orange)',
    color: disabled ? 'var(--soft-muted)' : '#fff',
    border: 'none', borderRadius: '50%',
    fontSize: '22px', fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 0.1s',
    flexShrink: 0
  }
}
