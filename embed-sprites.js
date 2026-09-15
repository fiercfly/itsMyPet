const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
const files = ['idle.png', 'drag.png', 'sleep.png', 'cry.png', 'tickle.png'];

const sprites = {};
files.forEach(f => {
  const buf = fs.readFileSync(path.join(assetsDir, f));
  sprites[f.replace('.png', '')] = `data:image/png;base64,${buf.toString('base64')}`;
});

const content = `/**
 * Preloaded Base64 Sprites for Instant, Zero-Latency Rendering
 */
window.PawPalSprites = ${JSON.stringify(sprites, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'content', 'sprites-data.js'), content);
console.log('Generated content/sprites-data.js with embedded high-res puppy sprites!');
