const fs = require('fs');
const path = require('path');

const gameDir = path.join('p:', 'chaturang', 'Chaturanga-version-1.0.5');
const filesToInject = ['game.html', 'kurukshetra.html', 'shubh.html', 'board-forge.html'];

const headerHtml = `
  <!-- ========================================= -->
  <!-- WEBSITE INTEGRATION HEADER                -->
  <!-- ========================================= -->
  <link rel="stylesheet" href="css/website-integration.css" />
  <nav id="navbar" class="navbar" style="position: absolute; top: 0; width: 100%; z-index: 100000; background: linear-gradient(180deg, #110e05 0%, #1a1408 100%); border-bottom: 1px solid rgba(200, 150, 12, 0.22); height: 70px;">
    <div class="nav-container" style="display: flex; justify-content: space-between; align-items: center; padding: 0 20px; height: 100%;">
      <a href="../website/index.html" class="nav-logo" style="text-decoration:none; display:flex; gap:8px; align-items:center;">
        <span class="logo-devanagari" style="color:var(--gold-light); font-size:1.4rem;">चतुरंग</span>
        <span class="logo-divider" style="color:var(--text-muted);">·</span>
        <span class="logo-latin" style="color:var(--gold-light); font-family:'Cinzel', serif; font-weight:700; font-size:1.2rem;">Chaturanga</span>
      </a>
      <ul class="nav-links" style="display: flex; gap: 20px; list-style: none; margin: 0; padding: 0;">
        <li><a href="../website/index.html#about" style="color: var(--text-secondary); text-decoration: none; font-size: 0.9rem; font-weight: 600; font-family: 'Outfit', sans-serif;">About</a></li>
        <li><a href="../website/index.html#play" style="color: var(--text-secondary); text-decoration: none; font-size: 0.9rem; font-weight: 600; font-family: 'Outfit', sans-serif;">Play</a></li>
        <li><a href="../website/index.html#docs" style="color: var(--text-secondary); text-decoration: none; font-size: 0.9rem; font-weight: 600; font-family: 'Outfit', sans-serif;">Documentation</a></li>
      </ul>
    </div>
  </nav>
`;

const footerHtml = `
  <!-- ========================================= -->
  <!-- WEBSITE INTEGRATION FOOTER                -->
  <!-- ========================================= -->
  <footer class="footer" style="background: #0d0a04; border-top: 1px solid rgba(200,150,12,0.22); padding: 40px 20px; text-align: center; margin-top: auto; position: relative; z-index: 10;">
    <div class="footer-brand" style="margin-bottom: 20px;">
      <div class="footer-logo" style="display:flex; justify-content:center; gap:8px; align-items:center; margin-bottom: 10px;">
        <span class="logo-devanagari" style="color:var(--gold-light); font-size:1.4rem;">चतुरंग</span>
        <span class="logo-divider" style="color:var(--text-muted);">·</span>
        <span class="logo-latin" style="color:var(--gold-light); font-family:'Cinzel', serif; font-weight:700; font-size:1.2rem;">Chaturanga</span>
      </div>
      <p style="color: var(--text-muted); font-size: 0.85rem; max-width: 400px; margin: 0 auto;">The ancient Indian 4-player war game &amp; ancestor of Chess. Revived for the digital age.</p>
    </div>
    <div class="footer-bottom" style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
      <p style="color: var(--text-muted); font-size: 0.8rem;">&copy; 2024 Chaturanga Project. Open source and dedicated to the history of board games.</p>
    </div>
  </footer>
`;

const cssOverrides = `
/* Overrides for Game Layout to accommodate the 70px header */
.top-nav {
  top: 70px !important;
}
.game-layout {
  padding-top: calc(var(--nav-h) + 70px) !important;
}
.settings-drawer {
  top: calc(var(--nav-h) + 70px) !important;
  height: calc(100vh - var(--nav-h) - 70px) !important;
}
.nav { /* kurukshetra/shubh top nav */
  top: 70px !important;
}
#gameScreen {
  padding-top: calc(60px + 70px) !important; 
}
#app { /* board-forge */
  padding-top: calc(60px + 70px) !important;
}
.bf-nav {
  top: 70px !important;
}
body {
  display: flex;
  flex-direction: column;
}
`;

// Append overrides to CSS
const cssPath = path.join(gameDir, 'css', 'website-integration.css');
fs.appendFileSync(cssPath, cssOverrides);
console.log('Appended overrides to website-integration.css');

for (const file of filesToInject) {
  const filePath = path.join(gameDir, file);
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Inject Header after <body>
  if (!content.includes('WEBSITE INTEGRATION HEADER')) {
    content = content.replace(/<body[^>]*>/i, (match) => match + "\\n" + headerHtml);
  }

  // Inject Footer before </body>
  if (!content.includes('WEBSITE INTEGRATION FOOTER')) {
    content = content.replace(/<\/body>/i, (match) => footerHtml + "\\n" + match);
  }

  fs.writeFileSync(filePath, content);
  console.log('Injected header/footer into', file);
}
