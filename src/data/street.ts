import { EVIDENCE, NOTES } from '../core/lines';
import { canAccuse, compareGap, type GameState } from '../core/state';
import type { HallUi } from './hallAfter';

export interface StreetUi extends HallUi {
  fade(): Promise<void>;
  toTitle(): void;
}

const HINTS = [
  '再比两个位置。柴声与哭腔一起停吗？',
  '把提灯放低，看窗框右侧的亮边。',
  '重放被角的两次起落，再看碗纹与哭声同时开始。现在可以指出床头的碗。',
];

export async function runStove(ui: StreetUi) {
  await ui.say([
    {
      speaker: 'narration',
      text: '灶门缝里蹦出两粒火星。木柴爆了两下。右侧的哭腔还拖着，没有跟着断。',
      caption: '〔灶门〕柴声短。〔右侧，隔着一扇窗〕哭声，断续。',
      sound: 'crackle',
    },
  ]);
  if (!ui.alive()) return;
  const pick = await ui.choose('听灶门', [
    { id: 'gather', label: '拢一拢灶门' },
    { id: 'steady', label: '把碗放稳比较' },
    { id: 'shoes', label: '查门边的草鞋' },
    { id: 'back', label: '离开' },
  ], '两种长短可以并排再听。听到了，也不等于找到声源。');
  if (!ui.alive() || !pick || pick === 'back') return;
  if (pick === 'shoes') {
    ui.commit({ type: 'seeShoes' });
    await ui.say([{ speaker: 'narration', text: '鞋尖都朝里，鞋底已经干了。只是寻常人家收着的鞋。' }]);
    return;
  }
  const first = !ui.state().aCompared;
  ui.commit({ type: 'compareA' });
  await ui.say([
    {
      speaker: 'xiaoman',
      text: '是柴在裂。可我刚才听见的，比这一下长。',
      caption: pick === 'gather' ? '〔灶门〕火星收回缝里。哭腔仍比这两下长。' : '〔碗沿〕碗放稳了。柴是两下，哭腔是一声长的。',
    },
    { speaker: 'xiaoman', text: '先看看人。病了还得去叫嫂子。' },
  ]);
  if (first) await ui.showNote('灶门', '木柴爆了两下就断。右侧的哭腔比这一下长。声源还没写。');
}

export async function runWindow(ui: StreetUi) {
  if (!ui.state().bLampLow) {
    const lower = await ui.choose('窗左', [
      { id: 'low', label: '把灯放低' },
      { id: 'back', label: '离开' },
    ], '灯还照在玻璃上，只照出自己半张脸。');
    if (lower !== 'low' || !ui.alive()) return;
    ui.commit({ type: 'lowerLamp' });
    await ui.say([
      { speaker: 'narration', text: '反光挪到窗下。屋里两个人睡在一床宽被子里。左边那个人把被角掖到右边那个人肩上。' },
    ]);
  }
  if (!ui.alive()) return;
  const pick = await ui.choose('窗左', [
    { id: 'breath', label: '比一比被角' },
    { id: 'knock', label: '先敲窗问问' },
    { id: 'back', label: '离开' },
  ]);
  if (!ui.alive() || !pick || pick === 'back') return;
  if (pick === 'knock') {
    ui.commit({ type: 'knockWindow' });
    await ui.say([
      { speaker: 'narration', text: '食指碰到窗框。屋里的人仍慢慢呼吸。她没有敲第二下。' },
      { speaker: 'xiaoman', text: '两个人都睡着。再听一回，别把他们叫醒。' },
    ]);
    return;
  }
  const first = !ui.state().bBreath;
  ui.commit({ type: 'compareBreath' });
  await ui.say([
    {
      speaker: 'xiaoman',
      text: '这一声还没完，他都换过两口气了。',
      caption: '〔窗内〕被角起、落，再起。〔窗右〕哭腔仍连着。',
      sound: 'cry',
    },
  ]);
  if (first && ui.alive()) await ui.showNote('窗左', '被角起落了两次。哭腔中间没有换气。两个人都睡着。还没有写谁在哭。');
}

export async function runBed(ui: StreetUi) {
  if (ui.state().demoEnded) {
    await endMenu(ui);
    return;
  }
  if (ui.state().pz03Done) {
    const done = await ui.choose('床头', [
      { id: 'hand', label: '放下手' },
      { id: 'step', label: '退半步' },
      { id: 'back', label: '先留在窗前' },
    ]);
    if (done === 'hand' || done === 'step') await runEnding(ui);
    return;
  }
  if (!ui.state().cEdge) {
    await ui.say([
      { speaker: 'narration', text: '从窗左望去，床头有一线水亮。光被木棂截成两截。第一眼只看见亮边。' },
    ]);
    if (!ui.alive()) return;
    ui.commit({ type: 'glanceEdge' });
    const again = await ui.choose('同一扇窗', [
      { id: 'pane', label: '再看窗格' },
      { id: 'back', label: '先不看' },
    ]);
    if (again !== 'pane' || !ui.alive()) return;
    await revealBowl(ui);
  } else if (!ui.state().cBowl) {
    const again = await ui.choose('床头仍是亮边', [
      { id: 'pane', label: '再看窗格' },
      { id: 'back', label: '离开' },
    ]);
    if (again !== 'pane' || !ui.alive()) return;
    await revealBowl(ui);
  }
  if (!ui.alive() || !ui.state().cBowl) return;
  await bedMenu(ui);
}

