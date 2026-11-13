// Web Audio API synthesizer for instant, zero-latency sound effects and Kahoot-style music
class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicInterval: number | null = null;
  private isMusicPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Play a simple frequency tone
  public playTone(freq: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.15) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
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
    } catch {
      // AudioContext might be blocked before first user gesture
    }
  }

  // Sound: Buzzer / Button Click
  public playBuzzer() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  // Sound: Spinning top whirring & clicking
  public playSpinSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const freqs = [350, 480, 620, 780, 900, 1100, 850, 600];
    freqs.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 0.08, 'triangle', 0.1);
      }, idx * 50);
    });
  }

  // Sound: Correct Answer! Victorious fanfare
  public playCorrect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const chords = [
      { f: 523.25, d: 0.15, delay: 0 },    // C5
      { f: 659.25, d: 0.15, delay: 120 },  // E5
      { f: 783.99, d: 0.18, delay: 240 },  // G5
      { f: 1046.50, d: 0.45, delay: 380 }, // C6
    ];

    chords.forEach(({ f, d, delay }) => {
      setTimeout(() => {
        this.playTone(f, d, 'triangle', 0.25);
        this.playTone(f * 1.5, d, 'sine', 0.1);
      }, delay);
    });
  }

  // Sound: Wrong Answer! Comic wah-wah
  public playWrong() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [
      { f: 380, delay: 0 },
      { f: 340, delay: 180 },
      { f: 300, delay: 360 },
      { f: 240, delay: 540 }
    ];

    notes.forEach(({ f, delay }) => {
      setTimeout(() => {
        this.playTone(f, 0.25, 'sawtooth', 0.15);
      }, delay);
    });
  }

  // Sound: Brinde Ganho! (Bala ou chocolate entregue)
  public playCandyChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [880, 1174, 1318, 1760, 2093];
    notes.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 0.3, 'sine', 0.2);
      }, i * 70);
    });
  }

  // Sound: Countdown Tick
  public playTick(urgent = false) {
    if (this.isMuted) return;
    this.playTone(urgent ? 880 : 440, 0.05, 'square', urgent ? 0.2 : 0.08);
  }

  // Background Kahoot Tension/Countdown Music loop
  public startLobbyMusic() {
    if (this.isMuted || this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.initCtx();

    const bpm = 128;
    const beatInterval = (60 / bpm) * 1000;
    const bassline = [130.81, 130.81, 155.56, 174.61, 130.81, 196.00, 174.61, 155.56]; // C minor groove
    let step = 0;

    this.musicInterval = window.setInterval(() => {
      if (this.isMuted) return;
      const note = bassline[step % bassline.length];
      this.playTone(note, 0.15, 'sawtooth', 0.04);
      if (step % 2 === 0) {
        this.playTone(note * 2, 0.1, 'sine', 0.03);
      }
      step++;
    }, beatInterval / 2);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }
}

export const sound = new SoundManager();
