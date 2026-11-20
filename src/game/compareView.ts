import Phaser from 'phaser';

export type CompareKind = 'stove' | 'quilt' | 'edge' | 'bowl' | 'ripple' | 'asleep';

const TITLE: Record<CompareKind, string> = {
  stove: '灶门',
  quilt: '窗左',
  edge: '床头',
  bowl: '同一窗格',
  ripple: '窗后',
  asleep: '窗里',
};

const NOTE: Record<CompareKind, string> = {
  stove: '两下短。这一条还没断。',
  quilt: '起，落，再起。旁边这一声没有断开。',
  edge: '只看见被木棂截开的亮边。',
  bowl: '木凳上有一只饭碗。人没有翻身。',
  ripple: '自己的碗在旁边。窗里的一圈还在动。',
  asleep: '两个人还睡着。嘴是闭的。',
};

export class CompareView {
  private readonly root: Phaser.GameObjects.Container;
  private readonly marks: Phaser.GameObjects.Graphics;
  private elapsed = 0;

  constructor(
    scene: Phaser.Scene,
    private readonly kind: CompareKind,
    private readonly reduce: boolean,
  ) {
    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(160);
    const card = scene.add.rectangle(960, 430, 920, 460, 0x14110e, 0.96).setStrokeStyle(2, 0xd9c7a4);
    const plateKey =
      kind === 'stove'
        ? 'closeup-stove'
        : kind === 'quilt' || kind === 'asleep'
          ? 'closeup-window-bed'
          : kind === 'edge'
            ? 'closeup-window-lamp'
            : kind === 'bowl' || kind === 'ripple'
              ? 'closeup-bowl-bed'
              : '';
    const bits: Phaser.GameObjects.GameObject[] = [card];
    if (plateKey && scene.textures.exists(plateKey)) {
      bits.push(scene.add.image(760, 430, plateKey).setDisplaySize(360, 320).setDepth(1));
    }
    const tag = scene.add.text(980, 220, '近看', {
      fontFamily: '"Songti SC", serif',
      fontSize: '18px',
      color: '#b5a894',
    });
    const title = scene.add.text(980, 248, TITLE[kind], {
      fontFamily: '"Songti SC", serif',
      fontSize: '32px',
      color: '#f4ecdf',
    });
    const note = scene.add.text(980, 560, NOTE[kind], {
      fontFamily: '"Songti SC", serif',
      fontSize: '24px',
      color: '#e6d7c4',
      wordWrap: { width: 360 },
    });
    this.marks = scene.add.graphics();
    this.root.add([...bits, tag, title, note, this.marks]);
    this.paint();
  }

  tick(delta: number) {
    if (this.reduce) return;
    this.elapsed += delta / 1000;
    this.paint();
  }

  destroy() {
    this.root.destroy();
  }

  private paint() {
    const g = this.marks;
    g.clear();
    if (this.kind === 'stove') this.stove();
    else if (this.kind === 'quilt') this.quilt();
    else if (this.kind === 'edge') this.window(false);
    else if (this.kind === 'bowl') this.window(true);
    else if (this.kind === 'ripple') this.ripple();
    else this.asleep();
  }

  private stove() {
    const g = this.marks;
    const t = this.reduce ? 3.4 : this.elapsed % 4;
    g.fillStyle(0x3a241c, 1);
    g.fillRoundedRect(560, 320, 150, 200, 8);
    g.fillStyle(0x1a100c, 1);
    g.fillRect(590, 360, 90, 120);
    const sparks: Array<[number, number, number]> = [
      [0.35, 620, 390],
      [1.05, 660, 360],
    ];
    sparks.forEach(([at, x, y], index) => {
      const age = t - at;
      const on = this.reduce ? 0.35 : age >= 0 && age < 0.45 ? 1 - age / 0.45 : 0;
      if (on <= 0) return;
      g.fillStyle(0xe28a3a, on);
      g.fillCircle(x + index * 8, y - age * 40, 7);
    });
    this.track(860, 390, t, 3.2, [0.4, 1.05], 0.18);
  }

  private quilt() {
    const g = this.marks;
    const t = this.reduce ? 3.2 : this.elapsed % 4.2;
    g.fillStyle(0x2a3138, 1);
    g.fillRoundedRect(560, 330, 280, 180, 6);
    const lift = this.reduce ? 1 : t < 1.1 ? t / 1.1 : t < 2.2 ? 1 - (t - 1.1) / 1.1 : Math.min(1, (t - 2.2) / 1.1);
    g.fillStyle(0xd9d3c8, 1);
    g.fillRoundedRect(600, 400 - lift * 28, 180, 70, 8);
    g.fillTriangle(760, 400 - lift * 28, 820, 430 - lift * 36, 790, 450);
    g.fillStyle(0x6a6258, 1);
    g.fillCircle(650, 390, 16);
    g.fillCircle(730, 394, 16);
    this.humps(900, 360, t);
    this.track(900, 470, t, 4, [], 0);
  }

