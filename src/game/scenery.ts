import Phaser from 'phaser';
import { FOOT, LAYOUT } from './layout';

function sky(g: Phaser.GameObjects.Graphics, w: number, top: number, bottom: number) {
  g.fillGradientStyle(top, top, bottom, bottom, 1);
  g.fillRect(0, 0, w, 620);
}

export function paintPro01(scene: Phaser.Scene) {
  const L = LAYOUT.pro01;
  const w = L.world;
  const skyG = scene.add.graphics().setDepth(0);
  sky(skyG, w, 0x6e7584, 0xe7b08a);
  skyG.fillStyle(0xc4846a, 0.55);
  skyG.fillRect(0, 500, w, 160);
  const far = scene.add.graphics().setDepth(1);
  far.fillStyle(0x8a9390, 1);
  far.fillTriangle(0, 620, 220, 400, 640, 620);
  far.fillTriangle(380, 620, 760, 360, 1180, 620);
  far.fillStyle(0x5c6a62, 1);
  far.fillTriangle(900, 620, 1320, 430, 1760, 620);
  far.fillTriangle(2100, 600, 2680, 390, 3300, 600);
  far.fillTriangle(3600, 590, 4300, 340, 5100, 590);
  far.fillStyle(0xd9d3c8, 0.85);
  for (let i = 0; i < 6; i++) {
    const x = 240 + i * 78;
    far.fillRect(x, 548, 34, 36);
    far.fillTriangle(x - 8, 548, x + 17, 522, x + 42, 548);
  }
  far.fillStyle(0x8aa0a8, 0.35);
  far.fillRect(180, 590, 520, 8);
  const water = scene.add.graphics().setDepth(2);
  water.fillStyle(0x8aa0a8, 1);
  water.fillRect(0, 600, 1680, 200);
  water.fillStyle(0xe7b08a, 0.35);
  water.fillEllipse(620, 690, 780, 36);
  water.fillStyle(0x6e858c, 0.45);
  water.fillEllipse(240, 710, 420, 28);
  const ground = scene.add.graphics().setDepth(3);
  ground.fillStyle(0x8d6a48, 1);
  ground.fillRect(0, 620, w, 460);
  ground.fillStyle(0x6a5344, 1);
  ground.fillRect(0, 740, 1500, 340);
  ground.fillStyle(0x7a6248, 0.55);
  for (let i = 0; i < 5; i++) ground.fillEllipse(180 + i * 210, 900 + (i % 2) * 30, 260, 28);
  ground.fillStyle(0xa88460, 1);
  ground.fillRect(980, 700, w, 380);
  ground.fillStyle(0xc4a078, 0.45);
  ground.beginPath();
  ground.moveTo(1200, 1080);
  ground.lineTo(1400, 820);
  ground.lineTo(3240, 790);
  ground.lineTo(L.exit, 700);
  ground.lineTo(w, 660);
  ground.lineTo(w, 1080);
  ground.closePath();
  ground.fillPath();
  ground.fillStyle(0x8d6a48, 1);
  for (let i = 0; i < 8; i++) {
    const x = 3900 + i * 150;
    const y = 700 - i * 8;
    ground.fillRect(x, y, 120, 14);
  }
  const props = scene.add.graphics().setDepth(8);
  const stake = L.stake;
  props.fillStyle(0x3a2a22, 0.35);
  props.fillEllipse(stake + 20, FOOT + 8, 120, 18);
  props.lineStyle(16, 0x5a4636, 1);
  props.lineBetween(stake, FOOT + 4, stake - 70, 560);
  props.lineStyle(8, 0x6a5038, 1);
  props.lineBetween(stake - 10, 700, stake + 90, 640);
  props.fillStyle(0x2a241e, 0.85);
  for (let i = 0; i < 6; i++) props.fillEllipse(L.prints - 80 + i * 42, 830 - i * 4, 28, 14);
  props.fillStyle(0x4a3428, 1);
  props.fillRoundedRect(2480, 760, 240, 36, 8);
  props.fillTriangle(2460, 778, 2500, 748, 2540, 778);
  props.fillRect(2680, 748, 18, 48);
  props.fillStyle(0xc4552a, 0.9);
  props.fillCircle(4980, 520, 10);
  props.fillStyle(0xe7b08a, 0.25);
  props.fillCircle(4980, 520, 36);
  const front = scene.add.graphics().setDepth(40);
  reeds(front, 40, 0xc2b48a);
  reeds(front, 4700, 0xb7a27a);
  const tag = scene.add.text(1884, 108, '开发占位 · 库边泥滩\n光色对齐开场，按能走的位置铺，不是成稿分层', {
    fontFamily: '"Songti SC", serif',
    fontSize: '20px',
    color: '#f0e6d6',
    backgroundColor: '#00000066',
    align: 'right',
  }).setOrigin(1, 0).setScrollFactor(0).setDepth(70);
  return { tag };
}

