/**
 * Forgot Password - send reset email via Firebase Auth
 */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('forgotPasswordForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('forgot-email').value.trim();
    if (!email) {
      alert('Please enter your email.');
      return;
    }
    if (typeof auth === 'undefined' || !auth) {
      alert('Password reset is not configured. Please set up Firebase Auth.');
      return;
    }
    auth.sendPasswordResetEmail(email)
      .then(function () {
        alert('Check your email for a link to reset your password.');
        window.location.href = 'signin.html';
      })
      .catch(function (error) {
        alert(error.message || 'Failed to send reset email. Try again.');
      });
  });
});
