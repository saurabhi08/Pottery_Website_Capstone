# Contact form – receive messages at your email

Contact form submissions are sent to **your admin email** using [EmailJS](https://www.emailjs.com/). Follow these steps once to set it up.

## 1. Create an EmailJS account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/) and sign up (free tier is enough).
2. Confirm your email.

## 2. Add an email service

1. In the dashboard go to **Email Services** → **Add New Service**.
2. Choose **Gmail** (or another provider you use).
3. Connect your Gmail account (the one where you want to receive contact messages – your admin email).
4. Save. Copy the **Service ID** (e.g. `service_abc123`).

## 3. Create an email template

1. Go to **Email Templates** → **Create New Template**.
2. **To Email:** enter your admin email (same as above, or any address where you want to receive messages).
3. **Subject:** e.g. `Contact: {{subject}}`
4. **Content (Body):** use the variables below so each submission fills in the details:

   ```
   New message from {{firstName}} {{lastName}}
   Email: {{email}}
   Phone: {{phone}}
   Subject: {{subject}}

   Message:
   {{message}}
   ```
5. Save. Copy the **Template ID** (e.g. `template_xyz789`).

## 4. Get your Public Key

1. Go to **Account** → **API Keys** (or **General**).
2. Copy your **Public Key**.

## 5. Add the keys to your site

Open **js/contact.js** and find `EMAILJS_CONFIG` at the top. Replace the placeholders with your values:

```javascript
var EMAILJS_CONFIG = {
  serviceId: 'service_xxxxx',   // from step 2
  templateId: 'template_xxxxx', // from step 3
  publicKey: 'xxxxxxxxxxxx'     // from step 4
};
```

Save the file. From now on, when someone submits the contact form, you’ll get an email at the address you set in the template (your admin mail).

## Optional: Firebase

If Firebase is configured, messages are also saved to the `contact_messages` collection in Firestore so you have a backup. EmailJS is what actually sends the email to your inbox.
