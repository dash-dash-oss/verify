# Personal Information Form

A web application that collects personal information via a form, including photo uploads, and sends the data via email.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   GMAIL_USER=yourgmail@gmail.com
   GMAIL_PASS=your_app_password
   RECIPIENT_EMAIL=yourgmail@gmail.com
   ```
   Note: Use an app password for Gmail, not your regular password. Enable 2FA on your Gmail account and generate an app password from Google Account settings.

3. Run the server:
   ```
   npm start
   ```

4. Open http://localhost:3000 in your browser.

## Features

- Form with fields for name, phone, address, gender, DOB, SSN
- Photo uploads for driver's license/ID (front and back) and selfie
- Submits data and sends email with attachments to specified Gmail# verify
