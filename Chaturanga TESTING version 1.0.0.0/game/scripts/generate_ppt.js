const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();

// Configure presentation
pptx.layout = 'LAYOUT_16x9';

// Theme colors (HEX)
const COLORS = {
  bgDark: '1A150F',     // Very dark warm brown/black vellum
  bgCard: '262017',     // Slightly lighter brown for cards/boxes
  textPrimary: 'E6DFD5',// Warm cream for text
  textMuted: 'A69F95',  // Warm grey-cream for descriptions
  gold: 'C8960C',       // Ancient gold
  bronze: '8A6E2F',     // Muted gold/bronze
  border: '3A3226',     // Subtle divider borders
  success: '4A7C59',    // Soft sage green for successful actions
  warning: 'C28B2B'     // Muted amber
};

// Helper: Setup slide header and borders
function addSlideHeader(slide, title) {
  // Slide background
  slide.background = { fill: COLORS.bgDark };
  
  // Slide border
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.2, y: 0.2, w: 12.933, h: 7.1,
    fill: { color: COLORS.bgDark },
    line: { color: COLORS.border, width: 1.5 }
  });
  
  // Decorative corner brackets (visual enhancement)
  slide.addText('+', { x: 0.15, y: 0.1, w: 0.3, h: 0.3, fontSize: 16, color: COLORS.gold, fontFace: 'Georgia' });
  slide.addText('+', { x: 12.95, y: 0.1, w: 0.3, h: 0.3, fontSize: 16, color: COLORS.gold, fontFace: 'Georgia' });
  slide.addText('+', { x: 0.15, y: 7.15, w: 0.3, h: 0.3, fontSize: 16, color: COLORS.gold, fontFace: 'Georgia' });
  slide.addText('+', { x: 12.95, y: 7.15, w: 0.3, h: 0.3, fontSize: 16, color: COLORS.gold, fontFace: 'Georgia' });

  // Header text
  slide.addText(title, {
    x: 0.6, y: 0.4, w: 11.5, h: 0.6,
    fontSize: 22,
    fontFace: 'Georgia',
    color: COLORS.gold,
    bold: true,
    align: 'left'
  });
  
  // Subtle divider line below header
  slide.addShape(pptx.shapes.LINE, {
    x: 0.6, y: 1.0, w: 12.133, h: 0,
    line: { color: COLORS.border, width: 1.5 }
  });

  // Footer
  slide.addText('चतुरंग · Chaturanga Architecture v1.0.0.0', {
    x: 0.6, y: 6.85, w: 6.0, h: 0.3,
    fontSize: 9,
    fontFace: 'Arial',
    color: COLORS.textMuted
  });
}

// ============================================================================
// SLIDE 1: Title Slide (Sanskrit Theme)
// ============================================================================
{
  const slide = pptx.addSlide();
  slide.background = { fill: COLORS.bgDark };

  // Double gold borders for title page
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.2, y: 0.2, w: 12.933, h: 7.1,
    fill: { color: COLORS.bgDark },
    line: { color: COLORS.gold, width: 2 }
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.28, y: 0.28, w: 12.773, h: 6.94,
    fill: { color: COLORS.bgDark },
    line: { color: COLORS.border, width: 1 }
  });

  // Ornamental corner markers
  const bracketSize = 0.5;
  const bracketProps = { fontSize: 24, color: COLORS.gold, fontFace: 'Georgia', bold: true };
  slide.addText('╔', { x: 0.35, y: 0.3, w: bracketSize, h: bracketSize, ...bracketProps });
  slide.addText('╗', { x: 12.55, y: 0.3, w: bracketSize, h: bracketSize, ...bracketProps, align: 'right' });
  slide.addText('╚', { x: 0.35, y: 6.7, w: bracketSize, h: bracketSize, ...bracketProps });
  slide.addText('╝', { x: 12.55, y: 6.7, w: bracketSize, h: bracketSize, ...bracketProps, align: 'right' });

  // Main Title (Sanskrit script and phonetic English name)
  slide.addText('चतुरंग · Chaturanga', {
    x: 1.0, y: 2.2, w: 11.333, h: 1.2,
    fontSize: 48,
    fontFace: 'Georgia',
    color: COLORS.gold,
    bold: true,
    align: 'center'
  });

  // Divider
  slide.addShape(pptx.shapes.LINE, {
    x: 4.5, y: 3.5, w: 4.333, h: 0,
    line: { color: COLORS.gold, width: 2 }
  });

  // Subtitle
  slide.addText('Technical Architecture & Specifications\nTesting Version 1.0.0.0', {
    x: 1.0, y: 3.9, w: 11.333, h: 1.0,
    fontSize: 20,
    fontFace: 'Georgia',
    color: COLORS.textPrimary,
    align: 'center'
  });

  // Footer Metadata
  slide.addText('Backend Web Server & Socket.IO Gameplay • MongoDB CRUD REST API', {
    x: 1.0, y: 5.6, w: 11.333, h: 0.4,
    fontSize: 12,
    fontFace: 'Arial',
    color: COLORS.textMuted,
    align: 'center'
  });
}

