import Phaser from 'phaser';
import roomUrl from '../../02_美术参考/场景/暮色老屋里的空椅.png';
import shoreUrl from '../../02_美术参考/场景/低水库岸·旧村轮廓.png';
import gateUrl from '../../02_美术参考/场景/暮秋的水库村口.png';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload() {
    this.load.image('plate-room', roomUrl);
    this.load.image('plate-shore', shoreUrl);
    this.load.image('plate-gate', gateUrl);
  }

  create() {
    this.scene.start('title');
  }
}
