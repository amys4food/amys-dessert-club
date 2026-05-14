# 🍰 Amy's 點心俱樂部 — 給商家的上線教學

> **這份教學不需要懂任何程式知識**
> 跟著步驟做,大約 1-2 小時可以上線。

---

## 📋 你需要準備

- [ ] 一台電腦(Mac 或 Windows 都行)
- [ ] 穩定的網路
- [ ] 一個 Email 信箱(用來註冊免費服務)
- [ ] 1-2 小時的時間

**全部都是免費的,不用刷卡!**

---

## 🎬 STEP 1:安裝 Node.js(只要做一次)

Node.js 是讓網站運行的工具。

### Mac 用戶:
1. 開瀏覽器到 https://nodejs.org
2. 點綠色的「**LTS**」版本下載
3. 開啟下載的 `.pkg` 檔案 → 一直按「繼續」→「安裝」
4. 完成

### Windows 用戶:
1. 開瀏覽器到 https://nodejs.org
2. 點綠色的「**LTS**」版本下載
3. 開啟下載的 `.msi` 檔案 → 一直按 Next → Install
4. 完成

### 確認安裝成功
- Mac:打開「終端機」(Terminal)
- Windows:按 `Win + R` → 輸入 `cmd` → Enter

在開啟的黑色視窗輸入:
```
node -v
```

如果看到類似 `v20.10.0` 的數字,就成功了 ✅

---

## 🎬 STEP 2:註冊 Supabase(資料庫服務,免費)

Supabase 是用來存訂單、商品資料的雲端資料庫。

### 2.1 註冊
1. 開瀏覽器到 **https://supabase.com**
2. 右上點「**Start your project**」
3. 用 GitHub 或 Email 註冊
4. 進入後 → 點「**New Project**」

### 2.2 建立專案
填寫表單:
- **Name**: `amys-dessert-club`
- **Database Password**: 設一個強密碼,**寫下來保存**
- **Region**: 選 **Northeast Asia (Tokyo)**(離台灣最近)
- **Pricing Plan**: **Free**

點 **Create new project** → 等 2 分鐘 → ✅

### 2.3 建立資料表
1. 左邊選單點「**SQL Editor**」
2. 點「**+ New query**」
3. 開啟資料夾裡的檔案:`supabase/schema.sql`
4. 把整個檔案內容複製,貼到 Supabase 的編輯框
5. 點右下「**RUN**」按鈕
6. 看到綠色「Success」=完成 ✅

### 2.4 取得連線金鑰
1. 左邊選單點「**⚙️ Settings**」→「**API**」
2. 看到兩個重要資訊,**複製到記事本保存**:
   - **Project URL** (類似 `https://abcdefg.supabase.co`)
   - **anon public** key(很長一串文字)

---

## 🎬 STEP 3:設定專案

### 3.1 解壓縮專案
1. 把 `amys-dessert-club.zip` 解壓到桌面或任意位置
2. 你會得到一個資料夾

### 3.2 設定環境變數
1. 進入資料夾
2. 找到 `.env.example` 檔案 → **複製一份** → 把複製出來的檔案改名為 `.env`
3. 用記事本(或 VS Code、Sublime Text)打開 `.env`
4. 填入你的 Supabase 資訊:

```
VITE_SUPABASE_URL=https://你的專案.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon金鑰那一長串
VITE_ADMIN_USER=amy
VITE_ADMIN_PASS=這裡換成你想要的密碼
```

5. 儲存

⚠️ **重要:後台密碼一定要改!**不然網路上的人都能登入你的後台!

### 3.3 安裝套件
- Mac:打開「終端機」
- Windows:在資料夾按住 Shift + 右鍵 → 選「在此處開啟 PowerShell」

執行:
```
cd 你的專案資料夾路徑
npm install
```

等大約 2-3 分鐘下載完成。

---

## 🎬 STEP 4:在電腦測試

執行:
```
npm run dev
```

看到類似這樣的訊息就成功:
```
VITE v5.4.0  ready in 500 ms
➜  Local:   http://localhost:5173/
```

瀏覽器會自動開啟網頁,你應該看到自己的甜點網站! 🎉

### 測試清單
試著做這些事:
- [ ] 加幾樣甜點到購物車
- [ ] 點商品看詳細頁
- [ ] 完成一筆假訂單(用真實手機號格式)
- [ ] 看到 QR Code 顯示
- [ ] 點上方「後台」→ 用 amy / 你的密碼登入
- [ ] 在後台看到剛剛的訂單
- [ ] 試著編輯一個商品 + 上傳照片

