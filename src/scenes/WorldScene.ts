import Phaser from 'phaser';
import { apply, journalStatus, objective, travelBlock, type Action, type ApplyResult, type ClothId, type SceneId } from '../core/state';
import { EVIDENCE, ITEM_TEXT, LINES, NOTES, SPEAKER_NAME, TRAVEL_HINT, type Line, type Speaker } from '../core/lines';
import { runBody, runBook, runCommission, runGong, runLamp, runRite, runTestimony, type HallUi } from '../data/hallAfter';
import { audio } from '../game/audio';
import { createActor, setBowl, syncActor } from '../game/actors';
import { FOOT, LAYOUT } from '../game/layout';
import { commit, getSettings, getState, setSettings, setState } from '../game/session';
import { paintHall, paintPro01, paintPro02 } from '../game/scenery';
import { FONT, makeButton, textStyle } from '../ui/widgets';

type Mode = 'play' | 'dialog' | 'choice' | 'panel' | 'pause' | 'script';

interface Spot {
  id: string;
  x: number;
  range: number;
  label: string;
  available: () => boolean;
  use: () => void;
}

const PORTRAIT: Partial<Record<Speaker, number>> = {
  xiaoman: 0x7e93a4,
  changgui: 0x6a6258,
  guyu: 0xc4b09a,
  guifen: 0x8d6f66,
  jianjun: 0x4e5960,
  xiulan: 0x8a8478,
};

export class WorldScene extends Phaser.Scene {
  private mode: Mode = 'script';
  private modeBefore: Mode = 'play';
  private alive = true;
  private facing: 1 | -1 = 1;
  private minX = 0;
  private maxX = 0;
  private worldW = 1920;
  private player!: Phaser.GameObjects.Container;
  private targetX: number | null = null;
  private pending: string | null = null;
  private moving = false;
  private bowlHigh = false;
  private wetAt = 0;
  private focus = -1;
  private spots: Spot[] = [];
  private markers: Phaser.GameObjects.Container[] = [];
  private props!: Phaser.GameObjects.Graphics;
  private objectiveText!: Phaser.GameObjects.Text;
  private helpText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private captionText!: Phaser.GameObjects.Text;
  private dialogRoot?: Phaser.GameObjects.Container;
  private dialogLines: readonly Line[] = [];
  private dialogIndex = 0;
  private dialogResolve: (() => void) | null = null;
  private dialogHidden = false;
  private choiceRoot?: Phaser.GameObjects.Container;
  private choiceOptions: { id: string; label: string }[] = [];
  private choiceIndex = 0;
  private choiceResolve: ((id: string) => void) | null = null;
  private panelRoot?: Phaser.GameObjects.Container;
  private panelResolve: (() => void) | null = null;
  private bundleTexts: Phaser.GameObjects.Text[] = [];
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private sceneId: SceneId = 'PRO-01';
  private metLatch = false;

  constructor() {
    super('world');
  }

