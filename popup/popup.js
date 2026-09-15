/**
 * Cozy Browser Pets - Popup Controller
 * Manages configuration synchronization, live preview avatar, care triggers, and audio.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Audio Synthesizer for popup feedback
  const audio = new (window.CozyAudioSynthesizer || class {
    meow() {} chirp() {} startPurr() {} stopPurr() {} snack() {} yawn() {} setMuted() {} setVolume() {}
  })();

  // State Defaults
  let state = {
    enabled: true,
    skin: 'orange-tabby',
    scale: 1.0,
    speedMultiplier: 1.15,
    petName: 'Mochi',
    soundMuted: false,
    volume: 0.65,
    friendship: 50
  };

  // DOM Elements
  const masterToggle = document.getElementById('master-toggle');
  const petNameInput = document.getElementById('pet-name');
  const statusPill = document.getElementById('pet-status-pill');
  const previewPet = document.getElementById('preview-pet');
  const avatarPedestal = document.getElementById('avatar-pedestal');
  const friendshipLevel = document.getElementById('friendship-level');
  const friendshipPercent = document.getElementById('friendship-percent');
  const friendshipFill = document.getElementById('friendship-fill');
  const muteBtn = document.getElementById('mute-btn');
  const volumeSlider = document.getElementById('volume-slider');

  // Load Saved Settings from chrome.storage
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(null, (data) => {
      if (data) {
        state = { ...state, ...data };
        renderState();
      }
    });
  } else {
    // Fallback localStorage for standalone demo
    const saved = localStorage.getItem('cozy_pet_popup_settings');
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
      localStorage.setItem('cozy_pet_popup_settings', JSON.stringify(state));
    }
    renderState();
  }

  function sendMessageToActiveTab(msg) {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, msg, () => {
            if (chrome.runtime.lastError) {
              // Target tab might not have content script (e.g. chrome:// extensions)
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

    // Avatar Skin Class
    if (previewPet) {
      previewPet.className = `mini-pet-rig skin-${state.skin} state-idle`;
    }

    // Active Skin Card
    document.querySelectorAll('.skin-card').forEach(btn => {
      if (btn.dataset.skin === state.skin) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Scale Buttons
    document.querySelectorAll('#scale-control .seg-btn').forEach(btn => {
      const val = parseFloat(btn.dataset.val);
      if (Math.abs(val - state.scale) < 0.15) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Speed Buttons
    document.querySelectorAll('#speed-control .seg-btn').forEach(btn => {
      const val = parseFloat(btn.dataset.val);
      if (Math.abs(val - state.speedMultiplier) < 0.2) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Audio Controls
    audio.setMuted(state.soundMuted);
    audio.setVolume(state.volume);
    if (muteBtn) {
      muteBtn.textContent = state.soundMuted ? '🔇' : '🔊';
    }
    if (volumeSlider) {
      volumeSlider.value = state.volume;
    }

    // Friendship
    const lvl = Math.floor(state.friendship / 25) + 1;
    const titles = ['New Pal', 'Cozy Friend', 'Bestie', 'Soulmate', 'Eternal Bond'];
    const title = titles[Math.min(titles.length - 1, lvl - 1)];
    if (friendshipLevel) friendshipLevel.textContent = `Lv. ${lvl} ${title}`;
    if (friendshipPercent) friendshipPercent.textContent = `${state.friendship}%`;
    if (friendshipFill) friendshipFill.style.width = `${state.friendship}%`;
  }

  // ===================== EVENT BINDINGS =====================

  // Master Enable Toggle
  if (masterToggle) {
    masterToggle.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      saveSettings({ enabled });
      if (statusPill) {
        statusPill.textContent = enabled ? 'Happy & Exploring ✨' : 'Sleeping in bed 💤';
        statusPill.style.color = enabled ? '#059669' : '#64748B';
        statusPill.style.background = enabled ? '#ECFDF5' : '#F1F5F9';
      }
    });
  }

  // Pet Name Input
  if (petNameInput) {
    petNameInput.addEventListener('input', (e) => {
      saveSettings({ petName: e.target.value.trim() || 'Mochi' });
    });
  }

  // Skin Picker Cards
  document.querySelectorAll('.skin-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const skin = btn.dataset.skin;
      saveSettings({ skin });
      audio.chirp();
      if (statusPill) {
        statusPill.textContent = `Changed coat to ${btn.querySelector('.skin-name').textContent}! ✨`;
      }
    });
  });

  // Scale Segment Controls
  document.querySelectorAll('#scale-control .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const scale = parseFloat(btn.dataset.val);
      saveSettings({ scale });
      audio.chirp();
    });
  });

  // Speed Segment Controls
  document.querySelectorAll('#speed-control .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const speedMultiplier = parseFloat(btn.dataset.val);
      saveSettings({ speedMultiplier });
      audio.chirp();
    });
  });

  // Quick Care Actions
  const btnFeedFish = document.getElementById('btn-feed-fish');
  if (btnFeedFish) {
    btnFeedFish.addEventListener('click', () => {
      audio.snack();
      saveSettings({ friendship: Math.min(100, state.friendship + 2) });
      sendMessageToActiveTab({ action: 'feed', treatType: 'fish' });
      if (statusPill) statusPill.textContent = 'Munched a tasty fish! 🐟✨';
    });
  }

  const btnFeedTreat = document.getElementById('btn-feed-treat');
  if (btnFeedTreat) {
    btnFeedTreat.addEventListener('click', () => {
      audio.snack();
      saveSettings({ friendship: Math.min(100, state.friendship + 2) });
      sendMessageToActiveTab({ action: 'feed', treatType: 'treat' });
      if (statusPill) statusPill.textContent = 'Ate a yummy treat! 🍖✨';
    });
  }

  const btnPetLove = document.getElementById('btn-pet-love');
  if (btnPetLove) {
    btnPetLove.addEventListener('click', () => {
      audio.meow(1.1);
      audio.startPurr(2.0);
      saveSettings({ friendship: Math.min(100, state.friendship + 1) });
      sendMessageToActiveTab({ action: 'pet' });
      if (statusPill) statusPill.textContent = 'Purring with happiness! ❤️';
    });
  }

  const btnLaser = document.getElementById('btn-laser-play');
  if (btnLaser) {
    btnLaser.addEventListener('click', () => {
      audio.chirp();
      sendMessageToActiveTab({ action: 'laser' });
      if (statusPill) statusPill.textContent = 'Chasing the red dot! 🔴👀';
    });
  }

  const btnNap = document.getElementById('btn-sleep-nap');
  if (btnNap) {
    btnNap.addEventListener('click', () => {
      audio.yawn();
      sendMessageToActiveTab({ action: 'nap' });
      if (statusPill) statusPill.textContent = 'Curled up for a nap... 💤';
    });
  }

  // Audio Controls
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      const soundMuted = !state.soundMuted;
      saveSettings({ soundMuted });
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const volume = parseFloat(e.target.value);
      saveSettings({ volume });
    });
  }

  // Avatar Click Interaction in Popup
  if (avatarPedestal) {
    avatarPedestal.addEventListener('click', () => {
      audio.meow(1.15);
      audio.startPurr(1.8);
      saveSettings({ friendship: Math.min(100, state.friendship + 1) });
      if (statusPill) statusPill.textContent = 'Mew! 💕 (Loves your headpats)';
    });
  }
});
