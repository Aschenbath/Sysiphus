<p align="center">
  <img src="icon.png" width="88" height="88" alt="Sisyphus icon">
</p>

<h1 align="center">Sisyphus</h1>

<p align="center">
  一个住在 Chrome 工具栏里的待办 / 打卡 / 提醒插件。<br>
  写下小事，等它到点，点掉它；明天该回来的，会自己回来。
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

## 它的性格

Sisyphus 适合那些不值得打开一整套项目管理工具、又不该被脑子硬扛的小事：`明天0930 干饭`、`每天2100 干饭`、`周五1120 干饭`。它是 popup 形式的插件，点一下扩展图标就出现；关掉 popup 后，提醒和 repeat 仍然交给 Chrome alarms 在后台守着。

它没有账号、没有云端、没有 dashboard，也没有把日常小事做成一间办公室。它更像浏览器角落里的一颗小石头：今天推上去，明天还会在原地等你。

## ✨ 核心三件事

🧠 **一句话进，结构化字段出**<br>
Quick Add 会从一整句里拆出日期、时间、repeat 和任务名，剩下的文本就是待办本身。

🔔 **到点时 popup 没开也不怕**<br>
后台 alarm 继续排程，Chrome 桌面通知给你 `Snooze` 和 `Done`，不打开窗口也能打卡。

🔁 **重复任务不是打一次勾就完**<br>
daily / weekly / monthly 完成之后，会在下一周期重新变回未完成，明天自己回来。

## 截图

### 动态演示

**Quick Add：一句话进来，结构化字段出来**

<p align="center">
  <img src="docs/screenshots/sisyphus-quick-add-demo.gif" width="420" alt="Sisyphus Quick Add 输入明天0930干饭后生成干饭任务并展示解析字段">
</p>

输入 `明天0930 干饭` 后，列表里只留下真正的任务名 `干饭`；点进编辑态，可以看到 Deadline 自动落到 `06/03`，Reminder 自动落到 `09:30`。

**全局提醒：24 小时手输，不弹下拉清单**

<p align="center">
  <img src="docs/screenshots/sisyphus-reminder-demo.gif" width="420" alt="Sisyphus 全局提醒面板 24 小时时间手动输入演示">
</p>

右上角铃铛只负责全局 daily reminder：开关、默认提醒时间、Snooze 分钟数都在这里；它和单条任务的自然语言解析分开，行为更清楚。

### 完整场景

<p align="center">
  <img src="docs/screenshots/sisyphus-main.png" width="760" alt="Sisyphus 浏览器弹出的主待办界面">
  <br>
  <sub>主待办界面</sub>
</p>

<p align="center">
  <img src="docs/screenshots/sisyphus-compose.png" width="760" alt="Sisyphus Quick Add 创建任务">
  <br>
  <sub>Quick Add 创建任务</sub>
</p>

<p align="center">
  <img src="docs/screenshots/sisyphus-notification.png" width="760" alt="Sisyphus Chrome 通知 Snooze 和 Done">
  <br>
  <sub>Chrome 通知 Snooze / Done</sub>
</p>

<details>
<summary>更多干净状态细节（默认隐藏的控件演示）</summary>

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

</details>

## 功能地图

核心能力都在下面这张表里。平时收起来让主线清爽，需要查的时候点开看。

<details>
<summary>📋 展开完整功能表</summary>

| 能力 | 说明 |
| --- | --- |
| Popup-first | 点击扩展图标直接打开 360px popup，不跳转新页面，不打断当前浏览。 |
| Local-first | 待办、提醒、标题、quote、视图状态都保存在 `chrome.storage.local`。 |
| 自定义应用名 | 双击左上角标题即可改名；Enter/blur 保存，Esc 取消，空值回到 `Sisyphus`。 |
| 自定义 quote | 底部 quote 固定在 popup 尾部；双击可分别修改 quote 和 author。 |
| 自然语言 Quick Add | `明天0930 干饭`、`每天2100 干饭`、`12300217 干饭` 都能被拆成结构化字段。 |
| 8 位数字速记 | `MMDDHHMM 任务名` 直接写日期和时间，例如 `06041200 干饭`。 |
| 可选 Deadline | 新建、编辑时都能设置截止日期；日期右侧 `x` 可以清空。 |
| 每任务提醒 | 每条 todo 可单独设置提醒时间；留空时走全局默认提醒时间。 |
| 提醒历史 | 最近 3 个提醒时间会自动留下，下一次不用重新输入。 |
| 全局提醒面板 | 右上角铃铛里设置 daily reminder 开关、24 小时手动输入的默认时间、Snooze 分钟数。 |
| Snooze / Done | Chrome 通知上可延后提醒，也可不打开 popup 直接标记完成。 |
| Re-remind | 单条任务到点后还没完成，可按 `5m / 10m / 15m / 30m` 再提醒。 |
| 后台排程 | popup 关闭后，提醒、snooze、repeat reset 仍由 background alarm 继续排。 |
| Repeat 真循环 | daily / weekly / monthly 任务完成后，会在下一周期恢复为未完成。 |
| Repeat-only 视图 | 眼睛按钮只看重复任务；切换状态会被保存，下次打开仍记得。 |
| 置顶 | 重要任务排在前方，用一条低噪音左侧细线标识。 |
| 安静操作按钮 | header 的眼睛、铃铛、加号，以及任务上的置顶/删除，都按 hover/focus 显形。 |
| 完成后淡出 | 普通任务完成后约 60 秒淡出并从列表移除，避免完成项堆成噪音。 |
| 逾期提示 | 逾期任务只用左侧视觉提示，不用夸张红色打扰。 |
| 自动日夜主题 | 18:00 到 06:00 暗色，其余时间亮色，跟随本地时间自动切换。 |
| 全局快捷键 | 默认建议快捷键为 `Alt+Shift+S`，也可在 Chrome 扩展快捷键页改。 |

