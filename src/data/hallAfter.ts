import type { Line } from '../core/lines';
import type { Action, ApplyResult, GameState } from '../core/state';

export type VerseCard = 'l02' | 'boat' | 'tea';

export interface HallUi {
  say(lines: readonly Line[]): Promise<void>;
  choose(prompt: string, options: { id: string; label: string }[], detail?: string): Promise<string>;
  showNote(title: string, body: string): Promise<void>;
  commit(action: Action): ApplyResult;
  alive(): boolean;
  state(): GameState;
}

export const CARDS: Record<VerseCard, { title: string; body: string }> = {
  l02: {
    title: '桂芬亲见　／　怀山扶谷雨握笔',
    body: '说话的人是桂芬。被说的人是怀山。动作是扶着孙女写「雨」，再松开手，让最后一点自己落下。没有听见她亲眼说的时候，这一张仍是待问。',
  },
  boat: {
    title: '库边所见　／　长贵看船灯',
    body: '说话的人是库边的见闻。被说的人是杜长贵。动作是守船头那盏灯。',
  },
  tea: {
    title: '门槛所见　／　桂芬端井茶',
    body: '说话的人是门槛上的见闻。被说的人是桂芬。动作是给进门的人端井茶。',
  },
};

const HINTS = [
  '重听桂芬说她亲眼看见什么。',
  '比较三张记录的动作是谁做的。你刚才在为谁试唱？',
  '守船灯的是杜长贵。请把写着「怀山扶谷雨握笔」的卡放到「数」。',
];

export async function runCommission(ui: HallUi) {
  const first = !ui.state().commissionDone;
  await ui.say([
    { speaker: 'jianjun', text: '余师傅，信你收着了？从今夜起，守三夜。三夜工钱照信上的数，出殡前给你。' },
    { speaker: 'xiaoman', text: '饭你们管。工钱请现结，我回下坝有张药账要还。' },
    { speaker: 'jianjun', text: '成。我在你信背面记上。' },
    { speaker: 'narration', text: '小满递信，拇指压在信头。建军只写「出殡前结清」，落下自己的名字。看不出原信被谁改过。' },
    { speaker: 'xiaoman', text: '老人家在家，晚辈怎么称呼他？' },
    { speaker: 'jianjun', text: '谷老爹。你就在堂前这么叫。' },
    { speaker: 'xiaoman', text: '那我先跟嫂子问一件他做过的事。' },
    { speaker: 'jianjun', text: '堂上别数生平。起一声，收一声，中间空着。' },
  ]);
  if (!ui.alive()) return;
  const pick = await ui.choose('建军把唱法说死了', [
    { id: 'ask', label: '问清唱法' },
    { id: 'accept', label: '照委托办' },
  ]);
  if (!ui.alive() || !pick) return;
  if (pick === 'ask') {
    await ui.say([
      { speaker: 'xiaoman', text: '空处我能留。你是连他的本名也不愿叫？' },
      { speaker: 'jianjun', text: '家里叫惯了老爹。他听这个。劳你就这么办。' },
      { speaker: 'xiaoman', text: '好。堂前只叫谷老爹。' },
    ]);
  } else {
    await ui.say([
      { speaker: 'xiaoman', text: '起、送两头都叫谷老爹，中间的事我不在堂上数。' },
      { speaker: 'jianjun', text: '对。价钱还是刚说的价钱。' },
    ]);
  }
  if (!ui.alive()) return;
  await ui.say([
    { speaker: 'guifen', text: '建军，灶上还等你点几张桌子。这里我陪着。' },
    { speaker: 'narration', text: '建军伸手摸钥匙，发觉已经拿在另一只手里。他去点桌。小满把信折回原来的折痕。' },
  ]);
  if (!ui.alive()) return;
  ui.commit({ type: 'acceptCommission' });
  if (first) {
    await ui.showNote('信上能看见的', '请余家来新坳，为谷家守三夜。只哭，不唱名字，不数生平。信背新添：出殡前结清。谷建军。');
  }
}

