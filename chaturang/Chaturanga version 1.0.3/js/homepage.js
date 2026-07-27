/**
 * Chaturanga 1.0.3 — Homepage routing
 * Play Online / Play Computer links; guest link to game.html
 */
(function () {
  'use strict';

  function init() {
    var playOnline = document.getElementById('playOnline');
    var playComputer = document.getElementById('playComputer');
    var guestLink = document.getElementById('guestLink');

    if (playOnline) {
      playOnline.addEventListener('click', function (e) {
        if (playOnline.getAttribute('href').indexOf('mode=online') !== -1) {
          e.preventDefault();
          alert('Play Online is coming soon. Use Play Computer or play as guest.');
        }
      });
    }

    if (playComputer) {
      playComputer.setAttribute('href', 'game.html?mode=computer');
    }

    if (guestLink) {
      guestLink.setAttribute('href', 'game.html');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
