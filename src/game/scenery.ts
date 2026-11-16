import Phaser from 'phaser';
import { FOOT, LAYOUT } from './layout';

function sky(g: Phaser.GameObjects.Graphics, w: number, top: number, bottom: number) {
  g.fillGradientStyle(top, top, bottom, bottom, 1);
  g.fillRect(0, 0, w, 620);
}

export function paintPro01(scene: Phaser.Scene) {
  const w = LAYOUT.pro01.world;
  const skyG = scene.add.graphics().setDepth(0);
  sky(skyG, w, 0x3c4058, 0xc4846a);
  const far = scene.add.graphics().setDepth(1);
  far.fillStyle(0x6d7c86, 1);
  far.fillRect(0, 560, w, 120);
  far.fillStyle(0x8ea0a6, 0.55);
  far.fillEllipse(420, 590, 900, 70);
  far.fillStyle(0x5d564e, 0.9);
  far.fillTriangle(80, 560, 260, 430, 460, 560);
  far.fillTriangle(300, 560, 520, 390, 760, 560);
  far.fillStyle(0xd9d3c8, 0.8);
  for (let i = 0; i < 5; i++) {
    far.fillRect(140 + i * 70, 500, 36, 28);
    far.fillTriangle(132 + i * 70, 500, 158 + i * 70, 478, 184 + i * 70, 500);
  }
  const ground = scene.add.graphics().setDepth(2);
  ground.fillStyle(0x4a3b32, 1);
  ground.fillRect(0, 700, w, 380);
  ground.fillStyle(0x3d4e55, 0.55);
  ground.fillEllipse(700, 860, 900, 180);
  ground.fillStyle(0x8a6a4e, 1);
  ground.fillRect(LAYOUT.pro01.wetUntil, 760, w, 320);
  ground.fillStyle(0xcbb48a, 0.35);
  ground.fillEllipse(2100, 820, 220, 36);
  const props = scene.add.graphics().setDepth(6);
  props.fillStyle(0x5a4636, 1);
  props.fillRect(2500, 700, 280, 28);
  props.fillRect(2520, 640, 18, 90);
  props.fillRect(2740, 650, 16, 80);
  props.fillStyle(0x6a5038, 1);
  props.fillRoundedRect(1180, 760, 210, 26, 6);
  props.fillRect(1240, 620, 18, 160);
  props.lineStyle(6, 0xd7d2c6, 0.9);
  props.beginPath();
  props.moveTo(1250, 700);
  props.lineTo(1360, 660);
  props.strokePath();
  props.fillStyle(0x2a241e, 0.8);
  for (let i = 0; i < 4; i++) props.fillEllipse(1980 + i * 46, 790, 26, 14);
  const front = scene.add.graphics().setDepth(40);
  reeds(front, 80, 0xc2b48a);
  reeds(front, 4700, 0xb7a27a);
  const tag = scene.add.text(24, 24, '开发占位 · 库边泥滩　远景按水库岸的光色画，不是成稿分层', {
    fontFamily: '"Songti SC", serif',
    fontSize: '22px',
    color: '#f0e6d6',
    backgroundColor: '#00000066',
  }).setScrollFactor(0).setDepth(50);
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
