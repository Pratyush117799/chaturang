# Chaturanga — Hosted Version 1.0.0.0 · Full Launch Specification

---

## PART A: HOSTING & INFRASTRUCTURE

1. **Hosting Platform:** Vercel (Free Tier)
   - Deploy as a static site with serverless functions for auth and game state.
   - Use Vercel's global CDN edge network — assets are served from the nearest datacenter to the user's location, making page load near-instant globally.

2. **Domain:** Register a `.com` domain (e.g., `chaturangagame.com` or `playchaturanga.com`)
   - Connect domain via Vercel's domain dashboard.
   - Enable free HTTPS/SSL automatically through Vercel.

3. **Real-time Multiplayer:** Supabase Realtime (preferred over Socket.io for Vercel)
   - Supabase handles persistent WebSocket connections on its own cloud infrastructure.
   - Vercel serverless functions have a 10-second timeout limit, so they cannot maintain long-lived WebSocket connections — Supabase solves this completely.
   - Use Supabase Realtime "Channels" to broadcast move data (from square, to square, piece type, player index) between players in real-time.

4. **Database & User Accounts:** Supabase (PostgreSQL)
   - Store: usernames, ELO ratings, puzzle progress, playstyle stats, wisdom quotes unlocked.
   - Tables required: `profiles`, `game_history`, `puzzle_progress`, `wisdom_unlocked`.

5. **Analytics (Free):** Google Analytics 4 + Google Search Console

---

## PART B: PERFORMANCE & ZERO-LAG BLUEPRINT

> **Core Philosophy:** Every visual element that makes the game beautiful must load and move without any delay — on a budget Android or iPhone. This is non-negotiable.

### B1. Asset Size Reduction (The #1 Priority)

| Asset | Current Size | Target After Optimization | Method |
|---|---|---|---|
| Each piece PNG (e.g., blue_danti.png) | ~2 MB | < 20 KB | Resize to 120px, convert to WebP |
| Total 20 piece images | ~16 MB | < 300 KB | Batch WebP conversion |
| Board background image | ~2 MB | < 150 KB | WebP + quality 80% |
| Hero background image | ~3 MB | < 200 KB | WebP + quality 75% |

