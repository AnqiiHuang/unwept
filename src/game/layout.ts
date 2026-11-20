/** Default foot line (灵堂板). Shore / gate / street panoramas put the road lower. */
export const FOOT = 800;
export const VIEW_W = 1920;
export const VIEW_H = 1080;

export type LayoutScene = 'PRO-01' | 'PRO-02' | 'CH1-01' | 'CH1-03';

/** Foot Y for each plate so characters stand on the painted road, not the water. */
export function footFor(scene: LayoutScene): number {
  if (scene === 'PRO-01') return 940;
  if (scene === 'PRO-02') return 920;
  if (scene === 'CH1-03') return 930;
  return FOOT;
}

/**
 * World widths for shore / gate / street match the supplement panoramas
 * scaled to height 1080 (2172×724 → 3240×1080). No soft-fill padding.
 * Hall keeps the prior 3600 plate until a matching hall panorama arrives.
 */
export const LAYOUT = {
  pro01: {
    world: 3240,
    minX: 160,
    maxX: 3080,
    stake: 720,
    prints: 1180,
    changgui: 1680,
    introFrom: 900,
    stand: 2080,
    singX: 2480,
    exit: 2980,
    wetUntil: 400,
  },
  pro02: {
    world: 3240,
    minX: 140,
    maxX: 3100,
    fromShore: 280,
    notice: 880,
    guifen: 1580,
    door: 2140,
    fromHall: 2040,
  },
  hall: {
    world: 3600,
    minX: 420,
    maxX: 3180,
    door: 520,
    stool: 1560,
    guyu: 1760,
    guifen: 2060,
    hook: 2360,
    photo: 2620,
    curtain: 3000,
    jianjun: 2860,
    spawn: 760,
    street: 3160,
  },
  street: {
    world: 3240,
    minX: 120,
    maxX: 3120,
    fromHall: 260,
    stove: 680,
    window: 1480,
    bed: 2180,
    end: 3000,
  },
} as const;
