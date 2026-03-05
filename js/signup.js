/**
 * Sign Up page - form handling
 */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('signUpForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      
      var fullName = document.getElementById('fullName').value.trim();
      var email = document.getElementById('signup-email').value.trim();
      var password = document.getElementById('signup-password').value;
      var confirmPassword = document.getElementById('confirmPassword').value;
      var terms = document.getElementById('terms').checked;
      
      // Validation
      if (!fullName || !email || !password || !confirmPassword) {
        alert('Please fill in all fields.');
        return;
      }
      
      if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
      }
      
      if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
      }
      
      if (!terms) {
        alert('Please agree to the Terms & Conditions.');
        return;
      }
      
      // Email validation
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }
      
      // Firebase Auth integration (when configured)
      if (typeof auth !== 'undefined' && auth) {
        auth.createUserWithEmailAndPassword(email, password)
          .then(function(userCredential) {
            var user = userCredential.user;
            var role = 'customer';
            var userData = {
              fullName: fullName,
              email: email,
              role: role,
              createdAt: (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue) ? firebase.firestore.FieldValue.serverTimestamp() : new Date()
            };

            // Update Firebase Auth displayName so header can say "Hello {name}"
            var profilePromise = user && user.updateProfile
              ? user.updateProfile({ displayName: fullName }).catch(function () {})
              : Promise.resolve();

            // Save basic profile locally for header/account pages
            try {
              localStorage.setItem('mumbaa_account_profile', JSON.stringify({
                name: fullName,
                email: email
              }));
            } catch (e) {}

            var saveUserDocPromise = Promise.resolve();
            if (typeof db !== 'undefined' && db) {
              saveUserDocPromise = db.collection('users').doc(user.uid).set(userData);
            }

            return Promise.all([profilePromise, saveUserDocPromise]).then(function () {
              alert('Account created successfully! Welcome, ' + fullName + '!');
              window.location.href = 'index.html';
            });
          })
          .catch(function(error) {
            alert(error.message || 'Sign up failed. Please try again.');
          });
      } else {
        alert('Account created successfully! Connect Firebase to enable full authentication.');
        // For demo purposes, redirect anyway
        setTimeout(function() {
          window.location.href = 'index.html';
        }, 1000);
      }
    });
  }
});
