export const SAVE_VERSION = 1;
export const SAVE_KEY = 'unwept-save-v1';
export const SAVE_BAK_KEY = 'unwept-save-v1-bak';
export const SETTINGS_KEY = 'unwept-settings-v1';

export type SceneId = 'PRO-01' | 'PRO-02' | 'CH1-01';
export type ClothId = 'long' | 'short';
export type OathEffect = 'clear' | 'suppressed';

export interface Settings {
  master: number;
  subtitles: boolean;
  largeText: boolean;
  reduceMotion: boolean;
}

export interface GameState {
  version: number;
  beat: 'F06';
  scene: SceneId;
  x: number;
  facing: 1 | -1;
  openingDone: boolean;
  inventory: string[];
  notes: string[];
  evidence: string[];
  steps: string[];
  pro01Intro: boolean;
  chestAside: boolean;
  mudExamined: boolean;
  liningRead: boolean;
  bowlTaken: boolean;
  stationPrints: boolean;
  stationStake: boolean;
  shoreTalk: boolean;
  l03: boolean;
  heardContinuation: boolean;
  askedGuyu: boolean;
  askedChanggui: boolean;
  songDone: boolean;
  pro02Intro: boolean;
  fishTold: boolean;
  e23Read: boolean;
  teaDecided: boolean;
  drankOathWater: boolean;
  oathEffect: OathEffect;
  hallIntro: boolean;
  photoSeen: boolean;
  stoolSteadied: boolean;
  clothsGiven: boolean;
  l01: boolean;
  hookCloth: '' | ClothId;
  stoolCloth: '' | ClothId;
  curtainLifted: boolean;
  pz01Done: boolean;
  roundAck: boolean;
  named: string[];
  sent: string[];
  seenEcho: string[];
  pz02Done: boolean;
  letterKnown: boolean;
  birthKnown: boolean;
  wellOpened: boolean;
  sang20th: boolean;
  sawTally: boolean;
  tallyRead: boolean;
  trustLan: 'hold';
  trustJian: 'hold';
  trustZhou: 'hold';
  dealState: 'none';
  publicFile: boolean;
  villageAck: boolean;
  familyKnown: boolean;
  homeExit: boolean;
  escort: boolean;
  yuState: 'in_village';
}

export type Action =
  | { type: 'finishOpening' }
  | { type: 'finishPro01Intro'; x: number; facing: 1 | -1 }
  | { type: 'moveChest' }
  | { type: 'examineMud' }
  | { type: 'readLining' }
  | { type: 'takeBowl' }
  | { type: 'measure'; station: 'prints' | 'stake' }
  | { type: 'shoreTalk' }
  | { type: 'judge'; side: 'stake' | 'upslope' }
  | { type: 'hearContinuation' }
  | { type: 'askShore'; who: 'guyu' | 'changgui' }
  | { type: 'finishSong' }
  | { type: 'finishPro02Intro' }
  | { type: 'fish' }
  | { type: 'readE23' }
  | { type: 'tea'; choice: 'drink' | 'pour' }
  | { type: 'finishHallIntro' }
  | { type: 'seePhoto' }
  | { type: 'steadyStool' }
  | { type: 'receiveCloths' }
  | { type: 'placeCloth'; cloth: ClothId; target: 'hook' | 'stool' }
  | { type: 'demoHook' }
  | { type: 'liftCurtain' }
  | { type: 'ackRound' }
  | { type: 'travel'; to: SceneId; x: number; facing: 1 | -1 }
  | { type: 'move'; x: number; facing: 1 | -1 };

export interface ApplyResult {
  ok: boolean;
  repeat: boolean;
  code: string;
}

const PROTECTED = {
  pz02Done: false,
  letterKnown: false,
  birthKnown: false,
  wellOpened: false,
  sang20th: false,
  sawTally: false,
  tallyRead: false,
  trustLan: 'hold',
  trustJian: 'hold',
  trustZhou: 'hold',
  dealState: 'none',
  publicFile: false,
  villageAck: false,
  familyKnown: false,
  homeExit: false,
  escort: false,
  yuState: 'in_village',
} as const;

