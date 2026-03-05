# Admin: Reply to customers by email (EmailJS)

You can reply to contact form submissions from the **Admin → Contact Messages** panel. Replies are sent via [EmailJS](https://www.emailjs.com/) so the customer receives your email at the address they used on the contact form.

## 1. EmailJS account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/) and sign up (free tier is enough).
2. Confirm your email.

## 2. Email service (for sending)

1. In the dashboard go to **Email Services** → **Add New Service**.
2. Choose **Gmail** (or another provider you use for sending).
3. Connect the account from which you want to send replies (e.g. your studio email).
4. Save and copy the **Service ID** (e.g. `service_abc123`).

## 3. Create the “Admin Reply” template

1. Go to **Email Templates** → **Create New Template**.
2. **Template name:** e.g. `Admin Reply`.
3. **To Email:** `{{to_email}}`  
   This sends the reply to the customer’s email.
4. **Subject:** `{{subject}}`  
   The admin panel will send “Re: …” here.
5. **Content (Body)** use:

   ```
   Hello,

   {{reply_message}}

   Best regards,
   Mumbaa Ceramic Studio
   ```

   Or use your own wording; just keep the variable `{{reply_message}}` for the reply text.

6. Save and copy the **Template ID** (e.g. `template_xyz789`).

## 4. Get your Public Key

1. Go to **Account** → **API Keys** (or **General**).
2. Copy your **Public Key**.

## 5. Add the keys to your site

Open **js/emailjs-config.js** and set:

```javascript
var EMAILJS_REPLY_CONFIG = {
  publicKey: 'YOUR_PUBLIC_KEY',       // from step 4
  serviceId: 'YOUR_SERVICE_ID',        // from step 2
  replyTemplateId: 'YOUR_TEMPLATE_ID' // from step 3
};
```

Save the file.

## 6. Use it in Admin

1. Sign in as admin and go to **Admin** → **Contact Messages**.
2. Click **Reply by email** on a message.
3. In the modal, **To** is filled with the customer’s email; edit **Subject** and **Message** if you like.
4. Click **Send reply**. The email is sent via EmailJS to the customer.

If you see “EmailJS is not configured”, double-check that all three values in **js/emailjs-config.js** are set and that you are using the correct Service ID and **Admin Reply** template ID.
