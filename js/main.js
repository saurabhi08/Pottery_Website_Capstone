/**
 * Main JavaScript - Add to cart functionality for homepage
 */
document.addEventListener('DOMContentLoaded', function() {
  // Add to cart functionality
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  console.log('Found add to cart buttons:', addToCartButtons.length);
  
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const productCard = this.closest('.product-card');
      
      if (!productCard) {
        console.error('Product card not found');
        return;
      }
      
      const productId = productCard.getAttribute('data-product-id');
      const productName = productCard.getAttribute('data-product-name');
      const productDesc = productCard.getAttribute('data-product-desc');
      const productPrice = parseInt(productCard.getAttribute('data-product-price'), 10);
      const productImage = productCard.getAttribute('data-product-image');
      
      console.log('Adding product:', { productId, productName, productPrice });
      
      if (!productId || !productName || !productPrice || isNaN(productPrice)) {
        console.error('Missing product data:', { productId, productName, productPrice });
        alert('Error: Missing product information');
        return;
      }
      
      // Add to cart using cart-utils
      if (typeof addToCart === 'function') {
        try {
          addToCart({
            id: productId,
            name: productName,
            description: productDesc || '',
            price: productPrice,
            image: productImage || 'imgs/img1.jpeg'
          });
          
          console.log('Product added to cart successfully');
          
          // Show feedback
          const originalText = this.textContent;
          const originalBg = this.style.background;
          this.textContent = 'Added!';
          this.style.background = '#4CAF50';
          this.style.color = '#fff';
          
          setTimeout(() => {
            this.textContent = originalText;
            this.style.background = originalBg;
            this.style.color = '';
          }, 1500);
        } catch (error) {
          console.error('Error adding to cart:', error);
          alert('Error adding item to cart. Please try again.');
        }
      } else {
        console.error('addToCart function not available');
        alert('Cart functionality not loaded. Please refresh the page.');
      }
    });
  });

  // Subscribe form handler
  const subscribeForm = document.getElementById('subscribeForm');
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput.value.trim();
      
      if (email) {
        // Store in Firebase if configured
        if (typeof db !== 'undefined' && db) {
          db.collection('subscribers').add({
            email: email,
            subscribedAt: new Date()
          })
          .then(() => {
            alert('Thank you for subscribing!');
            emailInput.value = '';
          })
          .catch(err => {
            console.error('Subscription error:', err);
            alert('Thank you for subscribing!');
            emailInput.value = '';
          });
        } else {
          alert('Thank you for subscribing!');
          emailInput.value = '';
        }
      }
    });
  }
});