export function newGame(): GameState {
  return {
    version: SAVE_VERSION,
    beat: 'F06',
    scene: 'PRO-01',
    x: 1760,
    facing: 1,
    openingDone: false,
    inventory: [],
    notes: [],
    evidence: [],
    steps: [],
    pro01Intro: false,
    chestAside: false,
    mudExamined: false,
    liningRead: false,
    bowlTaken: false,
    stationPrints: false,
    stationStake: false,
    shoreTalk: false,
    l03: false,
    heardContinuation: false,
    askedGuyu: false,
    askedChanggui: false,
    songDone: false,
    pro02Intro: false,
    fishTold: false,
    e23Read: false,
    teaDecided: false,
    drankOathWater: false,
    oathEffect: 'clear',
    hallIntro: false,
    photoSeen: false,
    stoolSteadied: false,
    clothsGiven: false,
    l01: false,
    hookCloth: '',
    stoolCloth: '',
    curtainLifted: false,
    pz01Done: false,
    roundAck: false,
    named: [],
    sent: [],
    seenEcho: [],
    ...PROTECTED,
  };
}

export function defaultSettings(): Settings {
  return { master: 0.8, subtitles: true, largeText: false, reduceMotion: false };
}

function clone(s: GameState): GameState {
  return {
    ...s,
    inventory: [...s.inventory],
    notes: [...s.notes],
    evidence: [...s.evidence],
    steps: [...s.steps],
    named: [...s.named],
    sent: [...s.sent],
    seenEcho: [...s.seenEcho],
  };
}

function pushOnce(list: string[], id: string) {
  if (!list.includes(id)) list.push(id);
}

function done(state: GameState, code: string, repeat = false): { state: GameState; result: ApplyResult } {
  return { state, result: { ok: true, repeat, code } };
}

function blocked(state: GameState, code: string): { state: GameState; result: ApplyResult } {
  return { state, result: { ok: false, repeat: false, code } };
}

export function holding(s: GameState, id: string) {
  return s.inventory.includes(id);
}

export function travelBlock(s: GameState, to: SceneId): string | null {
  if (s.scene === 'PRO-01' && to === 'PRO-02') {
    if (!s.bowlTaken) return 'bowl';
    if (!s.stationPrints || !s.stationStake) return 'stations';
    if (!s.l03) return 'l03';
    if (!s.heardContinuation) return 'heard';
    if (!s.songDone) return 'song';
    return null;
  }
  if (s.scene === 'PRO-02' && to === 'PRO-01') return null;
  if (s.scene === 'PRO-02' && to === 'CH1-01') {
    if (!s.e23Read) return 'e23';
    if (!s.teaDecided) return 'tea';
    return null;
  }
  if (s.scene === 'CH1-01' && to === 'PRO-02') return null;
  return 'path';
}

