const fs = require('fs');
const path = require('path');

const sourceDir = 'c:\\Users\\Pratyush\\Downloads\\version 1.0.5.2';
const targetDir = 'p:\\chaturang\\Chaturanga-version-1.0.5';

// Ensure the mapping paths are relative
const moves = [
    // JS to targetDir/js
    { src: 'elo engine clock/elo-engine.js', dest: 'js/elo-engine.js' },
    { src: 'elo engine clock/game-clock.js', dest: 'js/game-clock.js' },
    { src: 'elo engine clock/clock-ui.js',   dest: 'js/clock-ui.js' },
    { src: 'files (6)/sound-engine.js',      dest: 'js/sound-engine.js' },
    { src: 'files (6)/premove.js',           dest: 'js/premove.js' },
    { src: 'files (4)/analysis-worker.js',   dest: 'js/analysis-worker.js' },
    { src: 'files (5)/spectator.js',         dest: 'js/spectator.js' },
    { src: 'rematch-revenge.js',             dest: 'js/rematch-revenge.js' },// Using root
    { src: 'files (4)/seer-critical.js',     dest: 'js/seer-critical.js' },
    { src: 'files (4)/board-themes.js',      dest: 'js/board-themes.js' },
    { src: 'files (4)/sangram-dharma.js',    dest: 'js/sangram-dharma.js' },
    { src: 'files (6)/adaptive-bot.js',      dest: 'js/adaptive-bot.js' },
    { src: 'dice-heatmap.js',                dest: 'js/dice-heatmap.js' },// Using root
    { src: 'openings-data.js',               dest: 'js/openings-data.js' },// Using root
    { src: 'weekly-yuddha.js',               dest: 'js/weekly-yuddha.js' },// Using root
    { src: 'navagraha v1.0.5/navagraha-engine.js', dest: 'js/navagraha-engine.js' },
    { src: 'files (5)/cn-encoder.js',        dest: 'js/cn-encoder.js' },
    { src: 'files (5)/connectivity-dot.js',  dest: 'js/connectivity-dot.js' },
    { src: 'files (5)/sw-patch.js',          dest: 'js/sw-patch.js' }
];

// HTML folders mapping -> targetDir/features/
const features = [
    { src: 'elo engine clock/elo-profile.html', destFolder: 'elo_profile',   filename: 'elo-profile.html' },
    { src: 'itihasa.html',                      destFolder: 'itihasa',       filename: 'itihasa.html' },
    { src: 'oracle.html',                       destFolder: 'oracle',        filename: 'oracle.html' },
    { src: 'pasha.html',                        destFolder: 'pasha',         filename: 'pasha.html' },
    { src: 'sankat.html',                       destFolder: 'sankat',        filename: 'sankat.html' },
    { src: 'vyuha-clash.html',                  destFolder: 'vyuha_clash',   filename: 'vyuha-clash.html' },
    { src: 'files (4)/samara.html',             destFolder: 'samara',        filename: 'samara.html' },
    { src: 'files (6)/sena.html',               destFolder: 'sena',          filename: 'sena.html' },
    { src: 'navagraha v1.0.5/navagraha.html',   destFolder: 'navagraha',     filename: 'navagraha.html' },
    { src: 'files (5)/offline.html',            destFolder: 'offline',       filename: 'offline.html' },
    { src: 'granth with live post game card.html', destFolder: 'granth',     filename: 'granth.html' }
];

// Combine server files
// We'll rename them slightly if they clash, but the plan was to merge them actually.
// For now, let's copy the files (3)/server.js to server_v1052.js and files (3)/lobby.html to lobby_v1052.html so they aren't lost, and we can manually merge.
moves.push({ src: 'files (3)/server.js', dest: 'server_v1052.js' });
moves.push({ src: 'files (3)/lobby.html', dest: 'lobby_v1052.html' });

moves.forEach(m => {
    const s = path.join(sourceDir, m.src);
    const d = path.join(targetDir, m.dest);
    if (fs.existsSync(s)) {
        fs.mkdirSync(path.dirname(d), { recursive: true });
        fs.copyFileSync(s, d);
        console.log('Copied', m.src, '->', m.dest);
    } else {
        console.error('MISSING:', s);
    }
});

const runRefactor = () => {
    // Process HTML
    features.forEach(f => {
        const s = path.join(sourceDir, f.src);
        const featuresBase = path.join(targetDir, 'features', f.destFolder);
        if (!fs.existsSync(featuresBase)) {
            fs.mkdirSync(featuresBase, { recursive: true });
        }
        
        const d = path.join(featuresBase, f.filename);
        if (fs.existsSync(s)) {
            // Read, modify paths, write
            let content = fs.readFileSync(s, 'utf-8');
            const prefix = '../../';
            
            content = content.replace(/(href|src)="((css|js|images|engine|puzzles|lessons|tournament)\/[^"]+)"/g, `$1="${prefix}$2"`);
            content = content.replace(/(href|src)='((css|js|images|engine|puzzles|lessons|tournament)\/[^']+)'/g, `$1='${prefix}$2'`);

            // Same root files logic
            const rootFiles = ['game.html', 'lobby.html', 'index.html', 'server.js', 'server-ws.js'];
            rootFiles.forEach(rf => {
                const regex = new RegExp(`(href|src)="${rf}((\\?|#)[^"]*)?"`, 'g');
                content = content.replace(regex, `$1="${prefix}$2"`);
            });

            fs.writeFileSync(d, content, 'utf-8');
            console.log('Copied and Updated', f.src, '->', `features/${f.destFolder}/${f.filename}`);
        } else {
            console.error('MISSING:', s);
        }
    });
};

runRefactor();
console.log('Phase 2 copy complete!');
