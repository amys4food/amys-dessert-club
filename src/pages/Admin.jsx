import { useState } from 'react'
import { ADMIN_USER, ADMIN_PASS } from '../lib/supabase'
import { DAY_LABELS, statusLabel, statusBadgeStyle, inputStyle, labelStyle, compressImage } from '../lib/utils'

export default function Admin({ products, orders, pickups, settings, loggedIn, onLogin, onLogout,
  onSaveProduct, onDeleteProduct, onToggleProductActive,
  onSavePickup, onDeletePickup,
  onUpdateOrderStatus, onSaveSettings
}) {
  const [tab, setTab] = useState('orders')
  const [editingProd, setEditingProd] = useState(null)
  const [editingPickup, setEditingPickup] = useState(null)

  if (!loggedIn) return <LoginScreen onLogin={onLogin} />

  const pending = orders.filter(o => o.status === 'pending')
  const totalRev = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)
  const activeProducts = products.filter(p => p.active)

  return (
    <div style={{ padding: '22px', background: 'var(--paper)', minHeight: '520px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div className="sans" style={{ display: 'flex', gap: '2px', borderBottom: '1px solid var(--line)', flex: 1 }}>
          {[
            { k: 'orders', l: '訂單' + (pending.length > 0 ? ` · ${pending.length}` : '') },
            { k: 'products', l: '商品' },
            { k: 'pickups', l: '取貨日' },
            { k: 'settings', l: '店家設定' }
          ].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              padding: '10px 14px', background: 'transparent', border: 'none',
              borderBottom: tab === t.k ? '2px solid var(--ink)' : '2px solid transparent',
              color: tab === t.k ? 'var(--ink)' : 'var(--muted)',
              fontWeight: tab === t.k ? 600 : 500,
              fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: '-1px'
            }}>{t.l}</button>
          ))}
        </div>
        <button onClick={() => { if (confirm('確定要登出後台嗎?')) onLogout() }} className="sans btn-ghost" style={{
          background: 'transparent', border: '1px solid var(--line)', borderRadius: '4px',
          padding: '6px 12px', fontSize: '12px', color: 'var(--muted)', cursor: 'pointer'
        }}>登出</button>
      </div>

      {tab === 'orders' && <OrdersTab orders={orders} pending={pending} totalRev={totalRev} activeCount={activeProducts.length} onUpdateStatus={onUpdateOrderStatus} />}
      {tab === 'products' && <ProductsTab products={products} activeCount={activeProducts.length} onEdit={setEditingProd} onToggleActive={onToggleProductActive} />}
      {tab === 'pickups' && <PickupsTab pickups={pickups} onEdit={setEditingPickup} />}
      {tab === 'settings' && <SettingsTab settings={settings} onSave={onSaveSettings} />}

      {editingProd && <ProductEditor product={editingProd} onSave={async (p) => { await onSaveProduct(p); setEditingProd(null) }}
        onCancel={() => setEditingProd(null)} onDelete={async (id) => { await onDeleteProduct(id); setEditingProd(null) }} />}
      {editingPickup && <PickupEditor pickup={editingPickup} onSave={async (pk) => { await onSavePickup(pk); setEditingPickup(null) }}
        onCancel={() => setEditingPickup(null)} onDelete={async (id) => { await onDeletePickup(id); setEditingPickup(null) }} />}
    </div>
  )
}

function LoginScreen({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')

  function tryLogin() {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      onLogin()
    } else {
      setErr('帳號或密碼錯誤')
      setTimeout(() => setErr(''), 2000)
    }
  }

  return (
    <div style={{ padding: '80px 28px', background: 'var(--paper)', minHeight: '520px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '320px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '44px', height: '44px', border: '1.5px solid var(--line)',
            borderRadius: '50%', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', color: 'var(--caramel)'
          }}>🔒</div>
          <h2 className="serif" style={{ fontSize: '20px', margin: 0, color: 'var(--ink)', fontWeight: 400 }}>後台登入</h2>
          <p className="sans" style={{ fontSize: '12px', color: 'var(--muted)', margin: '6px 0 0' }}>請輸入管理員帳號密碼</p>
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label className="sans" style={labelStyle}>帳號</label>
          <input className="sans" style={inputStyle} type="text" value={user}
            onChange={e => setUser(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && tryLogin()} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label className="sans" style={labelStyle}>密碼</label>
          <input className="sans" style={inputStyle} type="password" value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && tryLogin()} />
        </div>
        {err && <div className="sans" style={{
          fontSize: '12px', color: 'var(--brick)', textAlign: 'center',
          marginBottom: '12px', padding: '8px', background: '#faeae8', borderRadius: '4px'
        }}>{err}</div>}
        <button onClick={tryLogin} className="sans btn-primary" style={{
          width: '100%', padding: '12px', background: 'var(--ink)', color: 'var(--paper)',
          border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
          cursor: 'pointer', letterSpacing: '1px'
        }}>登 入</button>
      </div>
    </div>
  )
}

