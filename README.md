# Personal Information Verification Form

A full-stack application with a form to collect and verify personal information with file uploads, using Express.js backend and Resend for email delivery.

## Project Structure

```
gb/
├── server.js           # Express backend server
├── package.json        # Node dependencies
├── .env.example        # Environment variables template
├── README.md           # This file
└── public/
    └── index.html      # Frontend form
```

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **File Upload**: Multer
- **Email**: Resend
- **Hosting**: Vercel (Frontend), Render (Backend)

## Setup Instructions

### 1. Local Development

#### Prerequisites
- Node.js 18.x or higher
- npm or yarn

#### Backend Setup

```bash
cd gb

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# RESEND_API_KEY=your_resend_api_key
# RECIPIENT_EMAIL=your-email@example.com
# SENDER_EMAIL=noreply@yourdomain.com
# FRONTEND_URL=http://localhost:3000
# PORT=3000

# Start the server
npm start

# For development with auto-reload
npm run dev
```

The server will start on `http://localhost:3000`

#### Frontend Setup

For local development, you can:
- Open `public/index.html` directly in the browser, or
- Serve it using the Express server at `http://localhost:3000`

### 2. Deployment

#### Backend Deployment to Render

1. **Create Render Account**: https://render.com
2. **Connect GitHub Repository**: Link your GitHub repo in Render
3. **Create Web Service**:
   - Select your repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables:
     - `RESEND_API_KEY`: Your Resend API key
     - `RECIPIENT_EMAIL`: Email to receive form submissions
     - `SENDER_EMAIL`: Sender email (should match Resend domain)
     - `FRONTEND_URL`: Your Vercel frontend URL
     - `NODE_ENV`: `production`
4. Deploy

Get your Render backend URL (e.g., `https://your-app.onrender.com`)

#### Frontend Deployment to Vercel

1. **Create Vercel Account**: https://vercel.com
2. **Deploy**:
   - Connect your GitHub repo
   - Set root directory: `gb/public`
   - Add environment variable:
     - `REACT_APP_API_URL`: Your Render backend URL
3. Deploy

Vercel will give you a frontend URL (e.g., `https://your-app.vercel.app`)

#### Update Backend URL in Frontend

After deploying to Vercel, update the `API_URL` in public/index.html:

```javascript
const API_URL = 'https://your-render-backend.onrender.com';
```

### 3. Resend Setup

1. **Sign up**: https://resend.com
2. **Get API Key**: Copy your API key from the dashboard
3. **Configure Domain**:
   - Add your domain (required for production email sending)
   - For testing, use the default Resend testing domain
4. **Add to Environment Variables**: Set `RESEND_API_KEY` in Render

## API Endpoints

### POST `/api/submit`
Submit form with files

**Request**: `multipart/form-data`
```
- fullName: string (required)
- lastName: string (required)
- phoneNumber: string (required, format: (123) 456-7890)
- address: string (required)
- gender: string (required, enum: male, female, other)
- dateOfBirth: string (required, ISO date)
- ssn: string (required, format: 123-45-6789)
- driversLicenseFront: file (required, image)
- driversLicenseBack: file (required, image)
- selfie: file (required, image)
```

**Response**: `application/json`
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "emailId": "email_id_from_resend"
}
```

### GET `/health`
Health check endpoint

**Response**:
```json
{
  "status": "Server is running"
}
```

## Features

✅ **Form Validation**:
- Client-side validation
- Server-side validation
- Phone number and SSN formatting
- File size validation (max 5MB)
- Image file format validation

✅ **File Upload**:
- Multiple file uploads
- In-memory storage (Render compatible)
- Base64 encoding for email attachments

✅ **Email Integration**:
- Resend email service
- HTML formatted emails
- File attachment support
- Error handling and logging

✅ **CORS Support**:
- Cross-origin requests enabled
- Configurable by environment variable

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | API key from Resend dashboard |
| `SENDER_EMAIL` | No | Sender email (default: onboarding@resend.dev) |
| `RECIPIENT_EMAIL` | No | Email to receive submissions (default: delivered@resend.dev) |
| `PORT` | No | Server port (default: 3000) |
| `FRONTEND_URL` | No | Frontend URL for CORS (default: http://localhost:3000) |
| `NODE_ENV` | No | Environment (development/production) |

## Troubleshooting

### Form submission fails with CORS error
- Ensure `FRONTEND_URL` environment variable is set correctly in Render
- Check that frontend and backend URLs are correct in your code

### Emails not being sent
- Verify `RESEND_API_KEY` is correct
- Check `RECIPIENT_EMAIL` and `SENDER_EMAIL` are valid
- If using custom domain, ensure it's verified in Resend dashboard

### Files not uploading
- Check file size (max 5MB)
- Ensure file is an image format
- Check console for error messages

### Backend not connecting to frontend
- Update `API_URL` in public/index.html with your Render URL
- Ensure Render backend is running (`npm start`)
- Check network tab in browser DevTools

## Development

### Run locally
```bash
npm run dev
```

### Test in browser
Navigate to `http://localhost:3000` or open `public/index.html`

### Test API endpoint
```bash
curl -X GET http://localhost:3000/health
```

## License

ISC

## Security Notes

⚠️ **Important**: This form collects sensitive personal information (SSN, ID photos). 

- Use HTTPS in production
- Implement proper authentication
- Add rate limiting
- Store files securely
- Consider implementing email verification
- Add CAPTCHA to prevent spam
- Review data retention policies
