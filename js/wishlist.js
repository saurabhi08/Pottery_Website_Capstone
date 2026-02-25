/**
 * Wishlist Page - Load from localStorage and display items
 */
document.addEventListener('DOMContentLoaded', function () {
  var wishlistItems = document.getElementById('wishlistItems');
  var wishlistEmpty = document.getElementById('wishlistEmpty');
  var wishlistLayout = document.querySelector('.wishlist-layout');

  function formatPrice(num) {
    return '₹ ' + num.toLocaleString('en-IN');
  }

  function renderWishlistItems() {
    if (typeof getWishlist !== 'function') {
      console.error('wishlist-utils.js not loaded');
      return;
    }

    var wishlist = getWishlist();
    console.log('Rendering wishlist items:', wishlist);
    
    if (wishlist.length === 0) {
      if (wishlistLayout) wishlistLayout.style.display = 'none';
      if (wishlistEmpty) wishlistEmpty.style.display = 'block';
      return;
    }

    if (wishlistLayout) wishlistLayout.style.display = 'block';
    if (wishlistEmpty) wishlistEmpty.style.display = 'none';

    wishlistItems.innerHTML = wishlist.map(function(item) {
      return `
        <div class="wishlist-item" data-id="${item.id}" data-price="${item.price}">
          <div class="wishlist-item-image">
            <img src="${item.image || 'imgs/img1.jpeg'}" alt="${item.name}">
          </div>
          <div class="wishlist-item-details">
            <h3 class="wishlist-item-title">${item.name}</h3>
            <p class="wishlist-item-desc">${item.description || ''}</p>
            <p class="wishlist-item-price">${formatPrice(item.price)}</p>
          </div>
          <div class="wishlist-item-actions">
            <button class="btn btn-sm add-to-cart-from-wishlist" data-product-id="${item.id}" data-product-name="${item.name}" data-product-desc="${item.description || ''}" data-product-price="${item.price}" data-product-image="${item.image || 'imgs/img1.jpeg'}">Add to Cart</button>
            <button type="button" class="wishlist-item-remove" aria-label="Remove from wishlist" data-product-id="${item.id}">×</button>
          </div>
        </div>
      `;
    }).join('');

    // Add event listeners for remove buttons
    const removeButtons = wishlistItems.querySelectorAll('.wishlist-item-remove');
    removeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const productId = this.getAttribute('data-product-id');
        if (typeof removeFromWishlist === 'function') {
          removeFromWishlist(productId);
          renderWishlistItems();
          if (typeof updateWishlistBadge === 'function') {
            updateWishlistBadge();
          }
        }
      });
    });

    // Add event listeners for "Add to Cart" buttons
    const addToCartButtons = wishlistItems.querySelectorAll('.add-to-cart-from-wishlist');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', function() {
        const productId = this.getAttribute('data-product-id');
        const productName = this.getAttribute('data-product-name');
        const productDesc = this.getAttribute('data-product-desc');
        const productPrice = parseInt(this.getAttribute('data-product-price'), 10);
        const productImage = this.getAttribute('data-product-image');
        
        if (typeof addToCart === 'function') {
          try {
            addToCart({
              id: productId,
              name: productName,
              description: productDesc || '',
              price: productPrice,
              image: productImage || 'imgs/img1.jpeg'
            });
            
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
          }
        }
      });
    });
  }

  // Initial render
  renderWishlistItems();
});
