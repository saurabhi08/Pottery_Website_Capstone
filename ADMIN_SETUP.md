# Admin login – same sign-in, admin role in Firestore

Admin uses the **same Sign In page** as customers. You log in with your **admin email and password**; if your account has the admin role, you are taken to the Admin panel.

## How to log in as admin

1. Go to **Sign In** (or open **admin.html** – you’ll be redirected to Sign In).
2. Enter your **admin email** and **password** (the same account you use for the site).
3. After sign-in, if your user has the admin role you’ll be redirected to the **Admin** panel.

## How to make a user an admin (one-time setup)

Admin access is controlled by a **role** in Firestore. You need to set `role: "admin"` for your user.

### Option A: Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/) → your project.
2. Go to **Authentication** → **Users** and find your user. Copy the **User UID**.
3. Go to **Firestore Database** → **Data**.
4. Open or create the **users** collection.
5. Add or edit a document whose **document ID is exactly your User UID** (from step 2).
6. Add a field: **role** (string) = **admin**.
7. Save.

After that, when you sign in with that email and password, you’ll be treated as admin and can open the Admin panel.

### Option B: First user as admin at sign-up (code)

If you want the first registered user (or a specific email) to be admin, you can set `role: 'admin'` in the signup flow in **js/signup.js** for that user and create the `users/{uid}` document with `role: 'admin'`. For most setups, using the Console (Option A) is enough.

## Summary

- **Login:** Same as customers – **Sign In** page, email + password.
- **Who can access Admin:** Only users whose Firestore `users/{uid}` document has **role: "admin"**.
- **Direct link:** Visiting **admin.html** while not logged in sends you to **Sign In**; after logging in with an admin account you land on the Admin panel.
