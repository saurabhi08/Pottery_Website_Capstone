/**
 * Contact Page JavaScript - Form handling
 * Saves messages to Firebase (contact_messages). View them in Admin → Contact Messages.
 * No email setup needed. Optional: add EmailJS (see CONTACT_EMAIL_SETUP.md) to also get emails.
 */

document.addEventListener('DOMContentLoaded', function () {
  var contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        subject: document.getElementById('subject').value.trim(),
        message: document.getElementById('message').value.trim()
      };

      if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
        alert('Please fill in all required fields.');
        return;
      }

      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address.');
        return;
      }

      if (typeof db !== 'undefined' && db) {
        db.collection('contact_messages').add({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          submittedAt: new Date(),
          read: false
        })
          .then(function () {
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
          })
          .catch(function (err) {
            console.error('Error saving message:', err);
            alert('Something went wrong. Please try again or email us directly.');
          });
      } else {
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
      }
    });
  }
});
