<p align="center">
  <img src="../../icon.png" width="88" height="88" alt="Sisyphus icon">
</p>

<h1 align="center">Sisyphus</h1>

<p align="center">
  Chrome 툴바 안에 사는 todo / check-in / reminder popup입니다.<br>
  작은 일을 적고, 시간까지 맡겨두고, 끝나면 지웁니다. 돌아와야 하는 일은 다음 주기에 다시 돌아옵니다.
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

## 성격

Sisyphus 는 큰 작업 관리 도구를 열 만큼 거창하지는 않지만, 머릿속에 계속 들고 있기에는 신경 쓰이는 작은 일들을 위한 확장입니다. `내일0930 밥 먹기`, `매일2100 밥 먹기`, `금요일1120 밥 먹기` 처럼 한 줄로 적을 수 있습니다.

Chrome popup 으로 열리기 때문에 새 탭으로 이동하지 않습니다. popup 을 닫아도 reminder, snooze, repeat reset 은 Chrome alarms 가 백그라운드에서 계속 처리합니다.

## ✨ 알아둘 세 가지

🧠 **한 줄을 넣으면 구조화된 필드로**<br>
Quick Add 가 한 줄에서 날짜, 시간, repeat, task title 을 분리하고 나머지는 task 본문으로 남깁니다.

🔔 **popup 을 닫아도 괜찮습니다**<br>
background alarm 이 계속 예약하고, Chrome 알림이 창을 열지 않고도 `Snooze` 와 `Done` 을 제공합니다.

🔁 **repeat task 는 한 번 체크로 끝나지 않습니다**<br>
daily / weekly / monthly 는 다음 주기에 active 상태로 돌아옵니다.

## Screenshots

### 데모

**Quick Add: 한 줄을 구조화된 필드로**

<p align="center">
  <img src="../screenshots/ko/sisyphus-quick-add-demo.gif" width="420" alt="Sisyphus Quick Add parses tomorrow 09:30 meal todo and shows the extracted fields">
</p>

`내일0930 밥 먹기` 은 실제 popup flow 로 생성됩니다. 목록에는 task title 인 `밥 먹기` 만 남고, 편집 화면에서는 파싱된 deadline 과 reminder time 을 확인할 수 있습니다.

**Global Reminder: 24시간 수동 입력**

<p align="center">
  <img src="../screenshots/ko/sisyphus-reminder-demo.gif" width="420" alt="Sisyphus global reminder panel manual 24-hour input demo">
</p>

벨 패널은 전체 daily reminder 설정입니다. 켜기/끄기, 기본 24시간 시각, Snooze 분을 여기서 다룹니다.

### 전체 맥락

<p align="center">
  <img src="../screenshots/ko/sisyphus-main.png" width="760" alt="Sisyphus browser popup">
  <br>
  <sub>브라우저 Popup</sub>
</p>

<p align="center">
  <img src="../screenshots/ko/sisyphus-compose.png" width="760" alt="Sisyphus Quick Add">
  <br>
  <sub>Quick Add</sub>
</p>

<p align="center">
  <img src="../screenshots/ko/sisyphus-notification.png" width="760" alt="Sisyphus Chrome notification actions">
  <br>
  <sub>Chrome 알림 Snooze / Done</sub>
</p>

<details>
<summary>시각적 노이즈를 줄인 세부 화면 (기본 숨김 컨트롤)</summary>

#### 기본 메인 목록: 헤더 컨트롤 숨김

<p align="center">
  <img src="../screenshots/ko/sisyphus-clean-main.png" width="420" alt="Sisyphus default main list close-up">
</p>

#### 헤더 숨김 / 표시 비교

<p align="center">
  <img src="../screenshots/ko/sisyphus-clean-header.png" width="820" alt="Sisyphus header hidden and visible comparison">
</p>

#### Quick Add 폼

<p align="center">
  <img src="../screenshots/ko/sisyphus-clean-quick-add.png" width="420" alt="Sisyphus Quick Add form close-up">
</p>

#### 일일 알림 패널

<p align="center">
  <img src="../screenshots/ko/sisyphus-clean-reminder.png" width="420" alt="Sisyphus daily reminder panel close-up">