  create() {
    this.alive = true;
    this.markers = [];
    this.spots = [];
    this.bundleTexts = [];
    this.targetX = null;
    this.pending = null;
    this.metLatch = false;
    this.focus = -1;
    this.dialogRoot = undefined;
    this.choiceRoot = undefined;
    this.panelRoot = undefined;
    this.sceneId = getState().scene;
    this.facing = getState().facing;
    const area = this.sceneId === 'PRO-01' ? LAYOUT.pro01 : this.sceneId === 'PRO-02' ? LAYOUT.pro02 : LAYOUT.hall;
    this.worldW = area.world;
    this.minX = area.minX;
    this.maxX = area.maxX;
    if (this.sceneId === 'PRO-01') paintPro01(this);
    else if (this.sceneId === 'PRO-02') paintPro02(this);
    else paintHall(this);

    this.props = this.add.graphics().setDepth(12);
    this.player = createActor(this, 'xiaoman').setDepth(20);
    this.player.setPosition(getState().x, FOOT);
    this.player.scaleX = this.facing;
    if (this.sceneId === 'PRO-01') {
      createActor(this, 'changgui').setPosition(LAYOUT.pro01.changgui, FOOT).setDepth(16);
      createActor(this, 'guyu').setPosition(LAYOUT.pro01.stake + 70, FOOT).setDepth(16);
      this.buildPro01();
    } else if (this.sceneId === 'PRO-02') {
      createActor(this, 'guifen').setPosition(LAYOUT.pro02.guifen, FOOT).setDepth(16);
      createActor(this, 'guyu').setPosition(LAYOUT.pro02.guifen - 180, FOOT).setDepth(16);
      this.buildPro02();
    } else {
      createActor(this, 'guifen').setPosition(LAYOUT.hall.guifen, FOOT).setDepth(16);
      createActor(this, 'guyu').setPosition(LAYOUT.hall.guyu, FOOT).setDepth(16);
      createActor(this, 'jianjun').setPosition(LAYOUT.hall.jianjun, FOOT).setDepth(16);
      this.buildHall();
    }
    this.spots.forEach((spot) => this.markers.push(this.makeMarker(spot)));

    this.cameras.main.setBounds(0, 0, this.worldW, 1080);
    this.cameras.main.startFollow(this.player, true, 0.16, 1);
    this.cameras.main.fadeIn(350, 12, 10, 8);

    this.objectiveText = this.add.text(36, 78, '', textStyle(24, '#f4ecdf')).setScrollFactor(0).setDepth(80);
    this.helpText = this.add.text(36, 118, 'A/D 或左右移动 · 点地面走路 · E 调查 · Tab 热点 · I 物品 · J 笔记 · B 换手端碗 · Esc 暂停', textStyle(22, '#f0e6d6')).setScrollFactor(0).setDepth(80);
    this.promptText = this.add.text(36, 152, '', textStyle(24, '#f7e7c2')).setScrollFactor(0).setDepth(80);
    this.captionText = this.add.text(960, 150, '', textStyle(28, '#f7f1e6')).setOrigin(0.5).setScrollFactor(0).setDepth(90).setAlpha(0);

    const bag = makeButton(this, 1500, 48, 140, 48, '物品', () => this.openInventory());
    const note = makeButton(this, 1660, 48, 140, 48, '笔记', () => this.openJournal());
    const pause = makeButton(this, 1820, 48, 140, 48, '暂停', () => this.openPause());
    [bag, note, pause].forEach((b) => b.root.setScrollFactor(0).setDepth(100));

    this.input.topOnly = true;
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
      audio.ensure(getSettings().master);
      if (this.mode !== 'play') return;
      if (over.length > 0) return;
      this.onGround(pointer);
    });
    const kb = this.input.keyboard;
    if (kb) {
      kb.addCapture(['TAB', 'SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT']);
      this.keys = kb.addKeys('A,D,LEFT,RIGHT,E,ENTER,SPACE,TAB,I,J,ESC,ONE,TWO,THREE,FOUR,B') as Record<string, Phaser.Input.Keyboard.Key>;
    }
    this.syncProps();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.alive = false;
    });
    void this.bootstrap();
  }

  update(_t: number, delta: number) {
    if (!this.alive) return;
    const dt = delta / 1000;
    this.readKeys();
    if (this.mode === 'play') this.move(dt);
    this.player.y = FOOT + (this.moving && !getSettings().reduceMotion ? Math.sin(this.time.now / 90) * 4 : 0);
    this.player.scaleX = this.facing;
    syncActor(this.player, this.moving, this.time.now, this.bowlHigh);
    this.syncMarkers();
    this.objectiveText.setText(objective(getState()));
    this.helpText.setVisible(this.mode === 'play');
    this.promptText.setVisible(this.mode === 'play');
    if (this.sceneId === 'PRO-01' && this.mode === 'play' && getState().pro01Intro && !getState().chestAside && !this.metLatch) {
      if (Math.abs(this.player.x - LAYOUT.pro01.stake) < 160) void this.guyuMeet();
    }
  }

  private readKeys() {
    const down = (name: string) => this.keys?.[name] && Phaser.Input.Keyboard.JustDown(this.keys[name]);
    if (down('ESC')) {
      if (this.mode === 'dialog') this.advanceDialog();
      else if (this.mode === 'panel' || this.mode === 'pause') this.closePanel();
      else if (this.mode === 'play') this.openPause();
      return;
    }
    if (this.mode === 'dialog' && (down('E') || down('ENTER') || down('SPACE'))) {
      this.advanceDialog();
      return;
    }
    if (this.mode === 'choice') {
      if (down('LEFT') || down('A')) this.choiceIndex = (this.choiceIndex + this.choiceOptions.length - 1) % this.choiceOptions.length;
      if (down('RIGHT') || down('D')) this.choiceIndex = (this.choiceIndex + 1) % this.choiceOptions.length;
      const nums = ['ONE', 'TWO', 'THREE', 'FOUR'];
      nums.forEach((name, i) => {
        if (down(name) && this.choiceOptions[i]) this.pickChoice(this.choiceOptions[i].id);
      });
      if (down('E') || down('ENTER') || down('SPACE')) {
        const option = this.choiceOptions[this.choiceIndex];
        if (option) this.pickChoice(option.id);
      }
      this.paintChoiceCursor();
      return;
    }
    if (this.mode !== 'play') return;
    if (down('E') || down('ENTER')) this.interactFocused();
    if (down('TAB')) this.cycle();
    if (down('I')) this.openInventory();
    if (down('J')) this.openJournal();
    if (down('B')) this.bowlHigh = !this.bowlHigh;
  }

  private move(dt: number) {
    if (!this.keys) return;
    let dir = 0;
    if (this.keys.A?.isDown || this.keys.LEFT?.isDown) dir -= 1;
    if (this.keys.D?.isDown || this.keys.RIGHT?.isDown) dir += 1;
    const speed = 320;
    if (dir !== 0) {
      this.targetX = null;
      this.pending = null;
      this.facing = dir as 1 | -1;
      this.step(dir * speed * dt);
      this.moving = true;
      return;
    }
    if (this.targetX != null) {
      const dx = this.targetX - this.player.x;
      if (Math.abs(dx) <= 6) {
        this.player.x = this.targetX;
        this.targetX = null;
        this.moving = false;
        const id = this.pending;
        this.pending = null;
        if (id) {
          const spot = this.spots.find((s) => s.id === id);
          if (spot && spot.available() && Math.abs(this.player.x - spot.x) <= spot.range) spot.use();
        }
        return;
      }
      this.facing = (Math.sign(dx) || 1) as 1 | -1;
      this.step(this.facing * Math.min(Math.abs(dx), speed * dt));
      this.moving = true;
      return;
    }
    this.moving = false;
  }

  private step(dx: number) {
    const next = this.player.x + dx;
    if (next < this.minX) {
      this.player.x = this.minX;
      this.targetX = null;
      this.pending = null;
      if (this.sceneId === 'PRO-01') this.wet('鞋尖陷进湿泥，小满把脚收回来。');
      return;
    }
    if (next > this.maxX) {
      this.player.x = this.maxX;
      this.targetX = null;
      this.pending = null;
      return;
    }
    this.player.x = next;
  }

  private onGround(pointer: Phaser.Input.Pointer) {
    const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    if (this.sceneId === 'PRO-01' && (world.x < LAYOUT.pro01.wetUntil || world.y > 1000)) {
      this.wet(world.y > 1000 ? '这边是湿泥，看着亮，里头还软。' : '鞋尖陷进湿泥，小满把脚收回来。');
      return;
    }
    if (world.y < 640 || world.y > 1020) return;
    this.targetX = Phaser.Math.Clamp(world.x, this.minX, this.maxX);
    this.pending = null;
  }

  private wet(message: string) {
    if (this.time.now - this.wetAt < 900) return;
    this.wetAt = this.time.now;
    audio.play('mud');
    this.caption(`〔脚下〕${message}`);
    const splash = this.add.circle(this.player.x, FOOT, 18, 0x3d4e55, 0.7).setDepth(30);
    this.tweens.add({ targets: splash, scale: 2.2, alpha: 0, duration: getSettings().reduceMotion ? 80 : 420, onComplete: () => splash.destroy() });
  }

  private caption(message: string) {
    if (!getSettings().subtitles) return;
    this.captionText.setText(message).setAlpha(1);
    this.tweens.killTweensOf(this.captionText);
    this.tweens.add({ targets: this.captionText, alpha: 0, delay: 2200, duration: 400 });
  }

  private commitAction(action: Action): ApplyResult {
    const { state, result } = apply({ ...getState(), x: this.player.x, facing: this.facing }, action);
    if (result.ok && !result.repeat) {
      setState(state);
      commit(state);
      this.syncProps();
    }
    return result;
  }

  private syncProps() {
    const s = getState();
    setBowl(this.player, s.bowlTaken);
    this.bundleTexts.forEach((t) => t.destroy());
    this.bundleTexts = [];
    this.props.clear();
    if (this.sceneId === 'PRO-01') {
      const chestX = s.bowlTaken ? LAYOUT.pro01.stand : this.player.x + this.facing * 42;
      this.props.fillStyle(0x4a3428, 1);
      this.props.fillRoundedRect(chestX - 28, FOOT - 46, 56, 34, 4);
      this.props.fillStyle(0xd7c39a, 1);
      this.props.fillRect(chestX - 6, FOOT - 52, 14, 8);
    }
    if (this.sceneId === 'PRO-02' && s.teaDecided && !s.drankOathWater) {
      this.props.fillStyle(0x4d4338, 0.85);
      this.props.fillEllipse(LAYOUT.pro02.door + 30, FOOT + 8, 70, 18);
    }
    if (this.sceneId === 'CH1-01') {
      if (s.hookCloth === 'long') this.drawStrip(LAYOUT.hall.hook - 8, 530, 150);
      if (s.stoolCloth === 'short') this.drawStrip(LAYOUT.hall.stool - 6, 640, 78, true);
      if (s.curtainLifted) {
        const wickX = LAYOUT.hall.curtain - 120;
        const wickY = 390;
        this.props.fillStyle(0xf2d48a, 0.95);
        if (s.pz02Done) {
          this.props.fillTriangle(wickX, wickY + 28, wickX - 7, wickY, wickX + 7, wickY);
        } else if (s.addressSung) {
          this.props.fillTriangle(wickX - 8, wickY + 28, wickX - 14, wickY, wickX - 2, wickY);
          this.props.fillTriangle(wickX + 8, wickY + 28, wickX + 2, wickY, wickX + 14, wickY);
        }
        if (s.lampTaken) {
          this.props.fillStyle(0xc4552a, 1);
          this.props.fillRoundedRect(LAYOUT.hall.door + 28, FOOT - 118, 18, 28, 3);
          this.props.fillStyle(0xf2d48a, 1);
          this.props.fillCircle(LAYOUT.hall.door + 37, FOOT - 126, 6);
        }
        const labels = ['五', '五', '五', '四'];
        labels.forEach((label, i) => {
          const x = LAYOUT.hall.curtain - 50 + i * 36;
          this.props.fillStyle(0xf7f4ee, 0.95);
          this.props.fillRoundedRect(x, 470, 24, 150, 3);
          const tag = this.add.text(x + 12, 440, label, textStyle(22, '#f7f4ee')).setOrigin(0.5).setDepth(13);
          this.bundleTexts.push(tag);
        });
        this.props.fillStyle(0xf7f4ee, 0.35);
        this.props.fillRect(LAYOUT.hall.curtain - 70, 430, 36, 280);
      }
    }
  }

  private drawStrip(x: number, y: number, h: number, needle = false) {
    this.props.fillStyle(0xf4f1ea, 0.95);
    this.props.fillRoundedRect(x, y, needle ? 16 : 22, h, 3);
    if (needle) {
      this.props.fillStyle(0x222222, 1);
      this.props.fillCircle(x + 8, y + h - 10, 3);
    }
  }

  private syncMarkers() {
    const chest = this.spots.find((s) => s.id === 'chest');
    if (chest) chest.x = getState().bowlTaken ? LAYOUT.pro01.stand : this.player.x;
    const reachable = this.spots.filter((s) => s.available() && Math.abs(this.player.x - s.x) <= s.range);
    const focused = reachable[this.focus] ?? reachable[0];
    this.promptText.setText(focused ? `E　${focused.label}` : '');
    this.markers.forEach((marker, i) => {
      const spot = this.spots[i];
      const on = spot.available();
      marker.setVisible(on);
      marker.setPosition(spot.x, FOOT - 200 - (i % 4) * 36);
      const near = on && Math.abs(this.player.x - spot.x) <= spot.range;
      marker.setAlpha(near ? 1 : 0.25);
    });
    if (this.sceneId === 'PRO-01' && !getState().bowlTaken) this.syncProps();
  }

  private cycle() {
    const list = this.spots.filter((s) => s.available() && Math.abs(this.player.x - s.x) <= s.range);
    if (!list.length) {
      this.caption('走近一点再查。');
      return;
    }
    this.focus = (this.focus + 1) % list.length;
    const spot = list[this.focus];
    this.promptText.setText(`E　${spot.label}`);
  }

  private interactFocused() {
    const list = this.spots.filter((s) => s.available() && Math.abs(this.player.x - s.x) <= s.range);
    if (!list.length) {
      this.caption('走近一点再查。离开了就查不了。');
      return;
    }
    const spot = list[this.focus] ?? list[0];
    spot.use();
  }

  private makeMarker(spot: Spot) {
    const root = this.add.container(spot.x, FOOT - 210).setDepth(28);
    const g = this.add.graphics();
    g.fillStyle(0xf3e2b8, 0.95);
    g.fillTriangle(0, 18, -10, -2, 10, -2);
    const label = this.add.text(0, -36, spot.label, textStyle(22, '#f8f1e4')).setOrigin(0.5);
    root.add([g, label]);
    root.setSize(160, 120);
    const ox = root.displayOriginX;
    const oy = root.displayOriginY;
    root.setInteractive(new Phaser.Geom.Rectangle(ox - 80, oy - 90, 160, 130), Phaser.Geom.Rectangle.Contains);
    root.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event?.stopPropagation?.();
      if (this.mode !== 'play') return;
      if (Math.abs(this.player.x - spot.x) <= spot.range) spot.use();
      else {
        const beside = spot.x + (this.player.x < spot.x ? -90 : 90);
        this.targetX = Phaser.Math.Clamp(beside, this.minX, this.maxX);
        this.pending = spot.id;
      }
    });
    return root;
  }

  private wait(ms: number) {
    const dur = getSettings().reduceMotion ? 10 : ms;
    return new Promise<void>((resolve) => this.time.delayedCall(dur, () => resolve()));
  }

  private moveLockedTo(x: number) {
    this.facing = x >= this.player.x ? 1 : -1;
    const dist = Math.abs(x - this.player.x);
    return new Promise<void>((resolve) => {
      this.tweens.add({
        targets: this.player,
        x,
        duration: getSettings().reduceMotion ? 10 : Math.min(4200, dist * 3.4),
        onUpdate: () => {
          this.moving = true;
        },
        onComplete: () => {
          this.moving = false;
          resolve();
        },
      });
    });
  }

  private say(lines: readonly Line[]): Promise<void> {
    if (!lines.length || !this.alive) return Promise.resolve();
    this.modeBefore = this.mode === 'dialog' ? this.modeBefore : this.mode;
    this.mode = 'dialog';
    this.dialogLines = lines;
    this.dialogIndex = 0;
    return new Promise((resolve) => {
      this.dialogResolve = resolve;
      this.renderDialog();
    });
  }

  private renderDialog(playSound = true) {
    this.dialogRoot?.destroy();
    const line = this.dialogLines[this.dialogIndex];
    if (!line) return;
    if (playSound && line.sound) audio.play(line.sound);
    if (line.caption) this.caption(line.caption);
    const root = this.add.container(0, 0).setScrollFactor(0).setDepth(200);
    const box = this.add.rectangle(960, 960, 1880, 210, 0x140f0c, 0.9).setStrokeStyle(2, 0xd9c7a4).setScrollFactor(0).setInteractive();
    box.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event?.stopPropagation?.();
      this.advanceDialog();
    });
    const name = line.speaker === 'continuation' ? '续腔 · 身后，旧村一侧' : SPEAKER_NAME[line.speaker];
    const portraitKey = `portrait-${line.speaker}`;
    const paintedPortrait = this.textures.exists(portraitKey);
    const showPortrait = paintedPortrait || Boolean(PORTRAIT[line.speaker]);
    const bits: Phaser.GameObjects.GameObject[] = [box];
    if (showPortrait) {
      const left = line.speaker === 'xiaoman';
      const px = left ? 150 : 1770;
      const frame = this.add.rectangle(px, 680, 200, 280, 0x1b1612, 0.94).setStrokeStyle(2, 0xd9c7a4).setScrollFactor(0);
      bits.push(frame);
      if (paintedPortrait) {
        const bust = this.add.image(px, 812, portraitKey).setOrigin(0.5, 1).setScrollFactor(0);
        const aspect = bust.width / bust.height;
        const maxW = 176;
        const maxH = 248;
        const width = aspect > maxW / maxH ? maxW : maxH * aspect;
        const height = width / aspect;
        bust.setDisplaySize(width, height);
        bits.push(bust);
      } else {
        const bust = this.add.rectangle(px, 690, 150, 180, PORTRAIT[line.speaker] ?? 0x888888, 1).setScrollFactor(0);
        const tag = this.add.text(px, 800, '开发占位', textStyle(18, '#d9c7a4')).setOrigin(0.5).setScrollFactor(0);
        bits.push(bust, tag);
      }
    }
    const who = this.add.text(80, 880, name, textStyle(24, '#d9c7a4'));
    const body = this.add.text(80, 920, line.text, textStyle(getSettings().largeText ? 36 : 30)).setWordWrapWidth(showPortrait ? 1500 : 1700, true);
    const hint = this.add.text(1680, 1040, this.dialogHidden ? '' : '点这里或空格继续', textStyle(20, '#cbbba6')).setOrigin(0.5);
    const hide = makeButton(this, 1760, 890, 180, 46, this.dialogHidden ? '显示对白' : '隐藏对白', () => {
      this.dialogHidden = !this.dialogHidden;
      this.renderDialog(false);
    });
    hide.root.setScrollFactor(0);
    bits.push(who, body, hint, hide.root);
    root.add(bits);
    if (this.dialogHidden) {
      who.setAlpha(0);
      body.setAlpha(0);
      box.setAlpha(0.02);
    }
    this.dialogRoot = root;
  }

  private advanceDialog() {
    if (this.mode !== 'dialog') return;
    this.dialogIndex += 1;
    if (this.dialogIndex >= this.dialogLines.length) {
      this.dialogRoot?.destroy();
      this.dialogRoot = undefined;
      this.mode = this.modeBefore === 'dialog' ? 'play' : this.modeBefore;
      const resolve = this.dialogResolve;
      this.dialogResolve = null;
      resolve?.();
      return;
    }
    this.renderDialog();
  }

  private choose(prompt: string, options: { id: string; label: string }[], detail = '') {
    this.modeBefore = this.mode === 'choice' ? this.modeBefore : this.mode;
    this.mode = 'choice';
    this.choiceOptions = options;
    this.choiceIndex = 0;
    this.choiceRoot?.destroy();
    const root = this.add.container(0, 0).setScrollFactor(0).setDepth(210);
    const box = this.add.rectangle(960, 930, 1880, 280, 0x140f0c, 0.94).setStrokeStyle(2, 0xd9c7a4);
    const title = this.add.text(960, 820, prompt, textStyle(30)).setOrigin(0.5);
    const extra = this.add.text(960, 870, detail, textStyle(24, '#e6d7c4')).setOrigin(0.5).setWordWrapWidth(1600, true);
    root.add([box, title, extra]);
    options.forEach((option, index) => {
      const x = 960 - ((options.length - 1) * 300) / 2 + index * 300;
      const button = makeButton(this, x, 990, 280, 64, `${index + 1} ${option.label}`, () => this.pickChoice(option.id));
      button.root.setScrollFactor(0);
      root.add(button.root);
    });
    this.choiceRoot = root;
    this.paintChoiceCursor();
    return new Promise<string>((resolve) => {
      this.choiceResolve = resolve;
    });
  }

  private paintChoiceCursor() {
    this.choiceRoot?.iterate((child: Phaser.GameObjects.GameObject) => {
      if (child instanceof Phaser.GameObjects.Container) child.setAlpha(1);
    });
  }

  private pickChoice(id: string) {
    if (this.mode !== 'choice') return;
    this.choiceRoot?.destroy();
    this.choiceRoot = undefined;
    this.mode = this.modeBefore === 'choice' ? 'play' : this.modeBefore;
    const resolve = this.choiceResolve;
    this.choiceResolve = null;
    resolve?.(id);
  }

  private async bootstrap() {
    const s = getState();
    if (s.scene === 'PRO-01' && !s.pro01Intro) {
      audio.play('scrape');
      this.caption('〔左侧〕铁片刮过船板。');
      this.player.x = LAYOUT.pro01.introFrom;
      await this.wait(600);
      if (!this.alive) return;
      await this.moveLockedTo(LAYOUT.pro01.stand);
      if (!this.alive) return;
      await this.say([{ speaker: 'narration', text: '1998 年 10 月 23 日　幸福水库。小满把箱子在膝头放稳，人可以走了。' }]);
      if (!this.alive) return;
      await this.say(LINES.pro01Intro);
      if (!this.alive) return;
      this.commitAction({ type: 'finishPro01Intro', x: this.player.x, facing: this.facing });
    }
    if (getState().scene === 'PRO-02' && !getState().pro02Intro) {
      await this.say([{ speaker: 'narration', text: '谷雨钻过晾衣绳，围裙兜住脑袋。她顶着布走了两步，辫梢上是一块白粉。桂芬正把筷子往竹筒里插。' }]);
      if (!this.alive) return;
      await this.say(LINES.pro02Intro);
      if (!this.alive) return;
      this.commitAction({ type: 'finishPro02Intro' });
    }
    if (getState().scene === 'CH1-01' && !getState().hallIntro) {
      await this.say([{ speaker: 'narration', text: '门开了。桌边有人摆碗，有人撕纸，有人拨灯芯。隔着这些人，还能听见筷子一双双落桌。' }]);
      if (!this.alive) return;
      await this.say(LINES.hallChopsticks);
      if (!this.alive) return;
      await this.say(LINES.hallStoolAsk);
      if (!this.alive) return;
      this.commitAction({ type: 'finishHallIntro' });
    }
    if (this.alive && this.mode === 'script') this.mode = 'play';
    if (this.alive && this.sceneId === 'CH1-01' && getState().pz01Done) this.syncProps();
    this.syncProps();
  }

  private async guyuMeet() {
    if (this.metLatch || getState().chestAside) return;
    this.metLatch = true;
    this.mode = 'script';
    this.targetX = null;
    await this.say(LINES.guyuMeet);
    if (!this.alive) return;
    this.commitAction({ type: 'moveChest' });
    await this.say([{ speaker: 'narration', text: '小满把箱角从木头上挪开。谷雨仍把耳朵贴在剔过刺的那一面。' }]);
    this.mode = 'play';
  }

  private buildPro01() {
    const L = LAYOUT.pro01;
    this.spots = [
      { id: 'chest', x: L.stand, range: 150, label: '哭箱', available: () => true, use: () => void this.useChest() },
      { id: 'mud', x: L.prints - 80, range: 120, label: '看看泥面', available: () => true, use: () => void this.useMud() },
      { id: 'prints', x: L.prints, range: 120, label: '鞋印旁放碗', available: () => true, use: () => void this.measure('prints') },
      { id: 'stake', x: L.stake, range: 130, label: '倒桩旁放碗', available: () => true, use: () => void this.measure('stake') },
      { id: 'judge', x: L.stake + 160, range: 130, label: '判断方向', available: () => getState().stationPrints && getState().stationStake && !getState().l03, use: () => void this.askDirection() },
      { id: 'hear', x: L.stake - 120, range: 120, label: '倒桩后的声音', available: () => getState().heardContinuation, use: () => void this.rehear() },
      { id: 'guyu', x: L.stake + 70, range: 120, label: '谷雨', available: () => getState().chestAside, use: () => void this.useGuyu() },
      { id: 'changgui', x: L.changgui, range: 130, label: '杜长贵', available: () => true, use: () => void this.useChanggui() },
      { id: 'sing', x: L.singX, range: 140, label: '把后头唱完', available: () => getState().heardContinuation && !getState().songDone, use: () => void this.finishSong() },
      { id: 'exit', x: L.exit, range: 140, label: '沿干路上坡', available: () => true, use: () => void this.leaveShore() },
    ];
  }

  private buildPro02() {
    const L = LAYOUT.pro02;
    this.spots = [
      { id: 'back', x: L.minX + 40, range: 140, label: '回到库边', available: () => true, use: () => void this.go('PRO-01', LAYOUT.pro01.exit - 80, -1) },
      { id: 'notice', x: L.notice, range: 130, label: '工程告示', available: () => true, use: () => void this.readNotice() },
      { id: 'fish', x: L.guifen - 40, range: 130, label: '跟桂芬说话', available: () => getState().pro02Intro, use: () => void this.useGuifen() },
      { id: 'door', x: L.door, range: 140, label: '谷家门口', available: () => getState().pro02Intro, use: () => void this.useDoor() },
    ];
  }

  private buildHall() {
    const L = LAYOUT.hall;
    const after = () => getState().pz01Done;
    this.spots = [
      { id: 'out', x: L.door, range: 130, label: '回到村口', available: () => true, use: () => void this.go('PRO-02', LAYOUT.pro02.fromHall, -1) },
      { id: 'lamp', x: L.door + 180, range: 110, label: '门廊的灯', available: after, use: () => void this.hallUi(runLamp) },
      { id: 'book', x: L.stool - 70, range: 90, label: '作业本', available: after, use: () => void this.hallBook() },
      { id: 'photo', x: L.photo, range: 110, label: '看合照', available: () => getState().hallIntro, use: () => void this.usePhoto() },
      { id: 'body', x: L.photo + 90, range: 90, label: '看棺前', available: after, use: () => void this.hallUi(runBody) },
      { id: 'stool', x: L.stool, range: 90, label: '矮凳', available: () => getState().hallIntro, use: () => void this.useStool() },
      { id: 'gong', x: L.hook - 90, range: 80, label: '裹着的锣', available: after, use: () => void this.hallUi(runGong) },
      { id: 'hook', x: L.hook, range: 90, label: '建军的高钩', available: () => getState().hallIntro, use: () => void this.usePlace('hook') },
      { id: 'curtain', x: L.curtain, range: 120, label: '帷前', available: () => getState().hallIntro, use: () => void this.liftCurtain() },
      { id: 'hint', x: L.guifen, range: 100, label: '问桂芬', available: () => getState().clothsGiven, use: () => void this.askHallGuifen() },
      { id: 'guyu', x: L.guyu, range: 90, label: '谷雨', available: () => getState().hallIntro, use: () => void this.hallGuyu() },
      { id: 'jianjun', x: L.jianjun, range: 100, label: '谷建军', available: () => getState().hallIntro, use: () => void this.hallJianjun() },
    ];
  }

  private async useChest() {
    this.mode = 'script';
    const s = getState();
    if (!s.bowlTaken) {
      const pick = await this.choose('哭箱', [
        { id: 'bowl', label: '取碗' },
        { id: 'lining', label: '看箱衬' },
        { id: 'close', label: '合上' },
      ], '里头有她自己的孝布、哭本，和一只粗瓷水碗。今晚先取碗。孝布先不拿出来。');
      if (!this.alive || pick === 'close' || !pick) {
        this.mode = 'play';
        return;
      }
      if (pick === 'lining') {
        await this.say(LINES.lining);
        this.commitAction({ type: 'readLining' });
      }
      if (pick === 'bowl') {
        audio.play('ceramic');
        this.caption('〔身侧〕旧袜子松开，凉水倒进碗里，两指深。');
        await this.say(LINES.takeBowl);
        this.commitAction({ type: 'takeBowl' });
      }
    } else if (!s.liningRead) {
      await this.say(LINES.lining);
      this.commitAction({ type: 'readLining' });
    } else {
      await this.say([{ speaker: 'narration', text: '碗已经在手里。箱衬的纸边还是抽不动，没有信，也没有凭条。' }]);
    }
    if (this.mode === 'script') this.mode = 'play';
  }

  private async useMud() {
    this.mode = 'script';
    await this.say([{ speaker: 'narration', text: '鞋跟压进干皮里，印子一前一后，都朝坡上。亮的那一块先别踩。' }]);
    this.commitAction({ type: 'examineMud' });
    this.mode = 'play';
  }

  private async measure(station: 'prints' | 'stake') {
    if (!getState().bowlTaken) {
      await this.say([{ speaker: 'xiaoman', text: '碗还在箱子里。' }]);
      return;
    }
    this.player.x = station === 'prints' ? LAYOUT.pro01.prints : LAYOUT.pro01.stake;
    this.pulseRings(this.player.x, station === 'stake');
    await this.showNote(
      station === 'prints' ? '近看 · 鞋印旁' : '近看 · 倒桩旁',
      station === 'prints' ? NOTES.OBS_PRINTS.body : NOTES.OBS_STAKE.body,
    );
    if (!this.alive) return;
    this.commitAction({ type: 'measure', station });
    const s = getState();
    if (s.stationPrints && s.stationStake && !s.shoreTalk && !s.l03) {
      this.mode = 'script';
      await this.say(LINES.shoreTalk);
      if (!this.alive) return;
      this.commitAction({ type: 'shoreTalk' });
      await this.askDirection();
    }
    if (this.mode !== 'dialog' && this.mode !== 'choice') this.mode = 'play';
  }

  private pulseRings(x: number, dense: boolean) {
    audio.play(dense ? 'ripple-dense' : 'ripple-sparse');
    this.caption(dense ? '〔旧村侧，较近〕水纹密。布条仍吹向坡上。' : '〔旧村侧，断续〕水纹疏。');
    const g = this.add.graphics().setDepth(32);
    const count = dense ? 5 : 2;
    for (let i = 0; i < count; i++) {
      g.lineStyle(3, 0xd7f0f0, 0.85);
      g.strokeEllipse(x, FOOT - 30, dense ? 18 + i * 12 : 28 + i * 34, dense ? 8 + i * 4 : 10 + i * 6);
    }
    if (dense) {
      g.lineStyle(4, 0xf4ecdf, 0.9);
      g.lineBetween(x + 10, FOOT - 90, x - 90, FOOT - 90);
      g.lineBetween(x - 90, FOOT - 90, x - 74, FOOT - 100);
      g.lineBetween(x - 90, FOOT - 90, x - 74, FOOT - 80);
    }
    this.time.delayedCall(getSettings().reduceMotion ? 1200 : 2400, () => g.destroy());
  }

  private async askDirection() {
    if (getState().l03 || !getState().stationPrints || !getState().stationStake) return;
    const pick = await this.choose('声音从哪一侧接过来？', [
      { id: 'stake', label: '倒桩那头' },
      { id: 'upslope', label: '坡上这头' },
    ]);
    if (!this.alive || !pick) return;
    if (pick === 'upslope') {
      await this.showNote('两处并在一起', '鞋印旁纹疏，倒桩旁纹密。再端一次碗，看看哪一处起得密。碗还在，话也不用重头来。');
      return;
    }
    const result = this.commitAction({ type: 'judge', side: 'stake' });
    if (result.ok && !result.repeat) await this.singAndHear();
  }

  private async singAndHear() {
    this.mode = 'script';
    await this.say(LINES.singStart);
    if (!this.alive) return;
    await this.moveLockedTo(LAYOUT.pro01.singX);
    if (!this.alive) return;
    this.pulseBehind(true);
    await this.say(LINES.continuation);
    this.pulseBehind(false);
    if (!this.alive) return;
    this.commitAction({ type: 'hearContinuation' });
    const pick = await this.choose('她的嘴已经闭上。后头那一声从身后过来。', [
      { id: 'guyu', label: '问谷雨' },
      { id: 'changgui', label: '问杜叔' },
      { id: 'sing', label: '先把后头唱完' },
      { id: 'walk', label: '先在岸边走走' },
    ]);
    if (!this.alive || pick === 'walk' || !pick) {
      this.mode = 'play';
      return;
    }
    if (pick === 'guyu') await this.askWho('guyu');
    else if (pick === 'changgui') await this.askWho('changgui');
    else await this.finishSong();
  }

  private pulseBehind(on: boolean) {
    const existing = this.children.getByName('behind') as Phaser.GameObjects.Container | null;
    existing?.destroy();
    if (!on) return;
    const root = this.add.container(0, 0).setName('behind').setScrollFactor(0).setDepth(95);
    const glow = this.add.circle(180, 520, 70, 0xd7e4ea, 0.28);
    const label = this.add.text(180, 520, getSettings().subtitles ? '旧村一侧' : '', textStyle(28)).setOrigin(0.5);
    root.add([glow, label]);
    if (!getSettings().reduceMotion) this.tweens.add({ targets: glow, alpha: 0.08, yoyo: true, repeat: -1, duration: 700 });
  }

  private async rehear() {
    this.pulseBehind(true);
    await this.say(LINES.continuation);
    this.pulseBehind(false);
  }

  private async askWho(who: 'guyu' | 'changgui') {
    this.mode = 'script';
    await this.say(who === 'guyu' ? LINES.askGuyu : LINES.askChanggui);
    if (!this.alive) return;
    this.commitAction({ type: 'askShore', who });
    if (!getState().songDone) await this.finishSong();
    else this.mode = 'play';
  }

  private async useGuyu() {
    if (!getState().heardContinuation) {
      await this.say([{ speaker: 'guyu', text: '你先别挡着。我还没听完。' }]);
      return;
    }
    if (!getState().songDone) {
      const pick = await this.choose('谷雨', [
        { id: 'ask', label: '问她听清没有' },
        { id: 'sing', label: '把后头唱完' },
        { id: 'back', label: '离开' },
      ]);
      if (pick === 'ask') await this.askWho('guyu');
      if (pick === 'sing') await this.finishSong();
      return;
    }
    await this.askWho('guyu');
  }

  private async useChanggui() {
    if (!getState().heardContinuation) {
      await this.say([{ speaker: 'changgui', text: '顺着鞋印走。那块亮的，看着硬，里头还软。' }]);
      return;
    }
    if (!getState().songDone) {
      const pick = await this.choose('杜长贵', [
        { id: 'ask', label: '问他叫的是谁' },
        { id: 'sing', label: '把后头唱完' },
        { id: 'back', label: '离开' },
      ]);
      if (pick === 'ask') await this.askWho('changgui');
      if (pick === 'sing') await this.finishSong();
      return;
    }
    await this.askWho('changgui');
  }

  private async finishSong() {
    if (getState().songDone) return;
    if (!getState().heardContinuation) return;
    this.mode = 'script';
    await this.say([{ speaker: 'narration', text: '倒桩后面只有泥。她把原来的第二句从头唱起，后面三句放轻。' }]);
    if (!this.alive) return;
    await this.say(LINES.songRest);
    if (!this.alive) return;
    this.commitAction({ type: 'finishSong' });
    this.mode = 'play';
  }

  private async leaveShore() {
    const block = travelBlock(getState(), 'PRO-02');
    if (block) {
      await this.say([{ speaker: 'narration', text: TRAVEL_HINT[block] ?? '现在还上不了坡。' }]);
      return;
    }
    this.mode = 'script';
    await this.say(LINES.leaveShore);
    if (!this.alive) return;
    await this.go('PRO-02', LAYOUT.pro02.fromShore, 1);
  }

  private async readNotice() {
    const first = !getState().e23Read;
    await this.showNote('工程告示　E23', EVIDENCE.E23.body);
    if (!this.alive) return;
    this.commitAction({ type: 'readE23' });
    if (first) {
      this.mode = 'script';
      await this.say(LINES.noticeKid);
      this.mode = 'play';
    }
  }

  private async useGuifen() {
    const pick = await this.choose('邹桂芬', [
      { id: 'fish', label: getState().fishTold ? '再提一次鱼盆' : '捎杜叔鱼盆的话' },
      { id: 'back', label: '离开' },
    ]);
    if (pick === 'fish') {
      this.mode = 'script';
      await this.say(LINES.fish);
      this.commitAction({ type: 'fish' });
      this.mode = 'play';
    }
  }

  private async useDoor() {
    if (!getState().e23Read) {
      await this.say(LINES.needNotice);
      return;
    }
    if (!getState().teaDecided) {
      await this.teaSequence();
      return;
    }
    if (!getState().hallIntro) {
      this.mode = 'script';
      await this.say(LINES.enterHall);
      if (!this.alive) return;
    }
    await this.go('CH1-01', LAYOUT.hall.spawn, 1);
  }

  private async teaSequence() {
    this.mode = 'script';
    await this.say(LINES.teaOffer);
    if (!this.alive) return;
    const pick = await this.choose('这杯井茶怎么处置？', [
      { id: 'drink', label: '喝一口' },
      { id: 'pour', label: '倒在门槛外' },
    ]);
    if (!this.alive || (pick !== 'drink' && pick !== 'pour')) {
      this.mode = 'play';
      return;
    }
    const result = this.commitAction({ type: 'tea', choice: pick });
    if (!result.ok || result.repeat) {
      this.mode = 'play';
      return;
    }
    await this.say(pick === 'drink' ? LINES.teaDrink : LINES.teaPour);
    if (!this.alive) return;
    await this.say(LINES.enterHall);
    if (!this.alive) return;
    await this.go('CH1-01', LAYOUT.hall.spawn, 1);
  }

  private async usePhoto() {
    await this.showNote('堂上的合照', NOTES.PHOTO.body);
    this.commitAction({ type: 'seePhoto' });
  }

  private async useStool() {
    const s = getState();
    if (s.stoolSteadied && !s.clothsGiven) {
      this.mode = 'script';
      await this.say(LINES.giveCloth);
      if (!this.alive) return;
      this.commitAction({ type: 'receiveCloths' });
      this.mode = 'play';
      return;
    }
    if (!s.stoolSteadied) {
      this.mode = 'script';
      await this.say([{ speaker: 'narration', text: '小满按住凳面。桂芬折了张纸垫进短的那条腿，谷雨用鞋尖试了试。' }]);
      if (!this.alive) return;
      await this.say(LINES.hallStoolDone);
      if (!this.alive) return;
      this.commitAction({ type: 'steadyStool' });
      await this.say(LINES.giveCloth);
      if (!this.alive) return;
      this.commitAction({ type: 'receiveCloths' });
      await this.say([{ speaker: 'narration', text: '长孝布和短针孝布到了手里。哭本里记下：建军的布搭高钩。谷雨的小凳旁放有短针的那条。' }]);
      this.mode = 'play';
      return;
    }
    if (!s.clothsGiven) return;
    await this.usePlace('stool');
  }

  private async usePlace(target: 'hook' | 'stool') {
    const s = getState();
    if (!s.clothsGiven) {
      await this.say([{ speaker: 'narration', text: target === 'hook' ? '高钩还空着。' : '矮凳还在晃，布也还没交过来。' }]);
      return;
    }
    if (s.pz01Done) {
      await this.say([{ speaker: 'narration', text: target === 'hook' ? '长孝布搭在建军的高钩上。' : '有短针的那条在谷雨的矮凳旁。' }]);
      return;
    }
    const options: { id: string; label: string }[] = [];
    if (s.inventory.includes('long')) options.push({ id: 'long', label: '放上长孝布' });
    if (s.inventory.includes('short')) options.push({ id: 'short', label: '放上短针孝布' });
    options.push({ id: 'back', label: '先不放' });
    const pick = await this.choose(target === 'hook' ? '建军的高钩' : '谷雨的矮凳', options);
    if (!pick || pick === 'back') return;
    const result = this.commitAction({ type: 'placeCloth', cloth: pick as ClothId, target });
    if (result.code === 'wrong-long') await this.say(LINES.wrongLong);
    else if (result.code === 'wrong-short') await this.say(LINES.wrongShort);
    else if (result.code === 'occupied') await this.say([{ speaker: 'narration', text: '这里已经留着放对的那一条。' }]);
    else if (result.ok && !result.repeat) {
      await this.say([{ speaker: 'narration', text: target === 'hook' ? '长布搭上高钩，下摆垂到小腿。' : '短布放在矮凳旁，针脚朝着外面。' }]);
      if (getState().hookCloth === 'long' && getState().stoolCloth === 'short') {
        await this.say([{ speaker: 'narration', text: '旧帷角松了一截。可以掀起来看看。' }]);
      }
    }
  }

  private async clothHint() {
    const pick = await this.choose('孝布怎么放', [
      { id: '1', label: '重看她刚才怎么搭' },
      { id: '2', label: '看短针和线头' },
      { id: '3', label: '让她示范高钩' },
      { id: '0', label: '关掉' },
    ]);
    if (pick === '1') await this.say(LINES.giveCloth);
    if (pick === '2') {
      await this.say([{ speaker: 'narration', text: '矮凳腿边有一截线头，和短布角上那一针朝向相同。高钩那边没有针。' }]);
    }
    if (pick === '3') {
      const result = this.commitAction({ type: 'demoHook' });
      await this.say(LINES.giveCloth);
      if (result.ok && !result.repeat) {
        await this.say([{ speaker: 'narration', text: '桂芬把长布搭上高钩，短的那条仍留在小满手里。谷雨的位置还要自己放。' }]);
      }
    }
  }

  private async liftCurtain() {
    const s = getState();
    if (s.curtainLifted) {
      const pick = await this.choose('帷前', [
        { id: 'cloth', label: '再看十九条旧布' },
        { id: 'rite', label: s.pz02Done ? '重听唱过的' : '堂前起式' },
        { id: 'back', label: '离开' },
      ]);
      if (pick === 'cloth') await this.say([{ speaker: 'narration', text: '缝还留着。五把、五把、五把、四把，共十九条。一个名字都还没写上。' }]);
      if (pick === 'rite') await this.hallUi(runRite);
      return;
    }
    if (s.hookCloth !== 'long' || s.stoolCloth !== 'short') {
      await this.say([{ speaker: 'narration', text: '帷角还卡在钩后面。两条布没有都放到该放的地方。' }]);
      return;
    }
    this.mode = 'script';
    const result = this.commitAction({ type: 'liftCurtain' });
    if (!result.ok) {
      this.mode = 'play';
      return;
    }
    this.syncProps();
    await this.say(LINES.curtain);
    if (!this.alive) return;
    await this.say([{ speaker: 'narration', text: '建军还在供桌边上。三夜怎么哭，过去听他自己说。' }]);
    this.mode = 'play';
  }

  private hallTalk(): HallUi {
    return {
      say: (lines) => this.say(lines),
      choose: (prompt, options, detail) => this.choose(prompt, options, detail),
      showNote: (title, body) => this.showNote(title, body),
      commit: (action) => this.commitAction(action),
      alive: () => this.alive,
      state: () => getState(),
    };
  }

  private async hallUi(run: (ui: HallUi) => Promise<void>) {
    this.mode = 'script';
    await run(this.hallTalk());
    if (this.alive && this.mode === 'script') this.mode = 'play';
    this.syncProps();
  }

  private async hallBook() {
    if (getState().l02) {
      await this.say([{ speaker: 'narration', text: '本子还摊在原处。桂芬亲眼看见的那句已经记下，不用再问一遍才算数。' }]);
      const pick = await this.choose('作业本', [
        { id: 'again', label: '请桂芬再讲一遍' },
        { id: 'back', label: '收回' },
      ]);
      if (pick === 'again') await this.hallUi(runTestimony);
      return;
    }
    await this.hallUi(runBook);
  }

  private async askHallGuifen() {
    if (!getState().pz01Done) {
      await this.clothHint();
      return;
    }
    const pick = await this.choose('邹桂芬', [
      { id: 'cloth', label: '再问孝布' },
      { id: 'saw', label: getState().l02 ? '再听她亲眼看见的' : '问她当时看见什么' },
      { id: 'back', label: '离开' },
    ]);
    if (pick === 'cloth') await this.clothHint();
    if (pick === 'saw') await this.hallUi(runTestimony);
  }

  private async hallGuyu() {
    const s = getState();
    const text = s.pz02Done
      ? '本子我收好了。那两句你别拿到外头去。'
      : s.bookSeen
        ? '粉笔给我。最后那一点是我自己添的。'
        : s.pz01Done
          ? '留条缝，省得下回又挂在钉上。'
          : s.stoolSteadied
            ? '凳子归我管。布你放，我看着。'
            : '靠墙那条腿短。垫这边。';
    await this.say([{ speaker: 'guyu', text }]);
  }

  private async hallJianjun() {
    if (getState().pz01Done) {
      await this.hallUi(runCommission);
      return;
    }
    await this.say([{ speaker: 'jianjun', text: '人在供桌边上，掌根按着钥匙。三夜的事他还没开口。' }]);
  }

  private async go(to: SceneId, x: number, facing: 1 | -1) {
    const block = travelBlock(getState(), to);
    if (block) {
      await this.say([{ speaker: 'narration', text: TRAVEL_HINT[block] ?? '现在走不过去。' }]);
      return;
    }
    this.mode = 'script';
    this.cameras.main.fadeOut(350, 12, 10, 8);
    await new Promise<void>((resolve) => this.cameras.main.once('camerafadeoutcomplete', () => resolve()));
    if (!this.alive) return;
    const result = this.commitAction({ type: 'travel', to, x, facing });
    if (!result.ok) {
      this.mode = 'play';
      this.cameras.main.fadeIn(200, 12, 10, 8);
      return;
    }
    this.scene.restart();
  }

  private showNote(title: string, body: string) {
    const pages = paginateNote(body);
    return new Promise<void>((resolve) => {
      let index = 0;
      this.mode = 'panel';
      const root = this.add.container(0, 0).setScrollFactor(0).setDepth(220);
      const dim = this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.35).setScrollFactor(0).setInteractive();
      const card = this.add.rectangle(430, 420, 700, 560, 0x241c16, 0.96).setStrokeStyle(2, 0xd9c7a4);
      const heading = this.add.text(140, 180, title, textStyle(32, '#d9c7a4'));
      const copy = this.add.text(140, 250, '', textStyle(26)).setWordWrapWidth(580, true);
      const pageLabel = this.add.text(430, 560, '', textStyle(20, '#cbbba6')).setOrigin(0.5);
      const paint = () => {
        copy.setText(pages[index] ?? '');
        pageLabel.setText(pages.length > 1 ? `${index + 1} / ${pages.length}` : '');
      };
      paint();
      const close = makeButton(this, 430, 640, 200, 52, '收回', () => this.closePanel());
      const buttons = [close];
      if (pages.length > 1) {
        buttons.unshift(makeButton(this, 230, 640, 160, 52, '上一页', () => {
          index = Math.max(0, index - 1);
          paint();
        }));
        buttons.push(makeButton(this, 630, 640, 160, 52, '下一页', () => {
          index = Math.min(pages.length - 1, index + 1);
          paint();
        }));
      }
      this.panelResolve = resolve;
      buttons.forEach((b) => b.root.setScrollFactor(0));
      root.add([dim, card, heading, copy, pageLabel]);
      buttons.forEach((b) => root.add(b.root));
      this.panelRoot = root;
      dim.on('pointerdown', (pointer: Phaser.Input.Pointer) => pointer.event?.stopPropagation?.());
    });
  }

  private openInventory() {
    if (this.mode !== 'play') return;
    const s = getState();
    const lines = s.inventory.length
      ? s.inventory.map((id) => `${ITEM_TEXT[id]?.name ?? id}\n${ITEM_TEXT[id]?.body ?? ''}`).join('\n\n')
      : '身上还没有取出的东西。哭箱里的碗要用「哭箱」取。孝布是进了灵堂才交到手里的。';
    void this.showNote('身上的东西', lines);
  }

  private openJournal() {
    if (this.mode !== 'play') return;
    const s = getState();
    const notes = s.notes.length ? s.notes.map((id) => `【${NOTES[id]?.title ?? id}】\n${NOTES[id]?.body ?? ''}`).join('\n\n') : '还没有观察。';
    const evidence = s.evidence.length ? s.evidence.map((id) => `【${EVIDENCE[id]?.title ?? id}】\n${EVIDENCE[id]?.body ?? ''}`).join('\n\n') : '还没有文书。';
    const names = s.named.length ? s.named.join('、') : '名册是空的。听见的音先记在观察里，没有归到谁身上。';
    const sent = s.sent.length ? `已送 ${s.sent.length}` : '还没有送别。';
    void this.showNote('哭本', `观察\n${notes}\n\n证据\n${evidence}\n\n姓名\n${names}\n${sent}\n\n${journalStatus(s)}`);
  }

  private openPause() {
    if (this.mode !== 'play' && this.mode !== 'pause') return;
    this.commitAction({ type: 'move', x: this.player.x, facing: this.facing });
    this.mode = 'pause';
    const root = this.add.container(0, 0).setScrollFactor(0).setDepth(230);
    const dim = this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.45).setScrollFactor(0).setInteractive();
    const card = this.add.rectangle(960, 520, 760, 560, 0x241c16, 0.98).setStrokeStyle(2, 0xd9c7a4);
    const title = this.add.text(960, 300, '暂停', textStyle(40)).setOrigin(0.5);
    const info = this.add.text(960, 380, '', textStyle(26)).setOrigin(0.5);
    const paint = () => {
      const settings = getSettings();
      info.setText(`音量 ${Math.round(settings.master * 100)}　字幕 ${settings.subtitles ? '开' : '关'}　字号 ${settings.largeText ? '大' : '普通'}　动态 ${settings.reduceMotion ? '减' : '原'}`);
    };
    paint();
    const resume = makeButton(this, 960, 470, 320, 60, '继续', () => this.closePanel());
    const quieter = makeButton(this, 760, 560, 200, 56, '音量 -', () => this.tweakVolume(-0.1, paint));
    const louder = makeButton(this, 1160, 560, 200, 56, '音量 +', () => this.tweakVolume(0.1, paint));
    const sub = makeButton(this, 760, 640, 200, 56, '字幕', () => this.tweakSetting('subtitles', paint));
    const size = makeButton(this, 1160, 640, 200, 56, '字号', () => this.tweakSetting('largeText', paint));
    const motion = makeButton(this, 960, 720, 280, 56, '减少动态', () => this.tweakSetting('reduceMotion', paint));
    const titleBtn = makeButton(this, 960, 800, 320, 56, '回到标题', () => this.scene.start('title'));
    root.add([dim, card, title, info]);
    [resume, quieter, louder, sub, size, motion, titleBtn].forEach((b) => {
      b.root.setScrollFactor(0);
      root.add(b.root);
    });
    this.panelRoot = root;
    dim.on('pointerdown', (pointer: Phaser.Input.Pointer) => pointer.event?.stopPropagation?.());
  }

  private tweakVolume(delta: number, paint: () => void) {
    const settings = { ...getSettings(), master: Math.min(1, Math.max(0, Math.round((getSettings().master + delta) * 10) / 10)) };
    audio.setVolume(settings.master);
    setSettings(settings);
    paint();
  }

  private tweakSetting(key: 'subtitles' | 'largeText' | 'reduceMotion', paint: () => void) {
    const settings = { ...getSettings(), [key]: !getSettings()[key] };
    setSettings(settings);
    paint();
  }

  private closePanel() {
    this.panelRoot?.destroy();
    this.panelRoot = undefined;
    if (this.mode === 'panel' || this.mode === 'pause') this.mode = 'play';
    const resolve = this.panelResolve;
    this.panelResolve = null;
    resolve?.();
  }
}

function paginateNote(body: string): string[] {
  const pieces: string[] = [];
  for (const chunk of body.split('\n\n')) {
    let rest = chunk.trim();
    while (rest.length > 90) {
      pieces.push(rest.slice(0, 90));
      rest = rest.slice(90).trim();
    }
    if (rest) pieces.push(rest);
  }
  const pages: string[] = [];
  let current = '';
  for (const piece of pieces) {
    const next = current ? `${current}\n\n${piece}` : piece;
    if (next.length > 90 && current) {
      pages.push(current);
      current = piece;
    } else current = next;
  }
  if (current) pages.push(current);
  return pages.length ? pages : [''];
}
