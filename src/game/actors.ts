import Phaser from 'phaser';

export type ActorKind = 'xiaoman' | 'changgui' | 'guyu' | 'guifen' | 'jianjun';

function drawBowl(g: Phaser.GameObjects.Graphics) {
  g.clear();
  g.fillStyle(0xe7e1d4, 1);
  g.fillEllipse(36, -128, 34, 16);
  g.lineStyle(3, 0xb7aa98, 1);
  g.strokeEllipse(36, -128, 34, 16);
  g.fillStyle(0x8fb4c4, 0.85);
  g.fillEllipse(36, -128, 22, 8);
  g.fillStyle(0xc9b8a4, 1);
  g.fillRect(48, -132, 6, 5);
}

function drawXiaoman(g: Phaser.GameObjects.Graphics) {
  g.fillStyle(0x241c16, 0.35);
  g.fillEllipse(0, -6, 70, 16);
  g.fillStyle(0x2c3136, 1);
  g.fillRoundedRect(-18, -86, 16, 74, 4);
  g.fillRoundedRect(4, -86, 16, 74, 4);
  g.fillStyle(0x161616, 1);
  g.fillEllipse(-10, -12, 26, 12);
  g.fillEllipse(12, -12, 26, 12);
  g.fillStyle(0x7e93a4, 1);
  g.fillRoundedRect(-32, -176, 64, 98, 10);
  g.fillStyle(0x243038, 1);
  for (let i = 0; i < 4; i++) g.fillCircle(-2, -158 + i * 16, 3);
  g.fillStyle(0xf0d2bc, 1);
  g.fillCircle(10, -204, 20);
  g.fillStyle(0x1b1918, 1);
  g.fillCircle(6, -214, 18);
  g.fillEllipse(-18, -196, 16, 36);
  g.fillStyle(0xf0d2bc, 1);
  g.fillRoundedRect(24, -168, 12, 36, 4);
}

function drawChanggui(g: Phaser.GameObjects.Graphics) {
  g.fillStyle(0x241c16, 0.35);
  g.fillEllipse(10, -4, 90, 16);
  g.fillStyle(0x5c5348, 1);
  g.fillRoundedRect(-10, -78, 64, 22, 6);
  g.fillRoundedRect(-36, -70, 40, 16, 5);
  g.fillStyle(0x6a6258, 1);
  g.fillRoundedRect(-20, -132, 58, 62, 8);
  g.fillStyle(0xe0c2a8, 1);
  g.fillCircle(18, -156, 16);
  g.fillStyle(0x3a342e, 1);
  g.fillRect(2, -168, 28, 8);
  g.fillStyle(0xb9b3aa, 1);
  g.fillRect(40, -78, 22, 6);
}

function drawGuyu(g: Phaser.GameObjects.Graphics) {
  g.fillStyle(0x241c16, 0.3);
  g.fillEllipse(0, -4, 50, 12);
  g.fillStyle(0x3d342c, 1);
  g.fillRoundedRect(-14, -58, 12, 48, 4);
  g.fillRoundedRect(4, -58, 12, 48, 4);
  g.fillStyle(0x111, 1);
  g.fillEllipse(-8, -10, 18, 8);
  g.fillEllipse(10, -10, 18, 8);
  g.fillStyle(0x8d4034, 1);
  g.fillRoundedRect(-22, -118, 44, 64, 8);
  g.fillStyle(0xf2d3b8, 1);
  g.fillCircle(8, -138, 15);
  g.fillStyle(0x221c18, 1);
  g.fillCircle(4, -146, 14);
  g.fillEllipse(-14, -132, 10, 28);
  g.fillStyle(0xefeae2, 1);
  g.fillCircle(18, -96, 4);
}

function drawGuifen(g: Phaser.GameObjects.Graphics) {
  g.fillStyle(0x241c16, 0.3);
  g.fillEllipse(0, -6, 64, 14);
  g.fillStyle(0x3a332e, 1);
  g.fillRoundedRect(-16, -84, 14, 70, 4);
  g.fillRoundedRect(4, -84, 14, 70, 4);
  g.fillStyle(0x6d7278, 1);
  g.fillRoundedRect(-30, -170, 60, 94, 8);
  g.fillStyle(0xc2b6a4, 0.95);
  g.fillRoundedRect(-22, -150, 44, 50, 4);
  g.fillStyle(0xf0d0b4, 1);
  g.fillCircle(8, -196, 18);
  g.fillStyle(0x2a211c, 1);
  g.fillCircle(6, -206, 16);
  g.fillEllipse(0, -188, 22, 12);
}

