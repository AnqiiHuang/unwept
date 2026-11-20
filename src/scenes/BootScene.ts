import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload() {
    const base = import.meta.env.BASE_URL;
    const art = `${base}art/v2/`;
    const sup = `${base}art/v2_supplement/`;

    // Supplement panoramas (3240×1080) replace prior soft-filled plates for shore/gate/street.
    this.load.image('bg-shore', `${sup}backgrounds/shore.png`);
    this.load.image('bg-village-gate', `${sup}backgrounds/village_gate.png`);
    this.load.image('bg-village-street', `${sup}backgrounds/village_street.png`);
    // Hall still uses v2 mourning plate until a matching supplement arrives.
    this.load.image('bg-mourning-hall', `${art}backgrounds/mourning_hall.png`);

    this.load.image('plate-room', `${art}backgrounds/opening_room.png`);
    this.load.image('plate-shore', `${sup}backgrounds/shore_opening.png`);
    this.load.image('plate-gate', `${sup}backgrounds/village_gate_opening.png`);
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
      'xiaoman-lamp-1',
      'xiaoman-lamp-2',
      'xiaoman-lamp-3',
      'xiaoman-lamp-4',
      'xiaoman-lamp-5',
      'xiaoman-lamp-6',
      'xiaoman-lamp-7',
      'xiaoman-lamp-8',
      'xiaoman-pack-lamp',
      'xiaoman-throat',
      'guyu',
      'guifen',
      'changgui',
      'jianjun',
    ];
    scene.forEach((name) => this.load.image(`scene-${name}`, `${base}characters/scene/${name}.png`));

    ['xiaoman', 'xiaoman-calm', 'xiaoman-speak', 'xiaoman-alert', 'xiaoman-low', 'guyu', 'guifen', 'changgui', 'jianjun'].forEach(
      (name) => {
        this.load.image(`portrait-${name}`, `${base}characters/portrait/${name}.png`);
      },
    );

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

    for (let i = 1; i <= 4; i++) {
      this.load.image(`fx-ripple-${i}`, `${sup}effects/ripple-${i}.png`);
      this.load.image(`fx-quilt-${i}`, `${sup}effects/quilt-${i}.png`);
      this.load.image(`fx-ember-${i}`, `${sup}effects/ember-${i}.png`);
    }

    this.load.image('ui-header', `${art}ui/ui-header.png`);
    this.load.image('ui-btn', `${art}ui/ui-btn-dark.png`);
    this.load.image('ui-journal', `${art}ui/ui-journal.png`);
    this.load.image('ui-frame', `${art}ui/ui-frame-a.png`);
  }

  create() {
    this.scene.start('title');
  }
}
