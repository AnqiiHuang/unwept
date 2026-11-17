export const FOOT = 800;
export const VIEW_W = 1920;
export const VIEW_H = 1080;

export const LAYOUT = {
  pro01: {
    world: 5200,
    minX: 1080,
    maxX: 4480,
    stake: 1280,
    prints: 2100,
    changgui: 2720,
    introFrom: 1760,
    stand: 3240,
    singX: 3960,
    exit: 4420,
    wetUntil: 1080,
  },
  pro02: {
    world: 4000,
    minX: 360,
    maxX: 3280,
    fromShore: 560,
    notice: 1560,
    guifen: 2280,
    door: 3000,
    fromHall: 2760,
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
    world: 4600,
    minX: 280,
    maxX: 4200,
    fromHall: 640,
    stove: 980,
    window: 2100,
    bed: 3200,
    end: 4080,
  },
} as const;
