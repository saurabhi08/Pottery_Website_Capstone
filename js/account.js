/**
 * Account Page - Tab switching, profile form, addresses
 */
document.addEventListener('DOMContentLoaded', function () {
  const navLinks = document.querySelectorAll('.account-nav-link');
  const sections = document.querySelectorAll('.account-section');
  const profileForm = document.getElementById('profileForm');
  const addressForm = document.getElementById('addressForm');
  const addAddressBtn = document.getElementById('addAddressBtn');
  const cancelAddressBtn = document.getElementById('cancelAddressBtn');
  const addressesEmpty = document.getElementById('addressesEmpty');
  const addressesList = document.getElementById('addressesList');

  const ADDRESSES_KEY = 'mumbaa_account_addresses';
  const PROFILE_KEY = 'mumbaa_account_profile';

  var ordersUISetupDone = false;

  function getStoredProfile() {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function getStoredAddresses() {
    try {
      const data = localStorage.getItem(ADDRESSES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveProfile(profile) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  }

  function saveAddresses(addresses) {
    try {
      localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
    } catch (e) {
      console.error('Failed to save addresses', e);
    }
  }

  // Tab switching
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      const tab = this.getAttribute('data-tab');
      if (!tab) return;

      e.preventDefault();
      navLinks.forEach(function (l) {
        l.classList.remove('active');
      });
      this.classList.add('active');

      sections.forEach(function (section) {
        section.classList.remove('active');
        if (section.id === tab + 'Section') {
          section.classList.add('active');
        }
      });

      if (tab === 'addresses') {
        renderAddresses();
      }
      if (tab === 'orders') {
        loadOrderHistory();
      }
    });
  });

  // On load: if URL hash is #orders, #addresses, or #profile, switch to that tab
  (function initTabFromHash() {
    var hash = (window.location.hash || '').replace('#', '');
    if (hash === 'orders' || hash === 'addresses' || hash === 'profile') {
      navLinks.forEach(function (l) {
        l.classList.remove('active');
        if (l.getAttribute('data-tab') === hash) l.classList.add('active');
      });
      sections.forEach(function (section) {
        section.classList.remove('active');
        if (section.id === hash + 'Section') section.classList.add('active');
      });
      if (hash === 'orders') loadOrderHistory();
      if (hash === 'addresses') renderAddresses();
    }
  })();

  // Orders-only page: always load orders on page load
  loadOrderHistory();

  function loadOrderHistory() {
    var ordersEmpty = document.getElementById('ordersEmpty');
    var ordersList = document.getElementById('ordersList');
    var ordersSearchInput = document.getElementById('ordersSearchInput');
    var ordersFilterBtn = document.getElementById('ordersFilterBtn');
    var ordersFilterDropdown = document.getElementById('ordersFilterDropdown');
    if (!ordersList) return;

    var allOrders = [];
    var currentStatusFilter = 'all';
    var currentTimeFilter = 'anytime';

    function formatOrderDate(dateObj) {
      if (!dateObj) return '';
      var d = dateObj;
      if (dateObj.toDate && typeof dateObj.toDate === 'function') d = dateObj.toDate();
      else if (typeof dateObj === 'string') d = new Date(dateObj);
      if (!(d instanceof Date) || isNaN(d.getTime())) return '';
      return 'On ' + d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }

    function getOrderDisplayStatus(status) {
      if (!status) return 'Pending';
      var s = String(status).toLowerCase();
      if (s === 'delivered' || s === 'paid' || s === 'complete') return 'Delivered';
      if (s === 'shipped' || s === 'dispatched') return 'Shipped';
      return 'Pending';
    }

    function filterOrdersBySearchAndStatus(orders, searchText, statusFilter, timeFilter) {
      var q = (searchText || '').trim().toLowerCase();
      var status = (statusFilter || 'all').toLowerCase();
      var time = (timeFilter || 'anytime').toLowerCase();
      var now = new Date();
      return orders.filter(function (o) {
        if (status !== 'all') {
          var displayStatus = getOrderDisplayStatus(o.status).toLowerCase();
          // Treat "on_the_way" as pending/shipped-style states
          if (status === 'on_the_way') {
            if (!(displayStatus === 'pending' || displayStatus === 'shipped')) return false;
          } else if (status === 'cancelled') {
            if (displayStatus !== 'cancelled') return false;
          } else if (status === 'returned') {
            if (displayStatus !== 'returned') return false;
          } else if (displayStatus !== status) {
            return false;
          }
        }
        // Time filter
        if (time !== 'anytime') {
          var daysLimit = parseInt(time, 10);
          if (!isNaN(daysLimit)) {
            var d = o.createdAt;
            if (d && d.toDate && typeof d.toDate === 'function') d = d.toDate();
            else if (typeof d === 'string') d = new Date(d);
            if (!(d instanceof Date) || isNaN(d.getTime())) return false;
            var diffMs = now.getTime() - d.getTime();
            var diffDays = diffMs / (1000 * 60 * 60 * 24);
            if (diffDays > daysLimit) return false;
          }
        }
        if (!q) return true;
        // Search across everything visible in the order card
        var displayStatus = getOrderDisplayStatus(o.status).toLowerCase();
        var dateStr = formatOrderDate(o.createdAt).toLowerCase();
        var id = (o.id || '').toString().toLowerCase();
        var searchable = [id, displayStatus, dateStr, 'mumbaa'].join(' ');
        // Include return-window date for search
        var rd = o.createdAt;
        if (rd) {
          var r = (rd.toDate && typeof rd.toDate === 'function') ? rd.toDate() : (typeof rd === 'string' ? new Date(rd) : rd);
          if (r instanceof Date && !isNaN(r.getTime())) {
            var ret = new Date(r.getTime());
            ret.setDate(ret.getDate() + 7);
            searchable += ' ' + ret.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).toLowerCase();
          }
        }
        var items = o.items || [];
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          var name = (it.name || '').toLowerCase();
          var desc = (it.description || '').toLowerCase();
          searchable += ' ' + name + ' ' + desc;
          if (it.quantity != null) searchable += ' qty ' + it.quantity + ' ' + it.quantity;
        }
        if (searchable.indexOf(q) !== -1) return true;
        return false;
      });
    }

    function itemMatchesSearch(it, q) {
      if (!q) return true;
      var name = (it.name || '').toLowerCase();
      var desc = (it.description || '').toLowerCase();
      var searchable = 'mumbaa ' + name + ' ' + desc;
      if (it.quantity != null) searchable += ' qty ' + it.quantity + ' ' + it.quantity;
      return searchable.indexOf(q) !== -1;
    }

    function renderOrderBlock(o, searchText) {
      var dateStr = formatOrderDate(o.createdAt);
      var displayStatus = getOrderDisplayStatus(o.status);
      var isDelivered = displayStatus === 'Delivered';
      var items = o.items || [];
      var q = (searchText || '').trim().toLowerCase();
      if (q) {
        items = items.filter(function (it) { return itemMatchesSearch(it, q); });
      }
      if (items.length === 0) return '';

      var returnDate = null;
      if (o.createdAt) {
        var rd = o.createdAt;
        if (rd.toDate && typeof rd.toDate === 'function') rd = rd.toDate();
        else if (typeof rd === 'string') rd = new Date(rd);
        if (rd instanceof Date && !isNaN(rd.getTime())) {
          var r = new Date(rd);
          r.setDate(r.getDate() + 7);
          returnDate = r.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        }
      }
      if (!returnDate) returnDate = '—';

      var productCards = '';
      var reviewRows = '';
      var productUrlBase = 'product.html?id=';
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var pid = it.id || it.productId || '';
        var name = it.name || 'Product';
        var desc = it.description || '';
        var img = it.image || 'imgs/img1.jpeg';
        var productUrl = pid ? productUrlBase + encodeURIComponent(pid) : 'products.html';
        var orderItemData = encodeURIComponent(JSON.stringify({
          name: name,
          description: desc || '',
          image: img || 'imgs/img1.jpeg',
          price: it.price != null ? it.price : 0,
          quantity: it.quantity != null ? it.quantity : 1
        }));
        productCards += '<a href="' + productUrl + '" class="order-product-card" data-product-id="' + (pid || '').replace(/"/g, '&quot;') + '" data-order-item="' + orderItemData + '">' +
          '<img src="' + (img || 'imgs/img1.jpeg') + '" alt="" class="order-product-card-image" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">' +
          '<div class="order-product-card-details">' +
          '<span class="order-product-card-brand">Mumbaa</span>' +
          '<p class="order-product-card-name">' + (name || '').replace(/</g, '&lt;') + '</p>' +
          (it.quantity > 1 ? '<p class="order-product-card-meta">Qty: ' + it.quantity + '</p>' : '') +
          '</div>' +
          '<span class="order-product-card-arrow" aria-hidden="true">&rsaquo;</span>' +
          '</a>';
        reviewRows += '<div class="order-review-row" data-product-id="' + (pid || '').replace(/"/g, '&quot;') + '" data-product-name="' + (name || '').replace(/"/g, '&quot;') + '">' +
          '<div class="order-review-stars" data-rating="0" role="button" tabindex="0" aria-label="Rate 0 out of 5">' +
          '<span class="order-review-star" data-value="1">★</span><span class="order-review-star" data-value="2">★</span>' +
          '<span class="order-review-star" data-value="3">★</span><span class="order-review-star" data-value="4">★</span><span class="order-review-star" data-value="5">★</span>' +
          '</div>' +
          '<a href="#" class="order-write-review" data-product-id="' + (pid || '').replace(/"/g, '&quot;') + '" data-product-name="' + (name || '').replace(/"/g, '&quot;') + '">Write Review</a>' +
          '<p class="order-review-incentive">Write Review</p>' +
          '</div>';
      }

      return '<div class="order-block" data-order-id="' + (o.id || '').toString().replace(/"/g, '&quot;') + '">' +
        '<div class="order-delivery-status ' + (isDelivered ? 'delivered' : '') + '">' +
        '<span class="order-delivery-icon" aria-hidden="true">&#9745;</span>' +
        '<div><span class="order-delivery-status-text">' + displayStatus + '</span><p class="order-delivery-date">' + dateStr + '</p></div>' +
        '</div>' +
        productCards +
        '<p class="order-return-window">Exchange/Return window closed on ' + returnDate + '</p>' +
        reviewRows +
        '</div>';
    }

    function markOrdersSectionReady() {
      var section = document.getElementById('ordersSection');
      if (section) {
        section.classList.remove('orders-section-hidden');
        section.classList.add('orders-section-ready');
      }
    }

    function showOrders(orders) {
      allOrders = orders || [];
      var filtered = filterOrdersBySearchAndStatus(
        allOrders,
        ordersSearchInput ? ordersSearchInput.value : '',
        currentStatusFilter,
        currentTimeFilter
      );
      if (filtered.length === 0) {
        if (ordersEmpty) ordersEmpty.style.display = 'block';
        ordersList.style.display = 'none';
        markOrdersSectionReady();
        return;
      }
      if (ordersEmpty) ordersEmpty.style.display = 'none';
      ordersList.style.display = 'block';
      var searchQuery = ordersSearchInput ? ordersSearchInput.value.trim() : '';
      ordersList.innerHTML = filtered.map(function (o) { return renderOrderBlock(o, searchQuery); }).join('');
      markOrdersSectionReady();

      // Star hover/click in cards (visual only; modal sets actual rating on submit)
      ordersList.querySelectorAll('.order-review-stars').forEach(function (starWrap) {
        var stars = starWrap.querySelectorAll('.order-review-star');
        function setFillUpTo(n) {
          stars.forEach(function (s, i) {
            s.classList.toggle('filled', i < n);
          });
          starWrap.setAttribute('data-rating', n);
          starWrap.setAttribute('aria-label', 'Rate ' + n + ' out of 5');
        }
        starWrap.addEventListener('click', function (e) {
          var v = e.target.getAttribute('data-value');
          if (v) setFillUpTo(parseInt(v, 10));
        });
        starWrap.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            var r = parseInt(starWrap.getAttribute('data-rating'), 10) || 0;
            var next = r >= 5 ? 0 : r + 1;
            setFillUpTo(next);
          }
        });
      });

      // Write Review -> open modal
      ordersList.querySelectorAll('.order-write-review').forEach(function (link) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          var productId = this.getAttribute('data-product-id') || '';
          var productName = this.getAttribute('data-product-name') || 'Product';
          openReviewModal(productId, productName);
        });
      });

      // Click on product card: pass ordered item to product page so it shows what you ordered
      ordersList.querySelectorAll('.order-product-card').forEach(function (card) {
        card.addEventListener('click', function (e) {
          var pid = card.getAttribute('data-product-id') || '';
          var raw = card.getAttribute('data-order-item');
          if (pid && raw) {
            try {
              var item = JSON.parse(decodeURIComponent(raw));
              if (item) {
                item.id = pid;
                sessionStorage.setItem('mumbaa_product_' + pid, JSON.stringify(item));
              }
            } catch (err) {}
          }
        });
      });
    }

    function openReviewModal(productId, productName) {
      var modal = document.getElementById('orderReviewModal');
      var productEl = document.getElementById('orderReviewModalProduct');
      var starsWrap = document.getElementById('orderReviewModalStars');
      var textEl = document.getElementById('orderReviewModalText');
      if (!modal || !starsWrap) return;
      if (productEl) productEl.textContent = productName;
      modal.setAttribute('data-product-id', productId);
      modal.setAttribute('data-product-name', productName);
      starsWrap.setAttribute('data-rating', '0');
      starsWrap.querySelectorAll('.order-review-star').forEach(function (s) { s.classList.remove('filled'); });
      if (textEl) textEl.value = '';
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
    }

    function closeReviewModal() {
      var modal = document.getElementById('orderReviewModal');
      if (modal) {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
      }
    }

    // Filter panel toggle - only attach once to avoid duplicate handlers
    if (!ordersUISetupDone && ordersFilterBtn && ordersFilterDropdown) {
      ordersUISetupDone = true;
      var filterPanel = ordersFilterDropdown;
      var closeBtn = document.getElementById('ordersFilterClose');
      var clearBtn = document.getElementById('ordersFilterClear');
      var applyBtn = document.getElementById('ordersFilterApply');
      var statusRadios = filterPanel.querySelectorAll('input[name="orderStatusFilter"]');
      var timeRadios = filterPanel.querySelectorAll('input[name="orderTimeFilter"]');

      function openFilterPanel() {
        filterPanel.classList.add('is-open');
        filterPanel.setAttribute('aria-hidden', 'false');
      }

      function closeFilterPanel() {
        filterPanel.classList.remove('is-open');
        filterPanel.setAttribute('aria-hidden', 'true');
      }

      ordersFilterBtn.addEventListener('click', function () {
        openFilterPanel();
      });

      if (closeBtn) {
        closeBtn.addEventListener('click', function () {
          closeFilterPanel();
        });
      }

      // Clicking on the semi-transparent backdrop closes panel
      filterPanel.addEventListener('click', function (e) {
        if (e.target === filterPanel) {
          closeFilterPanel();
        }
      });

      if (applyBtn) {
        applyBtn.addEventListener('click', function () {
          closeFilterPanel();
        });
      }

      if (clearBtn) {
        clearBtn.addEventListener('click', function () {
          currentStatusFilter = 'all';
          currentTimeFilter = 'anytime';
          statusRadios.forEach(function (r) {
            if (r.value === 'all') r.checked = true;
          });
          timeRadios.forEach(function (r) {
            if (r.value === 'anytime') r.checked = true;
          });
          showOrders(allOrders);
        });
      }

      statusRadios.forEach(function (radio) {
        radio.addEventListener('change', function () {
          if (!this.checked) return;
          currentStatusFilter = this.value || 'all';
          showOrders(allOrders);
        });
      });

      timeRadios.forEach(function (radio) {
        radio.addEventListener('change', function () {
          if (!this.checked) return;
          currentTimeFilter = this.value || 'anytime';
          showOrders(allOrders);
        });
      });

      if (ordersSearchInput) {
        ordersSearchInput.addEventListener('input', function () { showOrders(allOrders); });
        ordersSearchInput.addEventListener('keyup', function () { showOrders(allOrders); });
      }
    }

    // Review modal: stars and submit
    (function setupReviewModal() {
      var modal = document.getElementById('orderReviewModal');
      var starsWrap = document.getElementById('orderReviewModalStars');
      var textEl = document.getElementById('orderReviewModalText');
      var cancelBtn = document.getElementById('orderReviewModalCancel');
      var submitBtn = document.getElementById('orderReviewModalSubmit');
      var backdrop = document.getElementById('orderReviewModalBackdrop');
      if (!modal || !starsWrap) return;
      starsWrap.querySelectorAll('.order-review-star').forEach(function (star) {
        star.addEventListener('click', function () {
          var v = parseInt(star.getAttribute('data-value'), 10);
          starsWrap.setAttribute('data-rating', v);
          starsWrap.querySelectorAll('.order-review-star').forEach(function (s) {
            s.classList.toggle('filled', parseInt(s.getAttribute('data-value'), 10) <= v);
          });
        });
      });
      function closeModal() { closeReviewModal(); }
      if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
      if (backdrop) backdrop.addEventListener('click', closeModal);
      if (submitBtn) {
        submitBtn.addEventListener('click', function () {
          var productId = modal.getAttribute('data-product-id') || '';
          var productName = modal.getAttribute('data-product-name') || '';
          var rating = parseInt(starsWrap.getAttribute('data-rating'), 10) || 0;
          var text = (textEl && textEl.value) ? textEl.value.trim() : '';
          if (rating < 1 || rating > 5) {
            alert('Please select a star rating.');
            return;
          }
          var userId = '';
          var userName = 'Guest';
          if (typeof getCurrentUser === 'function' && getCurrentUser()) {
            var u = getCurrentUser();
            userId = u.uid || '';
            userName = u.displayName || (getStoredProfile().name) || u.email || 'Guest';
          } else {
            var p = getStoredProfile();
            userName = (p && p.name) ? p.name : (p && p.email) ? p.email : 'Guest';
          }
          if (typeof firestoreService !== 'undefined' && firestoreService.addReview) {
            firestoreService.addReview(productId, userId, userName, rating, text)
              .then(function () {
                closeModal();
                alert('Thank you! Your review has been submitted.');
              })
              .catch(function (err) {
                alert('Could not submit review: ' + (err.message || 'Please try again.'));
              });
          } else {
            closeModal();
            alert('Thank you! Your review has been submitted.');
          }
        });
      }
    })();

    function getLocalOrdersForUser(userOrEmail) {
      var result = [];
      var email = (userOrEmail && typeof userOrEmail === 'object' && userOrEmail.email) ? userOrEmail.email : (typeof userOrEmail === 'string' ? userOrEmail : '');
      var uid = (userOrEmail && typeof userOrEmail === 'object' && userOrEmail.uid) ? userOrEmail.uid : null;
      try {
        var raw = localStorage.getItem('mumbaa_local_orders');
        if (!raw) return result;
        var list = JSON.parse(raw) || [];
        list.forEach(function (o) {
          if (!o) return;
          if (uid && o.userId && o.userId === uid) {
            result.push(o);
            return;
          }
          if (email && (o.userEmail === email || (o.shipping && o.shipping.email === email))) {
            result.push(o);
          }
        });
      } catch (e) {}
      result.forEach(function (o) {
        if (o.createdAt && typeof o.createdAt === 'string') {
          var d = new Date(o.createdAt);
          if (!isNaN(d.getTime())) o.createdAt = d;
        }
        if (!o.id) o.id = 'local-' + (o.createdAt ? (o.createdAt.getTime ? o.createdAt.getTime() : '') : Date.now());
      });
      return result;
    }

    function fetchAndShow(userOrProfileEmail) {
      var user = (userOrProfileEmail && typeof userOrProfileEmail === 'object' && userOrProfileEmail.uid) ? userOrProfileEmail : null;
      var email = user ? (user.email || '') : (typeof userOrProfileEmail === 'string' ? userOrProfileEmail : (userOrProfileEmail && userOrProfileEmail.email ? userOrProfileEmail.email : ''));
      var promises = [];

      if (typeof firestoreService !== 'undefined') {
        if (user && user.uid) {
          promises.push(firestoreService.getOrdersByUser(user.uid));
        }
        if (email) {
          promises.push(firestoreService.getOrdersByUserEmail(email));
          if (firestoreService.getOrdersByShippingEmail) {
            promises.push(firestoreService.getOrdersByShippingEmail(email));
          }
        }
      }

      var localOrders = getLocalOrdersForUser(user || { email: email });
      Promise.all(promises).then(function (results) {
        results.push(localOrders);
        var seen = {};
        var merged = [];
        results.forEach(function (list) {
          (list || []).forEach(function (o) {
            if (!o) return;
            var id = o.id || ('order-' + (o.createdAt ? (o.createdAt.getTime ? o.createdAt.getTime() : o.createdAt) : Date.now()) + '-' + (o.shipping && o.shipping.email ? o.shipping.email : ''));
            if (seen[id]) return;
            seen[id] = true;
            if (!o.id) o.id = id;
            merged.push(o);
          });
        });
        merged.sort(function (a, b) {
          var ta = 0;
          if (a.createdAt) {
            if (a.createdAt instanceof Date) ta = a.createdAt.getTime();
            else if (a.createdAt.toDate) ta = a.createdAt.toDate().getTime();
            else if (typeof a.createdAt === 'string') ta = new Date(a.createdAt).getTime();
          }
          var tb = 0;
          if (b.createdAt) {
            if (b.createdAt instanceof Date) tb = b.createdAt.getTime();
            else if (b.createdAt.toDate) tb = b.createdAt.toDate().getTime();
            else if (typeof b.createdAt === 'string') tb = new Date(b.createdAt).getTime();
          }
          return tb - ta;
        });
        showOrders(merged);
      }).catch(function (err) {
        console.error('loadOrderHistory error:', err);
        showOrders(localOrders);
      });
    }

    var user = (typeof getCurrentUser === 'function' && getCurrentUser()) ? getCurrentUser() : null;
    if (user) {
      fetchAndShow(user);
      return;
    }
    var profile = getStoredProfile();
    if (profile && profile.email) {
      fetchAndShow({ email: profile.email });
      return;
    }
    if (typeof auth !== 'undefined' && auth && auth.onAuthStateChanged) {
      var done = false;
      var unsub = auth.onAuthStateChanged(function (u) {
        if (done) return;
        done = true;
        if (unsub && typeof unsub === 'function') unsub();
        if (u) {
          fetchAndShow(u);
        } else {
          var p = getStoredProfile();
          if (p && p.email) fetchAndShow({ email: p.email });
          else showOrders([]);
        }
      });
      return;
    }
    showOrders(getLocalOrdersForUser(''));
  }

  // Load profile into form and update greeting
  (function loadProfile() {
    const profile = getStoredProfile();
    const nameEl = document.getElementById('account-name');
    const emailEl = document.getElementById('account-email');
    const phoneEl = document.getElementById('account-phone');
    if (nameEl) nameEl.value = profile.name || '';
    if (emailEl) emailEl.value = profile.email || '';
    if (phoneEl) phoneEl.value = profile.phone || '';

    var greetingName = document.getElementById('accountGreetingName');
    var greetingMeta = document.getElementById('accountGreetingMeta');
    if (greetingName || greetingMeta) {
      var name = profile.name || '';
      var phone = profile.phone || '';
      var email = profile.email || '';
      if (typeof getCurrentUser === 'function' && getCurrentUser()) {
        var u = getCurrentUser();
        if (u.displayName) name = name || u.displayName;
        if (u.email) email = email || u.email;
      }
      if (greetingName) greetingName.textContent = name || 'Guest';
      if (greetingMeta) greetingMeta.textContent = phone || email || 'Sign in to save your details';
    }
  })();

  if (typeof auth !== 'undefined' && auth && auth.onAuthStateChanged) {
    auth.onAuthStateChanged(function (u) {
      var greetingName = document.getElementById('accountGreetingName');
      var greetingMeta = document.getElementById('accountGreetingMeta');
      if (!greetingName && !greetingMeta) return;
      var profile = getStoredProfile();
      var name = (profile && profile.name) || (u && u.displayName) || 'Guest';
      var phone = (profile && profile.phone) || '';
      var email = (profile && profile.email) || (u && u.email) || '';
      if (greetingName) greetingName.textContent = name;
      if (greetingMeta) greetingMeta.textContent = phone || email || 'Sign in to save your details';
    });
  }

  var logoutLink = document.getElementById('accountLogout');
  if (logoutLink) {
    logoutLink.addEventListener('click', function (e) {
      if (typeof signOut === 'function') {
        e.preventDefault();
        signOut();
      }
    });
  }

  // Profile form submit
  if (profileForm) {
    profileForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('account-name').value.trim();
      const email = document.getElementById('account-email').value.trim();
      const phone = document.getElementById('account-phone').value.trim();

      if (!email) {
        alert('Please enter your email.');
        return;
      }

      saveProfile({ name: name, email: email, phone: phone });
      alert('Profile updated successfully.');
    });
  }

  // Address form show/hide
  if (addAddressBtn) {
    addAddressBtn.addEventListener('click', function () {
      addressesEmpty.style.display = 'none';
      addressForm.style.display = 'block';
    });
  }

  if (cancelAddressBtn) {
    cancelAddressBtn.addEventListener('click', function () {
      addressForm.style.display = 'none';
      addressForm.reset();
      var addrs = getStoredAddresses();
      if (addrs.length === 0) {
        addressesEmpty.style.display = 'block';
      }
    });
  }

  function renderAddresses() {
    var addresses = getStoredAddresses();
    if (addresses.length === 0) {
      addressesList.style.display = 'none';
      if (addressesEmpty) addressesEmpty.style.display = 'block';
      if (addressForm) addressForm.style.display = 'none';
      return;
    }

    addressesEmpty.style.display = 'none';
    addressesList.style.display = 'flex';
    addressesList.innerHTML = addresses
      .map(function (addr, index) {
        var lines = [addr.line1];
        if (addr.line2) lines.push(addr.line2);
        lines.push(addr.city + ', ' + addr.state + ' ' + addr.pincode);
        return (
          '<div class="account-address-item" data-index="' +
          index +
          '">' +
          '<strong>' +
          (addr.label || 'Address') +
          '</strong>' +
          '<p style="margin:0.5rem 0 0;color:var(--color-text-muted);font-size:0.9rem;">' +
          lines.join('<br>') +
          '</p>' +
          '<div class="account-address-actions">' +
          '<button type="button" class="btn btn-sm btn-outline remove-address-btn" data-index="' +
          index +
          '">Remove</button>' +
          '</div>' +
          '</div>'
        );
      })
      .join('');

    addressesList.querySelectorAll('.remove-address-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var index = parseInt(this.getAttribute('data-index'), 10);
        var addresses = getStoredAddresses();
        addresses.splice(index, 1);
        saveAddresses(addresses);
        renderAddresses();
      });
    });
  }

  if (addressForm) {
    addressForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var label = document.getElementById('address-label').value.trim() || 'Home';
      var line1 = document.getElementById('address-line1').value.trim();
      var line2 = document.getElementById('address-line2').value.trim();
      var city = document.getElementById('address-city').value.trim();
      var state = document.getElementById('address-state').value.trim();
      var pincode = document.getElementById('address-pincode').value.trim();

      if (!line1 || !city || !state || !pincode) {
        alert('Please fill in required address fields.');
        return;
      }

      var addresses = getStoredAddresses();
      addresses.push({
        label: label,
        line1: line1,
        line2: line2,
        city: city,
        state: state,
        pincode: pincode
      });
      saveAddresses(addresses);
      addressForm.reset();
      addressForm.style.display = 'none';
      renderAddresses();
      if (addressesEmpty) addressesEmpty.style.display = 'none';
      addressesList.style.display = 'flex';
      alert('Address saved.');
    });
  }

  if (addressesList) renderAddresses();
});
