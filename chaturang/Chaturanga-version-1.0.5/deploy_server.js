const fs = require('fs');

let serverContent = fs.readFileSync('server_v1052.js', 'utf8');
if (!serverContent.includes("const http = require('http');")) {
    serverContent = "const http = require('http');\n" + serverContent;
}

// Write the fixed content to server.js
fs.writeFileSync('server.js', serverContent);

// Overwrite lobby.html
let lobbyContent = fs.readFileSync('lobby_v1052.html', 'utf8');
fs.writeFileSync('lobby.html', lobbyContent);

// Remove the temp files
fs.unlinkSync('server_v1052.js');
fs.unlinkSync('lobby_v1052.html');

console.log("Server and Lobby successfully updated.");