async function revealBowl(ui: StreetUi) {
  const first = !ui.state().cBowl;
  ui.commit({ type: 'lookPane' });
  await ui.say([
    { speaker: 'narration', text: '灯往身后偏了偏。木棂上的反光退出。枕头上方的木凳上，一只普通饭碗露了出来。' },
    { speaker: 'xiaoman', text: '人躺着没挪。响的地方，比枕头高一点。' },
  ]);
  if (first && ui.alive()) await ui.showNote('床头凳', '同一窗格再看，才看见饭碗。人没有翻身。还没有指认这只碗。');
}

async function bedMenu(ui: StreetUi) {
  while (ui.alive() && !ui.state().pz03Done) {
    const pick = await ui.choose('床头窗', [
      { id: 'bowl', label: '收起自己的碗' },
      { id: 'breath', label: '再看被角' },
      { id: 'more', label: '别的对照' },
      { id: 'point', label: '指出哭声' },
      { id: 'back', label: '离开' },
    ], ui.state().cRipple ? '窗后的水纹还在。翻看不算选定。' : '近看可以随时关掉。');
    if (!ui.alive() || !pick || pick === 'back') return;
    if (pick === 'bowl' || pick === 'more') {
      if (pick === 'more') {
        const extra = await ui.choose('对照', [
          { id: 'stove', label: '重放灶门' },
          { id: 'ripple', label: '重看水纹' },
          { id: 'back', label: '返回' },
        ]);
        if (extra === 'stove') await replayStove(ui);
        if (extra === 'ripple') await confirmRipple(ui);
      } else await confirmRipple(ui);
      continue;
    }
    if (pick === 'breath') {
      const first = !ui.state().bBreath;
      ui.commit({ type: 'compareBreath' });
      await ui.say([
        {
          speaker: 'narration',
          text: '右边那张嘴仍闭着。被角已落，哭腔才到尾音。',
          caption: '〔窗内〕被角起、落，再起。〔窗右〕哭腔仍连着。',
        },
      ]);
      if (first && ui.alive()) await ui.showNote('被角', '呼吸是两次起落。哭腔是连着的一声。人没有醒。');
      continue;
    }
    const ready = await pointCry(ui);
    if (ready) return;
  }
}

async function replayStove(ui: StreetUi) {
  const first = !ui.state().aCompared;
  ui.commit({ type: 'compareA' });
  await ui.say([
    {
      speaker: 'narration',
      text: '灶门又爆了两下。火星落地之后，右侧的哭音才重新起来。',
      caption: '〔灶门〕两下短的。〔窗右〕一声长的。两段并排，没有写成结论。',
      sound: 'crackle',
    },
  ]);
  if (first && ui.alive()) await ui.showNote('灶门', '木柴爆了两下就断。哭腔比这一下长。');
}

async function confirmRipple(ui: StreetUi) {
  const first = !ui.state().cRipple;
  ui.commit({ type: 'confirmRipple' });
  await ui.say([
    {
      speaker: 'xiaoman',
      text: '我先收起来。看你还响不响。',
      caption: '〔近处〕哭腔起，窗后的一圈水纹同时起。〔窗左〕被角随后才落。',
      sound: 'ripple-sparse',
    },
  ]);
  if (first && ui.alive()) await ui.showNote('窗后的水纹', '自己的碗拿到背后，窗里那一圈仍跟着哭腔走。还没有指认。');
}

