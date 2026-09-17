/**
 * itsMyPup - Minimalist Popup Controller
 * Manages configuration synchronization, training commands, care tools, and trust status.
 */
document.addEventListener('DOMContentLoaded', () => {
  const audio = new (window.CozyAudioSynthesizer || class {
    meow() {} chirp() {} startPurr() {} stopPurr() {} snack() {} yawn() {} setMuted() {} setVolume() {}
  })();

  // State Defaults
  let state = {
    enabled: true,
    skin: 'orange-tabby',
    scale: 1.0,
    speedMultiplier: 1.0,
    petName: 'Mochi',
    soundMuted: false,
    volume: 0.65,
    likeness: 45,
    friendship: 45,
    focusMode: false,
    disabledDomains: []
  };

  let currentDomain = '';

  // Tool active toggle tracking
  let sleepToyActive = false;
  let butterflyActive = false;
  let laserActive = false;

  // DOM Elements
  const masterToggle = document.getElementById('master-toggle');
  const petNameInput = document.getElementById('pet-name');
  const previewPet = document.getElementById('preview-pet');
  const avatarPedestal = document.getElementById('avatar-pedestal');
  const likenessStatus = document.getElementById('likeness-status');
  const likenessTier = document.getElementById('likeness-tier');
  const likenessFill = document.getElementById('likeness-fill');
  const muteBtn = document.getElementById('mute-btn');

  // Control Buttons
  const btnTreat = document.getElementById('btn-treat');
  const btnLaser = document.getElementById('btn-laser');
  const btnSleepToy = document.getElementById('btn-sleep-toy');
  const btnButterfly = document.getElementById('btn-butterfly');
  const btnFocusMode = document.getElementById('btn-focus-mode');
  const btnResetPet = document.getElementById('btn-reset-pet');
  const btnToggleSite = document.getElementById('btn-toggle-site');

  // Detect Current Active Tab Domain
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].url) {
        try {
          const urlObj = new URL(tabs[0].url);
          if (urlObj.hostname) {
            currentDomain = urlObj.hostname;
          }
        } catch(e) {}
      }
      renderState();
    });
  }

  // Load Saved Settings from chrome.storage
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(null, (data) => {
      if (data) {
        state = { ...state, ...data };
        if (data.likeness !== undefined) state.likeness = data.likeness;
        else if (data.friendship !== undefined) state.likeness = data.friendship;
        renderState();
      }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes.likeness) state.likeness = changes.likeness.newValue;
        if (changes.friendship && changes.likeness === undefined) state.likeness = changes.friendship.newValue;
        renderState();
      }
    });
  } else {
    const saved = localStorage.getItem('cozypets_settings');
    if (saved) {
      try { state = { ...state, ...JSON.parse(saved) }; } catch(e) {}
    }
    renderState();
  }

  function saveSettings(keyValObj) {
    state = { ...state, ...keyValObj };
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(keyValObj);
    } else {
      localStorage.setItem('cozypets_settings', JSON.stringify(state));
    }
    renderState();
  }

  function sendMessageToActiveTab(msg, callback) {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, msg, (res) => {
            if (chrome.runtime.lastError) {
              // Tab might not have content script mounted
            } else if (callback && res) {
              callback(res);
            }
          });
        }
      });
    }
  }

  function renderState() {
    // Master Toggle
    if (masterToggle) masterToggle.checked = state.enabled;

    // Pet Name
    if (petNameInput && document.activeElement !== petNameInput) {
      petNameInput.value = state.petName || 'Mochi';
    }

    // Header Sound Mute Toggle Icon
    if (muteBtn) {
      muteBtn.textContent = state.soundMuted ? '🔇' : '🔊';
      muteBtn.classList.toggle('muted', !!state.soundMuted);
      muteBtn.title = state.soundMuted ? 'Unmute Sound' : 'Mute Sound';
    }
    audio.setMuted(state.soundMuted);
    audio.setVolume(state.volume);

    // Focus Mode Button
    if (btnFocusMode) {
      btnFocusMode.classList.toggle('active', !!state.focusMode);
    }

    // Domain Site Toggle Button
    if (btnToggleSite) {
      const isDomainDisabled = Array.isArray(state.disabledDomains) && state.disabledDomains.includes(currentDomain);
      if (currentDomain) {
        if (isDomainDisabled) {
          btnToggleSite.textContent = `✅ Wake pet on ${currentDomain}`;
          btnToggleSite.classList.add('disabled-site');
        } else {
          btnToggleSite.textContent = `🚫 Sleep pet on ${currentDomain}`;
          btnToggleSite.classList.remove('disabled-site');
        }
      } else {
        btnToggleSite.textContent = '🚫 Sleep pet on this site';
      }
    }

    // Avatar Skin Class
    if (previewPet) {
      previewPet.className = `mini-pet-rig skin-${state.skin} state-idle`;
    }

    // Active Skin Chip
    document.querySelectorAll('.skin-chip').forEach(btn => {
      if (btn.dataset.skin === state.skin) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Friendship & Bond Curve
    const val = Math.max(0, Math.min(100, state.likeness !== undefined ? state.likeness : 45));

    let tier = 'Friendly';
    if (val < 25) tier = 'New Companion';
    else if (val < 45) tier = 'Cautious';
    else if (val < 70) tier = 'Friendly';
    else if (val < 90) tier = 'Devoted';
    else tier = 'Best Friend 💕';

    if (likenessStatus) likenessStatus.textContent = `Bond: ${val}%`;
    if (likenessTier) likenessTier.textContent = tier;
    if (likenessFill) likenessFill.style.width = `${val}%`;
  }

  // ===================== EVENT BINDINGS =====================

  // Master Enable Toggle
  if (masterToggle) {
    masterToggle.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      saveSettings({ enabled });
    });
  }

  // Header Mute Button
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      const soundMuted = !state.soundMuted;
      saveSettings({ soundMuted });
    });
  }

  // Pet Name Input
  if (petNameInput) {
    petNameInput.addEventListener('input', (e) => {
      saveSettings({ petName: e.target.value.trim() || 'Mochi' });
    });
  }

  // Hide & Surprise stealth mode
  const btnHidePet = document.getElementById('btn-hide-pet');
  if (btnHidePet) {
    btnHidePet.addEventListener('click', () => {
      audio.chirp();
      sendMessageToActiveTab({ action: 'stealth_hide' });
    });
  }

  // Care & Interactive Tools
  if (btnTreat) {
    btnTreat.addEventListener('click', () => {
      audio.snack();
      saveSettings({ likeness: Math.min(100, state.likeness + 3) });
      sendMessageToActiveTab({ action: 'feed', treatType: 'fish' });
    });
  }

  if (btnSleepToy) {
    btnSleepToy.addEventListener('click', () => {
      audio.chirp();
      sendMessageToActiveTab({ action: 'sleep_toy' }, (res) => {
        if (res && res.active !== undefined) {
          sleepToyActive = res.active;
          btnSleepToy.classList.toggle('active', sleepToyActive);
        }
      });
    });
  }

  if (btnButterfly) {
    btnButterfly.addEventListener('click', () => {
      audio.chirp();
      sendMessageToActiveTab({ action: 'butterfly' }, (res) => {
        if (res && res.active !== undefined) {
          butterflyActive = res.active;
          btnButterfly.classList.toggle('active', butterflyActive);
        }
      });
    });
  }

  if (btnLaser) {
    btnLaser.addEventListener('click', () => {
      audio.chirp();
      laserActive = !laserActive;
      btnLaser.classList.toggle('active', laserActive);
      sendMessageToActiveTab({ action: 'laser' });
    });
  }

  // Disable / Enable on Current Site
  if (btnToggleSite) {
    btnToggleSite.addEventListener('click', () => {
      if (!currentDomain) return;
      let disabledDomains = Array.isArray(state.disabledDomains) ? [...state.disabledDomains] : [];
      if (disabledDomains.includes(currentDomain)) {
        disabledDomains = disabledDomains.filter(d => d !== currentDomain);
        audio.chirp();
      } else {
        disabledDomains.push(currentDomain);
        audio.playSiteToggle();
      }
      saveSettings({ disabledDomains });
    });
  }

  // Avatar Click Interaction in Popup
  if (avatarPedestal) {
    avatarPedestal.addEventListener('click', () => {
      audio.meow(1.15);
      audio.startPurr(1.8);
      saveSettings({ likeness: Math.min(100, state.likeness + 1) });
    });
  }
});
