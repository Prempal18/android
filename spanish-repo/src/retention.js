/* Habla Libre — retention HUD (v1.1)
   Read-only suggestions on top of the main app's save state.
   Adds a streak/review strip under the header.
   v1.1: never fully hidden — new users get a "start your streak" hint;
   freeze wording honest; styles moved to head. Degrades silently. */
(function () {
  "use strict";

  var KEY = "freebuff.spanish.v2";
  var DAY_MS = 86400000;

  function readState() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || typeof s !== "object") return null;
      return s;
    } catch (e) { return null; }
  }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }

  function counts(s) {
    var now = Date.now();
    var dueNow = 0, dueTomorrow = 0;
    var ms = s.mistakes || {};
    for (var id in ms) {
      if (!Object.prototype.hasOwnProperty.call(ms, id)) continue;
      var due = ms[id] && ms[id].due;
      if (typeof due !== "number") continue;
      if (due <= now) dueNow++;
      else if (due <= now + DAY_MS) dueTomorrow++;
    }
    var today = todayStr();
    var dayLessons = (s.day && s.day.d === today) ? (s.day.lessons || 0) : 0;
    var streak = (s.streak && s.streak.count) || 0;
    var lastDay = s.streak && s.streak.lastDay;
    var freezes = s.freezes || 0;
    return { dueNow: dueNow, dueTomorrow: dueTomorrow, dayLessons: dayLessons, streak: streak, playedToday: lastDay === today, freezes: freezes, isNew: !streak && !lastDay };
  }

  function chip(cls, icon, text, sub) {
    return '<span class="hlr-chip ' + cls + '">' + icon + " <strong>" + text + "</strong>" + (sub ? ' <em>' + sub + '</em>' : "") + "</span>";
  }

  function styleTag() {
    if (document.getElementById("hlr-style")) return;
    var st = document.createElement("style");
    st.id = "hlr-style";
    st.textContent =
      '#hl-retention{display:flex;flex-wrap:wrap;gap:8px;margin:10px 16px 0;padding:8px 10px;border:2px solid var(--line,#e5e5e5);border-radius:14px;background:var(--bg,#fff);align-items:center;}' +
      '.hlr-chip{display:inline-flex;gap:6px;align-items:baseline;font-size:14px;padding:4px 10px;border-radius:10px;background:var(--bg-soft,#f7f7f7);color:var(--text,#3c3c3c);border:1px solid var(--line,#e5e5e5);text-decoration:none;}' +
      '.hlr-chip strong{font-weight:700}.hlr-chip em{font-style:normal;color:var(--muted,#777);font-size:12px}' +
      '.hlr-warn{background:#fff4e0;border-color:#f2d9ac}' +
      '.hlr-warn .hlr-nofz{color:var(--red,#ff4b4b);font-weight:700;font-size:12px}' +
      '.hlr-ok{background:var(--green-light,#d7ffb8);border-color:var(--green,#58cc02)}' +
      '.hlr-cta{cursor:pointer;background:var(--green-light,#d7ffb8);border-color:var(--green,#58cc02);font-weight:600}' +
      '.hlr-cta:hover{background:var(--green,#58cc02);color:#fff}' +
      '.hlr-new{background:var(--blue-light,#d0f2ff);border-color:var(--blue,#1cb0f6)}';
    document.head.appendChild(st);
  }

  function render() {
    var s = readState();
    var bar = document.getElementById("hl-retention");
    if (!s) { if (bar) bar.style.display = "none"; return; }
    var c = counts(s);

    var html = "";
    var any = false;
    if (c.streak > 0) { html += chip("flame", "\u{1F525}", c.streak + "-day streak"); any = true; }
    if (c.streak > 0 && !c.playedToday) {
      var fz = c.freezes > 0 ? " (" + c.freezes + " freeze" + (c.freezes === 1 ? "" : "s") + " ready)" : "";
      html += '<span class="hlr-chip hlr-warn">\u23F3<strong>Do 1 lesson today</strong><em>keep your streak' + fz + '</em>' +
              (c.freezes === 0 ? '<span class="hlr-nofz">no freezes left</span>' : "") + "</span>";
      any = true;
    } else if (c.streak > 0 && c.playedToday) {
      html += '<span class="hlr-chip hlr-ok">\u2713<strong>Streak safe today</strong></span>';
      any = true;
    }
    if (c.dayLessons > 0) { html += chip("goal", "\u2B50", c.dayLessons + " lesson" + (c.dayLessons === 1 ? "" : "s") + " today"); any = true; }
    if (c.dueNow > 0) { html += '<a class="hlr-chip hlr-cta" href="#/review">\u25B6<strong>' + c.dueNow + ' card' + (c.dueNow === 1 ? "" : "s") + ' due</strong><em>review now</em></a>'; any = true; }
    if (c.dueTomorrow > 0) { html += chip("soon", "\u{1F4C5}", c.dueTomorrow + " waiting tomorrow"); any = true; }
    if (!any) {
      html += '<span class="hlr-chip hlr-new">\u{1F3AF}<strong>Daily goal: 1 lesson</strong><em>start your streak today</em></span>';
    }

    if (!bar) {
      bar = document.createElement("div");
      bar.id = "hl-retention";
      var head = document.querySelector("header.topbar");
      if (head && head.parentNode) head.parentNode.insertBefore(bar, head.nextSibling);
      else document.body.insertBefore(bar, document.body.firstChild);
    }
    bar.style.display = "";
    if (bar.dataset.h === html) return;
    bar.dataset.h = html;
    bar.innerHTML = html;
  }

  function boot() {
    styleTag();
    render();
    setInterval(render, 5000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