// ============================================================================
// SLIDE 2: Tech Stack Overview
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, '1. Core Technology Stack');

  // Column widths and layout
  const colW = 3.7;
  const colGap = 0.5;
  const colY = 1.5;
  const colH = 4.8;
  const startX = 0.6;

  // Columns data
  const columns = [
    {
      title: 'Frontend Client',
      subtitle: 'Game UI & Rendering Engine',
      items: [
        '• Structure: Semantic HTML5 pages',
        '• Styling: Vanilla CSS (Custom dark theme, keyframe board animations)',
        '• Game Board: Interactive Canvas API rendering',
        '• Communication: Socket.io-client for real-time play; Fetch API for REST endpoints',
        '• Assets: Embedded SVGs for achivement folios, utilizing Cormorant Garamond typography',
        '• Service Worker: Offline support (PWA)'
      ]
    },
    {
      title: 'WebSocket Game Server',
      subtitle: 'State Management & Matchmaking',
      items: [
        '• Runtime: Node.js HTTP web server (Port 8765)',
        '• Communications: Socket.IO Server for live play (sync board, turn notifications)',
        '• Game Loop Engine: dharma-engine.js (validates movements, checks vyuha formations)',
        '• Matchmaking: Custom queue arrays for 2P and 4P modes (eliminates match stalls)',
        '• AI Engine: tieredBots.js integration supporting AI play (ELO 100-1000)'
      ]
    },
    {
      title: 'Database & REST API',
      subtitle: 'Data Persistence & User Auth',
      items: [
        '• API Web Framework: Express (Port 5000) inside login_api.js',
        '• Database ODM: Mongoose (MongoDB connection)',
        '• Cryptography: Bcrypt for secure user password hashing (10 salt rounds)',
        '• Mail Delivery: Nodemailer transporter for email OTP verification',
        '• Authoritative Sync: Server-to-server POST endpoints for secure ELO updating'
      ]
    }
  ];

  columns.forEach((col, idx) => {
    const x = startX + idx * (colW + colGap);
    
    // Background card box
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: x, y: colY, w: colW, h: colH,
      fill: { color: COLORS.bgCard },
      line: { color: COLORS.border, width: 1.5 }
    });

    // Column Header Box
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: x + 0.1, y: colY + 0.1, w: colW - 0.2, h: 0.6,
      fill: { color: COLORS.bgDark },
      line: { color: COLORS.gold, width: 1 }
    });

    // Column Header Text
    slide.addText(col.title, {
      x: x + 0.15, y: colY + 0.12, w: colW - 0.3, h: 0.3,
      fontSize: 14,
      fontFace: 'Georgia',
      color: COLORS.gold,
      bold: true,
      align: 'center'
    });
    
    slide.addText(col.subtitle, {
      x: x + 0.15, y: colY + 0.38, w: colW - 0.3, h: 0.2,
      fontSize: 9,
      fontFace: 'Arial',
      color: COLORS.textMuted,
      align: 'center',
      italic: true
    });

    // Body Text
    slide.addText(col.items.join('\n\n'), {
      x: x + 0.15, y: colY + 0.8, w: colW - 0.3, h: colH - 1.0,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: COLORS.textPrimary,
      align: 'left'
    });
  });
}

