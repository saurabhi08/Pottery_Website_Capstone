/**
 * Firestore data service - products, categories, orders, users
 * Use when db is defined (Firebase configured)
 */
var firestoreService = {
  getCategories: function () {
    if (!db) return Promise.resolve([]);
    return db.collection('categories').orderBy('name').get()
      .then(function (snap) {
        return snap.docs.map(function (d) {
          var data = d.data();
          data.id = d.id;
          return data;
        });
      })
      .catch(function () { return []; });
  },

  getProducts: function (opts) {
    opts = opts || {};
    var ref = db.collection('products');
    if (opts.categoryId) ref = ref.where('categoryId', '==', opts.categoryId);
    if (opts.inStock !== undefined) ref = ref.where('stock', '>', opts.inStock ? 0 : -1);
    ref = ref.orderBy(opts.sortBy || 'createdAt', opts.sortDir || 'desc');
    var limit = opts.limit || 12;
    if (opts.startAfter) ref = ref.startAfter(opts.startAfter);
    return ref.limit(limit).get()
      .then(function (snap) {
        var last = snap.docs[snap.docs.length - 1];
        var list = snap.docs.map(function (d) {
          var data = d.data();
          data.id = d.id;
          return data;
        });
        return { products: list, lastDoc: last };
      })
      .catch(function () { return { products: [], lastDoc: null }; });
  },

  searchProducts: function (keyword, limit) {
    if (!db) return Promise.resolve([]);
    limit = limit || 20;
    return db.collection('products').get()
      .then(function (snap) {
        var k = (keyword || '').toLowerCase();
        return snap.docs
          .filter(function (d) {
            var data = d.data();
            var name = (data.name || '').toLowerCase();
            var desc = (data.description || '').toLowerCase();
            return !k || name.indexOf(k) >= 0 || desc.indexOf(k) >= 0;
          })
          .slice(0, limit)
          .map(function (d) {
            var data = d.data();
            data.id = d.id;
            return data;
          });
      })
      .catch(function () { return []; });
  },

  getProductById: function (id) {
    if (!db) return Promise.resolve(null);
    return db.collection('products').doc(id).get()
      .then(function (d) {
        if (!d.exists) return null;
        var data = d.data();
        data.id = d.id;
        return data;
      })
      .catch(function () { return null; });
  },

  createOrder: function (orderData) {
    if (!db) return Promise.reject(new Error('Firestore not configured'));
    orderData.createdAt = (firebase.firestore.FieldValue && firebase.firestore.FieldValue.serverTimestamp) ? firebase.firestore.FieldValue.serverTimestamp() : new Date();
    orderData.status = 'pending';
    return db.collection('orders').add(orderData).then(function (ref) { return ref.id; });
  },

  getOrdersByUser: function (userId) {
    if (!db) return Promise.resolve([]);
    return db.collection('orders').where('userId', '==', userId).get()
      .then(function (snap) {
        var list = snap.docs.map(function (d) {
          var data = d.data();
          data.id = d.id;
          if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate();
          return data;
        });
        list.sort(function (a, b) {
          var ta = a.createdAt ? (a.createdAt instanceof Date ? a.createdAt.getTime() : 0) : 0;
          var tb = b.createdAt ? (b.createdAt instanceof Date ? b.createdAt.getTime() : 0) : 0;
          return tb - ta;
        });
        return list;
      })
      .catch(function (err) {
        console.error('getOrdersByUser error:', err);
        return [];
      });
  },

  getOrdersByUserEmail: function (email) {
    if (!db || !email) return Promise.resolve([]);
    return db.collection('orders').where('userEmail', '==', email).get()
      .then(function (snap) {
        var list = snap.docs.map(function (d) {
          var data = d.data();
          data.id = d.id;
          if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate();
          return data;
        });
        list.sort(function (a, b) {
          var ta = a.createdAt ? (a.createdAt instanceof Date ? a.createdAt.getTime() : 0) : 0;
          var tb = b.createdAt ? (b.createdAt instanceof Date ? b.createdAt.getTime() : 0) : 0;
          return tb - ta;
        });
        return list;
      })
      .catch(function (err) {
        console.error('getOrdersByUserEmail error:', err);
        return [];
      });
  },

  getOrdersByShippingEmail: function (email) {
    if (!db || !email) return Promise.resolve([]);
    return db.collection('orders').where('shipping.email', '==', email).get()
      .then(function (snap) {
        var list = snap.docs.map(function (d) {
          var data = d.data();
          data.id = d.id;
          if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate();
          return data;
        });
        list.sort(function (a, b) {
          var ta = a.createdAt ? (a.createdAt instanceof Date ? a.createdAt.getTime() : 0) : 0;
          var tb = b.createdAt ? (b.createdAt instanceof Date ? b.createdAt.getTime() : 0) : 0;
          return tb - ta;
        });
        return list;
      })
      .catch(function (err) {
        console.error('getOrdersByShippingEmail error:', err);
        return [];
      });
  },

  updateOrderStatus: function (orderId, status) {
    if (!db) return Promise.reject(new Error('Firestore not configured'));
    return db.collection('orders').doc(orderId).update({ status: status });
  },

  getCoupon: function (code) {
    if (!db) return Promise.resolve(null);
    return db.collection('coupons').where('code', '==', (code || '').toLowerCase().trim()).limit(1).get()
      .then(function (snap) {
        if (snap.empty) return null;
        var d = snap.docs[0];
        var data = d.data();
        data.id = d.id;
        return data;
      })
      .catch(function () { return null; });
  },

  incrementCouponUsed: function (couponId) {
    if (!db || !couponId) return Promise.resolve();
    var increment = firebase.firestore.FieldValue && firebase.firestore.FieldValue.increment;
    if (!increment) return Promise.resolve();
    return db.collection('coupons').doc(couponId).update({ usedCount: increment(1) })
      .catch(function (err) { console.warn('Coupon use count increment failed:', err); });
  },

  getPaymentSettings: function () {
    if (!db) return Promise.resolve({ stripeEnabled: true });
    return db.collection('settings').doc('payment_methods').get()
      .then(function (doc) {
        var data = doc.exists ? doc.data() : {};
        return { stripeEnabled: data.stripeEnabled !== false };
      })
      .catch(function () { return { stripeEnabled: true }; });
  },

  getActiveCouponsForDisplay: function () {
    if (!db) return Promise.resolve([]);
    return db.collection('coupons').get()
      .then(function (snap) {
        var now = new Date();
        return snap.docs
          .filter(function (d) {
            var data = d.data();
            if (data.expiryDate && data.expiryDate.toDate && data.expiryDate.toDate() < now) return false;
            var limit = typeof data.usageLimit === 'number' ? data.usageLimit : 0;
            if (limit > 0) {
              var used = typeof data.usedCount === 'number' ? data.usedCount : 0;
              if (used >= limit) return false;
            }
            return true;
          })
          .map(function (d) {
            var data = d.data();
            var code = data.code || d.id;
            var type = data.type || 'percent';
            var value = typeof data.value === 'number' ? data.value : 0;
            var minOrder = typeof data.minOrderValue === 'number' ? data.minOrderValue : 0;
            var label = '';
            if (type === 'percent') label = value + '% off';
            else if (type === 'fixed') label = '₹' + value + ' off';
            else if (type === 'free_shipping') label = 'Free shipping';
            else label = code;
            if (minOrder > 0) label += ' on orders over ₹' + minOrder;
            return { code: code, label: label };
          });
      })
      .catch(function () { return []; });
  },

  getReviews: function (productId) {
    if (!db) return Promise.resolve([]);
    return db.collection('reviews').where('productId', '==', productId).orderBy('createdAt', 'desc').get()
      .then(function (snap) {
        return snap.docs.map(function (d) {
          var data = d.data();
          data.id = d.id;
          return data;
        });
      })
      .catch(function () { return []; });
  },

  addReview: function (productId, userId, userName, rating, text) {
    if (!db) return Promise.reject(new Error('Firestore not configured'));
    return db.collection('reviews').add({
      productId: productId,
      userId: userId,
      userName: userName || 'Guest',
      rating: rating,
      text: text || '',
      createdAt: (firebase.firestore.FieldValue && firebase.firestore.FieldValue.serverTimestamp) ? firebase.firestore.FieldValue.serverTimestamp() : new Date(),
      moderated: false
    });
  }
};
