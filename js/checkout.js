/**
 * Checkout - cart totals, shipping/billing form, validation, coupon, place order (Firestore), redirect to confirmation
 */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('checkoutForm');
  var summary = document.getElementById('checkoutSummary');
  var empty = document.getElementById('checkoutEmpty');
  var checkoutItems = document.getElementById('checkoutItems');
  var applyCouponBtn = document.getElementById('applyCouponBtn');
  var couponMsg = document.getElementById('couponMsg');
  var appliedCoupon = null;

  function formatPrice(n) {
    return '₹ ' + (n || 0).toLocaleString('en-IN');
  }

  function renderSummary() {
    var cart = typeof getCart === 'function' ? getCart() : [];
    if (cart.length === 0) {
      if (summary) summary.style.display = 'none';
      if (form) form.style.display = 'none';
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';
    if (summary) summary.style.display = 'block';
    if (form) form.style.display = 'block';

    var subtotal = cart.reduce(function (sum, i) { return sum + i.price * i.quantity; }, 0);
    var shipping = subtotal >= 2000 ? 0 : 150;
    var discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percent') {
        discount = subtotal * (appliedCoupon.value / 100);
      } else if (appliedCoupon.type === 'fixed') {
        discount = Math.min(appliedCoupon.value, subtotal);
      } else if (appliedCoupon.type === 'free_shipping') {
        discount = shipping;
      }
    }
    var total = Math.max(0, subtotal + shipping - discount);

    if (checkoutItems) {
      checkoutItems.innerHTML = cart.map(function (i) {
        return '<div class="checkout-item-row">' + (i.name || 'Item') + ' × ' + i.quantity + ' — ' + formatPrice(i.price * i.quantity) + '</div>';
      }).join('');
    }
    var subEl = document.getElementById('checkoutSubtotal');
    var shipEl = document.getElementById('checkoutShipping');
    var discEl = document.getElementById('checkoutDiscount');
    var totEl = document.getElementById('checkoutTotal');
    if (subEl) subEl.textContent = formatPrice(subtotal);
    if (shipEl) shipEl.textContent = formatPrice(shipping);
    if (discEl) discEl.textContent = discount ? '− ' + formatPrice(discount) : '− ₹ 0';
    if (totEl) totEl.textContent = formatPrice(total);
  }

  if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', function () {
      var code = (document.getElementById('co-coupon') || {}).value;
      if (!code) {
        if (couponMsg) couponMsg.textContent = 'Enter a coupon code.';
        return;
      }
      if (typeof firestoreService !== 'undefined' && firestoreService.getCoupon) {
        firestoreService.getCoupon(code).then(function (c) {
          if (!c) {
            appliedCoupon = null;
            if (couponMsg) couponMsg.textContent = 'Invalid coupon.';
            return;
          }
          var subtotal = 0;
          var cart = typeof getCart === 'function' ? getCart() : [];
          if (cart.length) subtotal = cart.reduce(function (s, i) { return s + i.price * i.quantity; }, 0);
          if (c.minOrderValue && subtotal < c.minOrderValue) {
            appliedCoupon = null;
            if (couponMsg) couponMsg.textContent = 'Minimum order for this coupon is ₹' + c.minOrderValue + '.';
            return;
          }
          if (c.expiryDate && c.expiryDate.toDate) {
            if (c.expiryDate.toDate() < new Date()) {
              appliedCoupon = null;
              if (couponMsg) couponMsg.textContent = 'This coupon has expired.';
              return;
            }
          }
          var used = typeof c.usedCount === 'number' ? c.usedCount : 0;
          var limit = typeof c.usageLimit === 'number' ? c.usageLimit : 0;
          if (limit > 0 && used >= limit) {
            appliedCoupon = null;
            if (couponMsg) couponMsg.textContent = 'This coupon has reached its usage limit.';
            return;
          }
          if (c.firstTimeOnly) {
            var userId = (typeof auth !== 'undefined' && auth && auth.currentUser && auth.currentUser.uid) || (typeof getCurrentUser === 'function' && getCurrentUser() && getCurrentUser().uid);
            var email = (document.getElementById('co-email') && document.getElementById('co-email').value.trim()) || (typeof auth !== 'undefined' && auth && auth.currentUser && auth.currentUser.email) || '';
            var checkOrders = userId && firestoreService.getOrdersByUser
              ? firestoreService.getOrdersByUser(userId)
              : (email && firestoreService.getOrdersByUserEmail ? firestoreService.getOrdersByUserEmail(email) : Promise.resolve([]));
            checkOrders.then(function (orders) {
              if (orders && orders.length > 0) {
                appliedCoupon = null;
                if (couponMsg) couponMsg.textContent = 'This coupon is for first-time buyers only.';
                renderSummary();
              } else {
                appliedCoupon = c;
                if (couponMsg) couponMsg.textContent = 'Coupon applied.';
                renderSummary();
              }
            }).catch(function () {
              appliedCoupon = c;
              if (couponMsg) couponMsg.textContent = 'Coupon applied.';
              renderSummary();
            });
            return;
          }
          appliedCoupon = c;
          if (couponMsg) couponMsg.textContent = 'Coupon applied.';
          renderSummary();
        });
      } else {
        if (couponMsg) couponMsg.textContent = 'Coupons require Firebase.';
      }
    });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('co-name').value.trim();
      var email = document.getElementById('co-email').value.trim();
      var phone = document.getElementById('co-phone').value.trim();
      var address = document.getElementById('co-address').value.trim();
      var city = document.getElementById('co-city').value.trim();
      var state = document.getElementById('co-state').value.trim();
      var pincode = document.getElementById('co-pincode').value.trim();
      if (!name || !email || !phone || !address || !city || !state || !pincode) {
        alert('Please fill all required fields.');
        return;
      }
      var cart = typeof getCart === 'function' ? getCart() : [];
      if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
      }
      var subtotal = cart.reduce(function (s, i) { return s + i.price * i.quantity; }, 0);
      var shipping = subtotal >= 2000 ? 0 : 150;
      var discount = 0;
      if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') discount = subtotal * (appliedCoupon.value / 100);
        else if (appliedCoupon.type === 'fixed') discount = Math.min(appliedCoupon.value, subtotal);
        else if (appliedCoupon.type === 'free_shipping') discount = shipping;
      }
      var total = Math.max(0, subtotal + shipping - discount);

      var orderData = {
        userId: null,
        userEmail: email,
        userName: name,
        shipping: { name: name, email: email, phone: phone, address: address, city: city, state: state, pincode: pincode },
        items: cart,
        subtotal: subtotal,
        shippingCost: shipping,
        discount: discount,
        total: total,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        giftNote: (document.getElementById('co-gift-note') && document.getElementById('co-gift-note').value.trim()) || null
      };
      // Use signed-in user at submit time so order is always linked to your account
      if (typeof auth !== 'undefined' && auth && auth.currentUser) {
        orderData.userId = auth.currentUser.uid;
        orderData.userEmail = orderData.userEmail || auth.currentUser.email || email;
      } else if (typeof getCurrentUser === 'function' && getCurrentUser()) {
        orderData.userId = getCurrentUser().uid;
        orderData.userEmail = orderData.userEmail || getCurrentUser().email || email;
      }

      function saveLocalOrder(order, orderId) {
        try {
          var key = 'mumbaa_local_orders';
          var raw = localStorage.getItem(key);
          var list = raw ? JSON.parse(raw) : [];
          var copy = JSON.parse(JSON.stringify(order));
          copy.id = orderId || ('local-' + Date.now());
          copy.createdAt = new Date().toISOString();
          list.push(copy);
          localStorage.setItem(key, JSON.stringify(list));
        } catch (e) {}
      }

      if (typeof firestoreService !== 'undefined' && firestoreService.createOrder) {
        firestoreService.createOrder(orderData)
          .then(function (orderId) {
            if (appliedCoupon && appliedCoupon.id && typeof firestoreService.incrementCouponUsed === 'function') {
              firestoreService.incrementCouponUsed(appliedCoupon.id).catch(function () {});
            }
            saveLocalOrder(orderData, orderId);
            var amountPaise = Math.round(total * 100);
            var successUrl = window.location.origin + window.location.pathname.replace('checkout.html', '') + 'confirmation.html?orderId=' + encodeURIComponent(orderId);
            var cancelUrl = window.location.origin + window.location.pathname.replace('checkout.html', '') + 'checkout.html';
            function goToConfirmation() {
              if (typeof saveCart === 'function') {
                try { localStorage.setItem('mumbaa_cart', '[]'); } catch (err) {}
                if (typeof updateCartBadge === 'function') updateCartBadge();
              }
              window.location.href = 'confirmation.html?orderId=' + encodeURIComponent(orderId);
            }
            var useStripe = typeof firebase !== 'undefined' && firebase.functions && amountPaise >= 100;
            if (useStripe && typeof firestoreService !== 'undefined' && firestoreService.getPaymentSettings) {
              firestoreService.getPaymentSettings().then(function (settings) {
                if (settings.stripeEnabled === false) {
                  goToConfirmation();
                  return;
                }
                var createCheckout = firebase.functions().httpsCallable('createStripeCheckoutSession');
                createCheckout({
                  orderId: orderId,
                  amountPaise: amountPaise,
                  currency: 'inr',
                  customerEmail: email,
                  successUrl: successUrl,
                  cancelUrl: cancelUrl
                }).then(function (result) {
                  if (result && result.data && result.data.url) {
                    if (typeof firestoreService !== 'undefined' && firestoreService.updateOrderStatus) {
                      firestoreService.updateOrderStatus(orderId, 'pending_payment').catch(function () {});
                    }
                    window.location.href = result.data.url;
                  } else {
                    goToConfirmation();
                  }
                }).catch(function (err) {
                  console.warn('Stripe checkout not available:', err && err.message);
                  goToConfirmation();
                });
              }).catch(function () {
                goToConfirmation();
              });
            } else if (useStripe) {
              var createCheckout = firebase.functions().httpsCallable('createStripeCheckoutSession');
              createCheckout({
                orderId: orderId,
                amountPaise: amountPaise,
                currency: 'inr',
                customerEmail: email,
                successUrl: successUrl,
                cancelUrl: cancelUrl
              }).then(function (result) {
                if (result && result.data && result.data.url) {
                  if (typeof firestoreService !== 'undefined' && firestoreService.updateOrderStatus) {
                    firestoreService.updateOrderStatus(orderId, 'pending_payment').catch(function () {});
                  }
                  window.location.href = result.data.url;
                } else {
                  goToConfirmation();
                }
              }).catch(function (err) {
                console.warn('Stripe checkout not available:', err && err.message);
                goToConfirmation();
              });
            } else {
              goToConfirmation();
            }
          })
          .catch(function (err) {
            alert('Order failed: ' + (err.message || 'Please try again.'));
          });
      } else {
        var orderId = 'local-' + Date.now();
        saveLocalOrder(orderData, orderId);
        try { localStorage.setItem('mumbaa_cart', '[]'); } catch (err) {}
        if (typeof updateCartBadge === 'function') updateCartBadge();
        window.location.href = 'confirmation.html?orderId=' + encodeURIComponent(orderId);
      }
    });
  }

  renderSummary();

  // Load and show active coupon offers from admin (customer-side reflection)
  (function loadCheckoutOffers() {
    var container = document.getElementById('checkoutOffers');
    if (!container || typeof firestoreService === 'undefined' || !firestoreService.getActiveCouponsForDisplay) return;
    firestoreService.getActiveCouponsForDisplay().then(function (offers) {
      if (!offers || offers.length === 0) return;
      var couponInput = document.getElementById('co-coupon');
      var applyBtn = document.getElementById('applyCouponBtn');
      container.innerHTML = '<p class="checkout-offers-title">Current offers:</p><ul class="checkout-offers-list">' +
        offers.map(function (o) {
          return '<li><button type="button" class="checkout-offer-code" data-code="' + String(o.code).replace(/"/g, '&quot;') + '">' + String(o.code).replace(/</g, '&lt;') + '</button> — ' + String(o.label).replace(/</g, '&lt;') + '</li>';
        }).join('') + '</ul>';
      container.querySelectorAll('.checkout-offer-code').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var code = btn.getAttribute('data-code');
          if (couponInput) couponInput.value = code;
          if (applyBtn) applyBtn.click();
        });
      });
    });
  })();

  // Gift note character count
  var giftNoteEl = document.getElementById('co-gift-note');
  var giftNoteCountEl = document.getElementById('coGiftNoteCount');
  if (giftNoteEl && giftNoteCountEl) {
    function updateGiftNoteCount() {
      giftNoteCountEl.textContent = (giftNoteEl.value.length || 0) + '/500';
    }
    giftNoteEl.addEventListener('input', updateGiftNoteCount);
    giftNoteEl.addEventListener('paste', function () { setTimeout(updateGiftNoteCount, 0); });
    updateGiftNoteCount();
  }

  // Pre-fill checkout with logged-in user so order gets correct userId and userEmail
  function prefillFromUser(user) {
    if (!user) return;
    var emailEl = document.getElementById('co-email');
    var nameEl = document.getElementById('co-name');
    if (emailEl && !emailEl.value && user.email) emailEl.value = user.email;
    if (nameEl && !nameEl.value && user.displayName) nameEl.value = user.displayName;
  }

  // Also pre-fill from profile/addresses saved on the Account page (localStorage)
  function prefillFromAccountStorage() {
    try {
      var profileRaw = localStorage.getItem('mumbaa_account_profile');
      if (profileRaw) {
        var profile = JSON.parse(profileRaw);
        var nameEl = document.getElementById('co-name');
        var emailEl = document.getElementById('co-email');
        var phoneEl = document.getElementById('co-phone');
        if (nameEl && !nameEl.value && profile.name) nameEl.value = profile.name;
        if (emailEl && !emailEl.value && profile.email) emailEl.value = profile.email;
        if (phoneEl && !phoneEl.value && profile.phone) phoneEl.value = profile.phone;
      }
    } catch (e) {}
    try {
      var addrRaw = localStorage.getItem('mumbaa_account_addresses');
      if (addrRaw) {
        var addrs = JSON.parse(addrRaw);
        if (Array.isArray(addrs) && addrs.length > 0) {
          var addr = addrs[0];
          var addrEl = document.getElementById('co-address');
          var cityEl = document.getElementById('co-city');
          var stateEl = document.getElementById('co-state');
          var pinEl = document.getElementById('co-pincode');
          if (addrEl && !addrEl.value && addr.line1) {
            addrEl.value = addr.line1 + (addr.line2 ? ', ' + addr.line2 : '');
          }
          if (cityEl && !cityEl.value && addr.city) cityEl.value = addr.city;
          if (stateEl && !stateEl.value && addr.state) stateEl.value = addr.state;
          if (pinEl && !pinEl.value && addr.pincode) pinEl.value = addr.pincode;
        }
      }
    } catch (e2) {}
  }

  if (typeof getCurrentUser === 'function') prefillFromUser(getCurrentUser());
  if (typeof auth !== 'undefined' && auth && auth.onAuthStateChanged) {
    auth.onAuthStateChanged(function (user) { prefillFromUser(user); });
  }
  prefillFromAccountStorage();
});
