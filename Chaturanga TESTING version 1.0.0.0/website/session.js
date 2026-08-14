/* =====================================================
   session.js — shared session storage for the Chaturanga
   multipage site (vanilla JS, no framework/build step).

   WHY THIS EXISTS
   ----------------
   Every page (login, home, lessons, puzzles, army builder...)
   needs to answer "who is logged in, if anyone?" without a
   server-rendered session. Since this backend doesn't issue a
   JWT/session cookie yet (it just returns the raw user document),
   the pragmatic vanilla-frontend answer is to keep a small,
   *sanitized* copy of the user on the browser side and read it
   the same way from every page by including this one file.

   RULES THIS MODULE ENFORCES
   ----------------------------
   1. The password NEVER gets stored client-side, even though the
      backend currently (insecurely) includes it in its responses.
      `save()` strips everything except id/name/email before
      writing anything to disk.
   2. Two storage tiers, chosen by the user, not by us:
        - sessionStorage (default) — cleared when the tab closes.
          Good default for a shared/public computer.
        - localStorage — only when "Remember Me" is checked.
          Persists across browser restarts.
      We always clear the other tier on save, so a stale copy
      can never linger in both places at once.
   3. A single namespaced+versioned key (`chaturanga_session_v1`)
      so a future schema change is just a version bump, not a
      silent breakage for users with an old payload cached.
   4. Cross-tab awareness: if the user logs out in one tab, every
      other open tab notices (via the native `storage` event) and
      can react (e.g. redirect to login) without a page reload.

   WHAT THIS IS *NOT*
   --------------------
   This is not a substitute for real auth. It's a client-side
   "who am I, for UI purposes" cache. The moment the backend adds
   real sessions, swap this for an httpOnly, Secure, SameSite
   cookie issued by the server (invisible to JS, immune to XSS
   token theft) — at that point this file mostly goes away and
   each page just calls a `/api/auth/me` endpoint instead.
   ===================================================== */

const Session = (() => {
  const KEY = 'chaturanga_session_v1';

  function pickSafeUser(user) {
    if (!user) return null;
    return {
      id: user._id || user.id || null,
      name: user.name || '',
      email: user.email || ''
    };
  }

  function save(user, remember) {
    const safeUser = pickSafeUser(user);
    if (!safeUser) return;
    const payload = { user: safeUser, savedAt: Date.now() };
    const primary = remember ? window.localStorage : window.sessionStorage;
    const other = remember ? window.sessionStorage : window.localStorage;
    try {
      primary.setItem(KEY, JSON.stringify(payload));
      other.removeItem(KEY);
    } catch (e) {
      // Storage can throw in private/incognito modes with strict quotas —
      // fail quietly rather than breaking the login flow over it.
      console.warn('Session: could not persist session', e);
    }
  }

  function get() {
    let raw = null;
    try {
      raw = window.localStorage.getItem(KEY) || window.sessionStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
    if (!raw) return null;
    try {
      const payload = JSON.parse(raw);
      return payload && payload.user ? payload.user : null;
    } catch (e) {
      return null;
    }
  }

  function clear() {
    try {
      window.localStorage.removeItem(KEY);
      window.sessionStorage.removeItem(KEY);
    } catch (e) { /* no-op */ }
  }

  function isLoggedIn() {
    return !!get();
  }

  // Other tabs/pages can react instantly when the session changes
  // (e.g. logging out in one tab signs the user out everywhere).
  function onChange(callback) {
    window.addEventListener('storage', function (e) {
      if (e.key === KEY) callback(get());
    });
  }

  return { save, get, clear, isLoggedIn, onChange };
})();