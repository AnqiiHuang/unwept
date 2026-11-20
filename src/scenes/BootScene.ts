import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload() {
    const base = import.meta.env.BASE_URL;
    const art = `${base}art/v2/`;

    this.load.image('bg-shore', `${art}backgrounds/shore.png`);
    this.load.image('bg-village-gate', `${art}backgrounds/village_gate.png`);
    this.load.image('bg-mourning-hall', `${art}backgrounds/mourning_hall.png`);
    this.load.image('bg-village-street', `${art}backgrounds/village_street.png`);
    this.load.image('plate-room', `${art}backgrounds/opening_room.png`);
    this.load.image('plate-shore', `${art}backgrounds/opening_shore.png`);
    this.load.image('plate-gate', `${art}backgrounds/opening_gate.png`);
    this.load.image('plate-title', `${art}backgrounds/title.png`);

    const scene = [
      'xiaoman-stand',
      'xiaoman-1',
      'xiaoman-2',
      'xiaoman-3',
      'xiaoman-bowl',
      'xiaoman-bowl-1',
      'xiaoman-bowl-2',
      'xiaoman-bowl-3',
      'xiaoman-carry',
      'xiaoman-carry-1',
      'xiaoman-carry-2',
      'xiaoman-carry-3',
      'xiaoman-lamp',
      'xiaoman-pack-lamp',
      'xiaoman-throat',
      'guyu',
      'guifen',
      'changgui',
      'jianjun',
    ];
    scene.forEach((name) => this.load.image(`scene-${name}`, `${base}characters/scene/${name}.png`));
    ['xiaoman', 'guyu', 'guifen', 'changgui', 'jianjun'].forEach((name) => {
      this.load.image(`portrait-${name}`, `${base}characters/portrait/${name}.png`);
    });

    const props = [
      'chest-closed',
      'chest-open',
      'bowl',
      'lamp',
      'stool',
      'cloth-long',
      'cloth-needle',
      'boat',
      'footprints',
      'reeds',
      'wood-post',
      'gong',
    ];
    props.forEach((name) => this.load.image(`prop-${name}`, `${art}props/${name}.png`));

    const closeups = ['stove', 'window-lamp', 'window-bed', 'bowl-bed', 'portrait-elder', 'cloths-hanging', 'lamp-split', 'lamp-steady'];
    closeups.forEach((name) => this.load.image(`closeup-${name}`, `${art}closeups/${name}.png`));

    this.load.image('ui-header', `${art}ui/ui-header.png`);
    this.load.image('ui-btn', `${art}ui/ui-btn-dark.png`);
    this.load.image('ui-journal', `${art}ui/ui-journal.png`);
    this.load.image('ui-frame', `${art}ui/ui-frame-a.png`);
  }

  create() {
    this.scene.start('title');
  }
}
