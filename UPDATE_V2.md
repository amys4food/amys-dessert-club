# 🎂 v2 升級教學(超詳細,跟著做不會錯)

> 你已經有 v1 在線上跑了,這份是教你**安全升級到 v2**

---

## ✨ v2 新功能

1. ✅ 全新視覺風格(Pinterest 手繪美式插畫風,橘黃 + 童趣藍紅)
2. ✅ 修復手機後台空白問題(全面 RWD)
3. ✅ 完成的訂單可以刪除(不再永久卡在列表)
4. ✅ **營業額統計分析**(像 POS,查日/月/年,熱銷商品排行)
5. ✅ **會員管理系統**(自動從訂單建立,可加標籤、備註)

---

## 📋 升級流程(預估 30 分鐘)

### STEP 1:備份你的舊版(以防萬一)

把舊的專案資料夾整個複製一份,例如:
```
C:\Users\amanda\Downloads\amys-dessert-club           ← 現有的
C:\Users\amanda\Downloads\amys-dessert-club-old       ← 備份這份
```

> 萬一新版有問題,你還可以回到舊版。

---

### STEP 2:升級 Supabase 資料庫(只跑一次)

1. 打開 https://supabase.com → 登入 → 進入你的專案
2. 左邊「**SQL Editor**」→「**New query**」
3. 把新版的 `supabase/schema.sql` **完整貼上**
4. 點 **RUN** ▶️

> ⚠️ 我已經把所有指令都改成「安全版」,**不會刪掉舊資料,只會新增功能**:
> - 新增 `members` 會員表
> - 新增自動建立會員的觸發器
> - 把你**現有的訂單自動同步成會員**
> - 重複跑也不會出錯

跑完應該看到綠色 Success ✅

---

### STEP 3:把舊專案替換成新版

1. 把新版的 zip 下載解壓
2. **保留你舊資料夾的 `.env`** 檔案(裡面有你的 Supabase 連線資訊)
3. **刪除舊資料夾**(`amys-dessert-club` 整個刪掉,但 .env 先備份)
4. **把新解壓的資料夾改名**為 `amys-dessert-club`,放回原本位置
5. **把 .env 複製進去**新資料夾

### STEP 4:本機測試新版

打開 PowerShell,進到專案資料夾:

```powershell
cd C:\Users\amanda\Downloads\amys-dessert-club
npm install
npm run dev
```

> 注意:因為新增了 `recharts`(圖表庫),所以一定要再跑一次 `npm install`

打開 http://localhost:5173 → 應該看到**全新的橘黃手繪風**首頁! 🎨

---

### STEP 5:部署上線(覆蓋現有 Vercel 網站)

因為你已經連 GitHub Desktop 了,只要兩步:

1. 打開 **GitHub Desktop**
2. 它會自動偵測到你的檔案有變更(左邊會列出一堆紅綠色的改動)
3. 下方填寫 Summary:`v2 升級 - 新風格 + 會員 + 統計`
4. 點「**Commit to main**」
5. 點上方「**Push origin**」

→ Vercel 會在 1 分鐘內自動重新部署你的網站!

打開 https://amys-dessert-club.vercel.app/ → 看到新版本 ✅

---

## 🎯 試試新功能

### 1. 統計分析
- 進後台 → 點「📊 統計」
- 可以切換 7 天 / 30 天 / 90 天 / 全部
- 折線圖看營業額趨勢
- 長條圖看熱銷商品排行

### 2. 會員管理
- 進後台 → 點「👥 會員」
- 你之前的訂單已經自動轉成會員了
- 點任一會員可以看詳情、加標籤、寫備註
- 消費 3 次以上自動標記為 ⭐ VIP

### 3. 刪除完成訂單
- 進「📦 訂單」分頁
- 找到「已完成」或「已取消」的訂單
- 會看到「🗑 刪除訂單」按鈕

### 4. 手機後台
- 用手機打開 https://amys-dessert-club.vercel.app
- 進後台 → 不再空白!
- Tab 可以橫向滑動
- 統計卡片改成單欄

---

## 🆘 如果遇到問題

### Q: npm install 失敗?
A: 試試 `npm install --legacy-peer-deps`

### Q: 部署後網站打不開?
A: 去 Vercel Dashboard → 看 Deployment 有沒有紅字錯誤,截圖給我

### Q: 統計分頁空白?
A: 確認 Supabase 的 schema.sql 有跑完整,特別是 members 那段

### Q: 會員列表是空的?
A: schema.sql 最後有一段「同步既有訂單到 members」,如果你有訂單但列表空,代表那段沒跑成功 → 把 schema.sql 重跑一次

### Q: 我想回到舊版?
A: 把備份的 amys-dessert-club-old 改回 amys-dessert-club,push 上去就好。Supabase 那邊的會員表不會影響舊版運作。

---

任何問題都可以截圖問我,我們一起搞定! 💪
