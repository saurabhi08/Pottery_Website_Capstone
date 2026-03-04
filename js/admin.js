/**
 * Admin panel - role check, products/categories/orders CRUD
 */
document.addEventListener('DOMContentLoaded', function () {
  var forbidden = document.getElementById('adminForbidden');
  var content = document.getElementById('adminContent');

  function checkAdmin() {
    if (typeof auth === 'undefined' || !auth.currentUser) {
      if (forbidden) forbidden.style.display = 'block';
      if (content) content.style.display = 'none';
      return false;
    }
    if (typeof getUserRole !== 'function') {
      if (forbidden) forbidden.style.display = 'block';
      if (content) content.style.display = 'none';
      return false;
    }
    getUserRole(function (role) {
      if (role !== 'admin') {
        if (forbidden) forbidden.style.display = 'block';
        if (content) content.style.display = 'none';
      } else {
        if (forbidden) forbidden.style.display = 'none';
        if (content) content.style.display = 'block';
        loadProducts();
        loadCategories();
        loadOrders();
        loadContactMessages();
      }
    });
    return true;
  }

  document.getElementById('adminSignOut').addEventListener('click', function () {
    signOut();
  });

  function loadProducts() {
    if (!db) return;
    var list = document.getElementById('adminProductsList');
    db.collection('products').get().then(function (snap) {
      list.innerHTML = snap.docs.map(function (d) {
        var data = d.data();
        return '<div class="admin-item">' +
          (data.name || d.id) + ' — ₹' + (data.price || 0) +
          ' <button type="button" class="btn btn-sm" data-id="' + d.id + '" data-action="edit-product">Edit</button>' +
          ' <button type="button" class="btn btn-sm btn-outline" data-id="' + d.id + '" data-action="delete-product">Delete</button>' +
          '</div>';
      }).join('');
      list.querySelectorAll('[data-action="delete-product"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (confirm('Delete this product?')) {
            db.collection('products').doc(btn.getAttribute('data-id')).delete().then(function () { loadProducts(); });
          }
        });
      });
    });
  }

  function loadCategories() {
    if (!db) return;
    var list = document.getElementById('adminCategoriesList');
    db.collection('categories').orderBy('name').get().then(function (snap) {
      list.innerHTML = snap.docs.map(function (d) {
        var data = d.data();
        return '<div class="admin-item">' + (data.name || d.id) +
          ' <button type="button" class="btn btn-sm btn-outline" data-id="' + d.id + '" data-action="delete-category">Delete</button></div>';
      }).join('');
      list.querySelectorAll('[data-action="delete-category"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (confirm('Delete this category?')) {
            db.collection('categories').doc(btn.getAttribute('data-id')).delete().then(function () { loadCategories(); });
          }
        });
      });
    });
  }

  function loadOrders() {
    if (!db) return;
    var list = document.getElementById('adminOrdersList');
    db.collection('orders').orderBy('createdAt', 'desc').limit(50).get().then(function (snap) {
      list.innerHTML = snap.docs.map(function (d) {
        var data = d.data();
        var status = data.status || 'pending';
        return '<div class="admin-item">Order ' + d.id + ' — ' + (data.userName || data.userEmail || '') + ' — ₹' + (data.total || 0) + ' — ' + status +
          ' <select data-id="' + d.id + '" class="admin-order-status"><option value="pending"' + (status === 'pending' ? ' selected' : '') + '>Pending</option><option value="confirmed"' + (status === 'confirmed' ? ' selected' : '') + '>Confirmed</option><option value="shipped"' + (status === 'shipped' ? ' selected' : '') + '>Shipped</option><option value="delivered"' + (status === 'delivered' ? ' selected' : '') + '>Delivered</option></select></div>';
      }).join('');
      list.querySelectorAll('.admin-order-status').forEach(function (sel) {
        sel.addEventListener('change', function () {
          firestoreService.updateOrderStatus(sel.getAttribute('data-id'), sel.value).then(function () { loadOrders(); });
        });
      });
    });
  }

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
        return '<div class="admin-item admin-message-item">' +
          '<strong>' + (data.firstName || '') + ' ' + (data.lastName || '') + '</strong> — ' + (data.email || '') + ' — ' + dateStr + '<br>' +
          '<em>Subject:</em> ' + (data.subject || '') + '<br>' +
          '<em>Message:</em> ' + (data.message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>') +
          '</div>';
      }).join('');
    });
  }

  document.querySelectorAll('.admin-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.admin-tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var name = tab.getAttribute('data-tab');
      document.getElementById('adminProducts').style.display = name === 'products' ? 'block' : 'none';
      document.getElementById('adminCategories').style.display = name === 'categories' ? 'block' : 'none';
      document.getElementById('adminOrders').style.display = name === 'orders' ? 'block' : 'none';
      document.getElementById('adminMessages').style.display = name === 'messages' ? 'block' : 'none';
    });
  });

  document.getElementById('adminAddProduct').addEventListener('click', function () {
    var name = prompt('Product name');
    if (!name) return;
    var price = parseInt(prompt('Price (number)'), 10);
    if (isNaN(price)) return;
    db.collection('products').add({
      name: name,
      description: '',
      price: price,
      image: 'imgs/img1.jpeg',
      images: ['imgs/img1.jpeg'],
      stock: 10,
      categoryId: '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp ? firebase.firestore.FieldValue.serverTimestamp() : new Date()
    }).then(function () { loadProducts(); });
  });

  document.getElementById('adminAddCategory').addEventListener('click', function () {
    var name = prompt('Category name');
    if (!name) return;
    db.collection('categories').add({ name: name }).then(function () { loadCategories(); });
  });

  checkAdmin();
});
