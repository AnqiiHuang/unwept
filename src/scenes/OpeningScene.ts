import Phaser from 'phaser';
import { apply } from '../core/state';
import { OPENING_DRAFT } from '../data/openingDraft';
import { audio } from '../game/audio';
import { commit, getSettings, getState, setState } from '../game/session';
import { makeButton, textStyle } from '../ui/widgets';

export class OpeningScene extends Phaser.Scene {
  private index = 0;
  private plate?: Phaser.GameObjects.Image;
  private grade?: Phaser.GameObjects.Rectangle;
  private speaker?: Phaser.GameObjects.Text;
  private body?: Phaser.GameObjects.Text;
  private caption?: Phaser.GameObjects.Text;
  private ended = false;

  constructor() {
    super('opening');
  }

  create() {
    this.input.topOnly = true;
    audio.ensure(getSettings().master);
    this.add.rectangle(960, 540, 1920, 1080, 0x100e0c);
    this.plate = this.add.image(960, 480, 'plate-room').setDisplaySize(1920, 1080);
    if (!this.textures.exists('plate-room')) {
      this.plate.setVisible(false);
      this.add.rectangle(960, 480, 1920, 800, 0x3a342c);
    }
    this.grade = this.add.rectangle(960, 540, 1920, 1080, 0xc4846a, 0.12);
    this.add.rectangle(960, 900, 1920, 280, 0x120f0c, 0.82);
    this.add.text(40, 28, '新增开场草稿　·　参考静帧，不是最终开场分镜', textStyle(22, '#f0e6d6'));
    this.speaker = this.add.text(80, 800, '', textStyle(26, '#d9c7a4'));
    this.body = this.add.text(80, 850, '', textStyle(getSettings().largeText ? 36 : 32)).setWordWrapWidth(1500, true);
    this.caption = this.add.text(960, 140, '', textStyle(26, '#f7f1e6')).setOrigin(0.5);
    const skip = makeButton(this, 1720, 70, 220, 56, '跳过开场', () => this.finish());
    skip.root.setDepth(5);
    this.show();
    const zone = this.add.rectangle(960, 960, 1600, 200, 0x000000, 0.001).setInteractive();
    zone.on('pointerdown', () => this.advance());
    this.input.keyboard?.on('keydown-ENTER', () => this.advance());
    this.input.keyboard?.on('keydown-SPACE', () => this.advance());
    this.input.keyboard?.on('keydown-ESC', () => this.finish());
  }

  private show() {
    const beat = OPENING_DRAFT.beats[this.index];
    if (!beat || !this.plate || !this.grade || !this.speaker || !this.body || !this.caption) return;
    const key = beat.plate === 'room' ? 'plate-room' : beat.plate === 'shore' ? 'plate-shore' : 'plate-gate';
    if (this.textures.exists(key)) {
      this.plate.setTexture(key).setVisible(true).setDisplaySize(1920, 1080);
    }
    this.grade.setFillStyle(beat.grade === 'memory' ? 0xc4846a : 0x6e88a0, beat.grade === 'memory' ? 0.16 : 0.1);
    this.speaker.setText(beat.speaker);
    this.body.setText(beat.text);
    this.caption.setText(getSettings().subtitles && beat.caption ? beat.caption : '');
    if (beat.sound) audio.play(beat.sound);
  }

  private advance() {
    if (this.ended) return;
    this.index += 1;
    if (this.index >= OPENING_DRAFT.beats.length) this.finish();
    else this.show();
  }

  private finish() {
    if (this.ended) return;
    this.ended = true;
    const { state, result } = apply(getState(), { type: 'finishOpening' });
    if (result.ok) {
      setState(state);
      if (!result.repeat) commit(state);
    }
    this.cameras.main.fadeOut(500, 12, 10, 8);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('world'));
  }
}