async function pointCry(ui: StreetUi) {
  if (!canAccuse(ui.state())) {
    await ui.say([{ speaker: 'narration', text: compareGap(ui.state()) }]);
    return false;
  }
  let hint = 0;
  while (ui.alive()) {
    const pick = await ui.choose('哭声从哪里来', [
      { id: 'wood', label: '灶里的木柴' },
      { id: 'person', label: '床上的人' },
      { id: 'bowl', label: '床头那只碗' },
      { id: 'hint', label: '要个提示' },
      { id: 'back', label: '先不指' },
    ], '翻看观察不算选定。点了其中一句才算。');
    if (!ui.alive() || !pick || pick === 'back') return false;
    if (pick === 'hint') {
      await ui.say([{ speaker: 'narration', text: HINTS[hint] ?? HINTS[2] }]);
      hint = Math.min(2, hint + 1);
      continue;
    }
    const result = ui.commit({ type: 'accuse', which: pick === 'bowl' ? 'bowl' : pick === 'person' ? 'person' : 'wood' });
    if (!result.ok && result.code === 'wrong-wood') {
      await ui.say([
        { speaker: 'narration', text: '火星迸一下，没有哭声。火星早落地了，右侧的哭音才重新起来。', caption: '〔灶门〕柴声已停。〔窗右〕哭腔还在。' },
        { speaker: 'xiaoman', text: '柴一声一声地断。右边这个音，火星落下去它还在。' },
      ]);
      continue;
    }
    if (!result.ok && result.code === 'wrong-person') {
      await ui.say([
        { speaker: 'narration', text: '回到窗左。右边的人掖被时嘴仍闭着。被角已落，哭腔才到尾音。举起的手离开窗框。', caption: '〔窗内〕嘴闭着。〔窗右〕哭腔还在尾音。' },
        { speaker: 'xiaoman', text: '他嘴没张。我把人吵醒，倒是我的不是了。' },
      ]);
      continue;
    }
    if (result.ok) {
      await ui.say([
        { speaker: 'narration', text: '两只碗都看得见。小满把自己的碗拿远。窗里那一圈水照样走到底。伸出的手改成托住自己的碗底。' },
        { speaker: 'xiaoman', text: '是你们枕头边上那只碗。' },
      ]);
      if (!result.repeat && ui.alive()) {
        await ui.showNote('窗源', '新坳街。床上的人没有哭，哭声来自床头碗。');
      }
      if (!ui.alive()) return true;
      const end = await ui.choose('已经指出了', [
        { id: 'step', label: '退半步' },
        { id: 'hand', label: '放下手' },
      ]);
      if (end === 'step' || end === 'hand') await runEnding(ui);
      return true;
    }
  }
  return false;
}

export async function runEnding(ui: StreetUi) {
  await ui.say([
    { speaker: 'narration', text: '小满退半步。灯光回到脚边。窗里的人还睡着。桂芬在街那头探出半个身子，手里捏着一块起锅盖的布。' },
    { speaker: 'guifen', text: '怎么了，要我拿件衣裳来吗？' },
    { speaker: 'xiaoman', text: '不用。让他们睡。' },
    { speaker: 'narration', text: '桂芬把布换回右手，转身守锅。哭音慢慢收住。没有第四句接上来。', caption: '〔街尽头〕桶耳碰木。', sound: 'bucket' },
    { speaker: 'narration', text: '隔了半拍，更远的地方又响了一声。传桶的人和井都在画外。', caption: '〔更远处〕又一声。', sound: 'bucket' },
  ]);
  if (!ui.alive()) return;
  ui.commit({ type: 'finishDemo' });
  await ui.fade();
  if (!ui.alive()) return;
  await ui.showNote('欠哭　Unwept', '试玩结束\n\n那只桶往哪里传？');
  if (!ui.alive()) return;
  await endMenu(ui);
}

async function endMenu(ui: StreetUi) {
  while (ui.alive()) {
    const pick = await ui.choose('试玩结束', [
      { id: 'replay', label: '重看窗前' },
      { id: 'review', label: '回顾线索' },
      { id: 'title', label: '返回标题' },
    ], '重看不重新结算。回顾只显示这次确实记下的。');
    if (!ui.alive() || !pick) return;
    if (pick === 'title') {
      ui.toTitle();
      return;
    }
    if (pick === 'review') {
      await ui.showNote('这次记下的', reviewText(ui.state()));
      continue;
    }
    await ui.say([
      { speaker: 'narration', text: '窗左，被角又起又落。床头那只碗上的水纹仍跟着哭腔走到底。人还睡着。' },
      { speaker: 'xiaoman', text: '是你们枕头边上那只碗。' },
      { speaker: 'guifen', text: '怎么了，要我拿件衣裳来吗？' },
      { speaker: 'xiaoman', text: '不用。让他们睡。' },
    ]);
    ui.commit({ type: 'finishDemo' });
  }
}

export function reviewText(s: GameState): string {
  const tea = s.drankOathWater ? '井茶：喝过。压哭还等天亮。' : s.teaDecided ? '井茶：倒在门槛外。' : '井茶：还没处置。';
  const notes = s.notes.length
    ? s.notes.map((id) => `【${NOTES[id]?.title ?? id}】\n${NOTES[id]?.body ?? ''}`).join('\n\n')
    : '还没有观察。';
  const evidence = s.evidence.length
    ? s.evidence.map((id) => `【${EVIDENCE[id]?.title ?? id}】\n${EVIDENCE[id]?.body ?? ''}`).join('\n\n')
    : '还没有文书。';
  return `${tea}\n\n${notes}\n\n${evidence}\n\n名册是空的。传桶去向还没走。`;
}

export async function runDemoMenu(ui: StreetUi) {
  if (!ui.state().pz03Done) return;
  if (!ui.state().demoEnded) {
    await runEnding(ui);
    return;
  }
  await endMenu(ui);
}

export async function runStreetEnd(ui: StreetUi) {
  if (!ui.state().demoEnded) {
    await ui.say([{ speaker: 'narration', text: '街尽头外面还没有桶声。窗前的对照还没做完。' }]);
    return;
  }
  await ui.say([{ speaker: 'narration', text: '桶在画外。这一册停在窗前。往右追桶，留到正式版。' }]);
}
