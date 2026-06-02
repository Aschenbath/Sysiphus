<p align="center">
  <img src="../../icon.png" width="88" height="88" alt="Sisyphus icon">
</p>

<h1 align="center">Sisyphus</h1>

<p align="center">
  A todo, check-in, and reminder popup that lives in the Chrome toolbar.<br>
  Write the small thing, let it wait, check it off; the tasks meant to return will return.
</p>

<p align="center">
  <a href="../../README.md">简体中文</a> ·
  <a href="README.en.md">English</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a>
</p>

<p align="center">
  <img alt="Manifest V3" src="https://img.shields.io/badge/Manifest-V3-1f6feb?style=for-the-badge">
  <img alt="Local First" src="https://img.shields.io/badge/Local--First-yes-2ea043?style=for-the-badge">
  <img alt="Reminder" src="https://img.shields.io/badge/Reminder-Chrome%20Alarms-f97316?style=for-the-badge">
  <img alt="No Build" src="https://img.shields.io/badge/Build-none-6f42c1?style=for-the-badge">
</p>

---

## Character

Sisyphus is for the tiny recurring things that do not deserve a full project-management system, but also should not live in your head: `tomorrow 0930 grab a meal`, `daily 2100 grab a meal`, `weekly 1120 grab a meal`.

It opens as a Chrome popup, so it does not pull you into a new tab. After the popup closes, reminders, snoozes, and repeat resets are still scheduled through Chrome alarms.

## ✨ Three Things To Know

🧠 **One line in, structured fields out**<br>
Quick Add extracts the date, time, repeat, and title from a single line; the rest stays as the task itself.

🔔 **The popup can be closed**<br>
Background alarms keep scheduling, and Chrome notifications offer `Snooze` and `Done` without opening the window.

🔁 **A repeat task is not a one-time checkmark**<br>
Daily, weekly, and monthly tasks return to active in the next cycle.

## Screenshots

### Demo

**Quick Add: One Line In, Structured Fields Out**

<p align="center">
  <img src="../screenshots/en/sisyphus-quick-add-demo.gif" width="420" alt="Sisyphus Quick Add parses tomorrow 09:30 meal todo and shows the extracted fields">
</p>

`tomorrow 0930 grab a meal` is created through the real popup flow. The list keeps only the task title, `grab a meal`, while the edit form shows the parsed deadline and reminder time.

**Global Reminder: Manual 24-hour Input**

<p align="center">
  <img src="../screenshots/en/sisyphus-reminder-demo.gif" width="420" alt="Sisyphus global reminder panel manual 24-hour input demo">
</p>

The bell panel is a separate global daily-reminder setting: enable/disable, default 24-hour time, and Snooze minutes.

### Full Context

<p align="center">
  <img src="../screenshots/en/sisyphus-main.png" width="760" alt="Sisyphus browser popup">
  <br>
  <sub>Browser popup</sub>
</p>

<p align="center">
  <img src="../screenshots/en/sisyphus-compose.png" width="760" alt="Sisyphus Quick Add">
  <br>
  <sub>Quick Add</sub>
</p>

<p align="center">
  <img src="../screenshots/en/sisyphus-notification.png" width="760" alt="Sisyphus Chrome notification actions">
  <br>
  <sub>Chrome notification Snooze / Done</sub>
</p>

<details>
<summary>More clean-state detail shots (controls hidden by default)</summary>

#### Default Main List: Header Controls Hidden

<p align="center">
  <img src="../screenshots/en/sisyphus-clean-main.png" width="420" alt="Sisyphus clean default main list screenshot">
</p>

#### Header Hidden / Visible

<p align="center">
  <img src="../screenshots/en/sisyphus-clean-header.png" width="820" alt="Sisyphus header hidden and visible comparison">
</p>

#### Quick Add Form

<p align="center">
  <img src="../screenshots/en/sisyphus-clean-quick-add.png" width="420" alt="Sisyphus clean Quick Add form screenshot">
</p>

#### Daily Reminder Panel

<p align="center">
  <img src="../screenshots/en/sisyphus-clean-reminder.png" width="420" alt="Sisyphus clean daily reminder panel screenshot">
</p>

#### Notification Actions

<p align="center">
  <img src="../screenshots/en/sisyphus-clean-notification.png" width="560" alt="Sisyphus clean notification Snooze and Done screenshot">
</p>

</details>

## Features

Every capability lives in the table below. It stays collapsed to keep the main flow calm, and opens when you need the full list.

<details>
<summary>📋 Open the full feature table</summary>

