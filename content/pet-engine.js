/**
 * Cozy Browser Pets - Core Pet Engine & Physics Simulator
 * High-performance autonomous AI state machine, gravity physics, drag & drop, and particle systems.
 */
(function(root) {
  class CozyPetEngine {
    constructor(shadowRoot, options = {}) {
      this.shadow = shadowRoot;
      this.options = options;

      // Audio Synthesizer
      this.audio = new (root.CozyAudioSynthesizer || function() {
        this.meow = () => {};
        this.chirp = () => {};
        this.startPurr = () => {};
        this.stopPurr = () => {};
        this.yawn = () => {};
        this.snack = () => {};
        this.landing = () => {};
        this.panic = () => {};
        this.setMuted = () => {};
        this.setVolume = () => {};
      })();

      // Extension Settings & Likeness (Trust)
      this.enabled = true;
      this.skin = 'orange-tabby';
      this.scale = 1.0;
      this.speedMultiplier = 1.0;
      this.soundMuted = false;
      this.volume = 0.65;
      this.likeness = 75; // 0 - 100% Trust / Likeness
      this.friendship = 75; // Synced alias
      this.focusMode = false;
      this.hydrationReminder = false;
      this.hydrationTimer = 0;
      this.isPeeking = false;
      this.lastUserActivityTime = Date.now();
      this.isInactiveSleeping = false;

      // Command & Reward Training System
      this.activeCommand = null; // 'sit' | 'stand'
      this.pendingCommandReward = false;
      this.commandRewardTimer = 0;
      this.neglectTimer = 0;

      // Sleep Toy State (Plush Companion / Pillow)
      this.sleepToyActive = false;
      this.sleepToyX = 0;
      this.sleepToyY = 0;
      this.sleepToyEl = null;
      this.isDraggingSleepToy = false;

      // Butterfly Chase State
      this.butterflyActive = false;
      this.butterflyX = 0;
      this.butterflyY = 0;
      this.butterflyVx = 1.5;
      this.butterflyVy = 0.8;
      this.butterflyTime = 0;
      this.butterflyEl = null;

      // Fish Treat Attraction State
      this.fishTargetActive = false;
      this.fishTargetX = 0;
      this.fishTargetY = 0;
      this.fishTargetEl = null;

      // Dimensions (base size in CSS)
      this.baseWidth = 140;
      this.baseHeight = 160;

      // Physics State
      this.x = Math.max(40, Math.min(window.innerWidth - 180, window.innerWidth - 220));
      this.y = window.innerHeight - this.baseHeight - 10;
      this.vx = 0;
      this.vy = 0;
      this.gravity = 0.95;
      this.friction = 0.92;
      this.maxFallSpeed = 22;
      this.bounceDamping = 0.32;
      this.direction = -1; // -1 = facing left, 1 = facing right
      this.isGrounded = true;

      // Drag & Drop State
      this.isDragging = false;
      this.dragOffsetX = 0;
      this.dragOffsetY = 0;
      this.lastPointerX = 0;
      this.lastPointerY = 0;
      this.dragVelocityX = 0;
      this.dragVelocityY = 0;
      this.lastCursorX = 0;
      this.lastCursorY = 0;

      // Laser Chase State
      this.laserActive = false;
      this.laserX = 0;
      this.laserY = 0;
      this.laserEl = null;

      // AI State Machine
      // 'idle' | 'walk' | 'run' | 'jump' | 'lick' | 'sleep' | 'dragged' | 'landing' | 'purr' | 'stalk'
      this.state = 'idle';
      this.stateTimer = 0;
      this.stateDuration = this.getRandomTime(2.5, 4.5);
      this.walkTargetX = this.x;
      this.zzzTimer = 0;
      this.speechTimer = 0;

      // Autonomous Ear Swaying & Random Twitch System
      this.earTwitchTimer = 0;
      this.nextEarTwitchTime = this.getRandomTime(2.0, 4.5);

      // Hide & Seek Stealth Edge Peeking State
      this.isStealthHidden = false;
      this.isStealthPeeking = false;
      this.stealthTimer = null;
      this.stealthRetractTimer = null;
      this.stealthPeekCount = 0;
      this.stealthMaxPeeks = 3;
      this.lastEdgePeekType = '';

      // DOM References
      this.actorEl = null;
      this.shadowEl = null;
      this.speechEl = null;
      this.commandBadgeEl = null;
      this.distrustBadgeEl = null;

      this.init();
    }

    init() {
      this.buildDOM();
      this.bindEvents();
      this.loadSettings();
      this.startLoop();
    }

    buildDOM() {
      // Create Actor Container
      this.actorEl = document.createElement('div');
      this.actorEl.className = `cozy-pet-actor skin-${this.skin} state-${this.state}`;
      this.actorEl.id = 'cozy-cat-actor';
      this.actorEl.setAttribute('role', 'img');
      this.actorEl.setAttribute('aria-label', 'Cozy Browser Cat Pet');

      // Build Shadow
      this.shadowEl = document.createElement('div');
      this.shadowEl.className = 'cozy-pet-shadow';
      this.actorEl.appendChild(this.shadowEl);

      // Build Full Rig
      const rig = document.createElement('div');
      rig.className = 'cat-rig';
      rig.innerHTML = `
        <!-- Full Single Seamless Curved Cat Tail -->
        <div class="tail-anchor">
          <div class="single-cat-tail">
            <svg class="tail-svg" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path class="tail-path-bg" d="M 44 64 C 22 52, 8 32, 12 18 C 15 7, 28 6, 32 12" stroke-linecap="round" stroke-linejoin="round" />
              <path class="tail-path-main" d="M 44 64 C 22 52, 8 32, 12 18 C 15 7, 28 6, 32 12" stroke-linecap="round" stroke-linejoin="round" />
              <path class="tail-path-tip" d="M 15 14 C 18 8, 27 7, 32 12" stroke-linecap="round" stroke-linejoin="round" />
              <path class="tail-path-stripe s1" d="M 23 47 C 20 44, 18 42, 16 39" stroke-linecap="round" />
              <path class="tail-path-stripe s2" d="M 13 29 C 12 26, 12 24, 13 21" stroke-linecap="round" />
            </svg>
          </div>
        </div>

        <!-- Hind Legs -->
        <div class="hind-legs">
          <div class="hind-leg left">
            <div class="leg-stripe s1"></div>
            <div class="leg-stripe s2"></div>
          </div>
          <div class="hind-leg right">
            <div class="leg-stripe s1"></div>
            <div class="leg-stripe s2"></div>
          </div>
        </div>

        <!-- Torso & Belly -->
        <div class="torso">
          <div class="torso-stripes">
            <div class="torso-stripe l1"></div>
            <div class="torso-stripe l2"></div>
            <div class="torso-stripe l3"></div>
            <div class="torso-stripe r1"></div>
            <div class="torso-stripe r2"></div>
            <div class="torso-stripe r3"></div>
          </div>
          <div class="torso-belly"></div>
        </div>

        <!-- Cuddled Held Teddy Plushie (Appears in cat's arms when sleeping with teddy) -->
        <div class="held-teddy-container" title="Teddy Bear in Kitty's Arms! Drag to move">
          <svg class="held-teddy-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Bear Ears -->
            <circle cx="15" cy="16" r="9" fill="#D97706" stroke="#78350F" stroke-width="2.2" />
            <circle cx="15" cy="16" r="4.8" fill="#FDE68A" />
            <circle cx="49" cy="16" r="9" fill="#D97706" stroke="#78350F" stroke-width="2.2" />
            <circle cx="49" cy="16" r="4.8" fill="#FDE68A" />
            <!-- Bear Lower Feet -->
            <ellipse cx="18" cy="52" rx="7" ry="5.5" fill="#D97706" stroke="#78350F" stroke-width="2" />
            <circle cx="18" cy="52" r="2.8" fill="#FDE68A" />
            <ellipse cx="46" cy="52" rx="7" ry="5.5" fill="#D97706" stroke="#78350F" stroke-width="2" />
            <circle cx="46" cy="52" r="2.8" fill="#FDE68A" />
            <!-- Bear Body -->
            <ellipse cx="32" cy="38" rx="19" ry="17" fill="#F59E0B" stroke="#78350F" stroke-width="2.2" />
            <ellipse cx="32" cy="39" rx="11" ry="10" fill="#FEF3C7" />
            <path d="M 32 32 L 32 45" stroke="#D97706" stroke-width="1.5" stroke-dasharray="2 2" />
            <!-- Bear Head -->
            <ellipse cx="32" cy="24" rx="18" ry="15" fill="#F59E0B" stroke="#78350F" stroke-width="2.2" />
            <ellipse cx="32" cy="27" rx="8.5" ry="6.5" fill="#FEF3C7" stroke="#92400E" stroke-width="1.5" />
            <ellipse cx="32" cy="24" rx="3.5" ry="2.2" fill="#78350F" />
            <path d="M 32 26.2 L 32 28.5 M 29 28.5 Q 32 31.5 35 28.5" stroke="#78350F" stroke-width="1.6" stroke-linecap="round" fill="none" />
            <path d="M 21 21 Q 25 24 27 21" stroke="#78350F" stroke-width="2" stroke-linecap="round" fill="none" />
            <path d="M 37 21 Q 39 24 43 21" stroke="#78350F" stroke-width="2" stroke-linecap="round" fill="none" />
            <ellipse cx="20" cy="26" rx="3" ry="2" fill="#FDA4AF" opacity="0.8" />
            <ellipse cx="44" cy="26" rx="3" ry="2" fill="#FDA4AF" opacity="0.8" />
            <!-- Bowtie -->
            <path d="M 27 31 L 32 33 L 27 35 Z" fill="#FB7185" stroke="#9F1239" stroke-width="1" />
            <path d="M 37 31 L 32 33 L 37 35 Z" fill="#FB7185" stroke="#9F1239" stroke-width="1" />
            <circle cx="32" cy="33" r="2" fill="#E11D48" />
          </svg>
        </div>

        <!-- Front Paws -->
        <div class="front-paws">
          <div class="front-paw left">
            <div class="paw-stripe s1"></div>
            <div class="paw-stripe s2"></div>
          </div>
          <div class="front-paw right">
            <div class="paw-stripe s1"></div>
            <div class="paw-stripe s2"></div>
          </div>
        </div>

        <!-- Cute Ribbon Collar, Bow & Golden Bell -->
        <div class="cat-collar">
          <div class="collar-strap"></div>
          <div class="collar-bow">
            <div class="bow-wing left"></div>
            <div class="bow-knot"></div>
            <div class="bow-wing right"></div>
            <div class="golden-bell">
              <div class="bell-shine"></div>
              <div class="bell-slit"></div>
            </div>
          </div>
        </div>

        <!-- Pointy Cat Ears, Contoured Cheeks, Face, Eyes, Whiskers -->
        <div class="cat-head">
          <div class="head-bow" id="head-bow" title="Cute Ribbon Bow">
            <svg class="head-bow-svg" viewBox="0 0 36 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Left Loop -->
              <path d="M18 13 C12 6, 2 6, 4 14 C6 20, 14 17, 18 13 Z" fill="#FB7185" stroke="#BE123C" stroke-width="1.6" stroke-linejoin="round" />
              <path d="M16 13 C12 9, 6 9, 7 13" stroke="#F43F5E" stroke-width="1.2" stroke-linecap="round" />
              <!-- Right Loop -->
              <path d="M18 13 C24 6, 34 6, 32 14 C30 20, 22 17, 18 13 Z" fill="#FB7185" stroke="#BE123C" stroke-width="1.6" stroke-linejoin="round" />
              <path d="M20 13 C24 9, 30 9, 29 13" stroke="#F43F5E" stroke-width="1.2" stroke-linecap="round" />
              <!-- Hanging Ribbon Tails -->
              <path d="M15 14 L11 24 L16 22 L17 15" fill="#F43F5E" stroke="#BE123C" stroke-width="1.2" stroke-linejoin="round" />
              <path d="M21 14 L25 24 L20 22 L19 15" fill="#F43F5E" stroke="#BE123C" stroke-width="1.2" stroke-linejoin="round" />
              <!-- Center Knot with Shine -->
              <ellipse cx="18" cy="13" rx="4.2" ry="4.5" fill="#E11D48" stroke="#9F1239" stroke-width="1.6" />
              <circle cx="16.8" cy="11.5" r="1.2" fill="#FFFFFF" opacity="0.8" />
            </svg>
          </div>
          <div class="ear left">
            <div class="ear-inner"></div>
            <div class="ear-fluff"></div>
          </div>
          <div class="ear right">
            <div class="ear-inner"></div>
            <div class="ear-fluff"></div>
          </div>

          <div class="head-contour">
            <div class="head-base">
              <div class="head-stripes">
                <div class="head-stripe l"></div>
                <div class="head-stripe c"></div>
                <div class="head-stripe r"></div>
              </div>
            </div>
            <div class="muzzle-cheeks">
              <div class="cheek-puff l"></div>
              <div class="cheek-puff r"></div>
            </div>
          </div>

          <!-- Whiskers -->
          <div class="whiskers">
            <div class="whisker-side l">
              <div class="whisker-line"></div>
              <div class="whisker-line"></div>
            </div>
            <div class="whisker-side r">
              <div class="whisker-line"></div>
              <div class="whisker-line"></div>
            </div>
          </div>

          <!-- Face Cluster -->
          <div class="face-cluster">
            <!-- Blush -->
            <div class="blush-spots">
              <div class="blush"></div>
              <div class="blush"></div>
            </div>

            <!-- Eyes -->
            <div class="eyes-cluster">
              <div class="panda-patch l"></div>
              <div class="panda-patch r"></div>
              <div class="eye l"><div class="eye-pupil"></div></div>
              <div class="eye-closed l"></div>
              <div class="eye r"><div class="eye-pupil"></div></div>
              <div class="eye-closed r"></div>
            </div>

            <!-- Nose -->
            <div class="nose"></div>

            <!-- Mouth -->
            <div class="mouth-normal"></div>
            <div class="mouth-open">
              <div class="mouth-tongue"></div>
            </div>
          </div>
        </div>
      `;

      this.actorEl.appendChild(rig);
      this.shadow.appendChild(this.actorEl);

      // Create Laser Pointer element
      this.laserEl = document.createElement('div');
      this.laserEl.className = 'cozy-laser-dot';
      this.laserEl.style.display = 'none';
      this.shadow.appendChild(this.laserEl);
    }

    getSeasonalHat() {
      return '🎀'; // Adorable head bow
    }

    bindEvents() {
      // Drag & Drop
      this.actorEl.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
      window.addEventListener('pointermove', (e) => this.handlePointerMove(e));
      window.addEventListener('pointerup', (e) => this.handlePointerUp(e));
      window.addEventListener('pointercancel', (e) => this.handlePointerUp(e));

      // Click & Tap Actions
      let clickTimeout = null;
      this.actorEl.addEventListener('click', (e) => {
        if (this.isDragging) return;
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
          this.handleDoubleClick(e);
        } else {
          clickTimeout = setTimeout(() => {
            clickTimeout = null;
            this.handleSingleClick(e);
          }, 240);
        }
      });

      // Multi-zone Hover Petting & Tickling
      this.actorEl.addEventListener('pointerenter', (e) => this.handlePetPointerEnter(e));
      this.actorEl.addEventListener('pointermove', (e) => this.handlePetPointerMove(e));
      this.actorEl.addEventListener('pointerleave', (e) => this.handlePetPointerLeave(e));

      // Window Activity, Typing & Scroll Reactions
      let keyCount = 0;
      let keyTimer = null;
      let lastScrollTime = 0;

      const recordActivity = (e) => {
        const now = Date.now();
        if (e && e.type === 'mousemove' && (now - this.lastUserActivityTime < 1000)) {
          return;
        }
        this.lastUserActivityTime = now;
        if (this.isInactiveSleeping) {
          this.isInactiveSleeping = false;
          this.setState('stretch');
          this.audio.yawn();
          this.say('mew~ 🐾', 1800);
          setTimeout(() => {
            if (this.state === 'stretch') this.setState('idle');
          }, 1400);
        }

        // Typing Reaction: Mochi sits quietly and watches you work peacefully! 🐾
        if (e && e.type === 'keydown') {
          if (this.state !== 'sleep' && !this.focusMode && this.state !== 'sit') {
            this.setState('sit');
          }
        }
      };

      window.addEventListener('mousemove', recordActivity, { passive: true });
      window.addEventListener('keydown', recordActivity, { passive: true });
      window.addEventListener('scroll', recordActivity, { passive: true });

      window.addEventListener('resize', () => {
        this.clampToBounds();
      });

      // Storage Sync
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.addListener((changes, area) => {
          if (area === 'local') {
            this.applyStorageChanges(changes);
          }
        });
      }
    }

    loadSettings() {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['enabled', 'skin', 'scale', 'speedMultiplier', 'soundMuted', 'volume', 'likeness', 'friendship', 'focusMode', 'hydrationReminder'], (data) => {
          if (data) {
            if (data.enabled !== undefined) this.setEnabled(data.enabled);
            if (data.skin) this.setSkin(data.skin);
            if (data.scale) this.setScale(data.scale);
            if (data.speedMultiplier) this.setSpeed(data.speedMultiplier);
            if (data.soundMuted !== undefined) this.setMuted(data.soundMuted);
            if (data.volume !== undefined) this.setVolume(data.volume);
            if (data.focusMode !== undefined) this.toggleFocusMode(data.focusMode, true);
            if (data.hydrationReminder !== undefined) this.toggleHydration(data.hydrationReminder, true);
            const lk = data.likeness !== undefined ? data.likeness : (data.friendship !== undefined ? data.friendship : 75);
            this.likeness = Math.max(0, Math.min(100, lk));
            this.friendship = this.likeness;
          }
        });
      }
    }

    applyStorageChanges(changes) {
      if (changes.enabled) this.setEnabled(changes.enabled.newValue);
      if (changes.skin) this.setSkin(changes.skin.newValue);
      if (changes.scale) this.setScale(changes.scale.newValue);
      if (changes.speedMultiplier) this.setSpeed(changes.speedMultiplier.newValue);
      if (changes.soundMuted) this.setMuted(changes.soundMuted.newValue);
      if (changes.volume) this.setVolume(changes.volume.newValue);
      if (changes.focusMode) this.toggleFocusMode(changes.focusMode.newValue);
      if (changes.hydrationReminder) this.toggleHydration(changes.hydrationReminder.newValue);
      if (changes.likeness) {
        this.likeness = Math.max(0, Math.min(100, changes.likeness.newValue));
        this.friendship = this.likeness;
      } else if (changes.friendship) {
        this.likeness = Math.max(0, Math.min(100, changes.friendship.newValue));
        this.friendship = this.likeness;
      }
    }

    setEnabled(val) {
      this.enabled = !!val;
      if (this.actorEl) {
        this.actorEl.style.display = this.enabled ? 'block' : 'none';
      }
    }

    setSkin(skinName) {
      const allowed = ['orange-tabby', 'white-kitty', 'cute-bear', 'cute-panda'];
      if (allowed.includes(skinName)) {
        this.skin = skinName;
        if (this.actorEl) {
          this.actorEl.className = `cozy-pet-actor skin-${this.skin} state-${this.state}`;
        }
      }
    }

    setScale(scaleVal) {
      this.scale = Math.max(0.6, Math.min(2.5, parseFloat(scaleVal) || 1.0));
      this.updateTransform();
    }

    setSpeed(speedVal) {
      this.speedMultiplier = Math.max(0.4, Math.min(3.0, parseFloat(speedVal) || 1.0));
    }

    setMuted(muted) {
      this.soundMuted = !!muted;
      this.audio.setMuted(this.soundMuted);
    }

    setVolume(vol) {
      this.volume = vol;
      this.audio.setVolume(vol);
    }

    resetPosition() {
      this.x = Math.max(20, Math.min(window.innerWidth - 160, Math.floor(window.innerWidth / 2 - 70)));
      this.y = window.innerHeight - this.baseHeight - 10;
      this.vx = 0;
      this.vy = 0;
      this.setState('idle');
      this.say('meow! 🐾', 1800);
      this.updateTransform();
    }

    toggleFocusMode(enabled, silent = false) {
      this.focusMode = !!enabled;
      if (this.focusMode) {
        this.setState('sleep');
        this.vx = 0;
        this.vy = 0;
        if (!silent) {
          this.audio.yawn();
          this.say('mewww... 💤', 2000);
        }
      } else {
        this.wakeUp();
        if (!silent) {
          this.say('meow! ✨', 1800);
        }
      }
    }

    toggleHydration(enabled, silent = false) {
      this.hydrationReminder = !!enabled;
      this.hydrationTimer = 0;
      if (this.hydrationReminder && !silent) {
        this.say('mew~ 🐾', 2000);
        this.audio.chirp();
      }
    }

    isDistrustful() {
      return this.likeness < 25;
    }

    changeLikeness(delta, reason = '') {
      const prev = this.likeness;
      this.likeness = Math.max(0, Math.min(100, this.likeness + delta));
      this.friendship = this.likeness;

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ likeness: this.likeness, friendship: this.friendship });
      }

      // Check for Trust Tier Milestone Level Ups (e.g. crossing 50% or 80%)
      if ((prev < 50 && this.likeness >= 50) || (prev < 80 && this.likeness >= 80)) {
        this.audio.playHappyTrust();
        this.say('meowwww~ 💕', 2000);
      } else if (this.isDistrustful() && prev >= 25) {
        this.showDistrustBadge();
        this.say('meow! 🐾', 1800);
      } else if (!this.isDistrustful() && prev < 25) {
        this.hideDistrustBadge();
        this.audio.playHappyTrust();
        this.say('mewww~ 💕', 2000);
      }
    }

    showReviewAskModal() {
      // Disabled to prevent disruptive card modals popping up on screen
    }

    dropAmbientGift() {
      if (!this.enabled || this.state === 'sleep' || this.isDragging) return;
      const gifts = ['🍃', '🪨', '🐟', '🌸', '🐚'];
      const giftSymbol = gifts[Math.floor(Math.random() * gifts.length)];

      const giftEl = document.createElement('div');
      giftEl.className = 'cozy-ambient-gift';
      giftEl.textContent = giftSymbol;
      giftEl.style.left = `${this.x + 50}px`;
      giftEl.style.top = `${this.y + 55}px`;
      document.body.appendChild(giftEl);

      this.say(`meow! ${giftSymbol} ✨`, 1800);
      this.audio.chirp();

      setTimeout(() => {
        giftEl.style.transition = 'opacity 1s ease';
        giftEl.style.opacity = '0';
        setTimeout(() => giftEl.remove(), 1000);
      }, 12000);
    }

    showDistrustBadge() {
      if (this.distrustBadgeEl) return;
      this.distrustBadgeEl = document.createElement('div');
      this.distrustBadgeEl.className = 'cozy-distrust-alert';
      this.distrustBadgeEl.textContent = '⚠️ Distrustful • Feed treats to tame';
      this.actorEl.appendChild(this.distrustBadgeEl);
    }

    hideDistrustBadge() {
      if (this.distrustBadgeEl) {
        this.distrustBadgeEl.remove();
        this.distrustBadgeEl = null;
      }
    }

    showCommandBadge(txt) {
      this.hideCommandBadge();
      this.commandBadgeEl = document.createElement('div');
      this.commandBadgeEl.className = 'cozy-command-badge';
      this.commandBadgeEl.textContent = txt;
      this.actorEl.appendChild(this.commandBadgeEl);
    }

    hideCommandBadge() {
      if (this.commandBadgeEl) {
        this.commandBadgeEl.remove();
        this.commandBadgeEl = null;
      }
    }

    // ==========================================
    // COMMAND SYSTEM (Sit, Stand & Reward Training)
    // ==========================================

    executeCommand(cmd) {
      if (this.isDistrustful()) {
        this.audio.chirp();
        this.say('mew! 🐾', 1800);
        this.changeLikeness(-2, 'distrust_refusal');
        this.direction = -this.direction;
        return { status: 'refused', reason: 'distrustful' };
      }

      this.activeCommand = cmd;
      this.pendingCommandReward = true;
      this.commandRewardTimer = 8.0;

      if (cmd === 'sit') {
        this.setState('sit');
        this.stateTimer = 0;
        this.stateDuration = 8.0;
        this.say('meow~ 🐾', 1800);
        this.showCommandBadge('Command Obeyed! 🍖 Give treat to reward');
      } else if (cmd === 'stand') {
        this.setState('idle');
        this.stateTimer = 0;
        this.stateDuration = 8.0;
        this.say('mew! ✨', 1800);
        this.showCommandBadge('Command Obeyed! 🍖 Give treat to reward');
      }

      return { status: 'ok', command: cmd };
    }

    // ==========================================
    // INTERACTION & POINTER HANDLERS
    // ==========================================

    handlePointerDown(e) {
      if (!this.enabled || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      // Stop any active eating crunch sound immediately when user interacts
      if (this.audio && this.audio.stopCurrent) {
        this.audio.stopCurrent();
      }

      // If clicked while peeking from an edge in stealth mode, jump out immediately!
      if (this.isStealthPeeking || this.isStealthHidden) {
        this.finishStealthMode(true);
        return;
      }

      // If user clicks on the held teddy bear while kitty is sleeping with it
      if (this.actorEl && this.actorEl.classList.contains('cuddling-teddy') && e.target && e.target.closest && e.target.closest('.held-teddy-container')) {
        if (this.sleepToyEl) {
          this.sleepToyX = e.clientX;
          this.sleepToyY = e.clientY;
          this.sleepToyEl.style.left = `${this.sleepToyX}px`;
          this.sleepToyEl.style.top = `${this.sleepToyY}px`;
          this.sleepToyEl.style.display = 'block';
          this.isDraggingSleepToy = true;
          this.actorEl.classList.remove('cuddling-teddy');
          this.wakeUp();
          this.say('mewww! 🧸', 1600);
          return;
        }
      }

      if (this.isDistrustful()) {
        this.say('meow! 💨', 1600);
        this.direction = e.clientX > (this.x + 70) ? -1 : 1;
        this.setState('run');
        this.vx = this.direction * 5.2 * this.speedMultiplier;
        return;
      }

      // If dragging the pet itself while cuddling, release cuddle pose
      if (this.actorEl && this.actorEl.classList.contains('cuddling-teddy')) {
        this.actorEl.classList.remove('cuddling-teddy');
        if (this.sleepToyEl) this.sleepToyEl.style.display = 'block';
      }

      this.pointerDownX = e.clientX;
      this.pointerDownY = e.clientY;
      this.pointerDownTime = performance.now();
      this.pendingDrag = true;
      this.isDragging = false;
      this.actorEl.setPointerCapture(e.pointerId);

      const rect = this.actorEl.getBoundingClientRect();
      this.dragOffsetX = e.clientX - rect.left;
      this.dragOffsetY = e.clientY - rect.top;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      this.dragVelocityX = 0;
      this.dragVelocityY = 0;
      this.dragInertiaX = 0;
    }

    handlePointerMove(e) {
      this.lastCursorX = e.clientX;
      this.lastCursorY = e.clientY;

      if (this.laserActive) {
        this.laserX = e.clientX;
        this.laserY = e.clientY;
        if (this.laserEl) {
          this.laserEl.style.left = `${this.laserX}px`;
          this.laserEl.style.top = `${this.laserY}px`;
        }
      }

      // Selective Dynamic Eye-Tracking:
      // Only tracks cursor when interacting/petting (close radius < 140px) OR when chasing the butterfly!
      const petCenterX = this.x + 70;
      const petCenterY = this.y + 40;
      const distToCursor = Math.hypot(e.clientX - petCenterX, e.clientY - petCenterY);

      const isInteractingClose = (this.isHovered || distToCursor < 140);
      const isChasingButterfly = (this.butterflyActive && this.butterflyEl);

      const pupils = this.actorEl ? this.actorEl.querySelectorAll('.eye-pupil, .eye') : null;

      if ((isInteractingClose || isChasingButterfly) && !this.isDragging && this.state !== 'sleep') {
        let targetX = e.clientX;
        let targetY = e.clientY;

        if (isChasingButterfly && !isInteractingClose) {
          targetX = this.butterflyX;
          targetY = this.butterflyY;
        }

        const rawDx = (targetX - petCenterX) * 0.055;
        const dx = Math.max(-8, Math.min(8, this.direction < 0 ? -rawDx : rawDx));
        const dy = Math.max(-6, Math.min(6, (targetY - petCenterY) * 0.045));

        if (pupils) {
          pupils.forEach(el => {
            el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
          });
        }
      } else {
        // Relax eyes looking straight forward
        if (pupils) {
          pupils.forEach(el => {
            el.style.transform = 'translate3d(0, 0, 0)';
          });
        }
      }

      if (this.pendingDrag) {
        const dist = Math.hypot(e.clientX - this.pointerDownX, e.clientY - this.pointerDownY);
        const time = performance.now() - this.pointerDownTime;
        // 8px movement threshold OR 150ms hold to trigger scruff drag
        if (dist > 8 || time > 150) {
          this.pendingDrag = false;
          this.isDragging = true;
          this.dragStartY = this.y;
          this.setState('dragged');
          this.audio.chirp();
        } else {
          return;
        }
      }

      if (!this.isDragging) return;
      e.preventDefault();

      const newX = e.clientX - this.dragOffsetX;
      const newY = e.clientY - this.dragOffsetY;

      // Exponential velocity smoothing per drag move frame for buttery smooth throwing
      const moveDx = e.clientX - (this.lastPointerX || e.clientX);
      const moveDy = e.clientY - (this.lastPointerY || e.clientY);
      this.dragInertiaX = (this.dragInertiaX || 0) * 0.5 + moveDx * 0.7;
      this.dragVelocityX = (this.dragVelocityX || 0) * 0.4 + moveDx * 0.6;
      this.dragVelocityY = (this.dragVelocityY || 0) * 0.4 + moveDy * 0.6;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      this.x = newX;
      this.y = newY;
      this.vx = 0;
      this.vy = 0;
      this.isGrounded = false;

      this.clampToBounds(false);
      this.updateTransform();

      // Scruff Drag hold timer
      const dragElapsed = (performance.now() - (this.dragStartTime || this.pointerDownTime)) / 1000;
      if (dragElapsed > 1.2 && !this.playedScruffCry) {
        this.playedScruffCry = true;
        this.audio.playBrosCooking();
        this.say('mewww!! 🐾', 1600);
      }
    }

    handlePointerUp(e) {
      if (this.pendingDrag) {
        this.pendingDrag = false;
        return;
      }

      if (!this.isDragging) return;
      this.isDragging = false;
      this.dragTimer = 0;
      this.dragInertiaX = 0;
      this.playedScruffCry = false;

      // Ensure exact dropped position matches release point with zero offset jump
      if (e && e.clientX !== undefined) {
        this.x = e.clientX - this.dragOffsetX;
        this.y = e.clientY - this.dragOffsetY;
      }
      this.clampToBounds(false);

      // High Drop Detection
      const dropDistance = Math.max(0, this.getFloorY() - this.dragStartY);
      this.isHighDrop = (dropDistance > 140 || this.y < window.innerHeight - 300);

      // Smooth parabolic throw physics calculation:
      const rawVx = Math.abs(this.dragVelocityX) > 1.5 ? this.dragVelocityX * 1.1 : 0;
      this.vx = Math.max(-18, Math.min(18, rawVx));
      this.vy = Math.max(-22, Math.min(16, this.dragVelocityY * 1.1));

      // Save new dropped home location
      this.homeX = Math.max(40, Math.min(window.innerWidth - 180, this.x));
      this.tetherTimer = 60.0;

      const floorY = this.getFloorY();
      if (this.y < floorY - 6) {
        this.isGrounded = false;
        this.setState('jump');
        if (this.isHighDrop) {
          this.audio.playDropScream();
        }
      } else {
        this.y = floorY;
        this.isGrounded = true;
        this.onLand();
      }
      this.updateTransform();
    }

    handleSingleClick(e) {
      if (this.isDragging) return;

      // If clicked while peeking from screen edge in stealth mode
      if (this.isStealthPeeking || this.isStealthHidden) {
        this.finishStealthMode(true);
        return;
      }

      // Check if nose was clicked for special nose boop! 👃✨
      const isNoseClick = e.target && e.target.classList && e.target.classList.contains('nose');
      if (isNoseClick) {
        this.audio.boop();
        this.spawnHeartBurst(e.clientX, e.clientY);
        this.say('mew! ✨', 1600);
        this.changeLikeness(1, 'nose_boop');
        return;
      }

      // First Click / Poke after being idle: Cute Short Mew / Pop Cat + Purr
      this.spawnHeartBurst(e.clientX, e.clientY);
      this.audio.playTouchMew();
      this.audio.startPurr(2.0);
      this.setState('purr');
      this.stateTimer = 0;
      this.stateDuration = 2.4;

      this.changeLikeness(1, 'petting');

      const phrases = [
        'meow~ 💕',
        'mew! ✨',
        'mewww~ 🐾',
        'meowwww~ 💕',
        'mew mew! 🐾',
        'mew~ 🌸'
      ];
      const text = phrases[Math.floor(Math.random() * phrases.length)];
      this.say(text, 1800);
    }

    handleDoubleClick(e) {
      if (this.isDragging) return;
      this.toggleDeskNap();
    }

    toggleDeskNap() {
      this.isDeskLoaf = !this.isDeskLoaf;
      if (this.isDeskLoaf) {
        this.audio.chirp();
        this.setState('sit');
        this.vx = 0;
        this.vy = 0;
        this.say('mewww... 💤', 1800);
      } else {
        this.audio.chirp();
        this.setState('idle');
        this.say('meow! ☀️', 1800);
      }
    }

    findHidingSpots() {
      const spots = [];

      // Search document for visible input boxes, textareas, search fields, or cards
      try {
        const selector = 'input[type="text"], input[type="search"], input:not([type]), textarea, [role="textbox"], .card, header';
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 40 && rect.height > 20 && rect.top >= 0 && rect.bottom <= window.innerHeight && rect.left >= 0 && rect.right <= window.innerWidth) {
            spots.push({
              x: Math.max(10, Math.min(window.innerWidth - 150, Math.round(rect.left + rect.width / 2 - 70))),
              y: Math.max(10, Math.round(rect.top - 110)),
              type: 'textbox',
              name: el.placeholder || el.title || 'text box'
            });
          }
        });
      } catch (e) {
        // Fallback
      }

      // Always include screen corners and edges
      spots.push(
        { x: 30, y: Math.max(10, window.innerHeight - 170), type: 'corner', name: 'bottom-left corner' },
        { x: Math.max(30, window.innerWidth - 170), y: Math.max(10, window.innerHeight - 170), type: 'corner', name: 'bottom-right corner' },
        { x: 30, y: 40, type: 'corner', name: 'top-left corner' },
        { x: Math.max(30, window.innerWidth - 170), y: 40, type: 'corner', name: 'top-right corner' },
        { x: Math.floor(window.innerWidth / 2 - 70), y: 40, type: 'edge', name: 'top edge' }
      );

      return spots;
    }

    triggerStealthHide() {
      if (this.stealthTimer) clearTimeout(this.stealthTimer);
      if (this.stealthRetractTimer) clearTimeout(this.stealthRetractTimer);
      
      this.say('mew! 💨', 1400);
      this.spawnDustPuff(this.x + 50, this.y + 70);

      this.isStealthHidden = true;
      this.isStealthPeeking = false;
      this.stealthPeekCount = 0;
      this.stealthMaxPeeks = 2 + Math.floor(Math.random() * 2); // 2 or 3 random edge peeks before full reveal

      setTimeout(() => {
        if (this.actorEl && this.isStealthHidden && !this.isStealthPeeking) {
          this.actorEl.style.display = 'none';
        }
      }, 450);

      // Schedule first random edge peek in 2.5 - 3.8 seconds
      const firstPeekDelay = (2.5 + Math.random() * 1.3) * 1000;
      this.stealthTimer = setTimeout(() => {
        this.performRandomEdgePeek();
      }, firstPeekDelay);
    }

    performRandomEdgePeek() {
      if (!this.enabled || !this.isStealthHidden) return;
      if (this.actorEl) {
        this.actorEl.classList.remove('edge-bottom', 'edge-top', 'edge-left', 'edge-right', 'edge-bottom-left', 'edge-bottom-right', 'edge-top-left', 'edge-top-right');
      }

      const spots = [
        { type: 'bottom', x: Math.random() * (window.innerWidth - 240) + 60, y: window.innerHeight - 75, dir: 1, cls: 'edge-bottom' },
        { type: 'bottom-left', x: 25, y: window.innerHeight - 85, dir: 1, cls: 'edge-bottom-left' },
        { type: 'bottom-right', x: window.innerWidth - 125, y: window.innerHeight - 85, dir: -1, cls: 'edge-bottom-right' },
        { type: 'left', x: -10, y: Math.random() * (window.innerHeight - 280) + 120, dir: 1, cls: 'edge-left' },
        { type: 'right', x: window.innerWidth - 110, y: Math.random() * (window.innerHeight - 280) + 120, dir: -1, cls: 'edge-right' },
        { type: 'top', x: Math.random() * (window.innerWidth - 240) + 60, y: 15, dir: 1, cls: 'edge-top' },
        { type: 'top-left', x: 25, y: 25, dir: 1, cls: 'edge-top-left' },
        { type: 'top-right', x: window.innerWidth - 125, y: 25, dir: -1, cls: 'edge-top-right' }
      ];

      // Pick a spot distinct from the previous one
      const availableSpots = spots.filter(s => s.type !== this.lastEdgePeekType);
      const chosen = availableSpots[Math.floor(Math.random() * availableSpots.length)];
      this.lastEdgePeekType = chosen.type;

      this.x = chosen.x;
      this.y = chosen.y;
      this.direction = chosen.dir;
      this.vx = 0;
      this.vy = 0;
      this.updateTransform();

      this.isStealthPeeking = true;
      if (this.actorEl) {
        this.actorEl.style.display = 'block';
        this.actorEl.classList.add('state-edge-peek', chosen.cls);
      }
      this.setState('peeking');
      this.audio.playPeekMew();

      const peekPhrases = ['mew? 👀', 'peek! ✨', 'psst! 🐾', 'nyaa~ 👀', 'mew! 🌸'];
      const text = peekPhrases[Math.floor(Math.random() * peekPhrases.length)];
      this.say(text, 1700);

      this.stealthPeekCount++;

      // Retract back into hiding after 2.1s
      this.stealthRetractTimer = setTimeout(() => {
        if (!this.isStealthHidden || !this.isStealthPeeking) return;
        this.isStealthPeeking = false;
        if (this.actorEl) {
          this.actorEl.classList.remove('state-edge-peek', chosen.cls);
          this.actorEl.style.display = 'none';
        }

        if (this.stealthPeekCount < this.stealthMaxPeeks) {
          // Schedule next edge peek in 2.6 - 4.2 seconds
          const nextPeekDelay = (2.6 + Math.random() * 1.6) * 1000;
          this.stealthTimer = setTimeout(() => {
            this.performRandomEdgePeek();
          }, nextPeekDelay);
        } else {
          // Finished peeks -> Final surprise grand entrance!
          const revealDelay = (2.2 + Math.random() * 1.4) * 1000;
          this.stealthTimer = setTimeout(() => {
            this.finishStealthMode(false);
          }, revealDelay);
        }
      }, 2100);
    }

    finishStealthMode(foundEarly = false) {
      if (this.stealthTimer) clearTimeout(this.stealthTimer);
      if (this.stealthRetractTimer) clearTimeout(this.stealthRetractTimer);

      this.isStealthHidden = false;
      this.isStealthPeeking = false;

      if (this.actorEl) {
        this.actorEl.classList.remove('state-edge-peek', 'edge-bottom', 'edge-top', 'edge-left', 'edge-right', 'edge-bottom-left', 'edge-bottom-right', 'edge-top-left', 'edge-top-right');
        this.actorEl.style.display = 'block';
      }

      // Drop into view from top onto floor with physics
      const floorY = this.getFloorY();
      this.x = Math.max(60, Math.min(window.innerWidth - 200, Math.random() * (window.innerWidth - 260) + 60));
      this.y = floorY - 140;
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = -3;
      this.isGrounded = false;
      this.updateTransform();

      this.setState('jump');
      this.audio.playPeekMew();
      this.spawnDustPuff(this.x + 50, floorY + 40);

      this.say('meow~ 💕', 1800);

      if (foundEarly) {
        this.changeLikeness(1, 'found_peeking_pet');
      }
    }

    randomSurpriseSpawn() {
      this.finishStealthMode(false);
    }

    // Multi-zone Hover Petting & Tickling System
    handlePetPointerEnter(e) {
      if (this.isDragging) return;
      if (this.isDistrustful()) {
        this.direction = e.clientX > (this.x + 70) ? -1 : 1;
        this.setState('run');
        this.vx = this.direction * 4.8 * this.speedMultiplier;
        return;
      }

      this.isHovered = true;
      // Mew sound effect immediately when cursor touches the cat!
      this.audio.playTouchMew();

      if (this.state === 'walk' || this.state === 'run') {
        this.setState('idle');
        this.vx *= 0.3;
      }
      this.updatePetHoverZone(e);
    }

    handlePetPointerMove(e) {
      if (this.isDragging) return;
      if (this.isDistrustful()) {
        this.direction = e.clientX > (this.x + 70) ? -1 : 1;
        this.setState('run');
        this.vx = this.direction * 4.8 * this.speedMultiplier;
        return;
      }

      this.isHovered = true;
      if (this.state === 'walk' || this.state === 'run') {
        this.setState('idle');
        this.vx *= 0.3;
      }
      this.updatePetHoverZone(e);
    }

    handlePetPointerLeave(e) {
      this.isHovered = false;
      this.currentPetZone = null;
      this.clearPettingReactions();
    }

    updatePetHoverZone(e) {
      if (this.isDragging || this.isDistrustful() || !this.actorEl) return;

      const rect = this.actorEl.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      // Normalized relative coordinate inside the pet's box [0..1]
      let normX = (e.clientX - rect.left) / rect.width;
      const normY = (e.clientY - rect.top) / rect.height;

      // Account for pet flipping direction
      if (this.direction < 0) {
        normX = 1 - normX;
      }

      let zone = 'chin'; // default sweet spot

      if (normY < 0.34) {
        zone = 'ears';
      } else if (normY < 0.56) {
        zone = (normX > 0.35 && normX < 0.65 && normY > 0.46) ? 'collar' : 'chin';
      } else if (normX < 0.32 && normY >= 0.45) {
        zone = 'tail';
      } else if (normY >= 0.78 || (normX > 0.72 && normY >= 0.55)) {
        zone = 'paws';
      } else {
        zone = 'belly';
      }

      this.triggerPetReaction(zone, e.clientX, e.clientY);
    }

    triggerPetReaction(zone, clientX, clientY) {
      if (this.isDistrustful()) return;
      const rig = this.actorEl ? this.actorEl.querySelector('.cat-rig') : null;
      if (!rig) return;

      const now = performance.now();

      if (this.currentPetZone !== zone) {
        // Debounce zone transitions by 90ms to guarantee zero flickering at borders
        if (this.lastZoneSwitchTime && (now - this.lastZoneSwitchTime < 90)) {
          return;
        }
        this.lastZoneSwitchTime = now;
        this.currentPetZone = zone;

        rig.classList.remove('petting-chin', 'petting-ears', 'tickling-belly', 'tickling-tail', 'petting-paws');

        if (this.actorEl) this.actorEl.classList.add('purr-vibrate');
        this.clearPurrVibrateTimeout = setTimeout(() => {
          if (this.actorEl) this.actorEl.classList.remove('purr-vibrate');
        }, 1500);

        if (zone === 'collar' || zone === 'chin') {
          rig.classList.add('petting-chin');
        } else if (zone === 'ears') {
          rig.classList.add('petting-ears');
        } else if (zone === 'belly') {
          rig.classList.add('tickling-belly');
        } else if (zone === 'tail') {
          rig.classList.add('tickling-tail');
        } else if (zone === 'paws') {
          rig.classList.add('petting-paws');
        }
      }

      const petTime = now;
       switch (zone) {
        case 'collar':
        case 'chin':
          if (petTime - this.lastPetAudioTime > 900) {
            this.audio.petChin();
            this.audio.startPurr(2.2);
            this.lastPetAudioTime = petTime;
          }
          if (petTime - this.lastPetParticleTime > 950) {
            this.spawnPettingSparkle(clientX || (this.x + 70), clientY || (this.y + 40), '💖');
            this.lastPetParticleTime = petTime;
          }
          if (petTime - this.lastPetSpeechTime > 5000 && Math.random() < 0.2) {
            const msgs = ['meow~ 💕', 'mew~ ✨', 'mewww~ 🐾', 'meowwww~ 💕'];
            this.say(msgs[Math.floor(Math.random() * msgs.length)], 1800);
            this.lastPetSpeechTime = petTime;
            this.changeLikeness(1);
          }
          break;

        case 'ears':
          if (petTime - this.lastPetAudioTime > 850) {
            this.audio.petEars();
            this.lastPetAudioTime = petTime;
          }
          if (petTime - this.lastPetParticleTime > 950) {
            this.spawnPettingSparkle(clientX || (this.x + 70), clientY || (this.y + 20), '✨');
            this.lastPetParticleTime = petTime;
          }
          if (petTime - this.lastPetSpeechTime > 5000 && Math.random() < 0.2) {
            const msgs = ['mew~ ✨', 'meow~ 💕', 'mewww~ 🐾'];
            this.say(msgs[Math.floor(Math.random() * msgs.length)], 1800);
            this.lastPetSpeechTime = petTime;
            this.changeLikeness(1);
          }
          break;

        case 'belly':
          if (petTime - this.lastPetAudioTime > 750) {
            this.audio.petBelly();
            this.lastPetAudioTime = petTime;
          }
          if (petTime - this.lastPetParticleTime > 800) {
            this.spawnPettingSparkle(clientX || (this.x + 70), clientY || (this.y + 90), '🌸');
            this.lastPetParticleTime = petTime;
          }
          if (petTime - this.lastPetSpeechTime > 5000 && Math.random() < 0.2) {
            const msgs = ['mew~ 💕', 'meow! 🐾', 'mewww~ ✨'];
            this.say(msgs[Math.floor(Math.random() * msgs.length)], 1800);
            this.lastPetSpeechTime = petTime;
            this.changeLikeness(1);
          }
          break;

        case 'tail':
        case 'paws':
          if (petTime - this.lastPetAudioTime > 850) {
            this.audio.petPaws();
            this.lastPetAudioTime = petTime;
          }
          if (petTime - this.lastPetParticleTime > 900) {
            this.spawnPettingSparkle(clientX || (this.x + 70), clientY || (this.y + 100), '🐾');
            this.lastPetParticleTime = petTime;
          }
          if (petTime - this.lastPetSpeechTime > 5000 && Math.random() < 0.2) {
            const msgs = ['meow~ 💕', 'mew! 🐾', 'meowwww~ ✨'];
            this.say(msgs[Math.floor(Math.random() * msgs.length)], 1800);
            this.lastPetSpeechTime = petTime;
            this.changeLikeness(1);
          }
          break;
      }

      if (this.pettingResetTimeout) clearTimeout(this.pettingResetTimeout);
      this.pettingResetTimeout = setTimeout(() => {
        this.clearPettingReactions();
      }, 700);
    }

    clearPettingReactions() {
      const wasPetting = !!this.currentPetZone;
      if (this.pettingResetTimeout) {
        clearTimeout(this.pettingResetTimeout);
        this.pettingResetTimeout = null;
      }
      this.currentPetZone = null;
      const rig = this.actorEl ? this.actorEl.querySelector('.cat-rig') : null;
      if (rig) {
        rig.classList.remove('petting-chin', 'petting-ears', 'tickling-belly', 'tickling-tail', 'petting-paws');
      }

      // Pet Stoppage (Mouse Leave): 8% chance roll to tilt head and cute mew
      if (wasPetting && Math.random() < 0.08) {
        this.audio.chirp();
        const stoppageMsgs = ['mew? 🐾', 'meow? 💕', 'mewww? ✨'];
        this.say(stoppageMsgs[Math.floor(Math.random() * stoppageMsgs.length)], 1600);
      }
    }

    spawnPettingSparkle(x, y, char = '✨') {
      const particle = document.createElement('div');
      particle.className = 'cozy-particle cozy-heart-particle';
      particle.textContent = char;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 24}px`);
      particle.style.setProperty('--ty', `${-22 - Math.random() * 26}px`);
      particle.style.setProperty('--rot', `${(Math.random() - 0.5) * 25}deg`);
      this.shadow.appendChild(particle);
      setTimeout(() => particle.remove(), 1100);
    }

    // Care Actions - Interactive Fresh Fish Treat Attraction 🐟
    feedTreat(type = 'fish') {
      // Remove any existing active fish target first
      if (this.fishTargetEl) {
        this.fishTargetEl.remove();
        this.fishTargetEl = null;
        this.fishTargetActive = false;
      }

      // Spawn flopping fresh fish target on the floor
      const fishX = Math.max(50, Math.min(window.innerWidth - 60, this.x + (this.direction > 0 ? 160 : -140)));
      const fishY = this.getFloorY() + 85;

      this.fishTargetEl = document.createElement('div');
      this.fishTargetEl.className = 'cozy-fish-target';
      this.fishTargetEl.title = 'Fresh fish treat! Cat is attracted to eat it!';
      this.fishTargetEl.innerHTML = `
        <svg class="fish-svg-body" viewBox="0 0 50 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Tail Fin -->
          <path d="M 38 18 L 48 8 C 45 15, 45 21, 48 28 Z" fill="#38BDF8" stroke="#0284C7" stroke-width="2" />
          <!-- Dorsal Fin -->
          <path d="M 18 8 C 24 4, 30 6, 32 10 Z" fill="#7DD3FC" stroke="#0284C7" stroke-width="1.5" />
          <!-- Main Body -->
          <ellipse cx="22" cy="18" rx="17" ry="11" fill="#38BDF8" stroke="#0284C7" stroke-width="2" />
          <!-- Belly Highlight & Scale Accents -->
          <path d="M 10 18 C 12 24, 28 24, 34 18" stroke="#BAE6FD" stroke-width="2" stroke-linecap="round" fill="none" />
          <path d="M 18 14 C 19 16, 22 16, 23 14" stroke="#0284C7" stroke-width="1.5" stroke-linecap="round" fill="none" />
          <path d="M 24 14 C 25 16, 28 16, 29 14" stroke="#0284C7" stroke-width="1.5" stroke-linecap="round" fill="none" />
          <!-- Cute Eye -->
          <circle cx="12" cy="15" r="3.5" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.5" />
          <circle cx="11" cy="14.5" r="1.8" fill="#0F172A" />
          <circle cx="10" cy="13.5" r="0.7" fill="#FFFFFF" />
          <!-- Mouth -->
          <path d="M 4 18 Q 6 20 4 21" stroke="#0284C7" stroke-width="2" stroke-linecap="round" fill="none" />
        </svg>
      `;

      this.fishTargetX = fishX;
      this.fishTargetY = fishY;
      this.fishTargetEl.style.left = `${this.fishTargetX}px`;
      this.fishTargetEl.style.top = `${this.fishTargetY}px`;
      this.shadow.appendChild(this.fishTargetEl);

      this.fishTargetActive = true;
      this.say('mew! 🐾', 1600);

      // Make fish draggable as well
      let fishDragOffsetX = 0;
      let fishDragOffsetY = 0;
      this.fishTargetEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.isDraggingFish = true;
        this.fishTargetEl.setPointerCapture(e.pointerId);
        fishDragOffsetX = e.clientX - this.fishTargetX;
        fishDragOffsetY = e.clientY - this.fishTargetY;
      });
      this.fishTargetEl.addEventListener('pointermove', (e) => {
        if (!this.isDraggingFish) return;
        this.fishTargetX = Math.max(25, Math.min(window.innerWidth - 35, e.clientX - fishDragOffsetX));
        this.fishTargetY = Math.max(25, Math.min(window.innerHeight - 35, e.clientY - fishDragOffsetY));
        this.fishTargetEl.style.left = `${this.fishTargetX}px`;
        this.fishTargetEl.style.top = `${this.fishTargetY}px`;
      });
      const stopFishDrag = () => { this.isDraggingFish = false; };
      this.fishTargetEl.addEventListener('pointerup', stopFishDrag);
      this.fishTargetEl.addEventListener('pointercancel', stopFishDrag);
    }

    // Cat consumes fish target on reaching it
    eatFishTarget() {
      if (!this.fishTargetActive || !this.fishTargetEl) return;
      this.fishTargetActive = false;

      // Spawn eating effects
      const eatX = this.fishTargetX;
      const eatY = this.fishTargetY;
      this.spawnHeartBurst(eatX, eatY);
      this.spawnTreatParticle(eatX, eatY, '🐟');
      this.audio.snack();

      if (this.fishTargetEl) {
        this.fishTargetEl.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
        this.fishTargetEl.style.transform = 'translate(-50%, -50%) scale(0)';
        this.fishTargetEl.style.opacity = '0';
        setTimeout(() => {
          if (this.fishTargetEl) {
            this.fishTargetEl.remove();
            this.fishTargetEl = null;
          }
        }, 280);
      }

      // Check if rewarding an active command
      if (this.pendingCommandReward) {
        this.pendingCommandReward = false;
        this.hideCommandBadge();
        this.changeLikeness(7, 'reward');
        this.say('meow~ 💕', 1800);
      } else {
        this.changeLikeness(8, 'treat');
        this.say('mewww~ 💕', 1800);
      }

      // Step 1: Lick lips in satisfaction
      this.setState('lick');
      this.stateTimer = 0;
      this.stateDuration = 2.8;

      // Step 2: Post-eating food coma nap!
      setTimeout(() => {
        this.audio.yawn();
        this.setState('sleep');
        this.stateTimer = 0;
        this.stateDuration = 8.5;
        this.say('mewww... 💤', 1800);
      }, 2900);
    }

    // ==========================================
    // INTERACTIVE SLEEP TOY (Draggable Baby Teddy / Pillow)
    // ==========================================

    toggleSleepToy() {
      this.sleepToyActive = !this.sleepToyActive;

      if (!this.sleepToyActive) {
        if (this.actorEl) {
          this.actorEl.classList.remove('cuddling-teddy');
        }
        if (this.sleepToyEl) {
          this.sleepToyEl.remove();
          this.sleepToyEl = null;
        }
        return false;
      }

      // Spawn Draggable Plushie Teddy Toy
      this.sleepToyEl = document.createElement('div');
      this.sleepToyEl.className = 'cozy-sleep-toy';
      this.sleepToyEl.title = 'Drag sleep toy near cat to cuddle & sleep!';
      this.sleepToyEl.innerHTML = `
        <svg class="sleep-toy-plush" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Bear Ears -->
          <circle cx="15" cy="16" r="9" fill="#D97706" stroke="#78350F" stroke-width="2.2" />
          <circle cx="15" cy="16" r="4.8" fill="#FDE68A" />
          <circle cx="49" cy="16" r="9" fill="#D97706" stroke="#78350F" stroke-width="2.2" />
          <circle cx="49" cy="16" r="4.8" fill="#FDE68A" />
          <!-- Bear Lower Feet -->
          <ellipse cx="18" cy="52" rx="7" ry="5.5" fill="#D97706" stroke="#78350F" stroke-width="2" />
          <circle cx="18" cy="52" r="2.8" fill="#FDE68A" />
          <ellipse cx="46" cy="52" rx="7" ry="5.5" fill="#D97706" stroke="#78350F" stroke-width="2" />
          <circle cx="46" cy="52" r="2.8" fill="#FDE68A" />
          <!-- Bear Body -->
          <ellipse cx="32" cy="38" rx="19" ry="17" fill="#F59E0B" stroke="#78350F" stroke-width="2.2" />
          <ellipse cx="32" cy="39" rx="11" ry="10" fill="#FEF3C7" />
          <path d="M 32 32 L 32 45" stroke="#D97706" stroke-width="1.5" stroke-dasharray="2 2" />
          <!-- Bear Head -->
          <ellipse cx="32" cy="24" rx="18" ry="15" fill="#F59E0B" stroke="#78350F" stroke-width="2.2" />
          <ellipse cx="32" cy="27" rx="8.5" ry="6.5" fill="#FEF3C7" stroke="#92400E" stroke-width="1.5" />
          <ellipse cx="32" cy="24" rx="3.5" ry="2.2" fill="#78350F" />
          <path d="M 32 26.2 L 32 28.5 M 29 28.5 Q 32 31.5 35 28.5" stroke="#78350F" stroke-width="1.6" stroke-linecap="round" fill="none" />
          <path d="M 21 21 Q 25 24 27 21" stroke="#78350F" stroke-width="2" stroke-linecap="round" fill="none" />
          <path d="M 37 21 Q 39 24 43 21" stroke="#78350F" stroke-width="2" stroke-linecap="round" fill="none" />
          <ellipse cx="20" cy="26" rx="3" ry="2" fill="#FDA4AF" opacity="0.8" />
          <ellipse cx="44" cy="26" rx="3" ry="2" fill="#FDA4AF" opacity="0.8" />
          <!-- Bowtie -->
          <path d="M 27 31 L 32 33 L 27 35 Z" fill="#FB7185" stroke="#9F1239" stroke-width="1" />
          <path d="M 37 31 L 32 33 L 37 35 Z" fill="#FB7185" stroke="#9F1239" stroke-width="1" />
          <circle cx="32" cy="33" r="2" fill="#E11D48" />
        </svg>
      `;

      // Position near the pet on floor
      this.sleepToyX = Math.max(50, Math.min(window.innerWidth - 60, this.x + (this.direction > 0 ? 120 : -60)));
      this.sleepToyY = this.getFloorY() + 85;

      this.sleepToyEl.style.left = `${this.sleepToyX}px`;
      this.sleepToyEl.style.top = `${this.sleepToyY}px`;
      this.shadow.appendChild(this.sleepToyEl);

      // Drag event listeners for sleep toy
      let toyDragOffsetX = 0;
      let toyDragOffsetY = 0;

      this.sleepToyEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.isDraggingSleepToy = true;
        this.sleepToyEl.setPointerCapture(e.pointerId);
        toyDragOffsetX = e.clientX - this.sleepToyX;
        toyDragOffsetY = e.clientY - this.sleepToyY;

        // Release cuddle hug while dragging
        if (this.actorEl) {
          this.actorEl.classList.remove('cuddling-teddy');
        }
        if (this.state === 'sleep') {
          this.wakeUp();
          this.say('mew! 🐾', 1600);
        }
      });

      this.sleepToyEl.addEventListener('pointermove', (e) => {
        if (!this.isDraggingSleepToy) return;
        e.preventDefault();
        this.sleepToyX = Math.max(25, Math.min(window.innerWidth - 35, e.clientX - toyDragOffsetX));
        this.sleepToyY = Math.max(25, Math.min(window.innerHeight - 35, e.clientY - toyDragOffsetY));
        this.sleepToyEl.style.left = `${this.sleepToyX}px`;
        this.sleepToyEl.style.top = `${this.sleepToyY}px`;
      });

      const stopToyDrag = () => {
        this.isDraggingSleepToy = false;
      };
      this.sleepToyEl.addEventListener('pointerup', stopToyDrag);
      this.sleepToyEl.addEventListener('pointercancel', stopToyDrag);

      this.say('mew! ✨', 1600);
      return true;
    }

    // ==========================================
    // INTERACTIVE BUTTERFLY CHASE 🦋
    // ==========================================

    toggleButterfly() {
      this.butterflyActive = !this.butterflyActive;

      if (!this.butterflyActive) {
        if (this.butterflyEl) {
          this.butterflyEl.remove();
          this.butterflyEl = null;
        }
        return false;
      }

      // Spawn Simple Cute 2-Wing Fluttering Butterfly Entity
      this.butterflyEl = document.createElement('div');
      this.butterflyEl.className = 'cozy-butterfly';
      this.butterflyEl.innerHTML = `
        <div class="butterfly-body">
          <div class="butterfly-wing left"></div>
          <div class="butterfly-torso"></div>
          <div class="butterfly-wing right"></div>
        </div>
      `;

      this.butterflyX = this.lastCursorX || (this.x + 100);
      this.butterflyY = Math.max(50, this.lastCursorY ? this.lastCursorY - 30 : this.getFloorY() - 100);
      this.butterflyVx = 0;
      this.butterflyVy = 0;
      this.butterflyTime = 0;

      this.butterflyEl.style.left = `${this.butterflyX}px`;
      this.butterflyEl.style.top = `${this.butterflyY}px`;
      this.shadow.appendChild(this.butterflyEl);

      this.say('mew! ✨', 1600);
      return true;
    }

    toggleLaser() {
      this.laserActive = !this.laserActive;
      if (this.laserEl) {
        this.laserEl.style.display = this.laserActive ? 'block' : 'none';
      }
      if (this.laserActive) {
        this.laserX = this.x + (this.direction * 150);
        this.laserY = this.getFloorY() + 80;
        this.laserEl.style.left = `${this.laserX}px`;
        this.laserEl.style.top = `${this.laserY}px`;
        this.say('meow! 🐾', 1600);
        this.setState('run');
      } else {
        this.setState('idle');
      }
    }

    nap() {
      this.audio.yawn();
      this.setState('sleep');
      this.stateTimer = 0;
      this.stateDuration = 8.0;
      this.say('mewww... 💤', 1800);
    }

    wakeUp() {
      this.audio.chirp();
      this.setState('idle');
      this.stateTimer = 0;
      this.stateDuration = 3.0;
      this.say('meow! ☀️', 1800);
    }

    gainFriendship(pts = 1) {
      this.changeLikeness(pts, 'friendship');
    }

    // ==========================================
    // AI STATE MACHINE & AUTONOMY
    // ==========================================

    setState(newState) {
      if (this.state === newState) return;

      // Stop crunch audio if interrupting eating
      if (this.state === 'lick' && newState !== 'lick') {
        if (this.audio && this.audio.stopCurrent) {
          this.audio.stopCurrent();
        }
      }

      this.state = newState;

      if (this.actorEl) {
        const isCuddling = this.actorEl.classList.contains('cuddling-teddy') && newState === 'sleep';
        this.actorEl.className = `cozy-pet-actor skin-${this.skin} state-${this.state}${isCuddling ? ' cuddling-teddy' : ''}`;
      }

      if (newState === 'sleep') {
        this.audio.stopPurr();
      }
    }

    updateAI(dt) {
      if (this.isDragging || this.isStealthHidden) return;

      // Desk Loaf Nap Mode (Stationary loaf when grounded, falls with full gravity if airborne)
      if (this.isDeskLoaf) {
        if (this.isGrounded) {
          if (this.state !== 'sit') this.setState('sit');
          this.vx = 0;
          this.vy = 0;
          return;
        }
      }

      // 1. Command Reward Timeout Handler
      if (this.pendingCommandReward) {
        this.commandRewardTimer -= dt;
        if (this.commandRewardTimer <= 0) {
          this.pendingCommandReward = false;
          this.hideCommandBadge();
          this.changeLikeness(-3, 'unrewarded_command');
          this.say('mew? 🐾', 1600);
        }
      }

      // Hydration Reminder Timer
      if (this.hydrationReminder) {
        this.hydrationTimer = (this.hydrationTimer || 0) + dt;
        if (this.hydrationTimer >= 600) { // 10 minutes
          this.hydrationTimer = 0;
          this.say('meow~ 🥛', 2000);
          this.audio.chirp();
        }
      }

      // Focus Mode Handler & 25-min Pomodoro Streak
      if (this.focusMode) {
        if (this.state !== 'sleep') {
          this.setState('sleep');
        }
        this.vx = 0;
        this.focusTimer = (this.focusTimer || 0) + dt;
        if (this.focusTimer >= 1500) { // 25 minutes
          this.focusTimer = 0;
          this.wakeUp();
          this.audio.meow(1.25);
          this.say('meow~ ✨', 2000);
          this.changeLikeness(5, 'pomodoro_complete');
        }
        return;
      }

      // Event-Driven Milestone Review Trigger (Prompt only on high bond milestone)
      if (this.likeness >= 70 && !this.reviewPromptShown) {
        this.reviewPromptShown = true;
        this.say('meow~ 💕', 2000);
      }

      // 2. Slow Neglect Degradation (every ~50s of active time without care)
      this.neglectTimer += dt;
      if (this.neglectTimer >= 50.0) {
        this.neglectTimer = 0;
        if (this.likeness > 30) {
          this.changeLikeness(-1, 'neglect');
          if (Math.random() < 0.25 && !this.isHovered && this.state !== 'sleep') {
            this.audio.playSad();
            this.say('mewww... 😿', 1800);
          }
        }
      }

      // 3. Distrust Evasion Behavior (< 25% likeness)
      if (this.isDistrustful() && this.lastCursorX && this.lastCursorY) {
        const petCenterX = this.x + 70;
        const petCenterY = this.y + 80;
        const distToCursor = Math.hypot(this.lastCursorX - petCenterX, this.lastCursorY - petCenterY);

        if (distToCursor < 140) {
          // Dart away from cursor!
          this.direction = this.lastCursorX > petCenterX ? -1 : 1;
          this.setState('run');
          this.vx = this.direction * 5.2 * this.speedMultiplier;
          this.checkEdgeTurn();
          return;
        }
      }

      // 4. Fresh Fish Treat Attraction AI 🐟
      if (this.fishTargetActive && this.fishTargetEl) {
        const dx = this.fishTargetX - (this.x + 70);
        const dist = Math.abs(dx);

        if (dist > 30) {
          this.direction = dx > 0 ? 1 : -1;
          this.setState('run');
          this.vx = this.direction * 5.2 * this.speedMultiplier;
        } else {
          // Reached the fish treat!
          this.vx = 0;
          this.eatFishTarget();
        }
        return;
      }

      // 5. Butterfly Chase AI (Tracks butterfly orbiting cursor) 🦋
      if (this.butterflyActive && this.butterflyEl) {
        const dx = this.butterflyX - (this.x + 70);
        const dist = Math.abs(dx);

        if (dist > 38) {
          this.direction = dx > 0 ? 1 : -1;
          this.setState('run');
          this.vx = this.direction * 4.8 * this.speedMultiplier;
        } else {
          // Playful pounce / swat! (Tiny Kitten Roar meme)
          this.vx *= 0.5;
          if (this.isGrounded && Math.random() < 0.35) {
            this.setState('jump');
            this.vy = -10.5;
            this.isGrounded = false;
            this.audio.playShortMew();
            this.say('mew! 🐾', 1400);
          }
        }
        return;
      }

      // 6. Sleep Toy Seeking & Cuddling AI (Holds Teddy in paws) 🧸
      if (this.sleepToyActive && this.sleepToyEl && !this.isDraggingSleepToy) {
        const dx = this.sleepToyX - (this.x + 70);
        const dist = Math.abs(dx);

        if (dist > 38) {
          if (this.actorEl) this.actorEl.classList.remove('cuddling-teddy');
          if (this.sleepToyEl) this.sleepToyEl.style.display = 'block';
          this.direction = dx > 0 ? 1 : -1;
          this.setState('walk');
          this.vx = this.direction * 2.5 * this.speedMultiplier;
        } else {
          // Snuggled right into teddy plushie's embrace!
          this.vx = 0;
          if (this.actorEl) {
            this.actorEl.classList.add('cuddling-teddy');
          }
          if (this.sleepToyEl) {
            this.sleepToyEl.style.display = 'none';
          }
          if (this.state !== 'sleep') {
            this.setState('sleep');
            this.stateTimer = 0;
            this.stateDuration = 24.0;
            this.say('purrr... 🧸💤', 2400);
          }
        }
        return;
      }

      // 7. Laser Chase AI override
      if (this.laserActive) {
        const dx = this.laserX - (this.x + 70);
        const dist = Math.abs(dx);

        if (dist > 25) {
          this.direction = dx > 0 ? 1 : -1;
          this.setState('run');
          this.vx = this.direction * 5.5 * this.speedMultiplier;
        } else {
          this.vx = 0;
          if (this.isGrounded && Math.random() < 0.35) {
            this.setState('jump');
            this.vy = -10;
            this.isGrounded = false;
            this.audio.playShortMew();
          }
        }
        return;
      }

      // 7. Autonomous ear swaying and occasional cute twitches
      this.updateEarTwitches(dt);

      // If being actively hovered / petted, freeze AI state timer so cat stays enjoying
      if (this.isHovered && this.state !== 'jump') {
        this.vx *= 0.8;
        return;
      }

      this.stateTimer += dt;

      // State transition decision
      if (this.stateTimer >= this.stateDuration) {
        this.pickNextState();
      }

      // State-specific behavior logic
      switch (this.state) {
        case 'walk':
          this.vx = this.direction * 2.2 * this.speedMultiplier;
          this.checkEdgeTurn();
          break;

        case 'run':
          this.vx = this.direction * 4.6 * this.speedMultiplier;
          this.checkEdgeTurn();
          break;

        case 'sleep':
          this.vx = 0;
          this.zzzTimer += dt;
          if (this.zzzTimer >= 1.6) {
            this.zzzTimer = 0;
            this.spawnZzzParticle();
          }
          break;

        case 'idle':
        case 'sit':
        case 'lick':
        case 'purr':
          this.vx *= 0.85;
          break;

        case 'jump':
          // Airborne movement
          break;
      }
    }

    updateEarTwitches(dt) {
      if (this.state === 'sleep' || this.isDragging) return;
      this.earTwitchTimer += dt;
      if (this.earTwitchTimer >= this.nextEarTwitchTime) {
        this.earTwitchTimer = 0;
        this.nextEarTwitchTime = this.getRandomTime(2.2, 5.2);
        const rig = this.actorEl ? this.actorEl.querySelector('.cat-rig') : null;
        if (rig && !rig.classList.contains('petting-ears')) {
          const types = ['ear-twitch-l', 'ear-twitch-r', 'ear-perk', 'ear-wiggle'];
          const chosen = types[Math.floor(Math.random() * types.length)];
          rig.classList.add(chosen);
          setTimeout(() => {
            if (rig) rig.classList.remove('ear-twitch-l', 'ear-twitch-r', 'ear-perk', 'ear-wiggle');
          }, 450);
        }
      }

      // Periodic Cute Short Mew Timer (Randomly every 10-15s while active)
      this.ambientMewTimer = (this.ambientMewTimer || 0) + dt;
      if (this.ambientMewTimer >= (this.nextAmbientMewTime || 12)) {
        this.ambientMewTimer = 0;
        this.nextAmbientMewTime = 10 + Math.random() * 5; // 10 to 15 second intervals
        const validStates = ['walk', 'run', 'sit', 'idle'];
        if (!this.isHovered && !this.isDragging && !this.isStealthHidden && (validStates.includes(this.state) || this.butterflyActive || this.laserActive)) {
          if (!this.audio || !this.audio.isAudioPlaying()) {
            const mews = ['mew~ 🐾', 'meow~ 💕', 'mewww! ✨', 'meowwww~ 🐾'];
            this.say(mews[Math.floor(Math.random() * mews.length)], 1600);
            if (this.audio && this.audio.playRandomMeow) {
              this.audio.playRandomMeow();
            }
          }
        }
      }
    }

    pickNextState() {
      this.stateTimer = 0;
      const r = Math.random();

      // If in Edge Peeking Mode, stay resting quietly near edge!
      if (this.isPeeking) {
        this.setState('idle');
        this.stateDuration = this.getRandomTime(4.0, 8.0);
        return;
      }

      // Avoid getting stuck in sleep
      if (this.state === 'sleep' && r < 0.70) {
        this.setState('idle');
        this.stateDuration = this.getRandomTime(3.0, 5.0);
        return;
      }

      // 45% Active Wandering
      if (r < 0.45) {
        this.direction = Math.random() < 0.5 ? 1 : -1;
        this.setState('walk');
        this.stateDuration = this.getRandomTime(3.0, 6.0);
      }
      // 40% Sitting / Grooming / Napping / Loaf
      else if (r < 0.85) {
        const sub = Math.random();
        if (sub < 0.40) {
          this.setState('sit');
          this.stateDuration = this.getRandomTime(3.0, 5.0);
        } else if (sub < 0.70) {
          this.setState('idle');
          this.stateDuration = this.getRandomTime(3.0, 4.5);
        } else if (sub < 0.90) {
          this.setState('lick');
          this.stateDuration = this.getRandomTime(3.0, 5.0);
        } else {
          this.setState('sleep');
          this.stateDuration = this.getRandomTime(6.0, 12.0);
        }
      }
      // 10% Curious Observer
      else if (r < 0.95) {
        this.setState('idle');
        this.stateDuration = this.getRandomTime(3.0, 5.0);
        if (this.lastCursorY && this.lastCursorY > window.innerHeight - 300) {
          this.say('mew? 🐾', 1600);
          this.audio.playShortMew();
        }
      }
      // 5% Dynamic Play / Hop
      else {
        this.setState('jump');
        this.vy = -9;
        this.vx = this.direction * 2.0;
        this.isGrounded = false;
        this.stateDuration = 1.0;
      }
    }

    checkEdgeTurn() {
      const minX = 20;
      const maxX = window.innerWidth - (this.baseWidth * this.scale) - 20;

      if (this.x <= minX && this.direction < 0) {
        this.direction = 1;
        this.vx = Math.abs(this.vx);
      } else if (this.x >= maxX && this.direction > 0) {
        this.direction = -1;
        this.vx = -Math.abs(this.vx);
      }
    }

    // ==========================================
    // PHYSICS ENGINE & COLLISION
    // ==========================================

    updatePhysics(dt) {
      if (this.isDragging || this.isStealthHidden) return;

      const floorY = this.getFloorY();

      // Apply Gravity
      if (!this.isGrounded) {
        this.vy += this.gravity;
        if (this.vy > this.maxFallSpeed) this.vy = this.maxFallSpeed;
      }

      // Integrate velocities
      this.x += this.vx;
      this.y += this.vy;

      // Ground Collision Detection
      if (this.y >= floorY) {
        this.y = floorY;

        if (!this.isGrounded) {
          // Landing bounce
          if (this.vy > 4) {
            this.onLand();
          }
          this.vy = 0;
          this.isGrounded = true;
        }
      } else {
        this.isGrounded = false;
      }

      // Screen Boundary Clamping
      this.clampToBounds(true);
      this.updateTransform();

      // Butterfly Physics & Movement (Continuously follows mouse cursor) 🦋
      if (this.butterflyActive && this.butterflyEl) {
        this.butterflyTime += dt;

        // Target center point follows cursor position (or hovers above pet if no mouse event yet)
        const targetX = (this.lastCursorX || (this.x + 90)) + Math.sin(this.butterflyTime * 3.2) * 26;
        const targetY = Math.max(30, (this.lastCursorY ? this.lastCursorY - 25 : this.getFloorY() - 80) + Math.cos(this.butterflyTime * 2.6) * 20);

        // Smoothly glide towards mouse cursor with soft natural easing
        const dx = targetX - this.butterflyX;
        const dy = targetY - this.butterflyY;
        this.butterflyX += dx * 0.14;
        this.butterflyY += dy * 0.14;

        // Orient butterfly towards motion direction
        const flipX = dx < -0.5 ? -1 : 1;
        this.butterflyEl.style.transform = `translate(-50%, -50%) scaleX(${flipX})`;
        this.butterflyEl.style.left = `${this.butterflyX}px`;
        this.butterflyEl.style.top = `${this.butterflyY}px`;
      }
    }

    onLand() {
      this.spawnDustPuff(this.x + 40, this.getFloorY() + 130);

      if (this.isHighDrop) {
        this.isHighDrop = false;
        this.audio.playSquishQuack(); // Quack ONLY on squishing upon falling
        this.setState('rolling-ball'); // Triggers smooth pancakeSquishInflate animation
        this.say('mewww!! 🐾', 1600);
        setTimeout(() => {
          this.setState('dizzy');
          setTimeout(() => {
            this.setState('idle');
            this.say('meow~ 💕', 1600);
          }, 800);
        }, 950);
        return;
      }

      const prev = this.state;
      this.setState('landing');
      setTimeout(() => {
        if (this.state === 'landing') {
          this.setState((prev === 'dragged' || prev === 'jump') ? 'idle' : prev);
        }
      }, 320);
    }

    getFloorY() {
      if (this.isPeeking) {
        // Edge Peeking Mode: Push pet off-screen so only ears/paws peek out from bottom bezel!
        return window.innerHeight - 35;
      }

      return window.innerHeight - (this.baseHeight * this.scale);
    }

    clampToBounds(clampY = true) {
      const minX = 10;
      const maxX = window.innerWidth - (this.baseWidth * this.scale) - 10;
      const minY = 10;
      const maxY = this.getFloorY();

      if (this.x < minX) {
        this.x = minX;
        this.vx = 0;
      } else if (this.x > maxX) {
        this.x = maxX;
        this.vx = 0;
      }

      if (!clampY) return;

      if (this.y < minY) {
        this.y = minY;
        this.vy = 0;
      } else if (this.y > maxY) {
        this.y = maxY;
        this.vy = 0;
        this.isGrounded = true;
      }
    }

    updateTransform() {
      if (!this.actorEl) return;
      const flip = this.direction < 0 ? -1 : 1;

      if (this.state === 'dragged') {
        const rot = Math.max(-20, Math.min(20, this.dragInertiaX || 0));
        this.actorEl.style.transform = `translate3d(${Math.round(this.x)}px, ${Math.round(this.y)}px, 0) scale(${this.scale * flip}, ${this.scale}) rotate(${rot}deg)`;
        return;
      }

      if (!this.isGrounded && (this.state === 'jump' || Math.abs(this.vy) > 1.5)) {
        // Smooth parabolic rotation while airborne / thrown in air
        const flightRot = Math.max(-24, Math.min(24, (this.vx * 2.2) + (this.vy < 0 ? -6 : 6) * flip));
        this.actorEl.style.transform = `translate3d(${Math.round(this.x)}px, ${Math.round(this.y)}px, 0) scale(${this.scale * flip}, ${this.scale}) rotate(${flightRot}deg)`;
        return;
      }

      this.actorEl.style.transform = `translate3d(${Math.round(this.x)}px, ${Math.round(this.y)}px, 0) scale(${this.scale * flip}, ${this.scale})`;
    }

    spawnDustPuff(x, y) {
      for (let i = 0; i < 2; i++) {
        const particle = document.createElement('div');
        particle.className = 'cozy-dust-particle';
        particle.textContent = '💨';
        particle.style.left = `${x + (i * 30 - 15)}px`;
        particle.style.top = `${y}px`;
        this.shadow.appendChild(particle);
        setTimeout(() => particle.remove(), 550);
      }
    }

    // ==========================================
    // PARTICLE SYSTEMS & CHAT
    // ==========================================

    spawnHeartBurst(clientX, clientY) {
      const hearts = ['💖', '✨', '💕', '🌸'];
      const count = 2; // subtle, gentle floating hearts

      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'cozy-particle cozy-heart-particle';
        particle.textContent = hearts[Math.floor(Math.random() * hearts.length)];

        // Compute local position within viewport
        const startX = this.x + 70 + (Math.random() - 0.5) * 20;
        const startY = this.y + 40 + (Math.random() - 0.5) * 20;

        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
        const dist = 24 + Math.random() * 28;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist - 20;
        const rot = (Math.random() - 0.5) * 30;

        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.setProperty('--rot', `${rot}deg`);

        this.shadow.appendChild(particle);
        setTimeout(() => particle.remove(), 1100);
      }
    }

    spawnTreatParticle(x, y, char) {
      const particle = document.createElement('div');
      particle.className = 'cozy-particle cozy-treat-particle';
      particle.textContent = char;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      this.shadow.appendChild(particle);
      setTimeout(() => particle.remove(), 700);
    }

    spawnZzzParticle() {
      const zzz = document.createElement('div');
      zzz.className = 'cozy-particle cozy-zzz-particle';
      zzz.textContent = 'Zzz';

      const startX = this.x + (this.direction > 0 ? 85 : 45);
      const startY = this.y + 20;

      zzz.style.left = `${startX}px`;
      zzz.style.top = `${startY}px`;
      zzz.style.fontSize = `${14 + Math.random() * 6}px`;

      this.shadow.appendChild(zzz);
      setTimeout(() => zzz.remove(), 2400);
    }

    say(text, duration = 2000) {
      if (this.speechEl) {
        this.speechEl.remove();
        this.speechEl = null;
      }

      this.speechEl = document.createElement('div');
      this.speechEl.className = 'cozy-speech-bubble';
      this.speechEl.textContent = text;
      this.actorEl.appendChild(this.speechEl);

      clearTimeout(this.speechTimer);
      this.speechTimer = setTimeout(() => {
        if (this.speechEl) {
          this.speechEl.remove();
          this.speechEl = null;
        }
      }, duration);
    }

    // ==========================================
    // MAIN RAF SIMULATION LOOP
    // ==========================================

    startLoop() {
      let lastTime = performance.now();

      const loop = (currentTime) => {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
        lastTime = currentTime;

        if (this.enabled && (typeof document === 'undefined' || !document.hidden)) {
          this.updateAI(dt);
          this.updatePhysics(dt);
        }

        requestAnimationFrame(loop);
      };

      requestAnimationFrame(loop);
    }
  }

  // Helper
  CozyPetEngine.prototype.getRandomTime = function(min, max) {
    return min + Math.random() * (max - min);
  };

  root.CozyPetEngine = CozyPetEngine;
  if (typeof window !== 'undefined') window.CozyPetEngine = CozyPetEngine;
  if (typeof globalThis !== 'undefined') globalThis.CozyPetEngine = CozyPetEngine;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
