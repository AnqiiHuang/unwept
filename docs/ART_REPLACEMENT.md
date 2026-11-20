# 美术替换记录（v2）

源图包：`art_source/v2/`（来自 `Unwept_Art_Replacement`）。生产输出：`public/art/v2/`。旧角色图保留为 `public/characters/**/*.bak`。程序重复的碗/箱/街旁小灯已关掉，改用已画在帧上的道具。

处理脚本：`scripts/process_art_v2.py`。裁切后清单：`public/art/v2/process_manifest.json`。

## 人物

| 源图 | 输出 | 画布 / 锚点 | 接入 |
| --- | --- | --- | --- |
| `xiaoman_motion_4x3.png` 4×3 格 | `characters/xiaoman-stand/1/2/3.png`，`xiaoman-bowl-stand/1/2/3.png`，`xiaoman-carry-stand/1/2/3.png` | 300×500，脚底 y=492，成人身约 430 | `scene-xiaoman-*`；端碗/提箱走路用对应三帧，**不再**画程序碗或第二只箱 |
| `cast_6.png` 左→右 | `guifen/changgui/jianjun/guyu/yupo.png`，`cast-xiaoman.png` | 同上；谷雨身高 300 | NPC 场景立绘。余婆单独文件，**未**当作秀兰 |
| `portraits_4x2.png` | `portrait-xiaoman(-look/-cry/-grief)`，桂芬/长贵/建军/谷雨 | 360×420 | 对白半身像用中性表情；其余表情已裁好待按语气切换 |
| `special_actions_4x2.png` | `xiaoman-lamp/throat/place-bowl/pack-lamp`，`guifen-cloth`，`changgui-work`，`jianjun-keys`，`guyu-squat` | 300×500 | 提灯、背上箱提灯已接入。`jianjun-keys` **未**作默认站姿（钥匙外露，剧情只需隔衣按），默认用 cast 站姿 |

## 背景

源图均为 2172×724（开场/标题 1672×941）。**未**非等比拉到世界尺寸。

| 场景 | 世界 | 等比缩放后 | 放置 | 软延展 | 说明 |
| --- | --- | --- | --- | --- | --- |
| 库边 `shore` | 5200×1080 | 3240×1080 | x≈900 | 左 900 / 右 1060 | 画板对准可走中段；倒桩/鞋印/船道具叠在 layout；两侧软延展待补画 |
| 村口 `village_gate` | 4000×1080 | 3240×1080 | 居中偏 | 左右约 380 | 告示、门口落在画板内 |
| 灵堂 `mourning_hall` | 3600×1080 | 3240×1080 | x=180 | 左右各 180 | 帷后十九条用单条布道具排成 19 |
| 街 `village_street` | 4600×1080 | 3240×1080 | x≈900 | 左 900 / 右 460 | 灶门、窗在画板内；街尽头待补 |
| 开场屋 / 标题 | 1920×1080 | 约满幅 | — | 极少 | 开场库边/村口另有 `opening_shore/gate` 1920 裁条 |

## 道具与近看

- `props_5x4` → `public/art/v2/props/*`（哭箱开合、碗、灯、凳、孝布、船、鞋印、芦苇等）。
- 街窗近看：`stove` / `window-lamp` / `window-bed` / `bowl-bed`。
- 灵堂近看：遗像仅作「堂上老人」画面，**身份仍以剧本为准**；孝布挂幅目测约十余条，**不足 19**，场景改用 `cloth-long` 排 19 条。
- UI：只抽了底板/边框/日记本纹理，按钮文字仍由代码绘制。

## 仍需补画

1. 库边、村口、街右侧软延展的正式续画（或分层远景），不要继续拉长现板。
2. 背景真正分层（天空/山/水/路/近景芦苇），当前是合成平面图。
3. 端碗/提箱/提灯的无缝步态精修；提灯目前多靠单帧。
4. 半身像按语气切换。
5. 水纹、被角、火星的独立动画层（近看仍叠程序时间记号）。
6. 建军「隔衣按钥匙」专用站姿（不用钥匙外露那张）。
7. 余婆出场图已裁，试玩范围未接入。

## 已知问题

- 库边世界比画板宽，右侧出坡是边缘色软延展，不是新绘。
- 帷后挂幅原图条数 ≠ 19，已用单条布排列替代。
- 旧 `.bak` 可回退；`02_美术参考` 开场静帧仍在仓库，Boot 已改读 `art/v2`。
