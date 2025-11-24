import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import twilio from "twilio";
import User from "./models/User.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(cors());
// serve the UI from public/
app.use(express.static("public"));


// -------------------------
// CONNECT TO MONGODB
// -------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// -------------------------
// TWILIO SETUP
// -------------------------
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// -------------------------
// ROUTE: SEND OTP
// -------------------------
app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone number required" });
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save/Update OTP in DB
    const user = await User.findOneAndUpdate(
      { phone },
      {
        phone,
        otp,
        otpExpiresAt: Date.now() + 5 * 60 * 1000 // expires in 5 minutes
      },
      { upsert: true, new: true }
    );

    // Send OTP via SMS
    await client.messages.create({
      body: `${otp} is your verification code.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// -------------------------
// ROUTE: VERIFY OTP
// -------------------------
app.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: "Phone and OTP required" });
  }

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // OTP verified — you can generate JWT here if needed
    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// -------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