**全部都正常 ✅?準備上線囉!**

---

## 🎬 STEP 5:免費上線到 Vercel

讓全世界都能訪問你的網站。

### 5.1 註冊 GitHub
1. 前往 **https://github.com**
2. 點 **Sign up** 註冊(免費)
3. 完成驗證

### 5.2 上傳專案到 GitHub
這部分有點技術,**最簡單的方式是用 GitHub Desktop:**

1. 下載 **GitHub Desktop**: https://desktop.github.com
2. 安裝 → 用 GitHub 帳號登入
3. 點「**Add** → **Add Existing Repository**」
4. 選擇你的專案資料夾
5. 如果跳出「不是 Git repo」提示 → 點「create a repository」
6. 取個名字 → 點 Create
7. 點「**Publish repository**」
8. **取消勾選「Keep this code private」**(免費版要公開,但 .env 已經被排除不會公開)
9. 點 Publish ✅

### 5.3 部署到 Vercel
1. 前往 **https://vercel.com**
2. 點 **Sign Up** → 用 GitHub 帳號登入
3. 進入後點「**Add New** → **Project**」
4. 找到剛剛上傳的專案 → 點「**Import**」
5. 不用改任何設定,**唯一要做的**是:
   - 展開「**Environment Variables**」
   - 新增 4 個變數(跟你 `.env` 一樣):
     - `VITE_SUPABASE_URL` → 貼上 URL
     - `VITE_SUPABASE_ANON_KEY` → 貼上金鑰
     - `VITE_ADMIN_USER` → 填 `amy` 或你想要的
     - `VITE_ADMIN_PASS` → 填你的密碼
6. 點 **Deploy** → 等 30~60 秒

完成!你會看到網址,類似 `https://amys-dessert-club-xxx.vercel.app`

**把這個網址傳給客人就能下單了!** 🎉

---

## 🎉 上線後的下一步

### 1. 自訂網址(可選)
- 買一個你自己的域名(例如 amysdesserts.com)
- 在 Vercel 的 Settings → Domains 設定
- 一年約 NT$ 500-800

### 2. 把網址做成 QR Code
- 去 https://www.qr-code-generator.com 免費產生
- 印出來放在店裡或名片上

### 3. 寫宣傳貼文
- LINE 群組、IG 限動、FB 都貼一下
- 範例文案:
  ```
  🎂 Amy's 點心俱樂部 開幕!
  
  線上預購超方便,點進去就能訂 👇
  https://你的網址
  
  📍 冬山取貨 / 宜蘭面交
  💰 取貨付款,免轉帳
  🍰 8 款手作甜點等你來嘗
  ```

### 4. 上傳真實商品照片
- 進入後台 → 商品 → 編輯每一項 → 上傳照片
- 建議拍**俯視構圖**,使用自然光

---

## 🆘 遇到問題?

### 「npm install 失敗」
- 確認 Node.js 有正確安裝(`node -v` 要看得到版本)
- 試試 `npm install --legacy-peer-deps`

### 「網頁打開是空白」
- 按 F12 看 Console 有沒有紅字錯誤
- 通常是 `.env` 沒設定好,檢查 URL 和 KEY 有沒有貼對

### 「後台登入帳密錯誤」
- 確認 `.env` 的 `VITE_ADMIN_USER` 和 `VITE_ADMIN_PASS` 設定
- 改完 `.env` 要重新執行 `npm run dev`

### 「商品照片上傳失敗」
- 確認照片大小不要超過 5MB
- 試試 JPG / PNG 格式

### 「訂單沒有出現在後台」
- 確認 Supabase 的 schema.sql 有跑完整
- 到 Supabase Dashboard → Table Editor → orders 看有沒有資料

---

## 📞 進階需求

之後想要這些功能,告訴你的工程師朋友或找外包:

- **LINE 自動推播訂單通知** — 約 2 小時工時
- **串接 Epson TM-T82III 自動列印** — 約 4-6 小時工時
- **客戶查詢訂單功能** — 約 3 小時工時
- **折扣碼 / 滿額折扣** — 約 4 小時工時
- **金流串接(綠界/藍新)** — 約 8 小時工時

---

祝你開店順利! 🎂✨
