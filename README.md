<p align="center">
  <img src="icon.png" width="88" height="88" alt="Sisyphus icon">
</p>

<h1 align="center">Sisyphus</h1>

<p align="center">
  一个安静、可靠、local-first 的 Chrome 待办 / 打卡 / 提醒插件。<br>
  适合每天重复出现的小 ritual、临时提醒、Snooze、Done，以及真正会回来的 Repeat。
</p>

<p align="center">
  <a href="README.md">简体中文</a> ·
  <a href="docs/i18n/README.en.md">English</a> ·
  <a href="docs/i18n/README.ja.md">日本語</a> ·
  <a href="docs/i18n/README.ko.md">한국어</a>
</p>

<p align="center">
  <img alt="Manifest V3" src="https://img.shields.io/badge/Manifest-V3-1f6feb?style=for-the-badge">
  <img alt="Local First" src="https://img.shields.io/badge/Local--First-yes-2ea043?style=for-the-badge">
  <img alt="Reminder" src="https://img.shields.io/badge/Reminder-Chrome%20Alarms-f97316?style=for-the-badge">
  <img alt="No Build" src="https://img.shields.io/badge/Build-none-6f42c1?style=for-the-badge">
</p>

---

## 截图

### 完整场景展示

#### Chrome 弹窗主界面

![Sisyphus 浏览器弹出的主待办界面](docs/screenshots/sisyphus-main.png)

#### Quick Add 创建任务

![Sisyphus Quick Add 创建任务](docs/screenshots/sisyphus-compose.png)

#### Chrome 通知 Snooze / Done

![Sisyphus Chrome 通知 Snooze 和 Done](docs/screenshots/sisyphus-notification.png)

### 无视觉噪音细节

#### 默认主列表：header 三个组件隐藏

<p align="center">
  <img src="docs/screenshots/sisyphus-clean-main.png" width="420" alt="Sisyphus 默认主列表干净截图">
</p>

#### Header 隐藏 / 显形对照

<p align="center">
  <img src="docs/screenshots/sisyphus-clean-header.png" width="820" alt="Sisyphus header 默认隐藏和 hover focus 显形对照">
</p>

#### Quick Add 表单

<p align="center">
  <img src="docs/screenshots/sisyphus-clean-quick-add.png" width="420" alt="Sisyphus Quick Add 表单干净截图">
</p>

#### 每日提醒面板

<p align="center">
  <img src="docs/screenshots/sisyphus-clean-reminder.png" width="420" alt="Sisyphus 每日提醒面板干净截图">
</p>

#### 通知按钮

<p align="center">
  <img src="docs/screenshots/sisyphus-clean-notification.png" width="560" alt="Sisyphus 通知 Snooze 和 Done 干净截图">
</p>

## 产品亮点

| 能力 | 说明 |
| --- | --- |
| Popup-first | 点击扩展图标直接打开待办列表，不跳转新页面。 |
| Local-first | 待办、提醒、标题、quote 和视图状态保存在 `chrome.storage.local`。 |
| 自定义应用名 | 双击左上角 `Sisyphus` 即可改名；Enter/blur 保存，Esc 取消，空值回到默认名。 |
| 自定义 quote | 双击底部 quote 区域，可修改 quote 和 author；Enter/blur 保存，Esc 取消。 |
| 自然语言 Quick Add | 输入 `明天0930 干饭` 或 `12300217 干饭`，自动拆出日期、提醒时间、repeat 和任务名。 |
| 可选 Deadline | 新增和编辑时都可设置或清空截止日期。 |
| 每任务提醒 | 每条 todo 可单独设置提醒时间；为空时使用全局提醒时间。 |
| 全局提醒面板 | 右上角铃铛设置 daily reminder 开关、默认提醒时间和 Snooze 分钟数。 |
| Snooze / Done | Chrome 通知支持稍后提醒和后台直接完成。 |
| Re-remind | 单条任务可设置到点后再次提醒间隔。 |
| Repeat 真循环 | daily / weekly / monthly 完成后会在下一周期恢复为未完成。 |
| Repeat-only 视图 | 右上角眼睛按钮可只看重复任务，状态会持久化。 |
| 置顶 | 置顶任务排在前方，并用低噪音左侧细线标识。 |
| 安静操作按钮 | 置顶、删除、铃铛、眼睛等工具默认弱化，hover/focus 才出现。 |
| 完成后淡出 | 普通任务完成后约 60 秒淡出并从列表移除。 |
| 自动日夜主题 | 18:00 到 06:00 使用暗色，其余时间使用亮色。 |
| 全局快捷键 | 默认建议快捷键为 `Alt+Shift+S`。 |

