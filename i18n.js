// Lightweight runtime i18n for Sisyphus.
// Only strings that are currently Chinese (or carry localized examples) live here.
// Short English technical labels (Repeat / Add / Snooze / Done / None / Daily ...)
// stay as literal text in popup.html and are shared across every language.
//
// Locale is resolved from a stored `lang` override first, then navigator.language,
// then English. There is no visible language switcher; the popup header stays clean.
// Loaded as a classic script before todo-core.js and popup.js, and via importScripts
// in the background service worker.
(function () {
  'use strict';

  const SUPPORTED = ['en', 'zh', 'ja', 'ko'];
  const FALLBACK = 'en';

  const MESSAGES = {
    en: {
      'bell.title': 'Daily reminder',
      'reminder.dailyLabel': 'Daily reminder',
      'reminder.timeLabel': 'Reminder time',
      'reminder.timeAria': 'Reminder time, 24-hour',
      'reminder.hint': 'Unfinished todos pop a reminder at this time.',
      'reminder.defaultHint': 'Default (e.g. 09:30)',
      'input.placeholder': 'What needs to be done?  tomorrow 0930 / daily 2100',
      'notify.titleFallback': 'Reminder',
      'notify.clickToSnooze': 'Click to snooze {min} min'
    },
    zh: {
      'bell.title': '每日提醒',
      'reminder.dailyLabel': '每日提醒',
      'reminder.timeLabel': '提醒时间',
      'reminder.timeAria': '提醒时间，24 小时制',
      'reminder.hint': '没完成的待办会在这个时间弹窗提醒你打卡',
      'reminder.defaultHint': '默认 (如 09:30)',
      'input.placeholder': '要做点什么？  明天0930 / 每天2100',
      'notify.titleFallback': '提醒',
      'notify.clickToSnooze': '点击延后 {min} 分钟'
    },
    ja: {
      'bell.title': '毎日リマインド',
      'reminder.dailyLabel': '毎日リマインド',
      'reminder.timeLabel': 'リマインド時刻',
      'reminder.timeAria': 'リマインド時刻（24時間制）',
      'reminder.hint': '未完了のタスクをこの時刻に通知します',
      'reminder.defaultHint': '既定（例 09:30）',
      'input.placeholder': '何をする？  明日0930 / 毎日2100',
      'notify.titleFallback': 'リマインド',
      'notify.clickToSnooze': 'クリックで{min}分後に再通知'
    },
    ko: {
      'bell.title': '매일 알림',
      'reminder.dailyLabel': '매일 알림',
      'reminder.timeLabel': '알림 시각',
      'reminder.timeAria': '알림 시각, 24시간제',
      'reminder.hint': '미완료 항목을 이 시각에 알려드려요',
      'reminder.defaultHint': '기본 (예: 09:30)',
      'input.placeholder': '무엇을 할까요?  내일0930 / 매일2100',
      'notify.titleFallback': '알림',
      'notify.clickToSnooze': '클릭하면 {min}분 후 다시 알림'
    }
  };

  function normalizeLocale(value) {
    if (!value) return null;
    const v = String(value).toLowerCase();
    if (SUPPORTED.includes(v)) return v;
    if (v.startsWith('zh')) return 'zh';
    if (v.startsWith('ja')) return 'ja';
    if (v.startsWith('ko')) return 'ko';
    if (v.startsWith('en')) return 'en';
    return null;
  }

  function resolveLocale(stored) {
    return normalizeLocale(stored)
      || normalizeLocale(typeof navigator !== 'undefined' && navigator.language)
      || FALLBACK;
  }

  let current = resolveLocale(null);

  function setLocale(value) {
    const next = normalizeLocale(value);
    if (next) current = next;
    return current;
  }

  function getLocale() {
    return current;
  }

  function t(key, vars) {
    const bundle = MESSAGES[current] || MESSAGES[FALLBACK];
    let str = (bundle && bundle[key] != null)
      ? bundle[key]
      : (MESSAGES[FALLBACK][key] != null ? MESSAGES[FALLBACK][key] : key);
    if (vars) {
      str = str.replace(/\{(\w+)\}/g, (whole, name) =>
        Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : whole);
    }
    return str;
  }

  function applyStaticI18n(root) {
    const scope = root || (typeof document !== 'undefined' ? document : null);
    if (!scope || !scope.querySelectorAll) return;
    scope.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    scope.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.title = t(el.getAttribute('data-i18n-title'));
    });
    scope.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
  }

  const I18N = {
    MESSAGES,
    SUPPORTED,
    FALLBACK,
    normalizeLocale,
    resolveLocale,
    setLocale,
    getLocale,
    t,
    applyStaticI18n
  };

  if (typeof globalThis !== 'undefined') globalThis.I18N = I18N;
  if (typeof module !== 'undefined' && module.exports) module.exports = I18N;
})();
