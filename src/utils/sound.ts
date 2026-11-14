// Audio manager with real human-composed MP3 background tracks and Web Audio API sound effects
const MUSIC_TRACK_URLS: Record<1 | 2 | 3, string> = {
  1: '/music/track1.mp3', // Lobby Time (Jazz Lounge)
  2: '/music/track2.mp3', // Funkorama (Upbeat Funk Groove)
  3: '/music/track3.mp3', // Bossa Antigua (Bossa Nova Lounge)
};

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicEnabled: boolean = true;
  private isMusicPlaying: boolean = false;
  private bgAudio: HTMLAudioElement | null = null;
  private musicTrack: 1 | 2 | 3 = 1;
  private musicVolume: number = 0.35;

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
        } else if (savedTrack === '3') {
          this.musicTrack = 3;
        }
        const savedVol = localStorage.getItem('arenaquiz_music_volume');
        if (savedVol !== null) {
          const parsed = parseFloat(savedVol);
          if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 1) {
            this.musicVolume = parsed;
          }
        }
      } catch {}
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private ensureBgAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return null;
    const targetSrc = MUSIC_TRACK_URLS[this.musicTrack];
    if (!this.bgAudio) {
      this.bgAudio = new Audio(targetSrc);
      this.bgAudio.loop = true;
      this.bgAudio.preload = 'auto';
    } else if (!this.bgAudio.src.endsWith(targetSrc)) {
      this.bgAudio.pause();
      this.bgAudio.src = targetSrc;
      this.bgAudio.loop = true;
    }
    this.bgAudio.volume = this.isMuted ? 0 : this.musicVolume;
    return this.bgAudio;
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

  // Play a simple frequency tone for UI sound effects
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

  // Sound: Novo Jogador Entrou
  public playPlayerJoined() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.playTone(587.33, 0.12, 'sine', 0.16);
    setTimeout(() => this.playTone(880, 0.18, 'sine', 0.18), 80);
  }

  // Sound: Countdown Tick
  public playTick(urgent = false) {
    if (this.isMuted) return;
    this.playTone(urgent ? 880 : 440, 0.05, 'square', urgent ? 0.2 : 0.08);
  }

  // Play real human-composed MP3 background music
  public startLobbyMusic() {
    if (this.isMuted || !this.isMusicEnabled) return;
    const audio = this.ensureBgAudio();
    if (!audio) return;

    audio.volume = this.musicVolume;
    audio
      .play()
      .then(() => {
        this.isMusicPlaying = true;
      })
      .catch(() => {
        this.isMusicPlaying = false;
      });
  }

  public getMusicTrack(): 1 | 2 | 3 {
    return this.musicTrack;
  }

  public toggleMusicTrack(): 1 | 2 | 3 {
    this.musicTrack = this.musicTrack === 1 ? 2 : this.musicTrack === 2 ? 3 : 1;
    try {
      localStorage.setItem('arenaquiz_music_track', String(this.musicTrack));
    } catch {}
    if (this.bgAudio) {
      this.bgAudio.pause();
      this.bgAudio.src = MUSIC_TRACK_URLS[this.musicTrack];
      this.bgAudio.currentTime = 0;
    }
    if (this.isMusicEnabled && !this.isMuted) {
      this.startLobbyMusic();
    }
    return this.musicTrack;
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setMusicVolume(volume: number): number {
    const clamped = Math.max(0, Math.min(1, volume));
    this.musicVolume = clamped;
    try {
      localStorage.setItem('arenaquiz_music_volume', String(clamped));
    } catch {}
    if (this.bgAudio) {
      this.bgAudio.volume = this.isMuted ? 0 : clamped;
    }
    return clamped;
  }

  public stopMusic() {
    if (this.bgAudio) {
      this.bgAudio.pause();
    }
    this.isMusicPlaying = false;
  }
}

export const sound = new SoundManager();
