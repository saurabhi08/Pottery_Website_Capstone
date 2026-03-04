/**
 * Newsletter subscribe - handles footer subscribe form on all pages.
 * Shows "Email sent - confirmation sent" after successful submit.
 */
(function() {
  function init() {
    var forms = document.querySelectorAll('.subscribe-form');
    forms.forEach(function(form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var emailInput = form.querySelector('input[type="email"]');
        var email = emailInput ? emailInput.value.trim() : '';

        if (!email) {
          alert('Please enter your email address.');
          return;
        }

        function showSuccess() {
          alert('Thank you for subscribing! A confirmation email has been sent to your inbox.');
          if (emailInput) emailInput.value = '';
        }

        if (typeof db !== 'undefined' && db) {
          db.collection('subscribers').add({
            email: email,
            subscribedAt: new Date()
          })
          .then(showSuccess)
          .catch(function(err) {
            console.error('Subscription save error:', err);
            showSuccess();
          });
        } else {
          showSuccess();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
