# 胎動記錄 PWA

給太太在手機上用的極簡胎動記錄小工具。打開就是一個大按鈕,點一下記下當下時間;下方顯示今天的次數與時間列表,可刪除最後一筆。資料只存在手機本機(localStorage),不需帳號、不需網路。

## 功能

- 佔大半螢幕的大按鈕,點一下記錄當下「時:分」
- 今天的次數統計 + 時間列表(最新在最上)
- 「刪除最後一筆」(會跳出確認,避免誤刪)
- 自動深色 / 淺色(跟隨手機系統,深夜不刺眼)
- PWA:可加到主畫面、全螢幕開啟、離線也能用

## 在電腦上預覽 / 測試

Service Worker 需透過 `http(s)`,不能直接雙擊 `index.html`(`file://`)。在本資料夾啟動簡易伺服器:

```bash
# 已安裝 Python
python -m http.server 8000
```

瀏覽器開 <http://localhost:8000>(localhost 視為安全來源,PWA 功能可運作)。

## 部署到網路(取得 HTTPS 網址)

擇一即可,都免費:

### 方式 A：GitHub Pages
1. 把整個資料夾的檔案推到一個 GitHub repo。
2. repo → Settings → Pages → Source 選 `main` 分支、根目錄 `/`。
3. 等一兩分鐘,會給你一個 `https://<帳號>.github.io/<repo>/` 網址。

### 方式 B：Netlify / Cloudflare Pages（拖拉上傳）
1. 登入 Netlify(或 Cloudflare Pages)。
2. 把這個資料夾直接拖到「Deploy / Drop」區。
3. 取得 `https://....netlify.app` 之類的網址。

把網址傳給太太一次即可。

## 加到手機主畫面

### iPhone（Safari）
開啟網址 → 底部「分享」鈕 → 「加入主畫面」→ 完成。從主畫面圖示開啟即為全螢幕。

### Android（Chrome）
開啟網址 → 右上「⋮」→ 「加到主畫面」/「安裝應用程式」→ 完成。

## 檔案說明

| 檔案 | 用途 |
|---|---|
| `index.html` | 頁面結構 |
| `style.css` | 樣式、深色模式、大按鈕排版 |
| `app.js` | 記錄/刪除/渲染/localStorage、註冊 Service Worker |
| `manifest.json` | PWA 設定(名稱、圖示、全螢幕) |
| `sw.js` | Service Worker(離線快取) |
| `icons/` | 主畫面圖示(192 / 512) |

## 更新版本

改完檔案重新部署即可。若手機上的離線快取沒更新,把 `sw.js` 裡的 `CACHE = "taidong-v1"` 改成 `v2`(以此類推)再部署,即可強制更新快取。

## 資料

- 全部存在該裝置瀏覽器的 localStorage(key: `kicks`),不會上傳。
- 清除瀏覽器資料或解除安裝可能會清掉紀錄。
- 儲存的是完整時間戳,畫面只顯示時:分,未來要加統計/匯出不需重做。
