/**
 * Admin panel - Dashboard stats, products (add/edit/delete/stock), categories, orders, messages
 */
document.addEventListener('DOMContentLoaded', function () {
  var forbidden = document.getElementById('adminForbidden');
  var content = document.getElementById('adminContent');
  var editingProductId = null;
  var editingCouponId = null;
  var editingBlogPostId = null;

  var SITE_PRODUCTS = [
    { name: 'Artisan Coffee Mug', description: 'Matte finish, 300 ml', price: 1100, image: 'imgs/img1.jpeg', categoryId: 'mugs' },
    { name: 'Minimal White Cup', description: 'Porcelain, 220 ml', price: 950, image: 'imgs/img2.jpeg', categoryId: 'mugs' },
    { name: 'Speckled Mug', description: 'Hand-painted rim', price: 1050, image: 'imgs/img3.jpeg', categoryId: 'mugs' },
    { name: 'Serving Bowl', description: 'Ocean glaze', price: 1200, image: 'imgs/img1.jpeg', categoryId: 'bowls' },
    { name: 'Ramen Bowl', description: 'Deep, wide shape', price: 1150, image: 'imgs/img2.jpeg', categoryId: 'bowls' },
    { name: 'Dinner Plate', description: 'Set of 2', price: 1000, image: 'imgs/img3.jpeg', categoryId: 'plates' },
    { name: 'Side Plate', description: 'Hand glazed', price: 750, image: 'imgs/img4.jpeg', categoryId: 'plates' },
    { name: 'Storage Jar', description: 'Airtight lid', price: 950, image: 'imgs/img1.jpeg', categoryId: 'jars' },
    { name: 'Cookie Jar', description: 'Hand-painted', price: 1050, image: 'imgs/img2.jpeg', categoryId: 'jars' },
    { name: 'Terracotta Ashtray', description: 'Outdoor safe', price: 800, image: 'imgs/img3.jpeg', categoryId: 'ashtrays' },
    { name: 'Glazed Ashtray', description: 'High gloss', price: 850, image: 'imgs/img4.jpeg', categoryId: 'ashtrays' },
    { name: 'Latte Coffee Mug', description: 'Handcrafted stoneware', price: 1250, image: 'imgs/img1.jpeg', categoryId: 'mugs' }
  ];

  var INITIAL_BLOG_POSTS = [
    {
      id: 'mastering-wheel-throwing',
      title: 'Mastering the Art of Wheel Throwing',
      category: 'Techniques',
      thumbnail: 'imgs/img1.jpeg',
      excerpt: 'Learn the fundamentals of wheel throwing and discover how to create beautiful, symmetrical ceramic pieces from raw clay. This comprehensive guide covers everything from centering to trimming.',
      content: 'Learn the fundamentals of wheel throwing and discover how to create beautiful, symmetrical ceramic pieces from raw clay. This comprehensive guide covers everything from centering to trimming.',
      date: new Date(2026, 1, 5) // February 5, 2026
    },
    {
      id: 'understanding-glaze-chemistry',
      title: 'Understanding Glaze Chemistry',
      category: 'Glazing',
      thumbnail: 'imgs/img2.jpeg',
      excerpt: 'Dive deep into the science behind ceramic glazes. Understand how different minerals and oxides create unique colors and textures, and learn to mix your own custom glazes.',
      content: 'Dive deep into the science behind ceramic glazes. Understand how different minerals and oxides create unique colors and textures, and learn to mix your own custom glazes.',
      date: new Date(2026, 0, 28) // January 28, 2026
    },
    {
      id: 'day-in-our-studio',
      title: 'A Day in Our Pottery Studio',
      category: 'Studio',
      thumbnail: 'imgs/img3.jpeg',
      excerpt: 'Take a behind-the-scenes look at our daily operations. From morning clay preparation to evening kiln firing, discover what goes into creating each handcrafted piece.',
      content: 'Take a behind-the-scenes look at our daily operations. From morning clay preparation to evening kiln firing, discover what goes into creating each handcrafted piece.',
      date: new Date(2026, 0, 20) // January 20, 2026
    },
    {
      id: 'caring-ceramic-collection',
      title: 'Caring for Your Ceramic Collection',
      category: 'Care Guide',
      thumbnail: 'imgs/img4.jpeg',
      excerpt: 'Essential tips for maintaining your ceramic pieces. Learn proper cleaning methods, storage techniques, and how to preserve the beauty of your pottery for years to come.',
      content: 'Essential tips for maintaining your ceramic pieces. Learn proper cleaning methods, storage techniques, and how to preserve the beauty of your pottery for years to come.',
      date: new Date(2026, 0, 15) // January 15, 2026
    },
    {
      id: 'hand-building-vs-wheel-throwing',
      title: 'Hand Building vs. Wheel Throwing',
      category: 'Techniques',
      thumbnail: 'imgs/img1.jpeg',
      excerpt: 'Explore the differences between hand building and wheel throwing techniques. Discover which method suits your creative style and learn when to use each approach.',
      content: 'Explore the differences between hand building and wheel throwing techniques. Discover which method suits your creative style and learn when to use each approach.',
      date: new Date(2026, 0, 10) // January 10, 2026
    },
    {
      id: 'firing-process-explained',
      title: 'The Firing Process Explained',
      category: 'Firing',
      thumbnail: 'imgs/img2.jpeg',
      excerpt: 'Understanding the kiln firing process is crucial for any potter. Learn about bisque firing, glaze firing, temperature control, and how firing affects your final pieces.',
      content: 'Understanding the kiln firing process is crucial for any potter. Learn about bisque firing, glaze firing, temperature control, and how firing affects your final pieces.',
      date: new Date(2026, 0, 5) // January 5, 2026
    }
  ];

  function checkAdmin() {
    if (typeof auth === 'undefined' || !auth) {
      window.location.href = 'signin.html?redirect=admin.html';
      return;
    }
    // Wait for auth state to be ready (avoids redirecting before session is restored after login)
    auth.onAuthStateChanged(function (user) {
      if (!user) {
        window.location.href = 'signin.html?redirect=admin.html';
        return;
      }
      if (typeof getUserRole !== 'function') {
        if (forbidden) forbidden.style.display = 'block';
        if (content) content.style.display = 'none';
        return;
      }
      getUserRole(function (role) {
        if (role !== 'admin') {
          if (forbidden) forbidden.style.display = 'block';
          if (content) content.style.display = 'none';
        } else {
          if (forbidden) forbidden.style.display = 'none';
          if (content) content.style.display = 'block';
          var u = auth.currentUser;
          var greetingEl = document.getElementById('adminProfileDropdownName');
          if (greetingEl && u && u.displayName && u.displayName.trim()) greetingEl.textContent = u.displayName.trim();
          else if (greetingEl) greetingEl.textContent = 'Admin';
          loadDashboard();
          loadProducts();
          loadCategories();
          loadOrders();
          loadContactMessages();
          loadReviews();
        }
      });
    });
  }

  (function setupAdminProfileDropdown() {
    var trigger = document.getElementById('adminProfileDropdownTrigger');
    var menu = document.getElementById('adminProfileDropdownMenu');
    var logoutBtn = document.getElementById('adminProfileDropdownLogout');
    var changePwLink = document.getElementById('adminDropdownChangePassword');
    var updateEmailLink = document.getElementById('adminDropdownUpdateEmail');
    if (trigger && menu) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        menu.classList.toggle('is-open');
      });
      document.addEventListener('click', function (e) {
        if (menu.classList.contains('is-open') && !menu.contains(e.target) && !trigger.contains(e.target)) {
          menu.classList.remove('is-open');
        }
      });
    }
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (menu) menu.classList.remove('is-open');
        if (typeof signOut === 'function') signOut();
        else window.location.href = 'signin.html';
      });
    }
    if (changePwLink) {
      changePwLink.addEventListener('click', function (e) {
        e.preventDefault();
        if (menu) menu.classList.remove('is-open');
        openChangePasswordModal();
      });
    }
    if (updateEmailLink) {
      updateEmailLink.addEventListener('click', function (e) {
        e.preventDefault();
        if (menu) menu.classList.remove('is-open');
        openUpdateEmailModal();
      });
    }
    var myProfileLink = document.getElementById('adminDropdownMyProfile');
    if (myProfileLink) {
      myProfileLink.addEventListener('click', function (e) {
        e.preventDefault();
        if (menu) menu.classList.remove('is-open');
        switchToTab('profile');
      });
    }
  })();

  function openChangePasswordModal() {
    var modal = document.getElementById('adminChangePasswordModal');
    var form = document.getElementById('adminChangePasswordForm');
    var statusEl = document.getElementById('adminChangePasswordStatus');
    if (!modal || !form) return;
    form.reset();
    if (statusEl) { statusEl.textContent = ''; statusEl.className = 'admin-form-status'; }
    modal.classList.add('admin-reply-modal-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeChangePasswordModal() {
    var modal = document.getElementById('adminChangePasswordModal');
    if (modal) {
      modal.classList.remove('admin-reply-modal-open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function openUpdateEmailModal() {
    var modal = document.getElementById('adminUpdateEmailModal');
    var form = document.getElementById('adminUpdateEmailForm');
    var statusEl = document.getElementById('adminUpdateEmailStatus');
    var emailInput = document.getElementById('adminUpdateEmailNew');
    if (!modal || !form) return;
    form.reset();
    if (statusEl) { statusEl.textContent = ''; statusEl.className = 'admin-form-status'; }
    if (auth && auth.currentUser && auth.currentUser.email && emailInput) emailInput.placeholder = auth.currentUser.email;
    modal.classList.add('admin-reply-modal-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeUpdateEmailModal() {
    var modal = document.getElementById('adminUpdateEmailModal');
    if (modal) {
      modal.classList.remove('admin-reply-modal-open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  (function setupAdminChangePasswordModal() {
    var modal = document.getElementById('adminChangePasswordModal');
    var backdrop = document.getElementById('adminChangePasswordModalBackdrop');
    var cancelBtn = document.getElementById('adminChangePasswordCancel');
    var form = document.getElementById('adminChangePasswordForm');
    var statusEl = document.getElementById('adminChangePasswordStatus');
    if (backdrop) backdrop.addEventListener('click', closeChangePasswordModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeChangePasswordModal);
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var current = document.getElementById('adminChangePasswordCurrent').value;
        var newPass = document.getElementById('adminChangePasswordNew').value;
        var confirmPass = document.getElementById('adminChangePasswordConfirm').value;
        if (newPass !== confirmPass) {
          if (statusEl) { statusEl.textContent = 'New password and confirm do not match.'; statusEl.className = 'admin-form-status admin-form-status-error'; }
          return;
        }
        if (newPass.length < 6) {
          if (statusEl) { statusEl.textContent = 'New password must be at least 6 characters.'; statusEl.className = 'admin-form-status admin-form-status-error'; }
          return;
        }
        var user = auth && auth.currentUser;
        if (!user || !user.email) {
          if (statusEl) { statusEl.textContent = 'Not signed in.'; statusEl.className = 'admin-form-status admin-form-status-error'; }
          return;
        }
        if (statusEl) { statusEl.textContent = 'Updating…'; statusEl.className = 'admin-form-status'; }
        var credential = firebase.auth.EmailAuthProvider.credential(user.email, current);
        user.reauthenticateWithCredential(credential).then(function () {
          return user.updatePassword(newPass);
        }).then(function () {
          if (statusEl) { statusEl.textContent = 'Password updated.'; statusEl.className = 'admin-form-status admin-form-status-success'; }
          form.reset();
          setTimeout(closeChangePasswordModal, 1200);
        }).catch(function (err) {
          if (statusEl) { statusEl.textContent = err.message || 'Failed to update password.'; statusEl.className = 'admin-form-status admin-form-status-error'; }
        });
      });
    }
  })();

  (function setupAdminUpdateEmailModal() {
    var modal = document.getElementById('adminUpdateEmailModal');
    var backdrop = document.getElementById('adminUpdateEmailModalBackdrop');
    var cancelBtn = document.getElementById('adminUpdateEmailCancel');
    var form = document.getElementById('adminUpdateEmailForm');
    var statusEl = document.getElementById('adminUpdateEmailStatus');
    if (backdrop) backdrop.addEventListener('click', closeUpdateEmailModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeUpdateEmailModal);
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var newEmail = document.getElementById('adminUpdateEmailNew').value.trim();
        var password = document.getElementById('adminUpdateEmailPassword').value;
        var user = auth && auth.currentUser;
        if (!user || !user.email) {
          if (statusEl) { statusEl.textContent = 'Not signed in.'; statusEl.className = 'admin-form-status admin-form-status-error'; }
          return;
        }
        if (!newEmail) {
          if (statusEl) { statusEl.textContent = 'Enter a new email.'; statusEl.className = 'admin-form-status admin-form-status-error'; }
          return;
        }
        if (statusEl) { statusEl.textContent = 'Updating…'; statusEl.className = 'admin-form-status'; }
        var credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
        user.reauthenticateWithCredential(credential).then(function () {
          return user.updateEmail(newEmail);
        }).then(function () {
          if (statusEl) { statusEl.textContent = 'Email updated. You may need to sign in again.'; statusEl.className = 'admin-form-status admin-form-status-success'; }
          form.reset();
          setTimeout(function () { closeUpdateEmailModal(); signOut(); }, 1500);
        }).catch(function (err) {
          if (statusEl) { statusEl.textContent = err.message || 'Failed to update email.'; statusEl.className = 'admin-form-status admin-form-status-error'; }
        });
      });
    }
  })();

  function loadDashboard() {
    if (!db) return;
    var statTotalOrders = document.getElementById('statTotalOrders');
    var statPendingOrders = document.getElementById('statPendingOrders');
    var statTotalProducts = document.getElementById('statTotalProducts');
    var statLowStock = document.getElementById('statLowStock');
    var statMessages = document.getElementById('statMessages');
    var statReviews = document.getElementById('statReviews');
    var statTotalRevenue = document.getElementById('statTotalRevenue');
    var statRevenueThisMonth = document.getElementById('statRevenueThisMonth');
    var statTransactions = document.getElementById('statTransactions');

    Promise.all([
      db.collection('orders').get(),
      db.collection('orders').where('status', '==', 'pending').get(),
      db.collection('products').get(),
      db.collection('contact_messages').get(),
      db.collection('reviews').get()
    ]).then(function (results) {
      var allOrders = results[0];
      var pendingOrders = results[1];
      var products = results[2];
      var messages = results[3];
      var reviewsSnap = results[4];
      var lowStock = 0;
      var lowStockItems = [];
      products.docs.forEach(function (d) {
        var data = d.data();
        var s = data.stock;
        if (typeof s === 'number' && s <= 5) {
          lowStock++;
          lowStockItems.push({ name: data.name || d.id || 'Unnamed', stock: s });
        }
      });
      lowStockItems.sort(function (a, b) { return a.stock - b.stock; });
      if (statTotalOrders) statTotalOrders.textContent = allOrders.size;
      if (statPendingOrders) statPendingOrders.textContent = pendingOrders.size;
      if (statTotalProducts) statTotalProducts.textContent = products.size;
      if (statLowStock) statLowStock.textContent = lowStock;
      if (statMessages) statMessages.textContent = messages.size;
      if (statReviews) statReviews.textContent = reviewsSnap.size;
      var totalRevenue = 0;
      var revenueThisMonth = 0;
      var now = new Date();
      var currentYear = now.getFullYear();
      var currentMonth = now.getMonth();
      allOrders.docs.forEach(function (d) {
        var data = d.data();
        var orderTotal = typeof data.total === 'number' ? data.total : 0;
        totalRevenue += orderTotal;
        var created = data.createdAt;
        if (created && created.toDate) {
          var dt = created.toDate();
          if (dt.getFullYear() === currentYear && dt.getMonth() === currentMonth) revenueThisMonth += orderTotal;
        }
      });
      function formatRevenue(n) {
        if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
        return '₹' + (n || 0).toLocaleString('en-IN');
      }
      if (statTotalRevenue) statTotalRevenue.textContent = formatRevenue(totalRevenue);
      if (statRevenueThisMonth) statRevenueThisMonth.textContent = formatRevenue(revenueThisMonth);
      if (statTransactions) statTransactions.textContent = allOrders.size;
      var lowStockListEl = document.getElementById('adminLowStockList');
      if (lowStockListEl) {
        if (lowStockItems.length === 0) {
          lowStockListEl.innerHTML = '<p class="admin-empty">No low stock products.</p>';
        } else {
          var esc = function (s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
          lowStockListEl.innerHTML = lowStockItems.map(function (item) {
            var left = item.stock === 0 ? '0 left' : item.stock + ' left';
            return '<div class="admin-low-stock-item" role="listitem">' + esc(item.name) + ' – ' + left + '</div>';
          }).join('');
        }
      }
    }).catch(function () {
      if (statTotalOrders) statTotalOrders.textContent = '0';
      if (statPendingOrders) statPendingOrders.textContent = '0';
      if (statTotalProducts) statTotalProducts.textContent = '0';
      if (statLowStock) statLowStock.textContent = '0';
      if (statMessages) statMessages.textContent = '0';
      if (statReviews) statReviews.textContent = '0';
      if (statTotalRevenue) statTotalRevenue.textContent = '₹0';
      if (statRevenueThisMonth) statRevenueThisMonth.textContent = '₹0';
      if (statTransactions) statTransactions.textContent = '0';
      var lowStockListEl = document.getElementById('adminLowStockList');
      if (lowStockListEl) lowStockListEl.innerHTML = '<p class="admin-empty">Unable to load.</p>';
    });
  }

  function downloadDetailReport() {
    if (!db || typeof XLSX === 'undefined') {
      alert('Excel export requires SheetJS. Check your connection.');
      return;
    }
    var btn = document.getElementById('adminDownloadDetailReport');
    if (btn) { btn.disabled = true; btn.textContent = 'Preparing…'; }
    db.collection('orders').get().then(function (snap) {
      var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var byMonth = {};
      var productSummary = {};
      var lineItemRows = [['Order ID', 'Order Date', 'Customer', 'Status', 'Product ID', 'Product Name', 'Quantity', 'Unit Price (₹)', 'Line Total (₹)', 'Order Total (₹)']];
      snap.docs.forEach(function (d) {
        var orderId = d.id;
        var data = d.data();
        var orderTotal = typeof data.total === 'number' ? data.total : 0;
        var status = data.status || 'pending';
        var customer = (data.userName || data.userEmail || '').toString().trim() || (data.userEmail || '');
        var created = data.createdAt;
        var orderDateStr = '';
        var monthKey = '';
        var monthLabel = '';
        if (created && created.toDate) {
          var dt = created.toDate();
          orderDateStr = dt.toISOString().slice(0, 19).replace('T', ' ');
          var y = dt.getFullYear();
          var m = dt.getMonth();
          monthKey = y + '-' + String(m + 1).padStart(2, '0');
          monthLabel = monthNames[m] + ' ' + y;
        } else {
          orderDateStr = '—';
          monthKey = 'Other';
          monthLabel = 'Other';
        }
        if (!byMonth[monthKey]) byMonth[monthKey] = { label: monthLabel, orders: 0, revenue: 0 };
        byMonth[monthKey].orders += 1;
        byMonth[monthKey].revenue += orderTotal;
        var items = data.items || [];
        if (items.length === 0) {
          lineItemRows.push([orderId, orderDateStr, customer, status, '', '(no items)', 0, 0, 0, orderTotal]);
        } else {
          items.forEach(function (it) {
            var pid = it.id || '';
            var pname = (it.name || 'Unknown').toString();
            var qty = typeof it.quantity === 'number' ? it.quantity : 0;
            var price = typeof it.price === 'number' ? it.price : 0;
            var lineTotal = qty * price;
            lineItemRows.push([orderId, orderDateStr, customer, status, pid, pname, qty, price, lineTotal, orderTotal]);
            if (pid) {
              if (!productSummary[pid]) productSummary[pid] = { name: pname, qty: 0, revenue: 0 };
              productSummary[pid].qty += qty;
              productSummary[pid].revenue += lineTotal;
            }
          });
        }
      });
      var productRows = [['Product ID', 'Product Name', 'Total Quantity Sold', 'Revenue (₹)']];
      var pids = Object.keys(productSummary).sort();
      pids.forEach(function (pid) {
        var p = productSummary[pid];
        productRows.push([pid, p.name, p.qty, p.revenue]);
      });
      if (pids.length === 0) productRows.push(['No products sold', '', 0, 0]);
      var monthKeys = Object.keys(byMonth).sort().reverse();
      var monthRows = [['Month', 'Number of Orders', 'Revenue (₹)']];
      monthKeys.forEach(function (k) {
        var r = byMonth[k];
        monthRows.push([r.label, r.orders, r.revenue]);
      });
      if (monthKeys.length === 0) monthRows.push(['No orders', 0, 0]);
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(lineItemRows), 'Order line items');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(productRows), 'Product summary');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(monthRows), 'Monthly revenue');
      var fileName = 'purchases-revenue-detail-' + new Date().toISOString().slice(0, 10) + '.xlsx';
      XLSX.writeFile(wb, fileName);
      if (btn) { btn.disabled = false; btn.textContent = 'Download detail report – purchases & revenue (.xlsx)'; }
    }).catch(function (err) {
      alert('Could not generate report: ' + (err.message || 'Please try again.'));
      if (btn) { btn.disabled = false; btn.textContent = 'Download detail report – purchases & revenue (.xlsx)'; }
    });
  }

  document.getElementById('adminDownloadDetailReport').addEventListener('click', function () {
    downloadDetailReport();
  });

  function loadProducts() {
    if (!db) return;
    var list = document.getElementById('adminProductsList');
    if (!list) return;
    list.innerHTML = '<p class="admin-empty">Loading products…</p>';
    db.collection('products').get().then(function (snap) {
      var docs = snap.docs.slice();
      docs.sort(function (a, b) {
        var na = (a.data().name || a.id || '').toLowerCase();
        var nb = (b.data().name || b.id || '').toLowerCase();
        return na.localeCompare(nb);
      });
      if (docs.length === 0) {
        list.innerHTML = '<p class="admin-empty">No products yet. Use "Add Product" or "Import site products" above.</p>';
        return;
      }
      list.innerHTML = docs.map(function (d) {
        var data = d.data();
        var id = d.id;
        var stock = typeof data.stock === 'number' ? data.stock : 0;
        var available = stock > 0 ? 'In stock' : 'Out of stock';
        var stockClass = stock <= 5 ? 'admin-stock-low' : 'admin-stock-ok';
        var imgSrc = (data.image || 'imgs/img1.jpeg').replace(/"/g, '&quot;');
        var imgAlt = (data.name || id).replace(/"/g, '&quot;');
        return '<div class="admin-item admin-product-row">' +
          '<img class="admin-product-thumb" src="' + imgSrc + '" alt="' + imgAlt + '" loading="lazy">' +
          '<span class="admin-product-name">' + (data.name || id) + '</span>' +
          ' <span class="admin-product-price">₹' + (data.price || 0) + '</span>' +
          ' <span class="admin-product-stock ' + stockClass + '">Stock: ' + stock + ' (' + available + ')</span>' +
          ' <button type="button" class="btn btn-sm" data-id="' + id + '" data-action="edit-stock">Edit stock</button>' +
          ' <button type="button" class="btn btn-sm" data-id="' + id + '" data-action="edit-product">Edit</button>' +
          ' <button type="button" class="btn btn-sm btn-outline" data-id="' + id + '" data-action="delete-product">Delete</button>' +
          '</div>';
      }).join('');
      list.querySelectorAll('[data-action="delete-product"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (confirm('Delete this product?')) {
            db.collection('products').doc(btn.getAttribute('data-id')).delete()
              .then(function () { loadProducts(); loadDashboard(); });
          }
        });
      });
      list.querySelectorAll('[data-action="edit-stock"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-id');
          var newStock = prompt('New stock quantity (number):');
          if (newStock === null) return;
          var num = parseInt(newStock, 10);
          if (isNaN(num) || num < 0) {
            alert('Enter a valid number (0 or more).');
            return;
          }
          db.collection('products').doc(id).update({ stock: num })
            .then(function () { loadProducts(); loadDashboard(); });
        });
      });
      list.querySelectorAll('[data-action="edit-product"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-id');
          openProductModal(id);
        });
      });
    }).catch(function (err) {
      console.error('Products load error:', err);
      list.innerHTML = '<p class="admin-empty">Unable to load products. Check Firestore connection and rules.</p>';
    });
  }

  function loadCategories() {
    if (!db) return;
    var list = document.getElementById('adminCategoriesList');
    if (!list) return;
    list.innerHTML = '<p class="admin-empty">Loading categories…</p>';
    db.collection('categories').get().then(function (snap) {
      var docs = snap.docs.slice();
      docs.sort(function (a, b) {
        var na = (a.data().name || a.id || '').toLowerCase();
        var nb = (b.data().name || b.id || '').toLowerCase();
        return na.localeCompare(nb);
      });
      if (docs.length === 0) {
        list.innerHTML = '<p class="admin-empty">No categories yet. Add one with the button above.</p>';
        return;
      }
      list.innerHTML = docs.map(function (d) {
        var data = d.data();
        var name = data.name || d.id;
        var esc = function (s) { return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;'); };
        return '<div class="admin-item">' +
          '<span class="admin-category-name">' + (name || '') + '</span>' +
          ' <button type="button" class="btn btn-sm" data-id="' + d.id + '" data-name="' + esc(name) + '" data-action="edit-category">Edit</button>' +
          ' <button type="button" class="btn btn-sm btn-outline" data-id="' + d.id + '" data-action="delete-category">Delete</button></div>';
      }).join('');
      list.querySelectorAll('[data-action="delete-category"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (confirm('Delete this category?')) {
            db.collection('categories').doc(btn.getAttribute('data-id')).delete().then(function () { loadCategories(); });
          }
        });
      });
      list.querySelectorAll('[data-action="edit-category"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-id');
          var currentName = btn.getAttribute('data-name') || '';
          var newName = prompt('Category name:', currentName);
          if (newName === null) return;
          newName = newName.trim();
          if (!newName) {
            alert('Name cannot be empty.');
            return;
          }
          db.collection('categories').doc(id).update({ name: newName }).then(function () { loadCategories(); });
        });
      });
    }).catch(function (err) {
      console.error('Categories load error:', err);
      list.innerHTML = '<p class="admin-empty">Unable to load categories. Check Firestore connection and rules.</p>';
    });
  }

  function getOrderPaymentStatus(data) {
    var refundStatus = data.refundStatus || 'none';
    if (refundStatus === 'refunded' || refundStatus === 'partial_refunded') return 'Refunded';
    if (data.status === 'paid' || (data.stripeSessionId && data.stripeSessionId.length > 0)) return 'Paid';
    return 'Unpaid';
  }

  function buildOrderRow(doc, opts) {
    opts = opts || {};
    var data = doc.data();
    var id = doc.id;
    var esc = function (s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
    var status = data.status || 'pending';
    var total = typeof data.total === 'number' ? data.total : 0;
    var customer = (data.userName || data.userEmail || '').toString().trim() || (data.userEmail || '') || '—';
    var dateStr = '—';
    if (data.createdAt && data.createdAt.toDate) {
      var dt = data.createdAt.toDate();
      dateStr = dt.toISOString().slice(0, 16).replace('T', ' ');
    }
    var paymentStatus = getOrderPaymentStatus(data);
    var paymentClass = paymentStatus.toLowerCase();
    /* Order status = fulfillment only. Payment status (Paid/Unpaid/Refunded) is separate. */
    var orderStatusOpts = [
      { v: 'pending', l: 'Pending' },
      { v: 'confirmed', l: 'Confirmed' },
      { v: 'shipped', l: 'Shipped' },
      { v: 'delivered', l: 'Delivered' },
      { v: 'cancelled', l: 'Cancelled' }
    ];
    var orderStatusForDropdown = (status === 'pending_payment' || status === 'paid') ? 'pending' : status;
    if (orderStatusOpts.every(function (o) { return o.v !== orderStatusForDropdown; })) orderStatusForDropdown = 'pending';
    var orderStatusSelect = orderStatusOpts.map(function (o) {
      return '<option value="' + o.v + '"' + (orderStatusForDropdown === o.v ? ' selected' : '') + '>' + o.l + '</option>';
    }).join('');
    var refundStatus = data.refundStatus || 'none';
    var refundOpts = [
      { v: 'none', l: 'No refund' },
      { v: 'requested', l: 'Requested' },
      { v: 'partial_refunded', l: 'Partial refund' },
      { v: 'refunded', l: 'Refunded' }
    ].map(function (o) {
      return '<option value="' + o.v + '"' + (refundStatus === o.v ? ' selected' : '') + '>' + o.l + '</option>';
    }).join('');
    var isPaid = paymentStatus === 'Paid' || paymentStatus === 'Refunded';
    var row = '<div class="admin-order-card" data-order-id="' + esc(id) + '">' +
      '<div class="admin-order-card-main">' +
      '<span class="admin-order-col admin-order-id-col" data-label="Order ID">#' + esc(id.length > 10 ? id.slice(0, 10) : id) + '</span>' +
      '<span class="admin-order-col admin-order-customer-col" data-label="Customer">' + esc(customer) + '</span>' +
      '<span class="admin-order-col admin-order-date-col" data-label="Date/Time">' + dateStr + '</span>' +
      '<span class="admin-order-col admin-order-total-col" data-label="Total">₹' + total + '</span>' +
      '<span class="admin-order-col admin-order-payment-col" data-label="Payment status">' +
      '<span class="admin-order-badge admin-order-payment-' + paymentClass + '">' + paymentStatus + '</span></span>';
    if (opts.showOrderStatusDropdown) {
      row += '<span class="admin-order-col admin-order-status-col" data-label="Order status">' +
        '<select data-id="' + esc(id) + '" class="admin-order-status-select" aria-label="Order status">' + orderStatusSelect + '</select></span>';
    } else {
      var orderStatusLabel = orderStatusForDropdown === 'pending' ? 'Pending' : orderStatusOpts.filter(function (o) { return o.v === orderStatusForDropdown; })[0];
      row += '<span class="admin-order-col admin-order-status-col" data-label="Order status">' + (orderStatusLabel ? esc(orderStatusLabel.l) : esc(orderStatusForDropdown)) + '</span>';
    }
    row += '<span class="admin-order-col admin-order-actions-col" data-label="Actions">';
    if (opts.showViewExpand) {
      row += '<button type="button" class="btn btn-sm admin-order-view-btn" data-id="' + esc(id) + '" aria-expanded="false">View</button> ';
    }
    if (opts.showOrderStatusDropdown) {
      row += '<span class="admin-order-action-hint">Update: use dropdown above</span> ';
    }
    if (opts.showRefundDropdown && isPaid) {
      row += '<select data-id="' + esc(id) + '" class="admin-order-refund-select" aria-label="Refund status">' + refundOpts + '</select>';
    } else if (opts.showViewOrderButton) {
      row += '<button type="button" class="btn btn-sm admin-order-view-order-btn" data-tab="orders" data-action="view-order">View order</button>';
    }
    row += '</span></div>';
    if (opts.showViewExpand) {
      var items = data.items || [];
      var itemsHtml = items.length ? items.map(function (it) {
        var qty = typeof it.quantity === 'number' ? it.quantity : 0;
        var price = typeof it.price === 'number' ? it.price : 0;
        return '<li>' + esc(it.name || 'Item') + ' × ' + qty + ' — ₹' + (qty * price) + '</li>';
      }).join('') : '<li>No items</li>';
      var giftNote = data.giftNote && String(data.giftNote).trim();
      var shipping = data.shipping || {};
      var addr = [shipping.address, shipping.city, shipping.state, shipping.pincode].filter(Boolean).join(', ');
      row += '<div class="admin-order-card-detail" id="admin-order-detail-' + esc(id) + '" hidden>' +
        '<div class="admin-order-detail-section"><strong>Items</strong><ul class="admin-order-detail-items">' + itemsHtml + '</ul></div>' +
        (giftNote ? '<div class="admin-order-detail-section"><strong>Gift note</strong><p>' + esc(giftNote).replace(/\n/g, '<br>') + '</p></div>' : '') +
        (addr ? '<div class="admin-order-detail-section"><strong>Shipping</strong><p>' + esc(shipping.name || '') + ' — ' + esc(addr) + '</p></div>' : '') +
        '</div>';
    }
    row += '</div>';
    return row;
  }

  function loadOrders() {
    if (!db) return;
    var list = document.getElementById('adminOrdersList');
    if (!list) return;
    list.innerHTML = '<p class="admin-empty">Loading orders…</p>';
    var ref = db.collection('orders').orderBy('createdAt', 'desc').limit(100);
    ref.get().then(function (snap) {
      if (snap.empty) {
        list.innerHTML = '<p class="admin-empty">No orders yet.</p>';
        return;
      }
      var header = '<div class="admin-orders-header admin-order-card">' +
        '<span class="admin-order-col admin-order-id-col">Order ID</span>' +
        '<span class="admin-order-col admin-order-customer-col">Customer</span>' +
        '<span class="admin-order-col admin-order-date-col">Date/Time</span>' +
        '<span class="admin-order-col admin-order-total-col">Total</span>' +
        '<span class="admin-order-col admin-order-payment-col">Payment status</span>' +
        '<span class="admin-order-col admin-order-status-col">Order status</span>' +
        '<span class="admin-order-col admin-order-actions-col">Actions</span>' +
        '</div>';
      list.innerHTML = header + snap.docs.map(function (d) {
        return buildOrderRow(d, { showOrderStatusDropdown: true, showRefundDropdown: true, showViewExpand: true });
      }).join('');
      list.querySelectorAll('.admin-order-status-select').forEach(function (sel) {
        sel.addEventListener('change', function () {
          var orderId = sel.getAttribute('data-id');
          var newStatus = sel.value;
          if (typeof firestoreService !== 'undefined' && firestoreService.updateOrderStatus) {
            firestoreService.updateOrderStatus(orderId, newStatus).then(function () { loadOrders(); loadDashboard(); });
          } else {
            db.collection('orders').doc(orderId).update({ status: newStatus }).then(function () { loadOrders(); loadDashboard(); });
          }
        });
      });
      list.querySelectorAll('.admin-order-refund-select').forEach(function (sel) {
        sel.addEventListener('change', function () {
          var orderId = sel.getAttribute('data-id');
          var value = sel.value;
          var payload = { refundStatus: value };
          if (value === 'refunded' || value === 'partial_refunded') {
            payload.refundedAt = firebase.firestore.FieldValue.serverTimestamp();
          }
          db.collection('orders').doc(orderId).update(payload).then(function () { loadOrders(); loadDashboard(); loadRefunds(); }).catch(function (err) {
            alert('Failed to update refund status: ' + (err.message || 'Please try again.'));
          });
        });
      });
      list.querySelectorAll('.admin-order-view-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-id');
          var detail = document.getElementById('admin-order-detail-' + id);
          if (!detail) return;
          var isHidden = detail.hidden;
          detail.hidden = !isHidden;
          btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
          btn.textContent = isHidden ? 'Hide' : 'View';
        });
      });
    }).catch(function (err) {
      list.innerHTML = '<p class="admin-empty">Unable to load orders. Check Firestore indexes for "orders" collection (orderBy createdAt).</p>';
    });
  }

  function loadPaymentSettings() {
    if (!db) return;
    var stripeCb = document.getElementById('adminPaymentStripe');
    var statusEl = document.getElementById('adminPaymentMethodsStatus');
    if (!stripeCb) return;
    db.collection('settings').doc('payment_methods').get().then(function (doc) {
      var data = doc.exists ? doc.data() : {};
      stripeCb.checked = data.stripeEnabled !== false;
    }).catch(function () {
      stripeCb.checked = true;
    });
    stripeCb.onchange = function () {
      var statusEl = document.getElementById('adminPaymentMethodsStatus');
      if (statusEl) { statusEl.textContent = 'Saving…'; statusEl.className = 'admin-form-status'; }
      db.collection('settings').doc('payment_methods').set({ stripeEnabled: stripeCb.checked, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true })
        .then(function () {
          if (statusEl) { statusEl.textContent = 'Saved.'; statusEl.className = 'admin-form-status admin-form-status-success'; setTimeout(function () { statusEl.textContent = ''; }, 2000); }
        })
        .catch(function (err) {
          if (statusEl) { statusEl.textContent = 'Failed to save: ' + (err.message || 'Check Firestore rules.'); statusEl.className = 'admin-form-status admin-form-status-error'; }
        });
    };
  }

  function loadTransactions() {
    if (!db) return;
    var list = document.getElementById('adminTransactionsList');
    if (!list) return;
    list.innerHTML = '<p class="admin-empty">Loading transactions…</p>';
    db.collection('orders').orderBy('createdAt', 'desc').limit(100).get().then(function (snap) {
      if (snap.empty) {
        list.innerHTML = '<p class="admin-empty">No transactions yet.</p>';
        return;
      }
      var header = '<div class="admin-orders-header admin-order-card">' +
        '<span class="admin-order-col admin-order-id-col">Order ID</span>' +
        '<span class="admin-order-col admin-order-customer-col">Customer</span>' +
        '<span class="admin-order-col admin-order-date-col">Date/Time</span>' +
        '<span class="admin-order-col admin-order-total-col">Total</span>' +
        '<span class="admin-order-col admin-order-payment-col">Payment status</span>' +
        '<span class="admin-order-col admin-order-status-col">Order status</span>' +
        '<span class="admin-order-col admin-order-actions-col">Actions</span>' +
        '</div>';
      list.innerHTML = header + snap.docs.map(function (d) {
        return buildOrderRow(d, { showViewOrderButton: true });
      }).join('');
      list.querySelectorAll('[data-action="view-order"], .admin-order-view-order-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var tab = btn.getAttribute('data-tab');
          if (tab) switchToTab(tab);
        });
      });
    }).catch(function (err) {
      console.error('Transactions load error:', err);
      list.innerHTML = '<p class="admin-empty">Unable to load transactions. Check Firestore connection and indexes.</p>';
    });
  }

  function loadRefunds() {
    if (!db) return;
    var list = document.getElementById('adminRefundsList');
    if (!list) return;
    list.innerHTML = '<p class="admin-empty">Loading…</p>';
    db.collection('orders').orderBy('createdAt', 'desc').limit(100).get().then(function (snap) {
      var docs = snap.docs.filter(function (d) {
        var s = d.data().status;
        return s === 'paid' || s === 'delivered' || s === 'shipped' || s === 'confirmed';
      });
      if (docs.length === 0) {
        list.innerHTML = '<p class="admin-empty">No paid orders to manage refunds for.</p>';
        return;
      }
      var esc = function (s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
      list.innerHTML = docs.map(function (d) {
        var data = d.data();
        var id = d.id;
        var total = typeof data.total === 'number' ? data.total : 0;
        var refundStatus = data.refundStatus || 'none';
        var options = ['none', 'requested', 'partial_refunded', 'refunded'].map(function (v) {
          return '<option value="' + v + '"' + (refundStatus === v ? ' selected' : '') + '>' + (v === 'none' ? 'No refund' : v.replace(/_/g, ' ')) + '</option>';
        }).join('');
        return '<div class="admin-item admin-refund-row">' +
          '<span class="admin-refund-order-id">Order #' + esc(id.slice(0, 8)) + '</span> ' +
          '₹' + total + ' ' +
          '<select data-id="' + esc(id) + '" class="admin-refund-status">' + options + '</select>' +
          '</div>';
      }).join('');
      list.querySelectorAll('.admin-refund-status').forEach(function (sel) {
        sel.addEventListener('change', function () {
          var orderId = sel.getAttribute('data-id');
          var value = sel.value;
          var payload = { refundStatus: value };
          if (value === 'refunded' || value === 'partial_refunded') {
            payload.refundedAt = firebase.firestore.FieldValue.serverTimestamp();
          }
          db.collection('orders').doc(orderId).update(payload).then(function () {
            loadRefunds();
          }).catch(function (err) {
            alert('Failed to update refund status: ' + (err.message || 'Please try again.'));
          });
        });
      });
    }).catch(function (err) {
      console.error('Refunds load error:', err);
      list.innerHTML = '<p class="admin-empty">Unable to load orders for refund management.</p>';
    });
  }

  function loadCoupons() {
    if (!db) return;
    var list = document.getElementById('adminCouponsList');
    if (!list) return;
    list.innerHTML = '<p class="admin-empty">Loading coupons…</p>';
    db.collection('coupons').get().then(function (snap) {
      var docs = snap.docs.slice();
      docs.sort(function (a, b) {
        var ca = (a.data().code || '').toLowerCase();
        var cb = (b.data().code || '').toLowerCase();
        return ca.localeCompare(cb);
      });
      if (docs.length === 0) {
        list.innerHTML = '<p class="admin-empty">No coupons yet. Click "Add coupon" to create one.</p>';
        return;
      }
      var esc = function (s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
      list.innerHTML = docs.map(function (d) {
        var data = d.data();
        var id = d.id;
        var code = data.code || id;
        var type = data.type || 'percent';
        var typeLabel = type === 'percent' ? (data.value || 0) + '% off' : type === 'fixed' ? '₹' + (data.value || 0) + ' off' : 'Free shipping';
        var minOrder = typeof data.minOrderValue === 'number' ? data.minOrderValue : 0;
        var expiryStr = '—';
        if (data.expiryDate && data.expiryDate.toDate) {
          expiryStr = data.expiryDate.toDate().toISOString().slice(0, 10);
        }
        var limit = typeof data.usageLimit === 'number' ? data.usageLimit : 0;
        var used = typeof data.usedCount === 'number' ? data.usedCount : 0;
        var limitStr = limit === 0 ? 'Unlimited' : used + ' / ' + limit;
        var firstTime = data.firstTimeOnly ? 'Yes' : 'No';
        return '<div class="admin-item admin-coupon-row">' +
          '<span class="admin-coupon-code">' + esc(code) + '</span> ' +
          '<span class="admin-coupon-type">' + typeLabel + '</span> ' +
          'Min ₹' + minOrder + ' ' +
          'Expires: ' + expiryStr + ' ' +
          'Uses: ' + limitStr + ' ' +
          'First-time only: ' + firstTime + ' ' +
          '<button type="button" class="btn btn-sm" data-id="' + esc(id) + '" data-action="edit-coupon">Edit</button>' +
          ' <button type="button" class="btn btn-sm btn-outline" data-id="' + esc(id) + '" data-action="delete-coupon">Delete</button>' +
          '</div>';
      }).join('');
      list.querySelectorAll('[data-action="edit-coupon"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          openCouponModal(btn.getAttribute('data-id'));
        });
      });
      list.querySelectorAll('[data-action="delete-coupon"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (!confirm('Delete this coupon?')) return;
          var id = btn.getAttribute('data-id');
          db.collection('coupons').doc(id).delete().then(function () { loadCoupons(); }).catch(function (err) {
            alert('Delete failed: ' + (err.message || 'Please try again.'));
          });
        });
      });
    }).catch(function (err) {
      console.error('Coupons load error:', err);
      list.innerHTML = '<p class="admin-empty">Unable to load coupons. Check Firestore connection.</p>';
    });
  }

  function openCouponModal(couponId) {
    editingCouponId = couponId || null;
    var modal = document.getElementById('adminCouponModal');
    var titleEl = document.getElementById('adminCouponModalTitle');
    var codeEl = document.getElementById('adminCouponCode');
    var typeEl = document.getElementById('adminCouponType');
    var valueEl = document.getElementById('adminCouponValue');
    var minOrderEl = document.getElementById('adminCouponMinOrder');
    var expiryEl = document.getElementById('adminCouponExpiry');
    var limitEl = document.getElementById('adminCouponUsageLimit');
    var firstTimeEl = document.getElementById('adminCouponFirstTimeOnly');
    var statusEl = document.getElementById('adminCouponFormStatus');
    if (!modal || !titleEl) return;
    titleEl.textContent = couponId ? 'Edit coupon' : 'Add coupon';
    if (!couponId) {
      codeEl.value = '';
      typeEl.value = 'percent';
      valueEl.value = '10';
      minOrderEl.value = '0';
      expiryEl.value = '';
      limitEl.value = '0';
      firstTimeEl.checked = false;
      if (statusEl) statusEl.textContent = '';
      modal.classList.add('admin-reply-modal-open');
      modal.setAttribute('aria-hidden', 'false');
      codeEl.removeAttribute('readonly');
      codeEl.focus();
      return;
    }
    db.collection('coupons').doc(couponId).get().then(function (doc) {
      if (!doc.exists) return;
      var data = doc.data();
      codeEl.value = data.code || '';
      codeEl.setAttribute('readonly', 'readonly');
      typeEl.value = data.type || 'percent';
      valueEl.value = data.value != null ? data.value : (data.type === 'percent' ? 10 : 100);
      minOrderEl.value = typeof data.minOrderValue === 'number' ? data.minOrderValue : 0;
      if (data.expiryDate && data.expiryDate.toDate) {
        expiryEl.value = data.expiryDate.toDate().toISOString().slice(0, 10);
      } else {
        expiryEl.value = '';
      }
      limitEl.value = typeof data.usageLimit === 'number' ? data.usageLimit : 0;
      firstTimeEl.checked = !!data.firstTimeOnly;
      if (statusEl) statusEl.textContent = '';
      modal.classList.add('admin-reply-modal-open');
      modal.setAttribute('aria-hidden', 'false');
      valueEl.focus();
    });
  }

  function closeCouponModal() {
    var modal = document.getElementById('adminCouponModal');
    if (modal) {
      modal.classList.remove('admin-reply-modal-open');
      modal.setAttribute('aria-hidden', 'true');
    }
    editingCouponId = null;
  }

  (function setupCouponModal() {
    var form = document.getElementById('adminCouponForm');
    var backdrop = document.getElementById('adminCouponModalBackdrop');
    var cancelBtn = document.getElementById('adminCouponCancel');
    var typeEl = document.getElementById('adminCouponType');
    var valueWrap = document.getElementById('adminCouponValueWrap');
    var valueHint = document.getElementById('adminCouponValueHint');
    if (backdrop) backdrop.addEventListener('click', closeCouponModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeCouponModal);
    function updateValueHint() {
      var t = typeEl && typeEl.value;
      if (valueHint) {
        if (t === 'percent') valueHint.textContent = 'Percent (1–100).';
        else if (t === 'fixed') valueHint.textContent = 'Amount in ₹.';
        else valueHint.textContent = 'Ignored for free shipping.';
      }
      if (valueWrap) valueWrap.style.display = t === 'free_shipping' ? 'none' : '';
    }
    if (typeEl) {
      typeEl.addEventListener('change', updateValueHint);
      updateValueHint();
    }
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var codeEl = document.getElementById('adminCouponCode');
        var typeEl = document.getElementById('adminCouponType');
        var valueEl = document.getElementById('adminCouponValue');
        var minOrderEl = document.getElementById('adminCouponMinOrder');
        var expiryEl = document.getElementById('adminCouponExpiry');
        var limitEl = document.getElementById('adminCouponUsageLimit');
        var firstTimeEl = document.getElementById('adminCouponFirstTimeOnly');
        var statusEl = document.getElementById('adminCouponFormStatus');
        var code = (codeEl && codeEl.value) ? codeEl.value.trim().toLowerCase() : '';
        if (!code) {
          if (statusEl) statusEl.textContent = 'Code is required.';
          return;
        }
        var type = (typeEl && typeEl.value) || 'percent';
        var value = parseInt(valueEl && valueEl.value ? valueEl.value : '0', 10);
        if (isNaN(value)) value = 0;
        var minOrder = parseInt(minOrderEl && minOrderEl.value ? minOrderEl.value : '0', 10);
        if (isNaN(minOrder)) minOrder = 0;
        var expiryVal = expiryEl && expiryEl.value ? expiryEl.value.trim() : '';
        var limit = parseInt(limitEl && limitEl.value ? limitEl.value : '0', 10);
        if (isNaN(limit)) limit = 0;
        var firstTime = firstTimeEl && firstTimeEl.checked;
        if (type === 'percent' && (value < 1 || value > 100)) {
          if (statusEl) statusEl.textContent = 'Percentage must be between 1 and 100.';
          return;
        }
        if (type === 'fixed' && value < 0) {
          if (statusEl) statusEl.textContent = 'Fixed amount cannot be negative.';
          return;
        }
        var payload = {
          code: code,
          type: type,
          value: value,
          minOrderValue: minOrder,
          usageLimit: limit,
          firstTimeOnly: firstTime
        };
        if (expiryVal) {
          payload.expiryDate = firebase.firestore.Timestamp.fromDate(new Date(expiryVal + 'T23:59:59'));
        }
        if (!editingCouponId) {
          payload.usedCount = 0;
          payload.createdAt = firebase.firestore.FieldValue && firebase.firestore.FieldValue.serverTimestamp ? firebase.firestore.FieldValue.serverTimestamp() : new Date();
        }
        if (editingCouponId) {
          delete payload.code;
          db.collection('coupons').doc(editingCouponId).update(payload).then(function () {
            closeCouponModal();
            loadCoupons();
            if (statusEl) statusEl.textContent = '';
          }).catch(function (err) {
            if (statusEl) statusEl.textContent = 'Update failed: ' + (err.message || 'Please try again.');
          });
        } else {
          db.collection('coupons').add(payload).then(function () {
            closeCouponModal();
            loadCoupons();
            if (statusEl) statusEl.textContent = '';
          }).catch(function (err) {
            if (statusEl) statusEl.textContent = 'Add failed: ' + (err.message || 'Please try again.');
          });
        }
      });
    }
  })();

  function loadBlogPosts() {
    if (!db) return;
    var list = document.getElementById('adminBlogList');
    var searchEl = document.getElementById('adminBlogSearch');
    var filterCatEl = document.getElementById('adminBlogFilterCategory');
    var filterStatusEl = document.getElementById('adminBlogFilterStatus');
    var sortEl = document.getElementById('adminBlogSort');
    if (!list) return;
    list.innerHTML = '<p class="admin-empty">Loading blog posts…</p>';

    var seedPromise = Promise.resolve();
    if (INITIAL_BLOG_POSTS && INITIAL_BLOG_POSTS.length && typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.Timestamp) {
      var createdAt = firebase.firestore.FieldValue && firebase.firestore.FieldValue.serverTimestamp ? firebase.firestore.FieldValue.serverTimestamp() : new Date();
      seedPromise = Promise.all(INITIAL_BLOG_POSTS.map(function (p) {
        var publishDate = p.date instanceof Date ? p.date : new Date();
        var payload = {
          title: p.title,
          category: p.category,
          author: p.author || '',
          status: 'published',
          thumbnail: p.thumbnail,
          excerpt: p.excerpt,
          content: p.content,
          publishDate: firebase.firestore.Timestamp.fromDate(publishDate),
          createdAt: createdAt
        };
        var id = p.id || undefined;
        if (id) {
          return db.collection('blog_posts').doc(id).set(payload, { merge: true });
        }
        return db.collection('blog_posts').add(payload);
      }));
    }

    seedPromise.then(function () {
      return db.collection('blog_posts').get();
    }).then(function (snap) {
      if (snap.empty && INITIAL_BLOG_POSTS && INITIAL_BLOG_POSTS.length && typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.Timestamp) {
        var adds = [];
        var createdAt = firebase.firestore.FieldValue && firebase.firestore.FieldValue.serverTimestamp ? firebase.firestore.FieldValue.serverTimestamp() : new Date();
        INITIAL_BLOG_POSTS.forEach(function (p) {
          var payload = {
            title: p.title,
            category: p.category,
            author: '',
            status: 'published',
            thumbnail: p.thumbnail,
            excerpt: p.excerpt,
            content: p.content,
            publishDate: firebase.firestore.Timestamp.fromDate(p.date),
            createdAt: createdAt
          };
          adds.push(db.collection('blog_posts').add(payload));
        });
        return Promise.all(adds).then(function () {
          loadBlogPosts();
        });
      }
      var docs = snap.docs.map(function (d) {
        var data = d.data();
        data.id = d.id;
        return data;
      });
      // Preserve currently selected category before rebuilding options
      var selectedCatValue = (filterCatEl && filterCatEl.value) ? filterCatEl.value : '';

      var categories = {};
      docs.forEach(function (d) {
        var c = (d.category || '').trim();
        if (c) categories[c] = true;
      });
      var catOpts = Object.keys(categories).sort();
      if (filterCatEl) {
        while (filterCatEl.options.length > 1) filterCatEl.remove(1);
        catOpts.forEach(function (c) {
          var opt = document.createElement('option');
          opt.value = c;
          opt.textContent = c;
          filterCatEl.appendChild(opt);
        });
        // Restore previous selection if still available
        if (selectedCatValue && catOpts.indexOf(selectedCatValue) !== -1) {
          filterCatEl.value = selectedCatValue;
        } else {
          filterCatEl.value = '';
          selectedCatValue = '';
        }
      }
      var search = (searchEl && searchEl.value) ? searchEl.value.trim().toLowerCase() : '';
      var filterCat = selectedCatValue ? selectedCatValue.trim().toLowerCase() : '';
      var filterStatus = filterStatusEl && filterStatusEl.value ? filterStatusEl.value : '';
      var sortNewest = !sortEl || sortEl.value === 'newest';
      var filtered = docs.filter(function (d) {
        var title = (d.title || '').toLowerCase();
        var categoryRaw = (d.category || '').trim();
        var category = categoryRaw.toLowerCase();
        var excerpt = (d.excerpt || '').toLowerCase();

        // Text search: match in title or category or excerpt
        if (search) {
          var haystack = title + ' ' + category + ' ' + excerpt;
          if (haystack.indexOf(search) === -1) {
            return false;
          }
        }

        // Category filter: case-insensitive exact match
        if (filterCat && category !== filterCat) return false;
        if (filterStatus && (d.status || 'draft') !== filterStatus) return false;
        return true;
      });
      filtered.sort(function (a, b) {
        var ta = (a.publishDate && a.publishDate.toDate ? a.publishDate.toDate() : (a.createdAt && a.createdAt.toDate ? a.createdAt.toDate() : new Date(0))).getTime();
        var tb = (b.publishDate && b.publishDate.toDate ? b.publishDate.toDate() : (b.createdAt && b.createdAt.toDate ? b.createdAt.toDate() : new Date(0))).getTime();
        return sortNewest ? tb - ta : ta - tb;
      });
      if (filtered.length === 0) {
        list.innerHTML = '<p class="admin-empty">No blog posts found. Add a post to get started.</p>';
        return;
      }
      var esc = function (s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
      list.innerHTML = filtered.map(function (d) {
        var id = d.id;
        var thumb = (d.thumbnail || d.image || 'imgs/img1.jpeg').replace(/"/g, '&quot;');
        var title = esc(d.title || 'Untitled');
        var category = esc((d.category || '').trim() || '—');
        var author = esc((d.author || '').trim() || '—');
        var status = (d.status || 'draft') === 'published' ? 'Published' : 'Draft';
        var statusClass = (d.status || 'draft') === 'published' ? 'admin-blog-status-published' : 'admin-blog-status-draft';
        var pubDate = '—';
        if (d.publishDate && d.publishDate.toDate) {
          pubDate = d.publishDate.toDate().toISOString().slice(0, 10);
        } else if (d.createdAt && d.createdAt.toDate) {
          pubDate = d.createdAt.toDate().toISOString().slice(0, 10);
        }
        return '<div class="admin-blog-card" data-id="' + esc(id) + '">' +
          '<div class="admin-blog-card-thumb"><img src="' + thumb + '" alt="" loading="lazy"></div>' +
          '<div class="admin-blog-card-body">' +
          '<div class="admin-blog-card-title">' + title + '</div>' +
          '<div class="admin-blog-card-meta">' +
          '<span class="admin-blog-card-category">' + category + '</span>' +
          '<span class="admin-blog-card-author">' + author + '</span>' +
          '<span class="admin-blog-badge ' + statusClass + '">' + status + '</span>' +
          '<span class="admin-blog-card-date">' + pubDate + '</span>' +
          '</div>' +
          '<div class="admin-blog-card-actions">' +
          '<button type="button" class="btn btn-sm" data-action="edit-post" data-id="' + esc(id) + '">Edit</button> ' +
          '<button type="button" class="btn btn-sm btn-outline" data-action="delete-post" data-id="' + esc(id) + '">Delete</button> ' +
          '<button type="button" class="btn btn-sm btn-outline" data-action="preview-post" data-id="' + esc(id) + '">Preview</button>' +
          '</div></div></div>';
      }).join('');
      list.querySelectorAll('[data-action="edit-post"]').forEach(function (btn) {
        btn.addEventListener('click', function () { openBlogPostModal(btn.getAttribute('data-id')); });
      });
      list.querySelectorAll('[data-action="delete-post"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (!confirm('Delete this blog post?')) return;
          var id = btn.getAttribute('data-id');
          db.collection('blog_posts').doc(id).delete().then(function () { loadBlogPosts(); }).catch(function (err) {
            alert('Delete failed: ' + (err.message || 'Please try again.'));
          });
        });
      });
      list.querySelectorAll('[data-action="preview-post"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-id');
          window.open('blog.html?post=' + encodeURIComponent(id), '_blank', 'noopener');
        });
      });
    }).catch(function (err) {
      console.error('Blog load error:', err);
      list.innerHTML = '<p class="admin-empty">Unable to load blog posts. Check Firestore (collection: blog_posts).</p>';
    });
  }

  function openBlogPostModal(postId) {
    editingBlogPostId = postId || null;
    var modal = document.getElementById('adminBlogPostModal');
    var titleEl = document.getElementById('adminBlogPostModalTitle');
    var form = document.getElementById('adminBlogPostForm');
    if (!modal || !titleEl) return;
    titleEl.textContent = postId ? 'Edit post' : 'Add post';
    var titleInput = document.getElementById('adminBlogPostTitle');
    var catInput = document.getElementById('adminBlogPostCategory');
    var authorInput = document.getElementById('adminBlogPostAuthor');
    var statusSelect = document.getElementById('adminBlogPostStatus');
    var dateInput = document.getElementById('adminBlogPostPublishDate');
    var thumbInput = document.getElementById('adminBlogPostThumbnail');
    var excerptInput = document.getElementById('adminBlogPostExcerpt');
    var contentInput = document.getElementById('adminBlogPostContent');
    var statusEl = document.getElementById('adminBlogPostFormStatus');
    if (!postId) {
      if (titleInput) titleInput.value = '';
      if (catInput) catInput.value = '';
      if (authorInput) authorInput.value = '';
      if (statusSelect) statusSelect.value = 'draft';
      if (dateInput) dateInput.value = '';
      if (thumbInput) thumbInput.value = 'imgs/img1.jpeg';
      if (excerptInput) excerptInput.value = '';
      if (contentInput) contentInput.value = '';
      if (statusEl) statusEl.textContent = '';
      modal.classList.add('admin-reply-modal-open');
      modal.setAttribute('aria-hidden', 'false');
      if (titleInput) titleInput.focus();
      return;
    }
    db.collection('blog_posts').doc(postId).get().then(function (doc) {
      if (!doc.exists) return;
      var data = doc.data();
      if (titleInput) titleInput.value = data.title || '';
      if (catInput) catInput.value = data.category || '';
      if (authorInput) authorInput.value = data.author || '';
      if (statusSelect) statusSelect.value = data.status || 'draft';
      if (dateInput) {
        if (data.publishDate && data.publishDate.toDate) {
          dateInput.value = data.publishDate.toDate().toISOString().slice(0, 10);
        } else {
          dateInput.value = '';
        }
      }
      if (thumbInput) thumbInput.value = data.thumbnail || data.image || 'imgs/img1.jpeg';
      if (excerptInput) excerptInput.value = data.excerpt || '';
      if (contentInput) contentInput.value = data.content || '';
      if (statusEl) statusEl.textContent = '';
      modal.classList.add('admin-reply-modal-open');
      modal.setAttribute('aria-hidden', 'false');
      if (titleInput) titleInput.focus();
    });
  }

  function closeBlogPostModal() {
    var modal = document.getElementById('adminBlogPostModal');
    if (modal) {
      modal.classList.remove('admin-reply-modal-open');
      modal.setAttribute('aria-hidden', 'true');
    }
    editingBlogPostId = null;
  }

  (function setupBlogPostModal() {
    var form = document.getElementById('adminBlogPostForm');
    var backdrop = document.getElementById('adminBlogPostModalBackdrop');
    var cancelBtn = document.getElementById('adminBlogPostCancel');
    var searchEl = document.getElementById('adminBlogSearch');
    var filterCatEl = document.getElementById('adminBlogFilterCategory');
    var filterStatusEl = document.getElementById('adminBlogFilterStatus');
    var sortEl = document.getElementById('adminBlogSort');
    if (backdrop) backdrop.addEventListener('click', closeBlogPostModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeBlogPostModal);
    if (searchEl) searchEl.addEventListener('input', function () { loadBlogPosts(); });
    if (searchEl) searchEl.addEventListener('search', function () { loadBlogPosts(); });
    if (filterCatEl) filterCatEl.addEventListener('change', loadBlogPosts);
    if (filterStatusEl) filterStatusEl.addEventListener('change', loadBlogPosts);
    if (sortEl) sortEl.addEventListener('change', loadBlogPosts);
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var titleInput = document.getElementById('adminBlogPostTitle');
        var catInput = document.getElementById('adminBlogPostCategory');
        var authorInput = document.getElementById('adminBlogPostAuthor');
        var statusSelect = document.getElementById('adminBlogPostStatus');
        var dateInput = document.getElementById('adminBlogPostPublishDate');
        var thumbInput = document.getElementById('adminBlogPostThumbnail');
        var excerptInput = document.getElementById('adminBlogPostExcerpt');
        var contentInput = document.getElementById('adminBlogPostContent');
        var statusEl = document.getElementById('adminBlogPostFormStatus');
        var payload = {
          title: (titleInput && titleInput.value) ? titleInput.value.trim() : '',
          category: (catInput && catInput.value) ? catInput.value.trim() : '',
          author: (authorInput && authorInput.value) ? authorInput.value.trim() : '',
          status: (statusSelect && statusSelect.value) || 'draft',
          thumbnail: (thumbInput && thumbInput.value) ? thumbInput.value.trim() : 'imgs/img1.jpeg',
          excerpt: (excerptInput && excerptInput.value) ? excerptInput.value.trim() : '',
          content: (contentInput && contentInput.value) ? contentInput.value.trim() : ''
        };
        if (dateInput && dateInput.value) {
          payload.publishDate = firebase.firestore.Timestamp.fromDate(new Date(dateInput.value + 'T12:00:00'));
        }
        if (!payload.title) {
          if (statusEl) statusEl.textContent = 'Title is required.';
          return;
        }
        if (editingBlogPostId) {
          db.collection('blog_posts').doc(editingBlogPostId).update(payload).then(function () {
            closeBlogPostModal();
            loadBlogPosts();
            if (statusEl) statusEl.textContent = '';
          }).catch(function (err) {
            if (statusEl) statusEl.textContent = 'Update failed: ' + (err.message || 'Please try again.');
          });
        } else {
          payload.createdAt = firebase.firestore.FieldValue && firebase.firestore.FieldValue.serverTimestamp ? firebase.firestore.FieldValue.serverTimestamp() : new Date();
          if (!payload.publishDate) payload.publishDate = firebase.firestore.FieldValue && firebase.firestore.FieldValue.serverTimestamp ? firebase.firestore.FieldValue.serverTimestamp() : new Date();
          db.collection('blog_posts').add(payload).then(function () {
            closeBlogPostModal();
            loadBlogPosts();
            if (statusEl) statusEl.textContent = '';
          }).catch(function (err) {
            if (statusEl) statusEl.textContent = 'Add failed: ' + (err.message || 'Please try again.');
          });
        }
      });
    }
  })();

  function loadContactMessages() {
    if (!db) return;
    var list = document.getElementById('adminMessagesList');
    if (!list) return;
    db.collection('contact_messages').orderBy('submittedAt', 'desc').limit(100).get().then(function (snap) {
      if (snap.empty) {
        list.innerHTML = '<p class="admin-empty">No contact messages yet.</p>';
        return;
      }
      list.innerHTML = snap.docs.map(function (d) {
        var data = d.data();
        var date = data.submittedAt && data.submittedAt.toDate ? data.submittedAt.toDate() : (data.submittedAt || new Date());
        var dateStr = typeof date === 'object' && date.toISOString ? date.toISOString().slice(0, 16).replace('T', ' ') : String(date);
        var phoneLine = (data.phone && data.phone.trim()) ? '<br><em>Phone:</em> ' + String(data.phone).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
        var esc = function (s) { return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
        var replyAttrs = ' data-email="' + esc(data.email) + '" data-name="' + esc(data.firstName + ' ' + (data.lastName || '').trim()).trim() + '" data-subject="' + esc(data.subject) + '"';
        return '<div class="admin-item admin-message-item">' +
          '<strong>' + (data.firstName || '') + ' ' + (data.lastName || '') + '</strong> — ' + (data.email || '') + ' — ' + dateStr + phoneLine + '<br>' +
          '<em>Subject:</em> ' + (data.subject || '') + '<br>' +
          '<em>Message:</em> ' + (data.message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>') +
          '<div class="admin-message-actions"><button type="button" class="btn btn-sm admin-reply-btn"' + replyAttrs + '>Reply by email</button></div>' +
          '</div>';
      }).join('');
    }).catch(function (err) {
      console.error('Contact messages error:', err);
      list.innerHTML = '<p class="admin-empty">Unable to load messages. If you just set up Contact Messages, create a Firestore index for collection <code>contact_messages</code> on field <code>submittedAt</code> (descending).</p>';
    });

    // Reply by email: delegate click to Reply buttons
    list.addEventListener('click', function (e) {
      var btn = e.target.closest('.admin-reply-btn');
      if (!btn) return;
      var toEmail = btn.getAttribute('data-email') || '';
      var customerName = btn.getAttribute('data-name') || '';
      var originalSubject = btn.getAttribute('data-subject') || '';
      openReplyModal(toEmail, customerName, originalSubject);
    });
  }

  function loadReviews() {
    if (!db) return;
    var list = document.getElementById('adminReviewsList');
    if (!list) return;
    list.innerHTML = '<p class="admin-empty">Loading reviews…</p>';
    Promise.all([
      db.collection('reviews').get(),
      db.collection('products').get()
    ]).then(function (results) {
      var reviewsSnap = results[0];
      var productsSnap = results[1];
      var productNames = {};
      productsSnap.docs.forEach(function (d) {
        productNames[d.id] = (d.data().name || d.id || '').trim() || d.id;
      });
      var docs = reviewsSnap.docs.slice();
      docs.sort(function (a, b) {
        var ta = a.data().createdAt;
        var tb = b.data().createdAt;
        var timeA = ta && ta.toDate ? ta.toDate().getTime() : (ta ? new Date(ta).getTime() : 0);
        var timeB = tb && tb.toDate ? tb.toDate().getTime() : (tb ? new Date(tb).getTime() : 0);
        return timeB - timeA;
      });
      if (docs.length === 0) {
        list.innerHTML = '<p class="admin-empty">No customer reviews yet.</p>';
        return;
      }
      var esc = function (s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
      list.innerHTML = docs.map(function (d) {
        var data = d.data();
        var productName = productNames[data.productId] || data.productId || 'Unknown product';
        var rating = typeof data.rating === 'number' ? Math.min(5, Math.max(1, data.rating)) : 0;
        var stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        var date = data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : (data.createdAt || new Date());
        var dateStr = typeof date === 'object' && date.toISOString ? date.toISOString().slice(0, 16).replace('T', ' ') : String(date);
        var text = (data.text && String(data.text).trim()) ? '<br><em>Review:</em> ' + esc(data.text).replace(/\n/g, '<br>') : '';
        return '<div class="admin-item admin-review-item">' +
          '<span class="admin-review-product">' + esc(productName) + '</span> ' +
          '<span class="admin-review-stars" aria-label="' + rating + ' out of 5">' + stars + '</span> ' +
          '— <strong>' + esc(data.userName || 'Guest') + '</strong> ' +
          '<span class="admin-review-date">' + dateStr + '</span>' +
          text +
          '</div>';
      }).join('');
    }).catch(function (err) {
      console.error('Reviews load error:', err);
      list.innerHTML = '<p class="admin-empty">Unable to load reviews. Check Firestore connection and rules.</p>';
    });
  }

  function openReplyModal(toEmail, customerName, originalSubject) {
    var modal = document.getElementById('adminReplyModal');
    var toInput = document.getElementById('adminReplyTo');
    var subjectInput = document.getElementById('adminReplySubject');
    var messageInput = document.getElementById('adminReplyMessage');
    var statusEl = document.getElementById('adminReplyStatus');
    if (!modal || !toInput || !subjectInput || !messageInput) return;
    toInput.value = toEmail;
    subjectInput.value = (originalSubject ? (originalSubject.trim().toLowerCase().indexOf('re:') === 0 ? originalSubject : 'Re: ' + originalSubject) : 'Re: Your message');
    messageInput.value = '';
    statusEl.style.display = 'none';
    statusEl.textContent = '';
    modal.classList.add('admin-reply-modal-open');
    modal.setAttribute('aria-hidden', 'false');
    messageInput.focus();
  }

  function closeReplyModal() {
    var modal = document.getElementById('adminReplyModal');
    if (modal) {
      modal.classList.remove('admin-reply-modal-open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function openProductModal(productId) {
    editingProductId = productId || null;
    var modal = document.getElementById('adminProductModal');
    var titleEl = document.getElementById('adminProductModalTitle');
    var nameEl = document.getElementById('adminProductName');
    var imageEl = document.getElementById('adminProductImage');
    var descEl = document.getElementById('adminProductDescription');
    var detailsEl = document.getElementById('adminProductDetails');
    var priceEl = document.getElementById('adminProductPrice');
    var stockEl = document.getElementById('adminProductStock');
    var categoryEl = document.getElementById('adminProductCategory');
    if (!modal || !titleEl) return;
    titleEl.textContent = productId ? 'Edit Product' : 'Add Product';
    if (!productId) {
      nameEl.value = '';
      imageEl.value = 'imgs/img1.jpeg';
      descEl.value = '';
      detailsEl.value = 'Handcrafted from premium stoneware\nMicrowave and dishwasher safe\nEach piece is unique with slight variations\nMade in Malvan, India';
      priceEl.value = '';
      stockEl.value = '10';
      categoryEl.value = '';
      modal.classList.add('admin-reply-modal-open');
      modal.setAttribute('aria-hidden', 'false');
      nameEl.focus();
      return;
    }
    db.collection('products').doc(productId).get().then(function (doc) {
      if (!doc.exists) return;
      var data = doc.data();
      nameEl.value = data.name || '';
      imageEl.value = data.image || 'imgs/img1.jpeg';
      descEl.value = data.description || '';
      detailsEl.value = (data.details && data.details.length) ? data.details.join('\n') : 'Handcrafted from premium stoneware\nMicrowave and dishwasher safe\nEach piece is unique with slight variations\nMade in Malvan, India';
      priceEl.value = data.price != null ? data.price : '';
      stockEl.value = data.stock != null ? data.stock : '10';
      categoryEl.value = data.categoryId || '';
      modal.classList.add('admin-reply-modal-open');
      modal.setAttribute('aria-hidden', 'false');
      nameEl.focus();
    });
  }

  function closeProductModal() {
    var modal = document.getElementById('adminProductModal');
    if (modal) {
      modal.classList.remove('admin-reply-modal-open');
      modal.setAttribute('aria-hidden', 'true');
    }
    editingProductId = null;
  }

  (function setupProductModal() {
    var modal = document.getElementById('adminProductModal');
    var backdrop = document.getElementById('adminProductModalBackdrop');
    var cancelBtn = document.getElementById('adminProductCancel');
    var form = document.getElementById('adminProductForm');
    if (!form) return;
    if (backdrop) backdrop.addEventListener('click', closeProductModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeProductModal);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameEl = document.getElementById('adminProductName');
      var imageEl = document.getElementById('adminProductImage');
      var descEl = document.getElementById('adminProductDescription');
      var detailsEl = document.getElementById('adminProductDetails');
      var priceEl = document.getElementById('adminProductPrice');
      var stockEl = document.getElementById('adminProductStock');
      var categoryEl = document.getElementById('adminProductCategory');
      var name = (nameEl && nameEl.value) ? nameEl.value.trim() : '';
      var imageUrl = (imageEl && imageEl.value) ? imageEl.value.trim() : 'imgs/img1.jpeg';
      var description = (descEl && descEl.value) ? descEl.value.trim() : '';
      var detailsText = (detailsEl && detailsEl.value) ? detailsEl.value : '';
      var details = detailsText.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      var price = parseInt(priceEl && priceEl.value ? priceEl.value : '0', 10);
      if (isNaN(price) || price < 0) price = 0;
      var stock = parseInt(stockEl && stockEl.value ? stockEl.value : '0', 10);
      if (isNaN(stock) || stock < 0) stock = 0;
      var categoryId = (categoryEl && categoryEl.value) ? categoryEl.value.trim() : '';
      var images = [imageUrl];
      if (!name) {
        alert('Product name is required.');
        return;
      }
      var payload = {
        name: name,
        description: description,
        details: details,
        price: price,
        stock: stock,
        image: imageUrl,
        images: images,
        categoryId: categoryId
      };
      if (editingProductId) {
        db.collection('products').doc(editingProductId).update(payload).then(function () {
          closeProductModal();
          loadProducts();
          loadDashboard();
        }).catch(function (err) {
          alert('Update failed: ' + (err.message || 'Please try again.'));
        });
      } else {
        payload.createdAt = firebase.firestore.FieldValue && firebase.firestore.FieldValue.serverTimestamp ? firebase.firestore.FieldValue.serverTimestamp() : new Date();
        db.collection('products').add(payload).then(function () {
          closeProductModal();
          loadProducts();
          loadDashboard();
        }).catch(function (err) {
          alert('Add failed: ' + (err.message || 'Please try again.'));
        });
      }
    });
  })();

  (function setupReplyModal() {
    var modal = document.getElementById('adminReplyModal');
    var backdrop = document.getElementById('adminReplyModalBackdrop');
    var cancelBtn = document.getElementById('adminReplyCancel');
    var form = document.getElementById('adminReplyForm');
    var statusEl = document.getElementById('adminReplyStatus');
    if (backdrop) backdrop.addEventListener('click', closeReplyModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeReplyModal);
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var config = typeof EMAILJS_REPLY_CONFIG !== 'undefined' ? EMAILJS_REPLY_CONFIG : {};
        var publicKey = config.publicKey;
        var serviceId = config.serviceId;
        var templateId = config.replyTemplateId;
        if (!publicKey || !serviceId || !templateId) {
          alert('EmailJS is not configured. Add your Public Key, Service ID, and Reply Template ID in js/emailjs-config.js. See ADMIN_REPLY_EMAIL_SETUP.md.');
          return;
        }
        var toEmail = document.getElementById('adminReplyTo').value.trim();
        var subject = document.getElementById('adminReplySubject').value.trim();
        var replyMessage = document.getElementById('adminReplyMessage').value.trim();
        if (!toEmail || !subject || !replyMessage) {
          alert('Please fill in To, Subject, and Message.');
          return;
        }
        statusEl.style.display = 'block';
        statusEl.textContent = 'Sending...';
        statusEl.className = 'admin-reply-status';
        if (typeof emailjs === 'undefined') {
          statusEl.textContent = 'EmailJS script not loaded.';
          return;
        }
        emailjs.init({ publicKey: publicKey });
        emailjs.send(serviceId, templateId, {
          to_email: toEmail,
          subject: subject,
          reply_message: replyMessage
        }).then(function () {
          statusEl.textContent = 'Reply sent successfully.';
          statusEl.className = 'admin-reply-status admin-reply-status-success';
          form.reset();
          setTimeout(function () { closeReplyModal(); }, 1500);
        }).catch(function (err) {
          statusEl.textContent = 'Failed to send: ' + (err.text || err.message || 'Unknown error');
          statusEl.className = 'admin-reply-status admin-reply-status-error';
        });
      });
    }
  })();

  document.querySelectorAll('.admin-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      switchToTab(tab.getAttribute('data-tab'));
    });
  });

  function switchToTab(name) {
    document.querySelectorAll('.admin-tab').forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-tab') === name);
    });
    document.getElementById('adminDashboard').style.display = name === 'dashboard' ? 'block' : 'none';
    document.getElementById('adminProducts').style.display = name === 'products' ? 'block' : 'none';
    document.getElementById('adminCategories').style.display = name === 'categories' ? 'block' : 'none';
    document.getElementById('adminOrders').style.display = name === 'orders' ? 'block' : 'none';
    var paymentsPanel = document.getElementById('adminPayments');
    if (paymentsPanel) paymentsPanel.style.display = name === 'payments' ? 'block' : 'none';
    var discountsPanel = document.getElementById('adminDiscounts');
    if (discountsPanel) discountsPanel.style.display = name === 'discounts' ? 'block' : 'none';
    var blogPanel = document.getElementById('adminBlog');
    if (blogPanel) blogPanel.style.display = name === 'blog' ? 'block' : 'none';
    document.getElementById('adminMessages').style.display = name === 'messages' ? 'block' : 'none';
    document.getElementById('adminReviews').style.display = name === 'reviews' ? 'block' : 'none';
    document.getElementById('adminProfile').style.display = name === 'profile' ? 'block' : 'none';
    if (name === 'profile') loadAdminProfile();
    if (name === 'blog') loadBlogPosts();
    if (name === 'payments') {
      loadPaymentSettings();
      loadTransactions();
      loadRefunds();
    }
    if (name === 'discounts') loadCoupons();
  }

  function loadAdminProfile() {
    var loadingEl = document.getElementById('adminProfileLoading');
    var dlEl = document.getElementById('adminProfileDl');
    var nameValEl = document.getElementById('adminProfileNameValue');
    var emailEl = document.getElementById('adminProfileEmail');
    var memberSinceEl = document.getElementById('adminProfileMemberSince');
    var editRow = document.getElementById('adminProfileEditNameRow');
    var nameInput = document.getElementById('adminProfileNameInput');
    if (!loadingEl || !dlEl) return;
    var user = auth && auth.currentUser;
    if (!user) {
      loadingEl.textContent = 'Not signed in.';
      loadingEl.style.display = 'block';
      dlEl.style.display = 'none';
      return;
    }
    loadingEl.style.display = 'none';
    dlEl.style.display = 'block';
    var name = user.displayName || user.email || 'Admin';
    var email = user.email || '—';
    var createdAt = user.metadata && user.metadata.creationTime;
    var memberSinceStr = '—';
    if (createdAt) {
      var d = new Date(createdAt);
      var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      memberSinceStr = months[d.getMonth()] + ' ' + d.getFullYear();
    }
    if (nameValEl) nameValEl.textContent = name;
    if (emailEl) emailEl.textContent = email;
    if (memberSinceEl) memberSinceEl.textContent = memberSinceStr;
    if (editRow) editRow.style.display = 'none';
    if (nameInput) nameInput.value = name;
    var greetingEl = document.getElementById('adminProfileDropdownName');
    if (greetingEl) greetingEl.textContent = (user.displayName && user.displayName.trim()) ? user.displayName.trim() : 'Admin';
  }

  (function setupAdminProfileEditName() {
    var editBtn = document.getElementById('adminProfileEditNameBtn');
    var editRow = document.getElementById('adminProfileEditNameRow');
    var nameValEl = document.getElementById('adminProfileNameValue');
    var nameInput = document.getElementById('adminProfileNameInput');
    var saveBtn = document.getElementById('adminProfileNameSave');
    var cancelBtn = document.getElementById('adminProfileNameCancel');
    if (!editBtn || !editRow || !nameInput || !saveBtn || !cancelBtn) return;
    editBtn.addEventListener('click', function () {
      nameInput.value = (nameValEl && nameValEl.textContent) || '';
      editRow.style.display = 'flex';
    });
    cancelBtn.addEventListener('click', function () {
      editRow.style.display = 'none';
    });
    saveBtn.addEventListener('click', function () {
      var newName = nameInput.value.trim();
      var user = auth && auth.currentUser;
      if (!user) return;
      if (!newName) {
        alert('Name cannot be empty.');
        return;
      }
      user.updateProfile({ displayName: newName }).then(function () {
        if (nameValEl) nameValEl.textContent = newName;
        editRow.style.display = 'none';
        var greetingEl = document.getElementById('adminProfileDropdownName');
        if (greetingEl) greetingEl.textContent = newName;
      }).catch(function (err) {
        alert('Could not update name: ' + (err.message || 'Please try again.'));
      });
    });
  })();

  var adminStatsEl = document.getElementById('adminStats');
  if (adminStatsEl) {
    adminStatsEl.addEventListener('click', function (e) {
      var card = e.target.closest('.admin-stat-card');
      if (!card) return;
      var tab = card.getAttribute('data-tab');
      if (tab) switchToTab(tab);
    });
  }

  var adminNavBlog = document.getElementById('adminNavBlog');
  if (adminNavBlog) {
    adminNavBlog.addEventListener('click', function (e) {
      e.preventDefault();
      switchToTab('blog');
    });
  }

  var adminAddBlogPostBtn = document.getElementById('adminAddBlogPost');
  if (adminAddBlogPostBtn) {
    adminAddBlogPostBtn.addEventListener('click', function () {
      openBlogPostModal(null);
    });
  }

  document.getElementById('adminAddProduct').addEventListener('click', function () {
    openProductModal(null);
  });

  document.getElementById('adminAddCoupon').addEventListener('click', function () {
    openCouponModal(null);
  });

  document.getElementById('adminImportSiteProducts').addEventListener('click', function () {
    if (!db) return;
    db.collection('products').get().then(function (snap) {
      var existing = {};
      snap.docs.forEach(function (d) {
        var n = (d.data().name || '').trim().toLowerCase();
        if (n) existing[n] = true;
      });
      var toAdd = SITE_PRODUCTS.filter(function (p) { return !existing[(p.name || '').trim().toLowerCase()]; });
      if (toAdd.length === 0) {
        alert('All site products are already in the list.');
        return;
      }
      var ts = firebase.firestore.FieldValue && firebase.firestore.FieldValue.serverTimestamp ? firebase.firestore.FieldValue.serverTimestamp() : new Date();
      var done = 0;
      toAdd.forEach(function (p) {
        db.collection('products').add({
          name: p.name,
          description: p.description || '',
          price: p.price || 0,
          image: p.image || 'imgs/img1.jpeg',
          images: p.image ? [p.image] : ['imgs/img1.jpeg'],
          stock: 10,
          categoryId: p.categoryId || '',
          createdAt: ts
        }).then(function () {
          done++;
          if (done === toAdd.length) { loadProducts(); loadDashboard(); alert('Added ' + toAdd.length + ' product(s).'); }
        });
      });
    });
  });

  document.getElementById('adminAddCategory').addEventListener('click', function () {
    var name = prompt('Category name');
    if (!name) return;
    db.collection('categories').add({ name: name }).then(function () { loadCategories(); });
  });

  document.getElementById('adminSeedCategories').addEventListener('click', function () {
    var defaults = [{ name: 'Mugs' }, { name: 'Bowls' }, { name: 'Plates' }, { name: 'Jars' }, { name: 'Ashtrays' }];
    if (!db) return;
    db.collection('categories').get().then(function (snap) {
      var existing = {};
      snap.docs.forEach(function (d) {
        var n = (d.data().name || '').trim().toLowerCase();
        if (n) existing[n] = true;
      });
      var toAdd = defaults.filter(function (c) { return !existing[(c.name || '').toLowerCase()]; });
      if (toAdd.length === 0) {
        alert('All site categories are already in the list.');
        return;
      }
      var done = 0;
      toAdd.forEach(function (c) {
        db.collection('categories').add(c).then(function () {
          done++;
          if (done === toAdd.length) loadCategories();
        });
      });
      if (toAdd.length > 0) alert('Added: ' + toAdd.map(function (c) { return c.name; }).join(', '));
    });
  });

  checkAdmin();
});
