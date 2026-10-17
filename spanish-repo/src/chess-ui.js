/* ============================================================
   Habla Libre — Chess playing session (UI)
   Play the computer: coordinates on the board, trade trays,
   move list, promotion dialogs and a persistent game history
   (saved to localStorage under freebuff.chess.v1).
   Depends on window.CHESS (chess.js engine).
   ============================================================ */
(function () {
  "use strict";
  var CHESS = window.CHESS;

  var SKILLS = ["rustic", "decent", "fighting"];
  var VAL = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  var SKEY = "freebuff.chess.v1";

  var skillIdx = 1;         // AI search depth index (rustic/decent/fighting = 2/3/4 plies)
  var state = CHESS.newGame();
  var history = [];
  var moveNotes = [];
  var moveMeta = [];        // { san, from, to, cap: { c, t } | null }
  var humanColor = "w";     // "w" | "b" — the side the player controls
  var aiThinking = false;
  var resigned = false;
  var currentRecId = null;  // history id of the record for the CURRENT game
  var histOpen = null;      // expanded row in the game-history list
  var clearArmed = false;   // two-click confirm on "Clear history"
  var selected = -1;
  var geoSource = [];
  var boardEl = null;
  var statusEl = null;
  var movesEl = null;
  var resultsEl = null;
  var turnEl = null;
  var trayTopEl = null;
  var trayBotEl = null;
  var histEl = null;
  var histSumEl = null;
  var noteEl = null;
  var undoBtn = null;
  var clearBtn = null;
  var $app = document.getElementById("app");

  var FILES = "abcdefgh";
  var PIECE_CHAR = {
    w: { p: "\u265F", n: "\u265E", b: "\u265D", r: "\u265C", q: "\u265B", k: "\u265A" },
    b: { p: "\u265F", n: "\u265E", b: "\u265D", r: "\u265C", q: "\u265B", k: "\u265A" }
  };

  /* ---------------- persistent game history ---------------- */
  var store = { v: 1, skill: 1, games: [] };

  function loadStore() {
    try {
      var raw = localStorage.getItem(SKEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && p.v === 1 && Object.prototype.toString.call(p.games) === "[object Array]") {
          store = p;
        }
      }
    } catch (e) { /* storage unavailable: keep in-memory store */ }
    if (!store.games) store.games = [];
    skillIdx = (store.skill >= 0 && store.skill <= 2) ? store.skill : 1;
  }

  function saveStore() {
    store.skill = skillIdx;
    try { localStorage.setItem(SKEY, JSON.stringify(store)); }
    catch (e) { /* private mode / quota: history stays in memory */ }
  }
  loadStore();

  function fmtDate(d) {
    function p(n) { return n < 10 ? "0" + n : "" + n; }
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) +
      " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  function squareName(i) { return FILES[i & 7] + String((i >> 3) + 1); }
  function fileOf(i) { return i & 7; }
  function rankOf(i) { return i >> 3; }
  function otherColor(c) { return c === "w" ? "b" : "w"; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function legalMovesOn(s, c) {
    return CHESS.legalMoves(s).filter(function (m) { return s.board[m.from] && s.board[m.from].c === c; });
  }
  function legalMovesColor(c) { return legalMovesOn(state, c); }

  // The engine has no `capture` flag: a capture is a piece on the target
  // square, or an en-passant square. Returns the victim piece or null.
  function victimOf(m) {
    var v = state.board[m.to];
    if (!v && state.board[m.from] && state.board[m.from].t === "p" && m.to === state.ep && state.ep >= 0) {
      v = state.board[m.from].c === "w" ? state.board[state.ep - 8] : state.board[state.ep + 8];
    }
    return v || null;
  }
  function isCaptureMove(m) { return !!victimOf(m); }

  function movesFromSelected() {
    if (selected < 0) return [];
    if (geoSource.length === 0) {
      geoSource = CHESS.legalMoves(state).filter(function (m) { return m.from === selected; });
    }
    return geoSource;
  }

  /* ---------------- trades (pieces captured) ---------------- */

  // pieces captured BY `color` — one type-letter per victim, in move order
  function tradesBy(color) {
    var out = [];
    for (var i = 0; i < moveMeta.length; i++) {
      var m = moveMeta[i];
      if (m.cap && m.cap.c !== color) out.push(m.cap.t);
    }
    return out;
  }
  function sumVal(list) {
    var s = 0;
    for (var i = 0; i < list.length; i++) s += VAL[list[i]] || 0;
    return s;
  }

  function trayHtml(color, label) {
    var caps = tradesBy(color);
    var bal = sumVal(caps) - sumVal(tradesBy(otherColor(color)));
    var out = "<span class='who'>" + esc(label) + "</span>";
    if (!caps.length) out += "<span class='muted'>no captures yet</span>";
    for (var i = 0; i < caps.length; i++) {
      out += "<span class='pc pc-p" + otherColor(color) + "' title='" + caps[i] + "'>" +
        PIECE_CHAR.w[caps[i]] + "</span>";
    }
    if (bal > 0) out += "<span class='bal'>+" + bal + "</span>";
    return out;
  }

  /* ---------------- move application ---------------- */

  function makeMove(m) {
    var before = state;
    var piece = before.board[m.from];
    var victim = before.board[m.to];
    if (!victim && piece && piece.t === "p" && m.to === before.ep && before.ep >= 0) {
      victim = before.board[piece.c === "w" ? before.ep - 8 : before.ep + 8];
    }
    var moved = CHESS.applyMove(before, m);
    var san = notation(m, before, moved);
    history.push(before);
    moveNotes.push(san);
    moveMeta.push({
      san: san, from: m.from, to: m.to,
      cap: victim ? { c: victim.c, t: victim.t } : null
    });
    state = moved;
    geoSource = [];
    selected = -1;
    maybeRecord();
    if (piece && piece.c === humanColor) {
      if (m.promo) noteToast((piece.c === "w" ? "\u2659 " : "\u265f ") + "Promoted!");
      else if (m.castle) noteToast("Castling " + (m.castle === "k" ? "kingside" : "queenside") + ".");
      else if (victim) noteToast("Captured " + squareName(m.to) + "!");
      else noteToast("Played " + squareName(m.from) + "-" + squareName(m.to) + ".");
    }
  }

  // Standard algebraic notation. `before` is the pre-move state (the piece
  // still sits on m.from), `after` the post-move state (for check/mate).
  function notation(m, before, after) {
    if (m.castle) return m.castle === "k" ? "O-O" : "O-O-O";
    var p = before.board[m.from];
    var letters = p.t === "p" ? "" : (p.t === "n" ? "N" : p.t.toUpperCase());
    if (p.t !== "p") {
      // SAN disambiguation: another same-type piece of ours can also reach m.to.
      var same = legalMovesOn(before, p.c).filter(function (mm) {
        return !mm.castle && mm.from !== m.from && mm.to === m.to &&
          before.board[mm.from] && before.board[mm.from].t === p.t;
      });
      if (same.length) {
        var sameFile = same.some(function (mm) { return fileOf(mm.from) === fileOf(m.from); });
        var sameRank = same.some(function (mm) { return rankOf(mm.from) === rankOf(m.from); });
        if (!sameFile) letters += FILES[fileOf(m.from)];
        else if (!sameRank) letters += String(rankOf(m.from) + 1);
        else letters += FILES[fileOf(m.from)] + String(rankOf(m.from) + 1);
      }
    }
    var isEp = p.t === "p" && m.to === before.ep && !before.board[m.to];
    var cap = (!!before.board[m.to] || isEp) ? "x" : "";
    var pawnPart = (p.t === "p" && cap) ? FILES[fileOf(m.from)] : "";
    var target = squareName(m.to);
    var promoStr = m.promo ? "=" + m.promo.toUpperCase() : "";
    var st = CHESS.status(after);
    var suffix = (st === "checkmate") ? "#" : (st === "check" && !m.castle) ? "+" : "";
    return letters + pawnPart + cap + target + promoStr + suffix;
  }

  function inCheck() { return CHESS.inCheck(state, humanColor); }

  function isOver() {
    if (resigned) return true;
    var st = CHESS.status(state);
    return st === "checkmate" || st === "stalemate";
  }

  function statusText() {
    if (resigned) return "You resigned — undo to keep playing, or start a new game.";
    var st = CHESS.status(state);
    if (st === "checkmate") {
      return inCheck() ? "Checkmated — tough game!" : "Checkmate! " + (humanColor === "w" ? "White" : "Black") + " wins \u2713";
    }
    if (st === "stalemate") return "Stalemate — a draw.";
    if (inCheck()) return "\u26a0 Check! Cover your king";
    if (state.turn === humanColor) return (humanColor === "w" ? "White" : "Black") + " to move. Pick a piece, then click a highlighted square.";
    return "The computer is thinking\u2026";
  }

  function statusKind() {
    if (resigned) return "st-over";
    var st = CHESS.status(state);
    if (st === "checkmate" || st === "stalemate") return "st-over";
    if (CHESS.inCheck(state, state.turn)) return "st-check";
    if (aiThinking) return "st-wait";
    return "st-turn";
  }

  function setStatus(t) {
    if (!statusEl) return;
    statusEl.textContent = t;
    statusEl.className = "st " + statusKind();
  }

  // toast() is shared from app.js; degrade to the console if it is missing
  // so a load-order problem can never break the board.
  function noteToast(txt) {
    if (typeof toast === "function") toast(txt);
    else if (window.console) console.log("[toast] " + txt);
  }

  /* ---------------- game records ---------------- */

  function recordGame(result, reason) {
    if (currentRecId) return null;
    var g = {
      id: "g" + Date.now() + "-" + Math.floor(Math.random() * 1e6),
      date: fmtDate(new Date()),
      result: result,                 // win | loss | draw | unfinished
      reason: reason,                 // checkmate | stalemate | resigned | new-game
      color: humanColor,
      skill: skillIdx,
      moves: moveNotes.slice(),
      trades: { w: tradesBy("w"), b: tradesBy("b") },
      plies: moveNotes.length
    };
    store.games.unshift(g);
    if (store.games.length > 50) store.games.length = 50;
    currentRecId = g.id;
    saveStore();
    renderHistory();
    return g;
  }

  // called after every move: finished games are saved automatically
  function maybeRecord() {
    if (currentRecId) return;
    var st = CHESS.status(state);
    if (st !== "checkmate" && st !== "stalemate") return;
    var result = st === "stalemate" ? "draw" : (state.turn === humanColor ? "loss" : "win");
    if (recordGame(result, st)) {
      noteToast(result === "win" ? "You won — game saved to your history!"
        : result === "draw" ? "Draw — game saved to your history!"
          : "Game over — saved to your history.");
    }
  }

  function dropRecord() {
    if (!currentRecId) return;
    var id = currentRecId;
    store.games = store.games.filter(function (g) { return g.id !== id; });
    currentRecId = null;
    saveStore();
    renderHistory();
  }

  function recordSummary() {
    var w = 0, d = 0, l = 0;
    for (var i = 0; i < store.games.length; i++) {
      var r = store.games[i].result;
      if (r === "win") w++;
      else if (r === "draw") d++;
      else if (r === "loss") l++;
    }
    return { w: w, d: d, l: l, n: store.games.length };
  }

  var RESULT_LABEL = { win: "WIN", loss: "LOSS", draw: "DRAW", unfinished: "UNFIN" };
  var REASON_LABEL = {
    checkmate: "by checkmate", stalemate: "by stalemate",
    resigned: "resigned", "new-game": "left for a new game"
  };

  function historyHtml() {
    if (!store.games.length) {
      return "<div class='empty'>No games yet — finish or resign a game to start your record.</div>";
    }
    return store.games.map(function (g) {
      var open = histOpen === g.id;
      var head = "<div class='hhead'>" +
        "<span class='hres " + g.result + "'>" + RESULT_LABEL[g.result] + "</span>" +
        "<span class='hmeta'>" + esc(g.date) + " · " +
        (g.color === "w" ? "White" : "Black") + " · " + SKILLS[g.skill] +
        " · " + Math.ceil(g.plies / 2) + " moves</span>" +
        "<span class='htar'>" + (open ? "\u25be" : "\u25b8") + "</span></div>";
      if (!open) return "<div class='hrow' data-id='" + g.id + "'>" + head + "</div>";
      var moves = g.moves.length ? g.moves.join("  ") : "(no moves)";
      var tr = function (c) {
        var list = g.trades[c];
        if (!list.length) return "";
        var out = "<span class='ttl'>" + (c === "w" ? "White took" : "Black took") + "</span>";
        for (var i = 0; i < list.length; i++) {
          out += "<span class='pc pc-p" + otherColor(c) + "'>" + PIECE_CHAR.w[list[i]] + "</span>";
        }
        return out;
      };
      return "<div class='hrow open' data-id='" + g.id + "'>" + head +
        "<div class='hdet'><div class='hm'>" + esc(moves) + "</div>" +
        "<div class='ht'>" + (tr("w") || "") + (tr("b") || "") +
        ((g.trades.w.length + g.trades.b.length) ? "" : "<span class='muted'>no pieces traded</span>") +
        "</div>" +
        "<div class='muted'>" + esc(REASON_LABEL[g.reason] || g.reason) + "</div>" +
        "</div></div>";
    }).join("");
  }

  function renderHistory() {
    if (histEl) histEl.innerHTML = historyHtml();
    if (histSumEl) {
      var s = recordSummary();
      histSumEl.textContent = s.n ? s.n + " played · " + s.w + "W " + s.d + "D " + s.l + "L" : "";
    }
  }

  /* ---------------- rendering ---------------- */

  function boardHtml() {
    var out = [];
    var mvs = movesFromSelected();
    var flip = humanColor === "b";                 // always show YOUR side at the bottom
    var lm = moveMeta.length ? moveMeta[moveMeta.length - 1] : null;
    // own pieces that actually have a legal move (hover affordance)
    var froms = {};
    if (!aiThinking && !isOver()) {
      legalMovesColor(humanColor).forEach(function (x) { froms[x.from] = 1; });
    }
    var checkSq = -1;
    if (CHESS.inCheck(state, state.turn)) {
      for (var q = 0; q < 64; q++) {
        var kp = state.board[q];
        if (kp && kp.c === state.turn && kp.t === "k") { checkSq = q; break; }
      }
    }
    for (var r = 0; r < 8; r++) {
      out.push("<div class='row'>");
      for (var f = 0; f < 8; f++) {
        var i = flip ? (r * 8 + (7 - f)) : ((7 - r) * 8 + f);
        var pc = state.board[i];
        var cls = "cell" + (pc ? "" : " empty");
        // Checker parity must include the rank: i%2 alone only depends on the
        // file ((7-r)*8 is always even), which paints vertical stripes.
        cls += ((rankOf(i) + fileOf(i)) % 2 === 0 ? " dark" : " light");
        var sel = (i === selected) ? " sel" : "";
        var hl = "";
        for (var k = 0; k < mvs.length; k++) {
          if (mvs[k].to === i) { hl = isCaptureMove(mvs[k]) ? " cap" : " quiet"; break; }
        }
        var extra = "";
        if (lm && (i === lm.from || i === lm.to)) extra += " last";
        if (i === checkSq) extra += " check";
        if (pc && pc.c === humanColor && froms[i]) extra += " own";
        var labels = "";
        if (r === 7) labels += "<i class='co cf'>" + FILES[i & 7] + "</i>";      // file letters
        if (f === 0) labels += "<i class='co cr'>" + ((i >> 3) + 1) + "</i>";    // rank numbers
        out.push("<div class='" + cls + sel + hl + extra + "' data-i='" + i + "'>" + labels +
          (pc ? '<span class="pc pc-' + (pc.c === "w" ? "pw" : "pb") + '">' + PIECE_CHAR[pc.c][pc.t] + "</span>" : "") +
          "</div>");
      }
      out.push("</div>");
    }
    return out.join("");
  }

  function moveListHtml() {
    if (!moveNotes.length) return "<div class='empty'>No moves yet — start playing!</div>";
    var out = [];
    for (var i = 0; i < moveNotes.length; i += 2) {
      out.push("<div class='mrow'>" +
        "<span class='mno'>" + (i / 2 + 1) + ".</span>" +
        plyCell(i) +
        (i + 1 < moveNotes.length ? plyCell(i + 1) : "<span class='mv'></span>") +
        "</div>");
    }
    return out.join("");
  }

  function plyCell(i) {
    var m = moveMeta[i];
    var last = i === moveMeta.length - 1;
    var glyph = m.cap
      ? "<i class='pc capg pc-p" + m.cap.c + "' title='took " + m.cap.t + "'>" + PIECE_CHAR.w[m.cap.t] + "</i>"
      : "";
    return "<span class='mv" + (last ? " last" : "") + (m.cap ? " cap" : "") + "'>" +
      esc(m.san) + glyph + "</span>";
  }

  function resultsHtml() {
    if (resigned) return "You resigned \u2717";
    var st = CHESS.status(state);
    var txt = "";
    if (st === "checkmate") txt = (humanColor === state.turn ? "You are checkmated" : "Checkmate! " + (humanColor === "w" ? "White" : "Black") + " wins") + " \u2713";
    else if (st === "stalemate") txt = "Stalemate — draw";
    else if (st === "check") txt = (humanColor === state.turn ? "You are in check!" : "You found them! Strong.");
    else txt = (humanColor === state.turn ? "Game in progress" : "");
    return txt;
  }

  function renderResults() {
    if (!resultsEl) return;
    var s = recordSummary();
    resultsEl.innerHTML = esc(resultsHtml()) +
      (s.n ? "<div class='muted rec'>Your record: " + s.w + "W " + s.d + "D " + s.l + "L</div>" : "");
  }

  function renderBoard() {
    if (boardEl) boardEl.innerHTML = boardHtml();
    if (movesEl) {
      movesEl.innerHTML = moveListHtml();
      try { movesEl.scrollTop = movesEl.scrollHeight; } catch (e) {}
    }
    renderResults();
    if (turnEl) turnEl.textContent = "You: " + (humanColor === "w" ? "White" : "Black");
    if (trayTopEl) trayTopEl.innerHTML = trayHtml(otherColor(humanColor), "Computer");
    if (trayBotEl) trayBotEl.innerHTML = trayHtml(humanColor, "You");
    if (undoBtn) undoBtn.disabled = !history.length;
  }

  function newGame() {
    // a half-played game that is being replaced still belongs in the record
    if (moveNotes.length && !currentRecId) recordGame("unfinished", "new-game");
    state = CHESS.newGame();
    history = [];
    moveNotes = [];
    moveMeta = [];
    selected = -1; geoSource = [];
    aiThinking = false;
    resigned = false;
    currentRecId = null;
    histOpen = null;
    renderBoard();
    renderHistory();
    setStatus(statusText());
  }

  function undo() {
    if (!history.length) { noteToast("Nothing to undo"); return; }
    dropRecord();          // a recorded game that resumes is no longer finished
    resigned = false;
    // Rewind a full ply-pair when the AI already replied, so it is the
    // human's turn again after undoing.
    do {
      state = history.pop();
      moveNotes.pop();
      moveMeta.pop();
    } while (history.length && state.turn !== humanColor);
    geoSource = [];
    selected = -1;
    aiThinking = false;
    renderBoard();
    setStatus(statusText());
    noteToast("Undo");
  }

  function resign() {
    if (resigned) return;
    if (isOver()) { noteToast("The game is already over"); return; }
    if (!moveNotes.length) { noteToast("Play a move first"); return; }
    resigned = true;
    recordGame("loss", "resigned");
    renderBoard();
    setStatus(statusText());
    noteToast("You resigned — recorded as a loss.");
  }

  // Called after every human move: show the result, or let the AI reply.
  function scheduleAI() {
    if (isOver()) { setStatus(statusText()); return; }
    if (state.turn === humanColor) { setStatus(statusText()); return; }
    aiThinking = true;
    setStatus("The computer is thinking\u2026");
    setTimeout(runAI, 350);
  }

  function runAI() {
    aiThinking = false;
    if (resigned || state.turn === humanColor) return;
    var mv = CHESS.aiMove(state, skillIdx);
    if (!mv) { setStatus(statusText()); return; }
    makeMove(mv);
    renderBoard();
    noteToast("Computer " + squareName(mv.from) + "-" + squareName(mv.to) + ".");
    setStatus(statusText());
  }

  function onDown(e) {
    if (aiThinking) return;
    var c = e.target.closest(".cell");
    if (!c) return;
    if (isOver()) { noteToast("Game over — undo or start a new game."); return; }
    var i = +c.getAttribute("data-i");
    var p = state.board[i];
    if (!p || p.c !== humanColor) return;
    var froms = {};
    legalMovesColor(humanColor).forEach(function (x) { if (!froms[x.from]) froms[x.from] = 1; });
    if (!froms[i]) { noteToast("That piece has no legal move"); return; }
    selected = (selected === i) ? -1 : i;   // click the same piece again to deselect
    geoSource = [];
    renderBoard();
    e.preventDefault();
  }

  function onMove(e) {
    if (aiThinking || selected < 0) return;
    var c = e.target.closest(".cell");
    if (!c) return;
    var i = +c.getAttribute("data-i");
    var mvs = movesFromSelected();
    var hit = null;
    for (var k = 0; k < mvs.length; k++) { if (mvs[k].to === i) { hit = mvs[k]; break; } }
    ["cand", "cap", "quiet"].forEach(function (klass) { c.classList.remove(klass); });
    if (hit) {
      c.classList.add("cand");
      c.classList.add(isCaptureMove(hit) ? "cap" : "quiet");
    }
  }

  function onUp(e) {
    if (aiThinking) return;
    var c = e.target.closest(".cell");
    if (!c) return;
    if (isOver()) return;
    var i = +c.getAttribute("data-i");
    var mvs = movesFromSelected();
    var hit = null;
    for (var k = 0; k < mvs.length; k++) { if (mvs[k].to === i) { hit = mvs[k]; break; } }
    if (!hit) {
      if (i === selected) return;                                   // released on the piece itself: keep it selected
      if (state.board[i] && state.board[i].c === humanColor) return; // another own piece: onDown already re-selected it
      selected = -1; geoSource = [];
      renderBoard();
      return;
    }
    if (hit.promo) { showPromotion(selected, i); return; }
    makeMove(hit);
    renderBoard();
    scheduleAI();
  }

  function showPromotion(from, to) {
    var box = document.createElement("div");
    box.className = "promo";
    box.innerHTML = "<h3>Promote the pawn</h3>" +
      ["q", "r", "b", "n"].map(function (c) { return "<button class='btn'>" + c.toUpperCase() + "</button>"; }).join("") +
      "<button class='btn ghost' id='decline'>Decline</button>";
    document.body.appendChild(box);
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      var pick = b.textContent.trim().toLowerCase();
      box.remove();
      if (pick === "q" || pick === "r" || pick === "b" || pick === "n") {
        makeMove({ from: from, to: to, promo: pick });
        renderBoard();
        scheduleAI();
      } else {
        selected = -1; geoSource = [];
        renderBoard();
      }
    });
  }

  function toggleAi() {
    if (aiThinking) return;
    if (!CHESS.legalMoves(state).length) { noteToast("No moves left — start a new game"); return; }
    humanColor = otherColor(humanColor);
    renderBoard();
    setStatus(statusText());
    noteToast("You play " + (humanColor === "w" ? "white" : "black") + "!");
    if (state.turn !== humanColor) scheduleAI();
  }

  function mount() {
    $app.innerHTML =
      "<div class='page-head'><h1>\u265A Chess</h1>" +
      "<p>Play the computer and keep improving. Every finished game is saved to your history.</p>" +
      "</div><div class='chess-shell'><div class='boardcol'>" +
      "<div class='tray' id='tray-top'></div>" +
      "<div class='boardwrap'></div>" +
      "<div class='tray' id='tray-bot'></div>" +
      "</div><div class='chess-side'>" +
      "<div class='card'><h3 id='turn'>You: " + (humanColor === "w" ? "White" : "Black") + "</h3>" +
      "<p id='status' class='st'>Waiting\u2026</p>" +
      "<div id='results'></div></div>" +
      "<div class='card'><h3>Move list</h3><div id='moves' class='moves'></div></div>" +
      "<div class='card'><h3>Notation</h3><div id='note' class='notelst'></div></div>" +
      "<div class='card'><div class='hist-head'><h3>Game history</h3><span id='hist-sum' class='muted'></span></div>" +
      "<div id='hist' class='hist'></div>" +
      "<button class='btn ghost small wide' id='hist-clear'>Clear history</button></div>" +
      "<div class='card controls'>" +
      "<button class='btn' id='new-game'>New game</button>" +
      "<button class='btn ghost' id='undo'>Undo</button>" +
      "<button class='btn red' id='resign'>Resign</button>" +
      "<label style='margin:6px 0'>Skill <select class='code-input' id='skill'><option value='0'>rustic</option><option value='1'>decent</option><option value='2'>fighting</option></select></label>" +
      "<button class='btn blue small' id='ai-btn'>Swap sides</button></div></div></div>";
    boardEl = $app.querySelector(".boardwrap");
    statusEl = document.getElementById("status");
    turnEl = document.getElementById("turn");
    movesEl = document.getElementById("moves");
    resultsEl = document.getElementById("results");
    trayTopEl = document.getElementById("tray-top");
    trayBotEl = document.getElementById("tray-bot");
    histEl = document.getElementById("hist");
    histSumEl = document.getElementById("hist-sum");
    noteEl = document.getElementById("note");
    undoBtn = document.getElementById("undo");
    clearBtn = document.getElementById("hist-clear");
    document.getElementById("new-game").addEventListener("click", newGame);
    undoBtn.addEventListener("click", undo);
    if (noteEl) noteEl.addEventListener("click", onNoteClick);
    document.getElementById("resign").addEventListener("click", resign);
    document.getElementById("ai-btn").addEventListener("click", toggleAi);
    var skillSel = document.getElementById("skill");
    skillSel.value = String(skillIdx);
    skillSel.addEventListener("change", function () {
      var v = +skillSel.value;
      if (v >= 0 && v <= 2) { skillIdx = v; saveStore(); }
    });
    clearBtn.addEventListener("click", function () {
      if (!store.games.length) { noteToast("No games to clear"); return; }
      if (!clearArmed) {
        clearArmed = true;
        clearBtn.textContent = "Sure? Click again";
        setTimeout(function () {
          clearArmed = false;
          if (store.games.length) clearBtn.textContent = "Clear history";
        }, 3000);
        return;
      }
      clearArmed = false;
      clearBtn.textContent = "Clear history";
      store.games = [];
      currentRecId = null;
      histOpen = null;
      saveStore();
      renderHistory();
      renderResults();
      noteToast("History cleared");
    });
    histEl.addEventListener("click", function (e) {
      var row = e.target && e.target.closest ? e.target.closest(".hrow") : null;
      if (!row) return;
      var id = row.getAttribute("data-id");
      histOpen = (histOpen === id) ? null : id;
      renderHistory();
    });
    if (boardEl) {
      boardEl.addEventListener("pointerdown", onDown);
      boardEl.addEventListener("pointermove", onMove);
      boardEl.addEventListener("pointerup", onUp);
      boardEl.addEventListener("pointerleave", onUp);
    }
    renderBoard();
    renderHistory();
    setStatus(statusText());
  }

  function notationHtml() {
    if (!moveNotes.length) return "<div class='empty'>No moves yet \u2014 start playing!</div>";
    var out = [];
    for (var i = 0; i < moveNotes.length; i += 2) {
      var n = i / 2 + 1;
      out.push("<div class='noterow'>" +
        "<span class='noteno'>" + n + ".</span>" +
        "<a class='noteMove' data-idx='" + i + "' href='#board'>" + esc(moveNotes[i]) + "</a>" +
        (i + 1 < moveNotes.length
          ? "<a class='noteMove' data-idx='" + (i + 1) + "' href='#board'>" + esc(moveNotes[i + 1]) + "</a>"
          : "<span class='noteMove quiet'></span>") +
        "</div>");
    }
    return out.join("");
  }

  function jumpToMove(idx) {
    if (idx < 0 || idx >= moveMeta.length) return;
    selected = moveMeta[idx].to;
    geoSource = [];
    renderBoard();
    noteToast("Jumped to move " + (idx / 2 + 1) + "." + (idx % 2 ? "Black" : "White") + " \u2014 " + moveNotes[idx]);
  }

  function onNoteClick(e) {
    var a = e.target && e.target.closest ? e.target.closest(".noteMove") : null;
    if (!a) return;
    var idx = +a.getAttribute("data-idx");
    if (!isNaN(idx)) jumpToMove(idx);
  }

  window.CHESS_UI = {
    mount: mount, newGame: newGame, undo: undo, newAI: runAI,
    toggleAi: toggleAi, resign: resign,
    games: function () { return store.games.slice(); },
    clearGames: function () {
      store.games = []; currentRecId = null; histOpen = null;
      saveStore(); renderHistory(); renderResults();
    },
    trades: function () { return { w: tradesBy("w"), b: tradesBy("b") }; },
    state: function () { return state; },
    humanColor: function () { return humanColor; },
    statusText: statusText, squareName: squareName,
    notationHtml: notationHtml, jumpToMove: jumpToMove, onNoteClick: onNoteClick,
    noteEl: function () { return document.getElementById('note'); }, undoBtn: function () { return document.getElementById('undo'); }
  };
})();
