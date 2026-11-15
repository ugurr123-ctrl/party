// Web Audio API Sound Synthesizer & Haptics Engine - 100% offline, zero external dependencies

export type CountdownToneType = 'klasik' | 'kalp' | 'retro';
export type HapticIntensity = 'light' | 'medium' | 'heavy';

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.85; // %85 default matching Stitch spec
  public sfxEnabled: boolean = true;
  public countdownEnabled: boolean = true;
  public countdownTone: CountdownToneType = 'klasik';
  public fanfareEnabled: boolean = true;
  public hapticsEnabled: boolean = true;
  public hapticIntensity: HapticIntensity = 'medium';

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        this.ctx.resume().catch(() => {});
      } catch {
        // ignore
      }
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public toggleSound(): boolean {
    this.enabled = !this.enabled;
    this.sfxEnabled = this.enabled;
    if (this.enabled) {
      this.playTone(600, 0.08, 'sine');
    }
    return this.enabled;
  }

  public vibrate(pattern: number | number[]) {
    if (!this.hapticsEnabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      const multiplier =
        this.hapticIntensity === 'light' ? 0.6 : this.hapticIntensity === 'heavy' ? 1.5 : 1.0;
      if (Array.isArray(pattern)) {
        const scaled = pattern.map((ms, idx) => (idx % 2 === 0 ? Math.round(ms * multiplier) : ms));
        navigator.vibrate(scaled);
      } else {
        navigator.vibrate(Math.round(pattern * multiplier));
      }
    } catch {
      // ignore
    }
  }

  public triggerHaptic(type: 'tap' | 'tick' | 'touch' | 'drop' | 'win' | 'success' | 'alert' | 'urgent' = 'tap') {
    if (!this.hapticsEnabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      const multiplier =
        this.hapticIntensity === 'light' ? 0.6 : this.hapticIntensity === 'heavy' ? 1.5 : 1.0;

      switch (type) {
        case 'tick':
          navigator.vibrate(Math.round(15 * multiplier));
          break;
        case 'touch':
          navigator.vibrate(Math.round(20 * multiplier));
          break;
        case 'tap':
          navigator.vibrate(Math.round(30 * multiplier));
          break;
        case 'drop':
          // Tactile double-pulse feedback when dropping a finger
          navigator.vibrate([Math.round(45 * multiplier), 35, Math.round(65 * multiplier)]);
          break;
        case 'urgent':
          // Urgent double pulse for last seconds
          navigator.vibrate([Math.round(35 * multiplier), 25, Math.round(35 * multiplier)]);
          break;
        case 'win':
        case 'success':
          // Celebratory rhythmic burst for winning games or finger lottery
          navigator.vibrate([
            Math.round(50 * multiplier),
            40,
            Math.round(80 * multiplier),
            40,
            Math.round(150 * multiplier),
            60,
            Math.round(200 * multiplier)
          ]);
          break;
        case 'alert':
          // Strong alert vibration
          navigator.vibrate([Math.round(100 * multiplier), 50, Math.round(180 * multiplier)]);
          break;
        default:
          navigator.vibrate(Math.round(25 * multiplier));
      }
    } catch {
      // ignore
    }
  }

  public playTone(freq = 440, duration = 0.1, type: OscillatorType = 'sine', vol = 0.15) {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const effectiveVol = vol * this.volume;
      gain.gain.setValueAtTime(effectiveVol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio safeguard
    }
  }

  // Tıklama sesi
  public playClick() {
    this.triggerHaptic('tap');
    this.playTone(850, 0.04, 'sine', 0.1);
  }

  // Çark tıkırtısı (Needle tick)
  public playWheelTick() {
    this.triggerHaptic('tick');
    this.playTone(520, 0.03, 'triangle', 0.12);
  }

  // Geri sayım bipi (Özelleştirilmiş tonlar: Klasik, Kalp Atışı, Retro Arcade)
  public playCountdown(customTone?: CountdownToneType) {
    if (!this.countdownEnabled) return;
    this.triggerHaptic('tick');

    const toneToUse = customTone || this.countdownTone;

    if (toneToUse === 'kalp') {
      // Derin Nabız (Double thump)
      this.playTone(85, 0.08, 'sine', 0.25);
      setTimeout(() => this.playTone(70, 0.12, 'sine', 0.2), 90);
    } else if (toneToUse === 'retro') {
      // 8-Bit Retro Arcade
      this.playTone(660, 0.04, 'square', 0.12);
      setTimeout(() => this.playTone(880, 0.05, 'square', 0.12), 40);
    } else {
      // Klasik Tik-Tak (1.0s Ritim)
      this.playTone(600, 0.07, 'triangle', 0.18);
    }
  }

  // 5 Saniye sayacı son uyarısı
  public playBuzzer() {
    this.triggerHaptic('alert');
    this.playTone(180, 0.35, 'sawtooth', 0.25);
  }

  // Zar sallama efekti
  public playDiceRoll() {
    if (!this.enabled || !this.sfxEnabled) return;
    this.triggerHaptic('tap');
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playTone(300 + Math.random() * 200, 0.04, 'triangle', 0.1);
      }, i * 60);
    }
  }

  // Yazı tura şıngırtısı
  public playCoinFlip() {
    if (!this.enabled || !this.sfxEnabled) return;
    this.triggerHaptic('tap');
    this.playTone(1200, 0.06, 'sine', 0.15);
    setTimeout(() => this.playTone(1400, 0.12, 'triangle', 0.12), 80);
  }

  // Zafer melodisi (Fanfare)
  public playVictory() {
    if (!this.enabled || !this.fanfareEnabled) return;
    this.triggerHaptic('win');
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.18, 'triangle', 0.16);
      }, idx * 100);
    });
  }

  // Başarı / Level Up
  public playSuccess() {
    this.triggerHaptic('success');
    this.playTone(523.25, 0.08, 'sine', 0.15);
    setTimeout(() => this.playTone(659.25, 0.12, 'sine', 0.15), 90);
  }

  // Parmak teması sesi
  public playFingerTouch() {
    if (!this.enabled || !this.sfxEnabled) return;
    this.triggerHaptic('touch');
    this.playTone(680, 0.05, 'sine', 0.12);
  }

  // Parmak kazanan melodisi
  public playFingerWinner() {
    if (!this.enabled || !this.fanfareEnabled) return;
    this.triggerHaptic('win');
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 0.22, 'triangle', 0.18);
      }, i * 90);
    });
  }

  // Absürt Gülmeme Tuzağı Sesleri (Slide horn, wobble, duck honk)
  public playAbsurdSound(): string {
    if (!this.enabled || !this.sfxEnabled) return '🐐 Keçi Bağırması';
    this.triggerHaptic('urgent');
    try {
      this.init();
      if (!this.ctx) return '🐐 Keçi Bağırması';

      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        // Slide Boing
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.24 * this.volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.38);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.38);
        return '🐐 Absürt Yay / Boing Efekti';
      } else if (type === 1) {
        // Clown Honk / Duck
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(420, this.ctx.currentTime);
        osc.frequency.setValueAtTime(540, this.ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.22 * this.volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.28);
        return '🦆 Çılgın Ördek / Palyaço Kornası';
      } else {
        // Wobble Fart / Tremolo
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.32);
        gain.gain.setValueAtTime(0.25 * this.volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
        return '🎺 Titreşimli Komik Boru Sesi';
      }
    } catch {
      return '🐐 Keçi Bağırması Efekti';
    }
  }
}

export const soundEngine = new SoundEngine();
