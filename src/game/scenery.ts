import Phaser from 'phaser';
import { LAYOUT, footFor } from './layout';

function artBg(scene: Phaser.Scene, key: string, worldW: number) {
  if (!scene.textures.exists(key)) return null;
  // Plate is authored at worldW×1080 — 1:1, no stretch, no soft fill.
  return scene.add.image(0, 0, key).setOrigin(0, 0).setDepth(0).setDisplaySize(worldW, 1080);
}

function sky(g: Phaser.GameObjects.Graphics, w: number, top: number, bottom: number) {
  g.fillGradientStyle(top, top, bottom, bottom, 1);
  g.fillRect(0, 0, w, 620);
}

/** Shore prop overlays at layout anchors (prints / stake / boat / reeds). */
function shoreAnchors(scene: Phaser.Scene) {
  const L = LAYOUT.pro01;
  const foot = footFor('PRO-01');
  if (scene.textures.exists('prop-footprints')) {
    scene.add
      .image(L.prints, foot - 8, 'prop-footprints')
      .setOrigin(0.5, 1)
      .setDisplaySize(200, 80)
      .setDepth(8)
      .setAlpha(0.9);
  }
  if (scene.textures.exists('prop-wood-post')) {
    scene.add
      .image(L.stake, foot + 4, 'prop-wood-post')
      .setOrigin(0.55, 1)
      .setDisplaySize(110, 240)
      .setAngle(-28)
      .setDepth(8);
  }
  if (scene.textures.exists('prop-boat')) {
    scene.add
      .image(L.changgui - 70, foot - 8, 'prop-boat')
      .setOrigin(0.5, 1)
      .setDisplaySize(240, 80)
      .setDepth(7);
  }
  if (scene.textures.exists('prop-reeds')) {
    scene.add.image(60, 1080, 'prop-reeds').setOrigin(0.5, 1).setDisplaySize(280, 320).setDepth(40);
  }
}

export function paintPro01(scene: Phaser.Scene) {
  const L = LAYOUT.pro01;
  const w = L.world;
  const bg = artBg(scene, 'bg-shore', w);
  if (!bg) {
    const skyG = scene.add.graphics().setDepth(0);
    sky(skyG, w, 0x6e7584, 0xe7b08a);
    const ground = scene.add.graphics().setDepth(3);
    ground.fillStyle(0xa88460, 1);
    ground.fillRect(0, 620, w, 460);
  }
  shoreAnchors(scene);
  return { tag: null };
}

export function paintPro02(scene: Phaser.Scene) {
  const w = LAYOUT.pro02.world;
  const bg = artBg(scene, 'bg-village-gate', w);
  if (!bg) {
    const skyG = scene.add.graphics().setDepth(0);
    sky(skyG, w, 0x4a3d52, 0xd09a78);
    const ground = scene.add.graphics().setDepth(2);
    ground.fillStyle(0x7c5e45, 1);
    ground.fillRect(0, 760, w, 320);
  }
}

export function paintHall(scene: Phaser.Scene) {
  const w = LAYOUT.hall.world;
  const bg = artBg(scene, 'bg-mourning-hall', w);
  if (!bg) {
    const g = scene.add.graphics().setDepth(0);
    g.fillStyle(0x2a241e, 1);
    g.fillRect(0, 0, w, 1080);
    g.fillStyle(0x3a312a, 1);
    g.fillRect(0, 760, w, 320);
  }
  if (scene.textures.exists('prop-cloth-long')) {
    const baseX = LAYOUT.hall.curtain - 70;
    for (let i = 0; i < 19; i++) {
      const x = baseX + (i % 10) * 14;
      const y = 380 + Math.floor(i / 10) * 18;
      scene.add
        .image(x, y, 'prop-cloth-long')
        .setOrigin(0.5, 0)
        .setDisplaySize(18, 160 + (i % 3) * 12)
        .setDepth(11)
        .setAlpha(0.92);
    }
  }
  if (scene.textures.exists('prop-stool')) {
    scene.add
      .image(LAYOUT.hall.stool, footFor('CH1-01'), 'prop-stool')
      .setOrigin(0.5, 1)
      .setDisplaySize(90, 90)
      .setDepth(9);
  }
}

export function paintStreet(scene: Phaser.Scene) {
  const w = LAYOUT.street.world;
  const bg = artBg(scene, 'bg-village-street', w);
  if (!bg) {
    const g = scene.add.graphics().setDepth(0);
    g.fillStyle(0x1b2230, 1);
    g.fillRect(0, 0, w, 1080);
    g.fillStyle(0x3a342c, 1);
    g.fillRect(0, 740, w, 340);
  }
  // Decorative white cloths on the street plate are NOT the nineteen mourning strips puzzle.
}

export function drawCloth(scene: Phaser.Scene, x: number, y: number, short: boolean) {
  if (scene.textures.exists(short ? 'prop-cloth-needle' : 'prop-cloth-long')) {
    const key = short ? 'prop-cloth-needle' : 'prop-cloth-long';
    return scene.add
      .image(x, y, key)
      .setOrigin(0, 0)
      .setDisplaySize(short ? 40 : 48, short ? 80 : 140)
      .setDepth(12);
  }
  const g = scene.add.graphics().setDepth(12);
  g.fillStyle(0xf4f1ea, 0.95);
  g.fillRoundedRect(x, y, short ? 18 : 26, short ? 70 : 130, 3);
  if (short) {
    g.fillStyle(0x222, 1);
    g.fillCircle(x + 8, y + 58, 3);
  }
  return g;
}
