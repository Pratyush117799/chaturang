# Build a Production-Ready Chaturanga Web Application

Use the attached Chaturanga UI image as the **primary visual design reference**.

The goal is to transform this visual design into a **fully responsive, interactive, production-quality Chaturanga website**, similar in functionality and architecture to platforms such as Chess.com and Xiangqi.com, but with its own unique ancient-Indian Chaturanga identity.

Do NOT simply place the image as a static webpage background. Recreate the UI as real HTML/CSS/React components so that every important element is responsive, accessible, interactive, and connected to the backend.

---

## 1. VISUAL DESIGN

Use the attached image as the main visual reference.

Preserve the overall:

- Ancient Indian royal aesthetic
- Dark brown / black background
- Bronze and antique-gold UI
- Ornate Indian architectural borders
- Temple / battlefield atmosphere
- Sunset lighting
- Chaturanga board imagery
- Gold typography
- Decorative filigree
- Premium strategy-game feeling
- Cinematic appearance

The website should feel like:

**Ancient Indian strategy + modern online gaming platform**

Do not make it look like a generic chess website.

Use the supplied Raja image specifically for:

- OFFLINE card
- HOW TO PLAY section/page

Do not replace the Raja image with a generic chess knight.

---

# 2. RESPONSIVE DESIGN

The website must work properly on:

- Desktop
- Laptop
- Tablet
- Mobile

Breakpoints should be designed intentionally rather than simply shrinking the desktop UI.

Desktop:

- Full navigation
- Large cinematic hero/background
- Two-column/card-based dashboard
- Chaturanga board can occupy a large visual area

Tablet:

- Reduce spacing
- Adapt card grid
- Preserve readability

Mobile:

- Hamburger/mobile navigation
- Cards become one-column
- Background image should crop intelligently
- Chaturanga board should remain usable
- No horizontal scrolling
- Touch-friendly buttons
- Responsive typography

Use CSS Grid/Flexbox and responsive breakpoints.

---

# 3. APPLICATION STRUCTURE

Create a real multi-page application.

Suggested routes:

/
 /play
 /play/online
 /play/offline
 /puzzles
 /lessons
 /how-to-play
 /practice
 /profile
 /leaderboard
 /games
 /community
 /settings
 /login
 /register

Authenticated routes should be protected.

---

# 4. MAIN HOME PAGE

Recreate the attached design as the homepage.

Header:

- CHATURANGA logo
- Subtitle:
  "THE ANCIENT INDIAN GAME OF WAR AND STRATEGY"
- HOME
- PLAY
- PUZZLES
- LESSONS
- COMMUNITY
- ABOUT
- Search
- Notifications
- User profile
- Rating
- Dropdown

Main navigation cards:

### PUZZLES

Icon:
Puzzle piece

Description:

"Solve and improve your strategy"

Clicking opens:

/puzzles

---

### LESSONS

Icon:
Ancient book

Description:

"Learn ancient tactics and master the game"

Clicking opens:

/lessons

---

### OFFLINE

Use the supplied Raja image.

Do NOT use the knight icon.

Description:

"Play against AI anytime"

Clicking opens:

/play/offline

---

### PLAY ONLINE

Icon:
Crossed swords / Chaturanga battle symbol

Description:

"Challenge players around the world"

Clicking opens:

/play/online

---

### PRACTICE

Icon:
Target

Description:

"Sharpen your skills and test your strategy"

Clicking opens:

/practice

---

### PROFILE

Icon:
User/profile

Description:

"Track progress, stats and achievements"

Clicking opens:

/profile

---

# 5. HOW TO PLAY

Create a dedicated:

/how-to-play

page.

Use the supplied Raja image prominently in this section.

The design should explain:

1. What is Chaturanga?
2. Board setup
3. Objective
4. Pieces
5. Raja
6. Elephant
7. Horse
8. Chariot
9. Foot Soldier
10. Movement rules
11. Capturing
12. Winning conditions
13. Example game

Make this interactive rather than just a static article.

For example:

- Interactive board
- Click a piece
- Highlight legal moves
- Show piece description
- Step-by-step tutorial
- Previous / Next buttons
- Progress indicator

---

# 6. CHaturanga GAME ENGINE

Implement an actual Chaturanga game engine.

Do NOT use chess rules blindly.

Create a dedicated game-rules module.

Example architecture:

/game
  /engine
    board.ts
    pieces.ts
    moves.ts
    rules.ts
    gameState.ts
    notation.ts
    ai.ts

The engine must support:

- Board initialization
- Legal moves
- Piece movement
- Captures
- Turn management
- Game state
- Check/win conditions according to the selected Chaturanga ruleset
- Undo
- Move history
- Restart
- Resign
- Draw where applicable

Keep game rules modular so different Chaturanga variants can be added later.

---

# 7. ONLINE MULTIPLAYER

Build online multiplayer functionality similar conceptually to Chess.com.

Users should be able to:

