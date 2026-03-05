/**
 * Shop products - load from Firestore so admin changes show on the customer site.
 * Renders product cards into #productsGrid, then dispatches 'shopProductsLoaded' for products.js.
 */
(function () {
  function esc(s) {
    if (s == null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatPrice(n) {
    return '₹ ' + (n || 0).toLocaleString('en-IN');
  }

  function buildCard(doc) {
    var data = doc.data();
    var id = doc.id;
    var name = data.name || 'Product';
    var desc = data.description || '';
    var price = typeof data.price === 'number' ? data.price : 0;
    var img = data.image || 'imgs/img1.jpeg';
    var category = (data.categoryId || '').toLowerCase().trim();
    var stock = typeof data.stock === 'number' ? data.stock : 0;
    var outOfStock = stock <= 0;
    var priceStr = formatPrice(price);
    var addBtn = outOfStock
      ? '<button class="btn btn-sm add-to-cart-btn" disabled>Out of stock</button>'
      : '<button class="btn btn-sm add-to-cart-btn">Add to cart</button>';
    return (
      '<article class="product-card" data-product-id="' + esc(id) + '" data-product-name="' + esc(name) + '" data-product-desc="' + esc(desc) + '" data-product-price="' + price + '" data-product-image="' + esc(img) + '" data-category="' + esc(category) + '" data-stock="' + stock + '">' +
      '<div class="product-media"><img src="' + esc(img) + '" alt="' + esc(name) + '"></div>' +
      '<div class="product-body">' +
      '<div class="product-top-row"><div><h3 class="product-title">' + esc(name) + '</h3><p class="product-sub">' + esc(desc) + '</p></div></div>' +
      '<div class="product-footer-row">' +
      '<div class="price-block"><span class="price">' + priceStr + '</span></div>' +
      '<div class="product-actions">' +
      '<button class="icon-button small add-to-wishlist-btn" aria-label="Add to wishlist"><img src="imgs/wishlist-unfilled.png" alt="Add to wishlist"></button>' +
      addBtn +
      '</div></div></div></article>'
    );
  }

  function loadAndRender() {
    var grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (typeof db === 'undefined' || !db) {
      grid.innerHTML = '<p class="shop-no-results">Products are managed in the admin panel. Configure Firebase to display products here.</p>';
      if (document.getElementById('shopNoResults')) document.getElementById('shopNoResults').style.display = 'none';
      window.dispatchEvent(new CustomEvent('shopProductsLoaded', { detail: { fromFirestore: false } }));
      return;
    }

    grid.innerHTML = '<p class="shop-loading">Loading products…</p>';
    db.collection('products')
      .get()
      .then(function (snap) {
        var docs = snap.docs.slice();
        docs.sort(function (a, b) {
          var na = (a.data().name || '').toLowerCase();
          var nb = (b.data().name || '').toLowerCase();
          return na.localeCompare(nb);
        });
        if (docs.length === 0) {
          grid.innerHTML = '<p class="shop-no-results">No products yet. Add products in the admin panel.</p>';
        } else {
          grid.innerHTML = docs.map(buildCard).join('');
        }
        window.dispatchEvent(new CustomEvent('shopProductsLoaded', { detail: { fromFirestore: true, count: docs.length } }));
      })
      .catch(function (err) {
        console.error('Shop products load error:', err);
        grid.innerHTML = '<p class="shop-no-results">Unable to load products. Please try again later.</p>';
        window.dispatchEvent(new CustomEvent('shopProductsLoaded', { detail: { fromFirestore: false } }));
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAndRender);
  } else {
    loadAndRender();
  }
})();