// ============================================================================
// SLIDE 3: Architecture Diagram (Visual Blocks)
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, '2. Architectural Workflow Diagram');

  // Draw Visual Components
  // 1. Client Browser (Left)
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.6, y: 2.8, w: 2.2, h: 2.4,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.gold, width: 1.5 }
  });
  slide.addText('Client Browser\n(Game UI / Canvas)', {
    x: 0.7, y: 2.9, w: 2.0, h: 0.6,
    fontSize: 12, fontFace: 'Georgia', color: COLORS.gold, bold: true, align: 'center'
  });
  slide.addText('• HTML/CSS Board\n• Socket.IO Client\n• LocalStorage\n• Auth Tokens', {
    x: 0.7, y: 3.5, w: 2.0, h: 1.5,
    fontSize: 9.5, fontFace: 'Arial', color: COLORS.textPrimary, align: 'left'
  });

  // Arrow from Client to WebSocket Server (Upward diagonal)
  // Draw line + arrowhead manually for high precision
  slide.addShape(pptx.shapes.LINE, {
    x: 2.8, y: 3.5, w: 1.2, h: -1.0,
    line: { color: COLORS.bronze, width: 2, endArrowType: 'triangle' }
  });
  slide.addText('WebSocket (Port 8765)', {
    x: 2.7, y: 2.4, w: 1.5, h: 0.3,
    fontSize: 8.5, fontFace: 'Arial', color: COLORS.textMuted, align: 'center', italic: true
  });

  // Arrow from Client to API Server (Downward diagonal)
  slide.addShape(pptx.shapes.LINE, {
    x: 2.8, y: 4.5, w: 1.2, h: 1.0,
    line: { color: COLORS.bronze, width: 2, endArrowType: 'triangle' }
  });
  slide.addText('REST HTTP (Port 5000)', {
    x: 2.7, y: 5.2, w: 1.5, h: 0.3,
    fontSize: 8.5, fontFace: 'Arial', color: COLORS.textMuted, align: 'center', italic: true
  });

  // 2. WebSocket Game Server (Top Middle)
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 4.0, y: 1.5, w: 2.8, h: 1.8,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.gold, width: 1.5 }
  });
  slide.addText('WebSocket Game Server', {
    x: 4.1, y: 1.6, w: 2.6, h: 0.4,
    fontSize: 12, fontFace: 'Georgia', color: COLORS.gold, bold: true, align: 'center'
  });
  slide.addText('• Socket.IO Real-time Loop\n• In-Memory Matchmaking\n• Local Flat-file JSON Ledger (Guests)\n• dharma-engine.js Validation', {
    x: 4.1, y: 2.0, w: 2.6, h: 1.2,
    fontSize: 9, fontFace: 'Arial', color: COLORS.textPrimary, align: 'left'
  });

  // 3. REST API Server (Bottom Middle)
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 4.0, y: 4.7, w: 2.8, h: 1.8,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.gold, width: 1.5 }
  });
  slide.addText('MongoDB REST API Server', {
    x: 4.1, y: 4.8, w: 2.6, h: 0.4,
    fontSize: 12, fontFace: 'Georgia', color: COLORS.gold, bold: true, align: 'center'
  });
  slide.addText('• Node/Express (login_api.js)\n• User Profile CRUD & Auth\n• Friends & Invite System\n• OTP & Password Recovery', {
    x: 4.1, y: 5.2, w: 2.6, h: 1.2,
    fontSize: 9, fontFace: 'Arial', color: COLORS.textPrimary, align: 'left'
  });

  // Server-to-Server Sync arrow (Between WS Server & REST API Server)
  slide.addShape(pptx.shapes.LINE, {
    x: 5.4, y: 3.3, w: 0, h: 1.4,
    line: { color: COLORS.warning, width: 2, endArrowType: 'triangle', beginArrowType: 'triangle' }
  });
  slide.addText('Auth ELO Sync & Win Persistence\n(Server-to-Server POST)', {
    x: 5.5, y: 3.7, w: 2.2, h: 0.4,
    fontSize: 8.5, fontFace: 'Arial', color: COLORS.warning, bold: true, align: 'left'
  });

  // Arrow from REST API Server to MongoDB (Right)
  slide.addShape(pptx.shapes.LINE, {
    x: 6.8, y: 5.6, w: 1.7, h: 0,
    line: { color: COLORS.bronze, width: 2, endArrowType: 'triangle' }
  });
  slide.addText('Mongoose / TLS Connection', {
    x: 7.0, y: 5.3, w: 1.4, h: 0.3,
    fontSize: 8.5, fontFace: 'Arial', color: COLORS.textMuted, align: 'center', italic: true
  });

  // 4. MongoDB Atlas Database (Right)
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 8.5, y: 4.7, w: 2.5, h: 1.8,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.gold, width: 1.5 }
  });
  slide.addText('MongoDB Atlas (Cloud)', {
    x: 8.6, y: 4.8, w: 2.3, h: 0.4,
    fontSize: 12, fontFace: 'Georgia', color: COLORS.gold, bold: true, align: 'center'
  });
  slide.addText('• Registered User Profiles\n• Password Hashes (Bcrypt)\n• Game History Log\n• Friendship Lists & Requests', {
    x: 8.6, y: 5.2, w: 2.3, h: 1.2,
    fontSize: 9, fontFace: 'Arial', color: COLORS.textPrimary, align: 'left'
  });

  // Arrow from WS Server to Local File Storage (Right)
  slide.addShape(pptx.shapes.LINE, {
    x: 6.8, y: 2.4, w: 1.7, h: 0,
    line: { color: COLORS.bronze, width: 2, endArrowType: 'triangle' }
  });
  slide.addText('Atomic Local FS Write', {
    x: 7.0, y: 2.1, w: 1.4, h: 0.3,
    fontSize: 8.5, fontFace: 'Arial', color: COLORS.textMuted, align: 'center', italic: true
  });

  // 5. Local JSON Storage (Top Right)
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 8.5, y: 1.5, w: 2.5, h: 1.8,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.gold, width: 1.5 }
  });
  slide.addText('Local File Ledger (data/)', {
    x: 8.6, y: 1.6, w: 2.3, h: 0.4,
    fontSize: 12, fontFace: 'Georgia', color: COLORS.gold, bold: true, align: 'center'
  });
  slide.addText('• elo-ledger.json (Guest ELOs)\n• game-history.json (Guest game logs)\n• Self-healing, error-resilient\n• No restart node-watch paths', {
    x: 8.6, y: 2.0, w: 2.3, h: 1.2,
    fontSize: 9, fontFace: 'Arial', color: COLORS.textPrimary, align: 'left'
  });

  // Legend at bottom
  slide.addText('Legend:  ── Gold/Bronze: Network Flows   ── Amber: Server-to-Server Sync', {
    x: 0.6, y: 6.4, w: 8.0, h: 0.3,
    fontSize: 9, fontFace: 'Arial', color: COLORS.textMuted, bold: true
  });
}

