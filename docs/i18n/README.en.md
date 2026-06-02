<p align="center">
  <img src="../../icon.png" width="88" height="88" alt="Sisyphus icon">
</p>

<h1 align="center">Sisyphus</h1>

<p align="center">
  A quiet, reliable, local-first Chrome todo / check-in / reminder extension.<br>
  Built for daily rituals, small reminders, Snooze, Done, and repeat tasks that actually return.
</p>

<p align="center">
  <a href="../../README.md">简体中文</a> ·
  <a href="README.en.md">English</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a>
</p>

---

## Screenshots

| Main list | Quick add and reminder settings |
| --- | --- |
| ![Sisyphus main list](../screenshots/sisyphus-main.png) | ![Sisyphus compose](../screenshots/sisyphus-compose.png) |

## Highlights

| Feature | Details |
| --- | --- |
| Popup-first | The extension icon opens the complete todo surface directly. |
| Local-first | Todos, reminders, title, quote, and view state are stored in `chrome.storage.local`. |
| Custom app title | Double-click `Sisyphus` to rename the app; Enter/blur saves, Esc cancels, blank resets. |
| Custom quote | Double-click the footer quote to edit the quote and author. |
| Quick Add | Supports Chinese date tokens, compact times, repeat prefixes, and `MMDDHHMM title`. |
| Optional deadline | Set or clear a deadline when creating or editing a todo. |
| Per-task reminders | Each todo can have its own reminder time; empty uses the global reminder time. |
| Global reminder panel | Bell menu controls daily reminder, default time, and Snooze minutes. |
| Snooze / Done | Chrome notifications can snooze a task or mark it done in the background. |
| Re-remind | A task can remind again after 5, 10, 15, or 30 minutes. |
| Real repeat rollover | Daily, weekly, and monthly todos return to active in the next cycle. |
| Repeat-only view | The eye button filters to repeating todos and remembers that view. |
| Pinning | Pinned todos sort first and use a quiet left rail. |
| Quiet controls | Pin, delete, bell, and eye controls stay low-noise until hover/focus. |
| Completed fade-out | Normal completed todos fade out after about 60 seconds. |
| Auto day/night theme | Dark from 18:00 to 06:00, light during the day. |
| Shortcut | Suggested shortcut: `Alt+Shift+S`. |

## Core Operations

| Action | Result |
| --- | --- |
| Click `+` | Open the add form. |
| Press `Enter` inside the add form | Create the todo. |
| Use an IME and press `Enter` while composing | Composition is protected; it will not submit early. |
| Click the deadline `x` | Clear the date. |
| Type `0930` in reminder time | Normalize to `09:30`. |
| Use reminder history | Reuse one of the latest three reminder times. |
| Click the todo circle | Complete or uncomplete the todo. |
| Click todo text | Open inline editing below the current item. |
| Click outside edit form | Collapse the edit form. |
| Hover/focus a todo | Reveal pin and delete actions. |
| Click the bell | Open global reminder settings. |
| Click the eye | Toggle all todos / repeat-only view. |

## Quick Add

```text
明天0930 复习 JVM
后天0600 起床
每天2100 背单词
周五1120 复习JUC
0930 Read JVM notes
12300217 起床
普通任务
```

| Input | Parsed result |
| --- | --- |
| `明天0930 复习 JVM` | due date = tomorrow, reminder = 09:30, text = 复习 JVM |
| `后天0600 起床` | due date = day after tomorrow, reminder = 06:00 |
| `每天2100 背单词` | repeat = daily, reminder = 21:00 |
| `周五1120 复习JUC` | due date = next Friday, reminder = 11:20 |
| `0930 Read JVM notes` | reminder = 09:30 |
| `12300217 起床` | due date = Dec 30 this year, reminder = 02:17 |
| `普通任务` | plain todo text |

Supported tokens include `今天`, `明天`, `后天`, `周一` to `周日`, `星期一` to `星期日`, `每天`, `每周`, `每月`, `HHMM`, `HH:MM`, and `MMDDHHMM title`.

## Repeat Rollover

| Repeat | Return behavior |
| --- | --- |
| Daily | Returns at the next day after completion. |
| Weekly | Returns one week after completion. |
| Monthly | Returns one month after completion. |

When a repeat task returns, Sisyphus clears the old `completedAt` and `snoozedUntil`. If a due date exists, it is advanced into the current or next cycle.

## Customization

| Area | How it works |
| --- | --- |
| App title | Double-click, edit, then Enter/blur to save. Esc cancels. |
| Footer quote | Double-click the quote area to edit quote and author. |
| Numerals | Number runs inside todo text use a system font for readability. |
| Theme | Automatically switches by local time. |

## Permissions And Privacy

| Permission | Use |
| --- | --- |
| `storage` | Save todos, reminder settings, title, quote, and view state. |
| `alarms` | Schedule reminders, snoozes, and repeat resets while the popup is closed. |
| `notifications` | Show Chrome desktop reminders. |

Sisyphus requires no account, connects to no backend service, and includes no analytics.

## Install

1. Download or clone this directory.
2. Open `chrome://extensions/`.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select the `todo-extension` folder.
6. Optional: change the shortcut at `chrome://extensions/shortcuts`. The suggested shortcut is `Alt+Shift+S`.

## Development Checks

```bash
node --test tests\todo-core.test.js tests\reminder-input.test.js tests\reminder-history.test.js tests\script-scope.test.js tests\background-reschedule.test.js tests\background-notification.test.js
node --check popup.js
node --check background.js
node --check todo-core.js
```
