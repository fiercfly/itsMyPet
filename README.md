# 🐾 Cozy Browser Pets (Manifest V3 Chrome Extension)

An adorable, autonomous virtual cat companion that roams across your browser tabs, reacts to clicks and petting, plays realistic gravity physics with drag-and-drop, takes cozy naps, and purrs!

---

## ✨ Key Features

1. **Autonomous AI State Machine**:
   - Naturally cycles between **idle** (breathing, blinking, ear twitches), **walk** (4-paw gait & bobbing), **run** (speed zoomies), **jump** (squash & stretch), **lick** (loafing paw wash with animated tongue), and **sleep** (curled loaf with floating Zzz particles).
   - Smart edge detection: smoothly turns around before wandering off screen boundaries.
   - Dynamic direction flipping (`scaleX(1)` vs `scaleX(-1)`).

2. **Real-Time Physics & Interactivity**:
   - **Gravity & Freefall**: Real-time downward acceleration to the viewport floor.
   - **Drag & Drop**: Pick up the cat by the scruff (`cursor: grabbing`) to trigger a mid-air panic wiggle state. On release, inherits mouse throw velocity and drops to the floor with a squash-and-stretch landing bounce.
   - **Click & Petting**: Triggers heart burst explosions (`❤️`, `✨`, `💖`), happy purr rumble, and cute speech bubbles.
   - **Double Click**: Triggers a cheerful hop and greeting chirp.
   - **Laser Pointer**: Casts an interactive red laser dot that your cat actively chases and pounces on!

3. **6 Customizable Coat Skins**:
   - 🐱 **Orange Tabby**: Classic ginger tabby with warm white chest & belly.
   - 🐱 **Calico**: Tri-color patched coat (white, ginger, and chocolate spots).
   - 🐱 **Tuxedo**: Sleek obsidian coat with crisp white bib, mitts, and emerald eyes.
   - 🐱 **Void / Black Cat**: Deep midnight silhouette with golden eyes.
   - 🐱 **Siamese**: Elegant cream body with seal-point chocolate ears/tail and sapphire blue eyes.
   - 🐱 **Silver Tabby**: Soft ash grey coat with charcoal stripes and snow belly.

4. **Zero External Dependencies / Web Audio Synthesis**:
   - 100% self-contained procedural vector rig and Web Audio API synthesized cat meows, purrs, chirps, yawns, and snack munches without any external MP3/image asset requirements.

5. **Aesthetic Popup Control Panel**:
   - Live interactive mini cat avatar that purrs when tapped.
   - Master On/Off toggle.
   - Coat skin selector with visual palette swatches.
   - Scale adjuster (1x, 1.5x, 2x) & Roaming Speed (Cozy, Active, Zoomies).
   - Quick Care Actions: 🐟 Fish, 🍖 Treat, ❤️ Love, 🔴 Laser, 💤 Nap, ☀️ Wake.
   - Friendship progression meter.

---

## 🚀 Quick Setup & Installation Guide

### Option 1: Load as Chrome Extension (Manifest V3)
1. Open Google Chrome and go to `chrome://extensions`.
2. Toggle on **Developer mode** in the top right corner.
3. Click the **Load unpacked** button in the top left.
4. Select this project folder (`/Users/devsatva/Desktop/itsMyPup`).
5. Click the extension puzzle icon in Chrome, pin **Cozy Browser Pets**, and open any website!

### Option 2: Standalone Web Playground
Open [demo.html](file:///Users/devsatva/Desktop/itsMyPup/demo.html) directly in any web browser to test all physics, animations, skins, and audio immediately!

---

## 📁 Project Architecture

```
itsMyPup/
├── manifest.json              # Manifest V3 extension configuration
├── icons/                     # Extension icons (16x16, 48x48, 128x128)
├── content/
│   ├── styles.css             # Isolated Shadow DOM styling, skins, animations & particles
│   ├── audio-synthesizer.js   # Procedural Web Audio API sound generator
│   ├── pet-engine.js          # Physics, AI state machine & interaction engine
│   └── content.js             # Content script injector
├── popup/
│   ├── popup.html             # Cozy glassmorphism popup UI
│   ├── popup.css              # Popup styling & preview rig
│   └── popup.js              # Storage sync, preview controller & triggers
├── demo.html                  # Standalone interactive playground
└── generate-icons.js          # Standalone icon generator
```
