<p align="center">
  <img src="../../icon.png" width="88" height="88" alt="Sisyphus icon">
</p>

<h1 align="center">Sisyphus</h1>

<p align="center">
  静かで信頼できる local-first の Chrome todo / チェックイン / リマインダー拡張です。<br>
  毎日の小さな習慣、短いリマインダー、Snooze、Done、そして本当に戻ってくる Repeat に対応します。
</p>

<p align="center">
  <a href="../../README.md">简体中文</a> ·
  <a href="README.en.md">English</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a>
</p>

---

## スクリーンショット

### 全体コンテキスト

#### ブラウザ Popup

![Sisyphus browser popup](../screenshots/sisyphus-main.png)

#### Quick Add

![Sisyphus Quick Add](../screenshots/sisyphus-compose.png)

#### Chrome 通知の Snooze / Done

![Sisyphus Chrome notification actions](../screenshots/sisyphus-notification.png)

### ノイズを抑えた詳細

#### デフォルトのメインリスト：ヘッダー操作は非表示

<p align="center">
  <img src="../screenshots/sisyphus-clean-main.png" width="420" alt="Sisyphus default main list close-up">
</p>

#### ヘッダーの非表示 / 表示

<p align="center">
  <img src="../screenshots/sisyphus-clean-header.png" width="820" alt="Sisyphus header hidden and visible comparison">
</p>

#### Quick Add フォーム

<p align="center">
  <img src="../screenshots/sisyphus-clean-quick-add.png" width="420" alt="Sisyphus Quick Add form close-up">
</p>

#### 毎日のリマインダー設定

<p align="center">
  <img src="../screenshots/sisyphus-clean-reminder.png" width="420" alt="Sisyphus daily reminder panel close-up">
</p>

#### 通知ボタン

<p align="center">
  <img src="../screenshots/sisyphus-clean-notification.png" width="560" alt="Sisyphus notification Snooze and Done close-up">
</p>

## 主な機能

| 機能 | 説明 |
| --- | --- |
| Popup-first | 拡張アイコンから todo 画面を直接開きます。 |
| Local-first | todos、reminders、title、quote、view state は `chrome.storage.local` に保存されます。 |
| アプリ名変更 | 左上の `Sisyphus` をダブルクリックして名前を変更できます。Enter/blur で保存、Esc でキャンセル、空なら既定名に戻ります。 |
| quote 変更 | フッターの quote をダブルクリックして quote と author を編集できます。 |
| 自然言語 Quick Add | `明天0930 ごはんを食べる` や `12300217 ごはんを食べる` を入力すると、日付・リマインダー時刻・repeat・タスク名を自動で切り分けます。 |
| 任意の Deadline | 作成・編集時に deadline を設定またはクリアできます。 |
| タスク別 Reminder | 各 todo に個別の reminder time を設定できます。空なら global time を使用。 |
| Global reminder panel | ベルから daily reminder、default time、Snooze minutes を設定。 |
| Snooze / Done | Chrome 通知から延期または完了できます。 |
| Re-remind | 5 / 10 / 15 / 30 分後の再通知に対応。 |
| Repeat rollover | daily / weekly / monthly の todo は次の周期で active に戻ります。 |
| Repeat-only view | 目のボタンで repeat todo だけを表示し、その状態を記憶します。 |
| Pinning | ピン留めした todo を上に表示し、左の細線で示します。 |
| Quiet controls | pin、delete、bell、eye は hover/focus まで控えめに表示されます。 |
| Completed fade-out | 通常 todo は完了後およそ 60 秒でフェードアウトします。 |
| 自動テーマ | 18:00 から 06:00 は dark、それ以外は light。 |

## 操作