// ============================================================================
// SLIDE 4: Database Schemas & Persistence Model
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, '3. MongoDB Schema Definitions');

  // Left Column: User Model
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.6, y: 1.4, w: 5.6, h: 5.1,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.border, width: 1.5 }
  });
  slide.addText('User Model Schema (User)', {
    x: 0.8, y: 1.5, w: 5.2, h: 0.4,
    fontSize: 14, fontFace: 'Georgia', color: COLORS.gold, bold: true
  });

  const userSchemaItems = [
    '• name: String (required, trimmed)',
    '• email: String (required, unique, lowercased, index)',
    '• password: String (required, hashed via bcrypt)',
    '• elo: Number (authoritative rank, starts at 200)',
    '• friends: Array of ObjectIds (references User model)',
    '• friendRequests: Array of nested objects:',
    '  - fromUserId (ObjectId), fromName, fromEmail, createdAt',
    '• last50games: Array of nested objects (capped history):',
    '  - startedAt, endedAt, type (1bot, 2bot, 3bot, pvp), result (win/defeat/quitted)',
    '• puzzleProgress: Nested progress tracking object:',
    '  - elo (puzzles rating), streak (daily count), lastSolvedDate, solved (Array of string puzzleIds)',
    '• Timestamps: Automatically adds createdAt & updatedAt'
  ];

  slide.addText(userSchemaItems.join('\n'), {
    x: 0.8, y: 2.0, w: 5.2, h: 4.3,
    fontSize: 10, fontFace: 'Arial', color: COLORS.textPrimary
  });

  // Right Column: Pending Registration & Persistence Strategy
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 6.5, y: 1.4, w: 6.2, h: 2.4,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.border, width: 1.5 }
  });
  slide.addText('Pending Registration Schema (PendingRegistration)', {
    x: 6.7, y: 1.5, w: 5.8, h: 0.4,
    fontSize: 13, fontFace: 'Georgia', color: COLORS.gold, bold: true
  });
  
  const pendingSchemaItems = [
    '• name & email: String (registration candidate keys)',
    '• otp: String (random 6-digit numeric verification code)',
    '• otpExpires: Date (expiring window - exactly 10 minutes)',
    '• verified: Boolean (email validated status flag, defaults to false)',
    '• TTL Auto-Expiry Index: createdAt field expires in 3600s (1hr)'
  ];

  slide.addText(pendingSchemaItems.join('\n'), {
    x: 6.7, y: 1.9, w: 5.8, h: 1.8,
    fontSize: 10, fontFace: 'Arial', color: COLORS.textPrimary
  });

  // Right Bottom: Self-Healing File Persistence Strategy
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 6.5, y: 4.0, w: 6.2, h: 2.5,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.border, width: 1.5 }
  });
  slide.addText('Resilient JSON Guest Persistence', {
    x: 6.7, y: 4.1, w: 5.8, h: 0.4,
    fontSize: 13, fontFace: 'Georgia', color: COLORS.gold, bold: true
  });

  const guestStrategyItems = [
    '• Dual-Path Ledger: Guests bypass MongoDB. Recorded directly to local file server (elo-ledger.json & game-history.json).',
    '• Atomic Write Assurance: Writes data to a temporary file (.tmp-[pid]-[timestamp]) and uses fs.renameSync to execute an atomic write. Guarantees no partial-write corruptions.',
    '• Self-Healing Parser: On reading, if JSON is empty or corrupted, it triggers a console warning, creates a backup copy, and resets with a safe fallback ledger.'
  ];

  slide.addText(guestStrategyItems.join('\n\n'), {
    x: 6.7, y: 4.5, w: 5.8, h: 1.9,
    fontSize: 9.5, fontFace: 'Arial', color: COLORS.textPrimary
  });
}

