/**
 * Products Page JavaScript - Filter functionality, cart, wishlist.
 * Waits for shopProductsLoaded (from shop-products.js / Firestore) then attaches filters and actions.
 */

document.addEventListener('DOMContentLoaded', function () {
  function runShop() {
    var productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    var cards = productsGrid.querySelectorAll('.product-card');
    if (cards.length === 0) return;

    var priceFilters = document.querySelectorAll('input[name="price"]');
    var categoryFilters = document.querySelectorAll('input[name="category"]');
    var clearFiltersBtn = document.getElementById('clearFilters');

    var allProducts = Array.from(cards).map(function (card) {
      var priceEl = card.querySelector('.price');
      var priceText = priceEl ? priceEl.textContent.replace(/[₹,\s]/g, '') : '0';
      var price = parseInt(priceText, 10) || 0;
      var category = getCategoryFromCard(card);
      return { element: card, price: price, category: category };
    });

    function getCategoryFromCard(card) {
      var cat = card.getAttribute('data-category');
      if (cat && typeof cat === 'string') return cat.trim().toLowerCase();
      var title = (card.querySelector('.product-title') && card.querySelector('.product-title').textContent || '').toLowerCase();
      var sub = (card.querySelector('.product-sub') && card.querySelector('.product-sub').textContent || '').toLowerCase();
      var text = title + ' ' + sub;
      if (text.indexOf('mug') >= 0 || text.indexOf('cup') >= 0) return 'mugs';
      if (text.indexOf('bowl') >= 0) return 'bowls';
      if (text.indexOf('plate') >= 0) return 'plates';
      if (text.indexOf('jar') >= 0) return 'jars';
      if (text.indexOf('ashtray') >= 0) return 'ashtrays';
      return 'all';
    }

    function applyFilters() {
      var selectedPrice = document.querySelector('input[name="price"]:checked');
      var selectedCategory = document.querySelector('input[name="category"]:checked');
      var priceVal = selectedPrice ? selectedPrice.value : 'all';
      var categoryVal = selectedCategory ? selectedCategory.value : 'all';

      allProducts.forEach(function (product) {
        var show = true;
        var cat = String(product.category || 'all').toLowerCase();
        if (categoryVal !== 'all' && cat !== categoryVal) show = false;
        if (show && priceVal === 'under1000' && product.price >= 1000) show = false;
        else if (show && priceVal === '1000-2000' && (product.price < 1000 || product.price > 2000)) show = false;
        else if (show && priceVal === 'over2000' && product.price <= 2000) show = false;
        product.element.style.setProperty('display', show ? 'flex' : 'none');
      });

      var visibleCount = allProducts.filter(function (p) { return p.element.style.display !== 'none'; }).length;
      var countElement = document.querySelector('.products-count') || document.getElementById('productsCount');
      if (countElement) countElement.textContent = visibleCount === 0 ? 'No products' : visibleCount + ' product' + (visibleCount !== 1 ? 's' : '');
      var gridEl = document.getElementById('productsGrid');
      var noResultsEl = document.getElementById('shopNoResults');
      if (gridEl && noResultsEl) {
        gridEl.style.display = visibleCount === 0 ? 'none' : 'grid';
        noResultsEl.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }

    priceFilters.forEach(function (filter) { filter.addEventListener('change', applyFilters); });
    categoryFilters.forEach(function (filter) { filter.addEventListener('change', applyFilters); });
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', function () {
        var allRadio = document.querySelector('input[name="price"][value="all"]');
        var catAllRadio = document.querySelector('input[name="category"][value="all"]');
        if (allRadio) allRadio.checked = true;
        if (catAllRadio) catAllRadio.checked = true;
        applyFilters();
      });
    }

    var urlParams = new URLSearchParams(window.location.search);
    var categoryParam = urlParams.get('category');
    if (categoryParam) {
      var categoryRadio = document.querySelector('input[name="category"][value="' + categoryParam + '"]');
      if (categoryRadio) categoryRadio.checked = true;
    }
    applyFilters();

    addToCartButtons();
    addToWishlistButtons();
    productCardClicks();
    if (typeof updateWishlistBadge === 'function') updateWishlistBadge();
  }

  function addToCartButtons() {
    document.querySelectorAll('.add-to-cart-btn').forEach(function (button) {
      if (button.disabled) return;
      button.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var productCard = this.closest('.product-card');
        if (!productCard) return;
        var productId = productCard.getAttribute('data-product-id');
        var productName = productCard.getAttribute('data-product-name');
        var productDesc = productCard.getAttribute('data-product-desc');
        var productPrice = parseInt(productCard.getAttribute('data-product-price'), 10);
        var productImage = productCard.getAttribute('data-product-image');
        var stock = parseInt(productCard.getAttribute('data-stock'), 10);
        if (stock !== undefined && !isNaN(stock) && stock <= 0) {
          alert('This product is out of stock.');
          return;
        }
        if (!productId || !productName || isNaN(productPrice)) {
          alert('Error: Missing product information');
          return;
        }
        if (typeof addToCart === 'function') {
          try {
            addToCart({ id: productId, name: productName, description: productDesc || '', price: productPrice, image: productImage || 'imgs/img1.jpeg' });
            var orig = this.textContent;
            this.textContent = 'Added!';
            this.style.background = '#4CAF50';
            this.style.color = '#fff';
            var self = this;
            setTimeout(function () { self.textContent = orig; self.style.background = ''; self.style.color = ''; }, 1500);
          } catch (err) {
            alert('Error adding item to cart. Please try again.');
          }
        }
      });
    });
  }

  function addToWishlistButtons() {
    document.querySelectorAll('.add-to-wishlist-btn').forEach(function (button) {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var productCard = this.closest('.product-card');
        if (!productCard) return;
        var productId = productCard.getAttribute('data-product-id');
        var productName = productCard.getAttribute('data-product-name');
        var productDesc = productCard.getAttribute('data-product-desc');
        var productPrice = parseInt(productCard.getAttribute('data-product-price'), 10);
        var productImage = productCard.getAttribute('data-product-image');
        if (!productId || !productName || isNaN(productPrice)) return;
        var img = this.querySelector('img');
        if (typeof isInWishlist === 'function' && isInWishlist(productId)) {
          if (typeof removeFromWishlist === 'function') {
            removeFromWishlist(productId);
            this.classList.remove('wishlisted');
            if (img) { img.src = 'imgs/wishlist-unfilled.png'; img.alt = 'Add to wishlist'; }
          }
        } else if (typeof addToWishlist === 'function') {
          try {
            addToWishlist({ id: productId, name: productName, description: productDesc || '', price: productPrice, image: productImage || 'imgs/img1.jpeg' });
            this.classList.add('wishlisted');
            if (img) { img.src = 'imgs/favourite.png'; img.alt = 'Remove from wishlist'; }
          } catch (err) {}
        }
      });
    });
  }

  function productCardClicks() {
    document.querySelectorAll('.product-card[data-product-id]').forEach(function (card) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function (e) {
        if (e.target.closest('button') || e.target.closest('.product-actions')) return;
        var id = card.getAttribute('data-product-id');
        if (!id) return;
        var name = card.getAttribute('data-product-name');
        var desc = card.getAttribute('data-product-desc');
        var price = card.getAttribute('data-product-price');
        var img = card.getAttribute('data-product-image');
        try {
          sessionStorage.setItem('mumbaa_product_' + id, JSON.stringify({ id: id, name: name || '', description: desc || '', price: parseInt(price, 10) || 0, image: img || 'imgs/img1.jpeg', images: img ? [img] : ['imgs/img1.jpeg'] }));
        } catch (err) {}
        window.location.href = 'product.html?id=' + encodeURIComponent(id);
      });
    });
  }

  window.addEventListener('shopProductsLoaded', runShop);
  if (document.readyState === 'loading') {
    var grid = document.getElementById('productsGrid');
    if (grid && grid.querySelectorAll('.product-card').length > 0) runShop();
  } else {
    var g = document.getElementById('productsGrid');
    if (g && g.querySelectorAll('.product-card').length > 0) runShop();
  }
});