</p>

#### 알림 버튼

<p align="center">
  <img src="../screenshots/ko/sisyphus-clean-notification.png" width="560" alt="Sisyphus notification Snooze and Done close-up">
</p>

</details>

## 주요 기능

모든 기능은 아래 표에 정리되어 있습니다. 평소에는 접어두고, 필요할 때 펼쳐서 확인하세요.

<details>
<summary>📋 전체 기능 표 펼치기</summary>

| 기능 | 설명 |
| --- | --- |
| Popup-first | 확장 아이콘을 누르면 360px todo popup 이 바로 열립니다. |
| Local-first | todos, reminders, title, quote, view state 는 `chrome.storage.local` 에 저장됩니다. |
| 앱 이름 변경 | 왼쪽 위 `Sisyphus` 를 더블 클릭해 이름을 바꿀 수 있습니다. Enter/blur 저장, Esc 취소, 빈 값은 기본 이름으로 돌아갑니다. |
| quote 변경 | footer quote 는 popup 하단에 고정됩니다. 더블 클릭해 quote 와 author 를 수정할 수 있습니다. |
| 자연어 Quick Add | `내일0930 밥 먹기`, `매일2100 밥 먹기`, `12300217 밥 먹기` 를 구조화된 todo 로 만듭니다. |
| 8자리 shorthand | `MMDDHHMM title` 로 날짜와 시간을 한 번에 적을 수 있습니다. |
| 선택적 Deadline | 생성/수정 시 deadline 을 설정하거나 지울 수 있습니다. |
| 작업별 Reminder | 각 todo 가 고유한 reminder time 을 가질 수 있고, 비어 있으면 global time 을 사용합니다. |
| Reminder history | 최근 3개의 reminder time 을 남겨 다시 쓰기 쉽게 합니다. |
| Global reminder panel | 종 버튼에서 daily reminder, 수동 24시간제 default time, Snooze minutes 를 설정합니다. |
| Snooze / Done | Chrome 알림에서 미루기 또는 완료 처리를 할 수 있습니다. |
| Re-remind | 5 / 10 / 15 / 30 분 후 다시 알릴 수 있습니다. |
| Background scheduling | popup 이 닫혀도 reminders, snoozes, repeat resets 는 계속 예약됩니다. |
| Repeat rollover | daily / weekly / monthly todo 는 다음 주기에 active 상태로 돌아옵니다. |
| Repeat-only view | 눈 버튼으로 반복 todo 만 보고, 상태를 기억합니다. |
| Pinning | 고정한 todo 는 먼저 표시되고 왼쪽 가는 선으로 표시됩니다. |
| Quiet controls | header controls 와 row actions 는 hover/focus 전까지 조용하게 숨겨집니다. |
| Completed fade-out | 일반 todo 는 완료 후 약 60초 뒤 fade out 됩니다. |
| Overdue hint | 기한이 지난 todo 는 왼쪽의 낮은 노이즈 표시로 드러납니다. |
| 자동 테마 | 18:00 부터 06:00 까지는 dark, 그 외 시간은 light. |
| Shortcut | 기본 제안 단축키는 `Alt+Shift+S` 입니다. |

</details>

## 자연어 Quick Add

Quick Add 는 일상 todo 를 위한 가벼운 자연어 파서입니다. 메시지를 쓰듯 한 줄로 입력하면 Sisyphus 가 인식 가능한 날짜, 시간, repeat 를 구조화된 필드로 바꾸고, 남은 텍스트를 task title 로 유지합니다.

8자리 shorthand 는 `MMDDHHMM title` 입니다. 월, 일, 24시간제 시, 분, 그리고 task title 을 뜻하며, 연도는 현재 연도를 사용합니다.

```text
내일0930 밥 먹기
모레0600 밥 먹기
모레 0600 밥 먹기
매일2100 밥 먹기
금요일1120 밥 먹기
0930 밥 먹기
12300217 밥 먹기
06041200 밥 먹기
밥 먹기
```

