import Phaser from 'phaser';
import { peekSave, progressLabel, type Settings } from '../core/state';
import { audio } from '../game/audio';
import { getSettings, resetGame, setSettings, setState } from '../game/session';
import { FONT, makeButton, textStyle } from '../ui/widgets';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create() {
    this.input.topOnly = true;
    audio.ensure(getSettings().master);
    this.add.rectangle(960, 540, 1920, 1080, 0x16130f);
    this.add.rectangle(960, 390, 1920, 280, 0x2a2118, 0.45);
    this.add.text(960, 250, '欠哭', textStyle(120, '#f4ecdf')).setOrigin(0.5);
    this.add.text(960, 360, 'Unwept', { fontFamily: FONT, fontSize: '36px', color: '#d9c7a4' }).setOrigin(0.5);
    this.add.text(960, 430, '1998 年秋　·　新坳', textStyle(28, '#cbbba6')).setOrigin(0.5);

    const peek = peekSave();
    const note =
      peek.kind === 'ok'
        ? peek.restoredFromBackup
          ? `继续将使用上一份完整备份：${progressLabel(peek.state)}`
          : progressLabel(peek.state)
        : peek.kind === 'error'
          ? peek.message
          : '还没有本地进度';
    this.add.text(960, 500, note, textStyle(24, '#e6d7c4')).setOrigin(0.5);

    makeButton(this, 960, 600, 420, 72, '新游戏', () => this.onNewGame(peek.kind === 'ok'));
    const cont = makeButton(this, 960, 690, 420, 72, peek.kind === 'ok' ? '继续游戏' : '继续游戏（没有存档）', () => {
      if (peek.kind !== 'ok') return;
      setState(peek.state);
      this.scene.start(peek.state.openingDone ? 'world' : 'opening');
    });
    cont.setEnabled(peek.kind === 'ok');
    makeButton(this, 960, 780, 420, 72, '设置', () => this.openSettings());
    this.add.text(960, 980, '开发版　·　本轮到灵堂孝布辨亲为止', textStyle(22, '#b5a894')).setOrigin(0.5);

    this.input.once('pointerdown', () => audio.ensure(getSettings().master));
    this.input.keyboard?.once('keydown', () => audio.ensure(getSettings().master));
  }

  private onNewGame(needsConfirm: boolean) {
    if (!needsConfirm) {
      resetGame();
      this.scene.start('opening');
      return;
    }
    const dim = this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.55).setDepth(20).setInteractive();
    const card = this.add.rectangle(960, 540, 760, 320, 0x241e18, 0.98).setStrokeStyle(2, 0xd9c7a4).setDepth(21);
    const copy = this.add.text(960, 470, '开始新游戏会覆盖这台浏览器里的当前进度。\n上一份会先留成备份。', textStyle(28)).setOrigin(0.5).setDepth(22);
    const yes = makeButton(this, 800, 620, 240, 64, '覆盖并开始', () => {
      resetGame();
      this.scene.start('opening');
    });
    const no = makeButton(this, 1120, 620, 240, 64, '留下原进度', () => {
      dim.destroy();
      card.destroy();
      copy.destroy();
      yes.root.destroy();
      no.root.destroy();
    });
    yes.root.setDepth(22);
    no.root.setDepth(22);
  }

  private openSettings() {
    const settings = { ...getSettings() };
    const dim = this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.55).setDepth(20).setInteractive();
    const card = this.add.rectangle(960, 520, 860, 520, 0x241e18, 0.98).setStrokeStyle(2, 0xd9c7a4).setDepth(21);
    const title = this.add.text(960, 320, '设置', textStyle(40)).setOrigin(0.5).setDepth(22);
    const body = this.add.text(960, 470, '', textStyle(28)).setOrigin(0.5).setDepth(22);
    const paint = () => {
      body.setText(
        [
          `主音量　${Math.round(settings.master * 100)}`,
          `方位字幕　${settings.subtitles ? '开' : '关'}　（对白始终显示）`,
          `对白字号　${settings.largeText ? '大' : '普通'}`,
          `减少动态　${settings.reduceMotion ? '开' : '关'}`,
        ].join('\n'),
      );
      audio.setVolume(settings.master);
    };
    paint();
    const row = (y: number, label: string, fn: () => void) => {
      const b = makeButton(this, 960, y, 280, 56, label, () => {
        fn();
        setSettings(settings);
        paint();
      });
      b.root.setDepth(22);
      return b;
    };
    const buttons = [
      row(620, '音量 -', () => (settings.master = Math.max(0, Math.round((settings.master - 0.1) * 10) / 10))),
      row(690, '音量 +', () => (settings.master = Math.min(1, Math.round((settings.master + 0.1) * 10) / 10))),
    ];
    const toggles = makeButton(this, 700, 780, 240, 56, '字幕', () => {
      settings.subtitles = !settings.subtitles;
      setSettings(settings);
      paint();
    });
    const size = makeButton(this, 960, 780, 200, 56, '字号', () => {
      settings.largeText = !settings.largeText;
      setSettings(settings);
      paint();
    });
    const motion = makeButton(this, 1220, 780, 240, 56, '动态', () => {
      settings.reduceMotion = !settings.reduceMotion;
      setSettings(settings);
      paint();
    });
    [toggles, size, motion].forEach((b) => b.root.setDepth(22));
    const close = makeButton(this, 960, 860, 240, 56, '返回', () => {
      dim.destroy();
      card.destroy();
      title.destroy();
      body.destroy();
      buttons.forEach((b) => b.root.destroy());
      toggles.root.destroy();
      size.root.destroy();
      motion.root.destroy();
      close.root.destroy();
    });
    close.root.setDepth(22);
    void (settings as Settings);
  }
}
