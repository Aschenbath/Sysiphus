import { spawn } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const baseOutputDir = path.join(projectRoot, 'docs', 'screenshots');
let outputDir = baseOutputDir;
const popupUrl = pathToFileURL(path.join(projectRoot, 'popup.html')).href;
const iconData = `data:image/png;base64,${readFileSync(path.join(projectRoot, 'icon.png')).toString('base64')}`;

// CJK fallbacks so ja/ko frame copy never renders as tofu on a clean Win11 box.
const FONT_STACK = 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "Meiryo", "Malgun Gothic", sans-serif';

const LANGS = ['zh', 'en', 'ja', 'ko'];

// Per-language demo content. Short technical labels (Repeat / Add / Snooze / Done /
// Daily, the chips, the eyebrow) stay English across every language, matching the
// product UI; only the prose, sample task text, and the Quick Add typed line localize.
const LOCALE_DATA = {
  zh: {
    tag: 'zh-CN',
    dir: '',
    mealWord: '干饭',
    quickText: '明天0930 干饭',
    tasks: ['每天2100 干饭', '明天0930 干饭', '12300217 干饭', '周五1120 干饭', '干饭'],
    headerHidden: '默认状态：右上角三个组件隐藏',
    headerVisible: 'hover / focus 后：Repeat、提醒、Add 出现',
    cleanNote: '到提醒时间后，可直接 Snooze，或在后台标记 Done。',
    notifyBody: '到提醒时间后，通知可以直接 Snooze，或者在后台标记 Done。',
    shotMain: {
      title: 'Popup 形式的待办插件',
      lead: '小事写进工具栏，不占新页面；到点由 Chrome 通知敲一下，做完就安静退场。',
      callout: '浏览器工具栏中的扩展入口、弹出的 popup、hover 后可见的 repeat / reminder / add 功能栏。'
    },
    shotCompose: {
      title: '像发消息一样创建任务',
      lead: '`明天0930 干饭` 会被拆成日期、提醒时间和任务名，Repeat 与 Re-remind 再手动补上一刀。',
      callout: '自然语言输入、展开的右上角功能栏、每日提醒面板、Repeat 与 Re-remind 控件。'
    },
    shotNotification: {
      title: '到点后不用开 popup',
      lead: 'Snooze 先放一放，Done 直接收掉；popup 关闭后，background alarm 继续守着下一次。'
    }
  },
  en: {
    tag: 'en-US',
    dir: 'en',
    mealWord: 'grab a meal',
    quickText: 'tomorrow 0930 grab a meal',
    tasks: ['daily 2100 grab a meal', 'tomorrow 0930 grab a meal', '12300217 grab a meal', 'friday 1120 grab a meal', 'grab a meal'],
    headerHidden: 'Default: the three top-right controls stay hidden',
    headerVisible: 'After hover / focus: Repeat, reminder, Add appear',
    cleanNote: 'At reminder time you can Snooze it, or mark it Done from the background.',
    notifyBody: 'At reminder time the notification can Snooze directly, or be marked Done in the background.',
    shotMain: {
      title: 'A to-do extension that lives in a popup',
      lead: 'Small things go into the toolbar, not a new tab; Chrome taps you at the right time, and a finished task quietly leaves.',
      callout: 'The extension entry in the toolbar, the popup it opens, and the repeat / reminder / add bar revealed on hover.'
    },
    shotCompose: {
      title: 'Create a task like sending a message',
      lead: '`tomorrow 0930 grab a meal` is split into date, reminder time, and title; Repeat and Re-remind are one manual tap away.',
      callout: 'Natural-language input, the expanded top-right bar, the daily reminder panel, and the Repeat / Re-remind controls.'
    },
    shotNotification: {
      title: 'No need to open the popup',
      lead: 'Snooze to defer, Done to clear it; after the popup closes, the background alarm keeps watch for the next one.'
    }
  },
  ja: {
    tag: 'ja-JP',
    dir: 'ja',
    mealWord: 'ごはん',
    quickText: '明日0930 ごはん',
    tasks: ['毎日2100 ごはん', '明日0930 ごはん', '12300217 ごはん', '金曜日1120 ごはん', 'ごはん'],
    headerHidden: '既定：右上の3つのボタンは非表示',
    headerVisible: 'hover / focus すると：Repeat・リマインド・Add が出現',
    cleanNote: 'リマインド時刻になったら、その場で Snooze、またはバックグラウンドで Done。',
    notifyBody: 'リマインド時刻になると、通知から直接 Snooze、またはバックグラウンドで Done にできる。',
    shotMain: {
      title: 'ポップアップに住む ToDo 拡張',
      lead: '小さな用事はツールバーへ、新しいタブは開かない。時間になると Chrome が通知し、終わったタスクは静かに消える。',
      callout: 'ツールバーの拡張アイコン、開いたポップアップ、hover で現れる repeat / reminder / add バー。'
    },
    shotCompose: {
      title: 'メッセージのようにタスクを作る',
      lead: '`明日0930 ごはん` は日付・リマインド時刻・タイトルに分解され、Repeat と Re-remind は手動でもう一手。',
      callout: '自然言語入力、展開した右上バー、毎日リマインドパネル、Repeat と Re-remind コントロール。'
    },
    shotNotification: {
      title: 'ポップアップを開かなくていい',
      lead: 'Snooze で後回し、Done で完了。ポップアップを閉じても、バックグラウンドの alarm が次を見張る。'
    }
  },
  ko: {
    tag: 'ko-KR',
    dir: 'ko',
    mealWord: '밥먹기',
    quickText: '내일0930 밥먹기',
    tasks: ['매일2100 밥먹기', '내일0930 밥먹기', '12300217 밥먹기', '금요일1120 밥먹기', '밥먹기'],
    headerHidden: '기본: 오른쪽 위 버튼 3개는 숨김',
    headerVisible: 'hover / focus 하면: Repeat, 알림, Add 표시',
    cleanNote: '알림 시각이 되면 바로 Snooze하거나 백그라운드에서 Done할 수 있어요.',
    notifyBody: '알림 시각이 되면 알림에서 바로 Snooze하거나 백그라운드에서 Done할 수 있어요.',
    shotMain: {
      title: '팝업에 사는 할 일 확장',
      lead: '작은 일은 새 탭이 아니라 도구 모음에. 때가 되면 Chrome가 알려주고, 끝낸 일은 조용히 사라져요.',
      callout: '도구 모음의 확장 아이콘, 열린 팝업, hover하면 보이는 repeat / reminder / add 바.'
    },
    shotCompose: {
      title: '메시지 보내듯 할 일 만들기',
      lead: '`내일0930 밥먹기`는 날짜·알림 시각·제목으로 나뉘고, Repeat과 Re-remind는 수동으로 한 번 더.',
      callout: '자연어 입력, 펼친 오른쪽 위 바, 매일 알림 패널, Repeat과 Re-remind 컨트롤.'
    },
    shotNotification: {
      title: '팝업을 열 필요 없이',
      lead: 'Snooze로 미루고 Done으로 정리. 팝업을 닫아도 백그라운드 alarm이 다음을 지켜봐요.'
    }
  }
};

