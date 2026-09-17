# 🐾 Cozy Pets — Virtual Cat & Desktop Companion (Manifest V3 Chrome Extension)

An adorable, autonomous virtual cat companion that roams across your browser tabs, reacts to gentle petting, chases laser dots, naps in focus mode, and reminds you to stay hydrated!

---

## ✨ Key Features

1. **Autonomous AI & Life-Like Behavior**:
   - Naturally cycles between **idle** (breathing, blinking, autonomous ear twitches), **walk** (4-paw gait & bobbing), **run** (speed zoomies), **jump** (squash & stretch), **sit / lick** (loafing paw wash with animated tongue), and **sleep** (curled loaf with floating Zzz particles).
   - **Autonomous Ear Twitches**: Left, right, perk, and wiggle flicks occurring dynamically every few seconds.
   - **Smart Edge Detection**: Smoothly turns around before wandering off screen boundaries.
   - Dynamic direction flipping (`scaleX(1)` vs `scaleX(-1)`).

2. **Full Single Seamless Curved Vector Tail**:
   - Continuous vector curve with organic sinusoidal sway (`tailOrganicSway`) and smooth kinematic flexing across all actions. No segmented joints or sugarcane look.

3. **Cute Kawaii Expressions & Gentle Interactions**:
   - Pointed cat ears with inner pink cavities and soft fur tufts.
   - Glistening anime double-highlight eyes, crescent smile eyes (`(˶ᵔ ᵕ ᵔ˶)`), tiny pink button nose, and blushing chibi cheeks.
   - Throttled, delicate heart/sparkle particles and comforting kaomoji purr dialogues (`(˶ᵔ ᵕ ᵔ˶) purrrr...`, `nyaa~ 💕`, `*soft biscuits* 🐾`).

4. **Real-Time Physics & Interactivity**:
   - **Gravity & Freefall**: Real-time downward acceleration to the viewport floor.
   - **Drag & Drop**: Pick up the cat by the scruff (`cursor: grabbing`) to trigger a mid-air panic wiggle. On release, inherits mouse throw velocity and drops with a squash-and-stretch landing bounce.
   - **Hover Zones**: Specific petting reactions for chin/cheeks, ears/forehead, belly tickles, tail base scratch, and paw kneading.
   - **Laser Pointer**: Casts an interactive red laser dot that your cat actively chases and pounces on!

5. **6 Beautiful Coat Skins**:
   - 🐱 **Orange Tabby**: Classic ginger tabby with warm white chest & belly.
   - 🐱 **Calico**: Tri-color patched coat (white, ginger, and chocolate spots).
   - 🐱 **Tuxedo**: Sleek obsidian coat with crisp white bib, mitts, and emerald eyes.
   - 🐱 **Void / Black Cat**: Deep midnight silhouette with golden eyes.
   - 🐱 **Siamese**: Elegant cream body with seal-point chocolate ears/tail and sapphire blue eyes.
   - 🐱 **Silver Tabby**: Soft ash grey coat with charcoal stripes and snow belly.

6. **Zero External Dependencies / Web Audio Synthesis**:
   - 100% self-contained procedural vector rig and Web Audio API synthesized cat meows, purrs, chirps, yawns, and snack munches. No external images, fonts, or sound files required.

7. **Aesthetic Popup Control Panel**:
   - Live interactive mini cat avatar that purrs when tapped.
   - Master On/Off toggle.
   - Coat skin selector with visual palette swatches.
   - Scale adjuster (1x, 1.5x, 2x) & Roaming Speed (Cozy, Active, Zoomies).
   - Quick Care Actions: 🐟 Fish, 🍖 Treat, ❤️ Love, 🔴 Laser, 💤 Nap.
   - Friendship progression meter.

---

## 🚀 How to Load & Test in Google Chrome

1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** via the toggle switch in the top right corner.
3. Click the **Load unpacked** button in the top left.
4. Select this folder (`itsMyPup`).
5. Pin **Cozy Browser Pets** in your Chrome toolbar and visit any website!

---

## 📦 How to Package for Chrome Web Store (Public Release)

To publish on the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole):

1. Create a zip archive of the extension:
   ```bash
   zip -r cozy-browser-pets.zip manifest.json icons/ content/ popup/
   ```
2. Go to the **Chrome Web Store Developer Dashboard**.
3. Click **Add new item** and upload `cozy-browser-pets.zip`.
4. Fill in the store listing details, screenshots, and submit for review.

---

## 📁 Clean Project Structure

```
itsMyPup/
├── manifest.json              # Manifest V3 extension configuration
├── icons/                     # Extension icons (16x16, 48x48, 128x128)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── content/                   # Content scripts injected into web pages
│   ├── styles.css             # Shadow DOM styling, skins, animations & particles
│   ├── audio-synthesizer.js   # Procedural Web Audio API sound generator
│   ├── pet-engine.js          # Physics, AI state machine & interaction engine
│   └── content.js             # Content script injector
├── popup/                     # Extension browser action popup
│   ├── popup.html             # Glassmorphism popup UI
│   ├── popup.css              # Popup styling & preview rig
│   └── popup.js               # Storage sync & care actions controller
├── demo.html                  # Standalone interactive playground
├── package.json               # Project metadata
├── README.md                  # Documentation
└── PRIVACY_POLICY.md          # Official Privacy Policy
```

---

## 🔒 Privacy Policy

Cozy Pets operates 100% locally within your browser. 
- **Zero Data Collection**: We do not collect, store, transmit, or share any personal information or browsing history.
- **Local Storage Only**: Extension settings (pet skin, volume, bond points) are stored locally on your device via `chrome.storage.local`.
- **Zero Third-Party Sharing**: No data is sent to external servers or third parties.

