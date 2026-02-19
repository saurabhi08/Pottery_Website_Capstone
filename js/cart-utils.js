/**
 * Cart Utilities - Shared cart functionality using localStorage
 */

// Cart storage key
const CART_STORAGE_KEY = 'mumbaa_cart';

/**
 * Get cart from localStorage
 */
function getCart() {
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save cart to localStorage
 */
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
  } catch (e) {
    console.error('Failed to save cart:', e);
  }
}

/**
 * Add item to cart
 */
function addToCart(product) {
  console.log('addToCart called with:', product);
  
  if (!product || !product.id || !product.name || !product.price) {
    console.error('Invalid product data:', product);
    return [];
  }
  
  const cart = getCart();
  console.log('Current cart:', cart);
  
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
    console.log('Updated existing item quantity:', existingItem);
  } else {
    const newItem = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      image: product.image || 'imgs/img1.jpeg',
      quantity: 1
    };
    cart.push(newItem);
    console.log('Added new item to cart:', newItem);
  }
  
  saveCart(cart);
  console.log('Cart saved. New cart:', cart);
  return cart;
}

/**
 * Remove item from cart
 */
function removeFromCart(productId) {
  const cart = getCart();
  const filtered = cart.filter(item => item.id !== productId);
  saveCart(filtered);
  return filtered;
}

/**
 * Update item quantity in cart
 */
function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    item.quantity = quantity;
    saveCart(cart);
  }
  
  return cart;
}

/**
 * Get total cart count
 */
function getCartCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Get cart total
 */
function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Update cart badge in header
 */
function updateCartBadge() {
  const count = getCartCount();
  console.log('Updating cart badge. Count:', count);
  
  const badges = document.querySelectorAll('.cart-badge');
  console.log('Found badges:', badges.length);
  
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
  
  // Also try to update if badge doesn't exist yet (for pages that haven't loaded)
  if (badges.length === 0 && typeof document !== 'undefined') {
    // Badge might be added dynamically, so we'll update on next page load
    console.log('No badges found, will update on page load');
  }
}

// Update badge on page load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      updateCartBadge();
      console.log('Cart badge updated on DOMContentLoaded');
    });
  } else {
    // DOM already loaded
    updateCartBadge();
    console.log('Cart badge updated immediately');
  }
}

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  window.debugCart = function() {
    console.log('Cart contents:', getCart());
    console.log('Cart count:', getCartCount());
    console.log('Cart total:', getCartTotal());
    console.log('localStorage cart:', localStorage.getItem(CART_STORAGE_KEY));
  };
}
