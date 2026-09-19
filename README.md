# Cozy Pets — Desktop & Browser Companion

An open-source browser extension (Manifest V3) that adds an interactive virtual pet companion to your web browser. Features realistic physics, interactive toys, cozy focus mode, and zero external dependencies.

---

## ⚡ Easy 2-Step Setup (For Non-Tech Users)

Works on **Google Chrome**, **Microsoft Edge**, **Brave**, **Opera**, and **Vivaldi**.

### Step 1: Download & Unzip
1. Download **[`CozyPets.zip`](CozyPets.zip)** from this repository (or click [Download CozyPets.zip](https://github.com/fiercfly/itsMyPet/raw/main/CozyPets.zip)).
2. Double-click the downloaded `CozyPets.zip` file to unzip/extract it on your computer.

### Step 2: Add to Your Browser

#### For Google Chrome / Brave / Opera / Vivaldi
1. Type `chrome://extensions` in your address bar and press Enter.
2. Turn on **Developer mode** (toggle switch in the top-right corner).
3. Click **Load unpacked** (top-left button).
4. Select the unzipped `CozyPets` folder.

#### For Microsoft Edge
1. Type `edge://extensions` in your address bar and press Enter.
2. Turn on **Developer mode** (toggle switch in the bottom-left sidebar).
3. Click **Load unpacked** (top-left button) and select the unzipped `CozyPets` folder.

Your companion is ready! Click any website tab and enjoy your cozy browser pet!

---

## Features

- **Autonomous Behavior**: Wanders, sits, stretches, grooms, and naps on browser tabs.
- **Interactive Toys & Snacks**: Drop fish treats, play with teddy plushies, or chase a fluttering butterfly.
- **Laser Pointer Chase**: Toggle a red laser pointer for your pet to sprint and pounce on.
- **Physics Engine**: Drag and drop with scruff physics, parabolic toss momentum, and smooth landing squash/stretch.
- **Stealth & Focus Mode**: Send pet into focus mode during work sessions or enable stealth peeking.
- **100% Offline & Private**: Zero data collection, runs 100% locally with near 0% background tab CPU usage.

---

## Directory Structure

```
itsMyPet/
├── CozyPets.zip               # Ready-to-use zip file for browser loading
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
