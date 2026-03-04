/**
 * Profile dropdown in header – greeting, Orders, Wishlist, Coupons, Saved Cards, Saved Address, Edit Profile, Logout
 */
(function () {
  function getStoredProfile() {
    try {
      var raw = localStorage.getItem('mumbaa_account_profile');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function updateGreeting() {
    var nameEl = document.getElementById('profileDropdownName');
    var metaEl = document.getElementById('profileDropdownMeta');
    if (!nameEl && !metaEl) return;
    var profile = getStoredProfile();
    var name = profile.name || '';
    var phone = profile.phone || '';
    var email = profile.email || '';
    if (typeof getCurrentUser === 'function') {
      var u = getCurrentUser();
      if (u) {
        if (u.displayName) name = name || u.displayName;
        if (u.email) email = email || u.email;
      }
    }
    if (nameEl) nameEl.textContent = name || 'Guest';
    if (metaEl) metaEl.textContent = phone || email || 'Sign in to save your details';
  }

  function init() {
    var trigger = document.getElementById('profileDropdownTrigger');
    var menu = document.getElementById('profileDropdownMenu');
    if (!trigger || !menu) return;

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      menu.classList.toggle('is-open');
    });

    document.addEventListener('click', function (e) {
      if (menu.classList.contains('is-open') && !menu.contains(e.target) && !trigger.contains(e.target)) {
        menu.classList.remove('is-open');
      }
    });

    var logoutBtn = document.getElementById('profileDropdownLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        menu.classList.remove('is-open');
        if (typeof signOut === 'function') signOut();
        else window.location.href = 'signin.html';
      });
    }

    updateGreeting();
    if (typeof auth !== 'undefined' && auth && auth.onAuthStateChanged) {
      auth.onAuthStateChanged(updateGreeting);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