## 快速开始

1. 点击扩展图标，或使用 `Alt+Shift+S`。
2. 点击右上角 `+`。
3. 像发消息一样输入普通任务，或直接输入 `明天0930 干饭` / `12300217 干饭` 这类 Quick Add。
4. 需要时设置 Deadline / Repeat / Reminder / Re-remind。
5. 到点后 Chrome 桌面通知会出现。
6. 通知上可选择 `Snooze` 或 `Done`。

## 细节操作

### 创建任务

| 操作 | 行为 |
| --- | --- |
| 点击 `+` | 打开新增表单。 |
| 在新增表单任意位置按 `Enter` | 创建任务。 |
| 中文输入法选词时按 `Enter` | 不会误提交，已做 composition 保护。 |
| Quick Add 输入 `后天0600 干饭` | 自动识别后天、06:00，剩下文本作为任务名。 |
| Quick Add 输入 `12300217 干饭` | 按 `MMDDHHMM 任务名` 解析为今年 12/30 02:17。 |
| Deadline 右侧 `x` | 清空截止日期。 |
| Reminder 输入 `0930` | 自动解析为 `09:30`。 |
| Reminder 输入 `9:30` / `09:30` / 全角冒号 | 规范化为 24 小时格式。 |
| Reminder history | 自动保留最近 3 个提醒时间，方便复用。 |
| Re-remind 选 `5m / 10m / 15m / 30m` | 到点后未完成时按间隔再次提醒。 |

### 管理任务

| 操作 | 行为 |
| --- | --- |
| 点击圆圈 | 完成 / 取消完成。 |
| 点击任务文字 | 就地编辑任务，编辑表单插入到当前任务下方。 |
| 点击编辑表单外部 | 收起编辑表单。 |
| 编辑时按 `Enter` | 保存编辑。 |
| 编辑时点 Cancel | 放弃编辑。 |
| hover/focus 任务卡片 | 显示置顶和删除按钮。 |
| 点击置顶 | 任务排到前方，并显示左侧细线。 |
| 点击删除 | 删除该任务。 |
| 逾期任务 | 使用低噪音左侧视觉提示。 |
| 完成普通任务 | 约 60 秒后淡出。 |
| 完成重复任务 | 保留在数据中，等待下一周期恢复。 |

### 自定义外观文案

| 位置 | 操作 |
| --- | --- |
| 左上角标题 | 双击标题进入编辑。 |
| 标题编辑 | Enter 或 blur 保存，Esc 取消，空值恢复 `Sisyphus`。 |
| 底部 quote | 双击 quote 区域进入编辑。 |
| quote 编辑 | 可分别修改 quote 和 author；Enter 或 blur 保存，Esc 取消。 |
| 数字显示 | 任务文本里的数字会使用系统字体，避免 editorial 字体下数字难读。 |

### 全局提醒

| 操作 | 行为 |
| --- | --- |
| 点击右上角铃铛 | 打开提醒设置面板。 |
| Daily reminder toggle | 开启或关闭提醒通知。 |
| Hour / Minute select | 设置全局默认提醒时间。 |
| Snooze select | 设置通知中 `Snooze` 的延后分钟数。 |
| 点击面板外 | 自动收起面板。 |

### 通知

| 通知操作 | 行为 |
| --- | --- |
| `Snooze` | 创建一次性 snooze alarm，并写入 `snoozedUntil`。 |
| `Done` | 后台直接把任务标记完成，并重新排程。 |
| 点击通知正文 | 当系统隐藏按钮时，作为 Snooze fallback。 |
| 同一任务重复提醒 | 使用稳定 notification id 替换同一条 toast，避免堆叠。 |

## 自然语言 Quick Add

Quick Add 是面向日常待办的轻量自然语言解析。你可以像发消息一样写一整行，Sisyphus 会把能识别的日期、提醒时间、repeat 规则提取成结构化字段，剩下的文本保留为任务名。

它也支持 8 位数字速记：`MMDDHHMM 任务名`。这里的 `MM` 是月份，`DD` 是日期，`HH` 是 24 小时制小时，最后的 `MM` 是分钟；年份默认使用当前年份，空格后的内容就是任务名。