- Create a game
- Challenge another player
- Accept challenge
- Reject challenge
- Join matchmaking
- Play real-time games
- See opponent information
- See rating
- See clock
- See move history
- Resign
- Offer draw
- Receive game result

Use WebSockets / Socket.IO or another appropriate real-time technology.

Do not implement multiplayer using polling if WebSockets are practical.

Game state must be authoritative on the server.

Never trust the client for legal moves.

The server must validate every move using the same game engine.

---

# 8. GAME MODES

Implement:

### Online

- Quick Match
- Rated
- Casual
- Challenge Friend

### Offline

- Play vs AI
- Difficulty:
  - Beginner
  - Easy
  - Medium
  - Hard
  - Expert

### Practice

- Free board
- Analyze position
- Undo
- Reset
- Try different moves

---

# 9. PUZZLES

Create a puzzle system similar conceptually to chess puzzle platforms.

Database should store:

- puzzle_id
- FEN/custom Chaturanga position representation
- solution moves
- difficulty
- theme
- rating
- source
- created_at

Features:

- Random puzzle
- Puzzle rating
- Difficulty
- Hints
- Correct/incorrect move
- Puzzle completion
- Puzzle streak
- Puzzle history

User progress should be stored in the database.

---

# 10. LESSON SYSTEM

Create lessons using structured content.

Database model should support:

- lesson
- chapter
- difficulty
- description
- board positions
- interactive moves
- quizzes
- completion status

Users should be able to:

- Start lesson
- Continue lesson
- Complete lesson
- Track progress

---

# 11. USER AUTHENTICATION

Implement proper authentication.

Support:

- Register
- Login
- Logout
- Password hashing
- Session/token management
- Protected routes
- User profile
- Account settings

Do NOT store plain-text passwords.

Use a secure authentication approach appropriate for the chosen stack.

---

# 12. USER PROFILE

Profile should contain:

- Username
- Avatar
- Rating
- Games played
- Wins
- Losses
- Draws
- Win rate
- Puzzle rating
- Puzzle solved
- Lessons completed
- Current streak
- Achievements
- Game history

Profile URL:

/profile/:username

---

# 13. RATING SYSTEM

Implement an Elo-style rating system initially.

Store:

- current rating
- rating history
- peak rating
- games played

Rating changes should be calculated server-side.

Design the system so Glicko or another rating algorithm can be introduced later.

---

# 14. LEADERBOARD

Create:

/leaderboard

Include:

- Global ranking
- Rating
- Username
- Games
- Win rate

Filters:

- Today
- This week
- This month
- All time

Later allow:

- Country
- Friends
- Puzzle ranking

---

# 15. GAME HISTORY

Create:

/games

Users should be able to view:

- Previous games
- Opponent
- Result
- Rating change
- Date
- Game duration

Clicking a game opens a replay viewer.

Replay viewer should allow:

- First move
- Previous
- Next
- Last
- Auto-play

---

# 16. DATABASE

Use a real relational database.

Prefer:

PostgreSQL

Use an ORM such as:

Prisma

Suggested core tables:

users
profiles
games
game_players
moves
ratings
rating_history
puzzles
puzzle_attempts
lessons
lesson_progress
achievements
user_achievements
challenges
notifications
sessions

Add appropriate:

- Primary keys
- Foreign keys
- Unique constraints
- Indexes
- Timestamps

Do not store everything as JSON if relational data is more appropriate.

---

# 17. BACKEND API

Create a clean REST API or equivalent backend architecture.

Example:

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout

GET /api/users/:username

GET /api/games
POST /api/games
GET /api/games/:id
POST /api/games/:id/move
POST /api/games/:id/resign
POST /api/games/:id/draw

GET /api/puzzles
GET /api/puzzles/:id
POST /api/puzzles/:id/attempt

GET /api/lessons
GET /api/lessons/:id
POST /api/lessons/:id/progress

GET /api/leaderboard

Use proper validation and authorization.

---

# 18. REAL-TIME ARCHITECTURE

For online games:

Browser
    ↓
WebSocket
    ↓
Game Server
    ↓
Game Engine
    ↓
Database

The server should:

1. Receive move
2. Authenticate player
3. Verify player belongs to game
4. Validate move
5. Update game state
6. Persist move
7. Update clocks
8. Broadcast updated state
9. Detect game end
10. Update ratings
11. Notify both players

---

# 19. SECURITY

Implement:

- Input validation
- Authentication
- Authorization
- Rate limiting
- Secure password hashing
- CSRF protection where applicable
- XSS protection
- SQL injection protection through ORM/parameterized queries
- WebSocket authorization
- Server-side move validation

Never trust:

- Client-side rating
- Client-side game result
- Client-side legal moves
- Client-side user permissions

---

# 20. PERFORMANCE

The cinematic imagery should not make the site slow.

Implement:

- WebP/AVIF where appropriate
- Responsive image sizes
- Lazy loading
- Image compression
- Code splitting
- Route-level loading
- Cached assets
- Efficient database queries

Do not load unnecessarily huge images on mobile.

---

# 21. UI INTERACTIONS

Buttons/cards should have subtle interactions:

