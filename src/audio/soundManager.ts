/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Generic tone generator
  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', gainVal: number = 0.15) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy
    }
  }

  // Attack sounds
  public playAttackSound(moveType: string) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    switch (moveType) {
      case 'fire': {
        // Crackling flame whoosh
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.35);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        break;
      }
      case 'water': {
        // High-pressure hydro splash
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        break;
      }
      case 'electric': {
        // Spark zaps
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(440, now + 0.08);
        osc.frequency.setValueAtTime(980, now + 0.16);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        break;
      }
      case 'grass': {
        // Whip rustle
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        break;
      }
      case 'dragon': {
        // Deep primal pulse
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.45);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.45);
        break;
      }
      default: {
        // Tackle / strike
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      }
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.45);
  }

  // Hit impact
  public playHitSound(isSuperEffective: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isSuperEffective ? 480 : 320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.2);
  }

  // Monster Cry (Procedural sound unique to species)
  public playMonsterCry(speciesId: string) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Derive a unique seed from species name
    let hash = 0;
    for (let i = 0; i < speciesId.length; i++) {
      hash = (hash << 5) - hash + speciesId.charCodeAt(i);
    }
    const baseFreq = 300 + (Math.abs(hash) % 400);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = (Math.abs(hash) % 2 === 0) ? 'sawtooth' : 'triangle';

    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.linearRampToValueAtTime(baseFreq * 1.4, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.35);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.35);
  }

  // Sphere throw
  public playThrowSound() {
    this.playTone(550, 0.18, 'sine', 0.2);
  }

  // Ball wobble click
  public playBallWobble() {
    this.playTone(440, 0.12, 'square', 0.18);
  }

  // Catch Success fanfare!
  public playCatchSuccess() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Classic 4-note victory chime
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.22, 'triangle', 0.25);
      }, idx * 110);
    });
  }

  // Ball breakout
  public playBreakoutSound() {
    this.playTone(180, 0.3, 'sawtooth', 0.3);
  }

  // Evolution dramatic crescendo
  public playEvolutionChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const chords = [392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    chords.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.3, 'sine', 0.2);
      }, idx * 80);
    });
  }

  // UI Button click
  public playClick() {
    this.playTone(700, 0.05, 'sine', 0.08);
  }
}

export const soundManager = new SoundManager();