function OrdersTab({ orders, pending, totalRev, activeCount, onUpdateStatus }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '18px' }}>
        {[
          { l: '待處理', v: pending.length },
          { l: '累積訂單', v: orders.length },
          { l: '累積營收', v: `NT$ ${totalRev}` },
          { l: '上架商品', v: activeCount }
        ].map(s => (
          <div key={s.l} className="sans" style={{
            background: 'var(--cream)', borderRadius: '8px', padding: '14px 16px'
          }}>
            <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '1.5px', fontWeight: 500, textTransform: 'uppercase' }}>
              {s.l}
            </div>
            <div className="serif" style={{ fontSize: '22px', fontWeight: 500, color: 'var(--ink)', marginTop: '4px' }}>{s.v}</div>
          </div>
        ))}
      </div>
      {orders.length === 0 ? (
        <div className="sans" style={{ textAlign: 'center', padding: '50px', color: 'var(--muted)', background: 'var(--cream)', borderRadius: '8px', fontSize: '13px' }}>
          尚無訂單
        </div>
      ) : orders.map(o => {
        const dow = new Date(o.pickupDate).getDay()
        return (
          <div key={o.id} className="sans" style={{
            background: 'var(--paper)', border: '1px solid var(--line)',
            borderRadius: '8px', padding: '16px', marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--ink)', fontSize: '13px' }}>
                    {o.orderNo}
                  </span>
                  <span style={statusBadgeStyle(o.status)}>{statusLabel(o.status)}</span>
                </div>
                <div style={{ fontSize: '13px', marginTop: '6px', color: 'var(--ink)' }}>
                  {o.name} · {o.phone}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
                  {o.pickupDate} (週{DAY_LABELS[dow]}) · {o.pickupLocation}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--ink)', fontWeight: 600, fontSize: '16px' }}>NT$ {o.total}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                  {o.items.reduce((s, i) => s + i.qty, 0)} 份
                </div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--cocoa)', padding: '8px 0', borderTop: '1px solid var(--line)' }}>
              {o.items.map(i => `${i.name} × ${i.qty}`).join(' · ')}
            </div>
            {o.note && (
              <div style={{ fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic', marginTop: '4px', padding: '8px 12px', background: 'var(--cream)', borderRadius: '4px' }}>
                備註:{o.note}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {o.status === 'pending' && <button onClick={() => onUpdateStatus(o.id, 'confirmed')} style={adminBtn('var(--ink)', 'var(--paper)')}>確認訂單</button>}
              {o.status === 'confirmed' && <button onClick={() => onUpdateStatus(o.id, 'completed')} style={adminBtn('var(--caramel)', 'var(--paper)')}>完成取貨</button>}
              {(o.status !== 'cancelled' && o.status !== 'completed') && (
                <button onClick={() => { if (confirm('確定取消此訂單?')) onUpdateStatus(o.id, 'cancelled') }}
                  style={adminBtn('var(--paper)', 'var(--brick-dark)', '1px solid var(--line)')}>取消</button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ProductsTab({ products, activeCount, onEdit, onToggleActive }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '8px', flexWrap: 'wrap' }}>
        <div className="sans" style={{ fontSize: '13px', color: 'var(--muted)' }}>
          共 {products.length} 項 · 上架 {activeCount} 項
        </div>
        <button onClick={() => onEdit({ name: '', tagline: '', price: 0, desc: '', emoji: '🍰', image: '', stock: 0, active: true, tag: '' })}
          className="sans btn-primary" style={{
            padding: '8px 18px', background: 'var(--ink)', color: 'var(--paper)',
            border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer'
          }}>+ 新增商品</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
        {products.map(p => (
          <div key={p.id} className="sans" style={{
            background: 'var(--paper)', border: '1px solid var(--line)',
            borderRadius: '8px', overflow: 'hidden', opacity: p.active ? 1 : 0.55
          }}>
            <div style={{ display: 'flex', gap: '12px', padding: '12px' }}>
              <div style={{
                width: '68px', height: '68px', borderRadius: '6px',
                background: 'var(--ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', flexShrink: 0, overflow: 'hidden'
              }}>
                {p.image ? <img src={p.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (p.emoji || '🍰')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', alignItems: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </div>
                  {!p.active && <span style={{ fontSize: '10px', background: 'var(--soft-muted)', color: 'var(--paper)', padding: '2px 6px', borderRadius: '3px', flexShrink: 0 }}>下架</span>}
                </div>
                {p.tagline && (
                  <div style={{ fontSize: '10px', color: 'var(--caramel)', letterSpacing: '1px', marginTop: '3px', textTransform: 'uppercase' }}>
                    {p.tagline}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '14px', fontSize: '12px', marginTop: '8px' }}>
                  <span style={{ color: 'var(--ink)', fontWeight: 600 }}>NT$ {p.price}</span>
                  <span style={{ color: p.stock === 0 ? 'var(--brick-dark)' : p.stock <= 3 ? 'var(--caramel)' : 'var(--muted)' }}>
                    庫存 {p.stock}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--line)', display: 'flex' }}>
              <button onClick={() => onToggleActive(p)} className="btn-ghost" style={{
                flex: 1, padding: '9px', background: 'transparent', border: 'none',
                color: 'var(--muted)', cursor: 'pointer', fontSize: '12px'
              }}>{p.active ? '下架' : '上架'}</button>
              <button onClick={() => onEdit(p)} className="btn-ghost" style={{
                flex: 1, padding: '9px', background: 'transparent', border: 'none',
                borderLeft: '1px solid var(--line)', color: 'var(--ink)',
                cursor: 'pointer', fontSize: '12px', fontWeight: 600
              }}>編輯</button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="sans" style={{
            gridColumn: '1/-1', textAlign: 'center', padding: '50px',
            color: 'var(--muted)', background: 'var(--cream)', borderRadius: '8px', fontSize: '13px'
          }}>尚無商品</div>
        )}
      </div>
    </div>
  )
}

function PickupsTab({ pickups, onEdit }) {
  return (
    <div>
      <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div className="sans" style={{ fontSize: '13px', color: 'var(--muted)' }}>
          設定客戶可選的取貨日與地點
        </div>
        <button onClick={() => onEdit({ dow: 2, location: '', note: '', active: true })}
          className="sans btn-primary" style={{
            padding: '8px 18px', background: 'var(--ink)', color: 'var(--paper)',
            border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer'
          }}>+ 新增取貨日</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {[0, 1, 2, 3, 4, 5, 6].map(dow => {
          const rules = pickups.filter(p => p.dow === dow)
          return (
            <div key={dow} className="sans" style={{
              background: rules.length === 0 ? 'var(--cream)' : 'var(--paper)',
              border: '1px solid var(--line)', borderRadius: '8px', padding: '10px', minHeight: '120px'
            }}>
              <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '8px', fontSize: '12px', textAlign: 'center', paddingBottom: '6px', borderBottom: '1px solid var(--line)' }}>
                週{DAY_LABELS[dow]}
              </div>
              {rules.length === 0 ? (
                <div style={{ fontSize: '11px', color: 'var(--soft-muted)', textAlign: 'center', padding: '14px 0' }}>未設定</div>
              ) : rules.map(r => (
                <div key={r.id} onClick={() => onEdit(r)} style={{
                  padding: '8px',
                  background: r.active ? 'var(--cream)' : '#f0ebe0',
                  borderRadius: '4px', marginBottom: '4px', cursor: 'pointer', fontSize: '11px',
                  border: `1px solid ${r.active ? 'var(--line)' : 'var(--soft-muted)'}`,
                  textAlign: 'center', opacity: r.active ? 1 : 0.6
                }}>
                  <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{r.location}</div>
                  {r.note && <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{r.note}</div>}
                  {!r.active && <div style={{ fontSize: '10px', color: 'var(--brick-dark)', marginTop: '2px' }}>停用</div>}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SettingsTab({ settings, onSave }) {
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(form)
      alert('已儲存')
    } catch (err) {
      alert('儲存失敗: ' + err.message)
    }
    setSaving(false)
  }

  const fields = [
    { k: 'shopName', l: '店家名稱', t: 'text' },
    { k: 'tagline', l: '英文標語', t: 'text' },
    { k: 'subtitle', l: '副標題', t: 'text' },
    { k: 'story', l: '品牌故事', t: 'textarea' },
    { k: 'contactLine', l: 'LINE ID', t: 'text' },
    { k: 'contactPhone', l: '聯絡電話', t: 'text' },
    { k: 'leadDays', l: '預購前置天數', t: 'number' }
  ]

  return (
    <div className="sans" style={{ background: 'var(--paper)', borderRadius: '8px', padding: '22px', border: '1px solid var(--line)' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--ink)', fontWeight: 600 }}>店家資訊</h3>
      {fields.map(f => (
        <div key={f.k} style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>{f.l}</label>
          {f.t === 'textarea'
            ? <textarea style={{ ...inputStyle, minHeight: '72px', resize: 'vertical' }} value={form[f.k] || ''}
                onChange={e => setForm({ ...form, [f.k]: e.target.value })} />
            : <input type={f.t} style={inputStyle} value={form[f.k] || (f.t === 'number' ? 0 : '')}
                onChange={e => setForm({ ...form, [f.k]: f.t === 'number' ? parseInt(e.target.value) || 0 : e.target.value })} />
          }
        </div>
      ))}
      <button onClick={handleSave} disabled={saving} className="btn-primary" style={{
        padding: '10px 22px', background: 'var(--ink)', color: 'var(--paper)',
        border: 'none', borderRadius: '5px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
      }}>{saving ? '儲存中...' : '儲存設定'}</button>
    </div>
  )
}

function ProductEditor({ product, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState(product)
  const [uploading, setUploading] = useState(false)
  const isNew = !product.id
  const EMOJIS = ['🍰','🎂','🧁','🍪','🍩','🍮','🍫','🥧','🥐','🍞','🍓','🥕','🍵','🍦','🥮','🍒','🍎','🧀','☕','🍯','🍋','🥞','🌰']

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('請選擇圖片'); return }
    setUploading(true)
    try {
      const url = await compressImage(file, 800)
      setForm({ ...form, image: url })
    } catch (err) { alert('處理失敗') }
    setUploading(false)
  }

  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, background: 'rgba(45,26,16,0.55)',
      zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div onClick={e => e.stopPropagation()} className="sans" style={{
        background: 'var(--paper)', borderRadius: '10px',
        maxWidth: '520px', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="serif" style={{ fontSize: '17px', margin: 0, color: 'var(--ink)', fontWeight: 600 }}>
            {isNew ? '新增商品' : '編輯商品'}
          </h2>
          <button onClick={onCancel} style={{ background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>商品照片</label>
          {form.image ? (
            <div style={{ position: 'relative' }}>
              <img src={form.image} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px' }} />
              <button onClick={() => setForm({ ...form, image: '' })} style={{
                position: 'absolute', top: '8px', right: '8px',
                background: 'var(--ink)', color: 'var(--paper)', border: 'none',
                padding: '5px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer'
              }}>移除</button>
            </div>
          ) : (
            <label style={{
              display: 'block', border: '1.5px dashed var(--line)', borderRadius: '6px',
              padding: '28px', textAlign: 'center', cursor: 'pointer', background: 'var(--cream)'
            }}>
              {uploading ? (
                <div style={{ color: 'var(--muted)', fontSize: '13px' }}>處理中...</div>
              ) : (
                <>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>📷</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>點此上傳照片</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>支援 JPG / PNG,自動壓縮</div>
                </>
              )}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            </label>
          )}
        </div>

        {!form.image && (
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>或選擇圖示</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setForm({ ...form, emoji: e })} style={{
                  width: '34px', height: '34px', fontSize: '20px',
                  background: form.emoji === e ? 'var(--cream)' : 'var(--paper)',
                  border: form.emoji === e ? '1.5px solid var(--ink)' : '1px solid var(--line)',
                  borderRadius: '5px', cursor: 'pointer'
                }}>{e}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>商品名稱 *</label>
            <input type="text" style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>英文標語</label>
            <input type="text" style={inputStyle} value={form.tagline || ''} onChange={e => setForm({ ...form, tagline: e.target.value })} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>價格 *</label>
            <input type="number" style={inputStyle} value={form.price || ''} onChange={e => setForm({ ...form, price: parseInt(e.target.value) || 0 })} min="0" />
          </div>
          <div>
            <label style={labelStyle}>庫存</label>
            <input type="number" style={inputStyle} value={form.stock} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} min="0" />
          </div>
          <div>
            <label style={labelStyle}>標籤</label>
            <select style={inputStyle} value={form.tag || ''} onChange={e => setForm({ ...form, tag: e.target.value })}>
              <option value="">無</option>
              <option value="招牌">招牌</option>
              <option value="人氣">人氣</option>
              <option value="新品">新品</option>
              <option value="限量">限量</option>
              <option value="特價">特價</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>商品介紹</label>
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '18px', color: 'var(--ink)' }}>
          <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
          <span>立即上架 (客戶可見)</span>
        </label>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!isNew && (
            <button onClick={() => { if (confirm(`確定刪除「${form.name}」?`)) onDelete(form.id) }} style={{
              padding: '9px 14px', background: 'var(--paper)', color: 'var(--brick-dark)',
              border: '1px solid var(--line)', borderRadius: '5px',
              fontSize: '13px', cursor: 'pointer'
            }}>刪除</button>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={onCancel} style={{
            padding: '9px 16px', background: 'transparent', border: '1px solid var(--line)',
            borderRadius: '5px', fontSize: '13px', cursor: 'pointer', color: 'var(--muted)'
          }}>取消</button>
          <button onClick={() => {
            if (!form.name.trim()) { alert('請輸入商品名稱'); return }
            if (!form.price || form.price <= 0) { alert('請輸入有效價格'); return }
            onSave(form)
          }} className="btn-primary" style={{
            padding: '10px 22px', background: 'var(--ink)', color: 'var(--paper)',
            border: 'none', borderRadius: '5px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
          }}>儲存</button>
        </div>
      </div>
    </div>
  )
}

function PickupEditor({ pickup, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState(pickup)
  const isNew = !pickup.id

  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, background: 'rgba(45,26,16,0.55)',
      zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div onClick={e => e.stopPropagation()} className="sans" style={{
        background: 'var(--paper)', borderRadius: '10px',
        maxWidth: '420px', width: '100%', padding: '24px'
      }}>
        <h2 className="serif" style={{ fontSize: '17px', margin: '0 0 20px 0', color: 'var(--ink)', fontWeight: 600 }}>
          {isNew ? '新增取貨日' : '編輯取貨日'}
        </h2>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>星期幾</label>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[0, 1, 2, 3, 4, 5, 6].map(dow => (
              <button key={dow} onClick={() => setForm({ ...form, dow })} style={{
                flex: 1, padding: '10px 0',
                background: form.dow === dow ? 'var(--ink)' : 'var(--paper)',
                color: form.dow === dow ? 'var(--paper)' : 'var(--ink)',
                border: `1px solid ${form.dow === dow ? 'var(--ink)' : 'var(--line)'}`,
                borderRadius: '5px', fontSize: '13px', fontWeight: 500, cursor: 'pointer'
              }}>週{DAY_LABELS[dow]}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>取貨地點 *</label>
          <input type="text" style={inputStyle} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>備註 (可選)</label>
          <input type="text" style={inputStyle} value={form.note || ''} onChange={e => setForm({ ...form, note: e.target.value })} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '18px', color: 'var(--ink)' }}>
          <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
          <span>啟用 (客戶可選擇)</span>
        </label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!isNew && (
            <button onClick={() => { if (confirm('刪除此取貨日?')) onDelete(form.id) }} style={{
              padding: '9px 14px', background: 'var(--paper)', color: 'var(--brick-dark)',
              border: '1px solid var(--line)', borderRadius: '5px',
              fontSize: '13px', cursor: 'pointer'
            }}>刪除</button>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={onCancel} style={{
            padding: '9px 16px', background: 'transparent', border: '1px solid var(--line)',
            borderRadius: '5px', fontSize: '13px', cursor: 'pointer', color: 'var(--muted)'
          }}>取消</button>
          <button onClick={() => { if (!form.location.trim()) { alert('請填取貨地點'); return } onSave(form) }} className="btn-primary" style={{
            padding: '10px 22px', background: 'var(--ink)', color: 'var(--paper)',
            border: 'none', borderRadius: '5px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
          }}>儲存</button>
        </div>
      </div>
    </div>
  )
}

function adminBtn(bg, fg, border) {
  return {
    padding: '7px 14px', background: bg, color: fg,
    border: border || 'none', borderRadius: '5px',
    fontSize: '12px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.5px'
  }
}
