/* ============================================================
   Freebuff Español — app.js
   Single-page app, no backend, no modules. Runs from file://
   ============================================================ */
(function () {
  "use strict";

  /* ================= Constants ================= */

  var KEY = "freebuff.spanish.v2";
  var VERSION = 2;
  var BOX_DAYS = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };
  var HEARTS_START = 5;
  var FREEZE_COST = 50;
  var REFILL_COST = 20;
  var DAY_MS = 86400000;
  // Secret promo codes — granted only to people who were given the code.
  // Stored as hashes so the plaintext never appears in the shipped source,
  // and deliberately never shown in the UI or the docs.
  var PROMO_CODES = {
    "1mplgro": ["noHearts", "hints", "unlockLevels"]
  };
  function codeHash(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }

  /* ================= Data indexes ================= */

  var COURSES = window.COURSES || [];
  var LESSON_LIST = window.LESSON_LIST || [];
  var LESSONS = {};
  var COURSE_LESSONS = {};   // courseId -> ordered lesson ids
  var ORDER = {};            // lessonId -> {course, idx}

  LESSON_LIST.forEach(function (l) {
    LESSONS[l.id] = l;
    l.exercises.forEach(function (e, i) {
      if (!e.id) e.id = l.id + "#" + i;
      if (!Array.isArray(e.a)) e.a = e.a == null ? [] : [e.a];
    });
  });
  COURSES.forEach(function (c) {
    var ids = [];
    c.units.forEach(function (u) { u.lessons.forEach(function (id) { ids.push(id); }); });
    COURSE_LESSONS[c.id] = ids;
    ids.forEach(function (id, i) { ORDER[id] = { course: c, idx: i }; });
  });

  function courseOf(id) { return ORDER[id] ? ORDER[id].course : null; }
  function isUnlocked(id) {
    if (hasPerk("unlockLevels")) return true;
    var o = ORDER[id];
    if (!o || o.idx === 0) return true;
    var prev = COURSE_LESSONS[o.course.id][o.idx - 1];
    return !!(state.lessons[prev] && state.lessons[prev].done);
  }

  /* ================= Dates ================= */

  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function today() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function dnum(s) { var p = s.split("-"); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function daysBetween(a, b) { return Math.round((dnum(b) - dnum(a)) / DAY_MS); }

  /* ================= State ================= */

  function defaultState() {
    return {
      v: VERSION,
      xp: 0, gems: 0, freezes: 0, freezesBought: 0, gemsEarned: 0,
      streak: { count: 0, lastDay: null },
      lessons: {}, mistakes: {}, badges: {},
      answered: 0, correct: 0, perfect: 0, recovered: 0,
      audioCount: 0, practice: 0, comboBest: 0,
      day: { d: today(), lessons: 0 },
      perks: {},
      typeStats: { choice: [0, 0], translate: [0, 0], match: [0, 0], listen: [0, 0], blank: [0, 0] }
    };
  }

  function mergeState(d, p) {
    var s = d, k;
    for (k in p) { if (Object.prototype.hasOwnProperty.call(p, k)) s[k] = p[k]; }
    s.streak = Object.assign({}, d.streak, p.streak || {});
    s.day = Object.assign({}, d.day, p.day || {});
    s.typeStats = Object.assign({}, d.typeStats, p.typeStats || {});
    s.lessons = p.lessons || {};
    s.mistakes = p.mistakes || {};
    s.badges = p.badges || {};
    return s;
  }

  var saveWarned = false;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) {
      if (!saveWarned) { saveWarned = true; console.warn("Could not persist progress:", e); }
    }
  }
  // coalesced save for frequent paths (e.g. speech) so we don't
  // JSON.stringify the whole state on every single call
  var saveTimer = null;
  function saveSoon() {
    if (saveTimer) return;
    saveTimer = setTimeout(function () { saveTimer = null; save(); }, 300);
  }

  var state = defaultState();
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.v === VERSION) state = mergeState(defaultState(), parsed);
    }
  } catch (e) { console.warn("Could not load progress:", e); }

  function ensureDay() {
    var t = today();
    if (state.day.d !== t) state.day = { d: t, lessons: 0 };
  }

  function rollStreak() {
    var s = state.streak;
    if (!s.lastDay) return;
    var t = today();
    if (s.lastDay === t) return;
    var gap = daysBetween(s.lastDay, t);
    if (gap >= 2) {
      if (gap === 2 && state.freezes > 0) {
        state.freezes--;
        s.lastDay = new Date(dnum(t) - DAY_MS).toISOString().slice(0, 10);
        toast('🧊 Streak freeze used — your streak survives!');
      } else {
        s.count = 0;
      }
      save();
    }
  }

  function updateStreak() {
    var s = state.streak, t = today(), res = { grew: false, froze: false };
    if (s.lastDay === t) return res;
    if (!s.lastDay) { s.count = 1; res.grew = true; }
    else {
      var gap = daysBetween(s.lastDay, t);
      if (gap === 1) { s.count++; res.grew = true; }
      else if (gap === 2 && state.freezes > 0) { state.freezes--; res.froze = true; s.count++; res.grew = true; }
      else { s.count = 1; res.grew = true; }
    }
    s.lastDay = t;
    return res;
  }

  /* ================= Helpers ================= */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function norm(s) {
    s = String(s == null ? "" : s).toLowerCase().trim();
    if (s.normalize) s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    s = s.replace(/[¿¡?!.,;:"'“”`´]/g, "");
    s = s.replace(/\s+/g, " ");
    return s;
  }
  var ARTICLES = /^(el |la |los |las |un |una |uns |the |a |an )/;
  function stripArt(s) { return s.replace(ARTICLES, ""); }
  function answersOf(a) { return Array.isArray(a) ? a : [a]; }
  function isCorrectText(a, input) {
    var n = norm(input);
    if (!n) return false;
    var hit = answersOf(a).some(function (x) { return norm(x) === n; });
    if (hit) return true;
    var n2 = stripArt(n);
    return answersOf(a).some(function (x) { var y = norm(x); return y !== n && stripArt(y) === n2; });
  }
  function doneCount() {
    var n = 0;
    LESSON_LIST.forEach(function (l) { if (state.lessons[l.id] && state.lessons[l.id].done) n++; });
    return n;
  }
  function courseDone(cid) {
    var n = 0, ids = COURSE_LESSONS[cid] || [];
    ids.forEach(function (id) { if (state.lessons[id] && state.lessons[id].done) n++; });
    return n;
  }
  function unitsComplete() {
    var n = 0;
    COURSES.forEach(function (c) {
      c.units.forEach(function (u) {
        var all = u.lessons.every(function (id) { return state.lessons[id] && state.lessons[id].done; });
        if (all) n++;
      });
    });
    return n;
  }
  function mistakesDue() {
    var now = Date.now(), ids = Object.keys(state.mistakes);
    return ids.filter(function (id) { return state.mistakes[id].due <= now; });
  }

  /* ================= Speech ================= */

  var voice = null;
  function initVoices() {
    if (!("speechSynthesis" in window)) return;
    var vs = window.speechSynthesis.getVoices() || [];
    if (!vs.length) return;
    var es = vs.filter(function (v) { return /^es/i.test(v.lang || ""); });
    voice =
      es.filter(function (v) { return /es[-_]ES/i.test(v.lang); })[0] ||
      es.filter(function (v) { return /es[-_](MX|419|US|AR|CO)/i.test(v.lang); })[0] ||
      es[0] || null;
  }
  function speak(text) {
    if (!("speechSynthesis" in window)) {
      toast("🔇 Speech synthesis is not available in this browser");
      return;
    }
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "es-ES";
      if (voice) u.voice = voice;
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
      state.audioCount++;
      saveSoon();
    } catch (e) { console.warn("speech failed", e); }
  }
  function stopSpeech() { try { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); } catch (e) {} }

  /* ================= Toast / modal ================= */

  function toast(html) {
    var box = document.getElementById("toasts");
    if (!box) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = html;
    box.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .3s"; el.style.opacity = "0";
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    }, 4500);
  }
  /* ================= Encouragement ================= */
  /* Varied, warm micro-copy so praise and comfort never feel canned.
     All copy here is additive — the feedback bar's buttons and the
     test-asserted strings (Continue / Out of hearts / See results /
     fb-refill / r-retry) are untouched. */
  var PRAISE = ["¡Correcto!", "¡Muy bien!", "¡Excelente!", "¡Así se hace!", "¡Perfecto!", "¡Lo lograste!", "¡Eso es!"];
  var HOT_PRAISE = ["¡Increíble!", "¡Imparable!", "¡En racha!", "¡Imparable 🔥!", "¡Espectacular!"];
  var COMFORT = [
    "Casi — you're closer than you think.",
    "Good try — mistakes are how learning sticks.",
    "Almost! Take one more look at it.",
    "No worries — this one's a tricky one.",
    "Every miss makes the next try stronger.",
    "That's okay — the word will come back in Review."
  ];
  var NUDGE = [
    "You've got this! 💪", "One step closer to fluent 🌱", "Your brain is growing 🧠",
    "Keep that momentum going 🚀", "Progress, not perfection 🌟", "Every answer counts ✅",
    "Tiny steps, big leaps 🐾", "You're building something great 🏗️"
  ];
  function pick(list) { return list[(Math.random() * list.length) | 0]; }
  function praiseFor(combo) { return combo >= 6 ? pick(HOT_PRAISE) : pick(PRAISE); }
  function comfortLine() { return pick(COMFORT); }
  function nudgeLine() { return pick(NUDGE); }

  function openModal(html) {
    var root = document.getElementById("modal-root");
    root.innerHTML = '<div class="modal-backdrop"><div class="modal">' + html + "</div></div>";
    var bd = $(".modal-backdrop", root);
    bd.addEventListener("click", function (e) { if (e.target === bd) closeModal(); });
  }
  function closeModal() { document.getElementById("modal-root").innerHTML = ""; }

  /* ================= Mistakes (Leitner) ================= */

  function addMistake(ex, lessonTitle) {
    if (!ex || !ex.id) return;
    var copy = JSON.parse(JSON.stringify(ex));
    state.mistakes[ex.id] = {
      ex: copy, box: 1, wrongs: 1,
      due: Date.now() + DAY_MS,
      lesson: lessonTitle || "Practice"
    };
  }
  function escalateMistake(id) {
    var m = state.mistakes[id];
    if (!m) return;
    m.wrongs++; m.box = 1; m.due = Date.now() + DAY_MS;
  }
  function graduateMistake(id) {
    var m = state.mistakes[id];
    if (!m) return;
    m.box++;
    if (m.box > 5) delete state.mistakes[id];
    else m.due = Date.now() + BOX_DAYS[m.box] * DAY_MS;
  }

  /* ================= Badges ================= */

  var BADGES = [
    { id: "first-lesson", ico: "🐣", name: "First Steps", desc: "Complete your first lesson", reward: { gems: 10 }, goal: 1, cur: function () { return doneCount(); } },
    { id: "lessons-5", ico: "🐥", name: "Five Down", desc: "Complete 5 lessons", reward: { gems: 15 }, goal: 5, cur: function () { return doneCount(); } },
    { id: "lessons-10", ico: "🔟", name: "Double Digits", desc: "Complete 10 lessons", reward: { gems: 25 }, goal: 10, cur: function () { return doneCount(); } },
    { id: "lessons-25", ico: "📚", name: "Dedicated Learner", desc: "Complete 25 lessons", reward: { gems: 50 }, goal: 25, cur: function () { return doneCount(); } },
    { id: "lessons-all", ico: "🏆", name: "Graduated", desc: "Complete every lesson in all courses", reward: { gems: 150 }, goal: LESSON_LIST.length, cur: function () { return doneCount(); } },
    { id: "unit-complete", ico: "🧭", name: "Unit Explorer", desc: "Complete every lesson in a unit", reward: { gems: 20 }, goal: 1, cur: function () { return unitsComplete(); } },
    { id: "course-core", ico: "📖", name: "Core Graduate", desc: "Finish the Spanish Core course", reward: { gems: 60 }, goal: (COURSE_LESSONS.core || []).length, cur: function () { return courseDone("core"); } },
    { id: "course-movies", ico: "🎬", name: "Scene Stealer", desc: "Finish the Movie Spanish course", reward: { gems: 40 }, goal: (COURSE_LESSONS.movies || []).length, cur: function () { return courseDone("movies"); } },
    { id: "course-words", ico: "📕", name: "Word Collector", desc: "Finish the Popular Words course", reward: { gems: 30 }, goal: (COURSE_LESSONS.words || []).length, cur: function () { return courseDone("words"); } },
    { id: "course-travel", ico: "✈️", name: "Globetrotter", desc: "Finish the Travel Spanish course", reward: { gems: 35 }, goal: (COURSE_LESSONS.travel || []).length, cur: function () { return courseDone("travel"); } },
    { id: "course-conv", ico: "💬", name: "Conversationalist", desc: "Finish the Conversation course", reward: { gems: 35 }, goal: (COURSE_LESSONS.conv || []).length, cur: function () { return courseDone("conv"); } },
    { id: "streak-3", ico: "🔥", name: "Kindled", desc: "Reach a 3-day streak", reward: { gems: 10 }, goal: 3, cur: function () { return state.streak.count; } },
    { id: "streak-7", ico: "🗓️", name: "Week Streak", desc: "Reach a 7-day streak", reward: { gems: 25 }, goal: 7, cur: function () { return state.streak.count; } },
    { id: "streak-14", ico: "🔁", name: "Two Weeks Strong", desc: "Reach a 14-day streak", reward: { gems: 40 }, goal: 14, cur: function () { return state.streak.count; } },
    { id: "streak-30", ico: "🌟", name: "Monthly Master", desc: "Reach a 30-day streak", reward: { gems: 80 }, goal: 30, cur: function () { return state.streak.count; } },
    { id: "streak-100", ico: "💯", name: "Centurion Streak", desc: "Reach a 100-day streak", reward: { gems: 300 }, goal: 100, cur: function () { return state.streak.count; } },
    { id: "xp-100", ico: "⚡", name: "Getting Started", desc: "Earn 100 XP", reward: { gems: 10 }, goal: 100, cur: function () { return state.xp; } },
    { id: "xp-500", ico: "⚡", name: "XP Hunter", desc: "Earn 500 XP", reward: { gems: 25 }, goal: 500, cur: function () { return state.xp; } },
    { id: "xp-1000", ico: "🔮", name: "XP Machine", desc: "Earn 1,000 XP", reward: { gems: 50 }, goal: 1000, cur: function () { return state.xp; } },
    { id: "xp-5000", ico: "🚀", name: "XP Legend", desc: "Earn 5,000 XP", reward: { gems: 150 }, goal: 5000, cur: function () { return state.xp; } },
    { id: "gems-100", ico: "💎", name: "Gem Saver", desc: "Earn 100 gems total", reward: { xp: 50 }, goal: 100, cur: function () { return state.gemsEarned; } },
    { id: "gems-500", ico: "💎", name: "Gem Vault", desc: "Earn 500 gems total", reward: { xp: 150 }, goal: 500, cur: function () { return state.gemsEarned; } },
    { id: "perfect-1", ico: "🌈", name: "Flawless", desc: "Finish a lesson with no mistakes", reward: { gems: 20 }, goal: 1, cur: function () { return state.perfect; } },
    { id: "perfect-5", ico: "✨", name: "Perfectionist", desc: "5 flawless lessons", reward: { gems: 50 }, goal: 5, cur: function () { return state.perfect; } },
    { id: "perfect-25", ico: "👑", name: "Flawless x25", desc: "25 flawless lessons", reward: { gems: 120 }, goal: 25, cur: function () { return state.perfect; } },
    { id: "combo-5", ico: "🔥", name: "On Fire", desc: "Reach a 5-answer combo in one lesson", reward: { gems: 15 }, goal: 5, cur: function () { return state.comboBest; } },
    { id: "combo-10", ico: "🌪️", name: "Untouchable", desc: "Reach a 10-answer combo in one lesson", reward: { gems: 40 }, goal: 10, cur: function () { return state.comboBest; } },
    { id: "listen-50", ico: "👂", name: "Sharp Ears", desc: "50 listening exercises correct", reward: { gems: 30 }, goal: 50, cur: function () { return (state.typeStats.listen || [0, 0])[0]; } },
    { id: "listen-200", ico: "🎧", name: "Audio Master", desc: "200 listening exercises correct", reward: { gems: 80 }, goal: 200, cur: function () { return (state.typeStats.listen || [0, 0])[0]; } },
    { id: "answered-500", ico: "📝", name: "Exercise Veteran", desc: "Answer 500 exercises", reward: { gems: 30 }, goal: 500, cur: function () { return state.answered; } },
    { id: "answered-2000", ico: "📝", name: "Exercise Legend", desc: "Answer 2,000 exercises", reward: { gems: 100 }, goal: 2000, cur: function () { return state.answered; } },
    { id: "recovered-10", ico: "🔧", name: "Mistake Fixer", desc: "Get 10 saved mistakes right in review", reward: { gems: 25 }, goal: 10, cur: function () { return state.recovered; } },
    { id: "freeze-buy", ico: "🧊", name: "Prepared", desc: "Buy a streak freeze", reward: { xp: 30 }, goal: 1, cur: function () { return state.freezesBought; } },
    { id: "practice-10", ico: "🏋️", name: "Regular Practice", desc: "Finish 10 review/practice sessions", reward: { gems: 25 }, goal: 10, cur: function () { return state.practice; } },
    { id: "correct-1000", ico: "🎓", name: "Scholar", desc: "Answer 1,000 exercises correctly", reward: { gems: 60 }, goal: 1000, cur: function () { return state.correct; } },
    { id: "audio-100", ico: "🔊", name: "Sound Check", desc: "Play audio 100 times", reward: { gems: 20 }, goal: 100, cur: function () { return state.audioCount; } }
  ];

  function checkBadges() {
    var unlocked = [];
    BADGES.forEach(function (b) {
      if (state.badges[b.id]) return;
      if (b.cur() >= b.goal) {
        state.badges[b.id] = Date.now();
        if (b.reward.gems) { state.gems += b.reward.gems; state.gemsEarned += b.reward.gems; }
        if (b.reward.xp) state.xp += b.reward.xp;
        unlocked.push(b);
      }
    });
    if (unlocked.length) {
      save();
      unlocked.forEach(function (b) {
        var reward = b.reward.gems ? "+" + b.reward.gems + " 💎" : (b.reward.xp ? "+" + b.reward.xp + " XP" : "");
        toast('<span style="font-size:24px">' + b.ico + '</span><div><div>🏅 ' + esc(b.name) + '</div><div class="t-sub">' + esc(b.desc) + " · " + reward + "</div></div>");
      });
    }
    return unlocked;
  }

  /* ================= Perks (secret promo) ================= */

  function hasPerk(name) { return !!(state.perks && state.perks[name]); }

  function activePerksText() {
    var list = [];
    if (hasPerk("noHearts")) list.push("❤️ No hearts");
    if (hasPerk("hints")) list.push("💡 Auto hints");
    if (hasPerk("unlockLevels")) list.push("🔓 All levels unlocked");
    return list.length ? "Promo active: " + list.join(" · ") : "";
  }

  // returns 0 = unknown code, 1 = activated, 2 = already active
  function redeemPerk(raw) {
    var code = codeHash(String(raw == null ? "" : raw).replace(/\s+/g, " ").trim().toUpperCase());
    var perks = PROMO_CODES[code];
    if (!perks) return 0;
    var fresh = false;
    if (!state.perks) state.perks = {};
    perks.forEach(function (n) { if (!state.perks[n]) { state.perks[n] = 1; fresh = true; } });
    save();
    renderHud();
    return fresh ? 1 : 2;
  }

  // OPTIONAL cloud config: the web app config is injected from index.html
  // (window.HL_FIREBASE). Null = 100% local mode, everything still works.
  var FB_CONFIG = (typeof window !== "undefined" && window.HL_FIREBASE) || null;

  /* ================= Cloud (Firebase, optional) ================= */
  /* Fully offline-first: every function here no-ops when no config is
     present, the SDKs fail to load, or the network is down. Core
     learning never depends on the cloud. Schema (RTDB):
       users/{uid}/profile  — private full progress mirror
       board/{uid}          — public { name, xp, lessons, streak, at } */

  var cloud = { ready: false, user: null, booted: false, lastWrite: 0, emailMode: "in", emailOpen: false };

  function cloudStatus() {
    if (!FB_CONFIG) return "off";
    if (!cloud.ready) return "starting";
    return cloud.user ? "on" : "signed-out";
  }

  function loadScript(src, cb) {
    try {
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = function () { cb(null); };
      s.onerror = function () { cb(new Error("load failed")); };
      (document.head || document.getElementsByTagName("head")[0] || document.body).appendChild(s);
    } catch (e) { cb(e); }
  }

  function initCloud() {
    if (!FB_CONFIG || cloud.booted) return;
    cloud.booted = true;
    // If an SDK is already present (tests, CDN-preloaded builds), boot right away.
    if (typeof window !== "undefined" && window.firebase) { bootCloud(); return; }
    var base = "https://www.gstatic.com/firebasejs/10.12.5/";
    loadScript(base + "firebase-app-compat.js", function (e1) {
      if (e1) return;
      loadScript(base + "firebase-auth-compat.js", function (e2) {
        if (e2) return;
        loadScript(base + "firebase-database-compat.js", function (e3) {
          if (e3) return;
          bootCloud();
        });
      });
    });
  }

  function bootCloud() {
    if (cloud.ready) return; // register the auth listener exactly once
    try {
      if (!window.firebase) return;
      if (!window.firebase.apps || !window.firebase.apps.length) window.firebase.initializeApp(FB_CONFIG);
      cloud.ready = true;
      window.firebase.auth().onAuthStateChanged(function (u) {
        cloud.user = u || null;
        if (u) cloudFirstSync(u);
        renderHud();
        var h = (location.hash || "").replace(/^#/, "");
        if (h === "/leaders" || h === "leaders") render();
      });
    } catch (e) { cloud.ready = false; }
  }

  function maxNum(a, b) { a = +a || 0; b = +b || 0; return a > b ? a : b; }

  // Conservative merge: numbers take max, lessons/badges/mistakes/perks union,
  // streak takes the higher count. Never deletes local progress.
  function mergeCloudProfile(local, remote) {
    var m = JSON.parse(JSON.stringify(local));
    if (!remote || typeof remote !== "object") return m;
    ["xp", "gems", "gemsEarned", "answered", "correct", "perfect", "recovered",
     "audioCount", "practice", "comboBest", "freezes", "freezesBought"].forEach(function (k) {
      m[k] = maxNum(m[k], remote[k]);
    });
    var lids = {};
    Object.keys(m.lessons || {}).forEach(function (id) { lids[id] = 1; });
    Object.keys(remote.lessons || {}).forEach(function (id) { lids[id] = 1; });
    var nl = {};
    Object.keys(lids).forEach(function (id) {
      var a = (m.lessons || {})[id] || {}, b = (remote.lessons || {})[id] || {};
      nl[id] = {
        done: !!(a.done || b.done),
        best: Math.max(+a.best || 0, +b.best || 0),
        at: Math.max(+a.at || 0, +b.at || 0) || Date.now()
      };
    });
    m.lessons = nl;
    ["badges", "mistakes", "perks"].forEach(function (k) {
      var o = {}, src = m[k] || {}, dst = remote[k] || {};
      Object.keys(src).forEach(function (x) { o[x] = src[x]; });
      Object.keys(dst).forEach(function (x) { if (o[x] == null) o[x] = dst[x]; });
      m[k] = o;
    });
    var ls = m.streak || { count: 0, lastDay: null }, rs = remote.streak || { count: 0, lastDay: null };
    m.streak = (+rs.count || 0) > (+ls.count || 0) ? { count: +rs.count, lastDay: rs.lastDay || null } : ls;
    if (remote.day && remote.day.d && (!m.day || !m.day.d || remote.day.d > m.day.d)) m.day = remote.day;
    var ts = m.typeStats || {}, rts = remote.typeStats || {};
    Object.keys(ts).forEach(function (k) {
      var a = ts[k] || [0, 0], b = rts[k] || [0, 0];
      ts[k] = [Math.max(+a[0] || 0, +b[0] || 0), Math.max(+a[1] || 0, +b[1] || 0)];
    });
    Object.keys(rts).forEach(function (k) { if (!ts[k]) ts[k] = rts[k]; });
    m.typeStats = ts;
    return m;
  }

  function displayName() {
    var u = cloud.user;
    if (!u) return "Player";
    var n = u.displayName || (u.email || "").split("@")[0] || "Player";
    return String(n).slice(0, 24);
  }

  function boardRow() {
    return {
      name: displayName(),
      xp: +state.xp || 0,
      lessons: doneCount(),
      streak: (state.streak && +state.streak.count) || 0,
      at: Date.now()
    };
  }

  // Backup profile + leaderboard row. Throttled; called on sign-in,
  // merge, and lesson completion — never on the hot paths.
  function cloudTouch(force) {
    if (!cloud.ready || !cloud.user || !window.firebase) return;
    var now = Date.now();
    if (!force && now - cloud.lastWrite < 4000) return;
    cloud.lastWrite = now;
    try {
      var uid = cloud.user.uid;
      var db = window.firebase.database();
      db.ref("users/" + uid + "/profile").set({
        v: VERSION, xp: +state.xp || 0, gems: +state.gems || 0,
        freezes: +state.freezes || 0, freezesBought: +state.freezesBought || 0,
        gemsEarned: +state.gemsEarned || 0,
        streak: state.streak || { count: 0, lastDay: null },
        lessons: state.lessons || {}, mistakes: state.mistakes || {}, badges: state.badges || {},
        answered: +state.answered || 0, correct: +state.correct || 0,
        perfect: +state.perfect || 0, recovered: +state.recovered || 0,
        audioCount: +state.audioCount || 0, practice: +state.practice || 0,
        comboBest: +state.comboBest || 0,
        day: state.day || { d: today(), lessons: 0 }, perks: state.perks || {},
        typeStats: state.typeStats || {}, updatedAt: Date.now()
      });
      db.ref("board/" + uid).set(boardRow());
    } catch (e) { /* offline: local remains the source of truth */ }
  }

  function cloudFirstSync(u) {
    if (!cloud.ready || !u || !window.firebase) return;
    try {
      window.firebase.database().ref("users/" + u.uid + "/profile").once("value").then(function (snap) {
        var remote = snap.val();
        if (remote && typeof remote === "object") {
          state = mergeCloudProfile(state, remote);
          ensureDay(); rollStreak();
          save(); cloudTouch(true); renderHud(); render();
          toast("☁️ Synced with your cloud progress");
        } else {
          cloudTouch(true);
        }
      }, function () { cloudTouch(true); });
    } catch (e) { /* stay local */ }
  }

  function cloudSignIn() {
    if (!cloud.ready || !window.firebase) {
      toast("☁️ Cloud is unavailable right now — you're still learning locally");
      return;
    }
    try {
      var provider = new window.firebase.auth.GoogleAuthProvider();
      window.firebase.auth().signInWithPopup(provider).catch(function () {
        toast("☁️ Sign-in didn't complete — still learning locally");
      });
    } catch (e) {
      toast("☁️ Cloud is unavailable right now — you're still learning locally");
    }
  }

  function cloudSignOut() {
    if (!cloud.ready || !window.firebase) return;
    try { window.firebase.auth().signOut(); } catch (e) {}
    cloud.user = null;
    cloud.emailOpen = false; cloud.emailMode = "in";
    save(); renderHud(); render();
    toast("☁️ Signed out — progress stays on this device");
  }

  // Map Firebase auth error codes to short, friendly copy.
  function authErr(e) {
    var c = e && e.code ? e.code : "";
    if (c === "auth/invalid-email") return "That email doesn't look right.";
    if (c === "auth/user-not-found" || c === "auth/wrong-password" || c === "auth/invalid-credential") return "Wrong email or password.";
    if (c === "auth/email-already-in-use") return "That email is already registered — sign in instead.";
    if (c === "auth/weak-password") return "Password needs at least 6 characters.";
    if (c === "auth/too-many-requests") return "Too many tries — wait a moment and retry.";
    return "Couldn't complete that — please try again.";
  }

  // Submit the inline email form. Signs in or creates the account depending
  // on the current mode, then the existing onAuthStateChanged -> cloudFirstSync
  // handles merging local progress.
  function cloudEmailSubmit() {
    if (!cloud.ready || !window.firebase) {
      toast("☁️ Cloud is unavailable right now — you're still learning locally");
      return;
    }
    var em = $("#em-email"), pw = $("#em-pass"), nm = $("#em-name"), err = $("#em-err");
    var email = (em && em.value || "").trim();
    var pass = pw && pw.value || "";
    var name = nm && nm.value || "";
    if (!email || !pass) { if (err) err.textContent = "Enter your email and password."; return; }
    if (err) err.textContent = "";
    var auth = window.firebase.auth();
    var done = function () {
      cloud.emailOpen = false;
      // On sign-up, seed the leaderboard display name from the name field.
      if (cloud.emailMode === "up" && name.trim()) {
        try {
          auth.currentUser.updateProfile({ displayName: name.trim().slice(0, 24) });
        } catch (e) {}
        cloudTouch(true);
      }
      render();
    };
    var fail = function (e) { if (err) err.textContent = authErr(e); };
    try {
      if (cloud.emailMode === "up") {
        auth.createUserWithEmailAndPassword(email, pass).then(done, fail);
      } else {
        auth.signInWithEmailAndPassword(email, pass).then(done, fail);
      }
    } catch (e) { fail(e); }
  }

  function cloudLoadBoard(cb) {
    if (!cloud.ready || !window.firebase) { cb(null); return; }
    try {
      window.firebase.database().ref("board").orderByChild("xp").limitToLast(25).once("value").then(function (snap) {
        var rows = [], v = snap.val() || {};
        Object.keys(v).forEach(function (uid) {
          var r = v[uid] || {};
          rows.push({
            uid: uid,
            name: String(r.name || "Player").slice(0, 24),
            xp: +r.xp || 0, lessons: +r.lessons || 0, streak: +r.streak || 0
          });
        });
        rows.sort(function (a, b) { return b.xp - a.xp; });
        cb(rows);
      }, function () { cb(null); });
    } catch (e) { cb(null); }
  }

  /* ================= HUD ================= */

  function renderHud() {
    var hud = document.getElementById("hud");
    if (!hud) return;
    var freeze = state.freezes > 0 ? " 🧊" + state.freezes : "";
    var cs = cloudStatus();
    var cloudTip = cs === "on" ? "Cloud sync on — open your account"
      : cs === "signed-out" ? "Cloud available — sign in"
      : cs === "starting" ? "Cloud starting…" : "Local only — no cloud configured";
    hud.innerHTML =
      '<button class="chip cloud' + (cs === "on" ? " on" : "") + '" id="hud-cloud" title="' + cloudTip + '"><span class="ico">' +
      (cs === "on" ? "☁️" : cs === "off" ? "📴" : "⏳") + "</span>" +
      (cs === "on" ? esc(displayName()) : "Local") + "</button>" +
      '<span class="chip streak" title="Day streak' + (state.freezes ? " (includes " + state.freezes + " freeze)" : "") + '"><span class="ico">🔥</span>' + state.streak.count + freeze + "</span>" +
      '<span class="chip gems" title="Gems — save up for a streak freeze"><span class="ico">💎</span>' + state.gems + "</span>" +
      '<span class="chip xp" title="Experience points"><span class="ico">⚡</span>' + state.xp + " XP</span>" +
      '<span class="chip" title="Badges earned"><span class="ico">🏅</span>' + Object.keys(state.badges).length + "/" + BADGES.length + "</span>";
    var hc = document.getElementById("hud-cloud");
    if (hc) hc.addEventListener("click", function () { location.hash = "#/stats"; });
  }

  /* ================= Session ================= */

  var session = null; // active lesson/review/practice run
  var ui = null;      // per-exercise transient UI state

  function startLessonSession(lessonId) {
    var l = LESSONS[lessonId];
    if (!l) { location.hash = "#/path"; return; }
    var queue = [];
    if (l.scene) queue.push({ scene: l.scene });
    l.exercises.forEach(function (e) { queue.push({ ex: e, mid: null, lessonTitle: l.title }); });
    session = {
      kind: "lesson", lessonId: lessonId, title: l.title,
      queue: queue, pos: 0, total: queue.length,
      hearts: HEARTS_START, combo: 0, bestCombo: 0,
      correct: 0, answered: 0, wrong: 0, xp: 0, gained: 0,
      finished: false, completed: false, perfect: false,
      gemsEarned: 0, newBadges: [], streakInfo: null, firstToday: false, nextUnlocked: null
    };
    ui = null;
  }

  function startSession(kind, list) {
    session = {
      kind: kind, lessonId: null,
      title: kind === "review" ? "Mistake review" : "Practice",
      queue: list, pos: 0, total: list.length,
      hearts: HEARTS_START, combo: 0, bestCombo: 0,
      correct: 0, answered: 0, wrong: 0, xp: 0, gained: 0,
      finished: false, completed: false, perfect: false,
      gemsEarned: 0, newBadges: [], streakInfo: null, firstToday: false, nextUnlocked: null
    };
    ui = null;
  }

  function randomExercises(n, poolIds) {
    var pool = [];
    poolIds.forEach(function (id) {
      var l = LESSONS[id];
      if (l) l.exercises.forEach(function (e) { pool.push({ ex: e, mid: null, lessonTitle: l.title }); });
    });
    return shuffle(pool).slice(0, n);
  }

  function allLessonIds() { return LESSON_LIST.map(function (l) { return l.id; }); }
  function completedLessonIds() {
    return LESSON_LIST.filter(function (l) { return state.lessons[l.id] && state.lessons[l.id].done; }).map(function (l) { return l.id; });
  }

  function buildReviewSession() {
    var due = mistakesDue().sort(function (a, b) { return state.mistakes[a].due - state.mistakes[b].due; });
    var list = due.slice(0, 6).map(function (id) {
      var m = state.mistakes[id];
      return { ex: m.ex, mid: id, lessonTitle: m.lesson };
    });
    var have = {};
    list.forEach(function (it) { have[it.ex.id] = true; });
    var fill = Math.max(0, 10 - list.length);
    if (fill > 0) {
      var pool = completedLessonIds();
      if (!pool.length) pool = allLessonIds();
      var extra = randomExercises(fill * 2, pool).filter(function (it) { return !have[it.ex.id]; }).slice(0, fill);
      list = list.concat(extra);
    }
    if (!list.length) return null;
    return list;
  }

  function buildPracticeSession() {
    var pool = completedLessonIds();
    if (!pool.length) pool = allLessonIds();
    return randomExercises(10, pool);
  }

  /* ================= Grading ================= */

  function multFor(combo) { return combo >= 9 ? 4 : combo >= 6 ? 3 : combo >= 3 ? 2 : 1; }

  function recordStats(ex, ok) {
    session.answered++;
    state.answered++;
    var ts = state.typeStats[ex.t] || [0, 0];
    ts[1]++;
    if (ok) { ts[0]++; state.correct++; session.correct++; }
    state.typeStats[ex.t] = ts;
  }

  function awardCorrect(ex, item) {
    session.combo++;
    if (session.combo > session.bestCombo) session.bestCombo = session.combo;
    if (session.combo > state.comboBest) state.comboBest = session.combo;
    var mult = multFor(session.combo);
    var gain = 10 * mult;
    session.xp += gain;
    session.gained = gain;
    session.gainedMult = mult;
    if (item && item.mid) { graduateMistake(item.mid); state.recovered++; }
  }

  function penalize(ex, item) {
    session.combo = 0;
    session.wrong++;
    if (!hasPerk("noHearts")) session.hearts--;
    if (item && item.mid) escalateMistake(item.mid);
    else if (item) addMistake(ex, item.lessonTitle);
    else addMistake(ex, "Practice");
  }

  function gradeText(ex, item, input) {
    var ok = isCorrectText(ex.a, input);
    finishExercise(ex, item, ok);
    return ok;
  }

  function gradeChoice(ex, item, selected) {
    var ok = isCorrectText(ex.a, selected);
    finishExercise(ex, item, ok, selected);
    return ok;
  }

  function finishExercise(ex, item, ok, selected) {
    session.gained = 0;
    session.gainedMult = 1;
    recordStats(ex, ok);
    if (ok) awardCorrect(ex, item);
    else penalize(ex, item);
    ui.graded = true;
    ui.ok = ok;
    ui.selected = selected == null ? null : selected;
    // visual answer feedback + lock the inputs
    if (ex.t === "choice" || ex.t === "blank" || (ex.t === "listen" && ex.c)) {
      $all(".choice").forEach(function (b) {
        var v = b.getAttribute("data-val");
        b.disabled = true;
        if (isCorrectText(ex.a, v)) b.classList.add("ok");
        else if (v === selected) b.classList.add("bad");
      });
    } else {
      var inp = document.getElementById("answer");
      if (inp) inp.disabled = true;
    }
    save();
    renderHud();
    updateChrome();
    renderFeedback(ok);
  }

  /* ================= Rendering: run chrome ================= */

  function updateChrome() {
    var el = document.getElementById("run-top");
    if (!el || !session) return;
    var pct = Math.round(((session.pos + (ui && ui.graded ? 1 : 0)) / session.total) * 100);
    var comboOn = session.combo >= 3;
    var noHearts = hasPerk("noHearts");
    var hearts = noHearts ? "❤ ∞" : "❤ " + Math.max(0, session.hearts);
    el.innerHTML =
      '<button class="exit-x" id="exit-run" title="Quit lesson">✕</button>' +
      '<span class="hearts' + (!noHearts && session.hearts <= 1 ? " low" : "") + '" title="Hearts — a wrong answer costs one' + (noHearts ? " · NOHEARTS active" : "") + '">' + hearts + "</span>" +
      '<div class="progress-track"><i style="width:' + pct + '%"></i></div>' +
      '<span class="combo' + (comboOn ? " on" : "") + '" title="Consecutive correct answers multiply XP">🔥 ×' + multFor(session.combo) + "</span>";
    $("#exit-run").addEventListener("click", confirmExit);
  }

  function confirmExit() {
    openModal(
      "<h3>Quit this session?</h3>" +
      "<p>Your answers so far count for XP, but this lesson won't be marked complete.</p>" +
      '<div class="modal-actions">' +
      '<button class="btn ghost" id="m-keep">Keep going</button>' +
      '<button class="btn red" id="m-quit">Quit</button></div>'
    );
    $("#m-keep").addEventListener("click", closeModal);
    $("#m-quit").addEventListener("click", function () {
      closeModal();
      session = null; ui = null;
      stopSpeech();
      location.hash = "#/path";
    });
  }

  /* ================= Rendering: steps ================= */

  function renderRun() {
    var app = document.getElementById("app");
    var fb = document.getElementById("feedback");
    if (fb) fb.parentNode.removeChild(fb);
    ui = null;
    var item = session.queue[session.pos];
    var html = '<div class="run-top" id="run-top"></div><div id="step-area"></div>';
    app.innerHTML = html;
    updateChrome();
    if (item.scene) renderScene(item.scene);
    else renderExercise(item);
  }

  function renderScene(scene) {
    ui = { kind: "scene" };
    var area = document.getElementById("step-area");
    area.innerHTML =
      '<div class="scene">' +
      '<div class="film">' + esc(scene.film) + "</div>" +
      '<div class="quote">' + esc(scene.quote) + "</div>" +
      '<div class="trans">' + esc(scene.en) + "</div>" +
      '<div class="row" style="margin-top:12px">' +
      '<button class="btn blue small" id="scene-audio">🔊 Play line</button></div>' +
      '<div class="note">' + esc(scene.note) + "</div>" +
      "</div>" +
      '<div class="card center"><p class="muted">Read the scene, then hit continue — you\'ll drill every word from it.</p></div>';
    document.getElementById("scene-audio").addEventListener("click", function () { speak(scene.quote); });
    renderPendingFeedback(true);
    if (session.pos === 0 && session.kind === "lesson") setTimeout(function () { speak(scene.quote); }, 500);
  }

  function instructionFor(ex) {
    if (ex.p) return ex.p;
    if (ex.t === "choice") return "Select the correct translation";
    if (ex.t === "blank") return "Fill in the blank";
    if (ex.t === "translate") return ex.from === "es" ? "Translate into English" : "Translate into Spanish";
    if (ex.t === "listen") return ex.c ? "Tap the meaning of what you hear" : "Type what you hear";
    if (ex.t === "match") return "Match the pairs";
    return "Exercise";
  }

  function speakerBtn(text, cls) {
    return '<button class="speaker ' + (cls || "") + '" data-speak="' + esc(text) + '" title="Play audio">🔊</button>';
  }

  function renderExercise(item) {
    var ex = item.ex;
    ui = { kind: "ex", graded: false, selected: null, input: "", wrongPairs: 0, mistakeMarked: false, matched: [], selEs: null, selEn: null };
    var area = document.getElementById("step-area");

    if (ex.t === "match") {
      var es = shuffle(ex.pairs.map(function (p, i) { return { i: i, t: p[0] }; }));
      var en = shuffle(ex.pairs.map(function (p, i) { return { i: i, t: p[1] }; }));
      area.innerHTML =
        '<div class="card ex-card">' +
        '<div class="ex-type">Matching</div>' +
        '<div class="ex-ask">' + esc(instructionFor(ex)) + "</div>" +
        '<div class="match-grid">' +
        '<div class="match-col" id="col-es">' + es.map(function (t) {
          return '<button class="match-tile" data-side="es" data-pair="' + t.i + '">' + esc(t.t) + "</button>";
        }).join("") + "</div>" +
        '<div class="match-col" id="col-en">' + en.map(function (t) {
          return '<button class="match-tile" data-side="en" data-pair="' + t.i + '">' + esc(t.t) + "</button>";
        }).join("") + "</div>" +
        "</div>" +
        '<div class="hint-cta" id="hint-cta">💡 Hint</div></div>';
      renderPendingFeedback(true);
      wireMatch(ex, item);
      wireHint(ex, item);
      return;
    }

    var askHtml = "";
    var q = ex.q || "";
    if (ex.t === "blank") {
      askHtml = '<div class="ex-ask">' + esc(q).replace("___", '<b style="color:var(--blue-dark)">_____</b>') + "</div>";
    } else if (ex.t === "choice" || ex.t === "translate") {
      askHtml = '<div class="q-line">' + (ex.sp || ex.from === "es" ? speakerBtn(q) : "") +
        '<span class="q-text">' + esc(q) + "</span></div>";
    } else if (ex.t === "listen") {
      askHtml = '<div class="q-line">' +
        '<button class="speaker big auto" id="play-audio" title="Play again">🔊</button>' +
        '<span class="q-text muted">' + (ex.c ? "Listen, then choose the meaning" : "Listen and type what you hear") + "</span></div>";
    }

    var body = "";
    var hintHtml = '';
    if (ex.t === "choice" || ex.t === "blank" || (ex.t === "listen" && ex.c)) {
      var choices = shuffle(ex.c);
      body = '<div class="choices" id="choices">' + choices.map(function (c, i) {
        return '<button class="choice" data-val="' + esc(c) + '"><span class="key">' + (i + 1) + "</span>" + esc(c) + "</button>";
      }).join("") + "</div>";
      hintHtml = '<div class="hint-cta" id="hint-cta">💡 Hint</div>';
    } else if (ex.t === "listen" && !ex.c) {
      var ph = "Type the Spanish you hear…";
      body = '<textarea class="answer-input" id="answer" rows="2" placeholder="' + ph + '" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea>' +
        '<div class="hintline">Accents are optional — "esta" counts for "está". Press <b>Enter</b> to check.</div>' +
        '<div class="hint-cta" id="hint-cta">💡 Hint</div>';
    } else {
      var ph = ex.t === "listen" ? "Type the Spanish you hear…" : (ex.from === "es" ? "Type in English…" : "Type in Spanish…");
      body = '<textarea class="answer-input" id="answer" rows="2" placeholder="' + ph + '" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea>' +
        '<div class="hintline">Accents are optional — "esta" counts for "está". Press <b>Enter</b> to check.</div>' +
        '<div class="hint-cta" id="hint-cta">💡 Hint</div>';
    }

    area.innerHTML =
      '<div class="card ex-card">' +
      '<div class="ex-type">' + esc(instructionFor(ex)) + "</div>" +
      askHtml + body + hintHtml +
      "</div>";
    wireHint(ex, item);

    if (ex.t === "listen") {
      var btn = document.getElementById("play-audio");
      if (btn) {
        btn.addEventListener("click", function () { speak(answersOf(ex.a)[0]); });
        setTimeout(function () { speak(answersOf(ex.a)[0]); }, 400);
      }
    }
    if (ex.t === "choice" || ex.t === "blank" || (ex.t === "listen" && ex.c)) {
      $all(".choice").forEach(function (b) {
        b.addEventListener("click", function () {
          if (ui.graded) return;
          $all(".choice").forEach(function (x) { x.classList.remove("selected"); });
          b.classList.add("selected");
          ui.selected = b.getAttribute("data-val");
          renderPendingFeedback(false);
        });
      });
    } else {
      var input = document.getElementById("answer");
      input.addEventListener("input", function () { ui.input = input.value; renderPendingFeedback(false); });
      setTimeout(function () { try { input.focus(); } catch (e) {} }, 60);
    }
    renderPendingFeedback(true);
  }

  function wireHint(ex, item) {
    var hintCta = document.getElementById("hint-cta");
    if (!hintCta) return;
    hintCta.addEventListener("click", function () {
      if (!ui || ui.graded) return;
      var ans = answersOf(ex.a)[0];
      if (ex.t === "match") {
        var tiles = $all(".match-tile");
        tiles.forEach(function (t) {
          var p = +t.getAttribute("data-pair");
          t.disabled = true;
          t.classList.remove("sel");
          t.classList.add("ok");
          if (p === ui.selEs || p === ui.selEn) { ui.selEs = null; ui.selEn = null; }
        });
        ui.matched = ex.pairs.map(function (p, i) { return i; });
        // leave ui.graded to completeMatch — setting it here would make
        // completeMatch bail out before grading the exercise
        ui.wrongPairs = 0;
        session.combo = 0;
        completeMatch(ex, item);
        return;
      }
      if (ex.t === "choice" || ex.t === "blank" || (ex.t === "listen" && ex.c)) {
        var target = null;
        $all(".choice").forEach(function (b) {
          if (b.getAttribute("data-val") === ans) target = b;
        });
        if (target) {
          $all(".choice").forEach(function (b) { b.classList.remove("selected"); });
          target.classList.add("selected");
          ui.selected = ans;
        }
      } else {
        var inp = document.getElementById("answer");
        if (inp) { inp.value = ans; inp.disabled = true; }
        ui.input = ans;
      }
      var highlight = document.createElement("div");
      highlight.className = "hint-reveal";
      highlight.innerHTML = "<b>Answer:</b> " + esc(ans);
      var anchor = document.querySelector(".q-line") || document.getElementById("choices") ||
        document.querySelector(".ex-ask") || document.querySelector(".hintline");
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(highlight, anchor.nextSibling);
      renderPendingFeedback(false);
    });
    // HINTS perk: reveal the answer automatically as soon as the exercise loads
    if (hasPerk("hints") && ex.t !== "match") {
      setTimeout(function () {
        if (ui && ui.kind === "ex" && !ui.graded) hintCta.click();
      }, 250);
    }
  }

  function wireMatch(ex, item) {
    var tiles = $all(".match-tile");
    tiles.forEach(function (t) {
      t.addEventListener("click", function () {
        if (ui.graded || t.classList.contains("ok")) return;
        var side = t.getAttribute("data-side");
        var pair = +t.getAttribute("data-pair");
        if (side === "es") {
          if (ui.selEs === pair) return;
          tiles.forEach(function (x) { if (x.getAttribute("data-side") === "es") x.classList.remove("sel"); });
          t.classList.add("sel"); ui.selEs = pair;
        } else {
          if (ui.selEn === pair) return;
          tiles.forEach(function (x) { if (x.getAttribute("data-side") === "en") x.classList.remove("sel"); });
          t.classList.add("sel"); ui.selEn = pair;
        }
        if (ui.selEs != null && ui.selEn != null) {
          if (ui.selEs === ui.selEn) {
            var ok = ui.selEs;
            ui.matched.push(ok);
            tiles.forEach(function (x) {
              var p = +x.getAttribute("data-pair");
              if (p === ok) { x.classList.remove("sel"); x.classList.add("ok"); x.disabled = true; }
            });
            ui.selEs = null; ui.selEn = null;
            if (ui.matched.length === ex.pairs.length) setTimeout(function () { completeMatch(ex, item); }, 350);
          } else {
            var a = ui.selEs, b = ui.selEn;
            ui.selEs = null; ui.selEn = null;
            tiles.forEach(function (x) {
              var p = +x.getAttribute("data-pair");
              if ((x.getAttribute("data-side") === "es" && p === a) || (x.getAttribute("data-side") === "en" && p === b)) {
                x.classList.add("bad");
                setTimeout(function () { x.classList.remove("bad", "sel"); }, 700);
              } else {
                x.classList.remove("sel");
              }
            });
            // wrong pair: costs a heart, breaks the combo, records the mistake
            session.combo = 0;
            if (!hasPerk("noHearts")) session.hearts--;
            ui.wrongPairs++;
            if (!ui.mistakeMarked) {
              ui.mistakeMarked = true;
              if (item.mid) escalateMistake(item.mid); else addMistake(ex, item.lessonTitle);
            }
            save();
            renderHud();
            updateChrome();
          }
        }
      });
    });
  }

  function completeMatch(ex, item) {
    if (ui.graded) return;
    var ok = ui.wrongPairs === 0;
    session.gained = 0;
    session.gainedMult = 1;
    recordStats(ex, ok);
    if (ok) awardCorrect(ex, item);
    ui.graded = true;
    ui.ok = ok;
    save();
    renderHud();
    updateChrome();
    renderFeedback(ok, true);
  }

  /* ================= Feedback bar ================= */

  function renderPendingFeedback(skeleton) {
    if (!session || session.finished || (ui && ui.graded)) return;
    var fb = document.getElementById("feedback");
    var item = session.queue[session.pos];
    var mode = item.scene ? "scene" : item.ex.t;
    var ready = false;
    if (!item.scene && item.ex.t !== "match") {
      if (item.ex.t === "choice" || item.ex.t === "blank" || (item.ex.t === "listen" && item.ex.c)) ready = !!ui.selected;
      else ready = !!(ui.input && ui.input.trim());
    }
    // rebuild only when the exercise or readiness actually changes — keeps
    // keystrokes from rebuilding the whole bar (and re-attaching listeners)
    // on every input event
    var key = session.pos + "|" + mode + "|" + ready;
    if (fb && !skeleton && fb.getAttribute("data-k") === key) return;
    if (!fb) {
      fb = document.createElement("div");
      fb.id = "feedback";
      document.body.appendChild(fb);
    }
    fb.className = "feedback";
    fb.setAttribute("data-k", key);
    if (item.scene) {
      fb.innerHTML = '<div class="feedback-inner"><div class="fb-text"><div class="fb-title">🎬 Scene</div><div class="fb-sub">Listen to the line, then continue</div></div><button class="btn" id="fb-go">Continue</button></div>';
      $("#fb-go").addEventListener("click", advance);
      return;
    }
    var ex = item.ex;
    if (ex.t === "match") {
      fb.innerHTML = '<div class="feedback-inner"><div class="fb-text"><div class="fb-sub muted">Match all the pairs to continue</div></div></div>';
      return;
    }
    fb.innerHTML = '<div class="feedback-inner"><div class="fb-text"><div class="fb-sub muted">' +
      (ready ? "Looking good — press Check! " + nudgeLine() : "Take your time — choose an answer or type your reply") +
      '</div></div><button class="btn" id="fb-check"' + (ready ? "" : " disabled") + ">Check</button></div>";
    var chk = $("#fb-check");
    if (chk && ready) chk.addEventListener("click", doCheck);
    if (skeleton && !ready && chk) chk.setAttribute("disabled", "disabled");
  }

  function doCheck() {
    if (!session || session.finished || !ui || ui.graded) return;
    var item = session.queue[session.pos];
    var ex = item.ex;
    if (ex.t === "choice" || ex.t === "blank" || (ex.t === "listen" && ex.c)) {
      if (!ui.selected) return;
      gradeChoice(ex, item, ui.selected);
    } else {
      var val = (ui.input || "").trim();
      if (!val) return;
      gradeText(ex, item, val);
    }
  }

  function renderFeedback(ok, isMatch) {
    var fb = document.getElementById("feedback");
    if (!fb) return;
    var item = session.queue[session.pos];
    var ex = item.ex;
    var outOfHearts = session.hearts <= 0;
    fb.className = "feedback " + (ok ? "ok" : "bad");
    var title, sub;
    if (ok) {
      title = praiseFor(session.combo);
      sub = session.gained ? "+" + session.gained + " XP" + (session.gainedMult > 1 ? " · combo ×" + session.gainedMult : "") : "Matched!";
      if (session.combo >= 3) sub += ' <b style="color:var(--orange)">🔥 ×' + multFor(session.combo) + "</b>";
    } else {
      title = isMatch ? "Keep practicing the pairs" : comfortLine();
      if (isMatch) {
        sub = "You made " + ui.wrongPairs + " mismatch" + (ui.wrongPairs === 1 ? "" : "es") + ". Tap the hint if you want a nudge.";
      } else {
        var shown = answersOf(ex.a)[0];
        sub = "The answer was <b>" + esc(shown) + "</b> — you'll see it again in Review.";
        if (ex.t === "listen") sub += ' <button class="btn blue small" id="fb-hear">🔊 Hear it</button>';
      }
    }
    if (outOfHearts && !ok) title = "Out of hearts ❤️";
    fb.innerHTML = '<div class="feedback-inner">' +
      '<div class="fb-text"><div class="fb-title ' + (ok ? "ok" : "bad") + '">' + title + "</div>" +
      '<div class="fb-sub">' + sub + "</div></div>" +
      (outOfHearts && !ok
        ? (state.gems >= REFILL_COST
          ? '<button class="btn gold" id="fb-refill">❤️ +2 hearts · ' + REFILL_COST + " 💎</button>"
          : "") + '<button class="btn ghost" id="fb-next">See results</button>'
        : '<button class="btn ' + (ok ? "" : "red") + '" id="fb-next">Continue</button>') +
      "</div>";
    var next = $("#fb-next");
    if (next) next.addEventListener("click", function () {
      if (session.hearts <= 0 && !ok) finishRun(false);
      else advance();
    });
    var refill = $("#fb-refill");
    if (refill) refill.addEventListener("click", function () {
      if (state.gems < REFILL_COST) return;
      state.gems -= REFILL_COST;
      session.hearts += 2;
      save(); renderHud();
      toast("❤️ +2 hearts — back in the game!");
      advance();
    });
    var hear = $("#fb-hear");
    if (hear) hear.addEventListener("click", function () { speak(answersOf(ex.a)[0]); });
  }

  function advance() {
    stopSpeech();
    session.pos++;
    if (session.pos >= session.total) { finishRun(true); return; }
    renderRun();
  }

  /* ================= Finish / results ================= */

  function finishRun(completed) {
    session.finished = true;
    session.completed = completed;
    state.xp += session.xp;
    state.practice += session.kind === "lesson" ? 0 : 1;

    if (session.kind === "lesson") {
      var id = session.lessonId;
      var acc = session.answered ? session.correct / session.answered : 0;
      if (completed) {
        var prev = state.lessons[id];
        state.lessons[id] = {
          done: true,
          best: Math.max(acc, (prev && prev.best) || 0),
          at: Date.now()
        };
        ensureDay();
        session.firstToday = state.day.lessons === 0;
        state.day.lessons++;
        session.streakInfo = updateStreak();
        session.perfect = session.wrong === 0 && session.answered > 0;
        if (session.perfect) state.perfect++;
        var gems = 5 + (session.perfect ? 15 : 0) + (session.firstToday ? 10 : 0);
        state.gems += gems;
        state.gemsEarned += gems;
        session.gemsEarned = gems;
        // detect newly unlocked lesson
        var o = ORDER[id];
        var nextId = COURSE_LESSONS[o.course.id][o.idx + 1];
        if (!hasPerk("unlockLevels") && nextId && isUnlocked(nextId) && !(state.lessons[nextId] && state.lessons[nextId].done)) session.nextUnlocked = LESSONS[nextId];
      }
    }
    session.newBadges = checkBadges();
    save();
    cloudTouch(false);
    renderHud();
    renderResults();
  }

  function renderResults() {
    var app = document.getElementById("app");
    var fb = document.getElementById("feedback");
    if (fb) fb.parentNode.removeChild(fb);
    var s = session;
    var acc = s.answered ? Math.round((s.correct / s.answered) * 100) : 0;
    var ok = s.completed;

    var hero, sub;
    if (!ok && s.kind !== "lesson") {
      hero = "Out of hearts ❤️";
      sub = "Hearts start fresh next session — and every XP you earned is yours to keep.";
    } else if (s.kind !== "lesson") {
      hero = "¡Sesión completada!";
      sub = s.kind === "review" ? "Saved mistakes you got right are on their way to graduation." : "Practice makes progress — and you just made some.";
    } else if (ok) {
      hero = s.perfect ? "¡Lección perfecta! 🌈" : "¡Lección completada! 🎉";
      sub = s.perfect ? "A flawless run — you nailed every single one. ¡Impresionante!"
        : s.firstToday ? "First lesson of the day — bonus gems! You showed up. That's the hard part. 💪"
        : "Another step forward on your path — keep the momentum going!";
    } else {
      hero = "Out of hearts ❤️";
      sub = "This one caught you off guard — that's how learning works. Your XP still counts; try again whenever you're ready.";
    }

    var streakTxt = s.kind === "lesson" && s.streakInfo && s.streakInfo.grew
      ? state.streak.count + " 🔥 (+" + (s.streakInfo.froze ? "freeze used" : "1") + ")"
      : state.streak.count + " 🔥";

    var html =
      '<div class="result-hero' + (ok ? "" : " fail") + '">' +
      '<div class="big">' + esc(hero) + "</div>" +
      "<div>" + esc(s.title) + "</div>" +
      '<div style="opacity:.85;margin-top:6px">' + esc(sub) + "</div></div>" +
      '<div class="result-grid">' +
      '<div class="stat-tile xp"><div class="label">XP earned</div><div class="value">⚡ ' + s.xp + "</div></div>" +
      '<div class="stat-tile acc"><div class="label">Accuracy</div><div class="value">' + acc + "%</div></div>" +
      '<div class="stat-tile streak"><div class="label">Streak</div><div class="value">' + esc(streakTxt) + "</div></div>" +
      '<div class="stat-tile gem"><div class="label">Gems earned</div><div class="value">💎 +' + s.gemsEarned + "</div></div>" +
        "</div>";

    if (s.newBadges && s.newBadges.length) {
      html += '<div class="unlock-list">' + s.newBadges.map(function (b) {
        return '<div class="unlock">🏅 <div><div>' + esc(b.ico + " " + b.name) + '</div><div class="muted" style="font-size:13.5px">' + esc(b.desc) + "</div></div></div>";
      }).join("") + "</div>";
    }
    if (s.nextUnlocked) {
      html += '<div class="unlock-list"><div class="unlock">🔓 <div><div>Next: ' + esc(s.nextUnlocked.title) +
        '</div><div class="muted" style="font-size:13.5px">The path continues!</div></div></div></div>';
    }

    html += '<div class="row" style="margin-top:8px">';
    if (!ok && s.kind === "lesson") {
      html += '<button class="btn" id="r-retry">Keep trying this lesson</button>' +
        '<button class="btn ghost" id="r-path">Back to path</button>';
    } else {
      html += '<button class="btn" id="r-path">' + (s.kind === "lesson" ? "Continue" : "Back to review") + "</button>";
    }
    html += "</div>";
    html += '<p class="muted center" style="margin-top:14px;font-size:13.5px">' + esc(nudgeLine()) + "</p>";

    app.innerHTML = html;
    var retry = $("#r-retry");
    if (retry) retry.addEventListener("click", function () {
      // restart the same lesson with a fresh set of hearts
      startLessonSession(s.lessonId);
      renderRun();
    });
    var back = $("#r-path");
    if (back) back.addEventListener("click", function () {
      session = null; ui = null;
      location.hash = s.kind === "lesson" ? "#/path" : "#/review";
    });
  }

  /* ================= Views ================= */

  function viewPath() {
    var done = doneCount();
    var greeting, tagline;
    if (done === 0) {
      greeting = "¡Hola! 👋 Welcome to Habla Libre";
      tagline = "Ready for your first word? Tap the first lesson below — we'll go at your pace, one step at a time.";
    } else if (state.streak.count >= 2) {
      greeting = "¡Hola de nuevo! 🔥 Welcome back";
      tagline = "You're on a " + state.streak.count + "-day streak — let's keep it alive. " + nudgeLine();
    } else {
      greeting = "¡Hola! 👋 Your path to Spanish";
      tagline = "You've completed " + done + " lesson" + (done === 1 ? "" : "s") + ". " + nudgeLine();
    }
    var html = '<div class="page-head"><h1>' + greeting + "</h1>" +
      "<p>" + esc(tagline) + "</p></div>";

    COURSES.forEach(function (c) {
      var ids = COURSE_LESSONS[c.id];
      var done = courseDone(c.id);
      var pct = ids.length ? Math.round((done / ids.length) * 100) : 0;
      html += '<section class="course">' +
        '<div class="course-head" style="background:' + c.color + '">' +
        "<div><h2>" + c.icon + " " + esc(c.title) + '</h2><div class="sub">' + esc(c.desc) + "</div></div>" +
        '<div class="pct">' + pct + "%</div></div>" +
        '<div class="course-progress"><i style="width:' + pct + "%;background:" + c.color + '"></i></div>';

      c.units.forEach(function (u) {
        var uDone = u.lessons.filter(function (id) { return state.lessons[id] && state.lessons[id].done; }).length;
        html += '<div class="unit"><div class="unit-title"><b>' + esc(u.title) + '</b><span>' + esc(u.sub) + " · " + uDone + "/" + u.lessons.length + "</span></div>";
        html += '<div class="path">';
        u.lessons.forEach(function (id, i) {
          var l = LESSONS[id];
          if (!l) return;
          var st = state.lessons[id];
          var unlocked = isUnlocked(id);
          var cls = st && st.done ? "node done" : unlocked ? "node" : "node locked";
          var offs = ["", "off-r", "", "off-l"][i % 4];
          html += '<div class="node-wrap ' + offs + '">' +
            '<button class="' + cls + '" data-lesson="' + id + '" title="' + esc(l.title) + (unlocked ? "" : " — locked") + '">' +
            (st && st.done ? "👑" : unlocked ? esc(l.icon) : "🔒") + "</button>" +
            '<div class="node-label">' + esc(l.title) + "</div>" +
            (st && st && st.best ? '<div class="node-best">best ' + Math.round(st.best * 100) + "%</div>" : "") +
            "</div>";
        });
        html += "</div></div>";
      });
      html += "</section>";
    });

    html += '<div class="footer-note">Habla Libre · runs 100% locally · progress lives in your browser\'s localStorage</div>';
    renderInto(html);
    $all("[data-lesson]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-lesson");
        if (!isUnlocked(id)) {
          var o = ORDER[id];
          var prev = o ? LESSONS[COURSE_LESSONS[o.course.id][o.idx - 1]] : null;
          toast("🔒 Finish <b>" + esc(prev ? prev.title : "the previous lesson") + "</b> first — you're so close!");
          return;
        }
        location.hash = "#/lesson/" + id;
      });
    });
  }

  function mistakePrompt(m) {
    var ex = m.ex;
    if (ex.t === "listen") return "🔊 " + answersOf(ex.a)[0];
    if (ex.t === "match") return "↔ Match " + ex.pairs.length + " pairs: " + ex.pairs.map(function (p) { return p[0]; }).join(", ");
    if (ex.t === "blank") return ex.q;
    return (ex.q || instructionFor(ex));
  }

  function viewReview() {
    var due = mistakesDue().sort(function (a, b) { return state.mistakes[a].due - state.mistakes[b].due; });
    var all = Object.keys(state.mistakes);
    var later = all.length - due.length;

    var html = '<div class="page-head"><h1>🎧 Review & Practice</h1>' +
      (due.length
        ? "<p>" + due.length + " word" + (due.length === 1 ? "" : "s") + " ready to strengthen — turning yesterday's misses into today's wins. 💪</p>"
        : "<p>Every wrong answer comes back here on a spaced schedule (1 · 2 · 4 · 8 · 16 days) — that's how it sticks. 🧠</p>") + "</div>";

    html += '<div class="row" style="margin-bottom:16px">' +
      '<button class="btn" id="rev-due"' + (due.length ? "" : " disabled") + ">🎧 Practice due mistakes (" + due.length + ")</button>" +
      '<button class="btn blue" id="rev-practice">💪 General practice (10)</button></div>';

    html += '<div class="card"><h3 style="margin-top:0">Due now</h3>';
    if (!due.length) {
      html += '<p class="muted">Nothing due — you\'re all caught up! 🎉 Run a general practice to keep sharp and earn more XP.</p>';
    } else {
      due.slice(0, 8).forEach(function (id) {
        var m = state.mistakes[id];
        var ans = m.ex.t === "match" ? "—" : answersOf(m.ex.a)[0];
        html += '<div class="review-item"><div><div class="p">' + esc(mistakePrompt(m)) + '</div>' +
          '<div class="a">Answer: ' + esc(ans) + " · " + esc(m.lesson) + " · box " + m.box + "</div></div>" +
          '<span class="due-pill">Due now</span></div>';
      });
      if (due.length > 8) html += '<p class="muted">…and ' + (due.length - 8) + " more in the next round.</p>";
    }
    html += "</div>";

    html += '<div class="card"><h3 style="margin-top:0">Saved mistakes</h3>' +
      '<p class="muted">' + all.length + " saved · " + later + " scheduled later</p>";
    if (all.length) {
      html += '<button class="btn ghost small" id="rev-clear">🗑 Clear saved mistakes</button>';
    } else {
      html += '<p class="muted">Wrong answers during lessons land here automatically.</p>';
    }
    html += "</div>";

    renderInto(html);

    var d = $("#rev-due");
    if (d && due.length) d.addEventListener("click", function () {
      var list = buildReviewSession();
      if (!list) return;
      startSession("review", list);
      location.hash = "#/lesson/review";
      render();
    });
    $("#rev-practice").addEventListener("click", function () {
      startSession("practice", buildPracticeSession());
      location.hash = "#/lesson/practice";
      render();
    });
    var clr = $("#rev-clear");
    if (clr) clr.addEventListener("click", function () {
      openModal("<h3>Clear saved mistakes?</h3><p>This only clears the review queue — XP, streak and lesson progress stay.</p>" +
        '<div class="modal-actions"><button class="btn ghost" id="m-no">Cancel</button><button class="btn red" id="m-yes">Clear queue</button></div>');
      $("#m-no").addEventListener("click", closeModal);
      $("#m-yes").addEventListener("click", function () {
        state.mistakes = {}; save(); closeModal(); render(); toast("🗑 Review queue cleared");
      });
    });
  }

  function cloudAccountHtml() {
    var cs = cloudStatus();
    var status = cs === "on"
      ? "☁️ Signed in as <b>" + esc(displayName()) + "</b> — progress backs up and syncs across devices."
      : cs === "signed-out"
      ? "☁️ Cloud is ready — sign in to back up progress, sync devices, and join the global leaderboard."
      : "☁️ Cloud sync unavailable — learning stays on this device.";
    var body = "";
    if (cs === "on") {
      body = '<div class="row" style="gap:8px"><button class="btn ghost small" id="cloud-signout">Sign out</button></div>';
    } else if (cs === "signed-out") {
      var up = cloud.emailMode === "up";
      body = '<div class="row" style="gap:8px">' +
        '<button class="btn blue small" id="cloud-signin">Sign in with Google</button>' +
        '<button class="btn ghost small" id="cloud-email-toggle">✉️ Email</button>' +
        "</div>";
      if (cloud.emailOpen) {
        body += '<form class="email-form" id="email-form" onsubmit="return false">' +
          (up ? '<input class="code-input" id="em-name" type="text" placeholder="Your name" autocomplete="name" style="width:100%">' : "") +
          '<input class="code-input" id="em-email" type="email" placeholder="Email" autocomplete="email" style="width:100%;text-transform:none;letter-spacing:0">' +
          '<input class="code-input" id="em-pass" type="password" placeholder="Password" autocomplete="' + (up ? "new-password" : "current-password") + '" style="width:100%;text-transform:none;letter-spacing:0">' +
          '<div class="em-err" id="em-err"></div>' +
          '<div class="row" style="gap:8px">' +
          '<button class="btn blue small" id="cloud-email-go">' + (up ? "Create account" : "Sign in") + "</button>" +
          '<button class="btn ghost small" id="cloud-email-switch">' + (up ? "Have an account? Sign in" : "New here? Create account") + "</button>" +
          "</div></form>";
      }
    }
    return '<div class="card"><h3 style="margin-top:0">☁️ Cloud account</h3>' +
      '<p class="muted" style="font-size:13.5px">' + status + "</p>" + body + "</div>";
  }

  function viewLeaders() {
    var html = '<div class="page-head"><h1>🏆 Global leaderboard</h1>' +
      "<p>Top learners by XP — sign in on the Stats page to join in.</p></div>";
    if (cloudStatus() === "off") {
      html += '<div class="card center"><p class="muted">☁️ Cloud isn\'t set up on this build yet — the board unlocks once Firebase is connected.</p></div>';
      renderInto(html);
      return;
    }
    html += '<div class="card" id="board-card"><p class="muted">Loading the board…</p></div>';
    renderInto(html);
    cloudLoadBoard(function (rows) {
      var card = document.getElementById("board-card");
      if (!card) return;
      if (!rows || !rows.length) {
        card.innerHTML = '<p class="muted">No scores yet — finish a lesson while signed in and you\'ll be the first name up here. 🎉</p>';
        return;
      }
      var mine = cloud.user ? cloud.user.uid : null;
      card.innerHTML = '<div class="board">' + rows.map(function (r, i) {
        var medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1);
        return '<div class="board-row' + (r.uid === mine ? " me" : "") + '">' +
          '<span class="b-rank">' + medal + "</span>" +
          '<span class="b-name">' + esc(r.name) + "</span>" +
          '<span class="b-stat">⚡' + r.xp + "</span>" +
          '<span class="b-stat">👑' + r.lessons + "</span>" +
          '<span class="b-stat">🔥' + r.streak + "</span></div>";
      }).join("") + "</div>";
    });
  }

  function viewBadges() {
    var earned = Object.keys(state.badges).length;
    var remaining = BADGES.length - earned;
    var badgeMsg = earned === 0
      ? "Your first badge is just one lesson away — every one pays gems or XP. Let's get collecting! 🏅"
      : earned === BADGES.length
        ? "All " + BADGES.length + " badges earned — absolute legend! 🏆 You've completed everything."
        : earned + " of " + BADGES.length + " earned · " + remaining + " to go. Each one pays gems or XP — you're doing great!";
    var html = '<div class="page-head"><h1>🏅 Achievements</h1><p>' + esc(badgeMsg) + '</p></div><div class="badge-grid">';
    var sorted = BADGES.slice().sort(function (a, b) {
      var ea = state.badges[a.id] ? 1 : 0, eb = state.badges[b.id] ? 1 : 0;
      return eb - ea;
    });
    sorted.forEach(function (b) {
      var has = !!state.badges[b.id];
      var cur = Math.min(b.cur(), b.goal);
      var pct = Math.round((cur / b.goal) * 100);
      var reward = b.reward.gems ? "+" + b.reward.gems + " 💎" : "+" + b.reward.xp + " ⚡";
      var earnedLabel = has ? "✅ Earned" : "Ready to earn";
      html += '<div class="badge-card ' + (has ? "earned" : "locked") + '">' +
        '<div class="b-ico">' + b.ico + "</div><div style=\"flex:1\">" +
        '<div class="b-name">' + esc(b.name) + "</div>" +
        '<div class="b-desc">' + esc(b.desc) + "</div>" +
        '<div class="b-bar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="b-reward">' + earnedLabel + ' · ' + reward + ' · ' + cur + "/" + b.goal + "</div>" +
        "</div></div>";
    });
    html += "</div>";
    renderInto(html);
  }

  function viewStats() {
    var acc = state.answered ? Math.round((state.correct / state.answered) * 100) : 0;
    var total = LESSON_LIST.length;

    var html = '<div class="page-head"><h1>📊 Your stats</h1><p>Everything here is stored in this browser' +
      (FB_CONFIG ? ", and in your cloud account when signed in" : "") + ".</p></div>";

    html += cloudAccountHtml();

    html += '<div class="stat-cards">' +
      '<div class="big-stat"><div class="v">' + state.xp + '</div><div class="l">Total XP</div></div>' +
      '<div class="big-stat"><div class="v">' + state.streak.count + '</div><div class="l">Day streak 🔥</div></div>' +
      '<div class="big-stat"><div class="v">' + state.gems + '</div><div class="l">Gems 💎</div></div>' +
      '<div class="big-stat"><div class="v">' + state.freezes + '</div><div class="l">Streak freezes 🧊</div></div>' +
      '<div class="big-stat"><div class="v">' + acc + '%</div><div class="l">Accuracy (' + state.correct + "/" + state.answered + ")</div></div>" +
      '<div class="big-stat"><div class="v">' + doneCount() + "/" + total + '</div><div class="l">Lessons done</div></div>' +
      '<div class="big-stat"><div class="v">' + state.perfect + '</div><div class="l">Flawless lessons 🌈</div></div>' +
      '<div class="big-stat"><div class="v">' + state.comboBest + '</div><div class="l">Best combo 🔥</div></div>' +
      "</div>";

    html += '<div class="card"><h3 style="margin-top:0">Course progress</h3>';
    COURSES.forEach(function (c) {
      var ids = COURSE_LESSONS[c.id];
      var d = courseDone(c.id);
      var pct = Math.round((d / ids.length) * 100);
      html += '<div style="margin-bottom:12px"><div class="row spread"><b>' + c.icon + " " + esc(c.title) + '</b><span class="muted">' + d + "/" + ids.length + " · " + pct + '%</span></div>' +
        '<div class="b-bar" style="height:12px"><i style="width:' + pct + "%;background:" + c.color + '"></i></div></div>';
    });
    html += "</div>";

    html += '<div class="card"><h3 style="margin-top:0">🧊 Streak freeze shop</h3>' +
      '<div class="shop-item"><div><div class="t">Streak freeze ×1</div><div class="d">Miss a day without losing your streak. You own ' + state.freezes + ".</div></div>" +
      '<button class="btn blue small" id="buy-freeze"' + (state.gems >= FREEZE_COST ? "" : " disabled") + ">Buy · " + FREEZE_COST + " 💎</button></div>" +
      '<p class="muted" style="font-size:13.5px">Earn gems: 5 per lesson, 15 extra for a flawless lesson, 10 for the first lesson of the day, plus badge rewards.</p></div>';

    var perksTxt = activePerksText();
    html += '<div class="card"><h3 style="margin-top:0">🎁 Promo code</h3>' +
      '<p class="muted" style="font-size:13.5px">' + (perksTxt ? esc(perksTxt) : "Got a promo code? Enter it to activate your perks for this browser.") + "</p>" +
      '<div class="shop-item"><div><div class="t">Have a code?</div><div class="d">Enter it below to activate your perks</div></div>' +
      '<div class="row" style="gap:8px"><input type="text" class="code-input" id="perk-input" placeholder="Promo code" autocomplete="off" autocapitalize="characters" spellcheck="false">' +
      '<button class="btn blue small" id="perk-go">Redeem</button></div></div></div>';

    html += '<div class="card danger-zone"><h3 style="margin-top:0">⚠️ Reset progress</h3>' +
      '<p class="muted">Deletes XP, gems, streak, badges, lesson completion and saved mistakes from this browser. There is no undo.</p>' +        '<button class="btn red small" id="reset-btn">Reset everything…</button></div>';

  renderInto(html);

  var buy = $("#buy-freeze");
    if (buy) buy.addEventListener("click", function () {
      if (state.gems < FREEZE_COST) return;
      state.gems -= FREEZE_COST;
      state.freezes++;
      state.freezesBought++;
      checkBadges();
      save(); renderHud(); render();
      toast("🧊 Streak freeze purchased!");
    });
    var perkGo = $("#perk-go"), perkInput = $("#perk-input");
    if (perkGo && perkInput) {
      var tryPerk = function () {
        var res = redeemPerk(perkInput.value);
        if (res === 0) toast("❌ That code isn't valid");
        else if (res === 2) toast("✅ That perk is already active");
        else toast("🎁 Perk activated — enjoy!");
        if (res === 1) { perkInput.value = ""; render(); }
      };
      perkGo.addEventListener("click", tryPerk);
      perkInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); tryPerk(); }
      });
    }
    $("#reset-btn").addEventListener("click", openResetModal);
    var sin = $("#cloud-signin"), sout = $("#cloud-signout");
    if (sin) sin.addEventListener("click", cloudSignIn);
    if (sout) sout.addEventListener("click", cloudSignOut);
    var et = $("#cloud-email-toggle");
    if (et) et.addEventListener("click", function () { cloud.emailOpen = true; render(); });
    var es = $("#cloud-email-switch");
    if (es) es.addEventListener("click", function () {
      cloud.emailMode = cloud.emailMode === "up" ? "in" : "up";
      render();
      var f = $("#em-email"); if (f) f.focus();
    });
    var eg = $("#cloud-email-go");
    if (eg) eg.addEventListener("click", cloudEmailSubmit);
    var ef = $("#email-form");
    if (ef) ef.addEventListener("submit", function (e) { e.preventDefault(); cloudEmailSubmit(); });
    if (cloud.emailOpen) { var fe = $("#em-email"); if (fe) fe.focus(); }
  }

  /* ================= Reference pages ================= */

  function wireSpeakButtons(root) {
    $all("[data-say]", root).forEach(function (b) {
      b.addEventListener("click", function () { speak(b.getAttribute("data-say")); });
    });
  }

  function refHead(title, blurb) {
    return '<div class="page-head"><h1>' + title + '</h1><p>' + blurb +
      ' <a href="#/reference">← All reference</a></p></div>';
  }

  function viewReference() {
    var R = (typeof window !== "undefined" && window.REFERENCE) || { alphabet: [], glossary: [], verbs: [] };
    var html = '<div class="page-head"><h1>📖 Reference</h1><p>Everything you need to look things up — the alphabet, a searchable dictionary, and full verb tables. Works offline.</p></div>';
    html += '<div class="ref-grid">';
    html += '<a class="ref-card" href="#/alphabet"><div class="ic">🔤</div><div class="t">Alphabet &amp; Sounds</div><div class="d">' +
      R.alphabet.length + ' letters, plus the tricky sounds (ñ, rr, j…). Tap to hear each one.</div></a>';
    html += '<a class="ref-card" href="#/dictionary"><div class="ic">📖</div><div class="t">Dictionary</div><div class="d">' +
      R.glossary.length + ' words ES ↔ EN, grouped by topic and searchable.</div></a>';
    html += '<a class="ref-card" href="#/verbs"><div class="ic">🔧</div><div class="t">Verb Conjugator</div><div class="d">' +
      R.verbs.length + ' common verbs across present, preterite &amp; future.</div></a>';
    html += '</div>';
    renderInto(html);
  }

  function viewAlphabet() {
    var R = (typeof window !== "undefined" && window.REFERENCE) || { alphabet: [], sounds: [] };
    var html = refHead("🔤 Alphabet &amp; sounds", "The 27 letters of the Spanish alphabet — tap any card to hear it.");
    html += '<div class="card"><div class="alpha-grid">';
    R.alphabet.forEach(function (a) {
      html += '<button class="alpha-cell" data-say="' + esc(a.ch + ", " + a.sample) + '" title="' + esc(a.tip) + '">' +
        '<span class="ch">' + esc(a.ch) + '</span>' +
        '<span class="nm">' + esc(a.name) + '</span>' +
        '<span class="tp">' + esc(a.tip) + '</span></button>';
    });
    html += '</div></div>';

    html += '<div class="card"><h3 style="margin-top:0">🎧 Tricky sounds</h3><div class="sound-list">';
    R.sounds.forEach(function (s) {
      html += '<div class="sound-row"><button class="btn ghost small" data-say="' + esc(s.combo) + '">🔊</button>' +
        '<div class="combo">' + esc(s.combo) + ' <span class="ipa">' + esc(s.ipa) + '</span></div>' +
        '<div class="how">' + esc(s.how) + '</div></div>';
    });
    html += '</div></div>';
    renderInto(html);
    wireSpeakButtons(document);
  }

  var dictCat = "All";
  function viewDictionary() {
    var R = (typeof window !== "undefined" && window.REFERENCE) || { glossary: [] };
    var cats = {};
    R.glossary.forEach(function (g) { cats[g.cat] = 1; });
    var catList = ["All"].concat(Object.keys(cats));

    var html = refHead("📖 Dictionary", "Search Spanish ↔ English, or filter by topic.");
    html += '<div class="card"><div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:10px">' +
      '<input type="text" id="dict-q" class="code-input" style="width:100%;max-width:340px;letter-spacing:0;text-transform:none" placeholder="Type a word… (e.g. hola, agua, cat)">' +
      '</div><div class="row" style="gap:6px;flex-wrap:wrap">' +
      catList.map(function (c) {
        return '<button class="chip cloud' + (c === dictCat ? " on" : "") + ' dict-cat" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
      }).join("") +
      '</div><div id="dict-list" class="dict-list"></div></div>';
    renderInto(html);

    var list = document.getElementById("dict-list");
    var q = document.getElementById("dict-q");
    function draw() {
      var term = (q.value || "").trim().toLowerCase();
      var items = R.glossary.filter(function (g) {
        var catOk = dictCat === "All" || g.cat === dictCat;
        var termOk = !term || g.es.toLowerCase().indexOf(term) !== -1 || g.en.toLowerCase().indexOf(term) !== -1;
        return catOk && termOk;
      });
      if (!items.length) { list.innerHTML = '<p class="muted">No matches — try another word.</p>'; return; }
      list.innerHTML = items.map(function (g) {
        return '<div class="dict-row"><button class="btn ghost small" data-say="' + esc(g.es) + '">🔊</button>' +
          '<span class="es">' + esc(g.es) + '</span>' +
          '<span class="en">' + esc(g.en) + '</span>' +
          '<span class="cat">' + esc(g.cat) + '</span></div>';
      }).join("");
      wireSpeakButtons(list);
    }
    q.addEventListener("input", draw);
    $all(".dict-cat").forEach(function (b) {
      b.addEventListener("click", function () { dictCat = b.getAttribute("data-cat"); viewDictionary(); });
    });
    draw();
  }

  var verbIdx = 0, verbTense = "present";
  function viewVerbs() {
    var R = (typeof window !== "undefined" && window.REFERENCE) || { verbs: [], pronouns: [] };
    if (!R.verbs.length) { renderInto(refHead("🔧 Verb conjugator", "No verb data available.")); return; }
    if (verbIdx < 0 || verbIdx >= R.verbs.length) verbIdx = 0;
    var v = R.verbs[verbIdx];

    var html = refHead("🔧 Verb conjugator", "Pick a verb and a tense — see the full six-person table.");
    html += '<div class="card"><div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
      '<select id="verb-pick" class="code-input" style="width:auto;min-width:180px;text-transform:none;letter-spacing:0">' +
      R.verbs.map(function (vv, i) {
        return '<option value="' + i + '"' + (i === verbIdx ? " selected" : "") + '>' + esc(vv.inf) + ' — ' + esc(vv.en) + '</option>';
      }).join("") + '</select>' +
      '<div class="row" style="gap:6px">' +
      ["present", "preterite", "future"].map(function (t) {
        var lbl = t === "present" ? "Present" : t === "preterite" ? "Preterite" : "Future";
        return '<button class="chip cloud' + (t === verbTense ? " on" : "") + ' verb-tense" data-tense="' + t + '">' + lbl + '</button>';
      }).join("") + '</div></div>';

    html += '<div class="conj">' + R.pronouns.map(function (p, i) {
      var form = v[verbTense][i];
      return '<div class="conj-row"><span class="pro">' + esc(p) + '</span>' +
        '<button class="conj-form" data-say="' + esc(form) + '">' + esc(form) + '</button></div>';
    }).join("") + '</div></div>';
    renderInto(html);
    wireSpeakButtons(document);

    document.getElementById("verb-pick").addEventListener("change", function () {
      verbIdx = +this.value || 0; viewVerbs();
    });
    $all(".verb-tense").forEach(function (b) {
      b.addEventListener("click", function () { verbTense = b.getAttribute("data-tense"); viewVerbs(); });
    });
  }

  function openResetModal() {
    openModal(
      "<h3>Reset all progress?</h3>" +
      "<p>This wipes XP, gems, streak, badges, lesson completion and mistakes stored in this browser. Type <b>RESET</b> to confirm.</p>" +
      '<input type="text" id="reset-input" placeholder="RESET" autocomplete="off">' +
      '<div class="modal-actions"><button class="btn ghost" id="reset-cancel">Cancel</button>' +
      '<button class="btn red" id="reset-go" disabled>Reset everything</button></div>'
    );
    var input = $("#reset-input"), go = $("#reset-go");
    input.addEventListener("input", function () {
      if (input.value.trim().toUpperCase() === "RESET") go.removeAttribute("disabled");
      else go.setAttribute("disabled", "disabled");
    });
    $("#reset-cancel").addEventListener("click", closeModal);
    go.addEventListener("click", function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      state = defaultState();
      session = null; ui = null;
      closeModal();
      save(); renderHud();
      location.hash = "#/path";
      render();
      toast("🗑 Progress reset — welcome to day one!");
    });
    setTimeout(function () { try { input.focus(); } catch (e) {} }, 50);
  }

  /* ================= Router ================= */

  function renderInto(html) {
    var app = document.getElementById("app");
    var fb = document.getElementById("feedback");
    if (fb) fb.parentNode.removeChild(fb);
    app.innerHTML = html;
  }

  function setNav(name) {
    $all("#mainnav a").forEach(function (a) {
      if (a.getAttribute("data-nav") === name) a.classList.add("active");
      else a.classList.remove("active");
    });
  }

  function render() {
    var hash = location.hash.replace(/^#/, "") || "/path";
    var parts = hash.split("/").filter(Boolean);
    var view = parts[0] || "path";
    renderHud();

    if (view === "lesson") {
      var id = parts[1] || "";
      if (id === "review" || id === "practice") {
        // review/practice sessions are started explicitly from the Review page
        if (!session || session.kind === "lesson" || session.finished) {
          location.hash = "#/review";
          return;
        }
      } else {
        if (!LESSONS[id]) { location.hash = "#/path"; return; }
        if (!isUnlocked(id)) {
          toast("🔒 That lesson is locked — complete the previous one first");
          location.hash = "#/path";
          return;
        }
        if (!session || session.kind !== "lesson" || session.lessonId !== id || session.finished) {
          startLessonSession(id);
        }
      }
      if (session.finished) renderResults();
      else renderRun();
      setNav(session.kind === "lesson" ? "path" : "review");
      return;
    }

    // leaving the run views entirely: drop any session
    session = null;
    ui = null;
    stopSpeech();

    if (view === "review") { viewReview(); setNav("review"); }
    else if (view === "badges") { viewBadges(); setNav("badges"); }
    else if (view === "leaders") { viewLeaders(); setNav("leaders"); }
    else if (view === "stats") { viewStats(); setNav("stats"); }
    else if (view === "reference") { viewReference(); setNav("reference"); }
    else if (view === "alphabet") { viewAlphabet(); setNav("reference"); }
    else if (view === "dictionary") { viewDictionary(); setNav("reference"); }
    else if (view === "chess") { viewChess(); setNav("chess"); }
    else if (view === "verbs") { viewVerbs(); setNav("reference"); }
    else { viewPath(); setNav("path"); }
    window.scrollTo(0, 0);
  }

  /* ================= Keyboard ================= */

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeModal(); return; }
    var hash = location.hash.replace(/^#/, "");
    if (hash.indexOf("/lesson/") !== 0 || !session || session.finished || !ui) return;

    if (e.key === "Enter") {
      e.preventDefault();
      if (ui.graded) { var n = $("#fb-next"); if (n) n.click(); }
      else if (ui.kind === "ex") doCheck();
      else { var g = $("#fb-go"); if (g) g.click(); }
      return;
    }
    if (!ui.graded && ui.kind === "ex" && /^[1-9]$/.test(e.key)) {
      var item = session.queue[session.pos];
      var ex = item.ex;
      if (ex.t === "choice" || ex.t === "blank" || (ex.t === "listen" && ex.c)) {
        var opts = $all(".choice");
        var pick = opts[+e.key - 1];
        if (pick) { pick.click(); }
      }
    }
  });

  /* ================= Boot ================= */

  window.addEventListener("hashchange", function () {
    stopSpeech();
    render();
  });

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = initVoices;
    initVoices();
    setTimeout(initVoices, 300);
    setTimeout(initVoices, 1500);
  }

  window.addEventListener("beforeunload", function () {
    stopSpeech();
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; save(); }
  });

  // debug/testing handle (harmless, read-only-ish)
  function viewChess() {
    if (window.CHESS_UI) window.CHESS_UI.mount();
  }

  // Shared with the other views: chess-ui.js toasts moves through this.
  window.toast = toast;

  window.FB = {
    getState: function () { return state; },
    getUi: function () { return ui; },
    setUi: function (v) { ui = v; },
    getSession: function () { return session; },
    badges: function () { return BADGES; },
    checkBadges: checkBadges,
    save: save,
    render: render,
    hasPerk: hasPerk,
    redeemPerk: redeemPerk,
    isCorrectText: isCorrectText,
    finishExercise: finishExercise,
    finishRun: finishRun,
    startLessonSession: startLessonSession,
    startSession: startSession,
    buildReviewSession: buildReviewSession,
    viewPath: viewPath,
    isUnlocked: isUnlocked,
    doneCount: doneCount,
    speak: speak,
    bootCloud: bootCloud,
    cloud: function () { return cloud; },
    cloudStatus: cloudStatus,
    mergeCloudProfile: mergeCloudProfile,
    cloudTouch: cloudTouch,
    cloudSignIn: cloudSignIn,
    cloudSignOut: cloudSignOut,
    chessUI: window.CHESS_UI
  };

  ensureDay();
  rollStreak();
  initCloud();
  if (!location.hash) location.hash = "#/path";
  save();

  // Warm welcome: greet brand-new learners, and encourage returning streaks.
  try {
    var returning = doneCount() > 0;
    if (!returning) {
      setTimeout(function () { toast("👋 Welcome to Habla Libre! " + pick(["Tap the first lesson whenever you're ready.", "Let's learn your first Spanish words together. 🌱", "Your first word is one tap away — no pressure.", "Bienvenido! Start with lesson one and go at your own pace."])); }, 700);
    } else if (state.streak.count >= 3) {
      setTimeout(function () { toast("🔥 " + state.streak.count + "-day streak — you're on fire! Keep it going."); }, 700);
    } else if (state.streak.count === 2) {
      setTimeout(function () { toast("🔥 Two days in a row — nice momentum! One more tomorrow."); }, 700);
    }
  } catch (e) {}

  render();
})();
