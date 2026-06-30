/* 胎動記錄 — 邏輯 */
(function () {
  "use strict";

  var STORAGE_KEY = "kicks";

  /* 推播設定:太太每次記錄時,會送一則通知到這個私密頻道。
     先生在 ntfy App 訂閱「完全相同」的頻道名即可收到通知。
     ⚠ 此頻道名等同密碼,知道的人都能收發,請勿外流。要更換時改這裡的字串並重新訂閱。
     若想暫時關閉通知,把它設成空字串 "" 即可。 */
  var NTFY_TOPIC = "taidong-24aactnm26oo6ak1-kicks";

  var recordBtn = document.getElementById("recordBtn");
  var deleteBtn = document.getElementById("deleteBtn");
  var listEl = document.getElementById("list");
  var countEl = document.getElementById("count");
  var emptyEl = document.getElementById("empty");

  /* ---- 資料讀寫 ---- */
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function save(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  /* ---- 日期工具 ---- */
  function isToday(iso) {
    var d = new Date(iso);
    var now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }

  function formatTime(iso) {
    var d = new Date(iso);
    var hh = String(d.getHours()).padStart(2, "0");
    var mm = String(d.getMinutes()).padStart(2, "0");
    return hh + ":" + mm;
  }

  /* 取得今天的紀錄(由新到舊),保留在原陣列中的索引 */
  function todayEntries(arr) {
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      if (isToday(arr[i])) out.push({ iso: arr[i], index: i });
    }
    out.sort(function (a, b) {
      return new Date(b.iso) - new Date(a.iso);
    });
    return out;
  }

  /* ---- 渲染 ---- */
  function render(highlightLatest) {
    var arr = load();
    var entries = todayEntries(arr);

    countEl.textContent = String(entries.length);
    listEl.innerHTML = "";

    if (entries.length === 0) {
      emptyEl.hidden = false;
      deleteBtn.hidden = true;
      return;
    }

    emptyEl.hidden = true;
    deleteBtn.hidden = false;

    var total = entries.length;
    entries.forEach(function (entry, i) {
      var li = document.createElement("li");
      if (highlightLatest && i === 0) li.className = "is-new";

      var timeSpan = document.createElement("span");
      timeSpan.className = "time";
      timeSpan.textContent = formatTime(entry.iso);

      var idxSpan = document.createElement("span");
      idxSpan.className = "idx";
      idxSpan.textContent = "第 " + (total - i) + " 次";

      li.appendChild(timeSpan);
      li.appendChild(idxSpan);
      listEl.appendChild(li);
    });
  }

  /* ---- 推播通知(加分項,失敗一律靜默,不影響本機記錄) ---- */
  function notify(timeStr) {
    if (!NTFY_TOPIC) return;
    try {
      fetch("https://ntfy.sh/" + NTFY_TOPIC, {
        method: "POST",
        body: "胎動 " + timeStr, // 中文放 body(UTF-8 OK)
        headers: { Tags: "baby" } // 顯示 👶;header 值需為 ASCII
      }).catch(function () {});
    } catch (e) {}
  }

  /* ---- 動作 ---- */
  function addRecord() {
    var arr = load();
    arr.push(new Date().toISOString());
    save(arr);

    if (navigator.vibrate) {
      try { navigator.vibrate(30); } catch (e) {}
    }
    recordBtn.classList.add("is-pressed");
    setTimeout(function () {
      recordBtn.classList.remove("is-pressed");
    }, 120);

    render(true);
    notify(formatTime(arr[arr.length - 1]));
  }

  function deleteLast() {
    var arr = load();
    var entries = todayEntries(arr);
    if (entries.length === 0) return;

    var latest = entries[0]; // 今天最新的一筆
    var timeStr = formatTime(latest.iso);
    if (!window.confirm("確定要刪除最後一筆紀錄(" + timeStr + ")嗎?")) return;

    arr.splice(latest.index, 1);
    save(arr);
    render(false);
  }

  /* ---- 綁定 ---- */
  recordBtn.addEventListener("click", addRecord);
  deleteBtn.addEventListener("click", deleteLast);

  /* 跨午夜或從背景返回時,自動更新「今天」 */
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) render(false);
  });

  render(false);

  /* ---- 註冊 Service Worker(離線可用) ---- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
