/**
 * Cozy Browser Pets - Web Audio Synthesizer
 * Zero-dependency, procedural sound generator for cozy cat meows, purrs, chirps, and eating effects.
 */
(function(root) {
  class CozyAudioSynthesizer {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      this.volume = 0.65;
      this.purrOsc = null;
      this.purrGain = null;
      this.userUnlocked = false;

      // Listen for user gesture to unlock Web Audio API cleanly
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
          try {
            this.ctx = new AudioCtx();
          } catch (e) {}
        }
      }
      if (this.ctx && this.ctx.state === 'suspended' && this.userUnlocked) {
        this.ctx.resume().catch(() => {});
      }
    }

    setMuted(muted) {
      this.isMuted = !!muted;
      if (this.isMuted) {
        this.stopPurr();
      }
    }

    setVolume(vol) {
      this.volume = Math.max(0, Math.min(1, vol));
    }

    // Cute vocalized meow with formant harmonics & pitch envelope
    meow(pitch = 1.0) {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';

      // Pitch glide: starts medium, rises cute, then gently resolves down
      const baseFreq = 540 * pitch;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.45, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, t + 0.38);

      // Formant filter for "m-e-o-w" mouth movement
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(1800, t + 0.15);
      filter.frequency.exponentialRampToValueAtTime(1100, t + 0.38);
      filter.Q.setValueAtTime(3.0, t);

      // Volume envelope
      const maxVol = 0.28 * this.volume;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(maxVol, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.42);
    }

    // High-pitched friendly chirp / greeting mew
    chirp() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(780, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.06);
      osc.frequency.exponentialRampToValueAtTime(950, t + 0.14);

      const maxVol = 0.22 * this.volume;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(maxVol, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.18);
    }

    // Continuous rhythmic low-frequency rumble purr
    startPurr(duration = 2.5) {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      this.stopPurr();

      const t = this.ctx.currentTime;
      const carrier = this.ctx.createOscillator();
      const modulator = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      const masterGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Low frequency vibration (~28Hz feline purr fundamental)
      carrier.type = 'sawtooth';
      carrier.frequency.setValueAtTime(32, t);

      // Amplitude modulation (~24Hz breath pulsing)
      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(24, t);

      modGain.gain.setValueAtTime(18, t);
      modulator.connect(carrier.frequency);

      // Lowpass filter to keep it warm and rumbling
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, t);

      const maxVol = 0.15 * this.volume;
      masterGain.gain.setValueAtTime(0.001, t);
      masterGain.gain.linearRampToValueAtTime(maxVol, t + 0.3);
      masterGain.gain.setValueAtTime(maxVol, t + duration - 0.4);
      masterGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      carrier.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(this.ctx.destination);

      carrier.start(t);
      modulator.start(t);
      carrier.stop(t + duration + 0.1);
      modulator.stop(t + duration + 0.1);

      this.purrOsc = carrier;
      this.purrGain = masterGain;
    }

    stopPurr() {
      if (this.purrGain && this.ctx) {
        try {
          this.purrGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        } catch (e) {}
      }
      this.purrOsc = null;
      this.purrGain = null;
    }

    // Playful bubbly trill when belly is tickled
    tickleTrill() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        const offset = t + i * 0.05;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const f = 680 + i * 90 + Math.random() * 40;
        osc.frequency.setValueAtTime(f, offset);
        osc.frequency.exponentialRampToValueAtTime(f * 1.3, offset + 0.04);

        const maxVol = 0.16 * this.volume;
        gain.gain.setValueAtTime(0.001, offset);
        gain.gain.linearRampToValueAtTime(maxVol, offset + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, offset + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(offset);
        osc.stop(offset + 0.06);
      }
    }

    // Cute sleepy yawn
    yawn() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, t);
      osc.frequency.exponentialRampToValueAtTime(380, t + 0.7);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, t);

      const maxVol = 0.18 * this.volume;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(maxVol, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.8);
    }

    // Crunchy munch sound when eating a treat
    snack() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const offset = t + i * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(400 + Math.random() * 200, offset);
        osc.frequency.exponentialRampToValueAtTime(150, offset + 0.05);

        const maxVol = 0.12 * this.volume;
        gain.gain.setValueAtTime(maxVol, offset);
        gain.gain.exponentialRampToValueAtTime(0.001, offset + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(offset);
        osc.stop(offset + 0.06);
      }
    }

    // Soft thud landing bounce
    landing() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

      const maxVol = 0.2 * this.volume;
      gain.gain.setValueAtTime(maxVol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.15);
    }

    // Startled / annoyed cat hiss
    hiss() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.4;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, t);
      filter.Q.setValueAtTime(2.5, t);

      const gain = this.ctx.createGain();
      const maxVol = 0.22 * this.volume;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(maxVol, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
    }

    // Startled bonk / flinch squeak
    bonk() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(850, t + 0.04);
      osc.frequency.exponentialRampToValueAtTime(280, t + 0.14);

      const maxVol = 0.25 * this.volume;
      gain.gain.setValueAtTime(maxVol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.16);
    }

    // Tiny surprise squeak
    panic() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, t);
      osc.frequency.exponentialRampToValueAtTime(1350, t + 0.08);

      const maxVol = 0.16 * this.volume;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(maxVol, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.12);
    }

    // Tiny magical metallic bell chime
    bellChime() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      [1800, 2400, 3600].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        const maxVol = (0.09 / (i + 1)) * this.volume;
        gain.gain.setValueAtTime(maxVol, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55 + i * 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.7);
      });
    }
  }

  root.CozyAudioSynthesizer = CozyAudioSynthesizer;
  if (typeof window !== 'undefined') window.CozyAudioSynthesizer = CozyAudioSynthesizer;
  if (typeof globalThis !== 'undefined') globalThis.CozyAudioSynthesizer = CozyAudioSynthesizer;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