// Chips and the eyebrow are short technical labels: identical across all four languages.
const CHIPS = {
  main: ['Local-first', 'Hover toolbar', 'Repeat view'],
  compose: ['Quick Add', 'Deadline', 'Re-remind'],
  notification: ['Chrome alarms', 'Snooze', 'Done']
};

let currentLang = 'zh';
let currentData = LOCALE_DATA.zh;
let currentLangTag = 'zh-CN';

function buildTodos(data) {
  const t = data.tasks;
  return [
    {
      id: 'meal-daily',
      text: t[0],
      dueDate: '2026-06-02',
      repeat: 'daily',
      reminderTime: '21:00',
      nagMinutes: 10,
      completed: false,
      pinned: true,
      createdAt: '2026-06-02T08:00:00.000Z'
    },
    {
      id: 'meal-tomorrow',
      text: t[1],
      dueDate: '2026-06-03',
      repeat: 'none',
      reminderTime: '09:30',
      nagMinutes: 0,
      completed: false,
      pinned: false,
      createdAt: '2026-06-02T07:00:00.000Z'
    },
    {
      id: 'meal-compact',
      text: t[2],
      dueDate: '2026-12-30',
      repeat: 'none',
      reminderTime: '02:17',
      nagMinutes: 0,
      completed: false,
      pinned: false,
      createdAt: '2026-06-02T06:00:00.000Z'
    },
    {
      id: 'meal-weekly',
      text: t[3],
      dueDate: '2026-06-05',
      repeat: 'weekly',
      reminderTime: '11:20',
      nagMinutes: 5,
      completed: false,
      pinned: false,
      createdAt: '2026-06-02T05:00:00.000Z'
    },
    {
      id: 'meal-done',
      text: t[4],
      dueDate: null,
      repeat: 'none',
      reminderTime: null,
      nagMinutes: 0,
      completed: true,
      completedAt: Date.now() - 15000,
      pinned: false,
      createdAt: '2026-06-02T04:00:00.000Z'
    }
  ];
}

