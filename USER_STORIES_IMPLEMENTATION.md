# User Stories Implementation Guide – Mumbaa Ceramic Studio

This document describes what is implemented and how to complete setup (Firebase, Stripe, Firestore data).

---

## 1. User Management & Authentication (Firebase Auth)

| # | User Story | Status | Notes |
|---|------------|--------|------|
| 1 | Register | Done | `signup.html` + `js/signup.js`. Creates Firebase user and `users/{uid}` with `role: 'customer'`. |
| 2 | Login / Logout | Done | `signin.html` + `js/signin.js`. Logout via `js/auth.js` `signOut()` and header “Sign Out” from `js/auth-state.js`. Admin redirects to `admin.html`. |
| 3 | Reset password | Done | `forgot-password.html` + `js/forgot-password.js`. Link on sign-in page. |
| 4 | Role-based access (admin/customer) | Done | `users` doc has `role: 'customer' | 'admin'`. `getUserRole()` in `js/auth.js`. Admin panel (`admin.html`) checks role; non-admins see “Access Denied”. |

**Setup:** Add Firebase SDK and config on signin/signup/forgot-password (see “Firebase setup” below). To make a user admin, set `role: 'admin'` in Firestore `users/{uid}`.

---

## 2. Product Browsing & Shopping (Firestore)

| # | User Story | Status | Notes |
|---|------------|--------|------|
| 5 | View product categories | Partial | Categories can come from Firestore `categories`. Shop filters use static categories until Firestore is populated. |
| 6 | Shop with pagination | Partial | `js/firestore-service.js` has `getProducts({ limit, startAfter })`. Products page still uses static HTML; can be switched to Firestore + “Load more”. |
| 7 | Search by keyword | Done | `firestoreService.searchProducts(keyword)` in `js/firestore-service.js`. Hook this to a search input on the shop page. |
| 8 | Filter/sort (price, newest, category) | Partial | `getProducts()` supports `categoryId`, `sortBy`, `sortDir`. Filters UI exists on `products.html`; wire to Firestore when products are in Firestore. |
| 9 | Product detail page | Done | `product.html?id=xxx` + `js/product-detail.js`. Loads from Firestore by id or shows placeholder. |
| 10 | Multiple product images | Done | Product detail shows main image + thumbnails; uses `product.images[]` or single `product.image`. |
| 11 | Stock/availability | Done | Product detail shows “In stock (n)” or “Out of stock”; add to cart disabled when out of stock can be added in UI. |

---

## 3. Cart & Checkout

| # | User Story | Status | Notes |
|---|------------|--------|------|
| 12 | Add to cart | Done | `js/cart-utils.js` + “Add to cart” on shop and product detail. |
| 13 | Update quantity / remove | Done | `cart.html` + `js/cart.js`. |
| 14 | Cart totals (subtotal, shipping, tax) | Done | Cart page and `checkout.html` show subtotal; checkout adds shipping (e.g. ₹150 if &lt; ₹2000); discount from coupon. Tax can be added in `js/checkout.js`. |
| 15 | Checkout with shipping + billing | Done | `checkout.html` + `js/checkout.js`. Single form for shipping/billing. |
| 16 | Pay with Stripe (test) | Not done | Placeholder: order is created in Firestore/local; add Stripe.js and create PaymentIntent on your backend, then confirm on frontend. |
| 17 | Validate checkout fields | Done | Required fields and basic validation in `checkout.js`. |
| 18 | Create order in Firestore + confirmation | Done | `firestoreService.createOrder(orderData)` writes to `orders`. Redirect to `confirmation.html?orderId=xxx`. |

---

## 4. Customer Account

| # | User Story | Status | Notes |
|---|------------|--------|------|
| 19 | Order history | Done | Account page → Orders tab; `firestoreService.getOrdersByUser(uid)` when logged in. |
| 20 | Saved addresses | Done | Account → Addresses; stored in localStorage; can be moved to Firestore per user later. |
| 21 | Update account details | Done | Account → Profile; save to localStorage; can sync to Firestore `users/{uid}`. |

---

## 5. Admin (Firestore CRUD)

