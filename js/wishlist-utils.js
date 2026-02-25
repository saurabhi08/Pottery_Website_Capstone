/**
 * Wishlist Utilities - Shared wishlist functionality using localStorage
 */

// Wishlist storage key
const WISHLIST_STORAGE_KEY = 'mumbaa_wishlist';

/**
 * Get wishlist from localStorage
 */
function getWishlist() {
  try {
    const wishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return wishlist ? JSON.parse(wishlist) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save wishlist to localStorage
 */
function saveWishlist(wishlist) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    updateWishlistBadge();
  } catch (e) {
    console.error('Failed to save wishlist:', e);
  }
}

/**
 * Add item to wishlist
 */
function addToWishlist(product) {
  console.log('addToWishlist called with:', product);
  
  if (!product || !product.id || !product.name || !product.price) {
    console.error('Invalid product data:', product);
    return [];
  }
  
  const wishlist = getWishlist();
  console.log('Current wishlist:', wishlist);
  
  // Check if item already exists
  const existingItem = wishlist.find(item => item.id === product.id);
  
  if (existingItem) {
    console.log('Item already in wishlist');
    return wishlist;
  }
  
  const newItem = {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: product.price,
    image: product.image || 'imgs/img1.jpeg'
  };
  
  wishlist.push(newItem);
  console.log('Added new item to wishlist:', newItem);
  
  saveWishlist(wishlist);
  console.log('Wishlist saved. New wishlist:', wishlist);
  return wishlist;
}

/**
 * Remove item from wishlist
 */
function removeFromWishlist(productId) {
  const wishlist = getWishlist();
  const filtered = wishlist.filter(item => item.id !== productId);
  saveWishlist(filtered);
  return filtered;
}

/**
 * Check if item is in wishlist
 */
function isInWishlist(productId) {
  const wishlist = getWishlist();
  return wishlist.some(item => item.id === productId);
}

/**
 * Get total wishlist count
 */
function getWishlistCount() {
  const wishlist = getWishlist();
  return wishlist.length;
}

/**
 * Update wishlist badge in header
 */
function updateWishlistBadge() {
  const count = getWishlistCount();
  console.log('Updating wishlist badge. Count:', count);
  
  const badges = document.querySelectorAll('.wishlist-badge');
  console.log('Found badges:', badges.length);
  
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
  
  // Update wishlist button states (add active class if item is wishlisted)
  const wishlistButtons = document.querySelectorAll('.add-to-wishlist-btn');
  wishlistButtons.forEach(button => {
    const productCard = button.closest('.product-card');
    if (productCard) {
      const productId = productCard.getAttribute('data-product-id');
      const img = button.querySelector('img');
      
      if (productId && isInWishlist(productId)) {
        button.classList.add('wishlisted');
        // Change to red filled icon
        if (img) {
          img.src = 'imgs/favourite.png';
          img.alt = 'Remove from wishlist';
        }
      } else {
        button.classList.remove('wishlisted');
        // Change to unfilled icon
        if (img) {
          img.src = 'imgs/wishlist-unfilled.png';
          img.alt = 'Add to wishlist';
        }
      }
    }
  });
}

// Update badge on page load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      updateWishlistBadge();
      console.log('Wishlist badge updated on DOMContentLoaded');
    });
  } else {
    // DOM already loaded
    updateWishlistBadge();
    console.log('Wishlist badge updated immediately');
  }
}

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  window.debugWishlist = function() {
    console.log('Wishlist contents:', getWishlist());
    console.log('Wishlist count:', getWishlistCount());
    console.log('localStorage wishlist:', localStorage.getItem(WISHLIST_STORAGE_KEY));
  };
}
