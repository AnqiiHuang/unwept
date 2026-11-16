/**
 * 新增开场草稿
 * 可整段替换。只使用资料里已有的事：余婆教小满先收气、旧袜子套碗、
 * 小满整备哭箱、带着三夜的约往新坳走。
 * 不新增事故、人物死亡或超自然规则，不写十九人，也不写身世。
 */
export type OpeningPlate = 'room' | 'shore' | 'gate';
export type OpeningGrade = 'memory' | 'reality';

export interface OpeningBeat {
  plate: OpeningPlate;
  grade: OpeningGrade;
  speaker: string;
  text: string;
  caption?: string;
  sound?: 'room' | 'wind';
}

export const OPENING_DRAFT = {
  id: 'opening-draft-1998',
  title: '新增开场草稿',
  note: '约一分钟，可逐句点过，也可跳过。回忆与后面的库边用同一套参考静帧的光色区分，不是两套画风。',
  beats: [
    {
      plate: 'room',
      grade: 'memory',
      speaker: '旁白',
      text: '霜降前后的下坝。余婆的椅子空着，哭箱还放在她常坐的那张桌边。',
      caption: '〔屋里〕灯芯轻轻爆了一下。',
      sound: 'room',
    },
    {
      plate: 'room',
      grade: 'memory',
      speaker: '余婆 · 画外',
      text: '唱之前，先把气收住。气要是散了，后头的字就站不稳。',
    },
    {
      plate: 'room',
      grade: 'memory',
      speaker: '小满',
      text: '我记住了。您再听我起一遍。',
    },
    {
      plate: 'room',
      grade: 'memory',
      speaker: '余婆 · 画外',
      text: '碗用旧袜子套好。走十里路，别让它自己碰出声。',
    },
    {
      plate: 'room',
      grade: 'memory',
      speaker: '旁白',
      text: '小满把豁口转进袜筒，布带在箱外勒了一道。衬里露出一点纸边，她按平，没有抽。',
    },
    {
      plate: 'room',
      grade: 'memory',
      speaker: '小满',
      text: '换洗衣裳够三夜。信在里袋。',
    },
    {
      plate: 'room',
      grade: 'memory',
      speaker: '旁白',
      text: '箱子扣上。药账还在。工钱的事，到了地方再谈。',
    },
    {
      plate: 'shore',
      grade: 'reality',
      speaker: '旁白',
      text: '1998 年 10 月 23 日。她提着箱子，顺着下坝的路往新坳走。',
      caption: '〔岸上〕风贴着水面过来。',
      sound: 'wind',
    },
    {
      plate: 'gate',
      grade: 'reality',
      speaker: '旁白',
      text: '水库的水退得很开。岸上有的泥看着硬，里头还软。',
    },
  ] satisfies OpeningBeat[],
};
