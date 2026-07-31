const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------
// MongoDB connection
// ---------------------------------------------------------
const MONGO_URI = process.env.MONGO_URL;
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
  elo: { type: Number, default: 1200 }, // matches the WS server's starting elo assumption
  last50games: [{
    startedAt: { type: Date },
    endedAt: { type: Date, default: Date.now },
    type: { type: String, enum: ['1bot', '2bot', '3bot', 'pvp'] },
    result: { type: String, enum: ['win', 'defeat', 'quitted'] }
  }]
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
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // No explicit elo here — the schema default (1200) applies.
    const user = await User.create({ name, email, password });

    res.status(201).json({ success: true, message: 'Registered successfully', user });
    sendMail(user.email, 'Welcome to Chaturanga', user.name, registerEmailHtml(user.name));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    console.error('Register error:', err);
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

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }
    // TODO: generate + email a real reset token. Placeholder response for now.
    res.status(200).json({ success: true, message: 'Password reset instructions sent' });
  } catch (err) {
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

app.listen(5000, () => console.log('Server running on port 5000'));