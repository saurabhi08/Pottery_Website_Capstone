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

  // Add to wishlist functionality
  const addToWishlistButtons = document.querySelectorAll('.add-to-wishlist-btn');
  console.log('Found add to wishlist buttons:', addToWishlistButtons.length);
  
  addToWishlistButtons.forEach(button => {
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
      
      console.log('Adding to wishlist:', { productId, productName, productPrice });
      
      if (!productId || !productName || !productPrice || isNaN(productPrice)) {
        console.error('Missing product data:', { productId, productName, productPrice });
        return;
      }
      
      const img = this.querySelector('img');
      
      // Check if already in wishlist
      if (typeof isInWishlist === 'function' && isInWishlist(productId)) {
        // Remove from wishlist
        if (typeof removeFromWishlist === 'function') {
          removeFromWishlist(productId);
          this.classList.remove('wishlisted');
          // Change icon back to unfilled
          if (img) {
            img.src = 'imgs/wishlist-unfilled.png';
            img.alt = 'Add to wishlist';
          }
          console.log('Removed from wishlist');
        }
      } else {
        // Add to wishlist using wishlist-utils
        if (typeof addToWishlist === 'function') {
          try {
            addToWishlist({
              id: productId,
              name: productName,
              description: productDesc || '',
              price: productPrice,
              image: productImage || 'imgs/img1.jpeg'
            });
            
            console.log('Product added to wishlist successfully');
            this.classList.add('wishlisted');
            // Change icon to red filled
            if (img) {
              img.src = 'imgs/favourite.png';
              img.alt = 'Remove from wishlist';
            }
          } catch (error) {
            console.error('Error adding to wishlist:', error);
          }
        } else {
          console.error('addToWishlist function not available');
        }
      }
    });
  });

  // Click on product card (image/title) goes to product detail page; buttons still add to cart/wishlist
  document.querySelectorAll('.product-card[data-product-id]').forEach(function (card) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function (e) {
      if (e.target.closest('button') || e.target.closest('.product-actions')) return;
      var id = card.getAttribute('data-product-id');
      if (!id) return;
      var name = card.getAttribute('data-product-name');
      var desc = card.getAttribute('data-product-desc');
      var price = card.getAttribute('data-product-price');
      var img = card.getAttribute('data-product-image');
      try {
        sessionStorage.setItem('mumbaa_product_' + id, JSON.stringify({ id: id, name: name || '', description: desc || '', price: parseInt(price, 10) || 0, image: img || 'imgs/img1.jpeg', images: img ? [img] : ['imgs/img1.jpeg'] }));
      } catch (err) {}
      window.location.href = 'product.html?id=' + encodeURIComponent(id);
    });
  });

  // Update wishlist button states on page load
  if (typeof updateWishlistBadge === 'function') {
    updateWishlistBadge();
  }

  // Subscribe form is handled by js/newsletter.js on all pages
});