- Gold hover glow
- Slight elevation
- Smooth transitions
- Active state
- Focus state
- Touch feedback

Do not over-animate the interface.

Maintain the premium historical aesthetic.

---

# 22. DESIGN SYSTEM

Create reusable components:

Header
Footer
Navigation
GameCard
MenuCard
ProfileCard
RatingBadge
GameBoard
Piece
MoveHistory
PuzzleBoard
LessonViewer
Modal
Dropdown
Notification
Leaderboard
GameHistory
LoadingState
ErrorState

Create reusable design tokens for:

- Gold
- Dark bronze
- Deep brown
- Background
- Border
- Text
- Muted text
- Hover
- Active

---

# 23. ACCESSIBILITY

Implement:

- Keyboard navigation
- Visible focus states
- Semantic HTML
- ARIA labels where necessary
- Accessible contrast
- Screen-reader-friendly controls

Game pieces and board controls must have accessible labels.

---

# 24. MOBILE GAME EXPERIENCE

On mobile:

- Board should fit viewport
- Pieces must be touch-friendly
- Avoid tiny controls
- Move history can become a collapsible panel
- Player information should remain visible
- Game controls should be easy to reach with thumbs

---

# 25. IMAGE ASSETS

Use the supplied visual assets as follows:

1. Cinematic Chaturanga battlefield image:
   Use as the main visual background/hero artwork where appropriate.

2. Raja image:
   Use specifically for:
   - OFFLINE card
   - HOW TO PLAY page

Do not distort the Raja artwork.

Use object-fit/object-position intelligently.

Do not replace the Raja with a knight.

Keep the visual style consistent throughout the website.

---

# 26. RESPONSIVE BACKGROUND

The cinematic battlefield should behave differently depending on viewport.

Desktop:
Show the full composition.

Tablet:
Crop toward the important temple/board area.

Mobile:
Use a carefully selected crop or responsive image so the UI remains readable.

Never allow important UI text to disappear over a bright portion of the background.

Use dark overlays/gradients where necessary.

---

# 27. TECH STACK

Prefer a modern production stack such as:

Frontend:
Next.js + React + TypeScript

Styling:
Tailwind CSS or a well-structured CSS architecture

Backend:
Next.js server/API routes or a dedicated Node.js backend

Database:
PostgreSQL

ORM:
Prisma

Realtime:
WebSockets / Socket.IO

Authentication:
Secure session-based authentication or another production-ready approach

Validation:
Zod or equivalent

Testing:
Vitest/Jest
Playwright for end-to-end tests

Choose the architecture that is easiest to maintain and deploy.

---

# 28. PROJECT STRUCTURE

Keep frontend, backend, game engine, database and shared types cleanly separated.

For example:

src/
  app/
  components/
  features/
    game/
    puzzles/
    lessons/
    profile/
    leaderboard/
    multiplayer/
  lib/
  server/
  db/
  hooks/
  styles/

game-engine/
  board/
  pieces/
  rules/
  moves/
  ai/

prisma/
  schema.prisma

tests/

Avoid putting the entire application into one huge component.

---

# 29. SEED DATA

Create development seed data.

Include:

- Example users
- Example games
- Example puzzles
- Example lessons
- Example achievements
- Example leaderboard

This allows the application to look populated during development.

Clearly mark seed/demo data.

---

# 30. IMPORTANT: DON'T FAKE THE BACKEND

Do not create buttons that only change the UI.

When a feature is presented as implemented:

- It should actually communicate with the backend.
- Data should be persisted.
- Authentication should work.
- Game moves should be stored.
- User progress should be stored.
- Ratings should update.
- Online games should synchronize.

If a feature cannot yet be implemented, clearly mark it as TODO rather than pretending it works.

---

# 31. DEVELOPMENT APPROACH

Build this incrementally.

Phase 1:
- Project setup
- Responsive visual design
- Header
- Homepage
- Navigation
- Cards
- Assets

Phase 2:
- Authentication
- PostgreSQL
- Prisma
- User profiles

Phase 3:
- Chaturanga game engine
- Interactive board
- Offline AI

Phase 4:
- Online multiplayer
- WebSockets
- Game persistence
- Move validation

Phase 5:
- Puzzles
- Lessons
- Practice

Phase 6:
- Ratings
- Leaderboards
- Game history
- Achievements

Phase 7:
- Testing
- Security
- Performance
- Mobile optimization
- Deployment

---

# 32. FIRST TASK

Before writing large amounts of code:

1. Inspect the supplied image.
2. Inspect all supplied image assets.
3. Analyze the visual hierarchy.
4. Create the application architecture.
5. Create the database schema.
6. Create the route structure.
7. Explain the architecture briefly.
8. Then start implementing Phase 1.

Do not replace the visual design with a generic dashboard.

The final result should feel like:

**Chess.com functionality + Xiangqi.com game-platform architecture + Ancient Indian Chaturanga visual identity.**

The website should look like a serious, premium online strategy-game platform rather than an AI-generated landing page.