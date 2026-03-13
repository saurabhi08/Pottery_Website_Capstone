# Mumbaa Ceramic Studio – E‑commerce Website

Mumbaa Ceramic Studio is a pottery e‑commerce site built with HTML/CSS/JavaScript, Firebase Authentication, Cloud Firestore, and Firebase Hosting. It supports browsing handcrafted products, managing a cart, checking out with a realistic flow, and a custom admin panel for managing store content.

---

## Features

### Customer‑facing

- **Responsive storefront**
  - Home page with hero, best‑sellers, category sections, and blog highlights.
  - Fully responsive layout for desktop, tablet, and mobile.

- **User management & authentication (Firebase Auth)**
  - Email/password **signup**, **login**, **logout**.
  - **Forgot password** flow via Firebase password reset email.
  - Role field stored in Firestore (`users/{uid}.role`) used to distinguish admin vs customer.

- **Product browsing (Firestore)**
  - **Shop page** pulls products from Firestore `products` collection.
  - Category filters: **Mugs**, **Bowls**, **Soap Holders**, **Jars**, and All.
  - Price filters: **All**, **Under 1000**, **1000–2000**, **Over 2000**.
  - Keyword search (via `?q=...` on `products.html`) across names/descriptions.
  - Sort: **Featured**, **Price: Low to High**, **Price: High to Low**, **Newest First**.
  - Product detail page with:
    - Main image + optional thumbnail gallery.
    - Stock / availability indicator.
    - Structured product details list.
    - Customer reviews section.

- **Cart & checkout**
  - Add to cart from Shop and Product pages.
  - Update quantity / remove items from **Cart**.
  - Cart totals include subtotal, shipping, and tax.
  - Checkout form collects shipping and basic billing details.
  - Field validation for required inputs and formats (email, pincode, etc.).
  - Orders are stored in Firestore `orders` collection and a confirmation page is shown.

- **Customer account area**
  - **Order history** in `account.html` (reads from Firestore by `userId`).
  - **Saved addresses** (localStorage) with:
    - Add / edit / delete addresses on `saved-address.html` or Account → Addresses.
    - Checkout automatically **prefills** address fields from saved addresses.
  - **Saved cards** placeholder page.
  - **Profile** editing (name, phone, etc.) saved locally for quick prefill.

- **Wishlist**
  - Add/remove products to wishlist from cards.
  - Wishlist page showing saved products (localStorage).

- **Blog**
  - Blog list and single post views backed by Firestore `blog_posts`.
  - Admin can create/update posts with thumbnails, category, excerpt, and full content.

- **Contact & newsletter**
  - **Contact form** with validation, backed by EmailJS.
  - Global footer **Subscribe** form that:
    - Stores emails to `subscribers` collection.
    - Shows a friendly confirmation popup.

---

## Admin Panel

Accessible at `admin.html` for admin users only.

- **Role‑based access**
  - `users/{uid}` documents contain a `role` field (`"admin"` or `"customer"`).
  - Frontend (`js/admin.js`, `js/auth.js`) checks the role before showing the admin UI.
  - Firestore rules use `get(/databases/.../documents/users/$(request.auth.uid)).data.role == 'admin'` to allow writes only for admins.

- **Dashboard**
  - Quick stats: total orders, pending orders, total products, blog posts, etc.

- **Products**
  - Full CRUD on `products` collection:
    - Name, description, price, image URL, stock, categoryId, optional details list.
  - Admin list shows thumbnails (normalized paths) and stock status.
  - “Remove demo products” utility to clean out initial seed/demo items.

- **Categories**
  - Manage category documents (e.g. Mugs, Bowls, Soap Holders, Jars).

- **Orders**
  - Read orders from Firestore, with ability to inspect and update status.

- **Blog posts**
  - Add/edit/delete blog entries with:
    - Title, category, author, status (draft/published),
    - Thumbnail URL, excerpt, content, publish date.
  - Preview modal to see how a post will render.

- **Coupons**
  - Create and manage coupon codes in `coupons` collection.
  - Types: percentage, fixed amount, free shipping.
  - Min order, expiry, usage limits, first‑time buyer flag.
  - Checkout integrates coupon code input and feedback.

