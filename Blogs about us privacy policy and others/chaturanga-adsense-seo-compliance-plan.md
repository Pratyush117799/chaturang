# Chaturanga Website — AdSense, SEO & Compliance Master Plan

**For: Antigravity (coding agent)**
**Scope:** Google AdSense readiness, SEO to rank for chess/xiangqi/chaturanga search terms, standard error pages, an FAQ section, and the legal/trust pages Google expects a monetized site to have.

> Note on sourcing: the AdSense requirements and SEO practices below reflect Google's publicly documented policies and standard technical SEO practice as of this plan's writing. Google updates AdSense Program Policies periodically — before final submission for AdSense approval, do a final pass against the live policy pages at `support.google.com/adsense/answer/48182` (Program policies) and `support.google.com/adsense/answer/9724` (Eligibility requirements), since this document should not be treated as the permanent source of truth.

---

## PART 1 — Google AdSense Compliance

### 1.1 Why this matters for a game site specifically
Google's reviewers reject "thin content" sites — sites that are just an interactive tool/game with little crawlable text. **The lessons pages, FAQ, history/rules articles, and About page are not optional extras — they are what makes this site AdSense-eligible at all.** The game itself (the board, the multiplayer match) is the product; the surrounding content is what gets it approved and indexed.

### 1.2 Required pages checklist (blocking — must exist before applying)
- [ ] **Privacy Policy** (`/privacy-policy`) — see Part 5.1 for required clauses.
- [ ] **Terms and Conditions** (`/terms`) — see Part 5.2.
- [ ] **About Us** (`/about`) — see Part 5.3.
- [ ] **Contact Us** (`/contact`) — see Part 5.4, with a real, working contact method (form or email — not a dead mailto).
- [ ] All four pages linked from the **global footer** on every page, not buried.
- [ ] `robots.txt` and `sitemap.xml` present and valid (Part 2.5).
- [ ] HTTPS enforced site-wide (redirect all `http://` → `https://`).
- [ ] Site is mobile-responsive (already true for the lessons UI rebuild — extend the same responsive rules to every page in this plan).