  private window(showBowl: boolean) {
    const g = this.marks;
    g.fillStyle(0x243038, 1);
    g.fillRoundedRect(620, 310, 420, 250, 6);
    g.fillStyle(0xf2e2b0, showBowl ? 0.35 : 0.85);
    g.fillRect(700, 360, 70, 120);
    g.fillRect(860, 360, 70, 120);
    g.fillStyle(0x5c4634, 1);
    g.fillRect(770, 330, 14, 210);
    g.fillRect(640, 430, 380, 12);
    if (!showBowl) return;
    g.fillStyle(0x6a5844, 1);
    g.fillRect(860, 470, 70, 10);
    g.fillStyle(0xe7e1d6, 1);
    g.fillEllipse(895, 468, 48, 18);
    g.fillStyle(0xc4552a, 0.9);
    g.fillEllipse(700, 520, 36, 14);
  }

  private ripple() {
    const g = this.marks;
    const t = this.reduce ? 1.1 : this.elapsed % 2.4;
    const aside = this.reduce ? 1 : Math.min(1, t / 0.45);
    g.fillStyle(0x243038, 1);
    g.fillRoundedRect(700, 310, 360, 230, 6);
    g.fillStyle(0x6a5844, 1);
    g.fillRect(900, 450, 64, 10);
    g.fillStyle(0xe7e1d6, 1);
    g.fillEllipse(932, 448, 44, 16);
    const ring = this.reduce ? 1 : Math.max(0, Math.min(1, (t - 0.45) / 0.9));
    if (ring > 0) {
      g.lineStyle(3, 0xd7e4ea, 0.95);
      g.strokeCircle(932, 448, 12 + ring * 18);
      g.strokeCircle(932, 448, 8 + ring * 8);
    }
    g.fillStyle(0xc4552a, 0.95);
    g.fillEllipse(620 - aside * 40, 500, 34, 14);
    const drop = this.reduce ? 1 : Math.max(0, Math.min(1, (t - 0.85) / 0.4));
    g.fillStyle(0xd9d3c8, 1);
    g.fillRoundedRect(760, 360 + drop * 18, 70, 16, 4);
    g.fillStyle(0xd7c7a4, 0.9);
    g.fillRect(1040, 390, 80, 8);
  }

  private asleep() {
    const g = this.marks;
    g.fillStyle(0x243038, 1);
    g.fillRoundedRect(620, 320, 460, 220, 6);
    g.fillStyle(0xd9d3c8, 1);
    g.fillRoundedRect(700, 400, 300, 80, 10);
    g.fillStyle(0x6a6258, 1);
    g.fillCircle(760, 390, 18);
    g.fillCircle(860, 394, 18);
    g.lineStyle(2, 0x2a241e, 1);
    g.lineBetween(752, 394, 768, 394);
    g.lineBetween(852, 398, 868, 398);
  }

  private track(x: number, y: number, t: number, cryEnd: number, sparks: number[], sparkWidth: number) {
    const g = this.marks;
    const scale = 110;
    g.fillStyle(0x2a241e, 1);
    g.fillRoundedRect(x, y, 520, 16, 4);
    g.fillStyle(0xd7c7a4, 0.95);
    const cry = this.reduce ? cryEnd : Math.max(0, Math.min(cryEnd, t));
    g.fillRoundedRect(x, y + 28, cry * scale, 16, 4);
    g.fillStyle(0xe28a3a, 1);
    sparks.forEach((at) => {
      if (!this.reduce && t < at) return;
      g.fillRoundedRect(x + at * scale, y, sparkWidth * scale, 16, 3);
    });
  }

  private humps(x: number, y: number, t: number) {
    const g = this.marks;
    const shown = [this.reduce || t > 0.2, this.reduce || t > 1.3, this.reduce || t > 2.5];
    const up = [true, false, true];
    shown.forEach((on, i) => {
      if (!on) return;
      g.fillStyle(0xd9d3c8, 0.95);
      g.fillRoundedRect(x + i * 48, y + (up[i] ? 0 : 22), 32, 10, 3);
    });
  }
}