| 입력 | 파싱 결과 | Task title |
| --- | --- | --- |
| `내일0930 밥 먹기` | due date = tomorrow, reminder = 09:30 | `밥 먹기` |
| `모레0600 밥 먹기` | due date = day after tomorrow, reminder = 06:00 | `밥 먹기` |
| `모레 0600 밥 먹기` | due date = day after tomorrow, reminder = 06:00 | `밥 먹기` |
| `매일2100 밥 먹기` | repeat = daily, reminder = 21:00 | `밥 먹기` |
| `금요일1120 밥 먹기` | due date = next Friday, reminder = 11:20 | `밥 먹기` |
| `0930 밥 먹기` | reminder = 09:30 | `밥 먹기` |
| `12300217 밥 먹기` | due date = this year's 12/30, reminder = 02:17 | `밥 먹기` |
| `06041200 밥 먹기` | due date = this year's 06/04, reminder = 12:00 | `밥 먹기` |
| `밥 먹기` | 날짜나 알림을 추출하지 않는 plain todo | `밥 먹기` |

지원 token: `오늘`, `내일`, `모레`, `일요일` 부터 `토요일`, `매일`, `매주`, `매월`, `HHMM`, `HH:MM`, `MMDDHHMM title`. 중국어·일본어 날짜 단어도 인식합니다.

## Repeat

| Repeat | 돌아오는 방식 |
| --- | --- |
| Daily | 완료 다음 날 돌아옵니다. |
| Weekly | 완료 1주 뒤 돌아옵니다. |
| Monthly | 완료 1개월 뒤 돌아옵니다. |

돌아올 때 이전 `completedAt` 과 `snoozedUntil` 을 지우고, due date 가 있으면 현재 또는 다음 주기로 이동합니다.

## 조작

평소에는 외울 필요가 없습니다. 동작이 궁금할 때 펼쳐서 확인하세요.

<details>
<summary>🛠 자세한 조작 안내 펼치기</summary>

| 조작 | 동작 |
| --- | --- |
| `+` 클릭 | 추가 폼을 엽니다. |
| 추가 폼에서 `Enter` | todo 를 생성합니다. |
| IME 조합 중 `Enter` | 조합 보호로 조기 제출되지 않습니다. |
| `모레0600 밥 먹기` 입력 | 모레와 06:00 을 파싱하고 나머지를 task title 로 둡니다. |
| `12300217 밥 먹기` 입력 | `MMDDHHMM title` 로 올해 12/30 02:17 을 파싱합니다. |
| Deadline 의 `x` | 날짜를 지웁니다. |
| Reminder 에 `0930` 입력 | `09:30` 으로 정규화합니다. |
| Global reminder settings 에 `0930` / `09:30` / `20:00` 입력 | native dropdown 없이 24시간제 default time 으로 저장합니다. |
| Reminder history | 최근 3개의 reminder time 을 재사용합니다. |
| Re-remind 선택 | 완료되지 않으면 선택한 간격으로 다시 알립니다. |
| todo 원 클릭 | 완료 / 미완료를 전환합니다. |
| todo 텍스트 클릭 | 현재 항목 아래에 inline edit form 을 엽니다. |
| 편집 폼 밖 클릭 | 편집 폼을 접습니다. |
| todo hover/focus | pin 과 delete 를 표시합니다. |
| 종 클릭 | global reminder settings 를 엽니다. |
| 눈 클릭 | all / repeat-only view 를 전환합니다. |

</details>

## 권한과 프라이버시

| 권한 | 용도 |
| --- | --- |
| `storage` | todos, reminder settings, title, quote, view state 저장. |
| `alarms` | popup 이 닫혀 있어도 reminders, snoozes, repeat resets 예약. |
| `notifications` | Chrome desktop reminders 표시. |

Sisyphus 는 계정이 필요 없고, 백엔드 서비스나 analytics 에 연결하지 않습니다.

## 설치

1. 이 디렉터리를 다운로드하거나 clone 합니다.
2. `chrome://extensions/` 를 엽니다.
3. Developer mode 를 켭니다.
4. Load unpacked 를 클릭합니다.
5. `todo-extension` 폴더를 선택합니다.
6. 필요하면 `chrome://extensions/shortcuts` 에서 단축키를 변경합니다. 기본 제안은 `Alt+Shift+S` 입니다.
