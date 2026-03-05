/**
 * Sign In page - form handling. Same login for customers and admin.
 * After login: admins go to admin panel; others go to home (or redirect param).
 */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('signInForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('signin-email').value.trim();
      var password = document.getElementById('signin-password').value;

      if (!email || !password) {
        alert('Please enter email and password.');
        return;
      }

      if (typeof auth !== 'undefined' && auth) {
        auth.signInWithEmailAndPassword(email, password)
          .then(function (userCredential) {
            var user = userCredential.user;
            var remember = document.getElementById('remember').checked;
            if (remember) {
              localStorage.setItem('userEmail', email);
            }

            // Load profile from Firestore (if available) so header can show the customer's name
            var profilePromise = Promise.resolve();
            if (typeof db !== 'undefined' && db && user && user.uid) {
              profilePromise = db.collection('users').doc(user.uid).get()
                .then(function (doc) {
                  var data = doc.exists ? (doc.data() || {}) : {};
                  var fullName = data.fullName || user.displayName || '';
                  var profileEmail = data.email || user.email || email;
                  var phone = data.phone || '';

                  // If displayName is empty but we have fullName, update Auth profile
                  if (!user.displayName && fullName && user.updateProfile) {
                    user.updateProfile({ displayName: fullName }).catch(function () {});
                  }

                  try {
                    localStorage.setItem('mumbaa_account_profile', JSON.stringify({
                      name: fullName,
                      email: profileEmail,
                      phone: phone
                    }));
                  } catch (e) {}
                })
                .catch(function () {});
            }

            var redirect = (function () {
              var p = window.location.search.slice(1).split('&');
              for (var i = 0; i < p.length; i++) {
                var kv = p[i].split('=');
                if (kv[0] === 'redirect' && kv[1]) return decodeURIComponent(kv[1]);
              }
              return null;
            })();

            profilePromise.then(function () {
              if (typeof getUserRole === 'function') {
                getUserRole(function (role) {
                  if (role === 'admin') {
                    alert('Login successful.');
                    window.location.href = 'admin.html';
                    return;
                  }
                  if (redirect === 'admin.html') {
                    alert('You do not have admin access.');
                    window.location.href = 'index.html';
                    return;
                  }
                  window.location.href = redirect || 'index.html';
                });
              } else {
                window.location.href = redirect || 'index.html';
              }
            });
          })
          .catch(function (error) {
            alert(error.message || 'Sign in failed. Please check your credentials.');
          });
      } else {
        alert('Sign in submitted. Connect Firebase to enable authentication.');
      }
    });
  }
});
