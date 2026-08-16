const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------
// MongoDB connection
// ---------------------------------------------------------
const MONGO_URI = process.env.MONGO_URL;


console.log(MONGO_URI)
if (!MONGO_URI) {
  console.error('MONGO_URL is not set — check your .env.local file.');
}



mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Cluster'))
  .catch((err) => console.error('MongoDB Connection Error:', err.message));

// ---------------------------------------------------------
// Nodemailer transporter
// ---------------------------------------------------------
// Requires in .env.local:
//   EMAIL_SERVICE=gmail (or EMAIL_HOST/EMAIL_PORT instead)
//   EMAIL_USER=youraddress@gmail.com
//   EMAIL_PASS=your-16-char-app-password  <-- an App Password, not your normal password
const transporter = nodemailer.createTransport(
  process.env.EMAIL_HOST
    ? {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      }
    : {
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      }
);

transporter.verify()
  .then(() => console.log('Email transporter ready'))
  .catch((err) => console.error('Email transporter config error:', err.message));

// Fire-and-forget — never block the response the user is waiting on.
function sendMail(toEmail, subject, name, bodyHtml) {
  if (!toEmail) return;
  transporter.sendMail({ from: process.env.EMAIL_USER, to: toEmail, subject, html: bodyHtml })
    .then(() => console.log(`Email sent to ${toEmail}`))
    .catch((err) => console.error(`Failed to send email to ${toEmail}:`, err.message));
}


// ---------------------------------------------------------
// Pending registration schema (holds name/email/OTP until
// the email is verified and a password is set)
// ---------------------------------------------------------
const pendingRegistrationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  otp: { type: String, required: true },
  otpExpires: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 3600 } // auto-cleanup after 1hr
});

const PendingRegistration = mongoose.model('PendingRegistration', pendingRegistrationSchema);

function signupOtpHtml(name, otp) {
  return `
    <div style="font-family:sans-serif; color:#2a0e0e; padding:20px; background:#faf8f5; border:1px solid #c8960c; border-radius:8px;">
      <h2 style="color:#8a6e2f; margin-top:0;">चतुरंग · Chaturanga</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Use this code to verify your email and finish creating your account.</p>
      <div style="background:#110e05; color:#c8960c; font-size:2rem; font-weight:700; letter-spacing:6px; padding:12px 24px; text-align:center; border-radius:6px; margin:16px 0;">
        ${otp}
      </div>
      <p style="font-size:0.85rem; color:#666;">This code is valid for <strong>10 minutes</strong>. If you didn't request this, you can ignore it.</p>
    </div>`;
}



function loginEmailHtml(name) {
  return `
    <div style="font-family:sans-serif; color:#2a0e0e; padding:16px;">
      <h2 style="color:#8a6e2f;">चतुरंग · Chaturanga</h2>
      <p>Hi ${name || 'there'},</p>
      <p><strong>You just logged in to Chaturanga.</strong></p>
      <p style="color:#777; font-size:0.85rem;">If this wasn't you, please secure your account immediately.</p>
    </div>`;
}
function registerEmailHtml(name) {
  return `
    <div style="font-family:sans-serif; color:#2a0e0e; padding:16px;">
      <h2 style="color:#8a6e2f;">चतुरंग · Chaturanga</h2>
      <p>Hi ${name || 'there'},</p>
      <p><strong>Welcome to Chaturanga! Your account has been created.</strong></p>
    </div>`;
}

// ---------------------------------------------------------
// User schema
// ---------------------------------------------------------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  elo: { type: Number}, // matches the WS server's starting elo assumption
  resetOtp: { type: String, default: null },
  resetOtpExpires: { type: Date, default: null },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fromName: { type: String, required: true },
    fromEmail: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  last50games: [{
    startedAt: { type: Date },
    endedAt: { type: Date, default: Date.now },
    type: { type: String, enum: ['1bot', '2bot', '3bot', 'pvp'] },
    result: { type: String, enum: ['win', 'defeat', 'quitted'] }
  }], 

  puzzleProgress: {
    elo: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastSolvedDate: { type: Date, default: null },
    solved: { type: [String], default: [] }
  }
}, { timestamps: true });

