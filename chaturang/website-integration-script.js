const fs = require('fs');
const path = require('path');

const websiteDir = path.join('p:', 'chaturang', 'website');
const gameDir = path.join('p:', 'chaturang', 'Chaturanga-version-1.0.5');

// 1. Update server.js
const serverJsPath = path.join(websiteDir, 'server.js');
let serverJs = fs.readFileSync(serverJsPath, 'utf8');
serverJs = serverJs.replace(
    "const root = 'd:\\\\chaturang\\\\website';",
    "const root = path.join(__dirname, '..');"
);
serverJs = serverJs.replace(
    "if (urlPath === '/') urlPath = '/index.html';",
    "if (urlPath === '/') urlPath = '/website/index.html';"
);
fs.writeFileSync(serverJsPath, serverJs);
console.log('Updated server.js');

// 2. Update index.html
const indexHtmlPath = path.join(websiteDir, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
indexHtml = indexHtml.replace(/Chaturanga-version-1\.0\.3\.3/g, 'Chaturanga-version-1.0.5');
indexHtml = indexHtml.replace(/v1\.0\.3\.3/g, 'v1.0.5');
fs.writeFileSync(indexHtmlPath, indexHtml);
console.log('Updated website/index.html');

// 3. Extract CSS into website-integration.css
const styleCssPath = path.join(websiteDir, 'css', 'style.css');
const styleCss = fs.readFileSync(styleCssPath, 'utf8');

// Simple extraction by finding the sections
// The navbar section starts around line 81 and ends before HERO section
const navbarRegex = /\/\* NAVBAR \*\/[\s\S]*?(?=\/\* HERO \*\/)/i;
const footerRegex = /\/\* FOOTER \*\/[\s\S]*?(?=$)/i;

let integrationCss = `
/* =========================================
   Website Integration CSS
   Extracted from website/css/style.css
   ========================================= */

/* Ensure the navbar respects z-index and doesn't conflict */
`;

const navbarMatch = styleCss.match(navbarRegex);
if (navbarMatch) integrationCss += "\n" + navbarMatch[0];

const footerMatch = styleCss.match(footerRegex);
if (footerMatch) integrationCss += "\n" + footerMatch[0];

const integrationCssPath = path.join(gameDir, 'css', 'website-integration.css');
fs.writeFileSync(integrationCssPath, integrationCss);
console.log('Created website-integration.css');
