const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
// Middleware
app.use(cors());
app.use(express.json());
console.log(`${process.env.MONGO_URL} , ${process.env.EMAIL_USER} , ${process.env.EMAIL_PASS}`)
// MongoDB Cluster Connection
const MONGO_URI = process.env.MONGO_URL;
mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB Cluster"))
  .catch((err) => console.error("MongoDB Connection Error:", err));



// ---------------------------------------------------------
// Nodemailer transporter
// ---------------------------------------------------------
// Requires these in .env.local:
//   EMAIL_SERVICE=gmail          (or omit and use EMAIL_HOST/EMAIL_PORT instead)
//   EMAIL_USER=youraddress@gmail.com
//   EMAIL_PASS=your-16-char-app-password   <-- NOT your normal Gmail password
//
// Gmail (and most providers) reject plain account passwords for SMTP —
// you need an "App Password" generated from your Google Account's
// Security settings (requires 2FA to be enabled first).
const transporter = nodemailer.createTransport(
  process.env.EMAIL_HOST
    ? {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for port 465, false for 587
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      }
    : {
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      }
);

// Verify the transporter once at startup so a bad config shows up in the
// logs immediately instead of silently failing on someone's first login.
transporter.verify()
  .then(() => console.log("Email transporter ready"))
  .catch((err) => console.error("Email transporter config error:", err.message));

// Fire-and-forget — the caller does NOT await this, so a slow or down
// mail server never delays/blocks the login response itself.
function sendLoginNotification(toEmail, name) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'New login to Chaturanga',
    text: `Hi ${name || ''},\n\nYou just logged in to Chaturanga.\n\nIf this wasn't you, please secure your account.`,
    html: `
      <div style="font-family:sans-serif; color:#2a0e0e; padding:16px;">
        <h2 style="color:#8a6e2f;">चतुरंग · Chaturanga</h2>
        <p>Hi ${name || 'there'},</p>
        <p><strong>You just logged in to Chaturanga.</strong></p>
        <p style="color:#777; font-size:0.85rem;">If this wasn't you, please secure your account immediately.</p>
      </div>
    `
  };

  transporter.sendMail(mailOptions)
    .then(() => console.log(`Login notification sent to ${toEmail}`))
    .catch((err) => console.error(`Failed to send login notification to ${toEmail}:`, err.message));
}



function sendRegisterNotification(toEmail, name) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'New login to Chaturanga',
    text: `Hi ${name || ''},\n\nYou just logged in to Chaturanga.\n\nIf this wasn't you, please secure your account.`,
    html: `
      <div style="font-family:sans-serif; color:#2a0e0e; padding:16px;">
        <h2 style="color:#8a6e2f;">चतुरंग · Chaturanga</h2>
        <p>Hi ${name || 'there'},</p>
        <p><strong>Welcome to chaturanga ! just registerd to chaturanga !!.</strong></p>
        <p style="color:#777; font-size:0.85rem;">If this wasn't you, please secure your account immediately.</p>
      </div>
    `
  };

  transporter.sendMail(mailOptions)
    .then(() => console.log(`Login notification sent to ${toEmail}`))
    .catch((err) => console.error(`Failed to send login notification to ${toEmail}:`, err.message));
}
// Mongoose User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true } ,
  last50games: [{
  startedAt: { type: Date },
  endedAt: { type: Date, default: Date.now },
  type: { type: String, enum: ['1bot', '2bot', '3bot'] },
  result: { type: String, enum: ['win', 'defeat', 'quitted'] }
}]
});


app.post('/api/user/game-history', async (req, res) => {
  try {
    const { userId, startedAt, endedAt, type, result } = req.body;

    if (!userId || !type || !result) {
      return res.status(400).json({ error: 'Missing required fields' });
    }




    console.log(result);
    const newGame = {
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      endedAt: endedAt ? new Date(endedAt) : new Date(),
      type,
      result
    };

    // $position: 0 puts newest first; $slice: 50 caps array size at 50
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          last50games: {
            $each: [newGame],
            $position: 0,
            $slice: 50
          }
        }
      },
      { new: true }
    );

    res.json({ success: true, history: updatedUser.last50games });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const User = mongoose.model('User', userSchema);



// Inside your User Schema definition




// API Endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });

    sendRegisterNotification(user.email , user.name);

    res.status(201).json({ success: true, message: "Registered successfully", user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({ success: true, message: "Login successful", user });

    // Send AFTER the response — the person isn't kept waiting on the network
    // round-trip to the mail server just to see "Login successful".
    sendLoginNotification(user.email, user.name);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Email not found" });
    }

    res.status(200).json({ success: true, message: "Password reset instructions sent" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));