// ============================================================================
// SLIDE 5: CRUD Operations Breakdown (Auth & Profiles)
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, '4. REST API CRUD Operations: Auth & Profiles');

  // Let's create a beautiful structured table for CRUD routes
  const tableRows = [
    [
      { text: 'CRUD Phase', options: { fill: COLORS.bgDark, color: COLORS.gold, bold: true, fontFace: 'Georgia', fontSize: 11, align: 'center' } },
      { text: 'HTTP API Endpoint', options: { fill: COLORS.bgDark, color: COLORS.gold, bold: true, fontFace: 'Georgia', fontSize: 11, align: 'center' } },
      { text: 'Payload / Request', options: { fill: COLORS.bgDark, color: COLORS.gold, bold: true, fontFace: 'Georgia', fontSize: 11, align: 'center' } },
      { text: 'Server Operations / MongoDB Query', options: { fill: COLORS.bgDark, color: COLORS.gold, bold: true, fontFace: 'Georgia', fontSize: 11, align: 'center' } }
    ],
    // CREATE
    [
      { text: 'CREATE', options: { fill: COLORS.bgCard, color: COLORS.success, bold: true, fontSize: 10, fontFace: 'Arial', align: 'center' } },
      { text: 'POST /api/auth/register/send-otp\nPOST /api/auth/register/set-password', options: { fill: COLORS.bgCard, fontSize: 9, fontFace: 'Courier New', color: COLORS.textPrimary } },
      { text: '• { name, email }\n• { email, password }', options: { fill: COLORS.bgCard, fontSize: 9.5, fontFace: 'Arial', color: COLORS.textPrimary } },
      { text: '1. Verifies uniqueness of email in User.\n2. Saves temporary code in PendingRegistration.\n3. Generates User.create() with hashed bcrypt password.', options: { fill: COLORS.bgCard, fontSize: 9.5, fontFace: 'Arial', color: COLORS.textPrimary } }
    ],
    // READ
    [
      { text: 'READ', options: { fill: COLORS.bgCard, color: COLORS.warning, bold: true, fontSize: 10, fontFace: 'Arial', align: 'center' } },
      { text: 'GET /api/user/:id\nGET /api/users\nGET /api/leaderboard', options: { fill: COLORS.bgCard, fontSize: 9, fontFace: 'Courier New', color: COLORS.textPrimary } },
      { text: '• URL Params (userId)\n• Query (page, limit)', options: { fill: COLORS.bgCard, fontSize: 9.5, fontFace: 'Arial', color: COLORS.textPrimary } },
      { text: '1. User.findById(id).select("-password") retrieves single profile.\n2. User.find().sort({ elo: -1 }).limit(100) retrieves leaderboard.\n3. User.find().skip().limit() paginates user directory.', options: { fill: COLORS.bgCard, fontSize: 9.5, fontFace: 'Arial', color: COLORS.textPrimary } }
    ],
    // UPDATE
    [
      { text: 'UPDATE', options: { fill: COLORS.bgCard, color: COLORS.gold, bold: true, fontSize: 10, fontFace: 'Arial', align: 'center' } },
      { text: 'PUT /api/user/:id\nPOST /api/puzzles/progress/:userId/solve', options: { fill: COLORS.bgCard, fontSize: 9, fontFace: 'Courier New', color: COLORS.textPrimary } },
      { text: '• { name, email, password }\n• { puzzleId, eloDelta }', options: { fill: COLORS.bgCard, fontSize: 9.5, fontFace: 'Arial', color: COLORS.textPrimary } },
      { text: '1. Finds User, modifies properties, calls user.save() which hashes password via pre-save hook.\n2. Solves puzzle, increases streak daily, updates ELO delta.', options: { fill: COLORS.bgCard, fontSize: 9.5, fontFace: 'Arial', color: COLORS.textPrimary } }
    ],
    // DELETE
    [
      { text: 'DELETE', options: { fill: COLORS.bgCard, color: 'D9534F', bold: true, fontSize: 10, fontFace: 'Arial', align: 'center' } },
      { text: 'DELETE /api/user/:id', options: { fill: COLORS.bgCard, fontSize: 9, fontFace: 'Courier New', color: COLORS.textPrimary } },
      { text: '• URL Params (userId)', options: { fill: COLORS.bgCard, fontSize: 9.5, fontFace: 'Arial', color: COLORS.textPrimary } },
      { text: '1. Executes User.findByIdAndDelete(id).\n2. Deletes user profile document from the database.', options: { fill: COLORS.bgCard, fontSize: 9.5, fontFace: 'Arial', color: COLORS.textPrimary } }
    ]
  ];

  // Render Table
  slide.addTable(tableRows, {
    x: 0.6, y: 1.5, w: 12.133, h: 4.8,
    border: { color: COLORS.border, width: 1 },
    valign: 'middle'
  });
}

