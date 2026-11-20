# RailBlock-AI — Account Management Update

## What was added

1. **Create account now requires email**
   - The existing registration form already collected email; the updated account record keeps it for recovery.
2. **Manage Account**
   - Click the profile icon in the dashboard header.
   - Change username.
   - Change profile picture.
   - Remove profile picture.
   - View the registered recovery email.
   - Change password while logged in.
3. **Forgot password**
   - Login screen has **Forgot password?**
   - User enters registered email.
   - Backend generates a 6-digit OTP.
   - OTP is sent to that email.
   - OTP expires after 10 minutes and is single-use.
   - User enters OTP and chooses a new password.

## Important prototype note

The existing project uses browser `localStorage` for accounts and passwords. That is suitable only for a demo/prototype and is **not production authentication**.

For a real deployment, move accounts to a server database and store passwords using a secure password hash such as Argon2id or bcrypt. The OTP should also remain server-side.

## Run the email OTP backend

Install Node.js, then in this folder:

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your SMTP settings.

For Gmail, enable 2-Step Verification and create a Google **App Password**. Put that App Password in `SMTP_PASS`.

Then start:

```bash
npm start
```

The backend runs at:

```text
http://localhost:3000
```

Open `index.html` using a local web server (for example VS Code Live Server) rather than relying on `file://`.

## Files

- `index.html` — login, registration and password-reset UI
- `script.js` — account registration/login and OTP reset flow
- `style.css` — login/reset styling
- `dashboard.html` — account settings page and profile control
- `dashboard.js` — username/password/profile-picture management
- `dashboard.css` — account settings styling
- `server.js` — real email OTP service
- `package.json` — backend dependencies
- `.env.example` — SMTP configuration template


## Latest account-management changes

- The dashboard Security section is now collapsed by default.
- Clicking **Change password** opens the password form.
- If the current password is wrong, **Forgot password?** appears directly below the current-password field.
- The forgot-password flow sends the OTP to the account's registered email.
- Users can change their recovery email by sending a verification OTP to the new email.
- Login history records successful sign-ins with device type, browser and local date/time.
- Up to 50 login records are kept per account in this prototype.


## Account-management updates

- Security section is collapsed by default and opens only when clicked.
- If the current password is wrong, a **Forgot password?** option appears directly under **Change password**. It sends an OTP to the account recovery email and allows password reset without leaving the dashboard.
- Recovery email can be changed. The new email must be verified with a 6-digit OTP.
- Login history records the last 20 successful logins with timestamp, device type, browser and platform.
- Login history is shown in **Manage Account → Login history**.

The login-history device information is inferred from the browser's user-agent string; this prototype does not collect an IP address.