export async function runBook(ui: HallUi) {
  await ui.say([
    { speaker: 'narration', text: '凳脚旁一本作业本摊着，书缝里卡着小半截粉笔。纸上有个写得过大的「雨」，末点挤在边线外。' },
    { speaker: 'xiaoman', text: '我把本子收一收。粉笔是要扔的么？' },
    { speaker: 'guyu', text: '给我。越短越好写小字。' },
    { speaker: 'xiaoman', text: '这字是谁教你写的？' },
    { speaker: 'guyu', text: '最后那一点是我自己添的。' },
  ]);
  if (!ui.alive()) return;
  ui.commit({ type: 'seeBook' });
  const pick = await ui.choose('哭本先写下待问', [
    { id: 'ask', label: '问桂芬当时看见什么' },
    { id: 'wait', label: '先记着待问' },
  ], '短粉笔和作业本。谁扶她写过，待问。');
  if (pick === 'ask') await runTestimony(ui);
}

export async function runTestimony(ui: HallUi) {
  const first = !ui.state().l02;
  await ui.say([
    { speaker: 'guifen', text: '刚学写名字那阵子，她写个「雨」，攥断了三根粉笔。我扫一根，她又掰一根。' },
    { speaker: 'guyu', text: '是两根。第三根还在。' },
    { speaker: 'guifen', text: '爸就坐在这儿。他把她几个指头一个个拨松，手托着她的手背，说，写坏了我擦。' },
    { speaker: 'xiaoman', text: '最后那一点呢？' },
    { speaker: 'guifen', text: '他把手撤了。我亲眼看见的，她自个儿点了半天，点到他袖口上。' },
    { speaker: 'guyu', text: '他穿着出去了，没叫我给他拍。' },
    { speaker: 'narration', text: '桂芬把指头在自己袖口同一处按了一下。小满把作业本原样推回去。' },
    { speaker: 'xiaoman', text: '借你爷爷这件事，给我试一句？本子还给你。' },
    { speaker: 'guyu', text: '在帘子这边试。外头好多人，我不想叫他们看这个字。' },
    { speaker: 'xiaoman', text: '成。我只带走你妈说的那句话。' },
  ]);
  if (!ui.alive()) return;
  const result = ui.commit({ type: 'hearL02' });
  if (first && result.ok && !result.repeat) {
    await ui.showNote('L02　怀山扶谷雨握笔', '桂芬亲见。怀山扶孙女写「雨」，把她攥紧粉笔的手拨松，最后一点让她自己落。没有把谁写入名册。');
  }
}

export async function runBody(ui: HallUi) {
  await ui.say([
    { speaker: 'xiaoman', text: '嫂子，方便我看看老人么？' },
    { speaker: 'guifen', text: '你站这边。等婶娘把灯挪一下。' },
    { speaker: 'xiulan', text: '挽起袖角。油沾了就洗不下来了。' },
    { speaker: 'narration', text: '头端还空着一道缝。怀山嘴角黏着一点已经干裂的黑泥。手里有段竹片，刻口深浅不一。视线停在家属打开的这道缝里。' },
  ]);
  if (!ui.alive()) return;
  const pick = await ui.choose('棺前这一眼', [
    { id: 'lip', label: '看嘴角' },
    { id: 'hand', label: '看手边' },
    { id: 'back', label: '退后' },
  ]);
  if (pick === 'lip') {
    ui.commit({ type: 'seeLip' });
    await ui.say([
      { speaker: 'xiaoman', text: '嘴角这点，是泥么？' },
      { speaker: 'xiulan', text: '我擦过一遍。你要看的话，就这样看。' },
      { speaker: 'narration', text: '唇缝里有干泥，来处未明。' },
    ]);
  }
  if (pick === 'hand') {
    ui.commit({ type: 'seeTally' });
    await ui.say([
      { speaker: 'xiaoman', text: '我看见了。手里的竹片，给他留着？' },
      { speaker: 'guifen', text: '留着。他攥了一辈子的东西，手合着，就这样合着吧。' },
      { speaker: 'narration', text: '十九道旧刻痕，末端另有一道浅痕，共二十道。看清了，还没有读懂。' },
    ]);
  }
}

export async function runGong(ui: HallUi) {
  await ui.say([
    { speaker: 'xiaoman', text: '这一面也拿来守灵？', sound: 'cloth', caption: '〔供桌旁〕布包的锣碰到木壁。' },
    { speaker: 'guifen', text: '搁那儿就行。爸嫌它挨着柜门响，自己裹的。' },
    { speaker: 'guyu', text: '角松了。我塞好了。' },
  ]);
  if (!ui.alive()) return;
  ui.commit({ type: 'seeGong' });
}

