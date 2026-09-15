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

      // Extension Settings
      this.enabled = true;
      this.skin = 'orange-tabby';
      this.scale = 1.0;
      this.speedMultiplier = 1.0;
      this.soundMuted = false;
      this.volume = 0.65;
      this.friendship = 10;

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

      // Laser Chase State
      this.laserActive = false;
      this.laserX = 0;
      this.laserY = 0;
      this.laserEl = null;

      // AI State Machine
      // 'idle' | 'walk' | 'run' | 'jump' | 'lick' | 'sleep' | 'dragged' | 'landing' | 'purr'
      this.state = 'idle';
      this.stateTimer = 0;
      this.stateDuration = this.getRandomTime(2.5, 4.5);
      this.walkTargetX = this.x;
      this.zzzTimer = 0;
      this.speechTimer = 0;

      // DOM References
      this.actorEl = null;
      this.shadowEl = null;
      this.speechEl = null;

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
        <!-- Tail -->
        <div class="tail-anchor">
          <div class="tail-segment">
            <div class="tail-stripe s1"></div>
            <div class="tail-stripe s2"></div>
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

        <!-- Head, Ears, Face, Eyes, Whiskers -->
        <div class="cat-head">
          <div class="ear left"></div>
          <div class="ear right"></div>

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
              <div class="eye l"></div>
              <div class="eye-closed l"></div>
              <div class="eye r"></div>
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

      // Window Resize Boundary Check
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
        chrome.storage.local.get(['enabled', 'skin', 'scale', 'speedMultiplier', 'soundMuted', 'volume', 'friendship'], (data) => {
          if (data) {
            if (data.enabled !== undefined) this.setEnabled(data.enabled);
            if (data.skin) this.setSkin(data.skin);
            if (data.scale) this.setScale(data.scale);
            if (data.speedMultiplier) this.setSpeed(data.speedMultiplier);
            if (data.soundMuted !== undefined) this.setMuted(data.soundMuted);
            if (data.volume !== undefined) this.setVolume(data.volume);
            if (data.friendship !== undefined) this.friendship = data.friendship;
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
      if (changes.friendship) this.friendship = changes.friendship.newValue;
    }

    setEnabled(val) {
      this.enabled = !!val;
      if (this.actorEl) {
        this.actorEl.style.display = this.enabled ? 'block' : 'none';
      }
    }

    setSkin(skinName) {
      const allowed = ['orange-tabby', 'calico', 'tuxedo', 'void-cat', 'siamese', 'silver-tabby'];
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

    // ==========================================
    // INTERACTION & POINTER HANDLERS
    // ==========================================

    handlePointerDown(e) {
      if (!this.enabled || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      this.isDragging = true;
      this.actorEl.setPointerCapture(e.pointerId);

      const rect = this.actorEl.getBoundingClientRect();
      this.dragOffsetX = e.clientX - rect.left;
      this.dragOffsetY = e.clientY - rect.top;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      this.dragVelocityX = 0;
      this.dragVelocityY = 0;

      this.setState('dragged');
      this.audio.panic();
    }

    handlePointerMove(e) {
      if (this.laserActive) {
        this.laserX = e.clientX;
        this.laserY = e.clientY;
        if (this.laserEl) {
          this.laserEl.style.left = `${this.laserX}px`;
          this.laserEl.style.top = `${this.laserY}px`;
        }
      }

      if (!this.isDragging) return;
      e.preventDefault();

      const newX = e.clientX - this.dragOffsetX;
      const newY = e.clientY - this.dragOffsetY;

      // Track drag throw velocity
      this.dragVelocityX = (e.clientX - this.lastPointerX) * 0.6;
      this.dragVelocityY = (e.clientY - this.lastPointerY) * 0.6;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      this.x = newX;
      this.y = newY;
      this.vx = 0;
      this.vy = 0;
      this.isGrounded = false;

      this.clampToBounds(false);
      this.updateTransform();
    }

    handlePointerUp(e) {
      if (!this.isDragging) return;
      this.isDragging = false;

      // Throw velocity
      this.vx = Math.max(-18, Math.min(18, this.dragVelocityX));
      this.vy = Math.max(-15, Math.min(15, this.dragVelocityY));

      const floorY = this.getFloorY();
      if (this.y >= floorY - 2) {
        this.y = floorY;
        this.isGrounded = true;
        this.onLand();
      } else {
        this.isGrounded = false;
        this.setState('jump');
      }
    }

    handleSingleClick(e) {
      if (this.isDragging) return;

      this.spawnHeartBurst(e.clientX, e.clientY);
      this.audio.chirp();
      this.audio.startPurr(2.2);
      this.setState('purr');
      this.stateTimer = 0;
      this.stateDuration = 2.4;

      this.gainFriendship(1);

      const phrases = ['Purrrr~ ❤️', 'Meow! ✨', 'Mew mew! 💕', '*happy purr* 🐾', 'Love you! 💖', 'Scritches! ✨'];
      const text = phrases[Math.floor(Math.random() * phrases.length)];
      this.say(text, 2200);
    }

    handleDoubleClick(e) {
      if (this.isDragging) return;
      this.spawnHeartBurst(e.clientX, e.clientY);
      this.audio.chirp();
      this.vy = -14;
      this.vx = (Math.random() - 0.5) * 8;
      this.isGrounded = false;
      this.setState('jump');
      this.say('Wheee! 🎈', 1800);
    }

    // Multi-zone Hover Petting & Tickling System
    handlePetPointerEnter(e) {
      if (this.isDragging) return;
      this.isHovered = true;

      // Stop moving smoothly to enjoy the petting!
      if (this.state === 'walk' || this.state === 'run') {
        this.setState('idle');
        this.vx *= 0.3;
      }
      this.updatePetHoverZone(e);
    }

    handlePetPointerMove(e) {
      if (this.isDragging) return;
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
      if (this.isDragging) return;

      const target = e.target;
      let zone = 'chin'; // default cute pet

      if (target.closest('.cat-collar, .golden-bell, .collar-bow')) {
        zone = 'collar';
      } else if (target.closest('.ear, .head-stripes, .head-base')) {
        zone = 'ears';
      } else if (target.closest('.muzzle-cheeks, .cheek-puff, .whiskers, .nose, .mouth-normal, .mouth-open, .blush-spots')) {
        zone = 'chin';
      } else if (target.closest('.torso-belly, .torso')) {
        zone = 'belly';
      } else if (target.closest('.tail-anchor, .tail-segment, .tail-stripe')) {
        zone = 'tail';
      } else if (target.closest('.front-paw, .hind-leg, .front-paws, .hind-legs')) {
        zone = 'paws';
      } else if (target.closest('.cat-head')) {
        zone = 'ears';
      }

      this.triggerPetReaction(zone, e.clientX, e.clientY);
    }

    triggerPetReaction(zone, clientX, clientY) {
      const rig = this.actorEl.querySelector('.cat-rig');
      if (!rig) return;

      // Only switch CSS class and reset transition if zone actually changed
      if (this.currentPetZone !== zone) {
        this.currentPetZone = zone;
        rig.classList.remove('petting-chin', 'petting-ears', 'tickling-belly', 'tickling-tail', 'petting-paws');

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

      const petTime = performance.now();
      if (!this.lastPetAudioTime) this.lastPetAudioTime = 0;
      if (!this.lastPetParticleTime) this.lastPetParticleTime = 0;
      if (!this.lastPetSpeechTime) this.lastPetSpeechTime = 0;

      switch (zone) {
        case 'collar':
          if (petTime - this.lastPetAudioTime > 500) {
            if (this.audio.bellChime) this.audio.bellChime();
            else this.audio.chirp();
            this.lastPetAudioTime = petTime;
          }
          if (petTime - this.lastPetParticleTime > 280) {
            const bellIcons = ['🔔', '✨', '🎶', '💛'];
            this.spawnPettingSparkle(clientX || (this.x + 70), clientY || (this.y + 75), bellIcons[Math.floor(Math.random() * bellIcons.length)]);
            this.lastPetParticleTime = petTime;
          }
          if (petTime - this.lastPetSpeechTime > 3200) {
            const msgs = ['Jingle jingle! 🔔✨', 'My fancy bell! 💖', 'Ring ring! 🐾'];
            this.say(msgs[Math.floor(Math.random() * msgs.length)], 1800);
            this.lastPetSpeechTime = petTime;
            this.gainFriendship(1);
          }
          break;

        case 'chin':
          if (petTime - this.lastPetAudioTime > 800) {
            this.audio.startPurr(2.0);
            this.lastPetAudioTime = petTime;
          }
          if (petTime - this.lastPetParticleTime > 320) {
            this.spawnHeartBurst(clientX || (this.x + 70), clientY || (this.y + 40));
            this.lastPetParticleTime = petTime;
          }
          if (petTime - this.lastPetSpeechTime > 3200) {
            const msgs = ['Purrrr... chin rubs! 💕', 'Mmm right there... ✨', '*happy purr* 🐾'];
            this.say(msgs[Math.floor(Math.random() * msgs.length)], 1800);
            this.lastPetSpeechTime = petTime;
            this.gainFriendship(1);
          }
          break;

        case 'ears':
          if (petTime - this.lastPetAudioTime > 900) {
            this.audio.chirp();
            this.lastPetAudioTime = petTime;
          }
          if (petTime - this.lastPetParticleTime > 350) {
            this.spawnPettingSparkle(clientX || (this.x + 70), clientY || (this.y + 20), '✨');
            this.lastPetParticleTime = petTime;
          }
          if (petTime - this.lastPetSpeechTime > 3200) {
            const msgs = ['Ear scritches are best! 🐱', '*happy headbutt* 💖', 'So cozy! ✨'];
            this.say(msgs[Math.floor(Math.random() * msgs.length)], 1800);
            this.lastPetSpeechTime = petTime;
            this.gainFriendship(1);
          }
          break;

        case 'belly':
          if (petTime - this.lastPetAudioTime > 350) {
            if (this.audio.tickleTrill) this.audio.tickleTrill();
            else this.audio.chirp();
            this.lastPetAudioTime = petTime;
          }
          if (petTime - this.lastPetParticleTime > 220) {
            const icons = ['✨', '🐾', '⭐', '🎈'];
            this.spawnPettingSparkle(clientX || (this.x + 70), clientY || (this.y + 70), icons[Math.floor(Math.random() * icons.length)]);
            this.lastPetParticleTime = petTime;
          }
          if (petTime - this.lastPetSpeechTime > 2800) {
            const msgs = ['Hehehe ticklish! 🐾', 'Belly trap! 😼', '*playful squirm* ✨', 'No more tickles! 😹'];
            this.say(msgs[Math.floor(Math.random() * msgs.length)], 1800);
            this.lastPetSpeechTime = petTime;
            this.gainFriendship(1);
          }
          break;

        case 'tail':
          if (petTime - this.lastPetAudioTime > 700) {
            this.audio.chirp();
            this.lastPetAudioTime = petTime;
          }
          if (petTime - this.lastPetParticleTime > 350) {
            this.spawnPettingSparkle(clientX || (this.x + 30), clientY || (this.y + 80), '💫');
            this.lastPetParticleTime = petTime;
          }
          if (petTime - this.lastPetSpeechTime > 3200) {
            const msgs = ['Brrrrt! ⚡', '*excited tail swish* 🐾', 'Elevator butt! 🚀'];
            this.say(msgs[Math.floor(Math.random() * msgs.length)], 1800);
            this.lastPetSpeechTime = petTime;
            this.gainFriendship(1);
          }
          break;

        case 'paws':
          if (petTime - this.lastPetAudioTime > 800) {
            this.audio.chirp();
            this.lastPetAudioTime = petTime;
          }
          if (petTime - this.lastPetParticleTime > 380) {
            this.spawnPettingSparkle(clientX || (this.x + 70), clientY || (this.y + 100), '🐾');
            this.lastPetParticleTime = petTime;
          }
          if (petTime - this.lastPetSpeechTime > 3200) {
            const msgs = ['Soft toe beans! 🐾', '*gentle kneading* ✨', 'High five! ✋'];
            this.say(msgs[Math.floor(Math.random() * msgs.length)], 1800);
            this.lastPetSpeechTime = petTime;
            this.gainFriendship(1);
          }
          break;
      }

      // Auto-clear active reaction class if cursor goes still
      if (this.pettingResetTimeout) clearTimeout(this.pettingResetTimeout);
      this.pettingResetTimeout = setTimeout(() => {
        this.clearPettingReactions();
      }, 700);
    }

    clearPettingReactions() {
      if (this.pettingResetTimeout) {
        clearTimeout(this.pettingResetTimeout);
        this.pettingResetTimeout = null;
      }
      this.currentPetZone = null;
      const rig = this.actorEl ? this.actorEl.querySelector('.cat-rig') : null;
      if (rig) {
        rig.classList.remove('petting-chin', 'petting-ears', 'tickling-belly', 'tickling-tail', 'petting-paws');
      }
    }

    spawnPettingSparkle(x, y, char = '✨') {
      const particle = document.createElement('div');
      particle.className = 'cozy-particle cozy-heart-particle';
      particle.textContent = char;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 50}px`);
      particle.style.setProperty('--ty', `${-30 - Math.random() * 40}px`);
      particle.style.setProperty('--rot', `${(Math.random() - 0.5) * 45}deg`);

      this.shadow.appendChild(particle);
      setTimeout(() => particle.remove(), 1100);
    }

    // Care Actions
    feedTreat(type = 'fish') {
      const icons = { fish: '🐟', treat: '🍖', milk: '🥛' };
      const icon = icons[type] || '🐟';

      // Drop snack particle near the pet
      const treatX = this.x + (this.direction > 0 ? 90 : 20);
      const treatY = this.y + 40;
      this.spawnTreatParticle(treatX, treatY, icon);

      this.audio.snack();
      this.gainFriendship(2);

      setTimeout(() => {
        this.setState('lick');
        this.stateTimer = 0;
        this.stateDuration = 3.5;
        this.say('Yummy! 😋', 2200);
      }, 400);
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
        this.say('Target acquired! 🔴👀', 2000);
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
      this.say('Zzz... 💤', 2500);
    }

    wakeUp() {
      this.audio.chirp();
      this.setState('idle');
      this.stateTimer = 0;
      this.stateDuration = 3.0;
      this.say('Good morning! ☀️', 2000);
    }

    gainFriendship(pts = 1) {
      this.friendship = Math.min(100, this.friendship + pts);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ friendship: this.friendship });
      }
    }

    // ==========================================
    // AI STATE MACHINE
    // ==========================================

    setState(newState) {
      if (this.state === newState) return;
      this.state = newState;

      if (this.actorEl) {
        this.actorEl.className = `cozy-pet-actor skin-${this.skin} state-${this.state}`;
      }

      if (newState === 'sleep') {
        this.audio.stopPurr();
      }
    }

    updateAI(dt) {
      if (this.isDragging) return;

      // Laser Chase AI override
      if (this.laserActive) {
        const dx = this.laserX - (this.x + 70);
        const dist = Math.abs(dx);

        if (dist > 25) {
          this.direction = dx > 0 ? 1 : -1;
          this.setState('run');
          this.vx = this.direction * 5.5 * this.speedMultiplier;
        } else {
          this.vx *= 0.5;
          this.setState('jump');
          if (this.isGrounded) {
            this.vy = -10;
            this.isGrounded = false;
            this.audio.chirp();
          }
        }
        return;
      }

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
          this.vx = this.direction * 1.8 * this.speedMultiplier;
          this.checkEdgeTurn();
          break;

        case 'run':
          this.vx = this.direction * 4.2 * this.speedMultiplier;
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

    pickNextState() {
      this.stateTimer = 0;
      const r = Math.random();

      // Avoid getting stuck in sleep
      if (this.state === 'sleep' && r < 0.6) {
        this.audio.chirp();
        this.setState('idle');
        this.stateDuration = this.getRandomTime(2.5, 4.0);
        return;
      }

      if (r < 0.32) {
        // Walk in a chosen direction
        this.direction = Math.random() < 0.5 ? 1 : -1;
        this.setState('walk');
        this.stateDuration = this.getRandomTime(3.0, 6.0);
      } else if (r < 0.50) {
        // Idle breathing & looking around
        this.setState('idle');
        this.stateDuration = this.getRandomTime(2.0, 4.5);
      } else if (r < 0.65) {
        // Sit and look around
        this.setState('sit');
        this.stateDuration = this.getRandomTime(2.5, 4.5);
      } else if (r < 0.80) {
        // Lick paws in sitting pose
        this.setState('lick');
        this.stateDuration = this.getRandomTime(3.0, 5.0);
      } else if (r < 0.90) {
        // Energetic Run
        this.direction = Math.random() < 0.5 ? 1 : -1;
        this.setState('run');
        this.stateDuration = this.getRandomTime(1.8, 3.2);
      } else if (r < 0.96) {
        // Playful Hop
        this.setState('jump');
        this.vy = -11;
        this.vx = this.direction * 2.5;
        this.isGrounded = false;
        this.stateDuration = 1.0;
        this.audio.chirp();
      } else {
        // Take a nap
        this.setState('sleep');
        this.stateDuration = this.getRandomTime(6.0, 12.0);
        this.audio.yawn();
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
      if (this.isDragging) return;

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
    }

    onLand() {
      this.audio.landing();
      const prev = this.state;
      this.setState('landing');
      setTimeout(() => {
        if (this.state === 'landing') {
          this.setState(prev === 'dragged' ? 'idle' : prev);
        }
      }, 350);
    }

    getFloorY() {
      return window.innerHeight - (this.baseHeight * this.scale) - 8;
    }

    clampToBounds(bounce = true) {
      const minX = 10;
      const maxX = window.innerWidth - (this.baseWidth * this.scale) - 10;
      const minY = 10;
      const maxY = this.getFloorY();

      if (this.x < minX) {
        this.x = minX;
        if (bounce) {
          this.vx = -this.vx * this.bounceDamping;
          this.direction = 1;
        }
      } else if (this.x > maxX) {
        this.x = maxX;
        if (bounce) {
          this.vx = -this.vx * this.bounceDamping;
          this.direction = -1;
        }
      }

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
      this.actorEl.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) scale(${this.scale * flip}, ${this.scale})`;
    }

    // ==========================================
    // PARTICLE SYSTEMS & CHAT
    // ==========================================

    spawnHeartBurst(clientX, clientY) {
      const hearts = ['❤️', '💖', '✨', '🐾', '💕'];
      const count = 6;

      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'cozy-particle cozy-heart-particle';
        particle.textContent = hearts[Math.floor(Math.random() * hearts.length)];

        // Compute local position within viewport
        const startX = this.x + 70 + (Math.random() - 0.5) * 30;
        const startY = this.y + 40 + (Math.random() - 0.5) * 30;

        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const dist = 35 + Math.random() * 45;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist - 25;
        const rot = (Math.random() - 0.5) * 60;

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

        if (this.enabled) {
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
