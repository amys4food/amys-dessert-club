import { useState, useRef } from 'react'
import { compressImage, inputStyle, labelStyle } from '../../lib/utils'

export default function AdminProducts({ products, onSaveProduct, onDeleteProduct, onToggleActive }) {
  const [editing, setEditing] = useState(null)
  const activeCount = products.filter(p => p.active).length

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '14px', gap: '8px', flexWrap: 'wrap'
      }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
          共 {products.length} 項 · 上架 {activeCount} 項
        </div>
        <button onClick={() => setEditing({
          name: '', tagline: '', price: 0, desc: '',
          emoji: '🍰', image: '', stock: 0, active: true, tag: '',
          specs: '', storage: '', allergens: ''
        })} className="fredoka btn-orange" style={{
          padding: '10px 20px', background: 'var(--orange)', color: '#fff',
          border: 'none', borderRadius: '999px',
          fontWeight: 700, fontSize: '13px', cursor: 'pointer'
        }}>+ 新增商品</button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '12px'
      }}>
        {products.map(p => (
          <div key={p.id} style={{
            background: '#fff', border: '2px solid var(--line)',
            borderRadius: '16px', overflow: 'hidden',
            opacity: p.active ? 1 : 0.55
          }}>
            <div style={{ display: 'flex', gap: '12px', padding: '14px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '12px',
                background: 'var(--cream-light)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', flexShrink: 0, overflow: 'hidden'
              }}>
                {p.image ? <img src={p.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (p.emoji || '🍰')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                  <div className="fredoka" style={{
                    fontSize: '14px', fontWeight: 600, color: 'var(--brown)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>{p.name}</div>
                  {!p.active && (
                    <span className="fredoka" style={{
                      fontSize: '10px', background: 'var(--soft-muted)', color: '#fff',
                      padding: '2px 6px', borderRadius: '999px', flexShrink: 0
                    }}>下架</span>
                  )}
                </div>
                {p.tagline && (
                  <div className="fredoka" style={{
                    fontSize: '10px', color: 'var(--orange-dark)',
                    marginTop: '3px', fontWeight: 600
                  }}>{p.tagline}</div>
                )}
                <div style={{ display: 'flex', gap: '14px', fontSize: '12px', marginTop: '6px' }}>
                  <span className="fredoka" style={{ color: 'var(--orange-dark)', fontWeight: 700 }}>
                    ${p.price}
                  </span>
                  <span style={{
                    color: p.stock === 0 ? 'var(--red)' : p.stock <= 3 ? 'var(--orange-dark)' : 'var(--muted)'
                  }}>庫存 {p.stock}</span>
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px dashed var(--line)', display: 'flex' }}>
              <button onClick={() => onToggleActive(p)} style={{
                flex: 1, padding: '10px', background: 'transparent',
                border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '12px'
              }}>{p.active ? '下架' : '上架'}</button>
              <button onClick={() => setEditing(p)} style={{
                flex: 1, padding: '10px', background: 'transparent',
                border: 'none', borderLeft: '1px dashed var(--line)',
                color: 'var(--brown)', cursor: 'pointer', fontSize: '12px', fontWeight: 700
              }}>編輯</button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div style={{
            gridColumn: '1/-1', textAlign: 'center', padding: '50px',
            color: 'var(--muted)', background: 'var(--cream-light)',
            borderRadius: '16px', fontSize: '13px'
          }}>尚無商品</div>
        )}
      </div>

      {editing && (
        <ProductEditor product={editing}
          onSave={async (p) => { await onSaveProduct(p); setEditing(null) }}
          onCancel={() => setEditing(null)}
          onDelete={async (id) => { await onDeleteProduct(id); setEditing(null) }} />
      )}
    </div>
  )
}

function ProductEditor({ product, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState(product)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const isNew = !product.id
  const EMOJIS = ['🍰','🎂','🧁','🍪','🍩','🍮','🍫','🥧','🥐','🍞','🍓','🥕','🍵','🍦','🥮','🍒','🍎','🧀','🍯','🍋','🥞','🌰','🍍','🥭']

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('請選擇圖片'); return }
    setUploading(true)
    try { setForm({ ...form, image: await compressImage(file, 800) }) }
    catch (err) { alert('處理失敗') }
    setUploading(false)
  }

  return (
    <div onClick={onCancel} className="modal-overlay">
      <div onClick={e => e.stopPropagation()} className="modal-box" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 className="fredoka" style={{ fontSize: '18px', margin: 0, color: 'var(--brown)', fontWeight: 700 }}>
            {isNew ? '新增商品' : '編輯商品'}
          </h2>
          <button onClick={onCancel} style={{
            background: 'var(--cream-light)', border: 'none',
            width: '32px', height: '32px', borderRadius: '50%',
            fontSize: '14px', cursor: 'pointer', color: 'var(--brown)'
          }}>✕</button>
        </div>

        {/* 照片 */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>商品照片</label>
          {form.image ? (
            <div style={{ position: 'relative' }}>
              <img src={form.image} style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '12px' }} />
              <button onClick={() => setForm({ ...form, image: '' })} style={{
                position: 'absolute', top: '8px', right: '8px',
                background: 'var(--ink)', color: '#fff', border: 'none',
                padding: '5px 10px', borderRadius: '999px', fontSize: '11px', cursor: 'pointer'
              }}>移除</button>
            </div>
          ) : (
            <div onClick={() => fileRef.current?.click()} style={{
              border: '2px dashed var(--orange-light)', borderRadius: '12px',
              padding: '24px', textAlign: 'center', cursor: 'pointer',
              background: 'var(--cream-light)'
            }}>
              {uploading ? '處理中...' : (
                <>
                  <div style={{ fontSize: '28px', marginBottom: '6px' }}>📷</div>
                  <div className="fredoka" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown)' }}>點此上傳照片</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '3px' }}>JPG / PNG,自動壓縮</div>
                </>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        {!form.image && (
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>或選擇圖示</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setForm({ ...form, emoji: e })} style={{
                  width: '34px', height: '34px', fontSize: '18px',
                  background: form.emoji === e ? 'var(--cream-light)' : '#fff',
                  border: form.emoji === e ? '2px solid var(--orange)' : '1.5px solid var(--line)',
                  borderRadius: '8px', cursor: 'pointer'
                }}>{e}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>商品名稱 *</label>
            <input type="text" style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>英文標語</label>
            <input type="text" style={inputStyle} value={form.tagline || ''} onChange={e => setForm({ ...form, tagline: e.target.value })} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
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
              <option value="本月限定">本月限定</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>商品介紹</label>
          <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
            value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })}
            placeholder="口感、用料、風味描述..." />
        </div>

        {/* ⭐ 新增的 3 個欄位 */}
        <div style={{
          background: 'var(--cream-light)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '14px',
          border: '1px dashed var(--line)'
        }}>
          <div className="fredoka" style={{
            fontSize: '12px', color: 'var(--brown)', fontWeight: 700,
            marginBottom: '10px', letterSpacing: '0.5px'
          }}>商品詳細資訊(可選,會顯示在彈窗)</div>

          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>📏 規格/尺寸</label>
            <input type="text" style={inputStyle}
              value={form.specs || ''}
              onChange={e => setForm({ ...form, specs: e.target.value })}
              placeholder="例:6 吋圓形 / 8 入禮盒 / 約 200g" />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>🧊 保存方式</label>
            <input type="text" style={inputStyle}
              value={form.storage || ''}
              onChange={e => setForm({ ...form, storage: e.target.value })}
              placeholder="例:冷藏 7 天,常溫 2 天" />
          </div>

          <div>
            <label style={labelStyle}>⚠️ 過敏原</label>
            <input type="text" style={inputStyle}
              value={form.allergens || ''}
              onChange={e => setForm({ ...form, allergens: e.target.value })}
              placeholder="例:含蛋、奶、麵粉、堅果" />
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '18px', color: 'var(--brown)' }}>
          <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} style={{ width: '18px', height: '18px' }} />
          <span>立即上架(客戶可見)</span>
        </label>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {!isNew && (
            <button onClick={() => { if (confirm(`確定刪除「${form.name}」?`)) onDelete(form.id) }} style={{
              padding: '10px 16px', background: '#fff', color: 'var(--red)',
              border: '2px solid var(--red-light)', borderRadius: '999px',
              fontSize: '13px', cursor: 'pointer', fontWeight: 600
            }}>🗑 刪除</button>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={onCancel} style={{
            padding: '10px 18px', background: 'transparent',
            border: '2px solid var(--line)', borderRadius: '999px',
            fontSize: '13px', cursor: 'pointer', color: 'var(--muted)', fontWeight: 600
          }}>取消</button>
          <button onClick={() => {
            if (!form.name.trim()) { alert('請輸入商品名稱'); return }
            if (!form.price || form.price <= 0) { alert('請輸入有效價格'); return }
            onSave(form)
          }} className="fredoka btn-orange" style={{
            padding: '11px 24px', background: 'var(--orange)', color: '#fff',
            border: 'none', borderRadius: '999px',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer'
          }}>儲存</button>
        </div>
      </div>
    </div>
  )
}
