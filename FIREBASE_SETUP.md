# Connect Your Firebase Project to the Website

You already have a Firebase project. Follow these steps to connect it.

---

## Step 1: Get your config from Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com) and open your project.
2. Click the **gear icon** next to "Project Overview" → **Project settings**.
3. Scroll to **"Your apps"**. If you don’t have a web app yet:
   - Click **</>** (Web).
   - Enter an app nickname (e.g. "Mumbaa Website") and click **Register app**.
   - You can skip Firebase Hosting for now.
4. You’ll see a code block like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

5. Copy **only the values** (the strings in quotes). You’ll paste them into the website in Step 3.

---

## Step 2: Enable Authentication and Firestore

### Authentication (Email/Password)

1. In the left sidebar, go to **Build** → **Authentication**.
2. Click **Get started** (if needed).
3. Open the **Sign-in method** tab.
4. Click **Email/Password** → turn **Enable** ON → **Save**.

### Firestore Database

1. In the left sidebar, go to **Build** → **Firestore Database**.
2. Click **Create database**.
3. Choose **Start in test mode** (you can tighten rules later) → **Next** → pick a region → **Enable**.

---

## Step 3: Paste config into the website

1. Open **`js/firebase-config.js`** in your project.
2. Replace the placeholder values with the ones from your Firebase Console:

| In `firebase-config.js` | Replace with |
|--------------------------|--------------|
| `"YOUR_API_KEY"`         | Your `apiKey` |
| `"YOUR_PROJECT_ID.firebaseapp.com"` | Your `authDomain` |
| `"YOUR_PROJECT_ID"` (all 3 places) | Your `projectId` |
| `"YOUR_PROJECT_ID.appspot.com"` | Your `storageBucket` |
| `"YOUR_SENDER_ID"`       | Your `messagingSenderId` |
| `"YOUR_APP_ID"`          | Your `appId` |

Example after filling in (use your own values):

```javascript
var firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "mumbaa-pottery.firebaseapp.com",
  projectId: "mumbaa-pottery",
  storageBucket: "mumbaa-pottery.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef"
};
```

3. Save the file.

---

## Step 4: Make yourself an admin (optional)

1. Sign up once on your site (Sign Up page).
2. In Firebase Console → **Firestore Database** → **Data**.
3. Open the **users** collection → click the document with your user ID (same as in Authentication → Users).
4. Add or edit a field: **name** `role`, **type** string, **value** `admin` → Save.

After that, when you sign in, you’ll be redirected to the Admin panel and can manage products, categories, and orders.

---

## Done

- **Sign Up / Sign In / Forgot Password** will use your Firebase project.
- **Orders, products, categories** will be stored in Firestore.
- **Admin panel** will work once your user has `role: "admin"` in Firestore.

If something doesn’t work, check the browser console (F12 → Console) for errors and make sure every value in `firebase-config.js` was replaced (no `YOUR_` left).