export function apply(input: GameState, action: Action): { state: GameState; result: ApplyResult } {
  const s = clone(input);
  switch (action.type) {
    case 'move':
      s.x = action.x;
      s.facing = action.facing;
      return done(s, 'move');
    case 'finishOpening':
      if (s.openingDone) return done(input, 'opening', true);
      s.openingDone = true;
      return done(s, 'opening');
    case 'finishPro01Intro':
      if (s.pro01Intro) return done(input, 'pro01-intro', true);
      s.pro01Intro = true;
      s.x = action.x;
      s.facing = action.facing;
      return done(s, 'pro01-intro');
    case 'moveChest':
      if (s.chestAside) return done(input, 'chest-aside', true);
      s.chestAside = true;
      return done(s, 'chest-aside');
    case 'examineMud':
      if (s.mudExamined) return done(input, 'mud', true);
      s.mudExamined = true;
      pushOnce(s.notes, 'MUD');
      return done(s, 'mud');
    case 'readLining':
      if (s.liningRead) return done(input, 'lining', true);
      s.liningRead = true;
      pushOnce(s.notes, 'LINING');
      return done(s, 'lining');
    case 'takeBowl':
      if (s.bowlTaken) return done(input, 'bowl', true);
      s.bowlTaken = true;
      pushOnce(s.inventory, 'O01');
      pushOnce(s.steps, 'PRO-01.bowl');
      return done(s, 'bowl');
    case 'measure': {
      if (!s.bowlTaken) return blocked(input, 'need-bowl');
      const flag = action.station === 'prints' ? 'stationPrints' : 'stationStake';
      const note = action.station === 'prints' ? 'OBS_PRINTS' : 'OBS_STAKE';
      const step = action.station === 'prints' ? 'PRO-01.measure.prints' : 'PRO-01.measure.stake';
      if (s[flag]) return done(input, 'measure', true);
      s[flag] = true;
      pushOnce(s.notes, note);
      pushOnce(s.steps, step);
      return done(s, 'measure');
    }
    case 'shoreTalk':
      if (!s.stationPrints || !s.stationStake) return blocked(input, 'need-stations');
      if (s.shoreTalk) return done(input, 'shore', true);
      s.shoreTalk = true;
      return done(s, 'shore');
    case 'judge': {
      if (!s.stationPrints || !s.stationStake) return blocked(input, 'need-stations');
      if (action.side === 'upslope') return blocked(input, 'wrong-side');
      if (s.l03) return done(input, 'l03', true);
      s.l03 = true;
      s.shoreTalk = true;
      pushOnce(s.notes, 'L03');
      pushOnce(s.steps, 'L03');
      return done(s, 'l03');
    }
    case 'hearContinuation':
      if (!s.l03) return blocked(input, 'need-l03');
      if (s.heardContinuation) return done(input, 'heard', true);
      s.heardContinuation = true;
      pushOnce(s.notes, 'HEARD');
      pushOnce(s.steps, 'PRO-01.heard');
      return done(s, 'heard');
    case 'askShore': {
      if (!s.heardContinuation) return blocked(input, 'need-heard');
      const key = action.who === 'guyu' ? 'askedGuyu' : 'askedChanggui';
      if (s[key]) return done(input, 'ask', true);
      s[key] = true;
      return done(s, 'ask');
    }
    case 'finishSong':
      if (!s.heardContinuation) return blocked(input, 'need-heard');
      if (s.songDone) return done(input, 'song', true);
      s.songDone = true;
      pushOnce(s.steps, 'PRO-01.song');
      return done(s, 'song');
    case 'finishPro02Intro':
      if (s.pro02Intro) return done(input, 'pro02-intro', true);
      s.pro02Intro = true;
      return done(s, 'pro02-intro');
    case 'fish':
      if (s.fishTold) return done(input, 'fish', true);
      s.fishTold = true;
      return done(s, 'fish');
    case 'readE23':
      if (s.e23Read) return done(input, 'e23', true);
      s.e23Read = true;
      pushOnce(s.evidence, 'E23');
      pushOnce(s.steps, 'E23.notice');
      return done(s, 'e23');
    case 'tea':
      if (!s.e23Read) return blocked(input, 'need-e23');
      if (s.teaDecided) return done(input, 'tea', true);
      s.teaDecided = true;
      if (action.choice === 'drink') {
        s.drankOathWater = true;
        s.oathEffect = 'suppressed';
        pushOnce(s.steps, 'TEA.drink');
      } else {
        s.drankOathWater = false;
        s.oathEffect = 'clear';
        pushOnce(s.steps, 'TEA.pour');
      }
      return done(s, 'tea');
    case 'finishHallIntro':
      if (s.hallIntro) return done(input, 'hall-intro', true);
      s.hallIntro = true;
      return done(s, 'hall-intro');
    case 'seePhoto':
      if (s.photoSeen) return done(input, 'photo', true);
      s.photoSeen = true;
      pushOnce(s.notes, 'PHOTO');
      return done(s, 'photo');
    case 'steadyStool':
      if (!s.hallIntro) return blocked(input, 'need-hall');
      if (s.stoolSteadied) return done(input, 'stool', true);
      s.stoolSteadied = true;
      return done(s, 'stool');
    case 'receiveCloths':
      if (!s.stoolSteadied) return blocked(input, 'need-stool');
      if (s.clothsGiven) return done(input, 'cloths', true);
      s.clothsGiven = true;
      s.l01 = true;
      pushOnce(s.inventory, 'long');
      pushOnce(s.inventory, 'short');
      pushOnce(s.notes, 'L01');
      pushOnce(s.steps, 'PZ-01.given');
      return done(s, 'cloths');
    case 'placeCloth': {
      if (!s.clothsGiven) return blocked(input, 'need-cloths');
      if (s.pz01Done) return blocked(input, 'pz01-done');
      const slot = action.target === 'hook' ? s.hookCloth : s.stoolCloth;
      if (slot) return blocked(input, 'occupied');
      if (!s.inventory.includes(action.cloth)) return blocked(input, 'not-holding');
      if (action.cloth === 'long' && action.target === 'stool') return blocked(input, 'wrong-long');
      if (action.cloth === 'short' && action.target === 'hook') return blocked(input, 'wrong-short');
      s.inventory = s.inventory.filter((id) => id !== action.cloth);
      if (action.target === 'hook') {
        s.hookCloth = 'long';
        pushOnce(s.steps, 'PZ-01.hook');
      } else {
        s.stoolCloth = 'short';
        pushOnce(s.steps, 'PZ-01.stool');
      }
      return done(s, action.target === 'hook' ? 'placed-hook' : 'placed-stool');
    }
    case 'demoHook':
      if (!s.clothsGiven) return blocked(input, 'need-cloths');
      if (s.pz01Done) return blocked(input, 'pz01-done');
      if (s.hookCloth === 'long') return done(input, 'demo', true);
      if (!s.inventory.includes('long')) return blocked(input, 'not-holding');
      s.inventory = s.inventory.filter((id) => id !== 'long');
      s.hookCloth = 'long';
      pushOnce(s.steps, 'PZ-01.hook');
      return done(s, 'demo');
    case 'liftCurtain':
      if (s.curtainLifted) return done(input, 'lift', true);
      if (s.hookCloth !== 'long' || s.stoolCloth !== 'short') return blocked(input, 'need-both');
      s.curtainLifted = true;
      s.pz01Done = true;
      pushOnce(s.notes, 'O08');
      pushOnce(s.steps, 'PZ-01.done');
      return done(s, 'lift');
    case 'ackRound':
      if (!s.pz01Done) return blocked(input, 'need-pz01');
      if (s.roundAck) return done(input, 'ack', true);
      s.roundAck = true;
      return done(s, 'ack');
    case 'travel': {
      const block = travelBlock(s, action.to);
      if (block) return blocked(input, block);
      s.scene = action.to;
      s.x = action.x;
      s.facing = action.facing;
      return done(s, 'travel');
    }
    default:
      return blocked(input, 'unknown');
  }
}

