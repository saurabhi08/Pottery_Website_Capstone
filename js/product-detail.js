/**
 * Product detail page - load by id (Firestore or query), multiple images, stock, add to cart/wishlist
 */
(function () {
  function getProductId() {
    var params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  function formatPrice(n) {
    return '₹ ' + (n || 0).toLocaleString('en-IN');
  }

  function renderProduct(product) {
    var container = document.getElementById('productDetailContainer');
    var empty = document.getElementById('productDetailEmpty');
    if (!product) {
        if (container) container.style.display = 'none';
        if (empty) empty.style.display = 'block';
        return;
    }
    if (container) container.style.display = 'grid';
    if (empty) empty.style.display = 'none';

    var images = (product.images && product.images.length) ? product.images : [product.image || 'imgs/img1.jpeg'];
    var mainImg = document.getElementById('productMainImage');
    var thumbs = document.getElementById('productThumbs');
    if (mainImg) {
      if (mainImg.tagName && mainImg.tagName.toLowerCase() === 'img') {
        mainImg.src = images[0];
        mainImg.alt = product.name || '';
      } else if (mainImg.querySelector && mainImg.querySelector('img')) {
        mainImg.querySelector('img').src = images[0];
        mainImg.querySelector('img').alt = product.name || '';
      }
    }

    if (thumbs) {
      thumbs.innerHTML = images.length > 1 ? images.map(function (url, i) {
        return '<button type="button" class="product-detail-thumb' + (i === 0 ? ' active' : '') + '" data-index="' + i + '"><img src="' + url + '" alt=""></button>';
      }).join('') : '';
      thumbs.querySelectorAll('button').forEach(function (btn, i) {
        btn.addEventListener('click', function () {
          thumbs.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          if (mainImg) {
            if (mainImg.tagName && mainImg.tagName.toLowerCase() === 'img') {
              mainImg.src = images[i];
            } else if (mainImg.querySelector && mainImg.querySelector('img')) {
              mainImg.querySelector('img').src = images[i];
            }
          }
        });
      });
    }

    document.getElementById('productTitle').textContent = product.name || 'Product';
    document.getElementById('productPrice').textContent = formatPrice(product.price);
    document.getElementById('productDesc').textContent = product.description || '';
    var tagEl = document.getElementById('productTag');
    if (tagEl) {
      tagEl.textContent = product.tag || 'New Arrival';
      tagEl.style.display = product.tag === false ? 'none' : '';
    }
    var reviewsEl = document.getElementById('productReviews');
    if (reviewsEl) reviewsEl.textContent = '(' + (product.reviewCount != null ? product.reviewCount : 24) + ' reviews)';
    var detailsList = document.getElementById('productDetailsList');
    if (detailsList) {
      var bullets = product.details && product.details.length ? product.details : [
        'Handcrafted from premium stoneware',
        'Microwave and dishwasher safe',
        'Each piece is unique with slight variations',
        'Made in Malvan, India'
      ];
      detailsList.innerHTML = bullets.map(function (b) { return '<li>' + b + '</li>'; }).join('');
    }
    var stockEl = document.getElementById('productStock');
    if (stockEl) {
      var stock = product.stock != null ? product.stock : 10;
      stockEl.textContent = stock > 0 ? 'In stock (' + stock + ')' : 'Out of stock';
      stockEl.className = 'product-detail-stock' + (stock > 0 ? ' in-stock' : ' out-of-stock');
    }
    var qtyInput = document.getElementById('productQty');
    if (qtyInput && product.stock != null) qtyInput.max = Math.max(1, product.stock);

    var minusBtn = document.getElementById('productQtyMinus');
    var plusBtn = document.getElementById('productQtyPlus');
    if (minusBtn && qtyInput) minusBtn.onclick = function () { var v = parseInt(qtyInput.value, 10) || 1; if (v > 1) qtyInput.value = v - 1; };
    if (plusBtn && qtyInput) plusBtn.onclick = function () { var v = parseInt(qtyInput.value, 10) || 1; var max = parseInt(qtyInput.getAttribute('max'), 10) || 99; if (v < max) qtyInput.value = v + 1; };

    var shareBtn = document.getElementById('productShareBtn');
    if (shareBtn) {
      var shareBtnContent = shareBtn.innerHTML;
      shareBtn.onclick = function () {
        if (navigator.share) {
          navigator.share({ title: product.name || 'Product', url: window.location.href }).catch(function () {});
        } else {
          try {
            navigator.clipboard.writeText(window.location.href);
            shareBtn.innerHTML = 'Copied!';
            setTimeout(function () { shareBtn.innerHTML = shareBtnContent; }, 1500);
          } catch (e) {}
        }
      };
    }

    var addCart = document.getElementById('addToCartDetail');
    var addWish = document.getElementById('addToWishlistDetail');
    if (addCart) {
      addCart.onclick = function () {
        var qty = parseInt(document.getElementById('productQty').value, 10) || 1;
        if (typeof addToCart === 'function') {
          for (var i = 0; i < qty; i++) {
            addToCart({
              id: product.id,
              name: product.name,
              description: product.description || '',
              price: product.price,
              image: images[0]
            });
          }
          addCart.textContent = 'Added!';
          setTimeout(function () { addCart.textContent = 'Add to Cart'; }, 1500);
        }
      };
    }
    if (addWish && typeof addToWishlist === 'function') {
      addWish.onclick = function () {
        addToWishlist({
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          image: images[0]
        });
        addWish.textContent = 'Saved to Wishlist';
        setTimeout(function () { addWish.textContent = 'Add to Wishlist'; }, 1500);
      };
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var id = getProductId();
    var fromStorage = null;
    try {
      if (id) fromStorage = sessionStorage.getItem('mumbaa_product_' + id);
      if (fromStorage) {
        fromStorage = JSON.parse(fromStorage);
        if (fromStorage) fromStorage.id = id;
      }
    } catch (e) {}
    if (fromStorage) {
      try { sessionStorage.removeItem('mumbaa_product_' + id); } catch (e) {}
      renderProduct(fromStorage);
      return;
    }
    if (typeof firestoreService !== 'undefined' && db && id) {
      firestoreService.getProductById(id).then(function (product) {
        if (product) product.id = id;
        renderProduct(product);
      });
    } else if (id) {
      renderProduct({ id: id, name: 'Product ' + id, price: 999, description: 'Handcrafted ceramic. Choose your quantity and add to cart.', image: 'imgs/img1.jpeg', stock: 5, images: ['imgs/img1.jpeg', 'imgs/img2.jpeg'] });
    } else {
      renderProduct(null);
    }
  });
})();
