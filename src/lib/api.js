import { supabase } from './supabase'

// ============ 商品 ============
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products').select('*').order('display_order', { ascending: true })
  if (error) throw error
  return (data || []).map(p => ({
    id: p.id, name: p.name, tagline: p.tagline, price: p.price,
    desc: p.description, emoji: p.emoji, image: p.image_url,
    stock: p.stock, active: p.active, tag: p.tag, displayOrder: p.display_order
  }))
}

export async function saveProduct(product) {
  const payload = {
    id: product.id || 'p' + Date.now(),
    name: product.name, tagline: product.tagline || '',
    price: product.price, description: product.desc || '',
    emoji: product.emoji || '🍰', image_url: product.image || '',
    stock: product.stock, active: product.active,
    tag: product.tag || '', display_order: product.displayOrder || 0
  }
  const { data, error } = await supabase.from('products').upsert(payload).select().single()
  if (error) throw error
  return data
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

// ============ 取貨日 ============
export async function fetchPickups() {
  const { data, error } = await supabase.from('pickup_rules').select('*').order('day_of_week', { ascending: true })
  if (error) throw error
  return (data || []).map(p => ({
    id: p.id, dow: p.day_of_week, location: p.location, note: p.note, active: p.active
  }))
}

export async function savePickup(pickup) {
  const payload = {
    id: pickup.id || 'pk' + Date.now(),
    day_of_week: pickup.dow, location: pickup.location,
    note: pickup.note || '', active: pickup.active
  }
  const { data, error } = await supabase.from('pickup_rules').upsert(payload).select().single()
  if (error) throw error
  return data
}

export async function deletePickup(id) {
  const { error } = await supabase.from('pickup_rules').delete().eq('id', id)
  if (error) throw error
}

// ============ 訂單 ============
function mapOrder(o) {
  return {
    id: o.id, orderNo: o.order_no, name: o.customer_name, phone: o.customer_phone,
    pickupDate: o.pickup_date, pickupLocation: o.pickup_location,
    pickupRuleId: o.pickup_rule_id, note: o.note,
    total: o.total, status: o.status, items: o.items, createdAt: o.created_at
  }
}

export async function fetchOrders() {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(mapOrder)
}

/**
 * 自訂錯誤類別:讓前端可以分辨「庫存不足」vs「其他系統錯誤」
 */
export class OrderError extends Error {
  constructor(code, friendlyMessage, originalError) {
    super(friendlyMessage)
    this.code = code              // 'STOCK_INSUFFICIENT' | 'NETWORK' | 'UNKNOWN'
    this.friendlyMessage = friendlyMessage
    this.originalError = originalError
  }
}

/**
 * 建立訂單 - 使用資料庫的 create_order_safe 函式
 * 
 * 為什麼這樣寫?
 * 1. 訂單編號由 PostgreSQL SEQUENCE 產生,絕對不會重複
 * 2. 庫存檢查、寫入訂單、扣庫存 → 全部在資料庫一個 transaction 完成,失敗會自動 rollback
 * 3. 即使顧客 A B 同時下單,資料庫的 SEQUENCE 也會給不同編號
 * 4. 撞號的話資料庫會自動重試 5 次
 */
export async function createOrder(orderData) {
  try {
    const { data, error } = await supabase.rpc('create_order_safe', {
      p_customer_name: orderData.name,
      p_customer_phone: orderData.phone,
      p_pickup_date: orderData.pickupDate,
      p_pickup_location: orderData.pickupLocation,
      p_pickup_rule_id: orderData.pickupRuleId || null,
      p_note: orderData.note || '',
      p_total: orderData.total,
      p_items: orderData.items
    })

    if (error) {
      // 完整錯誤寫到 console 給工程師看
      console.error('[createOrder] Supabase error:', error)

      const errMsg = error.message || ''

      // 庫存不足
      if (errMsg.includes('STOCK_INSUFFICIENT')) {
        const parts = errMsg.split(':')
        const productName = parts[1] || '某項商品'
        const currentStock = parts[2] || '0'
        throw new OrderError(
          'STOCK_INSUFFICIENT',
          `很抱歉,「${productName}」的庫存僅剩 ${currentStock} 份,請返回購物車調整數量後再試。`,
          error
        )
      }

      // 商品不存在
      if (errMsg.includes('PRODUCT_NOT_FOUND')) {
        throw new OrderError(
          'PRODUCT_NOT_FOUND',
          '購物車中有商品已下架,請重新整理頁面後再試。',
          error
        )
      }

      // 編號產生失敗(理論上不會發生)
      if (errMsg.includes('ORDER_NO_GENERATE_FAILED')) {
        throw new OrderError(
          'ORDER_NO_GENERATE_FAILED',
          '訂單送出時發生問題,請稍後再試一次,或截圖聯絡我們協助處理。',
          error
        )
      }

      // 其他資料庫錯誤
      throw new OrderError(
        'UNKNOWN',
        '訂單送出時發生問題,請稍後再試一次,或截圖聯絡我們協助處理。',
        error
      )
    }

    // RPC 回傳是陣列,取第一筆
    const result = Array.isArray(data) ? data[0] : data
    if (!result) {
      throw new OrderError('UNKNOWN', '訂單建立失敗,請稍後再試。')
    }

    // 組回完整訂單物件(因為 RPC 只回傳 id/no/created_at)
    return {
      id: result.out_id,
      orderNo: result.out_order_no,
      createdAt: result.out_created_at,
      name: orderData.name,
      phone: orderData.phone,
      pickupDate: orderData.pickupDate,
      pickupLocation: orderData.pickupLocation,
      pickupRuleId: orderData.pickupRuleId,
      note: orderData.note || '',
      total: orderData.total,
      items: orderData.items,
      status: 'pending'
    }
  } catch (err) {
    // 已經是 OrderError 直接往外拋
    if (err instanceof OrderError) throw err

    // 網路錯誤
    console.error('[createOrder] Network/unexpected error:', err)
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new OrderError(
        'NETWORK',
        '網路連線不穩,請確認網路狀態後再試一次。',
        err
      )
    }

    throw new OrderError(
      'UNKNOWN',
      '訂單送出時發生問題,請稍後再試一次,或截圖聯絡我們協助處理。',
      err
    )
  }
}

