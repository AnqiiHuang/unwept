import type { SoundId } from '../core/lines';

export class AudioBus {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  volume = 0.8;

  ensure(volume: number) {
    this.volume = volume;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!this.ctx) {
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
    }
    if (this.master) this.master.gain.value = volume;
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.master) this.master.gain.value = volume;
  }

  play(id: SoundId | 'room' | 'mud') {
    if (!this.ctx || !this.master || this.volume <= 0.001) return;
    const t = this.ctx.currentTime;
    const tone = (freq: number, dur: number, type: OscillatorType, gain: number, delay = 0) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t + delay);
      g.gain.setValueAtTime(0.0001, t + delay);
      g.gain.exponentialRampToValueAtTime(gain, t + delay + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + delay + dur);
      osc.connect(g);
      g.connect(this.master!);
      osc.start(t + delay);
      osc.stop(t + delay + dur + 0.02);
    };
    const noise = (dur: number, gain: number, delay = 0) => {
      const count = Math.floor(this.ctx!.sampleRate * dur);
      const buffer = this.ctx!.createBuffer(1, count, this.ctx!.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < count; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / count);
      const src = this.ctx!.createBufferSource();
      src.buffer = buffer;
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 900;
      const g = this.ctx!.createGain();
      g.gain.value = gain;
      src.connect(filter);
      filter.connect(g);
      g.connect(this.master!);
      src.start(t + delay);
    };
    if (id === 'scrape') noise(0.18, 0.25);
    else if (id === 'ceramic') tone(540, 0.12, 'sine', 0.05);
    else if (id === 'ripple-sparse') tone(310, 0.45, 'sine', 0.04);
    else if (id === 'ripple-dense') {
      tone(420, 0.18, 'sine', 0.04);
      tone(510, 0.18, 'sine', 0.03, 0.16);
      tone(620, 0.22, 'sine', 0.03, 0.3);
    }
    else if (id === 'swallow') tone(180, 0.2, 'triangle', 0.05);
    else if (id === 'pour') noise(0.35, 0.12);
    else if (id === 'wind' || id === 'room') noise(0.5, id === 'wind' ? 0.08 : 0.04);
    else if (id === 'sing') tone(392, 0.35, 'triangle', 0.05);
    else if (id === 'continue') tone(330, 0.55, 'sine', 0.04);
    else if (id === 'cloth') noise(0.12, 0.08);
    else if (id === 'key') tone(880, 0.08, 'square', 0.02);
    else if (id === 'wick') {
      tone(520, 0.2, 'triangle', 0.03);
      tone(390, 0.45, 'sine', 0.04, 0.18);
    }
    else if (id === 'cry') tone(240, 0.7, 'sine', 0.035);
    else if (id === 'mud') noise(0.16, 0.1);
  }
}

export const audio = new AudioBus();
