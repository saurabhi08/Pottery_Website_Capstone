/**
 * Auth state - update header (Sign In / Account + Sign Out) on all pages
 */
document.addEventListener('DOMContentLoaded', function () {
  var signUpBtn = document.querySelector('.header-right .btn-signup');
  if (!signUpBtn) return;

  function updateHeader(user, role) {
    if (user) {
      // Hide standalone "Account/Sign In" pill when user is logged in –
      // profile icon acts as account entry point.
      if (signUpBtn) {
        signUpBtn.style.display = 'none';
      }
      var signOutEl = document.getElementById('headerSignOut');
      if (!signOutEl) {
        var wrap = document.querySelector('.header-auth-wrap');
        if (!wrap && document.querySelector('.header-right')) {
          wrap = document.createElement('span');
          wrap.className = 'header-auth-wrap';
          var outBtn = document.createElement('button');
          outBtn.type = 'button';
          outBtn.className = 'btn btn-outline btn-sm';
          outBtn.id = 'headerSignOut';
          outBtn.textContent = 'Sign Out';
          outBtn.addEventListener('click', function () { signOut(); });
          // Append sign-out button at the end of header-right
          var headerRight = document.querySelector('.header-right');
          if (headerRight) {
            headerRight.appendChild(wrap);
            wrap.appendChild(outBtn);
          }
        }
      }
      if (role === 'admin') {
        var adminLink = document.querySelector('.nav-link[href="admin.html"]');
        if (!adminLink) {
          var nav = document.querySelector('.main-nav');
          if (nav) {
            var a = document.createElement('a');
            a.href = 'admin.html';
            a.className = 'nav-link';
            a.textContent = 'Admin';
            nav.appendChild(a);
          }
        }
      }
    } else {
      if (signUpBtn) {
        // Logged out: show Sign In button
        signUpBtn.textContent = 'Sign In';
        signUpBtn.href = 'signin.html';
        signUpBtn.style.display = '';
        signUpBtn.classList.add('btn-signup');
        signUpBtn.classList.remove('btn-account');
      }
      var so = document.getElementById('headerSignOut');
      if (so && so.parentNode) so.parentNode.removeChild(so);
    }
  }

  if (typeof auth !== 'undefined' && auth) {
    auth.onAuthStateChanged(function (user) {
      if (user) {
        getUserRole(function (role) {
          updateHeader(user, role);
        });
      } else {
        updateHeader(null);
      }
    });
  }
});
