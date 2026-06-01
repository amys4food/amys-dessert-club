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
  tagline: 'Cinnamon Rolls · Cakes · Good Vibes',
  subtitle: '從咖啡廳到甜點俱樂部',
  story: '從一間小小的咖啡廳開始,到現在的甜點俱樂部,我們堅持手作、用心,做出讓你記得的味道。',
  since: '2012',
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
  const [members, setMembers] = useState([])

  const [cart, setCart] = useState([])
  const [lastOrder, setLastOrder] = useState(null)
  const [detailProd, setDetailProd] = useState(null)
  const [toast, setToast] = useState('')

  const [adminLoggedIn, setAdminLoggedIn] = useState(() => {
    try { return localStorage.getItem('amy_admin_session') === 'true' } catch { return false }
  })

  // 初始載入
  useEffect(() => { loadAll() }, [])

  // 即時訂閱
  useEffect(() => {
    const unsubscribe = api.subscribeToOrders(async (payload) => {
      if (payload.eventType === 'INSERT' && view === 'admin' && adminLoggedIn) {
        try {
          if (window.Notification && Notification.permission === 'granted') {
            new Notification('🎂 Amy\'s 新訂單!', {
              body: `${payload.new.customer_name} · NT$ ${payload.new.total}`
            })
          }
        } catch (e) {}
        showToast('🔔 收到新訂單!')
      }
      loadOrders()
      if (payload.eventType === 'INSERT') loadMembers()
    })
    return unsubscribe
  }, [view, adminLoggedIn])

  // 進後台請求通知權限
  useEffect(() => {
    if (view === 'admin' && adminLoggedIn && window.Notification && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [view, adminLoggedIn])

  async function loadAll() {
    setLoading(true)
    try {
      const [p, o, pk, s, m] = await Promise.all([
        api.fetchProducts(),
        api.fetchOrders(),
        api.fetchPickups(),
        api.fetchSettings(),
        api.fetchMembers()
      ])
      setProducts(p)
      setOrders(o)
      setPickups(pk)
      setSettings(s || DEFAULT_SETTINGS)
      setMembers(m)
    } catch (err) {
      console.error('載入失敗:', err)
      showToast('資料載入失敗')
    }
    setLoading(false)
  }

  async function loadOrders() {
    try { setOrders(await api.fetchOrders()) } catch (err) { console.error(err) }
  }
  async function loadProducts() {
    try { setProducts(await api.fetchProducts()) } catch (err) { console.error(err) }
  }
  async function loadMembers() {
    try { setMembers(await api.fetchMembers()) } catch (err) { console.error(err) }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  // === 購物車 ===
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

  function removeItem(id) { setCart(cart.filter(i => i.id !== id)); showToast('已移除') }

  // === 訂單 ===
  async function submitOrder(orderData) {
    const order = await api.createOrder(orderData)
    await loadProducts()
    await loadMembers()
    setLastOrder(order)
    setCart([])
    setStage('success')
  }

  async function updateOrderStatus(id, status) {
    await api.updateOrderStatus(id, status)
    await loadOrders()
    showToast('已更新')
  }

  async function deleteOrder(id) {
    await api.deleteOrder(id)
    await loadOrders()
    showToast('已刪除訂單')
  }

  // === 商品 ===
  async function saveProduct(product) {
    await api.saveProduct(product)
    await loadProducts()
    showToast(product.id ? '已更新' : '已新增商品')
  }
  async function deleteProduct(id) {
    await api.deleteProduct(id); await loadProducts(); showToast('已刪除')
  }
  async function toggleProductActive(product) {
    await api.saveProduct({ ...product, active: !product.active })
    await loadProducts()
  }

  // === 取貨日 ===
  async function savePickup(pickup) {
    await api.savePickup(pickup)
    setPickups(await api.fetchPickups())
    showToast('取貨日已更新')
  }
  async function deletePickup(id) {
    await api.deletePickup(id)
    setPickups(await api.fetchPickups())
    showToast('已刪除')
  }

  // === 設定 ===
  async function saveSettings(newSettings) {
    await api.saveSettings(newSettings)
    setSettings(newSettings)
  }

  // === 會員 ===
  async function updateMember(phone, updates) {
    await api.updateMember(phone, updates)
    await loadMembers()
    showToast('會員資料已更新')
  }
  async function deleteMember(phone) {
    await api.deleteMember(phone)
    await loadMembers()
    showToast('已刪除會員')
  }

  // === 登入 ===
  function adminLogin() {
    setAdminLoggedIn(true)
    try { localStorage.setItem('amy_admin_session', 'true') } catch {}
  }
  function adminLogout() {
    setAdminLoggedIn(false)
    try { localStorage.removeItem('amy_admin_session') } catch {}
  }

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const pendingCount = orders.filter(o => o.status === 'pending').length

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', color: 'var(--orange)',
        background: 'var(--cream-bg)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="caveat" style={{ fontSize: '40px', color: 'var(--orange-dark)', marginBottom: '8px' }}>
            Amy's
          </div>
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
        padding: '12px 18px',
        borderBottom: '2px dashed var(--line)',
        background: 'var(--cream-bg)',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <div className="caveat" style={{ fontSize: '24px', color: 'var(--orange-dark)', fontWeight: 700 }}>
          🥐 {settings.shopName}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => { setView('customer'); setStage('browse') }} className="fredoka" style={tabBtn(view === 'customer')}>
            訂購
          </button>
          <button onClick={() => setView('admin')} className="fredoka" style={tabBtn(view === 'admin')}>
            後台{adminLoggedIn && pendingCount > 0 ? ` · ${pendingCount}` : ''}
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
        <Admin products={products} orders={orders} pickups={pickups} settings={settings} members={members}
          loggedIn={adminLoggedIn} onLogin={adminLogin} onLogout={adminLogout}
          onSaveProduct={saveProduct} onDeleteProduct={deleteProduct} onToggleProductActive={toggleProductActive}
          onSavePickup={savePickup} onDeletePickup={deletePickup}
          onUpdateOrderStatus={updateOrderStatus} onDeleteOrder={deleteOrder}
          onSaveSettings={saveSettings}
          onUpdateMember={updateMember} onDeleteMember={deleteMember} />
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
    padding: '8px 18px',
    background: active ? 'var(--orange)' : 'transparent',
    color: active ? '#fff' : 'var(--muted)',
    border: active ? 'none' : '2px solid transparent',
    borderRadius: '999px', cursor: 'pointer',
    fontSize: '13px', fontWeight: 700, letterSpacing: '0.3px'
  }
}
