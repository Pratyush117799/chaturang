/**
 * cn-encoder.js — Chaturanga v1.0.5.2
 * Chaturanga Notation (CN) encoder/decoder + base64 share URL.
 * Drop-in: <script src="js/cn-encoder.js"></script>
 *
 * Integration:
 *   CNEncoder.encode(moveHistory) → 'R:e1-e5 B:e8-e5x ...'
 *   CNEncoder.toShareURL(moveHistory) → full URL with ?game=BASE64
 *   CNEncoder.fromShareURL() → moveHistory array | null
 *   CNEncoder.addShareButton(containerEl) → injects button
 *   On seer.html: CNEncoder.autoLoadFromURL() at page load
 */

const CNEncoder = (() => {

  const PLAYER_INITIALS = ['R','B','G','Y'];

  // ── encode one move → CN token ─────────────────────────────────────────────
  function encodeMove(m) {
    if (!m) return '';
    const pi   = m.playerIndex ?? m.player ?? 0;
    const init = PLAYER_INITIALS[pi] || 'R';
    const from = m.from || m.fromSquare || '??';
    const to   = m.to   || m.toSquare   || '??';

    let suffix = '';
    if (m.forfeit || m.type === 'forfeit')     suffix = 'f';
    else if (m.pass || m.type === 'pass')      suffix = 'p';
    else {
      if (m.captured || m.capture)             suffix += 'x';
      if (m.promoted || m.promotion)           suffix += 'q';
    }

    if (suffix === 'f') return `${init}:forfeit`;
    if (suffix === 'p') return `${init}:pass`;
    return `${init}:${from}-${to}${suffix}`;
  }

  // ── decode one CN token → move stub ───────────────────────────────────────
  function decodeMove(token) {
    if (!token) return null;
    const colonIdx = token.indexOf(':');
    if (colonIdx < 0) return null;

    const init    = token[0];
    const pi      = PLAYER_INITIALS.indexOf(init);
    const body    = token.slice(colonIdx + 1);

    if (body === 'forfeit') return { playerIndex: pi, type: 'forfeit', forfeit: true };
    if (body === 'pass')    return { playerIndex: pi, type: 'pass',    pass:    true };

    const dashIdx = body.indexOf('-');
    if (dashIdx < 0) return { playerIndex: pi };

    const from   = body.slice(0, dashIdx);
    const rest   = body.slice(dashIdx + 1);
    const to     = rest.replace(/[xq]/g, '');
    const capture   = rest.includes('x');
    const promotion = rest.includes('q');

    return { playerIndex: pi, from, to, capture, captured: capture, promotion, promoted: promotion };
  }

  // ── encode full moveHistory ────────────────────────────────────────────────
  function encode(moveHistory) {
    if (!Array.isArray(moveHistory) || !moveHistory.length) return '';
    return moveHistory.map(encodeMove).filter(Boolean).join(' ');
  }

  // ── decode CN string → moveHistory ────────────────────────────────────────
  function decode(cnString) {
    if (!cnString) return [];
    return cnString.split(/\s+/).map(decodeMove).filter(Boolean);
  }

  // ── base64 helpers (URL-safe) ──────────────────────────────────────────────
  function toB64(str) {
    try {
      return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch { return ''; }
  }

  function fromB64(b64) {
    try {
      const s = b64.replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(escape(atob(s)));
    } catch { return ''; }
  }

  // ── share URL ─────────────────────────────────────────────────────────────
  function toShareURL(moveHistory) {
    const cn  = encode(moveHistory);
    const b64 = toB64(cn);
    const url = new URL(window.location.href);
    url.searchParams.set('game', b64);
    return url.toString();
  }

  function fromShareURL() {
    try {
      const params = new URLSearchParams(window.location.search);
      const b64    = params.get('game');
      if (!b64) return null;
      const cn = fromB64(b64);
      if (!cn) return null;
      return decode(cn);
    } catch { return null; }
  }

  // ── copy to clipboard helper ───────────────────────────────────────────────
  function copyToClipboard(text, onSuccess) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(() => _legacyCopy(text, onSuccess));
    } else {
      _legacyCopy(text, onSuccess);
    }
  }

  function _legacyCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); if (cb) cb(); } catch {}
    ta.remove();
  }

  // ── toast ─────────────────────────────────────────────────────────────────
  function _toast(msg) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
      background:#1a1200;border:1px solid #c9a84c;color:#c9a84c;
      padding:8px 20px;border-radius:20px;font-family:Outfit,sans-serif;font-size:13px;
      z-index:9999;opacity:0;transition:opacity .25s;pointer-events:none;`;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '1'; });
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2500);
  }

  // ── inject Share button into any container ────────────────────────────────
  function addShareButton(container, getMoveHistory) {
    if (!container) return;
    if (document.getElementById('cn-share-css')) return;
    const s = document.createElement('style');
    s.id = 'cn-share-css';
    s.textContent = `
      .cn-share-btn {
        display:inline-flex;align-items:center;gap:7px;
        padding:9px 18px;border-radius:8px;cursor:pointer;
        background:rgba(201,168,76,0.10);border:1px solid rgba(201,168,76,0.35);
        color:#c9a84c;font-family:Outfit,sans-serif;font-size:13px;font-weight:500;
        transition:background .2s,border-color .2s;letter-spacing:.02em;
      }
      .cn-share-btn:hover { background:rgba(201,168,76,0.18);border-color:rgba(201,168,76,0.6); }
      .cn-share-btn svg { width:14px;height:14px;flex-shrink:0; }
    `;
    document.head.appendChild(s);

    const btn = document.createElement('button');
    btn.className = 'cn-share-btn';
    btn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round"><circle cx="13" cy="3" r="1.5"/><circle cx="3" cy="8" r="1.5"/>
      <circle cx="13" cy="13" r="1.5"/><line x1="4.5" y1="8.7" x2="11.5" y2="12.3"/>
      <line x1="4.5" y1="7.3" x2="11.5" y2="3.7"/></svg>Share battle`;

    btn.addEventListener('click', () => {
      const history = typeof getMoveHistory === 'function' ? getMoveHistory() : [];
      const url     = toShareURL(history);
      copyToClipboard(url, () => _toast('Battle link copied — share with your warriors'));
    });

    container.appendChild(btn);
    return btn;
  }

  // ── auto-load in seer.html from URL param ────────────────────────────────
  function autoLoadFromURL() {
    const history = fromShareURL();
    if (!history || !history.length) return false;
    // Store in seer vault slot 0 so seer.html picks it up
    try {
      const vault = JSON.parse(localStorage.getItem('chaturanga_seer_vault') || '[]');
      vault.unshift({ moveHistory: history, source: 'shareURL', ts: Date.now() });
      localStorage.setItem('chaturanga_seer_vault', JSON.stringify(vault.slice(0, 20)));
    } catch {}
    return true;
  }

  window.CNEncoder = { encode, decode, toShareURL, fromShareURL, addShareButton, autoLoadFromURL, copyToClipboard };
  return window.CNEncoder;
})();
