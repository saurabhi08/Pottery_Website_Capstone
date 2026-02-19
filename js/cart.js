/**
 * Cart Page - Load from localStorage, quantity updates, remove item, totals
 */
document.addEventListener('DOMContentLoaded', function () {
  var cartItems = document.getElementById('cartItems');
  var cartEmpty = document.getElementById('cartEmpty');
  var cartLayout = document.querySelector('.cart-layout');
  var cartSubtotalEl = document.getElementById('cartSubtotal');
  var cartTotalEl = document.getElementById('cartTotal');
  var cartCountEl = document.getElementById('cartCount');

  function formatPrice(num) {
    return '₹ ' + num.toLocaleString('en-IN');
  }

  function renderCartItems() {
    if (typeof getCart !== 'function') {
      console.error('cart-utils.js not loaded');
      return;
    }

    var cart = getCart();
    
    if (cart.length === 0) {
      if (cartLayout) cartLayout.style.display = 'none';
      if (cartEmpty) cartEmpty.style.display = 'block';
      return;
    }

    if (cartLayout) cartLayout.style.display = 'grid';
    if (cartEmpty) cartEmpty.style.display = 'none';

    cartItems.innerHTML = cart.map(function(item) {
      return `
        <div class="cart-item" data-id="${item.id}" data-price="${item.price}">
          <div class="cart-item-image">
            <img src="${item.image || 'imgs/img1.jpeg'}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <h3 class="cart-item-title">${item.name}</h3>
            <p class="cart-item-desc">${item.description || ''}</p>
            <p class="cart-item-price">${formatPrice(item.price)}</p>
          </div>
          <div class="cart-item-qty">
            <button type="button" class="qty-btn" data-action="minus" aria-label="Decrease quantity">−</button>
            <input type="number" class="qty-input" value="${item.quantity}" min="1" max="99" readonly>
            <button type="button" class="qty-btn" data-action="plus" aria-label="Increase quantity">+</button>
          </div>
          <div class="cart-item-total">
            <span class="item-total-price">${formatPrice(item.price * item.quantity)}</span>
          </div>
          <button type="button" class="cart-item-remove" aria-label="Remove item">×</button>
        </div>
      `;
    }).join('');

    updateCartTotals();
  }

  function getItemTotal(row) {
    var price = parseInt(row.getAttribute('data-price'), 10);
    var qtyInput = row.querySelector('.qty-input');
    var qty = parseInt(qtyInput.value, 10) || 1;
    return price * qty;
  }

  function updateItemTotal(row) {
    var total = getItemTotal(row);
    row.querySelector('.item-total-price').textContent = formatPrice(total);
  }

  function updateCartTotals() {
    var rows = cartItems.querySelectorAll('.cart-item');
    var subtotal = 0;
    var totalQty = 0;

    rows.forEach(function (row) {
      subtotal += getItemTotal(row);
      totalQty += parseInt(row.querySelector('.qty-input').value, 10) || 0;
    });

    if (cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(subtotal);
    if (cartTotalEl) cartTotalEl.textContent = formatPrice(subtotal);
    if (cartCountEl) cartCountEl.textContent = totalQty;

    if (typeof updateCartBadge === 'function') {
      updateCartBadge();
    }

    if (rows.length === 0) {
      if (cartLayout) cartLayout.style.display = 'none';
      if (cartEmpty) cartEmpty.style.display = 'block';
    }
  }

  // Quantity buttons and remove
  cartItems.addEventListener('click', function (e) {
    var btn = e.target.closest('.qty-btn');
    var removeBtn = e.target.closest('.cart-item-remove');
    if (!btn && !removeBtn) return;

    var row = (btn || removeBtn).closest('.cart-item');
    var productId = row.getAttribute('data-id');
    var qtyInput = row.querySelector('.qty-input');
    var qty = parseInt(qtyInput.value, 10) || 1;

    if (removeBtn) {
      if (typeof removeFromCart === 'function') {
        removeFromCart(productId);
      }
      row.remove();
      updateCartTotals();
      renderCartItems();
      return;
    }

    if (btn.getAttribute('data-action') === 'plus') {
      qty = Math.min(99, qty + 1);
    } else {
      qty = Math.max(1, qty - 1);
    }
    
    qtyInput.value = qty;
    
    if (typeof updateCartQuantity === 'function') {
      updateCartQuantity(productId, qty);
    }
    
    updateItemTotal(row);
    updateCartTotals();
  });

  // Initial render
  renderCartItems();
});