function buildStorage(data) {
  return {
    todos: buildTodos(data),
    reminderEnabled: true,
    reminderTime: '09:30',
    snoozeMinutes: 10,
    reminderHistory: ['09:30', '21:00', '02:17'],
    appTitle: 'Sisyphus',
    quoteSettings: {
      text: 'One must imagine Sisyphus happy.',
      author: 'Albert Camus'
    },
    todoViewMode: 'all',
    repeatRecovery_2026_06_01: true,
    lang: data === LOCALE_DATA.zh ? 'zh' : data.dir
  };
}

let storage = buildStorage(currentData);

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ].filter(Boolean);
  const found = candidates.find(candidate => existsSync(candidate));
  if (!found) {
    throw new Error('Chrome/Edge executable not found. Set CHROME_PATH if it is installed elsewhere.');
  }
  return found;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForChrome(port) {
  const endpoint = `http://127.0.0.1:${port}/json/version`;
  const started = Date.now();
  while (Date.now() - started < 10000) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Chrome is still starting.
    }
    await delay(100);
  }
  throw new Error('Timed out waiting for Chrome remote debugging endpoint.');
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', event => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        else resolve(msg.result || {});
        return;
      }
      if (msg.method && this.events.has(msg.method)) {
        for (const resolve of this.events.get(msg.method)) resolve(msg.params || {});
        this.events.delete(msg.method);
      }
    });
  }

  static async connect(wsUrl) {
    const client = new CdpClient(wsUrl);
    await client.ready;
    return client;
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  waitFor(method) {
    return new Promise(resolve => {
      const list = this.events.get(method) || [];
      list.push(resolve);
      this.events.set(method, list);
    });
  }

  close() {
    this.ws.close();
  }
}

async function openPage(port) {
  const res = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  if (!res.ok) throw new Error(`Could not open a new Chrome target: ${res.status}`);
  const target = await res.json();
  return CdpClient.connect(target.webSocketDebuggerUrl);
}

async function navigate(client, url) {
  await client.send('Page.enable');
  const loaded = client.waitFor('Page.loadEventFired');
  await client.send('Page.navigate', { url });
  await loaded;
}

async function evaluate(client, expression) {
  return client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
}

function chromeStorageMockScript(initialStorage) {
  return `
    (() => {
      const storage = ${JSON.stringify(initialStorage)};
      try {
        Object.defineProperty(navigator, 'language', { get: () => ${JSON.stringify(currentLangTag)}, configurable: true });
        Object.defineProperty(navigator, 'languages', { get: () => [${JSON.stringify(currentLangTag)}], configurable: true });
      } catch (e) {}
      const listeners = [];
      function pick(keys) {
        if (keys == null) return { ...storage };
        if (Array.isArray(keys)) {
          const out = {};
          keys.forEach(key => {
            if (Object.prototype.hasOwnProperty.call(storage, key)) out[key] = storage[key];
          });
          return out;
        }
        if (typeof keys === 'string') return { [keys]: storage[keys] };
        if (typeof keys === 'object') {
          const out = { ...keys };
          Object.keys(keys).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(storage, key)) out[key] = storage[key];
          });
          return out;
        }
        return {};
      }
      globalThis.chrome = {
        storage: {
          local: {
            get(keys, cb) {
              setTimeout(() => cb(pick(keys)), 0);
            },
            set(values, cb) {
              const changes = {};
              Object.keys(values || {}).forEach(key => {
                changes[key] = { oldValue: storage[key], newValue: values[key] };
                storage[key] = values[key];
              });
              setTimeout(() => {
                listeners.forEach(fn => fn(changes, 'local'));
                if (cb) cb();
              }, 0);
            }
          },
          onChanged: {
            addListener(fn) {
              listeners.push(fn);
            }
          }
        },
        runtime: {
          lastError: null,
          sendMessage(_msg, cb) {
            if (cb) setTimeout(() => cb({ ok: true }), 0);
          }
        }
      };
    })();
  `;
}

function writeDataUrlPng(dataUrl, outPath) {
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  writeFileSync(outPath, Buffer.from(base64, 'base64'));
}

async function writeFrame(client, frameDir, frameIndex, repeats = 1) {
  const shot = await client.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true
  });
  for (let i = 0; i < repeats; i++) {
    const framePath = path.join(frameDir, `frame-${String(frameIndex + i).padStart(4, '0')}.png`);
    writeFileSync(framePath, Buffer.from(shot.data, 'base64'));
  }
  return frameIndex + repeats;
}