export function paintPro02(scene: Phaser.Scene) {
  const w = LAYOUT.pro02.world;
  const skyG = scene.add.graphics().setDepth(0);
  sky(skyG, w, 0x4a3d52, 0xd09a78);
  const far = scene.add.graphics().setDepth(1);
  far.fillStyle(0x6e6258, 1);
  far.fillTriangle(0, 620, 180, 470, 420, 620);
  const ground = scene.add.graphics().setDepth(2);
  ground.fillStyle(0x7c5e45, 1);
  ground.fillRect(0, 760, w, 320);
  const wall = scene.add.graphics().setDepth(5);
  wall.fillStyle(0xd9d0c3, 1);
  wall.fillRect(900, 300, 2100, 470);
  wall.fillStyle(0x8d8376, 1);
  wall.fillRect(900, 250, 2100, 56);
  wall.fillStyle(0x5c4636, 1);
  for (let x = 900; x < 3000; x += 46) wall.fillRect(x, 236, 28, 18);
  wall.fillStyle(0x2a211c, 1);
  wall.fillRect(2860, 470, 220, 300);
  wall.fillStyle(0xe7b56a, 0.35);
  wall.fillRect(2900, 500, 150, 220);
  wall.fillStyle(0x3d4c6a, 1);
  wall.fillRoundedRect(3120, 430, 70, 120, 6);
  wall.lineStyle(3, 0x6d6458, 1);
  wall.strokeRect(1480, 430, 150, 110);
  wall.fillStyle(0xf4efe4, 1);
  wall.fillRect(1500, 448, 112, 76);
  const front = scene.add.graphics().setDepth(40);
  front.lineStyle(4, 0x6a5a48, 1);
  front.lineBetween(1900, 360, 2500, 360);
  front.fillStyle(0x8aa0b0, 0.9);
  front.fillRoundedRect(2140, 390, 80, 90, 4);
  reeds(front, 40, 0xb08968);
  scene.add.text(24, 24, '开发占位 · 新坳村口　墙和门是按村口参考的位置重画的', {
    fontFamily: '"Songti SC", serif',
    fontSize: '22px',
    color: '#f0e6d6',
    backgroundColor: '#00000066',
  }).setScrollFactor(0).setDepth(50);
}

export function paintHall(scene: Phaser.Scene) {
  const w = LAYOUT.hall.world;
  const g = scene.add.graphics().setDepth(0);
  g.fillStyle(0x2a241e, 1);
  g.fillRect(0, 0, w, 1080);
  g.fillStyle(0x4a4036, 1);
  for (let x = 0; x < w; x += 220) {
    g.fillRect(x, 80, 28, 700);
  }
  g.fillStyle(0x3a312a, 1);
  g.fillRect(0, 760, w, 320);
  const props = scene.add.graphics().setDepth(6);
  props.fillStyle(0x6a543c, 1);
  props.fillRect(2100, 640, 520, 28);
  props.fillRect(2140, 668, 16, 90);
  props.fillRect(2560, 668, 16, 90);
  props.fillStyle(0xcbbfa8, 1);
  props.fillRect(2280, 560, 160, 80);
  props.fillStyle(0x5c4636, 1);
  props.fillRect(LAYOUT.hall.hook - 8, 430, 16, 200);
  props.fillRect(LAYOUT.hall.hook - 30, 500, 50, 10);
  props.fillRoundedRect(LAYOUT.hall.stool - 40, 700, 110, 16, 3);
  props.fillRect(LAYOUT.hall.stool - 28, 716, 10, 70);
  props.fillRect(LAYOUT.hall.stool + 28, 730, 10, 56);
  props.fillStyle(0x241c18, 0.85);
  props.fillRect(LAYOUT.hall.curtain - 80, 360, 200, 420);
  props.fillStyle(0xe7d7a8, 0.8);
  props.fillCircle(2500, 520, 10);
  scene.add.text(24, 24, '开发占位 · 谷家灵堂　不是参考图里的空屋或厝屋', {
    fontFamily: '"Songti SC", serif',
    fontSize: '22px',
    color: '#f0e6d6',
    backgroundColor: '#00000066',
  }).setScrollFactor(0).setDepth(50);
}

export function paintStreet(scene: Phaser.Scene) {
  const w = LAYOUT.street.world;
  const g = scene.add.graphics().setDepth(0);
  g.fillStyle(0x1b2230, 1);
  g.fillRect(0, 0, w, 1080);
  g.fillStyle(0x2a3138, 1);
  g.fillRect(0, 430, w, 330);
  g.fillStyle(0x3a342c, 1);
  g.fillRect(0, 740, w, 340);
  const houses = scene.add.graphics().setDepth(4);
  houses.fillStyle(0x4a4038, 1);
  houses.fillRect(700, 300, 520, 460);
  houses.fillStyle(0x6a2a22, 0.9);
  houses.fillRect(860, 560, 150, 180);
  houses.fillStyle(0x3e4650, 1);
  houses.fillRect(1760, 280, 980, 480);
  houses.fillStyle(0xc9d4de, 0.35);
  houses.fillRect(1880, 390, 280, 220);
  houses.fillRect(2480, 390, 220, 220);
  houses.fillStyle(0x5c4634, 1);
  houses.fillRect(2920, 470, 70, 16);
  houses.fillRect(2936, 430, 36, 18);
  houses.fillStyle(0x6a5844, 1);
  houses.fillRect(1180, 250, 8, 160);
  houses.fillCircle(1184, 250, 10);
  scene.add.text(24, 24, '开发占位 · 新坳街　灶门、窗左、床头画在同一条路上，不是正式背景', {
    fontFamily: '"Songti SC", serif',
    fontSize: '22px',
    color: '#f0e6d6',
    backgroundColor: '#00000066',
  }).setScrollFactor(0).setDepth(50);
}

function reeds(g: Phaser.GameObjects.Graphics, x: number, color: number) {
  for (let i = 0; i < 16; i++) {
    const px = x + i * 16;
    const h = 90 + ((i * 53) % 80);
    g.lineStyle(3, color, 0.9);
    g.lineBetween(px, FOOT + 20, px + 14, FOOT - h);
  }
}

export function drawCloth(scene: Phaser.Scene, x: number, y: number, short: boolean) {
  const g = scene.add.graphics().setDepth(12);
  g.fillStyle(0xf4f1ea, 0.95);
  g.fillRoundedRect(x, y, short ? 18 : 26, short ? 70 : 130, 3);
  if (short) {
    g.fillStyle(0x222, 1);
    g.fillCircle(x + 8, y + 58, 3);
  }
  return g;
}
