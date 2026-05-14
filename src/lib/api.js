import { supabase } from './supabase'

// ============ 商品 ============
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  return (data || []).map(p => ({
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    price: p.price,
    desc: p.description,
    emoji: p.emoji,
    image: p.image_url,
    stock: p.stock,
    active: p.active,
    tag: p.tag,
    displayOrder: p.display_order
  }))
}

export async function saveProduct(product) {
  const payload = {
    id: product.id || 'p' + Date.now(),
    name: product.name,
    tagline: product.tagline || '',
    price: product.price,
    description: product.desc || '',
    emoji: product.emoji || '🍰',
    image_url: product.image || '',
    stock: product.stock,
    active: product.active,
    tag: product.tag || '',
    display_order: product.displayOrder || 0
  }
  const { data, error } = await supabase
    .from('products')
    .upsert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

// ============ 取貨日 ============
export async function fetchPickups() {
  const { data, error } = await supabase
    .from('pickup_rules')
    .select('*')
    .order('day_of_week', { ascending: true })
  if (error) throw error
  return (data || []).map(p => ({
    id: p.id,
    dow: p.day_of_week,
    location: p.location,
    note: p.note,
    active: p.active
  }))
}

export async function savePickup(pickup) {
  const payload = {
    id: pickup.id || 'pk' + Date.now(),
    day_of_week: pickup.dow,
    location: pickup.location,
    note: pickup.note || '',
    active: pickup.active
  }
  const { data, error } = await supabase
    .from('pickup_rules')
    .upsert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePickup(id) {
  const { error } = await supabase.from('pickup_rules').delete().eq('id', id)
  if (error) throw error
}

// ============ 訂單 ============
export async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(o => ({
    id: o.id,
    orderNo: o.order_no,
    name: o.customer_name,
    phone: o.customer_phone,
    pickupDate: o.pickup_date,
    pickupLocation: o.pickup_location,
    pickupRuleId: o.pickup_rule_id,
    note: o.note,
    total: o.total,
    status: o.status,
    items: o.items,
    createdAt: o.created_at
  }))
}

export async function createOrder(orderData) {
  // 取得目前訂單數,產生訂單編號
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
  
  const orderNo = '#' + String((count || 0) + 1).padStart(4, '0')
  
  const payload = {
    id: 'ORD' + Date.now(),
    order_no: orderNo,
    customer_name: orderData.name,
    customer_phone: orderData.phone,
    pickup_date: orderData.pickupDate,
    pickup_location: orderData.pickupLocation,
    pickup_rule_id: orderData.pickupRuleId,
    note: orderData.note || '',
    total: orderData.total,
    status: 'pending',
    items: orderData.items
  }
  
  const { data, error } = await supabase
    .from('orders')
    .insert(payload)
    .select()
    .single()
  
  if (error) throw error
  
  // 扣庫存
  for (const item of orderData.items) {
    await supabase.rpc('decrement_stock', {
      product_id: item.id,
      qty: item.qty
    })
  }
  
  return {
    id: data.id,
    orderNo: data.order_no,
    name: data.customer_name,
    phone: data.customer_phone,
    pickupDate: data.pickup_date,
    pickupLocation: data.pickup_location,
    note: data.note,
    total: data.total,
    status: data.status,
    items: data.items,
    createdAt: data.created_at
  }
}

export async function updateOrderStatus(id, status) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

// ============ 店家設定 ============
export async function fetchSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('key', 'shop_info')
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data?.value || null
}

export async function saveSettings(settings) {
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'shop_info', value: settings })
  if (error) throw error
}

// ============ 即時訂閱 ============
export function subscribeToOrders(callback) {
  const channel = supabase
    .channel('orders-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => callback(payload)
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}
