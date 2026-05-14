# Amy's 點心俱樂部 — 線上預購系統

完整的甜點預購系統,使用 React + Supabase 開發。

## 🎯 功能總覽

### 客戶端
- 商品瀏覽(可直接在卡片上加減數量)
- 商品詳細頁
- 購物車管理(增減/移除)
- 結帳流程(姓名/電話/取貨日/備註)
- 訂購成功 + QR Code 保存訂單

### 後台
- 帳號密碼登入
- 即時訂單管理(新訂單會自動推播)
- 商品管理 + 照片上傳
- 取貨日自由設定
- 店家資訊設定

---

## 🚀 上線教學(完整步驟)

### STEP 1:設定 Supabase 資料庫

1. 前往 https://supabase.com 註冊帳號
2. 點「New Project」,填寫:
   - Name: `amys-dessert-club`
   - Database Password: **記下這組密碼**
   - Region: **Northeast Asia (Tokyo)**
   - Plan: **Free**
3. 等待約 2 分鐘建置完成
4. 進入專案後,左邊選單點「**SQL Editor**」→「**New query**」
5. 開啟本專案的 `supabase/schema.sql` 檔案,**完整複製貼上** → 點右下 RUN ▶️
6. 看到綠色 Success 表示完成 ✅

### STEP 2:取得 Supabase 金鑰

1. 進入 Supabase Dashboard
2. 左邊選單 → **Settings** → **API**
3. 複製這兩個值:
   - **Project URL**(類似 `https://xxxxxxxx.supabase.co`)
   - **anon public key**(很長一串 `eyJhb...`)

### STEP 3:本機開發環境設定

```bash
# 1. 安裝 Node.js (官網下載 LTS 版本) https://nodejs.org

# 2. 在專案資料夾打開終端機,執行:
npm install

# 3. 複製環境變數範本
cp .env.example .env

# 4. 編輯 .env,填入 Supabase 連線資訊
```

**`.env` 內容範例:**
```env
VITE_SUPABASE_URL=https://你的專案.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon金鑰
VITE_ADMIN_USER=amy
VITE_ADMIN_PASS=改成你想要的密碼
```

### STEP 4:本機測試

```bash
npm run dev
```

瀏覽器會自動開啟 http://localhost:5173,你應該會看到網站!

**測試項目:**
- [ ] 商品列表正常顯示
- [ ] 加減數量正常
- [ ] 結帳流程能完成
- [ ] 訂單成功頁有 QR Code
- [ ] 後台可登入(預設 amy / amy123)
- [ ] 後台能看到剛剛的訂單
- [ ] 後台可修改商品

### STEP 5:部署到 Vercel(免費上線)

1. 把專案推到 GitHub:
   ```bash
   git init
   git add .
   git commit -m "first commit"
   # 然後到 github.com 建立 repo,照網頁指示推上去
   ```

2. 前往 https://vercel.com 用 GitHub 帳號登入

3. 點「**Add New** → **Project**」

4. 選擇剛剛的 repo → 點 Import

5. 在 **Environment Variables** 區塊新增 3 個變數:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_USER`(可選,預設 amy)
   - `VITE_ADMIN_PASS`(可選,預設 amy123)

6. 點 **Deploy** → 等 30 秒 → 拿到網址! 🎉

7. 把網址(例 `https://amys-xxx.vercel.app`)傳給客人

---

## 💰 成本

| 項目 | 月費 |
|------|------|
| Supabase 免費版 | NT$ 0(500MB 資料庫 + 5GB 流量) |
| Vercel 免費版 | NT$ 0(100GB 流量) |
| 域名(可選) | NT$ 50~80/月(年費約 600-800) |
| **合計** | **NT$ 0(用 Vercel 預設網址即可)** |

---

## 📁 專案結構

```
amys-dessert-club/
├── public/                    # 靜態檔案
├── src/
│   ├── components/            # 可重用元件
│   │   ├── CartItem.jsx       # 購物車單項
│   │   ├── ProductCard.jsx    # 商品卡
│   │   ├── ProductDetail.jsx  # 商品詳細
│   │   ├── QRCode.jsx         # QR Code 元件
│   │   └── Toast.jsx          # 提示訊息
│   ├── pages/                 # 頁面
│   │   ├── Browse.jsx         # 商品瀏覽
│   │   ├── Checkout.jsx       # 結帳
│   │   ├── Success.jsx        # 訂購成功
│   │   └── Admin.jsx          # 後台
│   ├── lib/
│   │   ├── supabase.js        # Supabase 連線
│   │   ├── api.js             # API 封裝
│   │   └── utils.js           # 工具函式
│   ├── App.jsx                # 主程式
│   ├── main.jsx               # 入口
│   └── index.css              # 全域樣式
├── supabase/
│   └── schema.sql             # 資料庫建置 SQL
├── .env.example               # 環境變數範本
├── index.html                 # HTML 入口
├── package.json               # 依賴設定
└── vite.config.js             # Vite 設定
```

---

## 🔔 進階:加 LINE 通知(選做)

讓新訂單自動推播到你的 LINE。

### 1. 申請 LINE Notify Token
- 前往 https://notify-bot.line.me/zh_TW/
- 登入 LINE → 個人頁面 → 發行存取權杖
- 名稱填「Amy's 訂單通知」
- 接收方選「透過 1 對 1 聊天接收」
- **複製 Token 保存**(只會顯示一次!)

### 2. 在 Supabase 設定 Edge Function
詳見 `supabase/edge-functions/notify-line.ts`(進階教學另行提供)

---

## ❓ 常見問題

**Q: 我改了 .env 但網站沒變化?**
A: 改完 .env 後要重新執行 `npm run dev`

**Q: 後台登入帳密在哪裡改?**
A: 改 `.env` 的 `VITE_ADMIN_USER` 和 `VITE_ADMIN_PASS`,然後重新部署

**Q: Supabase 連不上?**
A: 檢查 `.env` 的 URL 和 KEY 有沒有寫對,確認 RUN 過 schema.sql

**Q: 訂單沒有即時更新?**
A: 確認 schema.sql 有跑完整(包含 `ALTER PUBLICATION supabase_realtime`)

**Q: 客戶能看到我的後台嗎?**
A: 後台需要帳密才能進,但網址是公開的。建議改一組強密碼。
   未來進階版可以另外架管理後台網域。

---

## 📞 還需要幫忙

如果遇到問題,常見的解法:
1. 檢查 Supabase Dashboard → Logs 看有沒有錯誤
2. 瀏覽器按 F12 開啟「Console」看錯誤訊息
3. 確認 `.env` 變數名稱拼字正確(注意 `VITE_` 前綴)

---

製作:2025