export async function updateOrderStatus(id, status) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}

export async function deleteOrder(id) {
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) throw error
}

// ============ 設定 ============
export async function fetchSettings() {
  const { data, error } = await supabase.from('settings').select('*').eq('key', 'shop_info').single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data?.value || null
}

export async function saveSettings(settings) {
  const { error } = await supabase.from('settings').upsert({ key: 'shop_info', value: settings })
  if (error) throw error
}

// ============ 即時訂閱 ============
export function subscribeToOrders(callback) {
  const channel = supabase.channel('orders-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
    .subscribe()
  return () => supabase.removeChannel(channel)
}

// ============ 會員 ============
export async function fetchMembers() {
  const { data, error } = await supabase.from('members').select('*').order('last_order_at', { ascending: false })
  if (error) throw error
  return (data || []).map(m => ({
    phone: m.phone, name: m.name,
    firstOrderAt: m.first_order_at, lastOrderAt: m.last_order_at,
    totalOrders: m.total_orders, totalSpent: m.total_spent,
    note: m.note, tag: m.tag
  }))
}

export async function updateMember(phone, updates) {
  const payload = {}
  if (updates.name !== undefined) payload.name = updates.name
  if (updates.note !== undefined) payload.note = updates.note
  if (updates.tag !== undefined) payload.tag = updates.tag
  const { error } = await supabase.from('members').update(payload).eq('phone', phone)
  if (error) throw error
}

export async function deleteMember(phone) {
  const { error } = await supabase.from('members').delete().eq('phone', phone)
  if (error) throw error
}

// ============ 統計 ============
export async function fetchAnalytics() {
  const { data: orders, error } = await supabase.from('orders').select('*').neq('status', 'cancelled')
  if (error) throw error
  return orders || []
}