export function objective(s: GameState): string {
  if (s.pz01Done) return '本轮开发到孝布辨亲为止。可以回看岸边和村口。PZ-02 还没开始。';
  if (s.scene === 'CH1-01') {
    if (!s.hallIntro) return '刚进灵堂。';
    if (!s.stoolSteadied) return '帮桂芬把那张矮凳扶稳。';
    if (!s.clothsGiven) return '接过桂芬手里的孝布。';
    return '把孝布放到高钩或矮凳上。放错的那一条会退回来。';
  }
  if (s.scene === 'PRO-02') {
    if (!s.e23Read) return '先把工程告示读完。';
    if (!s.teaDecided) return '桂芬端了茶。可以喝一口，也可以倒在门槛外。';
    return '茶已经有了去处。可以进谷家。';
  }
  if (!s.bowlTaken) return '哭箱在自己手上。先把碗取出来。';
  if (!s.stationPrints || !s.stationStake) return '沿着干处走。鞋印和倒桩两处，都把碗放平看一次。';
  if (!s.l03) return '两处都看过了。判断声音要从哪一侧接过来。';
  if (!s.heardContinuation) return '往坡上走一步，把第一声唱完。';
  if (!s.songDone) return '后头几句还没唱。可以先问谷雨或杜叔。';
  return '沿右侧干路上坡，去新坳。';
}

export function progressLabel(s: GameState): string {
  if (!s.openingDone) return '开场还没看完';
  if (s.pz01Done) return '谷家灵堂 · 孝布已辨明';
  if (s.scene === 'CH1-01') return '谷家灵堂';
  if (s.teaDecided) return s.drankOathWater ? '村口 · 茶已喝下' : '村口 · 茶已倒掉';
  if (s.scene === 'PRO-02') return '新坳村口';
  if (s.songDone) return '库边泥滩 · 可以上坡';
  if (s.bowlTaken) return '库边泥滩 · 碗已取出';
  return '库边泥滩';
}