function drawJianjun(g: Phaser.GameObjects.Graphics) {
  g.fillStyle(0x241c16, 0.3);
  g.fillEllipse(0, -6, 70, 14);
  g.fillStyle(0x2a3034, 1);
  g.fillRoundedRect(-18, -90, 16, 78, 4);
  g.fillRoundedRect(4, -90, 16, 78, 4);
  g.fillStyle(0x111, 1);
  g.fillEllipse(-10, -12, 24, 10);
  g.fillEllipse(12, -12, 24, 10);
  g.fillStyle(0x4e5960, 1);
  g.fillRoundedRect(-34, -178, 68, 96, 8);
  g.fillStyle(0xe6c4a6, 1);
  g.fillCircle(12, -204, 18);
  g.fillStyle(0x1c1a18, 1);
  g.fillRect(-4, -214, 30, 10);
  g.fillStyle(0xc2b8a4, 1);
  g.fillRoundedRect(-28, -120, 16, 10, 2);
}

const DRAW: Record<ActorKind, (g: Phaser.GameObjects.Graphics) => void> = {
  xiaoman: drawXiaoman,
  changgui: drawChanggui,
  guyu: drawGuyu,
  guifen: drawGuifen,
  jianjun: drawJianjun,
};

const SCENE_HEIGHT: Record<ActorKind, number> = {
  xiaoman: 360,
  guyu: 274,
  changgui: 360,
  guifen: 360,
  jianjun: 360,
};

function fitHeight(sprite: Phaser.GameObjects.Image, height: number) {
  const source = sprite.texture.getSourceImage() as { width: number; height: number };
  const aspect = source.width / source.height;
  sprite.setDisplaySize(height * aspect, height);
}

export function createActor(scene: Phaser.Scene, kind: ActorKind) {
  const root = scene.add.container(0, 0);
  const height = SCENE_HEIGHT[kind];
  const key = kind === 'xiaoman' ? 'scene-xiaoman-1' : `scene-${kind}`;
  if (scene.textures.exists(key)) {
    const sprite = scene.add.image(0, 0, key).setOrigin(0.5, 1);
    fitHeight(sprite, height);
    const shadowW = Math.max(46, sprite.displayWidth * 0.42);
    const shadow = scene.add.ellipse(0, -6, shadowW, 16, 0x241c16, 0.35);
    root.add([shadow, sprite]);
    root.setData('sprite', sprite);
    root.setData('bodyHeight', height);
    if (kind === 'xiaoman') {
      root.setData('frames', ['scene-xiaoman-1', 'scene-xiaoman-2', 'scene-xiaoman-3']);
      root.setData('bowlKey', 'scene-xiaoman-bowl');
      root.setData('carryKey', 'scene-xiaoman-carry');
    }
  } else {
    const body = scene.add.graphics();
    DRAW[kind](body);
    root.add(body);
  }
  const bowl = scene.add.graphics();
  drawBowl(bowl);
  bowl.setVisible(false);
  root.add(bowl);
  root.setData('bowl', bowl);
  root.setData('kind', kind);
  return root;
}

export function setBowl(actor: Phaser.GameObjects.Container, on: boolean) {
  actor.setData('bowlOn', on);
}

export function setCarry(actor: Phaser.GameObjects.Container, on: boolean) {
  actor.setData('carryOn', on);
}

export function syncActor(actor: Phaser.GameObjects.Container, moving: boolean, time: number, bowlHigh: boolean) {
  const sprite = actor.getData('sprite') as Phaser.GameObjects.Image | undefined;
  const bowl = actor.getData('bowl') as Phaser.GameObjects.Graphics | undefined;
  const bowlOn = Boolean(actor.getData('bowlOn'));
  const carryOn = Boolean(actor.getData('carryOn'));
  const frames = actor.getData('frames') as string[] | undefined;
  const bowlKey = actor.getData('bowlKey') as string | undefined;
  const carryKey = actor.getData('carryKey') as string | undefined;
  const height = (actor.getData('bodyHeight') as number | undefined) ?? 360;
  const showPaintedBowl = Boolean(bowlOn && !moving && bowlKey && sprite);
  const showCarry = Boolean(!showPaintedBowl && carryOn && !moving && carryKey && sprite);
  if (sprite && frames?.length) {
    const key = showPaintedBowl
      ? bowlKey!
      : showCarry
        ? carryKey!
        : moving
          ? frames[Math.floor(time / 160) % frames.length]
          : frames[0];
    if (sprite.texture.key !== key && sprite.scene.textures.exists(key)) {
      sprite.setTexture(key);
      fitHeight(sprite, height);
    }
  }
  if (!bowl) return;
  bowl.setVisible(bowlOn && !showPaintedBowl);
  bowl.setPosition(34, bowlHigh ? -height * 0.62 : -height * 0.55);
  bowl.setScale(height / 300);
}
