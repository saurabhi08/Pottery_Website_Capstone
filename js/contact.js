/**
 * Contact Page JavaScript - Form handling
 */

document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        subject: document.getElementById('subject').value.trim(),
        message: document.getElementById('message').value.trim()
      };

      // Basic validation
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
        alert('Please fill in all required fields.');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address.');
        return;
      }

      // Save to Firebase if configured
      if (typeof db !== 'undefined' && db) {
        db.collection('contact_messages').add({
          ...formData,
          submittedAt: new Date(),
          read: false
        })
        .then(() => {
          alert('Thank you for your message! We will get back to you soon.');
          contactForm.reset();
        })
        .catch((error) => {
          console.error('Error saving message:', error);
          alert('Thank you for your message! We will get back to you soon.');
          contactForm.reset();
        });
      } else {
        // Fallback: just show success message
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
      }
    });
  }
});
