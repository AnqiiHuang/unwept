# 欠哭 Unwept

1998 年的民俗悬疑调查游戏。当前试玩从开场走到新坳街：孝布辨亲、供桌委托、堂前起式和帷后私唱，借到门廊的灯之后去街窗。PZ-03 指认床头碗后，停在「那只桶往哪里传」。循桶声的后文还没有做。

## 启动

```bash
npm install
npx vite --host 127.0.0.1 --port 5173
```

浏览器打开 http://127.0.0.1:5173/unwept/ 。第一次点击之后才出声。线上页面是 https://anqiihuang.github.io/unwept/ ，由 GitHub Actions 发布 `dist`。

生产包：

```bash
npx vite build
npx vite preview --host 127.0.0.1 --port 4173
```

预览地址是 http://127.0.0.1:4173/unwept/ 。

逻辑测试：

```bash
node --experimental-strip-types --test tests/flow.test.ts
```

## 操作

- A / D 或左右方向键走动，也可以点地上的标记，人会走到旁边再查。
- E 查看身边的热点。对话中按空格，或点底部对话框继续。
- 数字键选当前选项。J 打开哭本，I 打开身上的东西，Esc 暂停。
- 对话框固定在底部。有画的人用半身像；还没有正式立绘的人标明「开发占位」。

## 存档

存在本机 `unwept-save-v1`。新游戏会先确认再覆盖。孝布已经辨明的旧档可以直接接着谈委托，不必重开。PZ-02 完成后读档仍保持完成，不会被重置成未完成。