### 1.3 Content quality checklist
- [ ] At least 15–20 substantial content pages before applying (this is the practical benchmark reviewers use even though Google doesn't publish an exact number) — lessons pages, history/rules articles, FAQ, and the trust pages together should clear this.
- [ ] No copied/scraped text anywhere — every history/rules paragraph should be written fresh for this site, even when summarizing well-known facts.
- [ ] No "coming soon" or empty placeholder pages live at the time of submission — unfinished sections should be unlinked/unpublished, not shipped empty.
- [ ] No content violating AdSense's prohibited categories (adult, gambling, violence, hate, misleading health/medical claims, etc.) — not a risk for this site's subject matter, but confirm no user-generated content (chat, forum posts) can surface such content unmoderated if/when social features ship.

### 1.4 Ad placement rules (apply once ads are actually inserted — build the layout to respect these from day one so retrofitting isn't needed)
- [ ] Never place ad units so close to navigation/buttons that users could mis-click them as game controls — keep a clear visual gap between any ad slot and the board/lesson controls.
- [ ] Never use language like "click the ads," "support us by clicking," or arrows/graphics pointing at ad units.
- [ ] Never place misleading images directly beside an individual ad unit.
- [ ] Don't stack excessive ads above the fold on any page (reviewers and later automated checks flag this).
- [ ] Ads must not be placed inside the interactive game board/lesson player itself — keep them in dedicated layout slots (sidebar, between-content, footer) outside the play surface.
- [ ] Add `ads.txt` at the site root once an AdSense publisher ID exists (`/ads.txt`, content provided by AdSense after signup) — required for programmatic ad integrity, not optional.

### 1.5 Privacy / consent requirements tied to running ads
- [ ] Cookie consent banner for EU/UK visitors (GDPR) before any personalized-ad cookie is set — a simple accept/reject banner is sufficient at this stage; block ad personalization scripts until consent is given.
- [ ] A working link to Google's ad settings / opt-out (`adssettings.google.com`) from the Privacy Policy (Part 5.1 covers the required wording).
- [ ] **Flag for the site owner, not something Antigravity can decide alone:** if this site's audience meaningfully includes children under 13 (a chess/chaturanga learning game plausibly does), Google's Families/child-directed-treatment ad policies may require additional configuration (e.g., non-personalized ads only, no third-party ad networks that don't support child-directed treatment). This needs a deliberate decision before AdSense is enabled — build the consent/config plumbing generically enough that this can be toggled without a rebuild.

### 1.6 Pre-submission checklist (run this right before applying for AdSense)
- [ ] All 4 trust pages live and linked from footer.
- [ ] 15–20+ real content pages live and indexed (check via `site:yourdomain.com` in Google Search).
- [ ] No broken links, no empty pages, no lorem-ipsum placeholders anywhere.
- [ ] Site loads fast on mobile (Part 2.5 — Core Web Vitals).
- [ ] `ads.txt`, `robots.txt`, `sitemap.xml` all resolve correctly at the root.
- [ ] Google Search Console verified and sitemap submitted (Part 2.5).

---

## PART 2 — SEO Strategy (rank for "chess", "xiangqi", "chaturanga" and related terms)

### 2.1 Target keyword clusters
Structure content around **clusters**, not single keywords — each cluster becomes one or more pages that interlink.

**Cluster A — Chaturanga (primary brand + history intent)**
`chaturanga`, `what is chaturanga`, `chaturanga rules`, `chaturanga vs chess`, `history of chaturanga`, `chaturanga origin of chess`, `play chaturanga online`, `ancient indian chess game`

**Cluster B — Chess (high competition, target long-tail + comparison angles)**
`chess`, `chess rules for beginners`, `origin of chess`, `history of chess`, `learn chess online free`, `chess vs xiangqi vs chaturanga`, `oldest chess game in the world`

**Cluster C — Xiangqi (Chinese chess)**
`xiangqi`, `chinese chess`, `xiangqi rules`, `how to play xiangqi`, `xiangqi vs chess`, `xiangqi piece moves`, `play xiangqi online`

**Cluster D — Comparison / bridge content (highest realistic ranking opportunity — low competition, direct relevance to this site's unique angle)**
`chaturanga vs chess vs xiangqi`, `difference between chess and xiangqi`, `board games related to chess`, `evolution of chess from chaturanga`, `four-player chess`, `ancient board games history`

**Checklist**
- [ ] Cluster D is the site's realistic **near-term ranking opportunity** — "chess" alone is extremely competitive; a comparison/history angle that no major chess site covers in depth is where this site can actually win top rankings. Prioritize Cluster D content first.
- [ ] Every cluster gets one dedicated, deeply-written page (800+ words of genuine content, not thin summaries) plus supporting internal links from lessons/FAQ pages.

### 2.2 Site architecture & URLs
- [ ] Clean, descriptive, hyphenated URLs: `/chaturanga-vs-chess`, `/what-is-xiangqi`, `/lessons/pieces-and-moves`, not `/page?id=12`.
- [ ] Flat-ish structure — important pages reachable within 2–3 clicks from the homepage.
- [ ] Consistent internal linking: every lesson page links to the relevant history/comparison article and vice versa; FAQ answers link out to the fuller article covering that topic.
- [ ] Breadcrumb navigation on all deep pages (`Home / Lessons / Pieces and Moves`) — also feeds `BreadcrumbList` structured data (2.3).

### 2.3 On-page SEO checklist (apply to every page)
- [ ] Unique `<title>` per page, primary keyword near the front, under ~60 characters (e.g. `Chaturanga vs Chess vs Xiangqi: What's the Difference? | Chaturanga.com`).
- [ ] Unique `<meta name="description">` per page, ~150–160 characters, includes the target keyword naturally and a reason to click.
- [ ] One `<h1>` per page matching the page's core topic; `<h2>`/`<h3>` used for real subsections, not just styling.
- [ ] Descriptive `alt` text on all images (piece icons, diagrams, screenshots) — e.g. `alt="Xiangqi board showing the river and palace"`, not `alt="image1"`.
- [ ] Canonical tag (`<link rel="canonical">`) on every page to prevent duplicate-content issues (especially relevant once hash-routed views like the lesson player are also exposed as real crawlable URLs — see 2.4).
- [ ] Open Graph + Twitter Card meta tags on every page (title, description, image) for clean social shares — indirectly helps CTR from search too via rich previews.

### 2.4 Content to build (this is the actual ranking fuel — prioritize in this order)
1. **Homepage** — clearly states what the site is (Chaturanga game + lessons), links to Play, Lessons, and the comparison article.
2. **`/what-is-chaturanga`** — history, etymology (Sanskrit origin, meaning "four divisions of an army"), connection to chess/xiangqi/shogi, how it's played today.
3. **`/chaturanga-vs-chess-vs-xiangqi`** — the flagship comparison article (Cluster D). Table comparing board size, piece count, win conditions, player count, geographic origin.
4. **`/lessons`** — already spec'd in the previous implementation guide; each topic/lesson page should have real descriptive text (not just interactive board), since crawlers can't play the game.
5. **`/faq`** — Part 4 below.
6. **Rules pages per variant** if scope allows: `/chaturanga-rules`, `/xiangqi-rules`, `/chess-rules` — each a genuinely useful standalone reference, not just game marketing.

**Important technical note for the lessons UI:** the lesson player in `lessons.html` (built previously) is a client-side, hash-routed single page. **Hash routes (`#/lesson/L001`) are not separately crawlable by Google.** For SEO, either:
- (a) give each topic (not necessarily every lesson) a real server-rendered URL (e.g. `/lessons/pieces-and-moves`) that renders enough static text (title, description, list of lessons, culturalSource blurbs) for indexing, with the interactive hash-router taking over client-side once loaded, **or**
- (b) accept that only `/lessons` itself is indexed and rely on the dedicated content pages in this section to carry the SEO weight instead.
Recommend (a) — it's a moderate lift and meaningfully increases indexable content volume.

- [ ] Decide (a) vs (b) and implement before the next SEO review pass.

### 2.5 Technical SEO
- [ ] `robots.txt` at root — allow crawling of all public content pages, disallow any admin/internal routes, include `Sitemap: https://yourdomain.com/sitemap.xml`.
- [ ] `sitemap.xml` — auto-generated, includes every public page (homepage, lessons topics, articles, FAQ, legal pages), regenerated on deploy or on a schedule if content grows.
- [ ] Structured data (JSON-LD) added per page type:
  - `Organization` + `WebSite` on the homepage (enables sitelinks search box eligibility).
  - `BreadcrumbList` on all deep pages.
  - `FAQPage` on the FAQ page (Part 4.3) — this is a meaningful win, as it can surface as rich results directly in Google search.
  - `Article` on history/comparison/rules pages (headline, datePublished, author/organization).
  - `HowTo` on individual lesson pages describing how to move each piece, if scope allows — a nice-to-have, not blocking.
- [ ] Google Search Console: verify domain ownership, submit sitemap, monitor Coverage and Core Web Vitals reports post-launch.
- [ ] Core Web Vitals targets: LCP < 2.5s, CLS < 0.1, INP < 200ms — audit with PageSpeed Insights on both mobile and desktop; the board/piece images should be appropriately sized/compressed (`.webp`, already the convention used) and lazy-loaded where off-screen.
- [ ] Ensure the site is indexable at all — no accidental `noindex` meta tag or blanket `Disallow: /` left over from staging.

### 2.6 Off-page notes (flag for the site owner — not something code alone solves)
- Backlinks from chess/board-game community sites, Reddit (r/chess, r/xiangqi), and Wikipedia's Chaturanga article's external-links section (if it meets Wikipedia's linking guidelines) are realistic, high-value link targets once the comparison article exists.
- This is a content-marketing/outreach task, not a coding task — note it in the plan but it isn't Antigravity's responsibility.

---

## PART 3 — Error Pages (404, 500, and related)

Google explicitly evaluates whether a site handles broken links/errors gracefully — a raw stack trace or a blank page is both a bad user-experience signal and a bad crawl signal.

### 3.1 `404 Not Found`
- [ ] Custom-designed page matching the site's visual identity (gold/dark theme, Cinzel/Outfit fonts) — not the framework's default error page.
- [ ] **Must return a real HTTP `404` status code**, not a `200` with "not found" text in the body (a common mistake — Google explicitly flags "soft 404s" as harmful to SEO because they waste crawl budget and confuse indexing).
- [ ] Friendly copy ("This square is empty — the page you're looking for has moved or never existed") + clear navigation back: link to Homepage, Play, and Lessons.
- [ ] A working search box or a short list of popular pages (Homepage, Lessons, FAQ) so lost users aren't dead-ended.
- [ ] Server-side route: any unmatched path in Express should hit a catch-all `app.use((req,res) => res.status(404).render('404'))` (or equivalent) placed **after** all real routes.

### 3.2 `500 Internal Server Error`
- [ ] Custom-designed page, same visual identity, **must return HTTP `500`**.
- [ ] Copy should reassure the user without exposing internals ("Something went wrong on our end — try again in a moment") — **never** render a raw stack trace or `error.message` to the client in production.
- [ ] Express error-handling middleware (4-arg signature `(err, req, res, next)`) registered last, logs the real error server-side (e.g. to your existing logging setup) and renders the generic 500 page to the client.
- [ ] Optional but recommended: a "Report this issue" link (mailto or contact form) on the 500 page so real errors surface to you instead of silently bouncing users.

### 3.3 Other status pages worth covering
- [ ] `403 Forbidden` — for any access-restricted route (e.g. an admin area if one exists), same visual treatment.
- [ ] `503 Service Unavailable` — for planned maintenance windows; include a `Retry-After` header if used, and make sure it's *not* left permanently mounted after maintenance ends (a stray 503 can tank the whole site's indexing if Google keeps hitting it).

### 3.4 Verification checklist
- [ ] Hit a genuinely nonexistent URL in production and confirm the browser network tab shows status `404`, not `200`.
- [ ] Force a server error in a staging environment and confirm it returns `500` with the friendly page, not a crash/blank response.
- [ ] Confirm error pages themselves are set `noindex` (they shouldn't be indexed as content) via `<meta name="robots" content="noindex">`, while still being reachable/functional for users.

---

## PART 4 — FAQ Section

### 4.1 Purpose & placement
A single `/faq` page, plus (optionally) the most relevant 3–4 questions embedded contextually on the homepage and comparison article. This page does double duty: genuine user value **and** a strong SEO surface for question-style search queries ("what is chaturanga", "is xiangqi harder than chess") which Google frequently surfaces as "People also ask" boxes.

### 4.2 Question set (organize into these groups; expand/refine with a real keyword tool before publishing)

> The list below is a solid starting set reflecting how people actually phrase these searches. **Before final publish, validate and expand this list using Ahrefs' Keyword Generator / "Questions" filter, AnswerThePublic, or Google's own "People also ask" boxes for `chaturanga`, `xiangqi`, and `chess`** — search intent and phrasing shift over time and by region, and a live tool will surface fresher long-tail variants than this static list.

**Group 1 — About Chaturanga**
- What is Chaturanga?
- What does the word "Chaturanga" mean?
- When was Chaturanga invented?
- Is Chaturanga the origin of chess?
- How do you play Chaturanga?
- What are the basic rules of Chaturanga?
- How many players can play Chaturanga?
- What pieces are used in Chaturanga?
- Is Chaturanga still played today?
- Can I play Chaturanga online for free?

**Group 2 — Chaturanga vs. Chess vs. Xiangqi**
- What is the difference between Chaturanga and chess?
- What is the difference between Chaturanga and Xiangqi?
- How is Xiangqi different from chess?
- Which came first: Chaturanga, chess, or Xiangqi?
- Is Xiangqi harder to learn than chess?
- Can chess players learn Xiangqi easily?
- What other games evolved from Chaturanga?

**Group 3 — About Xiangqi (Chinese Chess)**
- What is Xiangqi?
- What is Chinese chess called?
- How do you play Xiangqi for beginners?
- What do the "river" and "palace" mean in Xiangqi?
- How many pieces does each side have in Xiangqi?
- How do you win a game of Xiangqi?
- Is Xiangqi more popular than chess?

**Group 4 — About Chess & General Strategy**
- Where did chess originate?
- What is the oldest known form of chess?
- What are the basic rules of chess for beginners?
- What is the best way to learn chess strategy as a beginner?
- Are there free online chess lessons?
- What is checkmate in chess?

**Group 5 — Using this site**
- Is this website free to use?
- Do I need to create an account to play?
- Can I play against friends online?
- How do the interactive lessons work?
- Is my progress saved if I create an account?

**Checklist**
- [ ] Every answer is 2–5 sentences of genuinely useful, original text — not a one-line stub (thin FAQ answers hurt both user trust and the `FAQPage` rich-result eligibility).
- [ ] Where a fuller answer exists as a standalone article (e.g. the comparison piece), the FAQ answer ends with a link to it.
- [ ] Group headers become `<h2>`s; each question is an `<h3>` or an accessible accordion trigger.

### 4.3 FAQPage structured data
- [ ] Implement `FAQPage` JSON-LD on `/faq` with `mainEntity` entries matching the visible Q&A content exactly (structured data must match on-page content — mismatches can get the rich result revoked).
- [ ] Keep the FAQ page's JSON-LD in sync automatically if the FAQ content is stored as data rather than hardcoded HTML (recommended: drive both the visible accordion and the JSON-LD from one source array, same pattern as `lesson-data.js` driving the lessons UI).

### 4.4 Implementation checklist
- [ ] Accordion UI (expand/collapse per question) matching the site's existing gold/dark visual system.
- [ ] Anchor-linkable questions (`/faq#is-this-free`) so specific answers can be shared/linked directly.
- [ ] Search/filter box if the list grows past ~20–25 questions.

---

## PART 5 — Legal & Trust Pages

### 5.1 Privacy Policy (`/privacy-policy`)
Required sections:
- [ ] What data is collected (account info, gameplay/progress data per the earlier MongoDB progress-tracking work, cookies, analytics).
- [ ] **Explicit disclosure of Google AdSense / Google as a third-party vendor** using cookies to serve ads based on prior visits, plus a link to Google's Ads Settings (`https://adssettings.google.com`) and to `https://policies.google.com/technologies/ads` for how Google uses data.
- [ ] Disclosure of any analytics tool in use (e.g. Google Analytics) and what it tracks.
- [ ] Cookie policy — what cookies are set, session vs. persistent, and how to opt out/manage them via browser settings and the consent banner (Part 1.5).
- [ ] User rights — how to request data deletion/export, contact method for privacy requests (must route to the same address as the Contact page, Part 5.4).
- [ ] GDPR-relevant language for EU visitors (lawful basis for processing, right to erasure/access) and a CCPA-relevant "Do Not Sell My Personal Information" section if California traffic is expected.
- [ ] **A children's-privacy section** — state plainly whether the site knowingly collects data from children under 13, and how that's handled, given the audience overlap noted in Part 1.5.
- [ ] Last-updated date at the top, and a note that policy changes will be reflected on this page.

### 5.2 Terms and Conditions (`/terms`)
Required sections:
- [ ] Acceptance of terms (using the site = agreeing to these terms).
- [ ] Account rules (age requirements, one account per person, prohibited behavior — cheating, harassment in multiplayer/social features).
- [ ] Intellectual property — the game's original content (lesson text, artwork, code) is owned by the site; chess/xiangqi/chaturanga as *games* are public domain/traditional, but this site's specific presentation is not.
- [ ] Disclaimer of warranties / limitation of liability (standard "as-is" service language).
- [ ] Termination clause (site can suspend/terminate accounts for abuse).
- [ ] Governing law/jurisdiction.
- [ ] Contact information for legal inquiries.

### 5.3 About Us (`/about`)
- [ ] What the site is and why it exists (Chaturanga's role as the shared ancestor of chess and xiangqi, the site's mission to teach it) — this is also a strong natural place to reinforce Cluster A/D keywords organically.
- [ ] Who's behind it (team/founder blurb — even a short one is better than none; fully anonymous sites read as lower-trust to both users and AdSense reviewers).
- [ ] What makes the lessons/approach distinctive (the cultural-history framing already built into the lesson content).

### 5.4 Contact Us (`/contact`)
- [ ] A real, working contact form (name, email, message, spam protection e.g. honeypot field or CAPTCHA) that actually delivers to a monitored inbox — **not** a static `mailto:` link alone (forms read as more trustworthy to reviewers and are more accessible).
- [ ] A visible support/contact email as a fallback.
- [ ] Confirm this page is reachable from the footer of every other page — this is one of the specific things AdSense reviewers check for.

---

## PART 6 — File/route structure (Express)

```
/public/
  /pages/
    404.html (or .ejs/.pug template, matching whatever templating the app already uses)
    500.html
    about.html
    contact.html
    privacy-policy.html
    terms.html
    faq.html
    what-is-chaturanga.html
    chaturanga-vs-chess-vs-xiangqi.html
  robots.txt
  sitemap.xml   (generated, see 2.5)
  ads.txt       (added once AdSense publisher ID exists)

/server/
  routes/
    pages.js        → GET /about, /contact, /privacy-policy, /terms, /faq, etc.
    content.js       → GET /what-is-chaturanga, /chaturanga-vs-chess-vs-xiangqi, etc.
  middleware/
    notFoundHandler.js   → mounted LAST among routes, returns 404
    errorHandler.js      → 4-arg Express error middleware, returns 500, logs real error server-side
```

**Checklist**
- [ ] `notFoundHandler` is registered after every real route (`app.use(...)` order matters in Express — a catch-all placed too early will shadow real routes).
- [ ] `errorHandler` is the very last `app.use(...)` call in the whole app.
- [ ] Contact form POST endpoint has server-side validation and rate limiting (prevents spam abuse of the form).

---

## PART 7 — Testing & Launch Checklist

- [ ] All 4 trust pages + FAQ + 404/500 live, linked from footer, and pass a manual read-through for typos/placeholder text.
- [ ] `curl -I https://yourdomain.com/does-not-exist` returns `404`.
- [ ] Force a server exception in staging → confirm `500` page renders, no stack trace leaks to the client, error is logged server-side.
- [ ] `robots.txt`, `sitemap.xml`, `ads.txt` all resolve with correct content-type and content.
- [ ] Google Search Console: domain verified, sitemap submitted, no coverage errors after first crawl.
- [ ] PageSpeed Insights: mobile score reviewed, Core Web Vitals within target (2.5).
- [ ] `FAQPage` and other JSON-LD blocks validated with Google's Rich Results Test.
- [ ] Cookie consent banner blocks ad-personalization scripts until consent is given (test in an EU-simulated request or via browser dev tools).
- [ ] Full site crawl with a tool like Screaming Frog (or equivalent) before AdSense submission — check for broken links, missing titles/meta descriptions, and duplicate content.
- [ ] Re-read Part 1.6 pre-submission checklist top to bottom before actually applying for AdSense.
