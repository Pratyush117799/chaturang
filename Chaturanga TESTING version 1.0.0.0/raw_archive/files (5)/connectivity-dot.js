/**
 * connectivity-dot.js — Chaturanga v1.0.5.2
 * Injects a small status dot into any nav bar.
 * Drop-in: <script src="js/connectivity-dot.js"></script> on every page.
 * Looks for element with id="connectivityDot" or creates one in the first <nav>.
 */

(function () {
  const STATES = {
    online:        { color: '#4da64d', label: 'Online'        },
    offline:       { color: '#888',    label: 'Offline'        },
    reconnecting:  { color: '#c9a84c', label: 'Reconnecting…' },
  };

  function getDot() {
    let dot = document.getElementById('connectivityDot');
    if (!dot) {
      dot = document.createElement('div');
      dot.id = 'connectivityDot';
      dot.style.cssText = `width:8px;height:8px;border-radius:50%;flex-shrink:0;
        transition:background-color .4s,box-shadow .4s;cursor:default;`;
      dot.title = 'Connection status';
      const nav = document.querySelector('nav');
      if (nav) nav.appendChild(dot);
      else document.body.prepend(dot);
    }
    return dot;
  }

  function setState(key) {
    const s   = STATES[key] || STATES.offline;
    const dot = getDot();
    dot.style.backgroundColor = s.color;
    dot.style.boxShadow = key === 'online'
      ? `0 0 0 2px ${s.color}33`
      : key === 'reconnecting'
        ? `0 0 0 3px ${s.color}55`
        : 'none';
    dot.title = s.label;
  }

  // Network events
  window.addEventListener('online',  () => setState('online'));
  window.addEventListener('offline', () => setState('offline'));

  // WS awareness — patch ws open/close if ws-client.js uses these globals
  const _prevOpen  = window.onWsOpen;
  const _prevClose = window.onWsClose;

  window.onWsOpen = function () {
    setState('online');
    if (typeof _prevOpen === 'function') _prevOpen();
  };
  window.onWsClose = function () {
    setState(navigator.onLine ? 'reconnecting' : 'offline');
    if (typeof _prevClose === 'function') _prevClose();
  };

  // Set initial state on load
  document.addEventListener('DOMContentLoaded', () => {
    setState(navigator.onLine ? 'online' : 'offline');
  });
})();
