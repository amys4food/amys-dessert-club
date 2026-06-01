import { useState } from 'react'
import { ADMIN_USER, ADMIN_PASS } from '../lib/supabase'
import { inputStyle, labelStyle } from '../lib/utils'
import AdminOrders from './admin/AdminOrders'
import AdminProducts from './admin/AdminProducts'
import AdminPickups from './admin/AdminPickups'
import AdminAnalytics from './admin/AdminAnalytics'
import AdminMembers from './admin/AdminMembers'
import AdminSettings from './admin/AdminSettings'

export default function Admin({
  products, orders, pickups, settings, members,
  loggedIn, onLogin, onLogout,
  onSaveProduct, onDeleteProduct, onToggleProductActive,
  onSavePickup, onDeletePickup,
  onUpdateOrderStatus, onDeleteOrder,
  onSaveSettings,
  onUpdateMember, onDeleteMember
}) {
  const [tab, setTab] = useState('orders')

  if (!loggedIn) return <LoginScreen onLogin={onLogin} />

  const pending = orders.filter(o => o.status === 'pending')

  const tabs = [
    { k: 'orders', l: '訂單', icon: '📦', badge: pending.length },
    { k: 'analytics', l: '統計', icon: '📊' },
    { k: 'members', l: '會員', icon: '👥', badge: members.length },
    { k: 'products', l: '商品', icon: '🍰' },
    { k: 'pickups', l: '取貨日', icon: '📅' },
    { k: 'settings', l: '設定', icon: '⚙️' }
  ]

  return (
    <div className="responsive-container" style={{
      padding: '16px', background: 'var(--cream-bg)', minHeight: '100vh'
    }}>
      {/* 頂部:登出按鈕 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '12px', gap: '8px', flexWrap: 'wrap'
      }}>
        <h1 className="fredoka" style={{
          fontSize: '22px', margin: 0, color: 'var(--brown)', fontWeight: 700
        }}>📋 後台管理</h1>
        <button onClick={() => { if (confirm('確定要登出嗎?')) onLogout() }} style={{
          background: '#fff', border: '2px solid var(--line)',
          borderRadius: '999px', padding: '6px 14px',
          fontSize: '12px', color: 'var(--muted)', cursor: 'pointer', fontWeight: 600
        }}>登出</button>
      </div>

      {/* Tab 列(手機橫向滑動) */}
      <div className="admin-tabs">
        {tabs.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} className="fredoka" style={{
            padding: '10px 14px', background: 'transparent', border: 'none',
            borderBottom: tab === t.k ? '3px solid var(--orange)' : '3px solid transparent',
            color: tab === t.k ? 'var(--orange-dark)' : 'var(--muted)',
            fontWeight: tab === t.k ? 700 : 500,
            fontSize: '13px', cursor: 'pointer',
            whiteSpace: 'nowrap', marginBottom: '-2px',
            display: 'flex', alignItems: 'center', gap: '6px',
            flexShrink: 0
          }}>
            <span>{t.icon}</span>
            <span>{t.l}</span>
            {t.badge > 0 && (
              <span style={{
                background: 'var(--red)', color: '#fff',
                fontSize: '10px', padding: '1px 7px',
                borderRadius: '999px', fontWeight: 700
              }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* 分頁內容 */}
      {tab === 'orders' && (
        <AdminOrders orders={orders}
          onUpdateStatus={onUpdateOrderStatus}
          onDelete={onDeleteOrder} />
      )}
      {tab === 'analytics' && <AdminAnalytics orders={orders} />}
      {tab === 'members' && (
        <AdminMembers members={members}
          onUpdate={onUpdateMember}
          onDelete={onDeleteMember} />
      )}
      {tab === 'products' && (
        <AdminProducts products={products}
          onSaveProduct={onSaveProduct}
          onDeleteProduct={onDeleteProduct}
          onToggleActive={onToggleProductActive} />
      )}
      {tab === 'pickups' && (
        <AdminPickups pickups={pickups}
          onSavePickup={onSavePickup}
          onDeletePickup={onDeletePickup} />
      )}
      {tab === 'settings' && <AdminSettings settings={settings} onSave={onSaveSettings} />}
    </div>
  )
}

function LoginScreen({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')

  function tryLogin() {
    if (user === ADMIN_USER && pass === ADMIN_PASS) onLogin()
    else { setErr('帳號或密碼錯誤'); setTimeout(() => setErr(''), 2000) }
  }

  return (
    <div className="responsive-container" style={{
      padding: '60px 24px', background: 'var(--cream-bg)',
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: '340px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'var(--orange)', borderRadius: '50%',
            margin: '0 auto 16px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '28px',
            boxShadow: '0 6px 16px rgba(255,140,66,0.3)'
          }}>🔒</div>
          <h2 className="fredoka" style={{ fontSize: '24px', margin: 0, color: 'var(--brown)', fontWeight: 700 }}>
            後台登入
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '6px 0 0' }}>
            請輸入管理員帳號密碼
          </p>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>帳號</label>
          <input style={inputStyle} type="text" value={user}
            onChange={e => setUser(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && tryLogin()} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>密碼</label>
          <input style={inputStyle} type="password" value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && tryLogin()} />
        </div>
        {err && (
          <div style={{
            fontSize: '12px', color: 'var(--red)', textAlign: 'center',
            marginBottom: '12px', padding: '10px',
            background: '#faeae8', borderRadius: '10px', fontWeight: 600
          }}>{err}</div>
        )}
        <button onClick={tryLogin} className="fredoka btn-orange" style={{
          width: '100%', padding: '14px',
          background: 'var(--orange)', color: '#fff',
          border: 'none', borderRadius: '999px',
          fontSize: '14px', fontWeight: 700, cursor: 'pointer'
        }}>登 入</button>
      </div>
    </div>
  )
}
