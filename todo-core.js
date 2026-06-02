(function () {
const DEFAULT_SNOOZE_MINUTES = 10;
const SNOOZE_OPTIONS = [5, 10, 15, 30];
const NAG_OPTIONS = [0, 5, 10, 15, 30];
const DEFAULT_APP_TITLE = 'Sisyphus';
const DEFAULT_QUOTE_TEXT = 'One must imagine Sisyphus happy.';
const DEFAULT_QUOTE_AUTHOR = 'Albert Camus';

function parseReminderInput(str) {
  const raw = (str || '').trim();
  let m = raw.match(/^(\d{2})(\d{2})$/);
  if (!m) {
    m = raw.match(/^(\d{1,2})\s*[:：]\s*(\d{1,2})$/);
  }
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function normalizeDate(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function dateToInputValue(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateDisplay(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}`;
}

function buildDateFromMonthDay(month, day, now = new Date()) {
  const y = now.getFullYear();
  const date = new Date(y, month - 1, day);
  if (date.getFullYear() !== y || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

function nextWeekdayDate(dayIndex, now = new Date()) {
  const date = normalizeDate(now);
  const delta = (dayIndex - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + delta);
  return dateToInputValue(date);
}

function consumeQuickToken(token, result, now, textTokens) {
  if (!token) return;

  const clockToken = token.match(/^(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (clockToken && (!result.dueDate || !result.reminderTime)) {
    const month = parseInt(clockToken[1], 10);
    const day = parseInt(clockToken[2], 10);
    const hour = parseInt(clockToken[3], 10);
    const minute = parseInt(clockToken[4], 10);
    const date = buildDateFromMonthDay(month, day, now);
    const time = parseReminderInput(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);

    if (date && time) {
      if (!result.dueDate) result.dueDate = dateToInputValue(date);
      if (!result.reminderTime) result.reminderTime = time;
      result.consumedAny = true;
      return;
    }
  }

  const datePrefixes = [
    ['星期天', 0],
    ['星期日', 0],
    ['星期一', 1],
    ['星期二', 2],
    ['星期三', 3],
    ['星期四', 4],
    ['星期五', 5],
    ['星期六', 6],
    ['tomorrow', 'tomorrow'],
    ['today', 'today'],
    ['后天', 'dayAfterTomorrow'],
    ['明天', 'tomorrow'],
    ['今天', 'today'],
    ['周天', 0],
    ['周日', 0],
    ['周一', 1],
    ['周二', 2],
    ['周三', 3],
    ['周四', 4],
    ['周五', 5],
    ['周六', 6]
  ];

  if (!result.dueDate) {
    const lowered = token.toLowerCase();
    const datePrefix = datePrefixes.find(([label]) => lowered.startsWith(label.toLowerCase()));
    if (datePrefix) {
      const [label, value] = datePrefix;
      if (value === 'today') {
        result.dueDate = dateToInputValue(normalizeDate(now));
      } else if (value === 'tomorrow') {
        const date = normalizeDate(now);
        date.setDate(date.getDate() + 1);
        result.dueDate = dateToInputValue(date);
      } else if (value === 'dayAfterTomorrow') {
        const date = normalizeDate(now);
        date.setDate(date.getDate() + 2);
        result.dueDate = dateToInputValue(date);
      } else {
        result.dueDate = nextWeekdayDate(value, now);
      }
      result.consumedAny = true;
      consumeQuickToken(token.slice(label.length), result, now, textTokens);
      return;
    }
  }

  if (result.repeat === 'none') {
    const repeatPrefixes = [
      ['monthly', 'monthly'],
      ['weekly', 'weekly'],
      ['daily', 'daily'],
      ['每月', 'monthly'],
      ['每周', 'weekly'],
      ['每天', 'daily']
    ];
    const lowered = token.toLowerCase();
    const repeatPrefix = repeatPrefixes.find(([label]) => lowered.startsWith(label.toLowerCase()));
    if (repeatPrefix) {
      const [label, value] = repeatPrefix;
      result.repeat = value;
      result.consumedAny = true;
      consumeQuickToken(token.slice(label.length), result, now, textTokens);
      return;
    }
  }

  if (!result.reminderTime) {
    const exactTime = parseReminderInput(token);
    if (exactTime) {
      result.reminderTime = exactTime;
      result.consumedAny = true;
      return;
    }

    const timePrefix = token.match(/^(\d{4})(.+)$/);
    if (timePrefix) {
      const parsedTime = parseReminderInput(timePrefix[1]);
      if (parsedTime) {
        result.reminderTime = parsedTime;
        result.consumedAny = true;
        consumeQuickToken(timePrefix[2], result, now, textTokens);
        return;
      }
    }
  }

  textTokens.push(token);
}

function parseQuickAdd(input, now = new Date()) {
  const tokens = (input || '').trim().split(/\s+/).filter(Boolean);
  const result = {
    text: (input || '').trim(),
    dueDate: null,
    repeat: 'none',
    reminderTime: null,
    consumedAny: false
  };
  const textTokens = [];

  tokens.forEach((token) => {
    consumeQuickToken(token, result, now, textTokens);
  });

  if (result.consumedAny && textTokens.length > 0) {
    result.text = textTokens.join(' ');
  }

  delete result.consumedAny;
  return result;
}

function isTodoOverdue(todo, now = new Date()) {
  if (!todo || todo.completed || !todo.dueDate) return false;
  const due = normalizeDate(new Date(todo.dueDate));
  return due.getTime() < normalizeDate(now).getTime();
}

function sortTodosForDisplay(todos, now = new Date()) {
  return [...todos].sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
    const aOverdue = isTodoOverdue(a, now);
    const bOverdue = isTodoOverdue(b, now);
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    const aCreated = Date.parse(a.createdAt || '') || 0;
    const bCreated = Date.parse(b.createdAt || '') || 0;
    if (aCreated !== bCreated) return bCreated - aCreated;
    return 0;
  });
}

function isRepeatTodo(todo) {
  return !!(todo && todo.repeat && todo.repeat !== 'none');
}

function shouldAutoDeleteCompletedTodo(todo) {
  return !!(todo && todo.completed && !isRepeatTodo(todo));
}

function isExpiredCompletedTodo(todo, now, fadeDelay) {
  const completedAt = Number(todo && todo.completedAt);
  return !!(
    todo &&
    todo.completed &&
    completedAt &&
    Number.isFinite(fadeDelay) &&
    now - completedAt >= fadeDelay
  );
}

function startOfDayTs(ts) {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

// Advance a YYYY-MM-DD string by `times` repeat periods. 'none'/unknown is a no-op.
function advanceRepeatDate(dateString, repeat, times = 1) {
  const base = new Date(dateString);
  if (Number.isNaN(base.getTime())) return dateString;
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const steps = Math.max(0, Number(times) || 0);
  for (let i = 0; i < steps; i++) {
    if (repeat === 'daily') d.setDate(d.getDate() + 1);
    else if (repeat === 'weekly') d.setDate(d.getDate() + 7);
    else if (repeat === 'monthly') d.setMonth(d.getMonth() + 1);
    else return dateString;
  }
  return dateToInputValue(d);
}

// Timestamp at which a completed repeat todo flips back to active: the start of
// the day one period after it was completed. null for non-repeat / missing data.
function nextRepeatResetTime(completedAt, repeat) {
  const ts = Number(completedAt);
  if (!Number.isFinite(ts) || !['daily', 'weekly', 'monthly'].includes(repeat)) return null;
  const d = new Date(startOfDayTs(ts));
  if (repeat === 'daily') d.setDate(d.getDate() + 1);
  else if (repeat === 'weekly') d.setDate(d.getDate() + 7);
  else if (repeat === 'monthly') d.setMonth(d.getMonth() + 1);
  return d.getTime();
}

// Bump a (possibly stale) dueDate forward by whole periods until it is today or later.
function advanceDueDateToFuture(dateString, repeat, nowTs) {
  const todayStart = startOfDayTs(nowTs);
  let out = dateString;
  for (let guard = 0; guard < 1000; guard++) {
    const cur = new Date(out);
    if (Number.isNaN(cur.getTime())) return dateString;
    if (startOfDayTs(cur.getTime()) >= todayStart) break;
    const next = advanceRepeatDate(out, repeat, 1);
    if (next === out) break; // 'none'/unknown: avoid an infinite loop
    out = next;
  }
  return out;
}

// The missing "明天重置": any completed repeat todo whose next period has arrived
// is flipped back to active (completed=false, timers cleared) and its dueDate is
// pushed to the upcoming period. Normal (non-repeat) completed todos are untouched.
function rolloverRepeatTodos(todos, now = Date.now()) {
  const nowTs = now instanceof Date ? now.getTime() : (Number(now) || Date.now());
  const list = Array.isArray(todos) ? todos : [];
  let changed = false;
  const next = list.map((todo) => {
    if (!todo || !todo.completed || !isRepeatTodo(todo)) return todo;
    const resetAt = nextRepeatResetTime(todo.completedAt, todo.repeat);
    if (resetAt == null || nowTs < resetAt) return todo;
    changed = true;
    const updated = { ...todo, completed: false };
    delete updated.completedAt;
    delete updated.snoozedUntil;
    if (updated.dueDate) {
      updated.dueDate = advanceDueDateToFuture(updated.dueDate, updated.repeat, nowTs);
    }
    return updated;
  });
  return { todos: changed ? next : list, changed };
}

function filterTodosForView(todos, viewMode = 'all', options = {}) {
  const list = Array.isArray(todos) ? todos : [];
  if (viewMode === 'repeat') return list.filter(isRepeatTodo);

  const fadeDelay = Number(options.fadeDelay);
  if (!Number.isFinite(fadeDelay)) return [...list];

  const now = options.now instanceof Date
    ? options.now.getTime()
    : Number(options.now || Date.now());
  return list.filter(todo => !isExpiredCompletedTodo(todo, now, fadeDelay));
}

function mergeMissingTodos(todos, candidates) {
  const list = Array.isArray(todos) ? todos : [];
  const existingTexts = new Set(
    list
      .map(todo => String((todo && todo.text) || '').trim())
      .filter(Boolean)
  );
  const missing = (Array.isArray(candidates) ? candidates : [])
    .filter(todo => {
      const text = String((todo && todo.text) || '').trim();
      return text && !existingTexts.has(text);
    });
  if (missing.length === 0) {
    return { todos: [...list], changed: false };
  }
  return { todos: [...missing, ...list], changed: true };
}

function clampSnoozeMinutes(value) {
  const n = parseInt(value, 10);
  return SNOOZE_OPTIONS.includes(n) ? n : DEFAULT_SNOOZE_MINUTES;
}

function clampNagMinutes(value) {
  const n = parseInt(value, 10);
  return NAG_OPTIONS.includes(n) ? n : 0;
}

function normalizeQuoteSettings(settings) {
  const source = settings || {};
  const text = String(source.text || '').trim();
  const author = String(source.author || '').trim();
  return {
    text: text || DEFAULT_QUOTE_TEXT,
    author: author || DEFAULT_QUOTE_AUTHOR
  };
}

function normalizeAppTitle(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim() || DEFAULT_APP_TITLE;
}

function normalizeTodoViewMode(value) {
  return value === 'repeat' ? 'repeat' : 'all';
}

function escapeHtmlText(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderTextWithSystemNumbers(text) {
  return escapeHtmlText(text).replace(/\d+/g, '<span class="num">$&</span>');
}

  function nextReminderHistory(history, time, limit = 3) {
    const list = Array.isArray(history) ? history : [];
    const normalizedLimit = Math.max(0, Number(limit) || 0);
    if (!time) return list.slice(0, normalizedLimit);
    return [time, ...list.filter((item) => item !== time)].slice(0, normalizedLimit);
  }

  globalThis.TodoCore = {
  DEFAULT_APP_TITLE,
  DEFAULT_QUOTE_AUTHOR,
  DEFAULT_QUOTE_TEXT,
  DEFAULT_SNOOZE_MINUTES,
  advanceRepeatDate,
  clampNagMinutes,
  clampSnoozeMinutes,
  dateToInputValue,
  filterTodosForView,
  formatDateDisplay,
  isTodoOverdue,
  mergeMissingTodos,
  nextRepeatResetTime,
  rolloverRepeatTodos,
    normalizeAppTitle,
    normalizeQuoteSettings,
    normalizeTodoViewMode,
    nextReminderHistory,
  parseQuickAdd,
  parseReminderInput,
  renderTextWithSystemNumbers,
  shouldAutoDeleteCompletedTodo,
  sortTodosForDisplay
};

if (typeof module !== 'undefined') {
  module.exports = globalThis.TodoCore;
}
})();
