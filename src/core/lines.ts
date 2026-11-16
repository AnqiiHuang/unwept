export type Speaker = 'xiaoman' | 'changgui' | 'guyu' | 'guifen' | 'jianjun' | 'narration' | 'continuation' | 'yupo';

export type SoundId =
  | 'scrape'
  | 'ceramic'
  | 'ripple-sparse'
  | 'ripple-dense'
  | 'swallow'
  | 'pour'
  | 'wind'
  | 'sing'
  | 'continue'
  | 'cloth'
  | 'key';

export interface Line {
  speaker: Speaker;
  text: string;
  caption?: string;
  sound?: SoundId;
}

export const SPEAKER_NAME: Record<Speaker, string> = {
  xiaoman: '余小满',
  changgui: '杜长贵',
  guyu: '谷雨',
  guifen: '邹桂芬',
  jianjun: '谷建军',
  narration: '旁白',
  continuation: '续腔',
  yupo: '余婆',
};

export const NOTES: Record<string, { title: string; body: string }> = {
  MUD: {
    title: '鞋印',
    body: '鞋跟压进干皮里，印子一前一后，都朝坡上。',
  },
  LINING: {
    title: '箱衬',
    body: '红布磨得发白，一道补针从衬里穿到夹层。纸边露着，抽不动。这里没有信件，也没有凭条可收。',
  },
  OBS_PRINTS: {
    title: '鞋印旁的水纹',
    body: '水面过了一息，才起一道疏纹。〔旧村侧，断续〕水纹疏。',
  },
  OBS_STAKE: {
    title: '倒桩旁的水纹',
    body: '第二道还没到碗沿，第三道已经起来。〔旧村侧，较近〕水纹密。桩上的布条往坡上吹，碗里的圈向旧村一侧聚。风停一瞬，纹还在。',
  },
  L03: {
    title: 'L03　库边两处水纹',
    body: '鞋印旁纹疏，倒桩旁纹密。声音是从倒桩那头、旧村一侧接过来的。',
  },
  HEARD: {
    title: '身后两个音',
    body: '〔身后，旧村一侧〕接上来的是“九顺”。小满只听见这两个音，还不知道是谁。名册里没有这个名字。',
  },
  L01: {
    title: 'L01　谷家放布的位置',
    body: '建军的布搭高钩。谷雨的小凳旁放有短针的那条。',
  },
  PHOTO: {
    title: '堂上的合照',
    body: '谷怀山坐在中间。建军站在高钩下。谷雨坐在矮凳上。',
  },
  O08: {
    title: '帷后旧孝布',
    body: '五、五、五、四，共十九条。比今天这两条硬，折痕很深。桂芬说是怀山自己收的。没有名册。',
  },
};

export const EVIDENCE: Record<string, { title: string; body: string }> = {
  E23: {
    title: 'E23　清场公告',
    body: '幸福水库低水位检查　10 月 21 日至 27 日。10 月 27 日早六时清场，通往旧村的道路封闭。工程组　10 月 21 日。目前只登记公告这一截。',
  },
};

export const ITEM_TEXT: Record<string, { name: string; body: string }> = {
  O01: {
    name: '粗瓷水碗',
    body: '口上豁了一小块。小满用随身的凉水倒了两指深，拇指习惯护着豁口。',
  },
  long: {
    name: '长孝布',
    body: '比另一条长，搭下去够得到小腿。桂芬说这一条是建军的。',
  },
  short: {
    name: '短针孝布',
    body: '折短了，角上缝着一针，免得踩脚。是给谷雨的那条。',
  },
};

