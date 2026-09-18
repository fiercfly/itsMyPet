# Cozy Pets — Desktop & Browser Companion

An open-source browser extension (Manifest V3) that adds an interactive virtual pet companion to your web browser. Features realistic physics, interactive toys, cozy focus mode, and zero external dependencies.

---

## Features

- **Autonomous Behavior**: Wanders, sits, stretches, grooms, and naps on browser tabs.
- **Interactive Toys & Snacks**: Drop fish treats, play with teddy plushies, or chase a fluttering butterfly.
- **Laser Pointer Chase**: Toggle a red laser pointer for your pet to sprint and pounce on.
- **Physics Engine**: Drag and drop with scruff physics, parabolic toss momentum, and smooth landing squash/stretch.
- **Stealth & Focus Mode**: Send pet into focus mode during work sessions or enable stealth peeking.
- **100% Offline & Private**: Zero data collection, runs 100% locally with near 0% background tab CPU usage.

---

## Installation Guide (Load Unpacked)

Cozy Pets works on all Chromium browsers (**Google Chrome**, **Microsoft Edge**, **Brave**, **Opera**, **Vivaldi**).

### 1. Download the Extension
Clone or download this repository to your computer:
```bash
git clone https://github.com/fiercfly/itsMyPet.git
```

### 2. Load into Your Browser

#### Google Chrome / Brave / Opera / Vivaldi
1. Open your browser and navigate to `chrome://extensions`.
2. Enable **Developer mode** (toggle switch in the top-right corner).
3. Click **Load unpacked** (top-left button).
4. Select the downloaded `itsMyPet` folder.

#### Microsoft Edge
1. Open Edge and navigate to `edge://extensions`.
2. Enable **Developer mode** (toggle switch in the left sidebar).
3. Click **Load unpacked** and select the downloaded `itsMyPet` folder.

---

## Directory Structure

```
itsMyPet/
├── manifest.json              # Manifest V3 extension configuration
├── README.md                  # Documentation & setup guide
├── PRIVACY_POLICY.md          # Privacy policy
├── content/                   # Injected content scripts
│   ├── content.js             # Shadow DOM host mount script
│   ├── pet-engine.js          # Physics & AI state machine engine
│   ├── audio-synthesizer.js   # Web Audio sound controller
│   └── styles.css             # Isolated Shadow DOM styling & animations
├── popup/                     # Extension popup UI
│   ├── popup.html             # Popup interface
│   ├── popup.js               # Settings & care controller
│   └── popup.css              # Popup styling
├── icons/                     # Extension icons (16px, 48px, 128px)
└── sounds/                    # Sound effect audio samples
```

---

## Privacy & Security

- **Zero Remote Code**: All scripts, styles, and audio samples are strictly local.
- **Zero Data Collection**: No user tracking, analytics, or external server communication.
- **Isolated Styling**: Renders inside an isolated Shadow DOM container to prevent CSS leakage onto host web pages.

---

## License

Distributed under the MIT License.