| Feature | Details |
| --- | --- |
| Popup-first | The extension icon opens a 360px todo popup without navigating away. |
| Local-first | Todos, reminders, title, quote, and view state are stored in `chrome.storage.local`. |
| Custom app title | Double-click `Sisyphus` to rename the app; Enter/blur saves, Esc cancels, blank resets. |
| Custom quote | The footer quote stays at the bottom of the popup; double-click to edit quote and author. |
| Natural-language Quick Add | `tomorrow 0930 grab a meal`, `daily 2100 grab a meal`, and `12300217 grab a meal` become structured todos. |
| 8-digit shorthand | `MMDDHHMM title` records date and time in one compact token. |
| Optional deadline | Set or clear a deadline when creating or editing a todo. |
| Per-task reminders | Each todo can have its own reminder time; empty uses the global reminder time. |
| Reminder history | The latest three reminder times are kept for quick reuse. |
| Global reminder panel | Bell menu controls daily reminder, manual 24-hour default time, and Snooze minutes. |
| Snooze / Done | Chrome notifications can snooze a task or mark it done in the background. |
| Re-remind | A task can remind again after 5, 10, 15, or 30 minutes. |
| Background scheduling | Reminders, snoozes, and repeat resets keep working after the popup closes. |
| Real repeat rollover | Daily, weekly, and monthly todos return to active in the next cycle. |
| Repeat-only view | The eye button filters to repeating todos and remembers that view. |
| Pinning | Pinned todos sort first and use a quiet left rail. |
| Quiet controls | Header controls and row actions stay low-noise until hover/focus. |
| Completed fade-out | Normal completed todos fade out after about 60 seconds. |
| Overdue hint | Overdue tasks use a quiet left-side visual hint. |
| Auto day/night theme | Dark from 18:00 to 06:00, light during the day. |
| Shortcut | Suggested shortcut: `Alt+Shift+S`. |

</details>

## Natural-language Quick Add

Quick Add is a lightweight natural-language parser for everyday todos. Write one line like a message; Sisyphus turns recognizable date, reminder, and repeat fragments into structured fields, then leaves the rest as the todo title.

The 8-digit shorthand is `MMDDHHMM title`: month, day, 24-hour hour, minute, then the task title. It uses the current year.

```text
tomorrow 0930 grab a meal
today 0600 grab a meal
daily 2100 grab a meal
weekly 1120 grab a meal
monthly 0900 grab a meal
0930 grab a meal
12300217 grab a meal
06041200 grab a meal
grab a meal
```

| Input | Parsed structure | Task title |
| --- | --- | --- |
| `tomorrow 0930 grab a meal` | due date = tomorrow, reminder = 09:30 | `grab a meal` |
| `today 0600 grab a meal` | due date = today, reminder = 06:00 | `grab a meal` |
| `daily 2100 grab a meal` | repeat = daily, reminder = 21:00 | `grab a meal` |
| `weekly 1120 grab a meal` | repeat = weekly, reminder = 11:20 | `grab a meal` |
| `monthly 0900 grab a meal` | repeat = monthly, reminder = 09:00 | `grab a meal` |
| `0930 grab a meal` | reminder = 09:30 | `grab a meal` |
| `12300217 grab a meal` | due date = Dec 30 this year, reminder = 02:17 | `grab a meal` |
| `06041200 grab a meal` | due date = Jun 4 this year, reminder = 12:00 | `grab a meal` |
| `grab a meal` | no date or reminder extracted | `grab a meal` |

Supported tokens include `today`, `tomorrow`, `daily`, `weekly`, `monthly`, `HHMM`, `HH:MM`, and `MMDDHHMM title`. Chinese, Japanese, and Korean date words (for example `明日`, `내일`, `毎日`) are recognized too.

## Repeat Rollover

| Repeat | Return behavior |
| --- | --- |
| Daily | Returns at the next day after completion. |
| Weekly | Returns one week after completion. |
| Monthly | Returns one month after completion. |

When a repeat task returns, Sisyphus clears the old `completedAt` and `snoozedUntil`. If a due date exists, it is advanced into the current or next cycle.

## Hands-on Details

You do not need to memorize these. Open the guide when you want to know how a specific action behaves.

<details>
<summary>🛠 Open the full operation guide</summary>

**Operations**

| Action | Result |
| --- | --- |
| Click `+` | Open the add form. |
| Press `Enter` inside the add form | Create the todo. |
| Use an IME and press `Enter` while composing | Composition is protected; it will not submit early. |
| Type `today 0600 grab a meal` | Parse today and 06:00, keeping the rest as the title. |
| Type `12300217 grab a meal` | Parse `MMDDHHMM title` as Dec 30, 02:17, this year. |
| Click the deadline `x` | Clear the date. |
| Type `0930` in reminder time | Normalize to `09:30`. |
| Type `0930` / `09:30` / `20:00` in global reminder settings | Save a manual 24-hour default time without opening a native dropdown. |
| Use reminder history | Reuse one of the latest three reminder times. |
| Choose Re-remind | Remind again after the selected interval if the todo remains open. |
| Click the todo circle | Complete or uncomplete the todo. |
| Click todo text | Open inline editing below the current item. |
| Click outside edit form | Collapse the edit form. |
| Hover/focus a todo | Reveal pin and delete actions. |
| Click the bell | Open global reminder settings. |
| Click the eye | Toggle all todos / repeat-only view. |

**Customization**

| Area | How it works |
| --- | --- |
| App title | Double-click, edit, then Enter/blur to save. Esc cancels. |
| Footer quote | Double-click the quote area to edit quote and author. |
| Content font | Todo text, Quick Add input, form labels, and numerals use a system font; the title and footer quote keep Sisyphus' editorial voice. |
| Theme | Automatically switches by local time. |

</details>

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