| 操作 | 動作 |
| --- | --- |
| `+` をクリック | 追加フォームを開きます。 |
| 追加フォームで `Enter` | todo を作成します。 |
| IME 変換中に `Enter` | 誤送信しないよう保護されています。 |
| Deadline の `x` | 日付をクリアします。 |
| Reminder に `0930` | `09:30` に正規化します。 |
| Reminder history | 直近 3 件の reminder time を再利用できます。 |
| todo の丸をクリック | 完了 / 未完了を切り替えます。 |
| todo テキストをクリック | その下に inline edit form を開きます。 |
| 編集フォームの外をクリック | 編集フォームを閉じます。 |
| todo を hover/focus | pin と delete を表示します。 |
| ベルをクリック | global reminder settings を開きます。 |
| 目をクリック | all / repeat-only view を切り替えます。 |

## 自然言語 Quick Add

Quick Add は日常の todo 向けの軽量な自然言語パーサーです。メッセージを書くように 1 行で入力すると、Sisyphus が認識できる日付、時刻、repeat を構造化フィールドに変換し、残りのテキストをタスク名として残します。

8 桁の速記は `MMDDHHMM title` です。月、日、24 時間制の時、分、そしてタスク名という意味で、年は現在の年を使います。

```text
明天0930 ごはんを食べる
后天0600 ごはんを食べる
后天 0600 ごはんを食べる
每天2100 ごはんを食べる
周五1120 ごはんを食べる
0930 ごはんを食べる
12300217 ごはんを食べる
06041200 ごはんを食べる
ごはんを食べる
```

| 入力 | 解析結果 | タスク名 |
| --- | --- | --- |
| `明天0930 ごはんを食べる` | due date = tomorrow、reminder = 09:30 | `ごはんを食べる` |
| `后天0600 ごはんを食べる` | due date = day after tomorrow、reminder = 06:00 | `ごはんを食べる` |
| `后天 0600 ごはんを食べる` | due date = day after tomorrow、reminder = 06:00 | `ごはんを食べる` |
| `每天2100 ごはんを食べる` | repeat = daily、reminder = 21:00 | `ごはんを食べる` |
| `周五1120 ごはんを食べる` | due date = next Friday、reminder = 11:20 | `ごはんを食べる` |
| `0930 ごはんを食べる` | reminder = 09:30 | `ごはんを食べる` |
| `12300217 ごはんを食べる` | due date = 今年 12/30、reminder = 02:17 | `ごはんを食べる` |
| `06041200 ごはんを食べる` | due date = 今年 06/04、reminder = 12:00 | `ごはんを食べる` |
| `ごはんを食べる` | 日付や時刻を抽出せず、通常の todo として作成 | `ごはんを食べる` |

対応 token: `今天`, `明天`, `后天`, `周一` から `周日`, `星期一` から `星期日`, `每天`, `每周`, `每月`, `HHMM`, `HH:MM`, `MMDDHHMM title`。

## Repeat

| Repeat | 復帰動作 |
| --- | --- |
| Daily | 完了日の翌日に戻ります。 |
| Weekly | 完了日の 1 週間後に戻ります。 |
| Monthly | 完了日の 1 か月後に戻ります。 |

戻るときは古い `completedAt` と `snoozedUntil` を消し、due date があれば現在または次の周期に進めます。

## 権限とプライバシー

| 権限 | 用途 |
| --- | --- |
| `storage` | todos、reminder settings、title、quote、view state の保存。 |
| `alarms` | popup が閉じていても reminders、snoozes、repeat resets をスケジュール。 |
| `notifications` | Chrome desktop reminders を表示。 |

Sisyphus はアカウントを必要とせず、バックエンドサービスにも analytics にも接続しません。

## インストール

1. このディレクトリをダウンロードまたは clone します。
2. `chrome://extensions/` を開きます。
3. Developer mode を有効にします。
4. Load unpacked をクリックします。
5. `todo-extension` フォルダを選択します。
6. 必要なら `chrome://extensions/shortcuts` でショートカットを変更します。推奨は `Alt+Shift+S` です。

## 開発チェック

```bash
node --test tests\todo-core.test.js tests\reminder-input.test.js tests\reminder-history.test.js tests\script-scope.test.js tests\background-reschedule.test.js tests\background-notification.test.js
node --check popup.js
node --check background.js
node --check todo-core.js
node scripts\readme-screenshots.mjs
```
