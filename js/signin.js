/**
 * Sign In page - form handling
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
      
      // Firebase Auth integration (when configured)
      if (typeof auth !== 'undefined' && auth) {
        auth.signInWithEmailAndPassword(email, password)
          .then(function(userCredential) {
            var user = userCredential.user;
            var remember = document.getElementById('remember').checked;
            if (remember) {
              localStorage.setItem('userEmail', email);
            }
            window.location.href = 'index.html';
          })
          .catch(function(error) {
            alert(error.message || 'Sign in failed. Please check your credentials.');
          });
      } else {
        alert('Sign in submitted. Connect Firebase to enable authentication.');
      }
    });
  }
});
