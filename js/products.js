/**
 * Products Page JavaScript - Filter functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  const priceFilters = document.querySelectorAll('input[name="price"]');
  const categoryFilters = document.querySelectorAll('input[name="category"]');
  const clearFiltersBtn = document.getElementById('clearFilters');
  const productsGrid = document.getElementById('productsGrid');
  
  // Product data with categories and prices
  const allProducts = Array.from(productsGrid.querySelectorAll('.product-card')).map(card => ({
    element: card,
    price: parseInt(card.querySelector('.price').textContent.replace(/[₹,\s]/g, '')),
    category: getCategoryFromCard(card)
  }));

  function getCategoryFromCard(card) {
    const media = card.querySelector('.product-media');
    if (media.classList.contains('bg-mugs-1') || media.classList.contains('bg-mugs-2') || media.classList.contains('bg-mugs-3')) {
      return 'mugs';
    }
    if (media.classList.contains('bg-bowls-1') || media.classList.contains('bg-bowls-2')) {
      return 'bowls';
    }
    if (media.classList.contains('bg-plates-1') || media.classList.contains('bg-plates-2')) {
      return 'plates';
    }
    if (media.classList.contains('bg-jars-1') || media.classList.contains('bg-jars-2')) {
      return 'jars';
    }
    if (media.classList.contains('bg-ash-1') || media.classList.contains('bg-ash-2')) {
      return 'ashtrays';
    }
    return 'all';
  }

  function applyFilters() {
    const selectedPrice = document.querySelector('input[name="price"]:checked')?.value || 'all';
    const selectedCategory = document.querySelector('input[name="category"]:checked')?.value || 'all';

    allProducts.forEach(product => {
      let show = true;

      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        show = false;
      }

      // Price filter
      if (selectedPrice === 'under1000' && product.price >= 1000) {
        show = false;
      } else if (selectedPrice === '1000-2000' && (product.price < 1000 || product.price > 2000)) {
        show = false;
      } else if (selectedPrice === 'over2000' && product.price <= 2000) {
        show = false;
      }

      // Show/hide product
      product.element.style.display = show ? 'flex' : 'none';
    });

    // Update product count
    const visibleCount = allProducts.filter(p => p.element.style.display !== 'none').length;
    const countElement = document.querySelector('.products-count');
    if (countElement) {
      countElement.textContent = `${visibleCount} products`;
    }
  }

  // Event listeners
  priceFilters.forEach(filter => {
    filter.addEventListener('change', applyFilters);
  });

  categoryFilters.forEach(filter => {
    filter.addEventListener('change', applyFilters);
  });

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function() {
      document.querySelector('input[name="price"][value="all"]').checked = true;
      document.querySelector('input[name="category"][value="all"]').checked = true;
      applyFilters();
    });
  }

  // Check URL parameters for category filter
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam) {
    const categoryRadio = document.querySelector(`input[name="category"][value="${categoryParam}"]`);
    if (categoryRadio) {
      categoryRadio.checked = true;
      applyFilters();
    }
  }

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

  // Update wishlist button states on page load
  if (typeof updateWishlistBadge === 'function') {
    updateWishlistBadge();
  }
});
