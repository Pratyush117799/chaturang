const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const featuresDir = path.join(rootDir, 'features');

if (!fs.existsSync(featuresDir)) {
    fs.mkdirSync(featuresDir);
}

const groups = {
    'acharya': ['acharya.html'],
    'benchmark': ['benchmark.html', 'benchmark-worker.js'],
    'granth': ['granth.html'],
    'kurukshetra': ['kurukshetra.html', 'kurukshetra_days2to12.js', 'kurukshetra_days14to17.js'],
    'akhara': ['akhara.html'],
    'army_builder': ['army_builder.html', 'vyuha_builder.html', 'vyuha-data.js'],
    'board_forge': ['board-forge.html'],
    'documentation': ['documentation_hub.html', 'shastra-kosh.html'],
    'campaigns': ['panchanga.html', 'rashtra-map.html'],
    'puzzles': ['puzzles.html', 'shubh.html'],
    'analysis': ['seer.html'],
    'lessons': ['lessons.html']
};

function processHtmlFile(filePath, depth) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Calculate prefix based on depth. If depth is 2 (e.g., features/acharya), prefix is '../../'
    const prefix = '../'.repeat(depth);

    // Replace href="css/..." with href="../../css/..."
    content = content.replace(/(href|src)="((css|js|images|engine|puzzles|lessons|tournament)\/[^"]+)"/g, `$1="${prefix}$2"`);
    
    // Also replace href='css/...' just in case
    content = content.replace(/(href|src)='((css|js|images|engine|puzzles|lessons|tournament)\/[^']+)'/g, `$1='${prefix}$2'`);

    // Replace root file references like href="lobby.html" -> href="../../lobby.html"
    // To do this safely, we match common root files.
    const rootFiles = ['game.html', 'lobby.html', 'index.html', 'server.js', 'server-ws.js', 'acharya.html', 'akhara.html', 'granth.html', 'kurukshetra.html', 'shubh.html', 'seer.html', 'army_builder.html', 'board-forge.html', 'tournament.html'];
    
    rootFiles.forEach(rf => {
        // Only replace if it's strictly the file name (e.g. href="lobby.html" or href="lobby.html?foo=bar")
        const regex = new RegExp(`(href|src)="${rf}((\\?|#)[^"]*)?"`, 'g');
        content = content.replace(regex, `$1="${prefix}$2"`);
        
        // Wait, if we are moving the files into subdirectories, inter-feature links need to be updated.
        // E.g., inside acharya.html, a link to 'lobby.html' becomes '../../lobby.html'.
        // But a link to 'kurukshetra.html' becomes '../../features/kurukshetra/kurukshetra.html'. 
        // We'll just replace with prefix + the original filename for now and fix inter-feature links globally below.
    });

    fs.writeFileSync(filePath, content, 'utf-8');
}

// First, move everything to their respective folders
for (const [folderName, files] of Object.entries(groups)) {
    const targetDir = path.join(featuresDir, folderName);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }

    files.forEach(file => {
        const sourcePath = path.join(rootDir, file);
        const destPath = path.join(targetDir, file);
        
        if (fs.existsSync(sourcePath)) {
            fs.renameSync(sourcePath, destPath);
            console.log(`Moved ${file} to features/${folderName}/`);
        }
    });
}

// Replace relative references inside JS files that moved with HTML files, if any.
// E.g., benchmark-worker.js, kurukshetra scripts. No path update usually needed if they load resources relatively or are loaded strictly by the HTML in the same folder.
// Wait! The HTML file might say src="benchmark-worker.js". Since both moved to the same dir, it remains src="benchmark-worker.js". Our regex above won't touch it because it doesn't start with css/ js/ etc.

// Now process all HTML files inside features/
for (const [folderName, files] of Object.entries(groups)) {
    const targetDir = path.join(featuresDir, folderName);
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const destPath = path.join(targetDir, file);
            if (fs.existsSync(destPath)) {
                processHtmlFile(destPath, 2);
                console.log(`Updated paths in ${file}`);
            }
        }
    });
}

// Replace inter-feature links globally across all HTML files
function fixInterFeatureLinks() {
    // Map filename to its new path relative to root
    const fileToNewPath = {};
    for (const [folderName, files] of Object.entries(groups)) {
        files.forEach(f => {
            if (f.endsWith('.html')) {
                fileToNewPath[f] = `features/${folderName}/${f}`;
            }
        });
    }

    const scanDirs = [rootDir, featuresDir];
    
    function processDir(dir) {
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                processDir(fullPath);
            } else if (fullPath.endsWith('.html')) {
                let content = fs.readFileSync(fullPath, 'utf-8');
                let changed = false;
                
                // Which depth is this file at?
                const relativeToRoot = path.relative(rootDir, fullPath);
                const depth = relativeToRoot.split(path.sep).length - 1;
                const prefix = depth === 0 ? './' : '../'.repeat(depth);
                
                for (const [filename, newPath] of Object.entries(fileToNewPath)) {
                    // Find links like href="acharya.html" or href="../../acharya.html"
                    // We need to replace them with prefix + newPath. 
                    // This is tricky, a simpler way is to standardize everything back to root then apply prefix.
                    
                    // Regex for old root-level links that might have been prefixed in processHtmlFile
                    // E.g., if depth=2, earlier we changed "acharya.html" to "../../acharya.html"
                    // Now we change "../../acharya.html" to "../../features/acharya/acharya.html"
                    
                    // Actually, let's just look for the filename itself bounded by quotes/slashes
                    // Let's replace the literal from processHtmlFile:
                    if (depth > 0) {
                        const oldLink = `${prefix}${filename}`;
                        if (content.includes(`"${oldLink}"`) || content.includes(`'${oldLink}'`) || content.includes(`"${oldLink}?`) || content.includes(`'${oldLink}?`)) {
                            content = content.split(`"${oldLink}"`).join(`"${prefix}${newPath}"`);
                            content = content.split(`'${oldLink}'`).join(`'${prefix}${newPath}'`);
                            // For queries like href="../../acharya.html?..."
                            content = content.replace(new RegExp(`"(${oldLink})(\\?[^"]*)?"`, 'g'), `"${prefix}${newPath}$2"`);
                            content = content.replace(new RegExp(`'(${oldLink})(\\?[^']*)?'`, 'g'), `'${prefix}${newPath}$2'`);
                            changed = true;
                        }
                    } else {
                        // For root files like lobby.html
                        const oldLink = filename;
                        if (content.includes(`"${oldLink}"`) || content.includes(`'${oldLink}'`) || content.includes(`"${oldLink}?`) || content.includes(`'${oldLink}?`)) {
                            // ensure we don't double replace (e.g., if it's already "features/.../acharya.html")
                            // regex with negative lookbehind would be ideal, but JS supports it.
                            const regex = new RegExp(`(?<!/)"${oldLink}((\\?[^"]*)?)?"`, 'g');
                            content = content.replace(regex, `"${newPath}$1"`);
                            changed = true;
                        }
                    }
                }
                
                if (changed) {
                    fs.writeFileSync(fullPath, content, 'utf-8');
                    console.log(`Fixed inter-feature links in ${relativeToRoot}`);
                }
            }
        });
    }
    
    processDir(rootDir);
}

fixInterFeatureLinks();

console.log("Done refactoring.");
