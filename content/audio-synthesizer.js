/**
 * Cozy Browser Pets - Web Audio Synthesizer
 * Clean procedural audio controller.
 * Sounds enabled:
 * 1. Quack on falling/splat (meme_quack.mp3)
 * 2. Crunch on eating (mew_crunch.mp3) - stops if interrupted
 * 3. Random meow every 10-15s (3 cute meow variations)
 * NO sound on petting.
 */
(function(root) {
  let globalActiveAudio = null;
  let globalActiveTimeout = null;

  class CozyAudioSynthesizer {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      this.volume = 0.55;
      this.userUnlocked = false;

      // Master normalized audio map - strictly 3 sound types
      this.soundMap = {
        'mew_short': { path: 'sounds/mew_short_cute.mp3', vol: 0.32, maxSec: 0.8 },
        'mew_clean': { path: 'sounds/mew_meow_clean.mp3', vol: 0.30, maxSec: 1.1 },
        'mew_kitten': { path: 'sounds/mew_kitten1.mp3', vol: 0.30, maxSec: 1.0 },
        'mew_crunch': { path: 'sounds/mew_crunch.mp3', vol: 0.34, maxSec: 1.4 },
        'meme_quack': { path: 'sounds/meme_quack.mp3', vol: 0.34, maxSec: 0.7 }
      };

      const unlock = () => {
        this.userUnlocked = true;
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        if (typeof window !== 'undefined') {
          window.removeEventListener('pointerdown', unlock, true);
          window.removeEventListener('keydown', unlock, true);
          window.removeEventListener('touchstart', unlock, true);
          window.removeEventListener('click', unlock, true);
        }
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('pointerdown', unlock, { capture: true, once: true });
        window.addEventListener('keydown', unlock, { capture: true, once: true });
        window.addEventListener('touchstart', unlock, { capture: true, once: true });
        window.addEventListener('click', unlock, { capture: true, once: true });
      }
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = root.AudioContext || root.webkitAudioContext || (typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null);
        if (AudioCtx) {
          try { this.ctx = new AudioCtx(); } catch (e) {}
        }
      }
      if (this.ctx && this.ctx.state === 'suspended' && this.userUnlocked) {
        this.ctx.resume().catch(() => {});
      }
    }

    setMuted(muted) {
      this.isMuted = !!muted;
      if (this.isMuted) {
        this.stopAll();
      }
    }

    setVolume(vol) {
      this.volume = Math.max(0, Math.min(1, vol));
    }

    getSoundUrl(filename) {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        try {
          return chrome.runtime.getURL(filename);
        } catch (e) {}
      }
      return filename;
    }

    stopCurrent() {
      if (globalActiveTimeout) {
        clearTimeout(globalActiveTimeout);
        globalActiveTimeout = null;
      }
      if (globalActiveAudio) {
        try {
          globalActiveAudio.pause();
          globalActiveAudio.currentTime = 0;
          globalActiveAudio.src = '';
        } catch (e) {}
        globalActiveAudio = null;
      }
    }

    stopAll() {
      this.stopCurrent();
    }

    isAudioPlaying() {
      return !!globalActiveAudio && !globalActiveAudio.paused && globalActiveAudio.currentTime > 0;
    }

    playSample(key, customVolMultiplier = 1.0, customMaxSec = 0) {
      if (this.isMuted) return null;
      const soundDef = this.soundMap[key];
      if (!soundDef) return null;

      this.stopCurrent();

      const url = this.getSoundUrl(soundDef.path);
      try {
        const audio = new Audio(url);
        const finalVol = Math.max(0, Math.min(1, this.volume * soundDef.vol * customVolMultiplier));
        audio.volume = finalVol;
        audio.playbackRate = 0.97 + Math.random() * 0.06;

        const p = audio.play();
        if (p && p.catch) p.catch(() => {});

        globalActiveAudio = audio;

        const limitSec = customMaxSec || soundDef.maxSec;
        if (limitSec > 0) {
          globalActiveTimeout = setTimeout(() => {
            if (globalActiveAudio === audio) {
              try {
                audio.pause();
                audio.currentTime = 0;
              } catch(e) {}
              globalActiveAudio = null;
              globalActiveTimeout = null;
            }
          }, limitSec * 1000);
        }

        audio.onended = () => {
          if (globalActiveAudio === audio) {
            globalActiveAudio = null;
            if (globalActiveTimeout) {
              clearTimeout(globalActiveTimeout);
              globalActiveTimeout = null;
            }
          }
        };

        return audio;
      } catch (e) {
        return null;
      }
    }

    // --- APPROVED SOUND API ---

    // 1. Quack ONLY on squishing upon falling
    playSquishQuack() {
      this.playSample('meme_quack', 1.0, 0.7);
    }

    // 2. Crunch on eating (stops immediately if interrupted)
    snack() {
      this.playSample('mew_crunch', 1.0, 1.4);
    }

    stopSnack() {
      this.stopCurrent();
    }

    // 3. Random meow once every 10-15s (using 3 meow sound variations)
    playRandomMeow() {
      if (this.isAudioPlaying()) return; // Skip if quack or crunch is currently playing!
      const meowKeys = ['mew_short', 'mew_clean', 'mew_kitten'];
      const chosen = meowKeys[Math.floor(Math.random() * meowKeys.length)];
      this.playSample(chosen);
    }

    // NO sound on petting or other interactions
    playAnnooo() {}
    playTouchMew() {}
    playPeekMew() {}
    playShortMew() { this.playRandomMeow(); }
    chirp() {}
    petChin() {}
    petEars() {}
    petBelly() {}
    petPaws() {}
    boop() {}
    startPurr() {}
    stopPurr() {}
    landing() {}
    drinkWater() {}
    meow() { this.playRandomMeow(); }
    fallCry() {}
    yawn() {}
    panic() {}
    playSiteToggle() {}
    playHappyTrust() {}
    playSad() {}
    playWakeUp() {}
    playBrosCooking() {}
    playDropScream() {}
  }

  root.CozyAudioSynthesizer = CozyAudioSynthesizer;
  if (typeof window !== 'undefined') window.CozyAudioSynthesizer = CozyAudioSynthesizer;
  if (typeof globalThis !== 'undefined') globalThis.CozyAudioSynthesizer = CozyAudioSynthesizer;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