function popupPolishScript(theme, { revealHeader = false, revealRows = false } = {}) {
  return `
    (() => {
      document.documentElement.dataset.theme = ${JSON.stringify(theme)};
      const style = document.createElement('style');
      style.textContent = \`
        *, *::before, *::after {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
          caret-color: transparent !important;
        }
        .header-actions {
          opacity: ${revealHeader ? '1' : '0'} !important;
          pointer-events: ${revealHeader ? 'auto' : 'none'} !important;
        }
        .todo-actions {
          opacity: ${revealRows ? '1' : '0'} !important;
          transform: none !important;
        }
        .todo-item:hover {
          transform: none !important;
        }
      \`;
      document.head.appendChild(style);
      const list = document.querySelector('.todo-list');
      if (list) list.scrollTop = 0;
    })();
  `;
}

function headerComparisonHtml({ hiddenHeader, visibleHeader }) {
  return `<!doctype html>
<html lang="${currentLangTag}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    width: 980px;
    height: 330px;
    overflow: hidden;
    background: #f6f7f4;
    color: #22313f;
    font-family: ${FONT_STACK};
  }
  .wrap {
    width: 980px;
    height: 330px;
    padding: 28px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  .panel {
    border: 1px solid #d8ded8;
    border-radius: 8px;
    background: #ffffff;
    overflow: hidden;
    box-shadow: 0 16px 44px rgba(35, 45, 52, 0.12);
  }
  .label {
    height: 46px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #e7ece7;
    font-size: 14px;
    font-weight: 800;
    color: #53606a;
  }
  img {
    width: 100%;
    display: block;
  }
</style>
</head>
<body>
  <div class="wrap">
    <section class="panel">
      <div class="label">${currentData.headerHidden}</div>
      <img src="${hiddenHeader}" alt="Sisyphus header hidden state">
    </section>
    <section class="panel">
      <div class="label">${currentData.headerVisible}</div>
      <img src="${visibleHeader}" alt="Sisyphus header visible state">
    </section>
  </div>
</body>
</html>`;
}

function cleanNotificationHtml() {
  return `<!doctype html>
<html lang="${currentLangTag}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    width: 760px;
    height: 360px;
    overflow: hidden;
    display: grid;
    place-items: center;
    background: #f5f7f3;
    font-family: ${FONT_STACK};
    color: #243241;
  }
  .notification {
    width: 520px;
    border: 1px solid #d7ded8;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 18px 48px rgba(35, 45, 52, 0.18);
    overflow: hidden;
  }
  .head {
    height: 56px;
    padding: 0 18px;
    display: flex;
    align-items: center;
    gap: 11px;
    border-bottom: 1px solid #edf0ed;
    color: #68747d;
    font-size: 13px;
    font-weight: 750;
  }
  .head img {
    width: 25px;
    height: 25px;
  }
  .body {
    padding: 24px 24px 20px;
  }
  .title {
    margin: 0 0 9px;
    font-size: 30px;
    font-weight: 800;
    line-height: 1.15;
    color: #22313f;
  }
  .message {
    margin: 0;
    color: #59656f;
    font-size: 15px;
    line-height: 1.6;
  }
  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-top: 1px solid #edf0ed;
  }
  button {
    height: 50px;
    border: 0;
    background: #ffffff;
    color: #263746;
    font-size: 15px;
    font-weight: 800;
  }
  button + button {
    border-left: 1px solid #edf0ed;
    color: #3f7f64;
  }
</style>
</head>
<body>
  <section class="notification">
    <div class="head"><img src="${iconData}" alt="">Sisyphus · Chrome notification</div>
    <div class="body">
      <h1 class="title">${currentData.mealWord}</h1>
      <p class="message">${currentData.cleanNote}</p>
    </div>
    <div class="actions"><button>Snooze</button><button>Done</button></div>
  </section>
</body>
</html>`;
}

async function capturePopup(port, {
  theme = 'light',
  prepare = '',
  revealHeader = false,
  revealRows = false,
  clip = null
} = {}) {
  const client = await openPage(port);
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 360,
    height: 600,
    deviceScaleFactor: 2,
    mobile: false
  });
  await client.send('Page.addScriptToEvaluateOnNewDocument', {
    source: chromeStorageMockScript(storage)
  });
  await navigate(client, popupUrl);
  await evaluate(client, `new Promise(resolve => setTimeout(resolve, 250))`);
  await evaluate(client, popupPolishScript(theme, { revealHeader, revealRows }));
  if (prepare) await evaluate(client, prepare);
  await evaluate(client, `new Promise(resolve => setTimeout(resolve, 80))`);
  const screenshotParams = {
    format: 'png',
    fromSurface: true
  };
  if (clip) screenshotParams.clip = clip;
  const shot = await client.send('Page.captureScreenshot', screenshotParams);
  client.close();
  return `data:image/png;base64,${shot.data}`;
}