// ============================================================================
// SLIDE 6: CRUD Operations Breakdown (Game Session & ELO Updates)
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, '5. Game Results Persistence (Authoritative CRUD Flow)');

  // Let's draw a step-by-step numbered flowchart for game persistence
  const steps = [
    {
      num: '1',
      title: 'WebSocket Connection',
      desc: 'Player connects to WS server on port 8765 with a userId (registered) or guest token. WS requests authoritative ELO from DB API Server (fetchServerElo).'
    },
    {
      num: '2',
      title: 'Active In-Memory Session',
      desc: 'Game executes in-memory. WS handles live board state updates, dice rolls, turns, chat messages, and player disconnect reconnect timeouts.'
    },
    {
      num: '3',
      title: 'Calculated ELO Delta',
      desc: 'Upon game completion (win, draw, forfeit), ELO variations are computed server-side using a multi-player FFA formula: delta = Math.round(K * (actual - expected)).'
    },
    {
      num: '4',
      title: 'Secure Persistence Sync',
      desc: '• Registered Users: WS server executes fetch(DB_API_URL/api/user/game-history, { POST })\n• Guests: WS server executes atomic local JSON write (saveLedger).'
    },
    {
      num: '5',
      title: 'MongoDB Atomic Updates',
      desc: 'DB API processes the POST, updating MongoDB via User.findByIdAndUpdate(userId, { $set: { elo: newElo }, $push: { last50games: { $slice: 50 } } }).'
    }
  ];

  const stepW = 2.2;
  const stepGap = 0.28;
  const startX = 0.6;
  const stepY = 2.0;
  const stepH = 4.0;

  steps.forEach((step, idx) => {
    const x = startX + idx * (stepW + stepGap);

    // Card background
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: x, y: stepY, w: stepW, h: stepH,
      fill: { color: COLORS.bgCard },
      line: { color: COLORS.border, width: 1.5 }
    });

    // Step Number Badge (Circle)
    slide.addShape(pptx.shapes.OVAL, {
      x: x + (stepW/2) - 0.35, y: stepY - 0.35, w: 0.7, h: 0.7,
      fill: { color: COLORS.bgDark },
      line: { color: COLORS.gold, width: 2 }
    });

    // Step Number text
    slide.addText(step.num, {
      x: x + (stepW/2) - 0.35, y: stepY - 0.3, w: 0.7, h: 0.6,
      fontSize: 16, fontFace: 'Georgia', color: COLORS.gold, bold: true, align: 'center'
    });

    // Step Title
    slide.addText(step.title, {
      x: x + 0.1, y: stepY + 0.5, w: stepW - 0.2, h: 0.6,
      fontSize: 12, fontFace: 'Georgia', color: COLORS.gold, bold: true, align: 'center'
    });

    // Step Description
    slide.addText(step.desc, {
      x: x + 0.1, y: stepY + 1.2, w: stepW - 0.2, h: stepH - 1.4,
      fontSize: 9.5, fontFace: 'Arial', color: COLORS.textPrimary, align: 'left'
    });

    // Connector arrows between cards (except the last card)
    if (idx < steps.length - 1) {
      slide.addShape(pptx.shapes.LINE, {
        x: x + stepW + 0.05, y: stepY + (stepH / 2), w: stepGap - 0.1, h: 0,
        line: { color: COLORS.gold, width: 2, endArrowType: 'triangle' }
      });
    }
  });
}

