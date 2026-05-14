-- =====================================================
-- Amy's 點心俱樂部 - Supabase 資料庫建置
-- 將此檔案內容貼到 Supabase Dashboard → SQL Editor 執行
-- =====================================================

-- ====== 1. 建立資料表 ======

-- 商品表
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  description TEXT,
  emoji TEXT DEFAULT '🍰',
  image_url TEXT,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  active BOOLEAN DEFAULT true,
  tag TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 取貨日設定表
CREATE TABLE IF NOT EXISTS pickup_rules (
  id TEXT PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  location TEXT NOT NULL,
  note TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 訂單表
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_no TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_location TEXT NOT NULL,
  pickup_rule_id TEXT,
  note TEXT DEFAULT '',
  total INTEGER NOT NULL CHECK (total >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  items JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 店家設定表
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====== 2. 建立索引(加快查詢) ======
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_pickup_date ON orders(pickup_date);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

-- ====== 3. 自動更新時間戳 ======
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====== 4. 扣庫存的 SQL 函式 ======
CREATE OR REPLACE FUNCTION decrement_stock(product_id TEXT, qty INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - qty),
      updated_at = NOW()
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- ====== 5. 啟用即時訂閱(讓後台可以即時收到新訂單) ======
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- ====== 6. 啟用 Row Level Security (RLS) ======
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 商品:任何人都可以看(包含未上架的,給後台用)
DROP POLICY IF EXISTS "Public can view products" ON products;
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);

-- 商品:任何人都可以新增/修改/刪除(後台用,實務上前端會擋)
DROP POLICY IF EXISTS "Public can manage products" ON products;
CREATE POLICY "Public can manage products" ON products FOR ALL USING (true) WITH CHECK (true);

-- 取貨日:任何人都可以看/管理
DROP POLICY IF EXISTS "Public can view pickup_rules" ON pickup_rules;
CREATE POLICY "Public can view pickup_rules" ON pickup_rules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can manage pickup_rules" ON pickup_rules;
CREATE POLICY "Public can manage pickup_rules" ON pickup_rules FOR ALL USING (true) WITH CHECK (true);

-- 設定:任何人都可以看/修改
DROP POLICY IF EXISTS "Public can view settings" ON settings;
CREATE POLICY "Public can view settings" ON settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can manage settings" ON settings;
CREATE POLICY "Public can manage settings" ON settings FOR ALL USING (true) WITH CHECK (true);

-- 訂單:任何人都可以下單/查看/管理
DROP POLICY IF EXISTS "Public can manage orders" ON orders;
CREATE POLICY "Public can manage orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- ====== 7. 預設資料 ======

-- 預設店家設定
INSERT INTO settings (key, value) VALUES (
  'shop_info',
  '{
    "shopName": "Amy''s 點心俱樂部",
    "tagline": "Baked with love",
    "subtitle": "宜蘭在地 · 純手工烘焙 · 預購制",
    "story": "每一份點心都從 Amy 的廚房出發。我們使用進口奶油、有機雞蛋與天然原料,拒絕香精與防腐劑,只想把最單純的甜點幸福感送到你手中。",
    "leadDays": 3,
    "contactLine": "@amys_dessert",
    "contactPhone": ""
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- 預設取貨日
INSERT INTO pickup_rules (id, day_of_week, location, note, active) VALUES
  ('dow2', 2, '冬山取貨', '', true),
  ('dow3', 3, '宜蘭面交', '地點另行約定', true),
  ('dow4', 4, '冬山取貨', '', true),
  ('dow5', 5, '冬山取貨', '', true),
  ('dow6', 6, '冬山取貨', '', true)
ON CONFLICT (id) DO NOTHING;

-- 預設商品
INSERT INTO products (id, name, tagline, price, description, emoji, stock, active, tag, display_order) VALUES
  ('p1', '經典胡蘿蔔核桃蛋糕', 'Carrot Cake', 420, '手磨肉桂粉與新鮮胡蘿蔔絲烘烤,厚實奶油乳酪霜搭配烤香核桃。', '🥕', 8, true, '招牌', 1),
  ('p2', '紐約乳酪蛋糕', 'NY Cheesecake', 380, '費城奶油乳酪與法國發酵奶油,綿密不甜膩,紐約街角咖啡店的經典復刻。', '🧀', 10, true, '人氣', 2),
  ('p3', '秘製布朗尼', 'Fudge Brownie', 150, '75% 黑巧克力與核桃,外酥內潤。', '🍫', 24, true, '', 3),
  ('p4', '花生醬巧克力餅乾', 'PB Choco Chip', 60, '美式花生醬與可可碎粒,外酥內軟。', '🍪', 50, true, '', 4),
  ('p5', '蘋果派', 'Apple Pie', 480, '手工千層派皮,富士蘋果搭配肉桂紅糖慢燉。6吋。', '🥧', 6, true, '限量', 5),
  ('p6', '肉桂捲', 'Cinnamon Roll', 120, '隔夜低溫發酵的布里歐麵團,淋上楓糖奶油霜。', '🥐', 20, true, '', 6),
  ('p7', '雙層巧克力杯子蛋糕', 'Choco Cupcake', 90, '可可蛋糕體加瑞士蛋白奶油霜,頂部撒上黑巧克力碎片。', '🧁', 15, true, '', 7),
  ('p8', '檸檬塔', 'Lemon Tart', 180, '現榨檸檬汁酸甜內餡,義式蛋白霜微微炙烤。', '🍋', 12, true, '新品', 8)
ON CONFLICT (id) DO NOTHING;

-- ✅ 完成!