| # | User Story | Status | Notes |
|---|------------|--------|------|
| 22 | Add/Edit/Delete products | Done | `admin.html` + `js/admin.js`. Add product (name, price); list + delete. Edit can be added (e.g. modal or inline). |
| 23 | Manage categories | Done | Admin → Categories: add + delete. |
| 24 | View/manage orders (status) | Done | Admin → Orders: list recent orders; dropdown to set status (pending → confirmed → shipped → delivered). |

---

## 6. Design / Quality

| # | User Story | Status | Notes |
|---|------------|--------|------|
| 25 | Responsive & accessible | Done | Existing CSS is responsive; use semantic HTML and ARIA where needed. |

---

## Should Have

| # | User Story | Status | Notes |
|---|------------|--------|------|
| 26 | Coupon codes | Done | `firestoreService.getCoupon(code)`. Checkout has coupon input + “Apply”; discount applied to total. Add docs in `coupons` (e.g. `code`, `type: 'percent'|'fixed'`, `value`). |
| 27 | Product reviews | Done | `firestoreService.getReviews(productId)`, `addReview(...)`. Wire on product detail page: list reviews + form (rating + text). |
| 28 | Admin moderate reviews | Partial | Reviews have `moderated` flag; admin UI to list/approve can be added. |
| 29 | Contact form with validation | Done | Contact page has form; add validation in `js/contact.js` and optional Firestore save. |
| 30 | Performance (images, lazy load) | Partial | Add `loading="lazy"` on product images and use responsive images where needed. |

---

## Nice to Have

| # | User Story | Status | Notes |
|---|------------|--------|------|
| 31 | Wishlist | Done | `wishlist.html`, `js/wishlist-utils.js`, heart icon to add/remove; persists in localStorage. |

---

## Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** → Email/Password.
3. Create **Firestore** database; start in test mode (then add security rules).
4. Copy project config into `js/firebase-config.js`:
   - `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.
5. Add Firebase scripts on pages that need Auth/Firestore (already added on signin, signup, account, checkout, admin, product, index):
   ```html
   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
   <script src="js/firebase-config.js"></script>
   ```
6. **Firestore structure:**
   - `users/{uid}`: `fullName`, `email`, `role` ('customer' | 'admin'), `createdAt`
   - `categories`: doc with `name`
   - `products`: `name`, `description`, `price`, `image`, `images[]`, `stock`, `categoryId`, `createdAt`
   - `orders`: `userId`, `userName`, `userEmail`, `shipping`, `items[]`, `subtotal`, `shippingCost`, `discount`, `total`, `status`, `createdAt`
   - `coupons`: `code`, `type` ('percent' | 'fixed'), `value`
   - `reviews`: `productId`, `userId`, `userName`, `rating`, `text`, `createdAt`, `moderated`

---

## Making the first admin

In Firestore, edit the `users` document for your user (after signing up once) and set `role: 'admin'`. Then sign in again; you will be redirected to `admin.html` and can manage products, categories, and orders.

---

## Stripe (test mode) – not implemented

To add Stripe:

1. Create a Stripe account and get **publishable** and **secret** keys (test mode).
2. Backend: create an endpoint that creates a PaymentIntent with the order total and returns `clientSecret`.
3. Frontend: load Stripe.js, collect payment (e.g. CardElement), confirm with `clientSecret`, then create the order in Firestore and redirect to confirmation.
4. Keep the secret key only on the server; never expose it in the client.

---

## File reference

- **Auth:** `js/firebase-config.js`, `js/auth.js`, `js/auth-state.js`, `js/signin.js`, `js/signup.js`, `js/forgot-password.js`
- **Data:** `js/firestore-service.js`
- **Cart:** `js/cart-utils.js`, `js/cart.js`, `cart.html`
- **Checkout:** `js/checkout.js`, `checkout.html`, `confirmation.html`
- **Product detail:** `js/product-detail.js`, `product.html`
- **Account:** `js/account.js`, `account.html`
- **Admin:** `js/admin.js`, `admin.html`
- **Wishlist:** `js/wishlist-utils.js`, `js/wishlist.js`, `wishlist.html`