// ============================================================================
// SLIDE 7: Real-Time Gameplay & Matchmaking Details
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, '6. Real-Time WebSocket Architecture');

  // Left Column
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.6, y: 1.5, w: 5.8, h: 4.8,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.border, width: 1.5 }
  });
  slide.addText('Event Handling & State Synchronization', {
    x: 0.8, y: 1.6, w: 5.4, h: 0.4,
    fontSize: 14, fontFace: 'Georgia', color: COLORS.gold, bold: true
  });

  const stateSyncPoints = [
    '• Client/Server Sync: WebSocket rooms maintain game states. Engine board representations are mapped to lightweight wire formats: board square coordinate -> piece owner & type string (e.g. "0:rook").',
    '• Connection Map: WS server maintains active connections inside onlineUsers Map (userId -> { sockets: Set, name, elo }) to enable multiple active tabs under a single ID.',
    '• In-game Invites: pendingInvites Map monitors peer invites, automatically disposing of invitation codes and rooms upon decline, timeout (30 seconds), or disconnection.',
    '• Reconnection Grace Period: Active games survive brief network drops. If a user disconnects, player.connected is set to false and the room is notified. A 120-second countdown runs; if it expires, the game is forfeited and ELO is updated.'
  ];

  slide.addText(stateSyncPoints.join('\n\n'), {
    x: 0.8, y: 2.1, w: 5.4, h: 4.0,
    fontSize: 9.5, fontFace: 'Arial', color: COLORS.textPrimary
  });

  // Right Column
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 6.8, y: 1.5, w: 5.9, h: 4.8,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.border, width: 1.5 }
  });
  slide.addText('Multiplayer Matchmaking & Queueing', {
    x: 7.0, y: 1.6, w: 5.5, h: 0.4,
    fontSize: 14, fontFace: 'Georgia', color: COLORS.gold, bold: true
  });

  const matchPoints = [
    '• Matchmaking Queue: Separated queues for 2P and 4P configurations (matchmakingQueue[\'2p\'] / matchmakingQueue[\'4p\']) stored inside server memory.',
    '• Dynamic Match Formation: When a queue contains enough human players (2 players for 2P mode, 4 players for 4P mode), the game room is immediately initialized.',
    '• AI Seat Auto-Fill: To avoid long wait times, rooms feature a 10-second bot fallback timer (ROOM_BOT_FALLBACK_MS). If a human seat remains vacant in the lobby after 10s, it is automatically filled by a tiered AI bot.',
    '• Unified Board Design: Both 2P and 4P matches execute on the same 4-seat board. In 2P mode, seats 2 and 3 are filled by bots, maintaining the authentic Chaturanga FFA ruleset.',
    '• Rematch System: Rematches require majority voting with a 30-second decision timeout, ensuring inactive players do not stall the game loop.'
  ];

  slide.addText(matchPoints.join('\n\n'), {
    x: 7.0, y: 2.1, w: 5.5, h: 4.0,
    fontSize: 9.5, fontFace: 'Arial', color: COLORS.textPrimary
  });
}