export const LINES = {
  pro01Intro: [
    { speaker: 'changgui', text: '顺着鞋印走。那块亮的，看着硬，里头还软。' },
    { speaker: 'xiaoman', text: '杜叔。你鞋上的泥倒攒得多。' },
    { speaker: 'changgui', text: '两只鞋一只重，划船都偏。你这箱子还响？' },
    {
      speaker: 'xiaoman',
      text: '我找根布带勒住了。你听。',
      caption: '〔身侧〕瓷器轻轻碰了一下木头。',
      sound: 'ceramic',
    },
    { speaker: 'changgui', text: '你师父拿旧袜子套碗，走十里路，一点声都没有。' },
    { speaker: 'xiaoman', text: '我留着呢。师父走了以后，我拿出来洗，补丁比袜底还厚。' },
  ] satisfies Line[],
  guyuMeet: [
    { speaker: 'guyu', text: '你把箱子挪一点。挨着这根木头了。' },
    { speaker: 'xiaoman', text: '妨碍你听什么了？' },
    { speaker: 'guyu', text: '你先挪。我还没听完。' },
  ] satisfies Line[],
  takeBowl: [{ speaker: 'xiaoman', text: '还好。豁的还是原来那块。' }] satisfies Line[],
  lining: [{ speaker: 'xiaoman', text: '她缝得牢。等回去再拆。' }] satisfies Line[],
  shoreTalk: [
    { speaker: 'xiaoman', text: '你耳朵贴久了，没有木刺扎进去？' },
    { speaker: 'guyu', text: '有刺这面我剔过了。你要听就贴这儿。' },
    { speaker: 'changgui', text: '这灯见了风就喝油。上坡把袖子放下来，那里冷。' },
  ] satisfies Line[],
  singStart: [
    { speaker: 'xiaoman', text: '我热热嗓子。你要嫌吵，等我这一声过去。' },
    { speaker: 'guyu', text: '你唱。等你停了，我再听。' },
    { speaker: 'xiaoman', text: '一声叫人，门开半扇。', sound: 'sing' },
  ] satisfies Line[],
  continuation: [
    {
      speaker: 'continuation',
      text: '九顺——',
      caption: '〔身后，旧村一侧〕九顺——',
      sound: 'continue',
    },
  ] satisfies Line[],
  askGuyu: [
    { speaker: 'xiaoman', text: '我收了声以后，你听清没有？' },
    { speaker: 'guyu', text: '两个字。你先说，省得我照着你说。' },
    { speaker: 'xiaoman', text: '九顺。' },
    { speaker: 'guyu', text: '嗯。我是在木头这头听见的。' },
  ] satisfies Line[],
  askChanggui: [
    { speaker: 'xiaoman', text: '杜叔，你叫谁呢？' },
    { speaker: 'changgui', text: '我嘴里咬着灯捻呢，怎么叫？' },
    { speaker: 'guyu', text: '我听见了。这边，等你闭嘴以后。' },
  ] satisfies Line[],
  songRest: [
    { speaker: 'xiaoman', text: '二声慢数，一年一年。', sound: 'sing' },
    { speaker: 'xiaoman', text: '三声劝你，松一松手。', sound: 'sing' },
    { speaker: 'xiaoman', text: '四声送你，路上莫赶。', sound: 'sing' },
    { speaker: 'xiaoman', text: '五声哭我儿，小满不——', sound: 'sing', caption: '〔喉口〕她把这半句按住了。岸上还剩一点风。' },
    { speaker: 'guyu', text: '掉了一个字。' },
    { speaker: 'xiaoman', text: '我学的时候就停这儿。' },
    { speaker: 'guyu', text: '你叫什么？' },
    { speaker: 'xiaoman', text: '余小满。' },
    { speaker: 'guyu', text: '我叫谷雨。你到我家，跟我走。' },
  ] satisfies Line[],
  leaveShore: [
    { speaker: 'changgui', text: '到白灰墙那儿拐。看见晒着的围裙，就到谷家门口了。' },
    { speaker: 'changgui', text: '替我跟桂芬提一声，盛鱼的盆我明早去拿。' },
    { speaker: 'xiaoman', text: '我师父那个豁了口的，你还要么？' },
    { speaker: 'changgui', text: '她那个留给你。我要的是今早借出去的。' },
  ] satisfies Line[],
  pro02Intro: [
    { speaker: 'guifen', text: '我说怎么老有一块洗不干净。你手给我看看。' },
    { speaker: 'guyu', text: '这回是脑袋蹭的。手我揣着呢。' },
    { speaker: 'guifen', text: '那你低下头来。' },
    { speaker: 'xiaoman', text: '嫂子，我姓余。下坝来的。' },
    { speaker: 'guifen', text: '我等你呢。我是桂芬。那封信没叫雨淋着吧？' },
    { speaker: 'xiaoman', text: '信在里袋。三夜，我把换洗衣裳也带了。' },
    { speaker: 'guifen', text: '好。箱子你自己提？我这手刚过油。' },
    { speaker: 'xiaoman', text: '我提。你给我指一指门就行。' },
  ] satisfies Line[],
  noticeKid: [
    { speaker: 'guyu', text: '这个六，我描了一遍。不描像个零。' },
    { speaker: 'xiaoman', text: '早上六点？' },
    { speaker: 'guyu', text: '嗯。那天你别往那边跑。' },
  ] satisfies Line[],
  needNotice: [{ speaker: 'guifen', text: '门先别进。围裙底下那张告示，你先读了。' }] satisfies Line[],
  fish: [
    { speaker: 'xiaoman', text: '杜叔让我捎个话，今早那个鱼盆他还要。' },
    { speaker: 'guifen', text: '小的那个？我才借了半天，他就惦记上了。' },
    { speaker: 'xiaoman', text: '他还认得我家的那个。旁的事能忘，盆他忘不了。' },
    { speaker: 'guifen', text: '等我把今天的鱼摆出去。你叫他明早来拿，别大半夜坐船上等。' },
  ] satisfies Line[],
  teaOffer: [
    { speaker: 'guifen', text: '喝口茶。早晨从井里打的水，才煨开。' },
    { speaker: 'guyu', text: '妈，我那个壶不用倒，我自己留着呢。' },
    { speaker: 'guifen', text: '知道。你那壶我动也没动。' },
    { speaker: 'xiaoman', text: '家里这么多人，偏劳你站门口等我。' },
    { speaker: 'guifen', text: '我正好透口气。里面的油灯，熏得人头疼。' },
  ] satisfies Line[],
  teaDrink: [
    {
      speaker: 'xiaoman',
      text: '我走急了，这口茶在嗓子眼打了个转。',
      caption: '〔小满〕吞咽后，起音发涩。',
      sound: 'swallow',
    },
    { speaker: 'guifen', text: '坐一刻再开口。我给你把杯挪开，免得袖子碰翻。' },
  ] satisfies Line[],
  teaPour: [
    {
      speaker: 'guyu',
      text: '别浇鞋上。那块砖翘着，会溅。',
      caption: '〔门槛外〕茶渗进土缝。',
      sound: 'pour',
    },
    { speaker: 'xiaoman', text: '好。你鞋尖也挪挪。' },
  ] satisfies Line[],
  enterHall: [
    { speaker: 'jianjun', text: '桂芬，余师傅到了没有？给她留张凳子。', sound: 'key', caption: '〔门内〕钥匙隔着布碰了一声。' },
    { speaker: 'guifen', text: '到了。你别来搬雨雨那张，我搬别的。' },
    { speaker: 'guyu', text: '我自己搬！' },
  ] satisfies Line[],
  hallChopsticks: [
    { speaker: 'guyu', text: '这是爷爷自己的。你往哪儿搁？' },
    { speaker: 'guifen', text: '你给他拿回家去。' },
    { speaker: 'guyu', text: '妈，我们就在家。' },
    { speaker: 'guifen', text: '……拿回厨房。放在他那只碗上头。' },
  ] satisfies Line[],
  hallStoolAsk: [
    { speaker: 'guifen', text: '小满，劳你帮我摁着。我拿张纸垫一垫。' },
    { speaker: 'guyu', text: '靠墙那条腿短。垫这边，昨天我试过。' },
  ] satisfies Line[],
  hallStoolDone: [
    { speaker: 'xiaoman', text: '你试得还挺准。' },
    { speaker: 'guyu', text: '你坐上去，它还晃么？' },
    { speaker: 'xiaoman', text: '不晃。这凳子归谁管？' },
    { speaker: 'guyu', text: '我管。谁坐都行，用完还放这儿。' },
  ] satisfies Line[],
  giveCloth: [
    { speaker: 'guifen', text: '长的搭这钩，是建军的。雨雨那条我折短了，角上缝了一针，免得踩脚。' },
    { speaker: 'xiaoman', text: '我给你放好。你去把灯端稳。' },
  ] satisfies Line[],
  wrongLong: [
    { speaker: 'guifen', text: '这一条你先还我。贴脚走的布太长，孩子一抬腿就要踩。', sound: 'cloth' },
  ] satisfies Line[],
  wrongShort: [
    { speaker: 'guyu', text: '你挂那么高，我够不着。给我的那针在里面，翻过来摸得着。', sound: 'cloth' },
  ] satisfies Line[],
  curtain: [
    { speaker: 'guyu', text: '怎么里头还有？' },
    { speaker: 'xiaoman', text: '搭住了。你扶着外头这层，我看一眼。' },
    { speaker: 'guyu', text: '一把五条。第二把，也是五。' },
    { speaker: 'xiaoman', text: '第三把五。最后这把四条。' },
    { speaker: 'guyu', text: '十九。你再数也是十九。' },
    { speaker: 'guifen', text: '那是爸自己收的。今天用的我另拿了，里头的先搁着吧。' },
    { speaker: 'xiaoman', text: '好。我把帷子给你垂回去。' },
    { speaker: 'guyu', text: '留条缝，省得下回又挂在钉上。' },
  ] satisfies Line[],
} as const;

export const TRAVEL_HINT: Record<string, string> = {
  bowl: '碗还在箱子里。取出来再走。',
  stations: '鞋印和倒桩，两处还没都把碗放平。',
  l03: '还没判断声音从哪一侧接过来。',
  heard: '第一声已经有了着落，人还没往坡上唱出那一句。',
  song: '后头几句还停在半路上。谷雨还等着。',
  e23: '告示还没读。桂芬把围裙揭开了一点。',
  tea: '茶还端在手里。喝一口，或倒在门槛外，两条路都进得了门。',
  path: '这边现在走不过去。',
};