- **Reviews**
  - Reviews collection with admin moderation:
    - Approve/reject, reply to reviews.
  - Product page shows only approved reviews and any admin replies.

---

## Tech Stack

- **Frontend**: HTML5, CSS3, vanilla JavaScript  
- **UI**: Custom responsive layout, Swiper.js for carousels  
- **Backend / BaaS**: Firebase
  - Authentication (email/password)
  - Cloud Firestore
  - Firestore Security Rules
  - (Optional) Hosting  
- **Other**:
  - EmailJS for contact form emails
  - LocalStorage for client‑side wishlist and saved addresses

---

## Project Structure (key files)

- `index.html` – Home page (hero, best sellers, category sections, blog highlights)  
- `products.html` – Shop grid, filters, sorting  
- `product.html` – Product detail + reviews  
- `cart.html` – Cart view  
- `checkout.html` – Checkout flow  
- `account.html` – Orders, addresses, profile, coupons  
- `saved-address.html` – Standalone address manager  
- `wishlist.html` – Wishlist page  
- `blog.html`, `admin.html`, `contact.html`, `about.html`, etc.

- `css/styles.css` – Global styles  
- `css/admin.css` – Admin panel styles

- `js/firebase-config.js` – Firebase initialization  
- `js/auth.js`, `js/auth-state.js` – Authentication helpers and header behavior  
- `js/shop-products.js` – Load products from Firestore, build product cards  
- `js/products.js` – Shop filters, sorting, search, card interactions  
- `js/product-detail.js` – Product detail rendering, quantity, add to cart, reviews  
- `js/cart-utils.js` – Shared cart logic (add, remove, totals)  
- `js/wishlist-utils.js` – Shared wishlist logic  
- `js/account.js` – Account tab behavior, orders, addresses, profile, coupons  
- `js/admin.js` – Admin dashboard, products/orders/blog/reviews/coupons/categories  
- `js/blog.js` – Customer blog page logic  
- `js/contact.js` – Contact form validation + EmailJS  
- `js/newsletter.js` – Footer subscribe flow

---

## Getting Started (Local)

1. **Clone** the repo into a local folder.

2. **Install Firebase CLI** (for hosting/emulators if you want):

   ```bash
   npm install -g firebase-tools
   ```

3. **Create a Firebase project** in the Firebase Console and enable:
   - Authentication → Email/Password  
   - Firestore Database (in test mode initially)  
   - (Optional) Hosting

4. **Configure Firebase**  
   Update `js/firebase-config.js` with your project’s config:

   ```js
   var firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
var db = firebase.firestore();
   ```

5. **Serve locally** (recommended via Firebase Hosting):

   ```bash
   firebase init hosting   # if not done yet
   firebase serve          # or: firebase emulators:start --only hosting
   ```

   Then open `http://localhost:5000` (or whatever port Firebase shows).

---

## Deploying

1. Make sure `firebase.json` is configured for Hosting with the correct `public` directory (usually the project root).
2. Deploy:

   ```bash
   firebase deploy --only hosting,firestore:rules
   ```

This publishes:

- Static assets (HTML/CSS/JS/images) to Firebase Hosting.  
- Firestore security rules with role‑based access.

---

## Roles & Security

- Each authenticated user has a document in `users/{uid}` with fields:

  ```json
  {
    "email": "user@example.com",
    "fullName": "User Name",
    "role": "admin | customer",
    "createdAt": "..."
  }
  ```

- Firestore rules use this `role` to enforce:
  - Only admins can write to `products`, `categories`, `orders`, `coupons`, `blog_posts`, etc.
  - Customers can read products/blog posts and see only their own orders.
  - Newsletter `subscribers` collection is write‑only (no public read).

Make sure at least one user has `role: "admin"` so you can access `admin.html`.

---

## Notes

- Saved addresses and wishlist are stored in **localStorage**, so they’re browser‑specific.  
- Pagination on the Shop page is simplified to keep filters and sorting behavior correct.  
- Stripe integration is wired for a realistic checkout flow but should be configured with your own test keys and backend before real payments.