function storage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function serialize(s: GameState): string {
  return JSON.stringify(s);
}

export function deserialize(raw: string): GameState {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('这份存档读不通，原档还留着。');
  }
  if (!data || typeof data !== 'object') throw new Error('这份存档读不通，原档还留着。');
  const rec = data as Partial<GameState>;
  if (rec.version !== SAVE_VERSION) {
    throw new Error('这份存档的版本当前读不懂，原档还留着，没有改成新游戏。');
  }
  if (rec.scene !== 'PRO-01' && rec.scene !== 'PRO-02' && rec.scene !== 'CH1-01') {
    throw new Error('这份存档的场景读不懂，原档还留着。');
  }
  const base = newGame();
  const merged: GameState = {
    ...base,
    ...rec,
    version: SAVE_VERSION,
    beat: 'F06',
    scene: rec.scene,
    inventory: Array.isArray(rec.inventory) ? rec.inventory.filter((v) => typeof v === 'string') : [],
    notes: Array.isArray(rec.notes) ? rec.notes.filter((v) => typeof v === 'string') : [],
    evidence: Array.isArray(rec.evidence) ? rec.evidence.filter((v) => typeof v === 'string') : [],
    steps: Array.isArray(rec.steps) ? rec.steps.filter((v) => typeof v === 'string') : [],
    named: Array.isArray(rec.named) ? rec.named.filter((v) => typeof v === 'string') : [],
    sent: Array.isArray(rec.sent) ? rec.sent.filter((v) => typeof v === 'string') : [],
    seenEcho: Array.isArray(rec.seenEcho) ? rec.seenEcho.filter((v) => typeof v === 'string') : [],
    facing: rec.facing === -1 ? -1 : 1,
    oathEffect: rec.oathEffect === 'suppressed' ? 'suppressed' : 'clear',
    hookCloth: rec.hookCloth === 'long' || rec.hookCloth === 'short' ? rec.hookCloth : '',
    stoolCloth: rec.stoolCloth === 'long' || rec.stoolCloth === 'short' ? rec.stoolCloth : '',
  };
  return merged;
}

export type Peek =
  | { kind: 'empty' }
  | { kind: 'ok'; state: GameState; restoredFromBackup: boolean }
  | { kind: 'error'; message: string };

export function peekSave(): Peek {
  const store = storage();
  if (!store) return { kind: 'error', message: '这台浏览器写不了本地存档。' };
  const raw = store.getItem(SAVE_KEY);
  if (!raw) return { kind: 'empty' };
  try {
    return { kind: 'ok', state: deserialize(raw), restoredFromBackup: false };
  } catch (err) {
    const bak = store.getItem(SAVE_BAK_KEY);
    if (bak) {
      try {
        return { kind: 'ok', state: deserialize(bak), restoredFromBackup: true };
      } catch {
        /* fall through */
      }
    }
    return { kind: 'error', message: err instanceof Error ? err.message : '存档读不通。' };
  }
}

export function commitSave(s: GameState) {
  const store = storage();
  if (!store) return;
  const prev = store.getItem(SAVE_KEY);
  if (prev) store.setItem(SAVE_BAK_KEY, prev);
  store.setItem(SAVE_KEY, serialize(s));
}

export function loadSettings(): Settings {
  const store = storage();
  const base = defaultSettings();
  if (!store) return base;
  const raw = store.getItem(SETTINGS_KEY);
  if (!raw) {
    try {
      if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
        base.reduceMotion = true;
      }
    } catch {
      /* ignore */
    }
    return base;
  }
  try {
    const data = JSON.parse(raw) as Partial<Settings>;
    return {
      master: typeof data.master === 'number' ? Math.min(1, Math.max(0, data.master)) : base.master,
      subtitles: data.subtitles !== false,
      largeText: data.largeText === true,
      reduceMotion: data.reduceMotion === true,
    };
  } catch {
    return base;
  }
}

export function saveSettings(s: Settings) {
  const store = storage();
  if (!store) return;
  store.setItem(SETTINGS_KEY, JSON.stringify(s));
}