// Hash on create AND on update — anywhere .save() runs with a modified password.
userSchema.pre('save', async function () {
  // If password wasn't modified, just exit the function early
  if (!this.isModified('password')) return;

  // Hash the password asynchronously
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Never let the password field leave the server, even by accident.
userSchema.set('toJSON', {
  transform: (_doc, ret) => { delete ret.password; return ret; }
});

const User = mongoose.model('User', userSchema);

// ---------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------

// CREATE


// GET current progress
app.get('/api/puzzles/progress/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('puzzleProgress');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, progress: user.puzzleProgress || { elo: 1200, streak: 0, solved: [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error retrieving progress' });
  }
});

// POST — record a solve (upserts by puzzleId, recalculates streak/elo server-side)
app.post('/api/puzzles/progress/:userId/solve', async (req, res) => {
  try {
    const { puzzleId, score, hintsUsed, eloDelta } = req.body;
    if (!puzzleId) return res.status(400).json({ success: false, message: 'puzzleId required' });

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.puzzleProgress) user.puzzleProgress = { elo: 1200, streak: 0, solved: [] };

    const alreadySolved = user.puzzleProgress.solved.includes(puzzleId);
    if (!alreadySolved) {
      user.puzzleProgress.solved.push(puzzleId);

      const today = new Date().toDateString();
      const lastDay = user.puzzleProgress.lastSolvedDate ? new Date(user.puzzleProgress.lastSolvedDate).toDateString() : null;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastDay === today) { /* same day, streak unchanged */ }
      else if (lastDay === yesterday) { user.puzzleProgress.streak += 1; }
      else { user.puzzleProgress.streak = 1; }
      user.puzzleProgress.lastSolvedDate = new Date();

      if (typeof eloDelta === 'number') {
        user.puzzleProgress.elo = Math.max(0, (user.puzzleProgress.elo || 1200) + eloDelta);
      }
    }

    await user.save();
    res.json({ success: true, progress: user.puzzleProgress });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error saving progress' });
  }
});


