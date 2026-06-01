-- =====================================================
-- Amy's 點心俱樂部 v2 - 資料庫升級腳本
-- 在 Supabase Dashboard → SQL Editor 完整貼上執行
-- 重複跑也不會出錯,可以安心執行
-- =====================================================

-- ====== 1. 資料表 ======

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

CREATE TABLE IF NOT EXISTS pickup_rules (
  id TEXT PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  location TEXT NOT NULL,
  note TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====== 新增:會員表(自動從訂單建立) ======
CREATE TABLE IF NOT EXISTS members (
  phone TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  first_order_at TIMESTAMPTZ DEFAULT NOW(),
  last_order_at TIMESTAMPTZ DEFAULT NOW(),
  total_orders INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  note TEXT DEFAULT '',
  tag TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====== 2. 索引 ======
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_pickup_date ON orders(pickup_date);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_members_last_order ON members(last_order_at DESC);

-- ====== 3. 更新時間戳 ======
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====== 4. 扣庫存 ======
CREATE OR REPLACE FUNCTION decrement_stock(product_id TEXT, qty INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE products SET stock = GREATEST(0, stock - qty), updated_at = NOW()
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- ====== 5. 新訂單自動建立/更新會員 ======
CREATE OR REPLACE FUNCTION upsert_member_from_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO members (phone, name, first_order_at, last_order_at, total_orders, total_spent)
  VALUES (NEW.customer_phone, NEW.customer_name, NEW.created_at, NEW.created_at, 1, NEW.total)
  ON CONFLICT (phone) DO UPDATE SET
    name = EXCLUDED.name,
    last_order_at = NEW.created_at,
    total_orders = members.total_orders + 1,
    total_spent = members.total_spent + NEW.total,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_order_create_member ON orders;
CREATE TRIGGER on_order_create_member
AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION upsert_member_from_order();

-- ====== 6. 即時訂閱(安全版,重複跑不會錯) ======
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'products') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
  END IF;
END $$;

-- ====== 7. RLS 開啟 ======
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view products" ON products;
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can manage products" ON products;
CREATE POLICY "Public can manage products" ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view pickup_rules" ON pickup_rules;
CREATE POLICY "Public can view pickup_rules" ON pickup_rules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can manage pickup_rules" ON pickup_rules;
CREATE POLICY "Public can manage pickup_rules" ON pickup_rules FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view settings" ON settings;
CREATE POLICY "Public can view settings" ON settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can manage settings" ON settings;
CREATE POLICY "Public can manage settings" ON settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can manage orders" ON orders;
CREATE POLICY "Public can manage orders" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can manage members" ON members;
CREATE POLICY "Public can manage members" ON members FOR ALL USING (true) WITH CHECK (true);

-- ====== 8. 預設資料 ======
INSERT INTO settings (key, value) VALUES (
  'shop_info',
  '{
    "shopName": "Amy''s 點心俱樂部",
    "tagline": "Cinnamon Rolls · Cakes · Good Vibes",
    "subtitle": "從咖啡廳到甜點俱樂部",
    "story": "從一間小小的咖啡廳開始,到現在的甜點俱樂部,我們堅持手作、用心,做出讓你記得的味道。",
    "since": "2012",
    "leadDays": 3,
    "contactLine": "@amys_dessert",
    "contactPhone": ""
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

INSERT INTO pickup_rules (id, day_of_week, location, note, active) VALUES
  ('dow2', 2, '冬山取貨', '', true),
  ('dow3', 3, '宜蘭面交', '地點另行約定', true),
  ('dow4', 4, '冬山取貨', '', true),
  ('dow5', 5, '冬山取貨', '', true),
  ('dow6', 6, '冬山取貨', '', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, tagline, price, description, emoji, stock, active, tag, display_order) VALUES
  ('p1', '經典肉桂捲', 'Classic Cinnamon Roll', 120, '隔夜低溫發酵的布里歐麵團,層層捲入肉桂紅糖,出爐後淋上楓糖奶油霜。', '🥐', 20, true, '招牌', 1),
  ('p2', '鳳梨奶油乳酪肉桂捲', 'Pineapple Cream Cheese', 150, '經典肉桂捲的升級版,加入新鮮鳳梨丁與奶油乳酪。', '🍍', 12, true, '人氣', 2),
  ('p3', '百香果鳳梨肉桂捲', 'Passion Pineapple', 150, '酸甜清爽的夏日風味,百香果香氣搭配鳳梨清甜。', '🥭', 10, true, '本月限定', 3),
  ('p4', '六吋千層蛋糕', 'Crepe Cake 6inch', 850, '32 層手工煎製的薄餅,夾入輕盈鮮奶油與焦糖醬。', '🎂', 4, true, '限量', 4),
  ('p5', '紐約乳酪蛋糕', 'NY Cheesecake', 380, '費城奶油乳酪與法國發酵奶油,綿密不甜膩。', '🧀', 8, true, '', 5),
  ('p6', '秘製布朗尼', 'Fudge Brownie', 150, '75% 黑巧克力與核桃,外酥內潤。', '🍫', 24, true, '', 6),
  ('p7', '花生醬巧克力餅乾', 'PB Choco Chip', 60, '美式花生醬與可可碎粒,外酥內軟。', '🍪', 50, true, '', 7),
  ('p8', '檸檬塔', 'Lemon Tart', 180, '現榨檸檬汁酸甜內餡,義式蛋白霜微微炙烤。', '🍋', 12, true, '新品', 8)
ON CONFLICT (id) DO NOTHING;

-- ====== 9. 一次性:同步既有訂單到 members 表 ======
INSERT INTO members (phone, name, first_order_at, last_order_at, total_orders, total_spent)
SELECT 
  customer_phone,
  MAX(customer_name) as name,
  MIN(created_at) as first_order_at,
  MAX(created_at) as last_order_at,
  COUNT(*) as total_orders,
  SUM(total) as total_spent
FROM orders
GROUP BY customer_phone
ON CONFLICT (phone) DO UPDATE SET
  total_orders = EXCLUDED.total_orders,
  total_spent = EXCLUDED.total_spent,
  first_order_at = LEAST(members.first_order_at, EXCLUDED.first_order_at),
  last_order_at = GREATEST(members.last_order_at, EXCLUDED.last_order_at);

-- ✅ 完成!
