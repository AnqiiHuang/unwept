import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { OpeningScene } from './scenes/OpeningScene';
import { TitleScene } from './scenes/TitleScene';
import { WorldScene } from './scenes/WorldScene';
import { getState } from './game/session';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#100e0c',
  banner: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
  },
  scene: [BootScene, TitleScene, OpeningScene, WorldScene],
});

if (import.meta.env.DEV) {
  (window as unknown as { __UNWEPT__?: unknown }).__UNWEPT__ = { getState, game };
}
