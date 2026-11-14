// Web Audio API synthesizer for instant, zero-latency sound effects and Kahoot-style music
class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicEnabled: boolean = true;
  private musicInterval: number | null = null;
  private isMusicPlaying: boolean = false;
  private musicGain: GainNode | null = null;
  private musicTrack: 1 | 2 = 1;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedMusic = localStorage.getItem('arenaquiz_bg_music');
        if (savedMusic === 'false') {
          this.isMusicEnabled = false;
        }
        const savedTrack = localStorage.getItem('arenaquiz_music_track');
        if (savedTrack === '2') {
          this.musicTrack = 2;
        }
      } catch {}
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.ctx && !this.musicGain) {
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.32, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else if (this.isMusicEnabled) {
      this.startLobbyMusic();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getMusicEnabled(): boolean {
    return this.isMusicEnabled;
  }

  public toggleMusic(): boolean {
    this.isMusicEnabled = !this.isMusicEnabled;
    try {
      localStorage.setItem('arenaquiz_bg_music', String(this.isMusicEnabled));
    } catch {}

    if (this.isMusicEnabled && !this.isMuted) {
      this.startLobbyMusic();
    } else {
      this.stopMusic();
    }
    return this.isMusicEnabled;
  }

  public unlockAndStartMusic() {
    this.initCtx();
    if (this.isMusicEnabled && !this.isMuted && !this.isMusicPlaying) {
      this.startLobbyMusic();
    }
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

  // Soft enveloped tone routed through musicGain for pleasant background music
  private playMusicNote(freq: number, duration: number, type: OscillatorType, peakGain: number) {
    if (this.isMuted || !this.isMusicEnabled || !this.ctx || !this.musicGain) return;
    if (this.ctx.state === 'suspended') return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(peakGain, now + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(env);
      env.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {}
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
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const now = this.ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.14, offset: 0 },    // C5
      { f: 659.25, d: 0.14, offset: 0.11 }, // E5
      { f: 783.99, d: 0.16, offset: 0.22 }, // G5
      { f: 1046.50, d: 0.42, offset: 0.34 }, // C6
    ];

    notes.forEach(({ f, d, offset }) => {
      if (!this.ctx) return;
      try {
        const start = now + offset;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const env = this.ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(f, start);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(f * 1.5, start);

        env.gain.setValueAtTime(0.0001, start);
        env.gain.linearRampToValueAtTime(0.22, start + 0.015);
        env.gain.exponentialRampToValueAtTime(0.0001, start + d);

        osc1.connect(env);
        osc2.connect(env);
        env.connect(this.ctx.destination);

        osc1.start(start);
        osc2.start(start);
        osc1.stop(start + d + 0.02);
        osc2.stop(start + d + 0.02);
      } catch {}
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

  // Pleasant upbeat background music loop (Track 1: Lo-Fi Groove, Track 2: Arcade Synthwave)
  public startLobbyMusic() {
    if (this.isMuted || !this.isMusicEnabled || this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.initCtx();

    const isTrack2 = this.musicTrack === 2;
    const stepMs = isTrack2 ? 210 : 260;

    // Track 1: Cmaj7 -> Am7 -> Fmaj7 -> G6
    // Track 2: Em -> C -> G -> D (energetic arcade)
    const bassPattern = isTrack2
      ? [
          164.81, 164.81, 246.94, 0, // E3
          130.81, 130.81, 196.00, 0, // C3
          196.00, 196.00, 293.66, 0, // G3
          146.83, 146.83, 220.00, 0, // D3
        ]
      : [
          130.81, 0, 196.00, 0, // C3, G3
          110.00, 0, 164.81, 0, // A2, E3
          87.31,  0, 130.81, 0, // F2, C3
          98.00,  0, 146.83, 0, // G2, D3
        ];

    const melodyPattern = isTrack2
      ? [
          659.25, 783.99, 987.77, 783.99, // E5 G5 B5 G5
          523.25, 659.25, 783.99, 659.25, // C5 E5 G5 E5
          587.33, 783.99, 987.77, 783.99, // D5 G5 B5 G5
          587.33, 739.99, 880.00, 739.99, // D5 F#5 A5 F#5
        ]
      : [
          523.25, 659.25, 783.99, 659.25, // C5 E5 G5 E5
          440.00, 523.25, 659.25, 523.25, // A4 C5 E5 C5
          349.23, 440.00, 523.25, 659.25, // F4 A4 C5 E5
          392.00, 493.88, 587.33, 493.88, // G4 B4 D5 B4
        ];

    const padRoots = isTrack2
      ? [329.63, 261.63, 392.00, 293.66] // E4, C4, G4, D4
      : [261.63, 220.00, 174.61, 196.00]; // C4, A3, F3, G3

    let step = 0;

    this.musicInterval = window.setInterval(() => {
      if (this.isMuted || !this.isMusicEnabled) return;
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
        return;
      }

      const idx = step % 16;
      const bass = bassPattern[idx];
      const mel = melodyPattern[idx];

      if (bass > 0) {
        this.playMusicNote(bass, isTrack2 ? 0.18 : 0.24, 'triangle', isTrack2 ? 0.065 : 0.08);
      }
      if (mel > 0) {
        this.playMusicNote(mel, isTrack2 ? 0.16 : 0.2, isTrack2 ? 'triangle' : 'sine', isTrack2 ? 0.045 : 0.055);
      }
      if (idx % 4 === 0) {
        const root = padRoots[Math.floor(idx / 4)];
        this.playMusicNote(root, 0.75, 'sine', 0.032);
      }

      step++;
    }, stepMs);
  }

  public getMusicTrack(): 1 | 2 {
    return this.musicTrack;
  }

  public toggleMusicTrack(): 1 | 2 {
    this.musicTrack = this.musicTrack === 1 ? 2 : 1;
    try {
      localStorage.setItem('arenaquiz_music_track', String(this.musicTrack));
    } catch {}
    if (this.isMusicPlaying) {
      this.stopMusic();
      this.startLobbyMusic();
    }
    return this.musicTrack;
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