export async function runRite(ui: HallUi) {
  if (!ui.state().commissionDone) {
    await ui.say([{ speaker: 'narration', text: '建军还在供桌边上。三夜怎么哭，要先听他怎么托。' }]);
    return;
  }
  if (!ui.state().addressSung) {
    await ui.say([
      { speaker: 'guifen', text: '先起吧。你要喝口水，我再给你拿。' },
      { speaker: 'xiaoman', text: '我这碗够了。让他们各忙各的，喊老爹的时候听得见就好。' },
      { speaker: 'narration', text: '灯芯分出两个小火头。碗摆在帷边的桌角。' },
    ]);
    if (!ui.alive()) return;
    const named = await ui.choose('堂前怎么叫', [
      { id: 'papa', label: '谷老爹' },
      { id: 'name', label: '查本名' },
    ], '哭本第一格「起」。可引用谷家当面称谓。');
    if (!ui.alive() || !named) return;
    if (named === 'name') {
      await ui.say([{ speaker: 'narration', text: '委托只许在堂前唤日常称谓。' }]);
      return;
    }
    const start = await ui.choose('称谓已经选定', [
      { id: 'sing', label: '起腔' },
      { id: 'wait', label: '先不起' },
    ]);
    if (start !== 'sing' || !ui.alive()) return;
    const lines: Line[] = [
      { speaker: 'xiaoman', text: '谷老爹——', sound: 'sing', caption: '〔堂前〕起。中间两个拍子空着。' },
      { speaker: 'narration', text: '她望着棺头。有人把手上的碗往桌心推，碗底不再擦着桌沿。' },
      { speaker: 'xiaoman', text: '谷老爹——', sound: 'sing', caption: '〔堂前〕收。' },
      { speaker: 'guyu', text: '你刚才中间停了。我以为你忘词了。' },
      { speaker: 'xiaoman', text: '你爸只让我叫这两声。你说的那件事，咱们在帘子里头试。' },
      { speaker: 'guyu', text: '现在没人看作业本了。' },
    ];
    if (ui.state().drankOathWater) {
      lines.push({ speaker: 'xiaoman', text: '嗓子有点紧。换口气就好。', caption: '〔喉口〕第一口气擦过去。她按了按，又松开。' });
    } else {
      lines.push({ speaker: 'xiaoman', text: '这一句，我放轻些。', caption: '〔碗里〕她把缺口转到拇指下面。水纹没有散。' });
    }
    await ui.say(lines);
    if (!ui.alive()) return;
    ui.commit({ type: 'singAddress' });
  }
  if (!ui.alive()) return;
  if (ui.state().pz02Done) {
    const again = await ui.choose('这一句已经唱过', [
      { id: 'hear', label: '重听这一句' },
      { id: 'look', label: '看灯和碗' },
      { id: 'close', label: '收起' },
    ]);
    if (again === 'hear') await singCorrect(ui, true);
    if (again === 'look') {
      await ui.say([{ speaker: 'narration', text: '灯芯已经合成一股。碗里还有细纹，一圈到了边，下一圈仍从碗底起。' }]);
    }
    return;
  }
  await privateVerse(ui);
}

async function privateVerse(ui: HallUi) {
  let hint = 0;
  while (ui.alive()) {
    const pending = ui.state().l02 ? '三张记录都在。翻看不算唱错。确认唱了才算。' : '扶笔那张还是待问。不能靠猜唱出去。';
    const pick = await ui.choose('帷后，私下试一句', [
      { id: 'l02', label: '看扶笔' },
      { id: 'boat', label: '看船灯' },
      { id: 'tea', label: '看井茶' },
      { id: 'ask', label: '请桂芬过来' },
      { id: 'hint', label: '要个提示' },
      { id: 'leave', label: '先离开' },
    ], pending);
    if (!ui.alive() || !pick || pick === 'leave') return;
    if (pick === 'ask') {
      await runTestimony(ui);
      continue;
    }
    if (pick === 'hint') {
      await ui.say([{ speaker: 'narration', text: HINTS[hint] ?? HINTS[2] }]);
      if (hint >= 2 && ui.alive()) {
        const follow = await ui.choose(HINTS[2], [
          { id: 'sing', label: '照此试唱' },
          { id: 'back', label: '我自己选' },
        ]);
        if (follow === 'sing') await resolveCard(ui, 'l02');
      }
      hint = Math.min(2, hint + 1);
      if (ui.state().pz02Done) return;
      continue;
    }
    const card = pick as VerseCard;
    await ui.showNote(CARDS[card].title, CARDS[card].body);
    if (!ui.alive()) return;
    const sing = await ui.choose(`数　${CARDS[card].title}`, [
      { id: 'sing', label: '唱这一句' },
      { id: 'back', label: '先不唱' },
    ], '只翻看的话，不算答错。');
    if (sing !== 'sing') continue;
    const done = await resolveCard(ui, card);
    if (done) return;
  }
}

