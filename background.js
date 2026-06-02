// Background service worker: per-todo daily reminders so a missed check-in
// doesn't slip by. Each unfinished todo fires at its own reminderTime, or at the
// global daily time when it has none.

// Share the repeat-cycle date logic with the popup so "明天重置" stays identical
// whether the popup is open or not.
importScripts('i18n.js', 'todo-core.js');
const { nextRepeatResetTime, rolloverRepeatTodos } = globalThis.TodoCore;

chrome.runtime.onInstalled.addListener(reschedule);
chrome.runtime.onStartup.addListener(reschedule);

const recentNotifications = new Map();
const NOTIFICATION_DEDUPE_MS = 60000;

// popup tells us to reschedule whenever todos or reminder settings change.
chrome.runtime.onMessage.addListener((msg) => {
  if (!msg) return;
  if (msg.type === 'updateReminder') {
    reschedule((scheduled) => {
      console.log('[Sisyphus] scheduled reminders', scheduled);
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  const parsed = parseAlarmName(alarm.name);
  if (!parsed) return;

  // Repeat 真循环: a reset alarm flips a completed repeat todo back to active for
  // its next period, then reschedules so the normal reminder fires again.
  if (parsed.kind === 'reset') {
    chrome.storage.local.get(['todos'], (res) => {
      const todos = Array.isArray(res.todos) ? res.todos : [];
      const result = rolloverRepeatTodos(todos, Date.now());
      if (result.changed) {
        chrome.storage.local.set({ todos: result.todos }, () => reschedule());
      } else {
        reschedule();
      }
    });
    return;
  }

  chrome.storage.local.get(['todos', 'reminderEnabled', 'snoozeMinutes'], (res) => {
    if (res.reminderEnabled === false) return;
    const todos = Array.isArray(res.todos) ? res.todos : [];
    const todo = todos.find((t) => String(t.id) === parsed.id);
    if (!todo || todo.completed) return; // gone or already done 鈥?stay quiet

    if (parsed.kind === 'snooze') {
      delete todo.snoozedUntil;
      chrome.storage.local.set({ todos });
    }

    if (!shouldNotifyTodo(todo.id)) return;

    if (parsed.kind === 'todo') chrome.alarms.clear('snooze_' + todo.id);

    const snoozeMinutes = clampMinutes(res.snoozeMinutes, [5, 10, 15, 30], 10);
    notifyTodo(todo, snoozeMinutes);

    const nagMinutes = clampMinutes(todo.nagMinutes, [5, 10, 15, 30], 0);
    if (parsed.kind === 'todo' && nagMinutes > 0) {
      chrome.alarms.create('snooze_' + todo.id, {
        when: Date.now() + nagMinutes * 60 * 1000
      });
    }
  });
});

// If the OS toast hides action buttons, clicking the notification itself is the
// fallback "snooze" action. Closing/dismissing the toast still only dismisses it.
chrome.notifications.onClicked.addListener((id) => {
  const todoId = notificationTodoId(id);
  if (!todoId) {
    chrome.notifications.clear(id);
    return;
  }
  snoozeTodo(todoId, id);
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  const todoId = notificationTodoId(notificationId);
  if (!todoId) {
    chrome.notifications.clear(notificationId);
    return;
  }

  if (buttonIndex === 0) {
    snoozeTodo(todoId, notificationId);
    return;
  }

  if (buttonIndex === 1) {
    completeTodo(todoId, notificationId);
  }
});

function reschedule(done) {
  chrome.storage.local.get(['reminderEnabled', 'reminderTime', 'todos'], (res) => {
    const enabled = res.reminderEnabled !== false; // default ON
    const globalTime = res.reminderTime || '20:00';
    const todos = Array.isArray(res.todos) ? res.todos : [];
    const scheduled = [];

    chrome.alarms.getAll((alarms) => {
      // drop every previous reminder/reset alarm (and the legacy global one)
      alarms.forEach((a) => {
        if (a.name === 'dailyReminder' || a.name.startsWith('todo_') || a.name.startsWith('reset_')) {
          chrome.alarms.clear(a.name);
        }
      });

      // Repeat 真循环: schedule each completed repeat todo to come back at the
      // start of its next period. Runs even when reminders are off, since this is
      // about the todo reappearing, not about notifying.
      todos.forEach((t) => {
        if (!t.completed) return;
        const when = nextRepeatResetTime(t.completedAt, t.repeat);
        if (when != null) chrome.alarms.create('reset_' + t.id, { when });
      });

      if (!enabled) {
        if (typeof done === 'function') done(scheduled);
        return;
      }

      // one alarm per unfinished todo, at its own time or the global default
      todos
        .filter((t) => !t.completed)
        .forEach((t) => {
          const time = t.reminderTime || globalTime;
          const when = nextOccurrence(time);
          chrome.alarms.create('todo_' + t.id, {
            when,
            periodInMinutes: 1440 // every 24h, keeps the same clock time
          });
          scheduled.push({
            id: t.id,
            text: t.text,
            time,
            whenMs: when,
            when: new Date(when).toLocaleString()
          });
        });
      if (typeof done === 'function') done(scheduled);
    });
  });
}

function notifyTodo(todo, snoozeMinutes) {
  const id = 'todo_' + todo.id;
  // Reminders fire while the popup is closed, so resolve the UI language straight
  // from storage here; buttons stay English (shared technical labels).
  chrome.storage.local.get(['lang'], (res) => {
    if (typeof I18N !== 'undefined' && res && res.lang) I18N.setLocale(res.lang);
    const tr = (key, vars) => (typeof I18N !== 'undefined' ? I18N.t(key, vars) : null);
    const options = {
      type: 'basic',
      iconUrl: 'icon.png',
      title: todo.text || tr('notify.titleFallback') || 'Reminder',
      message: tr('notify.clickToSnooze', { min: snoozeMinutes }) || `Click to snooze ${snoozeMinutes} min`,
      priority: 2,
      requireInteraction: true,
      buttons: [
        { title: `${snoozeMinutes} min later` },
        { title: 'Done' }
      ]
    };

    // Stable ids make repeated daily/snooze alarms replace the same toast instead
    // of stacking duplicate Sisyphus notifications.
    clearOldTodoNotifications(todo.id, id, () => {
      chrome.notifications.create(id, options);
    });
  });
}

function shouldNotifyTodo(todoId) {
  const key = String(todoId);
  const now = Date.now();
  const last = recentNotifications.get(key) || 0;
  if (now - last < NOTIFICATION_DEDUPE_MS) return false;
  recentNotifications.set(key, now);
  return true;
}

function clearOldTodoNotifications(todoId, stableId, done) {
  chrome.notifications.getAll((items) => {
    const stalePrefix = stableId + '_';
    const ids = Object.keys(items || {}).filter(id => id === stableId || id.startsWith(stalePrefix));
    if (ids.length === 0) {
      done();
      return;
    }

    let left = ids.length;
    ids.forEach((id) => {
      chrome.notifications.clear(id, () => {
        left -= 1;
        if (left === 0) done();
      });
    });
  });
}

function parseAlarmName(name) {
  if (name.startsWith('todo_')) return { kind: 'todo', id: name.slice('todo_'.length) };
  if (name.startsWith('snooze_')) return { kind: 'snooze', id: name.slice('snooze_'.length) };
  if (name.startsWith('reset_')) return { kind: 'reset', id: name.slice('reset_'.length) };
  return null;
}

function notificationTodoId(notificationId) {
  if (!notificationId.startsWith('todo_')) return null;
  return notificationId.slice('todo_'.length);
}

function clampMinutes(value, allowed, fallback) {
  const n = parseInt(value, 10);
  return allowed.includes(n) ? n : fallback;
}

function snoozeTodo(todoId, notificationId) {
  chrome.storage.local.get(['snoozeMinutes', 'todos'], (res) => {
    const minutes = clampMinutes(res.snoozeMinutes, [5, 10, 15, 30], 10);
    const when = Date.now() + minutes * 60 * 1000;
    chrome.alarms.create('snooze_' + todoId, {
      when
    });
    const todos = Array.isArray(res.todos) ? res.todos : [];
    const todo = todos.find((t) => String(t.id) === String(todoId));
    if (todo) todo.snoozedUntil = when;
    chrome.storage.local.set({ todos }, () => {
      chrome.notifications.clear(notificationId);
    });
  });
}

function completeTodo(todoId, notificationId) {
  chrome.storage.local.get(['todos'], (res) => {
    const todos = Array.isArray(res.todos) ? res.todos : [];
    const todo = todos.find((t) => String(t.id) === String(todoId));
    if (todo) {
      todo.completed = true;
      todo.completedAt = Date.now();
      chrome.storage.local.set({ todos }, () => {
        reschedule();
      });
    }
    chrome.alarms.clear('snooze_' + todoId);
    chrome.notifications.clear(notificationId);
  });
}

function nextOccurrence(hhmm) {
  const [h, m] = (hhmm || '20:00').split(':').map(Number);
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h || 0, m || 0, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime();
}
