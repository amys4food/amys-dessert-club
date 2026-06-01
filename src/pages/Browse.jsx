import ProductCard from '../components/ProductCard'
import { Heart, Crown, Star, Sparkles, Squiggle, Cloud, Badge } from '../components/HandDrawnDecor'

export default function Browse({ settings, products, pickups, cart, cartTotal, cartCount, onAddToCart, onUpdateQty, onShowDetail, onCheckout }) {
  const activeProducts = products.filter(p => p.active)

  return (
    <div className="responsive-container">
      {/* ============ HERO 區塊 ============ */}
      <div style={{ background: 'var(--cream-bg)', padding: '24px 20px 40px', position: 'relative', overflow: 'hidden' }}>
        {/* 裝飾:左邊小愛心 */}
        <div style={{ position: 'absolute', top: '160px', left: '8px', opacity: 0.7 }}>
          <Heart size={28} color="#4a89dc" />
        </div>
        {/* 裝飾:右上「Made with love」 */}
        <div style={{ position: 'absolute', top: '60px', right: '12px', zIndex: 3 }}>
          <Cloud color="#4a89dc"><span className="fredoka">♡ MADE<br/>WITH LOVE!</span></Cloud>
        </div>

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* 標題 */}
          <div style={{ position: 'relative', textAlign: 'left', paddingTop: '60px' }}>
            {/* 星芒裝飾 */}
            <div style={{ position: 'absolute', top: '40px', left: '-10px' }}>
              <Sparkles color="#ffd23f" />
            </div>
            <div style={{ position: 'absolute', top: '30px', right: '120px' }}>
              <Sparkles color="#ff8c42" />
            </div>

            <h1 className="hero-title" style={{
              fontSize: 'clamp(48px, 14vw, 80px)',
              margin: 0, color: 'var(--blue-dark)',
              textShadow: '3px 3px 0 #fff'
            }}>
              <span style={{ color: 'var(--blue-dark)' }}>AMY'S</span><br/>
              <span style={{ color: 'var(--orange-dark)' }}>DESSERT</span><br/>
              <span style={{ color: 'var(--yellow)', textShadow: '3px 3px 0 #f7c800' }}>CLUB</span>
            </h1>

            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <span className="hero-tag fredoka">
                CINNAMON ROLLS · CAKES · GOOD VIBES
              </span>
            </div>

            <p style={{
              fontSize: '14px', color: 'var(--brown)',
              lineHeight: 1.8, margin: '0 0 28px 0',
              fontWeight: 500
            }}>
              {settings.story}
            </p>

            <button onClick={() => {
              document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })
            }} className="fredoka btn-orange" style={{
              padding: '14px 32px',
              background: '#fff', color: 'var(--orange-dark)',
              border: '2.5px solid var(--orange)',
              borderRadius: '999px', cursor: 'pointer',
              fontSize: '15px', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 12px rgba(255,140,66,0.15)'
            }}>
              立即預購 →
            </button>
          </div>

          {/* 主視覺圖區 + Badge */}
          <div style={{ position: 'relative', marginTop: '40px', textAlign: 'center' }}>
            <div style={{
              width: '90%', maxWidth: '320px', aspectRatio: '1/1',
              margin: '0 auto', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffe5c4, #ffb774)',
              border: '3px dashed var(--orange)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '120px', position: 'relative'
            }}>
              🥐
              <div style={{ position: 'absolute', bottom: '0', right: '-10px' }}>
                <Badge text={`SINCE ${settings.since || '2012'}`} color="#4a89dc" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ OUR FAVORITES 區塊 ============ */}
      <div id="menu-section" style={{
        background: 'linear-gradient(180deg, var(--cream-bg) 0%, var(--cream-light) 50%, #ffe5c4 100%)',
        padding: '40px 20px 60px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ marginBottom: '8px' }}><Squiggle color="#ff8c42" width={50} /></div>
          <h2 className="fredoka" style={{
            fontSize: 'clamp(24px, 6vw, 32px)',
            margin: '0 0 8px 0', color: 'var(--blue-dark)',
            fontWeight: 700, letterSpacing: '1px'
          }}>OUR FAVORITES</h2>
          <div><Squiggle color="#ff8c42" width={50} /></div>
        </div>

        {activeProducts.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)' }}>
            目前暫無商品
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '16px',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {activeProducts.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} cart={cart}
                onAddToCart={onAddToCart} onUpdateQty={onUpdateQty} onShowDetail={onShowDetail} />
            ))}
          </div>
        )}
      </div>

      {/* ============ Sticky Cart Bar ============ */}
      {cart.length > 0 && (
        <div style={{
          background: 'var(--brown)', color: '#fff',
          padding: '14px 20px', position: 'sticky', bottom: 0,
          boxShadow: '0 -8px 24px rgba(0,0,0,0.15)', zIndex: 30
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '12px', maxWidth: '900px', margin: '0 auto'
          }}>
            <div className="fredoka">
              <div style={{ fontSize: '11px', opacity: 0.7, fontWeight: 500 }}>
                YOUR CART · {cartCount} 件
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>${cartTotal}</div>
            </div>
            <button onClick={onCheckout} className="fredoka btn-orange" style={{
              padding: '12px 28px', background: 'var(--orange)', color: '#fff',
              border: 'none', borderRadius: '999px',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer'
            }}>前往結帳 →</button>
          </div>
        </div>
      )}

      {/* ============ OUR STORY + THIS MONTH LIMITED ============ */}
      <div style={{ background: 'var(--cream-bg)', padding: '40px 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '20px',
          maxWidth: '900px', margin: '0 auto'
        }}>
          {/* OUR STORY */}
          <div style={{
            background: 'var(--orange)', color: '#fff',
            borderRadius: '24px', padding: '28px 24px',
            boxShadow: '0 8px 24px rgba(255,140,66,0.2)'
          }}>
            <h3 className="fredoka" style={{
              fontSize: '24px', margin: '0 0 4px 0', fontWeight: 700, letterSpacing: '1px'
            }}>OUR STORY</h3>
            <Squiggle color="#fff" width={50} />
            <p style={{ fontSize: '14px', lineHeight: 1.8, margin: '14px 0 18px 0' }}>
              {settings.story}
            </p>
            <button className="fredoka btn-orange" style={{
              padding: '10px 24px', background: '#fff', color: 'var(--orange-dark)',
              border: 'none', borderRadius: '999px',
              fontWeight: 600, fontSize: '13px', cursor: 'pointer'
            }}>了解更多 →</button>
          </div>

          {/* JOIN OUR CLUB! */}
          <div style={{
            background: '#dceefb',
            borderRadius: '24px', padding: '28px 24px',
            display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap'
          }}>
            <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
              <h3 className="fredoka" style={{
                fontSize: '22px', margin: '0 0 8px 0', color: 'var(--blue-dark)', fontWeight: 700
              }}>JOIN OUR CLUB!</h3>
              <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--brown)', margin: 0 }}>
                加入會員,獲得專屬優惠、<br/>生日禮與新品搶先資訊!
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {settings.contactLine && (
                <div className="fredoka" style={{
                  width: '46px', height: '46px', borderRadius: '50%',
                  background: '#06c755', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700
                }}>LINE</div>
              )}
              <div className="fredoka" style={{
                width: '46px', height: '46px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px'
              }}>📷</div>
              <div className="fredoka" style={{
                width: '46px', height: '46px', borderRadius: '50%',
                background: '#1877f2', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px'
              }}>f</div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ Footer ============ */}
      <div style={{
        background: 'var(--cream-light)', padding: '24px 20px',
        textAlign: 'center', borderTop: '2px dashed var(--line)'
      }}>
        <div className="fredoka" style={{ fontSize: '20px', color: 'var(--orange-dark)', marginBottom: '4px', fontWeight: 700 }}>
          🥐 {settings.shopName}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '10px' }}>
          {settings.tagline}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
          {[
            settings.contactLine && `LINE ${settings.contactLine}`,
            settings.contactPhone && `Tel ${settings.contactPhone}`,
            `© ${new Date().getFullYear()}`
          ].filter(Boolean).join('  ·  ')}
        </div>
      </div>
    </div>
  )
}