async function resolveCard(ui: HallUi, card: VerseCard) {
  const result = ui.commit({ type: 'confirmVerse', card });
  if (!ui.alive()) return true;
  if (!result.ok && result.code === 'need-l02') {
    await ui.say([{ speaker: 'narration', text: '这句还是待问。没听见桂芬亲眼看见的话，不能把它唱出去。' }]);
    return false;
  }
  if (!result.ok && result.code === 'wrong-boat') {
    await ui.say([
      { speaker: 'xiaoman', text: '船头一盏灯，您守了一夜——', sound: 'sing' },
      { speaker: 'narration', text: '碗沿跳出两道又急又短的纹。', caption: '〔碗沿〕实事对不上。这件事是谁做的？' },
      { speaker: 'xiaoman', text: '等一下。船头坐的是杜叔。不能拿他那盏灯给谷老爹唱。' },
    ]);
    return false;
  }
  if (!result.ok && result.code === 'wrong-tea') {
    await ui.say([
      { speaker: 'xiaoman', text: '有客进了门，您端茶到门槛——', sound: 'sing' },
      { speaker: 'narration', text: '碗沿还是那两道急纹。谷雨瞥一眼门外的搪瓷杯。', caption: '〔碗沿〕实事对不上。这件事是谁做的？' },
      { speaker: 'guyu', text: '那杯茶是我妈给你的。我给她拿的杯子。' },
      { speaker: 'xiaoman', text: '嗯。是你妈的事，我记岔了。' },
    ]);
    return false;
  }
  if (result.ok) {
    await singCorrect(ui, result.repeat);
    return true;
  }
  return false;
}

async function singCorrect(ui: HallUi, repeat: boolean) {
  await ui.say([
    { speaker: 'xiaoman', text: '谷老爹，那只手，扶过孙女写字。', sound: 'sing' },
    { speaker: 'xiaoman', text: '少的那一点，您留给她自己。', sound: 'wick', caption: '〔帷外〕分岔的灯芯合成一股。碗里的细纹还在。' },
    { speaker: 'guyu', text: '就是他。那一点他没给我添。' },
    { speaker: 'xiaoman', text: '这两句就留在这儿。你自己的本子，收着。' },
    { speaker: 'guifen', text: '灯芯刚还分着岔。你动过么？' },
    { speaker: 'xiaoman', text: '没动。我的手还托着碗呢。' },
  ]);
  if (!ui.alive()) return;
  if (!repeat) {
    await ui.showNote('有据的一句', '桂芬亲见怀山扶孙女握粉笔。灯芯合成一股，碗底的细纹没有停。');
    if (!ui.alive()) return;
    await ui.say([
      { speaker: 'narration', text: '街上有一声哭，从窗根拖过去。', caption: '〔街窗外〕一声拖长的哭腔。', sound: 'cry' },
    ]);
  }
}

export async function runLamp(ui: HallUi) {
  if (!ui.state().pz02Done) {
    await ui.say([{ speaker: 'narration', text: '门廊的灯还挂在原处。堂前和帷后的两步还没走完。' }]);
    return;
  }
  if (ui.state().lampTaken) {
    await ui.say([{ speaker: 'narration', text: '灯在手里。门廊右边就是街窗。' }]);
    return;
  }
  await ui.say([
    { speaker: 'xiaoman', text: '嫂子，外头有人哭。你听到了么？' },
    { speaker: 'guifen', text: '听到了。我这锅粥腾不开手。你去看看，是不是有人坐在外头受了凉。' },
    { speaker: 'xiaoman', text: '要是一个人，我陪他坐一会儿。你给我留盏灯就行。' },
    { speaker: 'guifen', text: '门廊这盏归你。用完搁回钩上。' },
    { speaker: 'narration', text: '小满把提灯拿在手里。街窗还在门外。她还没迈出去。' },
  ]);
  if (!ui.alive()) return;
  ui.commit({ type: 'takeLamp' });
}
