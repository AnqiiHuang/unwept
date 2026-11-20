import Phaser from 'phaser';
import { FOOT, LAYOUT } from './layout';

function artBg(scene: Phaser.Scene, key: string, worldW: number, tag: string) {
  if (scene.textures.exists(key)) {
    const img = scene.add.image(0, 0, key).setOrigin(0, 0).setDepth(0);
    img.setDisplaySize(worldW, 1080);
    scene.add
      .text(1884, 108, tag, {
        fontFamily: '"Songti SC", serif',
        fontSize: '18px',
        color: '#f0e6d6',
        backgroundColor: '#00000066',
        align: 'right',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(70);
    return img;
  }
  return null;
}

function sky(g: Phaser.GameObjects.Graphics, w: number, top: number, bottom: number) {
  g.fillGradientStyle(top, top, bottom, bottom, 1);
  g.fillRect(0, 0, w, 620);
}

function reeds(g: Phaser.GameObjects.Graphics, x: number, color: number) {
  for (let i = 0; i < 16; i++) {
    const px = x + i * 16;
    const h = 90 + ((i * 53) % 80);
    g.lineStyle(3, color, 0.9);
    g.lineBetween(px, FOOT + 20, px + 14, FOOT - h);
  }
}

/** Shore prop overlays at layout anchors when painted plate lacks them or needs emphasis. */
function shoreAnchors(scene: Phaser.Scene) {
  const L = LAYOUT.pro01;
  if (scene.textures.exists('prop-footprints')) {
    scene.add
      .image(L.prints, FOOT - 8, 'prop-footprints')
      .setOrigin(0.5, 1)
      .setDisplaySize(220, 90)
      .setDepth(8)
      .setAlpha(0.92);
  }
  if (scene.textures.exists('prop-wood-post')) {
    scene.add
      .image(L.stake, FOOT + 4, 'prop-wood-post')
      .setOrigin(0.55, 1)
      .setDisplaySize(120, 260)
      .setAngle(-28)
      .setDepth(8);
  }
  if (scene.textures.exists('prop-boat')) {
    scene.add
      .image(L.changgui - 80, FOOT - 10, 'prop-boat')
      .setOrigin(0.5, 1)
      .setDisplaySize(280, 90)
      .setDepth(7);
  }
  if (scene.textures.exists('prop-reeds')) {
    scene.add.image(80, 1080, 'prop-reeds').setOrigin(0.5, 1).setDisplaySize(320, 360).setDepth(40);
    scene.add.image(L.world - 120, 1080, 'prop-reeds').setOrigin(0.5, 1).setDisplaySize(360, 380).setDepth(40);
  }
}

export function paintPro01(scene: Phaser.Scene) {
  const L = LAYOUT.pro01;
  const w = L.world;
  const bg = artBg(
    scene,
    'bg-shore',
    w,
    '库边　新绘板等比铺开，右侧软延展待补画\n路面与倒桩、鞋印热点按 layout 对齐',
  );
  if (!bg) {
    const skyG = scene.add.graphics().setDepth(0);
    sky(skyG, w, 0x6e7584, 0xe7b08a);
    skyG.fillStyle(0xc4846a, 0.55);
    skyG.fillRect(0, 500, w, 160);
    const ground = scene.add.graphics().setDepth(3);
    ground.fillStyle(0xa88460, 1);
    ground.fillRect(0, 620, w, 460);
  }
  shoreAnchors(scene);
  return { tag: null };
}

export function paintPro02(scene: Phaser.Scene) {
  const w = LAYOUT.pro02.world;
  const bg = artBg(scene, 'bg-village-gate', w, '新坳村口　新绘板等比铺开，右侧软延展待补画');
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
  const bg = artBg(scene, 'bg-mourning-hall', w, '谷家灵堂　新绘板等比铺开');
  if (!bg) {
    const g = scene.add.graphics().setDepth(0);
    g.fillStyle(0x2a241e, 1);
    g.fillRect(0, 0, w, 1080);
    g.fillStyle(0x3a312a, 1);
    g.fillRect(0, 760, w, 320);
  }
  // Nineteen mourning strips: sheet count ≠ 19, lay single cloth prop.
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
      .image(LAYOUT.hall.stool, FOOT, 'prop-stool')
      .setOrigin(0.5, 1)
      .setDisplaySize(90, 90)
      .setDepth(9);
  }
}

export function paintStreet(scene: Phaser.Scene) {
  const w = LAYOUT.street.world;
  const bg = artBg(scene, 'bg-village-street', w, '新坳街　新绘板等比铺开，右侧软延展待补画');
  if (!bg) {
    const g = scene.add.graphics().setDepth(0);
    g.fillStyle(0x1b2230, 1);
    g.fillRect(0, 0, w, 1080);
    g.fillStyle(0x3a342c, 1);
    g.fillRect(0, 740, w, 340);
  }
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
