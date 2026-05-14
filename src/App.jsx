import { useState, useEffect } from 'react'
import * as api from './lib/api'
import Browse from './pages/Browse'
import Checkout from './pages/Checkout'
import Success from './pages/Success'
import Admin from './pages/Admin'
import ProductDetail from './components/ProductDetail'
import Toast from './components/Toast'

const DEFAULT_SETTINGS = {
  shopName: "Amy's 點心俱樂部",
  tagline: 'Baked with love',
  subtitle: '宜蘭在地 · 純手工烘焙 · 預購制',
  story: '每一份點心都從 Amy 的廚房出發。',
  leadDays: 3,
  contactLine: '',
  contactPhone: ''
}

export default function App() {
  const [view, setView] = useState('customer')
  const [stage, setStage] = useState('browse')
  const [loading, setLoading] = useState(true)
  
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [pickups, setPickups] = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  
  const [cart, setCart] = useState([])
  const [lastOrder, setLastOrder] = useState(null)
  const [detailProd, setDetailProd] = useState(null)
  const [toast, setToast] = useState('')
  
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => {
    return localStorage.getItem('amy_admin_session') === 'true'
  })

  // 初始載入
  useEffect(() => {
    loadAll()
  }, [])

  // 即時訂閱訂單更新
  useEffect(() => {
    const unsubscribe = api.subscribeToOrders(async (payload) => {
      console.log('🔔 訂單變動:', payload)
      
      // 新訂單通知音 + 桌面通知 (僅後台)
      if (payload.eventType === 'INSERT' && view === 'admin' && adminLoggedIn) {
        try {
          if (Notification.permission === 'granted') {
            new Notification('🎂 Amy\'s 新訂單!', {
              body: `${payload.new.customer_name} · NT$ ${payload.new.total}`
            })
          }
        } catch (e) {}
        showToast('🔔 收到新訂單!')
      }
      
      // 重新載入訂單
      loadOrders()
    })
    return unsubscribe
  }, [view, adminLoggedIn])

  // 進入後台時請求通知權限
  useEffect(() => {
    if (view === 'admin' && adminLoggedIn && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [view, adminLoggedIn])

  async function loadAll() {
    setLoading(true)
    try {
      const [p, o, pk, s] = await Promise.all([
        api.fetchProducts(),
        api.fetchOrders(),
        api.fetchPickups(),
        api.fetchSettings()
      ])
      setProducts(p)
      setOrders(o)
      setPickups(pk)
      setSettings(s || DEFAULT_SETTINGS)
    } catch (err) {
      console.error('載入失敗:', err)
      showToast('資料載入失敗,請檢查 Supabase 連線')
    }
    setLoading(false)
  }

  async function loadOrders() {
    try {
      const o = await api.fetchOrders()
      setOrders(o)
    } catch (err) {
      console.error(err)
    }
  }

  async function loadProducts() {
    try {
      const p = await api.fetchProducts()
      setProducts(p)
    } catch (err) {
      console.error(err)
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  // === 購物車操作 ===
  function addToCart(p) {
    if (p.stock <= 0) { showToast('已售完'); return }
    const existing = cart.find(i => i.id === p.id)
    if (existing) {
      if (existing.qty >= p.stock) { showToast(`庫存僅剩 ${p.stock} 份`); return }
      setCart(cart.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
    } else {
      setCart([...cart, {
        id: p.id, name: p.name, price: p.price,
        emoji: p.emoji, image: p.image, qty: 1, max: p.stock, tagline: p.tagline
      }])
    }
    showToast('已加入購物車')
  }

  function updateCartQty(id, delta) {
    setCart(cart.map(i => {
      if (i.id === id) {
        const q = i.qty + delta
        if (q > i.max) { showToast(`庫存僅剩 ${i.max} 份`); return i }
        return { ...i, qty: q }
      }
      return i
    }).filter(i => i.qty > 0))
  }

  function removeItem(id) {
    setCart(cart.filter(i => i.id !== id))
    showToast('已移除')
  }

  // === 訂單操作 ===
  async function submitOrder(orderData) {
    const order = await api.createOrder(orderData)
    await loadProducts() // 重新載入庫存
    setLastOrder(order)
    setCart([])
    setStage('success')
  }

  async function updateOrderStatus(id, status) {
    await api.updateOrderStatus(id, status)
    await loadOrders()
    showToast('已更新')
  }

  // === 商品操作 ===
  async function saveProduct(product) {
    await api.saveProduct(product)
    await loadProducts()
    showToast(product.id ? '已更新' : '已新增商品')
  }

  async function deleteProduct(id) {
    await api.deleteProduct(id)
    await loadProducts()
    showToast('已刪除')
  }

  async function toggleProductActive(product) {
    await api.saveProduct({ ...product, active: !product.active })
    await loadProducts()
  }

  // === 取貨日操作 ===
  async function savePickup(pickup) {
    await api.savePickup(pickup)
    const pk = await api.fetchPickups()
    setPickups(pk)
    showToast('取貨日已更新')
  }

  async function deletePickup(id) {
    await api.deletePickup(id)
    const pk = await api.fetchPickups()
    setPickups(pk)
    showToast('已刪除')
  }

  // === 設定 ===
  async function saveSettings(newSettings) {
    await api.saveSettings(newSettings)
    setSettings(newSettings)
  }

  // === 登入登出 ===
  function adminLogin() {
    setAdminLoggedIn(true)
    localStorage.setItem('amy_admin_session', 'true')
  }
  function adminLogout() {
    setAdminLoggedIn(false)
    localStorage.removeItem('amy_admin_session')
  }

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', color: 'var(--caramel)', fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="script" style={{ fontSize: '32px', marginBottom: '8px' }}>Amy's</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)' }}>載入中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      {/* 頂部導覽 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 22px', borderBottom: '1px solid var(--line)', background: 'var(--paper)'
      }}>
        <div className="script" style={{ fontSize: '22px', color: 'var(--cocoa)' }}>{settings.shopName}</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => { setView('customer'); setStage('browse') }} className="sans" style={tabBtn(view === 'customer')}>
            訂購
          </button>
          <button onClick={() => setView('admin')} className="sans" style={tabBtn(view === 'admin')}>
            後台{adminLoggedIn && orders.filter(o => o.status === 'pending').length > 0 ? ` · ${orders.filter(o => o.status === 'pending').length}` : ''}
          </button>
        </div>
      </div>

      <Toast message={toast} />

      {view === 'customer' && stage === 'browse' && (
        <Browse settings={settings} products={products} pickups={pickups}
          cart={cart} cartTotal={cartTotal} cartCount={cartCount}
          onAddToCart={addToCart} onUpdateQty={updateCartQty}
          onShowDetail={setDetailProd} onCheckout={() => setStage('checkout')} />
      )}

      {view === 'customer' && stage === 'checkout' && (
        <Checkout cart={cart} cartTotal={cartTotal} pickups={pickups} settings={settings}
          onUpdateQty={updateCartQty} onRemoveItem={removeItem}
          onSubmitOrder={submitOrder} onBack={() => setStage('browse')} />
      )}

      {view === 'customer' && stage === 'success' && (
        <Success order={lastOrder} settings={settings}
          onBack={() => { setStage('browse'); setLastOrder(null) }} />
      )}

      {view === 'admin' && (
        <Admin products={products} orders={orders} pickups={pickups} settings={settings}
          loggedIn={adminLoggedIn} onLogin={adminLogin} onLogout={adminLogout}
          onSaveProduct={saveProduct} onDeleteProduct={deleteProduct} onToggleProductActive={toggleProductActive}
          onSavePickup={savePickup} onDeletePickup={deletePickup}
          onUpdateOrderStatus={updateOrderStatus} onSaveSettings={saveSettings} />
      )}

      {detailProd && (
        <ProductDetail product={detailProd} cart={cart}
          onClose={() => setDetailProd(null)}
          onAdd={() => addToCart(detailProd)}
          onUpdateQty={(delta) => updateCartQty(detailProd.id, delta)} />
      )}
    </div>
  )
}

function tabBtn(active) {
  return {
    padding: '8px 16px',
    background: active ? 'var(--ink)' : 'transparent',
    color: active ? 'var(--paper)' : 'var(--muted)',
    border: active ? '1px solid var(--ink)' : '1px solid transparent',
    borderRadius: '20px', cursor: 'pointer',
    fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px'
  }
}
