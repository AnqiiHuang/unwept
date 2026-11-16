import Phaser from 'phaser';

export const FONT = '"Songti SC", "STSong", "Noto Serif SC", "Source Han Serif SC", "PMingLiU", serif';

export function textStyle(size: number, color = '#f3eadb'): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: FONT,
    fontSize: `${size}px`,
    color,
    wordWrap: { width: 1200, useAdvancedWrap: true },
  };
}

export interface ButtonHandle {
  root: Phaser.GameObjects.Container;
  setLabel: (value: string) => void;
  setEnabled: (on: boolean) => void;
}

export function makeButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  onClick: () => void,
): ButtonHandle {
  const root = scene.add.container(x, y);
  const g = scene.add.graphics();
  const labelText = scene.add.text(0, 0, label, textStyle(28, '#f4ecdf')).setOrigin(0.5);
  const paint = (enabled: boolean) => {
    g.clear();
    g.fillStyle(enabled ? 0x2c261f : 0x221e1a, 0.94);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    g.lineStyle(2, enabled ? 0xd9c7a4 : 0x6d6458, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    labelText.setAlpha(enabled ? 1 : 0.45);
  };
  paint(true);
  root.add([g, labelText]);
  root.setScrollFactor(0);
  root.setSize(w, h);
  const hit = () => {
    const ox = root.displayOriginX;
    const oy = root.displayOriginY;
    return new Phaser.Geom.Rectangle(ox - w / 2, oy - h / 2, w, h);
  };
  root.setInteractive(hit(), Phaser.Geom.Rectangle.Contains);
  root.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    pointer.event?.stopPropagation?.();
    onClick();
  });
  return {
    root,
    setLabel: (value) => labelText.setText(value),
    setEnabled: (on) => {
      paint(on);
      if (on) root.setInteractive(hit(), Phaser.Geom.Rectangle.Contains);
      else root.disableInteractive();
    },
  };
}