async function renderGifFromFrames(frameDir, outPath) {
  await new Promise((resolve, reject) => {
    const inputPattern = path.join(frameDir, 'frame-%04d.png');
    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-framerate', '8',
      '-i', inputPattern,
      '-vf', 'fps=8,scale=360:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3',
      outPath
    ], {
      stdio: ['ignore', 'ignore', 'pipe'],
      windowsHide: true
    });
    let stderr = '';
    ffmpeg.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });
    ffmpeg.on('error', reject);
    ffmpeg.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg failed with code ${code}: ${stderr}`));
    });
  });
}

async function captureQuickAddDemoGif(port, outPath) {
  const frameDir = path.join(tmpdir(), `sisyphus-quick-add-demo-frames-${process.pid}`);
  rmSync(frameDir, { recursive: true, force: true });
  mkdirSync(frameDir, { recursive: true });

  const client = await openPage(port);
  let frame = 0;
  try {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 360,
      height: 600,
      deviceScaleFactor: 1,
      mobile: false
    });
    await client.send('Page.addScriptToEvaluateOnNewDocument', {
      source: chromeStorageMockScript({
        ...storage,
        todos: [],
        reminderHistory: [],
        reminderTime: '20:00',
        todoViewMode: 'all'
      })
    });
    await navigate(client, popupUrl);
    await evaluate(client, `new Promise(resolve => setTimeout(resolve, 250))`);
    await evaluate(client, popupPolishScript('light', { revealHeader: false, revealRows: false }));

    frame = await writeFrame(client, frameDir, frame, 7);

    await evaluate(client, `
      (() => {
        const style = document.createElement('style');
        style.textContent = '.header-actions { opacity: 1 !important; pointer-events: auto !important; }';
        document.head.appendChild(style);
        document.getElementById('addBtn').click();
        const extra = document.querySelector('#addTodoForm .extra-fields');
        if (extra) extra.classList.add('show');
        document.getElementById('todoInput').focus();
      })();
    `);
    frame = await writeFrame(client, frameDir, frame, 6);

    const quickText = currentData.quickText;
    for (let i = 1; i <= quickText.length; i++) {
      await evaluate(client, `
        (() => {
          document.getElementById('todoInput').value = ${JSON.stringify(quickText.slice(0, i))};
        })();
      `);
      frame = await writeFrame(client, frameDir, frame, i === quickText.length ? 7 : 2);
    }

    await evaluate(client, `
      (() => {
        addTodo();
      })();
    `);
    await evaluate(client, `new Promise(resolve => setTimeout(resolve, 120))`);
    frame = await writeFrame(client, frameDir, frame, 10);

    await evaluate(client, `
      (() => {
        if (todos[0]) {
          showEditForm(todos[0]);
          const extra = document.querySelector('#editTodoForm .extra-fields');
          if (extra) extra.classList.add('show');
        }
      })();
    `);
    await evaluate(client, `new Promise(resolve => setTimeout(resolve, 160))`);
    frame = await writeFrame(client, frameDir, frame, 14);
  } finally {
    client.close();
  }

  await renderGifFromFrames(frameDir, outPath);
  rmSync(frameDir, { recursive: true, force: true });
}

async function captureReminderDemoGif(port, outPath) {
  const frameDir = path.join(tmpdir(), `sisyphus-reminder-demo-frames-${process.pid}`);
  rmSync(frameDir, { recursive: true, force: true });
  mkdirSync(frameDir, { recursive: true });

  const client = await openPage(port);
  let frame = 0;
  try {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 360,
      height: 600,
      deviceScaleFactor: 1,
      mobile: false
    });
    await client.send('Page.addScriptToEvaluateOnNewDocument', {
      source: chromeStorageMockScript({
        ...storage,
        reminderTime: '20:00',
        snoozeMinutes: 10
      })
    });
    await navigate(client, popupUrl);
    await evaluate(client, `new Promise(resolve => setTimeout(resolve, 250))`);
    await evaluate(client, popupPolishScript('light', { revealHeader: false, revealRows: false }));

    frame = await writeFrame(client, frameDir, frame, 7);

    await evaluate(client, `
      (() => {
        const style = document.createElement('style');
        style.textContent = '.header-actions { opacity: 1 !important; pointer-events: auto !important; }';
        document.head.appendChild(style);
      })();
    `);
    frame = await writeFrame(client, frameDir, frame, 6);

    await evaluate(client, `
      (() => {
        document.getElementById('reminderBtn').click();
        document.getElementById('reminderToggle').checked = true;
        const input = document.getElementById('reminderTimeInput');
        input.value = '';
        input.focus();
        document.getElementById('snoozeMinutes').value = '10';
      })();
    `);
    frame = await writeFrame(client, frameDir, frame, 7);

    for (const value of ['2', '20', '200', '2000']) {
      await evaluate(client, `
        (() => {
          const input = document.getElementById('reminderTimeInput');
          input.value = ${JSON.stringify(value)};
          input.dispatchEvent(new Event('input', { bubbles: true }));
        })();
      `);
      frame = await writeFrame(client, frameDir, frame, value === '2000' ? 10 : 2);
    }

    await evaluate(client, `
      (() => {
        const input = document.getElementById('reminderTimeInput');
        input.dispatchEvent(new Event('blur', { bubbles: true }));
      })();
    `);
    await evaluate(client, `new Promise(resolve => setTimeout(resolve, 100))`);
    frame = await writeFrame(client, frameDir, frame, 10);
  } finally {
    client.close();
  }

  await renderGifFromFrames(frameDir, outPath);
  rmSync(frameDir, { recursive: true, force: true });
}

function composeHtml({ title, lead, chips, popupImage, mode = 'main', notification = false }) {
  const chipHtml = chips.map(chip => `<span>${chip}</span>`).join('');
  return `<!doctype html>