</details>

## 快速开始

1. 点击扩展图标，或使用 `Alt+Shift+S`。
2. 点击右上角 `+`。
3. 像发消息一样输入普通任务，或直接输入 `明天0930 干饭` / `每天2100 干饭` / `12300217 干饭`。
4. 需要时设置 Deadline / Repeat / Reminder / Re-remind。
5. 关掉 popup 也没关系，到点后 Chrome 桌面通知会出现。
6. 通知上可选择 `Snooze` 或 `Done`；重复任务完成后会等下一轮回来。

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

<details>
<summary>支持范围与字段优先级</summary>

| 类型 | 支持 |
| --- | --- |
| 相对日期 | `今天` / `明天` / `后天` |
| 星期 | `周一` 到 `周日`，`星期一` 到 `星期日` |
| 重复 | `每天` / `每周` / `每月` |
| 时间 | `HHMM` / `HH:MM` / 全角冒号 |
| 日期时间速记 | `MMDDHHMM 任务名`，例如 `12300217 干饭` |

手动字段优先级更高：如果 Quick Add 解析出 repeat，但表单里手动选择了 Repeat，最终以手动选择为准。

</details>

## Repeat 真循环

当 repeat task 完成后，Sisyphus 会保留它，并在下一周期恢复为未完成：

| Repeat | 恢复时间 |
| --- | --- |
| Daily | 完成日之后的下一天 00:00 起恢复。 |
| Weekly | 完成日之后的下一周恢复。 |
| Monthly | 完成日之后的下一个月恢复。 |

恢复时会清理旧的 `completedAt` 和 `snoozedUntil`；如果任务有 `dueDate`，日期会推进到当前或未来周期。

## 上手细节

平时不用记，要查某个动作怎么用的时候点开就行。

<details>
<summary>🛠 展开完整操作手册</summary>

**创建任务**

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

**管理任务**

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

**自定义外观与文案**

| 位置 | 操作 |
| --- | --- |
| 左上角标题 | 双击标题进入编辑。 |
| 标题编辑 | Enter 或 blur 保存，Esc 取消，空值恢复 `Sisyphus`。 |
| 底部 quote | 双击 quote 区域进入编辑。 |
| quote 编辑 | 可分别修改 quote 和 author；Enter 或 blur 保存，Esc 取消。 |
| 内容字体 | 任务文本、Quick Add 输入、表单标签和数字都使用系统字体；标题与底部 quote 保留 Sisyphus 的书卷感。 |

**全局提醒**

| 操作 | 行为 |
| --- | --- |
| 点击右上角铃铛 | 打开提醒设置面板。 |
| Daily reminder toggle | 开启或关闭提醒通知。 |
| 24h 时间输入 | 手动输入全局默认提醒时间，支持 `0930` / `09:30` / `20:00`，保存后统一为 `HH:MM`，不会弹出系统下拉清单。 |
| Snooze select | 设置通知中 `Snooze` 的延后分钟数。 |
| 点击面板外 | 自动收起面板。 |

**通知**

| 通知操作 | 行为 |
| --- | --- |
| `Snooze` | 创建一次性 snooze alarm，并写入 `snoozedUntil`。 |
| `Done` | 后台直接把任务标记完成，并重新排程。 |
| 点击通知正文 | 当系统隐藏按钮时，作为 Snooze fallback。 |
| 同一任务重复提醒 | 使用稳定 notification id 替换同一条 toast，避免堆叠。 |

</details>

## 数据字段

<details>
<summary>🗃 展开数据结构</summary>

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

</details>

## 权限与隐私

| 权限 | 用途 |
| --- | --- |
| `storage` | 保存 todos、提醒配置、标题、quote、视图状态。 |
| `alarms` | popup 关闭后继续排程提醒、snooze 和 repeat reset。 |
| `notifications` | 显示 Chrome 桌面提醒。 |

Sisyphus 不需要账号，不连接后端服务，不包含 analytics。标题与 quote 使用 Cormorant Garamond；任务内容和表单输入使用系统字体，中文和数字保持清楚、正常、好读。如需完全离线字体，可在 `styles.css` 中替换字体 import。

## 安装

1. 下载或克隆本目录。
2. 打开 `chrome://extensions/`。
3. 开启 Developer mode。
4. 点击 Load unpacked。
5. 选择 `todo-extension` 文件夹。
6. 可选：打开 `chrome://extensions/shortcuts` 修改快捷键，默认建议为 `Alt+Shift+S`。
