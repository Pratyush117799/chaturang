const fs = require('fs');
const jsdom = require('jsdom');
const path = require('path');
const { JSDOM } = jsdom;

const html = fs.readFileSync('game.html', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();

let logData = "";

virtualConsole.on("error", (err) => {
  logData += "VC ERROR: " + (err.stack || err) + "\n";
});
virtualConsole.on("jsdomError", (err) => {
  logData += "JSDOM ERROR: " + (err.stack || err) + "\n";
});
virtualConsole.on("log", (msg) => {
  logData += "LOG: " + msg + "\n";
});

const dom = new JSDOM(html, { 
    runScripts: "dangerously", 
    resources: "usable",
    url: "file:///" + path.resolve('game.html').replace(/\\/g, '/'),
    virtualConsole,
    beforeParse(window) {
        // Mock localStorage
        let storage = {};
        window.localStorage = {
            getItem: (key) => storage[key] || null,
            setItem: (key, val) => { storage[key] = String(val); },
            removeItem: (key) => { delete storage[key]; },
            clear: () => { storage = {}; },
            length: 0,
            key: (i) => Object.keys(storage)[i]
        };

        // Mock AudioContext
        window.AudioContext = window.webkitAudioContext = function() {
            return {
                createOscillator: () => ({
                    connect: () => {},
                    start: () => {},
                    stop: () => {},
                    frequency: { value: 0 }
                }),
                createGain: () => ({
                    connect: () => {},
                    gain: {
                        setValueAtTime: () => {},
                        exponentialRampToValueAtTime: () => {}
                    }
                }),
                currentTime: 0,
                destination: {}
            };
        };
    }
});

setTimeout(() => {
    const board = dom.window.document.getElementById('board');
    if (board) {
        logData += "Board children count: " + board.children.length + "\n";
        for (let i = 0; i < board.children.length; i++) {
            const child = board.children[i];
            logData += `  Child ${i}: ${child.tagName} class="${child.className}" text="${child.textContent.substring(0, 50)}"\n`;
        }
    }
    
    fs.writeFileSync('jsdom_verify.log', logData);
    process.exit(0);
}, 4000);
