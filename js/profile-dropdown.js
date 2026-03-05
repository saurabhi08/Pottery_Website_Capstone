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

  function updateGreeting(userFromAuth) {
    var nameEl = document.getElementById('profileDropdownName');
    var metaEl = document.getElementById('profileDropdownMeta');
    if (!nameEl && !metaEl) return;
    var u = userFromAuth || (typeof getCurrentUser === 'function' ? getCurrentUser() : null);
    if (u) {
      var profile = getStoredProfile();
      var baseName = '';
      // 1) Prefer saved profile name (from Account page or signup)
      if (profile && (profile.name || profile.fullName)) {
        baseName = String(profile.name || profile.fullName).trim().split(/\s+/)[0];
      }
      // 2) Then Firebase displayName
      if (!baseName && u.displayName && u.displayName.trim()) {
        baseName = u.displayName.trim().split(/\s+/)[0];
      }
      // 3) If still missing, fall back to email prefix but also persist it,
      // so the user can later edit it from the Account page.
      if (!baseName && u.email) {
        baseName = u.email.split('@')[0];
        try {
          localStorage.setItem('mumbaa_account_profile', JSON.stringify({
            name: baseName,
            email: u.email
          }));
        } catch (e) {}
      }

      var email = (profile && profile.email) || u.email || '';
      var phone = (profile && profile.phone) || '';

      if (typeof getUserRole === 'function') {
        getUserRole(function (role) {
          if (role === 'admin') {
            if (nameEl) nameEl.textContent = 'Admin';
            if (metaEl) metaEl.textContent = 'Admin account';
            return;
          }
          if (nameEl) nameEl.textContent = baseName || 'Guest';
          if (metaEl) metaEl.textContent = phone || email || 'Sign in to save your details';
        });
      } else {
        if (nameEl) nameEl.textContent = baseName || 'Guest';
        if (metaEl) metaEl.textContent = phone || email || 'Sign in to save your details';
      }
      return;
    }
    // Logged out: always show Guest, do not use stored profile
    if (nameEl) nameEl.textContent = 'Guest';
    if (metaEl) metaEl.textContent = 'Sign in to save your details';
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
