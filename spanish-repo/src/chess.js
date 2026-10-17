/* ============================================================
   Habla Libre — Chess engine (no dependencies)
   Complete, legal chess: move generation, castling, en passant,
   promotion, check / checkmate / stalemate, plus a small
   alpha-beta AI. Pure logic in window.CHESS so it can be
   unit-tested from Node (see .freebuff/chess-test.js).

   Board: 64-length array, index 0 = a1 ... 63 = h8.
   piece = { t: 'p'|'n'|'b'|'r'|'q'|'k', c: 'w'|'b' } or null.
   Move  = { from, to, promo }  (promo only for pawn promotions)
   ============================================================ */
(function () {
  "use strict";

  var KNIGHT = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  var KING   = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
  var BISHOP = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  var ROOK   = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  var QUEEN  = BISHOP.concat(ROOK);

  function fileOf(i) { return i & 7; }
  function rankOf(i) { return i >> 3; }
  function opp(c) { return c === "w" ? "b" : "w"; }

  var BACK = ["r", "n", "b", "q", "k", "b", "n", "r"];

  function newGame() {
    var board = new Array(64);
    for (var f = 0; f < 8; f++) {
      board[f] = { t: BACK[f], c: "w" };
      board[8 + f] = { t: "p", c: "w" };
      board[48 + f] = { t: "p", c: "b" };
      board[56 + f] = { t: BACK[f], c: "b" };
    }
    return {
      board: board, turn: "w",
      castle: { wk: true, wq: true, bk: true, bq: true },
      ep: -1, halfmove: 0, fullmove: 1
    };
  }

  function clone(s) {
    var b = new Array(64);
    for (var i = 0; i < 64; i++) b[i] = s.board[i];
    return {
      board: b, turn: s.turn,
      castle: { wk: s.castle.wk, wq: s.castle.wq, bk: s.castle.bk, bq: s.castle.bq },
      ep: s.ep, halfmove: s.halfmove, fullmove: s.fullmove
    };
  }

  function findKing(board, color) {
    for (var i = 0; i < 64; i++) { var p = board[i]; if (p && p.t === "k" && p.c === color) return i; }
    return -1;
  }

  // True if square `target` is attacked by any piece of color `by`.
  function isSquareAttacked(board, target, by) {
    var f = fileOf(target), r = rankOf(target), k, nf, nr, p, dirs, ray, ff, rr, tf, tr;
    // pawns
    if (by === "w") {
      nf = f - 1; nr = r - 1;
      if (nf >= 0 && nr >= 0 && board[nr * 8 + nf] && board[nr * 8 + nf].c === "w" && board[nr * 8 + nf].t === "p") return true;
      nf = f + 1; nr = r - 1;
      if (nf < 8 && nr >= 0 && board[nr * 8 + nf] && board[nr * 8 + nf].c === "w" && board[nr * 8 + nf].t === "p") return true;
    } else {
      nf = f - 1; nr = r + 1;
      if (nf >= 0 && nr < 8 && board[nr * 8 + nf] && board[nr * 8 + nf].c === "b" && board[nr * 8 + nf].t === "p") return true;
      nf = f + 1; nr = r + 1;
      if (nf < 8 && nr < 8 && board[nr * 8 + nf] && board[nr * 8 + nf].c === "b" && board[nr * 8 + nf].t === "p") return true;
    }
    // knights
    for (k = 0; k < 8; k++) {
      ff = f + KNIGHT[k][0]; rr = r + KNIGHT[k][1];
      if (ff < 0 || ff > 7 || rr < 0 || rr > 7) continue;
      p = board[rr * 8 + ff];
      if (p && p.c === by && p.t === "n") return true;
    }
    // king
    for (k = 0; k < 8; k++) {
      ff = f + KING[k][0]; rr = r + KING[k][1];
      if (ff < 0 || ff > 7 || rr < 0 || rr > 7) continue;
      p = board[rr * 8 + ff];
      if (p && p.c === by && p.t === "k") return true;
    }
    // sliding diagonals (bishop/queen)
    for (k = 0; k < BISHOP.length; k++) {
      dirs = BISHOP[k];
      for (ray = 1; ray < 8; ray++) {
        tf = f + dirs[0] * ray; tr = r + dirs[1] * ray;
        if (tf < 0 || tf > 7 || tr < 0 || tr > 7) break;
        p = board[tr * 8 + tf];
        if (p) { if (p.c === by && (p.t === "b" || p.t === "q")) return true; break; }
      }
    }
    // sliding straights (rook/queen)
    for (k = 0; k < ROOK.length; k++) {
      dirs = ROOK[k];
      for (ray = 1; ray < 8; ray++) {
        tf = f + dirs[0] * ray; tr = r + dirs[1] * ray;
        if (tf < 0 || tf > 7 || tr < 0 || tr > 7) break;
        p = board[tr * 8 + tf];
        if (p) { if (p.c === by && (p.t === "r" || p.t === "q")) return true; break; }
      }
    }
    return false;
  }

  function inCheck(state, color) {
    var ks = findKing(state.board, color);
    return ks >= 0 && isSquareAttacked(state.board, ks, opp(color));
  }

  function add(moves, from, to) { moves.push({ from: from, to: to }); }

  // Pseudo-legal moves for `color` (may leave own king in check).
  function pseudoMoves(state, color) {
    var board = state.board, moves = [], i, f, r, p, k;
    for (i = 0; i < 64; i++) {
      p = board[i];
      if (!p || p.c !== color) continue;
      f = fileOf(i); r = rankOf(i);

      if (p.t === "p") {
        var dir = color === "w" ? 1 : -1;
        var startRank = color === "w" ? 1 : 6;
        var lastRank = color === "w" ? 7 : 0;
        var nf, nr, ni, cr, cf, ci, tp;
        nf = f; nr = r + dir; ni = nr * 8 + nf;
        if (nr >= 0 && nr < 8 && !board[ni]) {
          if (nr === lastRank) ["q", "r", "b", "n"].forEach(function (t) { moves.push({ from: i, to: ni, promo: t }); });
          else {
            add(moves, i, ni);
            if (r === startRank) { var ni2 = (r + dir * 2) * 8 + f; if (!board[ni2]) add(moves, i, ni2); }
          }
        }
        [-1, 1].forEach(function (df) {
          cf = f + df; cr = r + dir;
          if (cf < 0 || cf > 7 || cr < 0 || cr > 7) return;
          ci = cr * 8 + cf; tp = board[ci];
          if (tp && tp.c === opp(color)) {
            if (cr === lastRank) ["q", "r", "b", "n"].forEach(function (t) { moves.push({ from: i, to: ci, promo: t }); });
            else add(moves, i, ci);
          } else if (!tp && ci === state.ep) add(moves, i, ci);
        });
        continue;
      }

      var dirs = p.t === "n" ? KNIGHT : p.t === "b" ? BISHOP : p.t === "r" ? ROOK : p.t === "q" ? QUEEN : KING;
      var sliding = (p.t === "b" || p.t === "r" || p.t === "q");
      for (k = 0; k < dirs.length; k++) {
        var d = dirs[k];
        for (var step = 1; step < 8; step++) {
          var ff = f + d[0] * step, rr = r + d[1] * step;
          if (ff < 0 || ff > 7 || rr < 0 || rr > 7) break;
          var ti = rr * 8 + ff, target = board[ti];
          if (!target) { add(moves, i, ti); if (!sliding) break; continue; }
          if (target.c === opp(color)) add(moves, i, ti);
          break;
        }
      }
    }

    // castling
    var home = color === "w" ? 0 : 56;
    var kingSq = home + 4, king = board[kingSq];
    if (king && king.t === "k" && king.c === color && !isSquareAttacked(board, kingSq, opp(color))) {
      if ((color === "w" ? state.castle.wk : state.castle.bk) &&
          !board[home + 5] && !board[home + 6] && board[home + 7] && board[home + 7].t === "r" && board[home + 7].c === color &&
          !isSquareAttacked(board, home + 5, opp(color)) && !isSquareAttacked(board, home + 6, opp(color))) {
        moves.push({ from: kingSq, to: home + 6, castle: "k" });
      }
      if ((color === "w" ? state.castle.wq : state.castle.bq) &&
          !board[home + 1] && !board[home + 2] && !board[home + 3] && board[home] && board[home].t === "r" && board[home].c === color &&
          !isSquareAttacked(board, home + 3, opp(color)) && !isSquareAttacked(board, home + 2, opp(color))) {
        moves.push({ from: kingSq, to: home + 2, castle: "q" });
      }
    }
    return moves;
  }


  // Apply a move to a fresh state. Does not validate legality.
  function applyMove(s, m) {
    var ns = clone(s), b = ns.board, color = s.turn;
    var piece = b[m.from];
    var isPawn = piece && piece.t === "p";
    var captured = b[m.to];

    if (isPawn && m.to === s.ep && !captured) b[color === "w" ? m.to - 8 : m.to + 8] = null; // en passant
    b[m.to] = piece;
    b[m.from] = null;
    if (m.promo) b[m.to] = { t: m.promo, c: color };

    if (piece.t === "k" && Math.abs(m.to - m.from) === 2) {
      var home = color === "w" ? 0 : 56;
      if (m.to === home + 6) { b[home + 5] = b[home + 7]; b[home + 7] = null; }
      else { b[home + 3] = b[home]; b[home] = null; }
    }

    if (piece.t === "k") {
      if (color === "w") { ns.castle.wk = ns.castle.wq = false; }
      else { ns.castle.bk = ns.castle.bq = false; }
    }
    if (m.from === 7 || m.to === 7) ns.castle.wk = false;
    if (m.from === 0 || m.to === 0) ns.castle.wq = false;
    if (m.from === 63 || m.to === 63) ns.castle.bk = false;
    if (m.from === 56 || m.to === 56) ns.castle.bq = false;

    if (isPawn && Math.abs(m.to - m.from) === 16) ns.ep = (m.from + m.to) / 2;
    else ns.ep = -1;

    if (isPawn || captured) ns.halfmove = 0; else ns.halfmove = s.halfmove + 1;
    if (color === "b") ns.fullmove = s.fullmove + 1;
    ns.turn = opp(color);
    return ns;
  }

  function kingSafe(board, color) {
    var ks = findKing(board, color);
    return ks < 0 || !isSquareAttacked(board, ks, opp(color));
  }

  function legalMoves(state) {
    var color = state.turn;
    return pseudoMoves(state, color).filter(function (m) {
      return kingSafe(applyMove(state, m).board, color);
    });
  }

  // "play" | "check" | "checkmate" | "stalemate"
  function status(state) {
    var moves = legalMoves(state);
    if (moves.length === 0) return inCheck(state, state.turn) ? "checkmate" : "stalemate";
    return inCheck(state, state.turn) ? "check" : "play";
  }


  var PCI = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
  // Piece-square tables (white orientation, index 0 = a1): encourage center,
  // pawn advancement, and developing knights/bishops.
  var PST = {
    p: [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10,
        5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5,
        5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
    n: [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30,
        -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30,
        -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
    b: [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10,
        -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10,
        -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
    r: [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5,
        -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5,
        -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
    q: [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10,
        -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10,
        -10, 0, 5, 0, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
    k: [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30,
        -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10,
        20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20]
  };

  // Static evaluation from White's point of view.
  function evaluate(s) {
    var b = s.board, score = 0, i, p, mi;
    for (i = 0; i < 64; i++) {
      p = b[i];
      if (!p) continue;
      mi = p.c === "w" ? i : (7 - rankOf(i)) * 8 + fileOf(i); // mirror for black
      score += p.c === "w" ? (PCI[p.t] + PST[p.t][mi]) : -(PCI[p.t] + PST[p.t][mi]);
    }
    return score;
  }

  // Negamax with alpha-beta. Score is from side-to-move's view.
  function search(s, depth, alpha, beta) {
    var st = status(s);
    if (st === "checkmate") return -100000 - depth;   // prefer faster mates
    if (st === "stalemate") return 0;
    if (depth === 0) { var e = evaluate(s); return s.turn === "w" ? e : -e; }
    var moves = legalMoves(s), best = -Infinity;
    moves.sort(function (a, c) {   // capture-first ordering (crude MVV-LVA)
      var ca = a.promo ? 900 : (s.board[a.to] ? PCI[s.board[a.to].t] : 0);
      var cb = c.promo ? 900 : (s.board[c.to] ? PCI[s.board[c.to].t] : 0);
      return cb - ca;
    });
    for (var i = 0; i < moves.length; i++) {
      var sc = -search(applyMove(s, moves[i]), depth - 1, -beta, -alpha);
      if (sc > best) best = sc;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return best;
  }

  // Pick a move for the side to move. `skill` 0..2 -> search depth 2/3/4.
  function aiMove(s, skill) {
    var moves = legalMoves(s);
    if (!moves.length) return null;
    if (moves.length === 1) return moves[0];
    var depth = [2, 3, 4][skill] || 3;
    var best = -Infinity, bestMoves = [];
    moves.forEach(function (m) {
      var sc = -search(applyMove(s, m), depth - 1, -Infinity, Infinity) + Math.random() * 4; // nudge for variety
      if (sc > best) { best = sc; bestMoves = [m]; }
      else if (Math.abs(sc - best) < 1) bestMoves.push(m);
    });
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  // Engine-correctness helper used by the Node tests (perft).
  function perft(s, d) {
    if (d === 0) return 1;
    var moves = legalMoves(s), n = 0;
    for (var i = 0; i < moves.length; i++) n += perft(applyMove(s, moves[i]), d - 1);
    return n;
  }

  window.CHESS = {
    newGame: newGame, clone: clone, legalMoves: legalMoves, pseudoMoves: pseudoMoves,
    applyMove: applyMove, inCheck: inCheck, status: status, isSquareAttacked: isSquareAttacked,
    evaluate: evaluate, aiMove: aiMove, perft: perft
  };
})();

