require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;
const OTP_TTL_MS = 10 * 60 * 1000;

app.use(cors());
app.use(express.json());

const otpStore = new Map();
const emailChangeOtpStore = new Map();

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateOTP() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function createTransporter() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP is not configured. Add SMTP_HOST, SMTP_USER and SMTP_PASS to .env");
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || "false") === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

app.get("/api/health", (req, res) => {
    res.json({ ok: true, service: "RailBlock-AI OTP service" });
});

app.post("/api/request-password-reset", async (req, res) => {
    const email = normalizeEmail(req.body.email);

    if (!validEmail(email)) {
        return res.status(400).json({ message: "Enter a valid email address." });
    }

    try {
        const otp = generateOTP();
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + OTP_TTL_MS,
            attempts: 0
        });

        const transporter = createTransporter();

        await transporter.sendMail({
            from: process.env.MAIL_FROM || process.env.SMTP_USER,
            to: email,
            subject: "RailBlock-AI Password Reset OTP",
            text:
`Your RailBlock-AI password reset OTP is ${otp}.

This OTP expires in 10 minutes.
If you did not request a password reset, ignore this email.`,
            html:
`<div style="font-family:Arial,sans-serif;max-width:600px">
  <h2>RailBlock-AI Password Reset</h2>
  <p>Your one-time verification code is:</p>
  <div style="font-size:32px;font-weight:800;letter-spacing:8px">${otp}</div>
  <p>This OTP expires in <b>10 minutes</b>.</p>
  <p>If you did not request a password reset, you can safely ignore this email.</p>
</div>`
        });

        return res.json({ message: "OTP sent successfully." });
    } catch (error) {
        console.error("OTP email error:", error);
        otpStore.delete(email);
        return res.status(500).json({
            message: "Unable to send OTP email. Check the backend SMTP configuration."
        });
    }
});

app.post("/api/request-email-change", async (req, res) => {
    const oldEmail = normalizeEmail(req.body.oldEmail);
    const newEmail = normalizeEmail(req.body.newEmail);

    if (!validEmail(oldEmail) || !validEmail(newEmail)) {
        return res.status(400).json({ message: "Enter valid email addresses." });
    }

    if (oldEmail === newEmail) {
        return res.status(400).json({
            message: "New email must be different from the current email."
        });
    }

    try {
        const otp = generateOTP();

        emailChangeOtpStore.set(newEmail, {
            otp,
            oldEmail,
            expiresAt: Date.now() + OTP_TTL_MS,
            attempts: 0
        });

        const transporter = createTransporter();

        await transporter.sendMail({
            from: process.env.MAIL_FROM || process.env.SMTP_USER,
            to: newEmail,
            subject: "RailBlock-AI Email Change Verification",
            text:
`Your RailBlock-AI email-change OTP is ${otp}.

This OTP expires in 10 minutes.
If you did not request this change, ignore this email.`,
            html:
`<div style="font-family:Arial,sans-serif;max-width:600px">
  <h2>RailBlock-AI Email Change</h2>
  <p>Your one-time verification code is:</p>
  <div style="font-size:32px;font-weight:800;letter-spacing:8px">${otp}</div>
  <p>This OTP expires in <b>10 minutes</b>.</p>
  <p>If you did not request this change, ignore this email.</p>
</div>`
        });

        return res.json({ message: "Email-change OTP sent successfully." });
    } catch (error) {
        console.error("Email change OTP error:", error);
        emailChangeOtpStore.delete(newEmail);

        return res.status(500).json({
            message: "Unable to send email-change OTP. Check SMTP configuration."
        });
    }
});