<html lang="${currentLangTag}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    width: 1280px;
    height: 820px;
    overflow: hidden;
    background: #edf1ec;
    color: #1d2935;
    font-family: ${FONT_STACK};
  }
  .stage {
    position: relative;
    width: 1280px;
    height: 820px;
    padding: 42px;
  }
  .browser {
    position: relative;
    height: 736px;
    border: 1px solid #d6ddd7;
    border-radius: 8px;
    background: #fbfcf9;
    overflow: hidden;
    box-shadow: 0 24px 70px rgba(35, 45, 52, 0.18);
  }
  .topbar {
    height: 76px;
    border-bottom: 1px solid #dce2dd;
    background: #f6f8f5;
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 0 22px;
  }
  .traffic {
    display: flex;
    gap: 8px;
    flex: 0 0 auto;
  }
  .traffic i {
    display: block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  .traffic i:nth-child(1) { background: #e86d5b; }
  .traffic i:nth-child(2) { background: #e4b953; }
  .traffic i:nth-child(3) { background: #65b37a; }
  .tab {
    height: 40px;
    min-width: 250px;
    padding: 0 18px;
    border: 1px solid #dbe1dc;
    border-bottom-color: #cdd6cf;
    border-radius: 8px 8px 4px 4px;
    background: #ffffff;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 650;
    color: #2d3d4c;
  }
  .tab img {
    width: 20px;
    height: 20px;
  }
  .address {
    height: 40px;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    padding: 0 18px;
    border: 1px solid #dbe1dc;
    border-radius: 8px;
    background: #ffffff;
    color: #7d8892;
    font-size: 14px;
  }
  .extensions {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #6c7780;
  }
  .ext-icon {
    width: 34px;
    height: 34px;
    padding: 5px;
    border: 1px solid #cfd8d1;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 5px 16px rgba(35, 45, 52, 0.12);
  }
  .content {
    position: relative;
    height: 660px;
    padding: 58px 56px;
    background: #fbfcf9;
  }
  .copy {
    width: 470px;
    position: relative;
    z-index: 2;
  }
  .eyebrow {
    display: inline-flex;
    align-items: center;
    height: 26px;
    padding: 0 10px;
    border: 1px solid #cdd8d0;
    border-radius: 999px;
    background: #ffffff;
    color: #596a5f;
    font-size: 12px;
    font-weight: 750;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  h1 {
    margin: 24px 0 18px;
    font-size: 54px;
    line-height: 0.98;
    letter-spacing: 0;
    font-weight: 800;
    color: #22313f;
  }
  p {
    margin: 0;
    max-width: 410px;
    color: #53606a;
    font-size: 18px;
    line-height: 1.65;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 28px;
  }
  .chips span {
    padding: 8px 12px;
    border-radius: 999px;
    background: #25384a;
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
  }
  .chips span:nth-child(2) { background: #3f7f64; }
  .chips span:nth-child(3) { background: #b25a3f; }
  .popup-wrap {
    position: absolute;
    top: 44px;
    right: ${notification ? '650px' : '86px'};
    width: 360px;
    height: 600px;
    border-radius: 8px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 28px 80px rgba(30, 42, 52, 0.28);
    z-index: 4;
  }
  .popup-wrap::before {
    content: "";
    position: absolute;
    top: -14px;
    right: 40px;
    width: 24px;
    height: 24px;
    background: inherit;
    transform: rotate(45deg);
    border-left: 1px solid rgba(0,0,0,0.05);
    border-top: 1px solid rgba(0,0,0,0.05);
    z-index: -1;
  }
  .popup-wrap img {
    width: 360px;
    height: 600px;
    display: block;
  }
  .callout {
    position: absolute;
    right: 84px;
    bottom: 54px;
    width: 354px;
    padding: 18px 20px;
    border: 1px solid #d6ded8;
    border-radius: 8px;
    background: rgba(255,255,255,0.94);
    color: #3c4b58;
    font-size: 15px;
    line-height: 1.6;
    box-shadow: 0 12px 35px rgba(35,45,52,0.12);
  }
  .callout strong {
    display: block;
    margin-bottom: 6px;
    color: #25384a;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .notification {
    position: absolute;
    right: 84px;
    top: 178px;
    width: 430px;
    border: 1px solid #d5ddd7;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 28px 80px rgba(30,42,52,0.24);
    overflow: hidden;
    z-index: 5;
  }
  .notification-head {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 54px;
    padding: 0 18px;
    border-bottom: 1px solid #edf0ed;
    color: #69747c;
    font-size: 13px;
    font-weight: 700;
  }
  .notification-head img {
    width: 24px;
    height: 24px;
  }
  .notification-body {
    padding: 22px 22px 18px;
  }
  .notification-title {
    margin: 0 0 8px;
    font-size: 28px;
    line-height: 1.15;
    color: #22313f;
    font-weight: 800;
  }
  .notification-body p {
    margin: 0;
    max-width: none;
    font-size: 15px;
    line-height: 1.55;
    color: #59656f;
  }
  .notification-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-top: 1px solid #edf0ed;
  }
  .notification-actions button {
    height: 48px;
    border: 0;
    background: #ffffff;
    color: #263746;
    font-size: 15px;
    font-weight: 800;
  }
  .notification-actions button + button {
    border-left: 1px solid #edf0ed;
    color: #3f7f64;
  }
  .mode-compose .content {
    background: #1f2328;
  }
  .mode-compose h1,
  .mode-compose .copy {
    color: #f5f1e8;
  }
  .mode-compose p { color: #c7cbd0; }
  .mode-compose .eyebrow {
    background: #2b3036;
    color: #e8e2d8;
    border-color: #404751;
  }
  .mode-compose .callout {
    background: rgba(43, 48, 54, 0.95);
    border-color: #454c56;
    color: #d7dce1;
  }
  .mode-compose .callout strong { color: #f5f1e8; }
  .with-notification .copy {
    display: none;
  }
  .with-notification .popup-wrap {
    left: 88px;
    right: auto;
    top: 44px;
  }
  .with-notification .notification {
    right: 84px;
    top: 178px;
  }
</style>
</head>
<body>
  <div class="stage">
    <div class="browser mode-${mode} ${notification ? 'with-notification' : ''}">
      <div class="topbar">
        <div class="traffic"><i></i><i></i><i></i></div>
        <div class="tab"><img src="${iconData}" alt="">Sisyphus</div>
        <div class="address">chrome-extension://sisyphus/popup.html</div>
        <div class="extensions">
          <span>⋮</span>
          <img class="ext-icon" src="${iconData}" alt="">
        </div>
      </div>
      <div class="content">
        <div class="copy">
          <div class="eyebrow">Chrome Popup</div>
          <h1>${title}</h1>
          <p>${lead}</p>
          <div class="chips">${chipHtml}</div>
        </div>
        <div class="popup-wrap"><img src="${popupImage}" alt="Sisyphus popup"></div>
        ${notification ? `
        <div class="notification">
          <div class="notification-head"><img src="${iconData}" alt="">Sisyphus · Chrome notification</div>
          <div class="notification-body">
            <div class="notification-title">${currentData.mealWord}</div>
            <p>${currentData.notifyBody}</p>
          </div>
          <div class="notification-actions"><button>Snooze</button><button>Done</button></div>
        </div>` : `
        <div class="callout"><strong>Shown in this shot</strong>${mode === 'compose'
          ? currentData.shotCompose.callout
          : currentData.shotMain.callout}</div>`}
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function captureHtml(port, html, outPath, { width = 1280, height = 820 } = {}) {
  const client = await openPage(port);
  await client.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false
  });
  const dataUrl = `data:text/html;base64,${Buffer.from(html, 'utf8').toString('base64')}`;
  await navigate(client, dataUrl);
  await evaluate(client, `document.fonts ? document.fonts.ready : Promise.resolve()`);
  await delay(120);
  const shot = await client.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true
  });
  writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  client.close();
}

async function main() {
  mkdirSync(outputDir, { recursive: true });
  const chromePath = findChrome();
  const port = 9300 + Math.floor(Math.random() * 500);
  const userDataDir = path.join(tmpdir(), `sisyphus-readme-shots-${process.pid}`);
  rmSync(userDataDir, { recursive: true, force: true });
  mkdirSync(userDataDir, { recursive: true });

  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-sync',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ], {
    stdio: ['ignore', 'ignore', 'pipe'],
    windowsHide: true
  });

  chrome.stderr.on('data', () => {});

  try {
    await waitForChrome(port);

    for (const lang of LANGS) {
      currentLang = lang;
      currentData = LOCALE_DATA[lang];
      currentLangTag = currentData.tag;
      storage = buildStorage(currentData);
      outputDir = path.join(baseOutputDir, currentData.dir);
      mkdirSync(outputDir, { recursive: true });
      console.log(`[sisyphus] ${lang} → ${outputDir}`);

      const mainPopup = await capturePopup(port, { theme: 'light' });
      const fullToolbarPopup = await capturePopup(port, {
        theme: 'light',
        revealHeader: true,
        revealRows: true
      });
      const hiddenHeader = await capturePopup(port, {
        theme: 'light',
        clip: { x: 0, y: 0, width: 360, height: 112, scale: 2 }
      });
      const visibleHeader = await capturePopup(port, {
        theme: 'light',
        revealHeader: true,
        clip: { x: 0, y: 0, width: 360, height: 112, scale: 2 }
      });
      const quickAddPopup = await capturePopup(port, {
        theme: 'dark',
        prepare: `
          (async () => {
            document.getElementById('addTodoForm').classList.remove('hidden');
            document.querySelector('#addTodoForm .extra-fields').classList.add('show');
            document.getElementById('todoInput').value = ${JSON.stringify(currentData.quickText)};
            document.getElementById('dueDateDisplay').value = '06/03';
            document.getElementById('todoReminderInput').value = '09:30';
            document.querySelector('#repeatSelect').value = 'daily';
            document.querySelector('#repeatSelect').closest('.custom-select').querySelector('.select-display').textContent = 'Daily';
            document.getElementById('todoNagMinutes').value = '10';
            document.getElementById('todoNagMinutes').closest('.custom-select').querySelector('.select-display').textContent = '10m';
          })();
        `
      });
      const reminderPopup = await capturePopup(port, {
        theme: 'dark',
        revealHeader: true,
        prepare: `
          (async () => {
            document.getElementById('reminderPanel').classList.remove('hidden');
            document.getElementById('reminderToggle').checked = true;
            document.getElementById('reminderTimeInput').value = '09:30';
            document.getElementById('snoozeMinutes').value = '10';
          })();
        `
      });
      writeDataUrlPng(mainPopup, path.join(outputDir, 'sisyphus-clean-main.png'));
      writeDataUrlPng(quickAddPopup, path.join(outputDir, 'sisyphus-clean-quick-add.png'));
      writeDataUrlPng(reminderPopup, path.join(outputDir, 'sisyphus-clean-reminder.png'));

      await captureHtml(port, composeHtml({
        title: currentData.shotMain.title,
        lead: currentData.shotMain.lead,
        chips: CHIPS.main,
        popupImage: fullToolbarPopup,
        mode: 'main'
      }), path.join(outputDir, 'sisyphus-main.png'));

      await captureHtml(port, composeHtml({
        title: currentData.shotCompose.title,
        lead: currentData.shotCompose.lead,
        chips: CHIPS.compose,
        popupImage: quickAddPopup,
        mode: 'compose'
      }), path.join(outputDir, 'sisyphus-compose.png'));

      await captureHtml(port, composeHtml({
        title: currentData.shotNotification.title,
        lead: currentData.shotNotification.lead,
        chips: CHIPS.notification,
        popupImage: mainPopup,
        mode: 'main',
        notification: true
      }), path.join(outputDir, 'sisyphus-notification.png'));

      await captureHtml(port, cleanNotificationHtml(), path.join(outputDir, 'sisyphus-clean-notification.png'), {
        width: 760,
        height: 360
      });
      await captureHtml(port, headerComparisonHtml({
        hiddenHeader,
        visibleHeader
      }), path.join(outputDir, 'sisyphus-clean-header.png'), {
        width: 980,
        height: 330
      });
      await captureQuickAddDemoGif(port, path.join(outputDir, 'sisyphus-quick-add-demo.gif'));
      await captureReminderDemoGif(port, path.join(outputDir, 'sisyphus-reminder-demo.gif'));
    }
  } finally {
    chrome.kill();
    await delay(200);
    rmSync(userDataDir, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