// ============================================================================
// SLIDE 8: Security & Operations Features
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, '7. Security, Hashing, & Operational Safety');

  const sections = [
    {
      title: 'Bcrypt Password Cryptography',
      items: [
        '• Pre-Save Hook Hashing: User passwords are automatically hashed asynchronously using Bcrypt with a work factor of 10 salt rounds prior to being saved in the database.',
        '• Security Filters: To prevent developer accidents, MongoDB models use custom schema JSON transformation options (transform: (_doc, ret) => { delete ret.password; return ret }) to strip passwords from all API payloads.'
      ]
    },
    {
      title: 'Email Security & Nodemailer Transporter',
      items: [
        '• Verification Flow: Registrations remain locked in a PendingRegistration state until a 6-digit OTP matches. OTPs are protected by short-lived expirations (10 minutes).',
        '• Secure Transporter: Supports both SMTP host configurations (port 587/465, secure flag verification) and dedicated Gmail App Password integrations.'
      ]
    },
    {
      title: 'Self-Healing System Architecture',
      items: [
        '• File Error-Handling: Reading the guest ledger uses loadJSONSelfHealing, backing up corrupt JSON and resetting securely to prevent backend system crashes.',
        '• Nodemon Ignore Rules: Critical database write paths (data/, game/data/) are excluded from nodemon watches. Local writes to JSON files never trigger server restarts mid-match.'
      ]
    }
  ];

  const secW = 12.133;
  const secH = 1.3;
  const startY = 1.6;
  const gapY = 0.35;

  sections.forEach((sec, idx) => {
    const y = startY + idx * (secH + gapY);

    // Background card box
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.6, y: y, w: secW, h: secH,
      fill: { color: COLORS.bgCard },
      line: { color: COLORS.border, width: 1.5 }
    });

    // Bullet Title
    slide.addText(sec.title, {
      x: 0.8, y: y + 0.1, w: secW - 0.4, h: 0.3,
      fontSize: 13, fontFace: 'Georgia', color: COLORS.gold, bold: true
    });

    // Content lines
    slide.addText(sec.items.join('\n'), {
      x: 0.8, y: y + 0.4, w: secW - 0.4, h: secH - 0.5,
      fontSize: 10, fontFace: 'Arial', color: COLORS.textPrimary
    });
  });
}

// Generate the presentation file
const outputPath = path.join(__dirname, '..', '..', 'Chaturanga_Architecture_v1.0.0.0.pptx');
console.log(`Generating presentation at: ${outputPath}...`);

pptx.writeFile({ fileName: outputPath })
  .then((fileName) => {
    console.log(`Successfully generated PowerPoint: ${fileName}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(`Generation failed:`, err);
    process.exit(1);
  });