app.post("/api/confirm-email-change", (req, res) => {
    const oldEmail = normalizeEmail(req.body.oldEmail);
    const newEmail = normalizeEmail(req.body.newEmail);
    const otp = String(req.body.otp || "").trim();

    const record = emailChangeOtpStore.get(newEmail);

    if (!record) {
        return res.status(400).json({
            message: "Email-change OTP not found. Request a new OTP."
        });
    }

    if (Date.now() > record.expiresAt) {
        emailChangeOtpStore.delete(newEmail);
        return res.status(400).json({
            message: "OTP has expired. Request a new OTP."
        });
    }

    if (record.oldEmail !== oldEmail || record.otp !== otp) {
        record.attempts += 1;

        if (record.attempts >= 5) {
            emailChangeOtpStore.delete(newEmail);
            return res.status(429).json({
                message: "Too many incorrect attempts. Request a new OTP."
            });
        }

        return res.status(400).json({
            message: "Incorrect email-change OTP."
        });
    }

    emailChangeOtpStore.delete(newEmail);

    return res.json({
        message: "Email change verified."
    });
});


app.post("/api/request-email-change", async (req, res) => {
    const email = normalizeEmail(req.body.email);
    if (!validEmail(email)) return res.status(400).json({ message: "Enter a valid email address." });
    try {
        const otp = generateOTP();
        otpStore.set(`email-change:${email}`, { otp, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });
        const transporter = createTransporter();
        await transporter.sendMail({
            from: process.env.MAIL_FROM || process.env.SMTP_USER,
            to: email,
            subject: "RailBlock-AI Email Change Verification",
            text: `Your RailBlock-AI email verification OTP is ${otp}. This OTP expires in 10 minutes.`,
            html: `<div style="font-family:Arial,sans-serif;max-width:600px"><h2>RailBlock-AI Email Verification</h2><p>Your one-time verification code is:</p><div style="font-size:32px;font-weight:800;letter-spacing:8px">${otp}</div><p>This OTP expires in <b>10 minutes</b>.</p></div>`
        });
        res.json({ message: "Email verification OTP sent." });
    } catch (error) {
        console.error("Email change OTP error:", error);
        otpStore.delete(`email-change:${email}`);
        res.status(500).json({ message: "Unable to send email verification OTP. Check SMTP configuration." });
    }
});

app.post("/api/verify-email-change", (req, res) => {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    if (!validEmail(email) || !/^\d{6}$/.test(otp)) return res.status(400).json({ message: "Invalid email or OTP." });
    const key = `email-change:${email}`;
    const record = otpStore.get(key);
    if (!record) return res.status(400).json({ message: "OTP not found. Request a new OTP." });
    if (Date.now() > record.expiresAt) { otpStore.delete(key); return res.status(400).json({ message: "OTP has expired. Request a new OTP." }); }
    if (record.otp !== otp) {
        record.attempts += 1;
        if (record.attempts >= 5) { otpStore.delete(key); return res.status(429).json({ message: "Too many incorrect attempts. Request a new OTP." }); }
        return res.status(400).json({ message: "Incorrect OTP." });
    }
    otpStore.delete(key);
    res.json({ message: "Email verified successfully." });
});

app.post("/api/reset-password", (req, res) => {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    const newPassword = String(req.body.newPassword || "");

    if (!validEmail(email) || !/^\d{6}$/.test(otp)) {
        return res.status(400).json({ message: "Invalid email or OTP." });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            message: "New password must contain at least 6 characters."
        });
    }

    const record = otpStore.get(email);

    if (!record) {
        return res.status(400).json({
            message: "OTP not found. Request a new OTP."
        });
    }

    if (Date.now() > record.expiresAt) {
        otpStore.delete(email);
        return res.status(400).json({
            message: "OTP has expired. Request a new OTP."
        });
    }

    if (record.otp !== otp) {
        record.attempts += 1;

        if (record.attempts >= 5) {
            otpStore.delete(email);
            return res.status(429).json({
                message: "Too many incorrect attempts. Request a new OTP."
            });
        }

        return res.status(400).json({
            message: "Incorrect OTP."
        });
    }

    // OTP is single-use.
    otpStore.delete(email);

    return res.json({
        message: "OTP verified. Password reset is authorized."
    });
});

app.listen(PORT, () => {
    console.log(`RailBlock-AI OTP server running at http://localhost:${PORT}`);
});
