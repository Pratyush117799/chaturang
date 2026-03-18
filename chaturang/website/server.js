const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 8765;
const root = 'd:\\chaturang\\website';

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    if (urlPath === '/') urlPath = '/index.html';
    const fp = path.join(root, urlPath);
    const ext = path.extname(fp);
    try {
        const data = fs.readFileSync(fp);
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
        res.end(data);
    } catch (e) {
        res.writeHead(404);
        res.end('Not found: ' + fp);
    }
});

server.listen(port, () => console.log('Chaturanga server running at http://localhost:' + port));