// STEP 1 — send OTP to verify the email before any account exists
app.post('/api/auth/register/send-otp', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert so re-requesting a code just refreshes it
    await PendingRegistration.findOneAndUpdate(
      { email: cleanEmail },
      { name: name.trim(), email: cleanEmail, otp, otpExpires, verified: false, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    sendMail(cleanEmail, 'Verify your Chaturanga email', name, signupOtpHtml(name, otp));
    res.status(200).json({ success: true, message: `OTP sent to ${cleanEmail}. Please check your inbox!` });
  } catch (err) {
    console.error('Send signup OTP error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// STEP 2 — verify the OTP (email is confirmed, but no account yet)
app.post('/api/auth/register/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }
    const cleanEmail = email.toLowerCase().trim();

    const pending = await PendingRegistration.findOne({ email: cleanEmail });
    if (!pending) {
      return res.status(404).json({ success: false, message: 'No pending registration found for this email. Please request a new OTP.' });
    }
    if (pending.otp !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check and try again.' });
    }
    if (Date.now() > new Date(pending.otpExpires).getTime()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    pending.verified = true;
    await pending.save();

    res.status(200).json({ success: true, message: 'Email verified! Now set your password.' });
  } catch (err) {
    console.error('Verify signup OTP error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// STEP 3 — set password and actually create the account
app.post('/api/auth/register/set-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }
    const cleanEmail = email.toLowerCase().trim();

    const pending = await PendingRegistration.findOne({ email: cleanEmail });
    if (!pending || !pending.verified) {
      return res.status(400).json({ success: false, message: 'Email not verified. Please verify your email with an OTP first.' });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      await PendingRegistration.deleteOne({ email: cleanEmail });
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name: pending.name, email: cleanEmail, password, elo: 200 });
    await PendingRegistration.deleteOne({ email: cleanEmail });

    res.status(201).json({ success: true, message: 'Registered successfully', user });
    sendMail(user.email, 'Welcome to Chaturanga', user.name, registerEmailHtml(user.name));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    console.error('Set-password error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// READ (login also acts as an identity check)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({ success: true, message: 'Login successful', user });
    sendMail(user.email, 'New login to Chaturanga', user.name, loginEmailHtml(user.name));
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// SEND OTP FOR PASSWORD RESET
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with that email address.' });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const otpHtml = `
      <div style="font-family:sans-serif; color:#2a0e0e; padding:20px; background:#faf8f5; border:1px solid #c8960c; border-radius:8px;">
        <h2 style="color:#8a6e2f; margin-top:0;">चतुरंग · Chaturanga Recovery Seal</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>You requested a password reset for your Chaturanga account.</p>
        <div style="background:#110e05; color:#c8960c; font-size:2rem; font-weight:700; letter-spacing:6px; padding:12px 24px; text-align:center; border-radius:6px; margin:16px 0;">
          ${otp}
        </div>
        <p style="font-size:0.85rem; color:#666;">This OTP is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
      </div>`;

    sendMail(user.email, 'Chaturanga Password Recovery OTP', user.name, otpHtml);
    res.status(200).json({ success: true, message: `OTP sent to ${user.email}. Please check your inbox!` });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// VERIFY OTP & RESET PASSWORD
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with that email address.' });
    }

    if (otp || newPassword) {
      if (!otp) {
        return res.status(400).json({ success: false, message: 'OTP code is required' });
      }
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
      }

      if (!user.resetOtp || user.resetOtp !== String(otp).trim()) {
        return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check your email and try again.' });
      }

      if (!user.resetOtpExpires || Date.now() > new Date(user.resetOtpExpires).getTime()) {
        return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new OTP.' });
      }

      user.password = newPassword; // pre('save') hook automatically hashes this via bcrypt
      user.resetOtp = null;
      user.resetOtpExpires = null;
      await user.save();

      sendMail(user.email, 'Chaturanga Password Reset Successful', user.name, `
        <div style="font-family:sans-serif; color:#2a0e0e; padding:16px;">
          <h2 style="color:#8a6e2f;">चतुरंग · Chaturanga</h2>
          <p>Hi ${user.name || 'there'},</p>
          <p><strong>Your Chaturanga account password has been successfully reset.</strong></p>
          <p style="color:#777; font-size:0.85rem;">If you did not request this change, please contact support immediately.</p>
        </div>
      `);
      return res.status(200).json({ success: true, message: 'Password reset successfully! You can now log in.' });
    }

    res.status(200).json({ success: true, message: 'Account verified.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------------------------------------------------
// User CRUD
// ---------------------------------------------------------

// READ one
app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    console.log(user);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
});

// READ all (paginated)
app.get('/api/users', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const users = await User.find({}, '-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const total = await User.countDocuments();
    res.json({ success: true, count: users.length, total, page, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error retrieving users' });
  }
});

// UPDATE
app.put('/api/user/:id', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase().trim();
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
      }
      user.password = password; // re-hashed by the pre-save hook
    }

    await user.save();
    res.json({ success: true, message: 'Profile updated', user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }
    console.error('Update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE
app.delete('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error deleting account' });
  }
});

// ---------------------------------------------------------
// Leaderboard + game history (registered accounts only —
// guests are tracked separately by the WS game server)
// ---------------------------------------------------------

app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await User.find({}, 'name elo email')
      .sort({ elo: -1 })
      .limit(100)
      .lean();
    res.status(200).json({ success: true, count: users.length, leaderboard: users });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve leaderboard data.' });
  }
});

// Called server-to-server from the WS game server (port 8765) after a game
// ends for a logged-in player. This is the ONLY place a registered user's
// elo/history is written — the WS server never double-books it locally.
app.post('/api/user/game-history', async (req, res) => {
  try {
    const { userId, startedAt, endedAt, type, result, newElo } = req.body;

    if (!userId || !type || !result || typeof newElo !== 'number') {
      return res.status(400).json({ success: false, error: 'Missing required fields (userId, type, result, newElo)' });
    }

    const newGame = {
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      endedAt: endedAt ? new Date(endedAt) : new Date(),
      type,
      result
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: { elo: newElo },
        $push: { last50games: { $each: [newGame], $position: 0, $slice: 50 } }
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ success: false, error: 'User not found' });

    res.json({ success: true, elo: updatedUser.elo, history: updatedUser.last50games });
  } catch (err) {
    console.error('game-history error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------
// Friends & Social System
// ---------------------------------------------------------

// GET friends list and pending requests for a user
app.get('/api/friends/list/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('friends', 'name email elo createdAt')
      .lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      friends: user.friends || [],
      friendRequests: user.friendRequests || []
    });
  } catch (err) {
    console.error('Fetch friends error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// SEND a friend request by email
app.post('/api/friends/request', async (req, res) => {
  try {
    const { userId, targetEmail, targetUserId } = req.body;
    if (!userId || (!targetEmail && !targetUserId)) {
      return res.status(400).json({ success: false, message: 'User ID and a target email or user ID are required' });
    }

    const sender = await User.findById(userId);
    if (!sender) return res.status(404).json({ success: false, message: 'Sender user not found' });

    let target;
    if (targetUserId) {
      // Sent from the "All Warriors" list, where we already have the id.
      if (String(targetUserId) === String(sender._id)) {
        return res.status(400).json({ success: false, message: 'You cannot send a friend request to yourself.' });
      }
      target = await User.findById(targetUserId);
    } else {
      const cleanEmail = targetEmail.toLowerCase().trim();
      if (sender.email.toLowerCase() === cleanEmail) {
        return res.status(400).json({ success: false, message: 'You cannot send a friend request to yourself.' });
      }
      target = await User.findOne({ email: cleanEmail });
    }
    if (!target) {
      return res.status(404).json({ success: false, message: 'No registered user found with that email address.' });
    }

    // Check if already friends
    if (sender.friends && sender.friends.some(f => f.toString() === target._id.toString())) {
      return res.status(400).json({ success: false, message: 'You are already friends with this warrior!' });
    }

    // Check if pending request already sent
    const alreadyRequested = target.friendRequests && target.friendRequests.some(r => r.fromUserId.toString() === sender._id.toString());
    if (alreadyRequested) {
      return res.status(400).json({ success: false, message: 'Friend request already sent to this warrior.' });
    }

    if (!target.friendRequests) target.friendRequests = [];
    target.friendRequests.push({
      fromUserId: sender._id,
      fromName: sender.name,
      fromEmail: sender.email,
      createdAt: new Date()
    });
    await target.save();

    res.json({ success: true, message: `Friend request sent to ${target.name}!` });
  } catch (err) {
    console.error('Send friend request error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ACCEPT a friend request
app.post('/api/friends/accept', async (req, res) => {
  try {
    const { userId, requesterId } = req.body;
    if (!userId || !requesterId) {
      return res.status(400).json({ success: false, message: 'userId and requesterId are required' });
    }

    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove from friendRequests
    user.friendRequests = (user.friendRequests || []).filter(r => r.fromUserId.toString() !== requesterId.toString());

    // Add to mutual friends
    if (!user.friends) user.friends = [];
    if (!requester.friends) requester.friends = [];

    if (!user.friends.some(f => f.toString() === requesterId.toString())) {
      user.friends.push(requester._id);
    }
    if (!requester.friends.some(f => f.toString() === userId.toString())) {
      requester.friends.push(user._id);
    }

    await user.save();
    await requester.save();

    res.json({ success: true, message: `Accepted friend request from ${requester.name}!` });
  } catch (err) {
    console.error('Accept friend error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// REJECT a friend request
app.post('/api/friends/reject', async (req, res) => {
  try {
    const { userId, requesterId } = req.body;
    if (!userId || !requesterId) {
      return res.status(400).json({ success: false, message: 'userId and requesterId are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.friendRequests = (user.friendRequests || []).filter(r => r.fromUserId.toString() !== requesterId.toString());
    await user.save();

    res.json({ success: true, message: 'Friend request declined.' });
  } catch (err) {
    console.error('Reject friend error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// REMOVE a friend
app.post('/api/friends/remove', async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    if (!userId || !friendId) {
      return res.status(400).json({ success: false, message: 'userId and friendId are required' });
    }

    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    res.json({ success: true, message: 'Friend removed.' });
  } catch (err) {
    console.error('Remove friend error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));