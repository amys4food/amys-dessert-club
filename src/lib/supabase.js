import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ 缺少 Supabase 環境變數!請檢查 .env 檔案是否設定正確。')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 後台管理員帳密(從環境變數讀,實務上應該用 Supabase Auth)
export const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || 'amy'
export const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || 'amy123'
