// Audio synthesis using browser Web Audio API (Zero external assets, 100% reliable)

export type SoundType = 'push' | 'bus_approach' | 'sos_alert' | 'absence_alert' | 'qr_scan';

class SoundEffectsService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private unlocked: boolean = false;

  constructor() {
    this.setupMobileAudioUnlock();
  }

  private setupMobileAudioUnlock() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      if (this.unlocked && this.ctx?.state === 'running') return;
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        void ctx.resume().then(() => {
          this.unlocked = true;
        }).catch(() => {});
      } else {
        this.unlocked = true;
      }
      // Play a silent 1-sample buffer to unlock iOS Safari Web Audio
      try {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch {
        // Ignore if context is not ready yet
      }
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public play(type: SoundType) {
    if (!this.soundEnabled) return;

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        void ctx
          .resume()
          .then(() => this.playWithContext(ctx, type))
          .catch(() => {});
        return;
      }

      this.playWithContext(ctx, type);
    } catch (err) {
      console.warn('Audio synthesis error:', err);
    }
  }

  private playWithContext(ctx: AudioContext, type: SoundType) {
    try {
      const now = ctx.currentTime;

      // Trigger mobile vibration if available
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        if (type === 'sos_alert') {
          navigator.vibrate([250, 100, 250, 100, 400]);
        } else if (type === 'bus_approach') {
          navigator.vibrate([150, 80, 150]);
        } else {
          navigator.vibrate(80);
        }
      }

      switch (type) {
        case 'push': {
          // Modern Apple/Google-style two-tone friendly chime (587Hz D5 -> 880Hz A5)
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(587.33, now); // D5
          osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(880, now + 0.08);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now + 0.08);
          osc1.stop(now + 0.45);
          osc2.stop(now + 0.45);
          break;
        }

        case 'bus_approach': {
          // Cheerful 3-tone arpeggio arrival bell (C5 523Hz -> E5 659Hz -> G5 784Hz -> C6 1046Hz)
          const notes = [523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = now + idx * 0.1;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.35, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(start);
            osc.stop(start + 0.35);
          });
          break;
        }

        case 'sos_alert': {
          // Urgent warning dual-tone siren alarm (Alternating 850Hz & 620Hz, repeated 3 times)
          for (let i = 0; i < 3; i++) {
            const t = now + i * 0.22;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(880, t);
            osc.frequency.setValueAtTime(587, t + 0.11);

            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.21);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(t);
            osc.stop(t + 0.22);
          }
          break;
        }

        case 'absence_alert': {
          // Distinctive double notice tone (Notice for driver: 440Hz A4 -> 349Hz F4)
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(440, now);
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(349.23, now + 0.15);

          gain.gain.setValueAtTime(0.35, now);
          gain.gain.setValueAtTime(0.35, now + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc1.stop(now + 0.15);
          osc2.start(now + 0.15);
          osc2.stop(now + 0.5);
          break;
        }

        case 'qr_scan': {
          // Sharp positive check-in ding (High clean chime 1174Hz D6)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(1174.66, now);

          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.3);
          break;
        }
      }
    } catch (err) {
      console.warn('Audio synthesis error:', err);
    }
  }
}

export const soundEffects = new SoundEffectsService();

export function playNotificationSound(type: SoundType) {
  soundEffects.play(type);
}