```text
明天0930 干饭
后天0600 干饭
后天 0600 干饭
每天2100 干饭
周五1120 干饭
0930 干饭
12300217 干饭
06041200 干饭
干饭
```

| 输入 | 自然解析结果 | 最终任务名 |
| --- | --- | --- |
| `明天0930 干饭` | due date = 明天，reminder = 09:30 | `干饭` |
| `后天0600 干饭` | due date = 后天，reminder = 06:00 | `干饭` |
| `后天 0600 干饭` | due date = 后天，reminder = 06:00 | `干饭` |
| `每天2100 干饭` | repeat = daily，reminder = 21:00 | `干饭` |
| `周五1120 干饭` | due date = 下一个周五，reminder = 11:20 | `干饭` |
| `0930 干饭` | reminder = 09:30 | `干饭` |
| `12300217 干饭` | due date = 今年 12/30，reminder = 02:17 | `干饭` |
| `06041200 干饭` | due date = 今年 06/04，reminder = 12:00 | `干饭` |
| `干饭` | 不提取日期或提醒，只创建普通文本任务 | `干饭` |

支持范围：

| 类型 | 支持 |
| --- | --- |
| 相对日期 | `今天` / `明天` / `后天` |
| 星期 | `周一` 到 `周日`，`星期一` 到 `星期日` |
| 重复 | `每天` / `每周` / `每月` |
| 时间 | `HHMM` / `HH:MM` / 全角冒号 |
| 日期时间速记 | `MMDDHHMM 任务名`，例如 `12300217 干饭` |

手动字段优先级更高：如果 Quick Add 解析出 repeat，但表单里手动选择了 Repeat，最终以手动选择为准。

## Repeat 真循环

当 repeat task 完成后，Sisyphus 会保留它，并在下一周期恢复为未完成：

| Repeat | 恢复时间 |
| --- | --- |
| Daily | 完成日之后的下一天 00:00 起恢复。 |
| Weekly | 完成日之后的下一周恢复。 |
| Monthly | 完成日之后的下一个月恢复。 |

恢复时会清理旧的 `completedAt` 和 `snoozedUntil`；如果任务有 `dueDate`，日期会推进到当前或未来周期。

## 数据字段

```js
{
  id: "uuid",
  text: "干饭",
  dueDate: "2026-06-05",
  repeat: "daily",
  reminderTime: "09:30",
  nagMinutes: 10,
  completed: false,
  completedAt: 1710000000000,
  snoozedUntil: 1710000600000,
  pinned: true
}
```

| 字段 | 说明 |
| --- | --- |
| `text` | 任务内容。 |
| `dueDate` | 可选截止日期。 |
| `repeat` | `none` / `daily` / `weekly` / `monthly`。 |
| `reminderTime` | 单任务提醒时间；为空时走全局时间。 |
| `nagMinutes` | Re-remind 间隔。 |
| `snoozedUntil` | 当前 snooze 到的时间。 |
| `pinned` | 控制置顶排序。 |

## 权限与隐私

| 权限 | 用途 |
| --- | --- |
| `storage` | 保存 todos、提醒配置、标题、quote、视图状态。 |
| `alarms` | popup 关闭后继续排程提醒、snooze 和 repeat reset。 |
| `notifications` | 显示 Chrome 桌面提醒。 |

Sisyphus 不需要账号，不连接后端服务，不包含 analytics。界面字体使用 Cormorant Garamond；如需完全离线字体，可在 `styles.css` 中替换字体 import。

## 安装

1. 下载或克隆本目录。
2. 打开 `chrome://extensions/`。
3. 开启 Developer mode。
4. 点击 Load unpacked。
5. 选择 `todo-extension` 文件夹。
6. 可选：打开 `chrome://extensions/shortcuts` 修改快捷键，默认建议为 `Alt+Shift+S`。

## 开发检查

纯 `Manifest V3 + HTML + CSS + JavaScript`，没有 build step。

```bash
node --test tests\todo-core.test.js tests\reminder-input.test.js tests\reminder-history.test.js tests\script-scope.test.js tests\background-reschedule.test.js tests\background-notification.test.js
node --check popup.js
node --check background.js
node --check todo-core.js
node scripts\readme-screenshots.mjs
```

## 项目结构

```text
todo-extension/
  manifest.json
  popup.html
  popup.js
  styles.css
  background.js
  todo-core.js
  icon.png
  docs/
    screenshots/
    i18n/
  scripts/
    readme-screenshots.mjs
  tests/
```
