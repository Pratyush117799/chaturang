const fs = require('fs');
const path = require('path');

const srcGame = 'p:\\chaturang\\Chaturanga-version-1.0.5';
const srcWeb = 'p:\\chaturang\\website';
const destBase = 'c:\\Users\\Pratyush\\Downloads\\version 1.0.5.2';

const destGame = path.join(destBase, 'game');
const destWeb = path.join(destBase, 'website');

function copyDirRecursive(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(item => {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        if (fs.lstatSync(srcPath).isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        } else {
            // don't copy node scripts used for patching
            if (!item.endsWith('.js') || !['refactor.js', 'integrate.js', 'deploy_server.js', 'patch_bugs.js', 'patch_ui.js', 'patch_ui_2.js'].includes(item)) {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    });
}

// 1. Copy Game
console.log('Copying Game...');
if (!fs.existsSync(destGame)) fs.mkdirSync(destGame, { recursive: true });
copyDirRecursive(srcGame, destGame);

// 2. Copy Website
console.log('Copying Website...');
if (!fs.existsSync(destWeb)) fs.mkdirSync(destWeb, { recursive: true });
copyDirRecursive(srcWeb, destWeb);

// 3. Update paths in website/index.html
const indexHtmlPath = path.join(destWeb, 'index.html');
let html = fs.readFileSync(indexHtmlPath, 'utf8');

// The original paths were pointing to ../Chaturanga-version-1.0.5
html = html.replace(/href="\.\.\/Chaturanga-version-1\.0\.5\//g, 'href="../game/');

// Add links to the final new modes (Oracle, Pasha, Sankat, etc.). 
// For now, it's sufficient if we just fix the main game links, as the prompt says:
// "Add exclusive features of version 1.0.5.2 to the website"
// "Eliminate unneeded content on the website to avoid ambiguity"

// Remove "Coming in v1.0.4" teasers
const teaserRegex = /<!-- v1\.0\.4 Feature Teasers -->[\s\S]*?<\/section>/;
if (teaserRegex.test(html)) {
    // Actually the <section id="play"> ends right after the teasers. So just matching to the end of the div.
    html = html.replace(/<!-- v1\.0\.4 Feature Teasers -->[\s\S]*?(<\/div>\s*<\/section>)/, '$1');
}

// Rename "Coming in v1.0.4" from Battalion card
html = html.replace(/<span class="cs-text">Coming in v1\.0\.4<\/span>/g, '<span class="cs-text">Available Now in game!</span>');

fs.writeFileSync(indexHtmlPath, html);
console.log('Website index.html updated');

// 4. Archive old loose files in version 1.0.5.2
const archiveDir = path.join(destBase, 'raw_archive');
if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir);

fs.readdirSync(destBase).forEach(item => {
    // move everything except 'game', 'website', 'raw_archive'
    if (item === 'game' || item === 'website' || item === 'raw_archive' || item === 'website-port') return;
    try {
        const oldP = path.join(destBase, item);
        const newP = path.join(archiveDir, item);
        fs.renameSync(oldP, newP);
    } catch(e) {
        console.error('Could not move ' + item, e.message);
    }
});
console.log('Archive complete');