**How to compress:**
- Use `cwebp` (Google's free command-line tool) or Squoosh (browser-based) to convert all PNGs and JPGs to WebP.
- Resize all piece images to a maximum of `200×200 px` — this is the largest they will ever appear on any screen, so higher resolution is wasted bytes.
- Keep original PNGs as backups; serve WebP to all modern browsers (Chrome, Safari, Firefox, Samsung Internet all support WebP since 2020).

### B2. Background Image — Keeping It Without Lag

**Decision: YES, keep the premium background image.** It is essential to the first impression and the cultural feel of the game. But optimize it aggressively:

```css
/* Strategy: Isolate the background onto its own GPU layer */
.hero-bg, .board-background {
  background-image: url('images/hero-bg.webp');
  background-size: cover;
  background-position: center;
  transform: translateZ(0);           /* Promotes to its own compositing layer */
  will-change: transform;             /* Hints the browser to pre-allocate GPU memory */
  backface-visibility: hidden;        /* Prevents unnecessary repaints */
}
```

- When pieces move on top of the background, the browser DOES NOT redraw the background — it only moves the piece layer. This is called "composited animations" and is the key to 60 FPS gameplay on mobile.
- For mobile: reduce the background image to a mobile-specific version at `800px` width (even smaller file size). Use CSS `<picture>` tags or media queries to serve the smaller image on phones.

### B3. GPU-Accelerated Piece Movement (Zero-Lag Dragging)

```css
/* Apply to every .piece or .pz-sq game element */
.piece-img, .pz-piece {
  transform: translate3d(0, 0, 0);    /* Activates GPU compositing immediately */
  will-change: transform;
  backface-visibility: hidden;
  transition: transform 120ms ease;  /* Silky-smooth 120ms move animation */
}

/* When a piece is being actively dragged on mobile */
.piece-img.dragging {
  transition: none;                  /* Remove transition during drag — direct 1:1 finger tracking */
  z-index: 9999;
  pointer-events: none;
}
```

**Touch events for mobile dragging (in JavaScript):**
- Replace `mousedown / mousemove / mouseup` events with `touchstart / touchmove / touchend`.
- Use `event.touches[0].clientX` and `event.touches[0].clientY` to read finger position.
- Prevent default scrolling on touch over the board with `event.preventDefault()` inside `touchmove`.
- Target square detection: use `document.elementFromPoint(touch.clientX, touch.clientY)` to identify which board square the finger is currently over.

### B4. Fast Dice Rolling (300ms CSS 3D Animation)

```css
@keyframes diceRoll {
  0%   { transform: rotateX(0deg)   rotateY(0deg)   rotateZ(0deg); }
  30%  { transform: rotateX(360deg) rotateY(180deg) rotateZ(90deg); }
  70%  { transform: rotateX(540deg) rotateY(360deg) rotateZ(180deg); }
  100% { transform: rotateX(720deg) rotateY(540deg) rotateZ(270deg); }
}

.dice-rolling {
  animation: diceRoll 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}
```

- Dice result is calculated instantly using `Math.floor(Math.random() * 4) + 1` (client-side, zero network call).
- The 300ms animation plays simultaneously — when it finishes, the result is already determined.
- No server roundtrip needed for dice — it is a pure client-side random operation.
- In online multiplayer, the dice result is seeded from a shared Supabase game state to ensure both players see the same result.

### B5. Service Worker Caching (Instant Load on Return Visits)

- Implement a Service Worker (`sw.js`) that caches all piece images, CSS, and JavaScript files into the browser's Cache Storage after the first visit.
- On every subsequent visit, assets load from the local device cache — no network request, zero load time.
- Update strategy: use a "stale-while-revalidate" policy so the user always sees the cached version immediately while the update downloads silently in the background.

### B6. Critical Rendering Path Optimization

- Inline the critical CSS (the styles needed to paint the visible above-the-fold screen) directly into `<head>` in a `<style>` tag.
- Load all non-critical CSS and JavaScript with `async` or `defer` attributes so they don't block the initial page paint.
- Use `<link rel="preload">` for the hero background image and the game piece images so the browser fetches them at high priority early.
- Lazy-load the puzzle section, player dashboard, and game board scripts — they only download when the user navigates to those pages.

### B7. Mobile Viewport & Touch Targets

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
```

- All tap/touch targets (buttons, board squares) must be a minimum of `48×48 px` — this is Google's standard for accessible mobile touch targets.
- Board squares on mobile must scale to fill the full screen width minus side coordinate labels.
- Use CSS `clamp()` to make the board square size respond fluidly to any screen size:

```css
:root {
  --sq: clamp(38px, calc((100vw - 48px) / 8), 80px);
}
```

- Pinch-to-zoom should be disabled only on the board area to prevent accidental zooming during moves.
- Add `touch-action: none;` on the board element to ensure no browser scroll or zoom interference during drag.

---

## PART C: MOBILE-FIRST DESIGN REQUIREMENTS

### C1. Layout Rules

- Design every page for a `360px` screen width first, then scale up to desktop.
- The game board must always be visible in its entirety without scrolling on portrait orientation.
- Sidebar panels (puzzle browser, stats) must collapse into bottom drawers on mobile.
- Navigation: Replace the desktop top navbar with a compact hamburger bottom-sheet menu on screens narrower than `768px`.
- Font sizes: Minimum `14px` for body text, `12px` for labels — never smaller, as it hurts readability on small screens.

### C2. Offline Play Support

- Puzzle mode must work fully offline using Service Worker caching — players on slow or no network connections can still practice.
- Single-player vs Bot mode must also be fully offline. The bot AI runs entirely in a Web Worker (background thread) so it never blocks the UI thread.

### C3. Performance Targets (Chrome Lighthouse Goals)

| Metric | Target Score |
|---|---|
| Performance | ≥ 95/100 |
| Accessibility | ≥ 90/100 |
| Best Practices | 100/100 |
| SEO | 100/100 |
| First Contentful Paint | < 1.0 second |
| Time to Interactive | < 2.0 seconds |
| Largest Contentful Paint | < 2.5 seconds |

---

## PART D: PLAYER DASHBOARD — DETAILED FEATURES

### D1. ELO Rating History Graph
- Display a smooth line chart (using the lightweight `Chart.js` library, 70KB) showing the player's ELO fluctuations across their last 50 games.
- X-axis: date. Y-axis: ELO rating.
- Color: Gold gradient line on a dark background. Animate the line drawing when the page loads.
- Show a tooltip on hover/tap showing: date, opponent name, result (Win/Loss), and ELO change (+12, -8, etc.).

### D2. Wisdom Unlocked — Mahabharata & Arthashastra Quote Collection
- Each solved puzzle unlocks one permanent wisdom card in the player's dashboard.
- Format of each card:
  - **Quote** in Sanskrit Devanagari script (e.g., "यः क्षमी स महान् राजा")
  - **Translation** in English below
  - **Source** label: "Arthashastra — Chanakya" or "Mahabharata — Bhishma Parva"
  - **Puzzle name** that unlocked it
- Store the unlock status per puzzle ID in Supabase `wisdom_unlocked` table.
- Show locked wisdom cards as a blurred placeholder with a 🔒 icon to motivate solving more puzzles.

### D3. Playstyle Archetype System
- Track per-player piece movement statistics in Supabase across all completed games.
- Calculate the archetype based on the most-moved piece type as a percentage of total moves:

| Archetype Name | Condition | Icon |
|---|---|---|
| Ratha Vanguard | Ratha (Chariot) used > 40% of moves | 🏎️ |
| Elephant Commander | Danti (Elephant) used > 35% of moves | 🐘 |
| Ashwa Tactician | Ashwa (Horse) used > 35% of moves | 🐎 |
| Nara General | Nara (Pawn) used > 45% of moves | ⚔️ |
| Balanced Strategist | No single piece > 30% | 👑 |

- Display the archetype badge prominently on the player's profile card.
- Add a detailed breakdown pie chart of piece usage percentages.

---

## PART E: SEO OPTIMISATION — CHESS-RELATED GOOGLE SEARCH TARGETING

> **Goal:** Appear on Google's first page when players search "ancient chess", "original chess game", "4 player chess", "how chess was invented", "chaturanga chess", "chess ancestor", "chess history India" etc.

### E1. Target Keywords (Primary & Long-Tail)

**Primary Keywords:**
- "chaturanga game"
- "ancient Indian chess"
- "4 player chess online"
- "chess ancestor online"

**Long-Tail Keywords (Easier to Rank, Higher Intent):**
- "how to play chaturanga"
- "chaturanga rules dice"
- "original chess game from India"
- "chess history India 6th century"
- "play ancient chess online free"
- "4 player board game like chess"
- "Mahabharata chess game"
- "chess origin India"

### E2. On-Page SEO — What to Write on Every Page

**Home Page (`index.html`):**
```html
<title>Chaturanga — Play the Ancient Indian Ancestor of Chess Online Free</title>
<meta name="description" content="Play Chaturanga, the 1,500-year-old Indian war game and ancestor of modern Chess. 4-player dice board game with Elephant, Horse, Chariot & Infantry. Free online." />
<!-- Open Graph for social sharing -->
<meta property="og:title" content="Chaturanga — Ancient Indian Chess" />
<meta property="og:description" content="The original Chess. 4 players, 4 armies, 1 ancient battlefield. Play free online." />
<meta property="og:image" content="https://yourdomain.com/images/og-preview.webp" />
<meta property="og:type" content="website" />
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
```

**H1 Tag (only one per page):**
```html
<h1>Chaturanga — The 6th Century Indian War Game That Became Chess</h1>
```

- Use **H2** tags for major sections: "How to Play Chaturanga", "The History of Chaturanga", "Ancient Chess Rules"
- Use **H3** tags for sub-sections.
- Write minimum **800 words** of real content on the homepage about Chaturanga's history, the pieces, and the rules — Google prioritizes content-rich pages.

### E3. Technical SEO Requirements

**`sitemap.xml`** (submit to Google Search Console):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://yourdomain.com/</loc><priority>1.0</priority></url>
  <url><loc>https://yourdomain.com/play</loc><priority>0.9</priority></url>
  <url><loc>https://yourdomain.com/puzzles</loc><priority>0.8</priority></url>
  <url><loc>https://yourdomain.com/how-to-play</loc><priority>0.8</priority></url>
  <url><loc>https://yourdomain.com/about</loc><priority>0.6</priority></url>
  <url><loc>https://yourdomain.com/privacy-policy</loc><priority>0.3</priority></url>
  <url><loc>https://yourdomain.com/terms-of-service</loc><priority>0.3</priority></url>
</urlset>
```

**`robots.txt`:**
```
User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml
```

**Schema.org Structured Data** (rich results in Google):
```json
{
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "Chaturanga",
  "description": "The ancient Indian board game, ancestor of Chess. 4-player online game with dice.",
  "genre": "Board Game",
  "gamePlatform": "Web Browser",
  "applicationCategory": "GameApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

- Register on **Google Search Console** → verify domain → submit sitemap URL.
- Register on **Google Analytics 4** → track player sessions, bounce rate, and game interactions.
- Aim for **Core Web Vitals** to pass Google's Page Experience ranking signal (LCP < 2.5s, FID < 100ms, CLS < 0.1).

### E4. Content SEO — Blog / Learn Section
- Add a `/learn` or `/history` section with well-written articles targeting long-tail keywords:
  - "The Complete History of Chaturanga and How It Became Chess"
  - "Chaturanga Rules Explained: The Original 4-Player Chess"
  - "How the Dice (Pāśa) Were Used in Ancient Chaturanga"
  - "Chaturanga vs Chess: All the Differences Explained"
- Each article should be 1,000–2,000 words, include internal links back to the play page, and use the target keywords naturally throughout.

---

## PART F: ABOUT US PAGE — FULL CONTENT SPECIFICATION

**Page Title:** `About Us | Chaturanga — The Ancestor of Chess`

**Sections to include:**

### Section 1: Our Story
> Chaturanga was born out of a deep love for the rich history of Indian board games. We are a small team of history enthusiasts and game developers who discovered that one of the greatest strategic games ever created — the true ancestor of Chess — had been nearly forgotten in the digital age. Our mission is to revive it.

### Section 2: What is Chaturanga?
> Chaturanga (Sanskrit: चतुरंग, meaning "four divisions [of the military]") is a 6th-century Indian war simulation board game described in the Harshacharita and referenced in the Mahabharata. It is the common ancestor of Chess, Xiangqi (Chinese Chess), Shogi (Japanese Chess), and Makruk (Thai Chess). Unlike modern Chess, Chaturanga is a 4-player game played on an 8×8 board with dice (Pāśa) determining which piece type can move each turn, blending strategy with the role of fate — exactly as ancient Indian philosophy described warfare.

### Section 3: Our Team (placeholder if needed)
> We are game developers, historians, and open-source contributors united by a shared belief: ancient knowledge deserves a modern platform.

### Section 4: Why We Built This
> No faithful, beautiful, free digital version of Chaturanga existed. We changed that.

### Section 5: Open-Source Commitment
> Our game logic and puzzle engine are open-source, preserving the game's rules for future generations.

---

## PART G: PRIVACY POLICY — FULL CONTENT SPECIFICATION

**Page Title:** `Privacy Policy | Chaturanga`

**Required Sections (to comply with Google's policies and GDPR/CCPA):**

1. **Introduction & Last Updated Date**
   > This Privacy Policy describes how Chaturanga ("we", "us", "our") collects, uses, and shares information when you use our website and game services.

2. **Information We Collect**
   - **Account Information:** We collect only your chosen username and encrypted password. We do NOT collect email addresses, phone numbers, real names, or physical addresses.
   - **Game Data:** Game results, ELO ratings, puzzle completion history, and playstyle statistics are stored to power your Player Dashboard.
   - **Analytics Data:** We use Google Analytics 4 to collect anonymized, aggregated data including pages visited, time on site, and device type. No personal identifiers are collected.
   - **Local Storage:** Your game preferences, theme settings, and sound preferences are stored locally on your device (browser localStorage) and are never transmitted to our servers.

3. **How We Use Your Information**
   - To operate and improve the game and website.
   - To display your Player Dashboard (ELO rating, puzzle progress, wisdom cards).
   - To enable real-time multiplayer matchmaking.
   - To monitor site performance and fix technical issues.

4. **Information We Do NOT Collect**
   - Email addresses
   - Phone numbers
   - Payment information (the game is free)
   - Physical location data beyond country-level (from analytics)
   - Age or identity information

5. **Data Storage & Security**
   - All user data is stored in Supabase (SOC 2 Type II certified database).
   - Passwords are hashed using bcrypt — we never store plain text passwords.
   - Data is transmitted exclusively over HTTPS/SSL encrypted connections.

6. **Children's Privacy**
   - Chaturanga is intended for users of all ages. We do not knowingly collect any personal information from children under 13. Since we do not collect email addresses or identity information, our service is designed to be privacy-safe for all users.

7. **Cookies**
   - We use essential session cookies for login state only.
   - Google Analytics sets non-identifying analytics cookies.
   - We do not use advertising cookies or sell data to advertisers.

8. **Third-Party Services**
   - Supabase (database and authentication)
   - Google Analytics 4 (anonymized site analytics)
   - Vercel (hosting and CDN)
   - Google Fonts (typography — loaded with `display=swap` to avoid tracking)

9. **Your Rights**
   - You may delete your account at any time from the Player Dashboard Settings.
   - Upon account deletion, all your game data, puzzle progress, and profile information is permanently deleted within 30 days.

10. **Contact**
    > For privacy questions, contact us at: [your email address]

---

## PART H: TERMS OF SERVICE — FULL CONTENT SPECIFICATION

**Page Title:** `Terms of Service | Chaturanga`

1. **Acceptance of Terms**
   > By creating an account or playing Chaturanga, you agree to these Terms of Service.

2. **Account Rules**
   - You must choose a username that is not offensive, impersonating, or containing hate speech.
   - You may not create multiple accounts to manipulate ELO ratings.
   - You are responsible for maintaining the confidentiality of your password.

3. **Fair Play Rules**
   - Using automation software, bots, or scripts to play the game is prohibited and will result in a permanent ban.
   - Intentional disconnection from online games to avoid a loss is prohibited.
   - Any attempt to exploit game bugs or glitches to gain an unfair advantage is prohibited.

4. **Intellectual Property**
   - The Chaturanga game engine, artwork, puzzle content, and written material on this website are the property of the Chaturanga Project.
   - The historical rules of Chaturanga are in the public domain.
   - You may not copy, distribute, or commercially exploit our original content without permission.

5. **Limitation of Liability**
   > Chaturanga is provided "as is." We are not liable for any interruption of service, data loss, or damages arising from use of the platform.

6. **Termination**
   > We reserve the right to terminate accounts that violate these terms without prior notice.

7. **Governing Law**
   > These terms are governed by the laws of India.

---

## PART I: OUR MISSION PAGE — FULL CONTENT SPECIFICATION

**Page Title:** `Our Mission | Chaturanga — Reviving Ancient India's Greatest Game`

**Content:**

### The Mission
> Our mission is to preserve and share Chaturanga — the ancient Indian war game that gave birth to Chess — with the world. We believe that a civilization's games are a window into its philosophy, mathematics, and values. Chaturanga is not just a game. It is a 1,500-year-old strategic thinking system encoded in the language of war, fate, and wisdom.

### Why It Matters
> Modern Chess is played by 600 million people worldwide. Yet almost none of them know that Chess originated in 6th-century India under the name Chaturanga. The Elephant became the Bishop. The Chariot became the Rook. The Horse became the Knight. The Raja became the King. The game traveled from India to Persia (Shatranj), then to the Arab world, then to Europe — and became Chess. By reviving Chaturanga in its authentic 4-player, dice-driven form, we restore the original strategic complexity and cultural context that was simplified away over centuries of transmission.

### Our Commitments
- 🏛️ **Historical Accuracy:** Every rule, every piece movement, every puzzle is grounded in historical texts including the Harshacharita, Bhavishya Purana, and later interpretive works by H.J.R. Murray and Yule.
- 🌱 **Accessible to Everyone:** Free to play, no paywalls, no ads within gameplay.
- 📖 **Educational:** Each puzzle teaches a strategic lesson drawn from the Arthashastra or Mahabharata.
- 🔓 **Open Knowledge:** We document the rules openly for researchers, educators, and game historians.

---

## PART J: GOOGLE GUIDELINES COMPLIANCE CHECKLIST

> Following these ensures Google does not penalize or remove the site from search results.

### Google Search Quality Guidelines:
- ✅ No misleading content — all historical facts must be accurate and cited.
- ✅ No "thin content" — every page must have at least 300 words of genuine, useful content.
- ✅ No keyword stuffing — use keywords naturally within readable sentences.
- ✅ No hidden text or cloaking — all text visible to Google must be visible to users.
- ✅ No purchased links or link farms.
- ✅ All images must have descriptive `alt` text attributes.

### Google Play / Web App Store Policies (if published as PWA):
- ✅ No deceptive behavior — the game must function exactly as described.
- ✅ Respect user privacy — no unauthorized data collection (covered in Privacy Policy).
- ✅ Accessibility: minimum contrast ratios, screen reader ARIA labels on interactive elements.
- ✅ Must not violate any intellectual property — Chaturanga's rules are public domain; original artwork is ours.

### Google AdSense / Monetization (future):
- ✅ Do not place ads inside the active game screen — it violates AdSense policies.
- ✅ Ads (if used in future) must be clearly distinguished from game content.
- ✅ Privacy Policy page must be linked in site footer — required for any Google partner program.

### Core Web Vitals (Google Page Experience Ranking Signal):
- ✅ **LCP (Largest Contentful Paint):** < 2.5 seconds — achieved via WebP background and preloading.
- ✅ **FID (First Input Delay):** < 100 milliseconds — achieved via deferred JavaScript loading.
- ✅ **CLS (Cumulative Layout Shift):** < 0.1 — achieved by defining fixed `width` and `height` on all images and board elements so they don't shift during load.

---

## PART K: FEATURE SUMMARY — COMPLETE FEATURE LIST

1. ✅ Landing page with animated premium battlefield background (WebP optimized)
2. ✅ Username-only Sign Up / Login (Supabase Auth — no email, no phone)
3. ✅ Fully playable Chaturanga board retaining original image pieces (compressed WebP)
4. ✅ 4-player game: vs Bots, Pass 'n Play (same device), and Online Multiplayer (Supabase Realtime)
5. ✅ Invite friends via shareable QR code link to an online game session
6. ✅ 300ms CSS 3D dice animation with instant client-side random number generation
7. ✅ Zero-lag GPU-accelerated piece drag and drop on mobile (touch events)
8. ✅ 50–100 curated Chaturanga puzzles with difficulty ratings
9. ✅ Player Dashboard:
   - ELO Rating History Line Chart (Chart.js)
   - Playstyle Archetype Badge (Ratha Vanguard, Elephant Commander, etc.)
   - Wisdom Cards from Mahabharata & Arthashastra (unlocked by solving puzzles)
10. ✅ Interactive "How to Play" guided tutorial (match against a solved bot)
11. ✅ Offline mode: Puzzles and Bot play work without internet (Service Worker cache)
12. ✅ SEO-optimized pages targeting chess history and ancient board game keywords
13. ✅ sitemap.xml, robots.txt, Schema.org structured data
14. ✅ Privacy Policy, Terms of Service, About Us, Our Mission pages
15. ✅ Mobile-first responsive design (works on 360px smartphones up to 4K monitors)
16. ✅ Google Analytics 4 + Google Search Console integration
17. ✅ Progressive Web App (PWA): installable on Android and iOS home screen
18. ✅ Dark theme only (consistent with ancient/premium aesthetic)
19. ✅ Accessibility: ARIA labels, minimum 48×48px touch targets, high contrast text
20. ✅ Strict Google quality guidelines compliance throughout
