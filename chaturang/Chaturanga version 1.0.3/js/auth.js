(function () {
  'use strict';
  var REMEMBER_KEY = 'chaturanga_remember';
  var REMEMBER_EMAIL_KEY = 'chaturanga_remember_email';
  function loadRememberMe() {
    try {
      if (localStorage.getItem(REMEMBER_KEY) === 'true') {
        var emailEl = document.getElementById('authEmail');
        var rememberEl = document.getElementById('rememberMe');
        if (emailEl) emailEl.value = localStorage.getItem(REMEMBER_EMAIL_KEY) || '';
        if (rememberEl) rememberEl.checked = true;
      }
    } catch (e) {}
  }
  function saveRememberMe(email, checked) {
    try {
      if (checked && email) { localStorage.setItem(REMEMBER_KEY, 'true'); localStorage.setItem(REMEMBER_EMAIL_KEY, email); }
      else { localStorage.removeItem(REMEMBER_KEY); localStorage.removeItem(REMEMBER_EMAIL_KEY); }
    } catch (e) {}
  }
  function initAuth() {
    loadRememberMe();
    var form = document.getElementById('authForm');
    var rememberEl = document.getElementById('rememberMe');
    var emailEl = document.getElementById('authEmail');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); saveRememberMe(emailEl && emailEl.value, rememberEl && rememberEl.checked); alert('Login is client-side only. Use guest or Play Computer.'); });
    var signupBtn = document.getElementById('signupBtn');
    if (signupBtn) signupBtn.addEventListener('click', function () { saveRememberMe(emailEl && emailEl.value, rememberEl && rememberEl.checked); alert('Sign up is client-side only.'); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAuth);
  else initAuth();
})();
