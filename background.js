// Background service worker: per-todo daily reminders so a missed check-in
// doesn't slip by. Each unfinished todo fires at its own reminderTime, or at the
// global daily time when it has none.

// Share the repeat-cycle date logic with the popup so "明天重置" stays identical
// whether the popup is open or not.
importScripts('i18n.js', 'todo-core.js');
const {
  clampNagMinutes, clampSnoozeMinutes, nextRepeatResetTime,
  parseDateInput, parseReminderInput, rolloverRepeatTodos
} = globalThis.TodoCore;

chrome.runtime.onInstalled.addListener(reschedule);
chrome.runtime.onStartup.addListener(reschedule);

const recentNotifications = new Map();
const NOTIFICATION_DEDUPE_MS = 60000;
const rescheduleQueue = [];

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
        chrome.storage.local.set({ todos: result.todos }, () => {
          if (chrome.runtime.lastError) {
            console.warn('[Sisyphus] rollover save failed:', chrome.runtime.lastError.message);
          }
          reschedule();
        });
      } else {
        reschedule();
      }
    });
    return;
  }

  chrome.storage.local.get(['todos', 'reminderEnabled', 'reminderTime', 'snoozeMinutes'], (res) => {
    if (res.reminderEnabled === false) return;
    const todos = Array.isArray(res.todos) ? res.todos : [];
    const todo = todos.find((t) => String(t.id) === parsed.id);
    if (!todo || todo.completed) return; // gone or already done — stay quiet

    // Calendar alarms are one-shot: compute tomorrow in local time so daylight
    // saving changes cannot move the reminder an hour. Dated one-shots have no
    // successor once their due moment has passed.
    if (parsed.kind === 'todo') {
      const next = reminderAlarmOptions(todo, todo.reminderTime || res.reminderTime || '20:00');
      if (next) chrome.alarms.create('todo_' + todo.id, next);
    }

    // A queued daily/old snooze event must not override a newer user snooze.
    if (parsed.kind === 'snooze' && !Number.isFinite(Number(todo.snoozedUntil))) return;
    if (Number(todo.snoozedUntil) > Date.now()) return;
    if (!shouldNotifyTodo(todo.id)) return;

    notifyTodo(todo, clampSnoozeMinutes(res.snoozeMinutes));

    const nagMinutes = clampNagMinutes(todo.nagMinutes);
    const hadSnooze = Object.prototype.hasOwnProperty.call(todo, 'snoozedUntil');
    const when = nagMinutes > 0 ? Date.now() + nagMinutes * 60 * 1000 : null;
    if (when != null) todo.snoozedUntil = when;
    else delete todo.snoozedUntil;
    // Wait for the clear before recreating the same alarm name.
    chrome.alarms.clear('snooze_' + todo.id, () => {
      if (when != null) chrome.alarms.create('snooze_' + todo.id, { when });
    });
    if (hadSnooze || when != null) {
      chrome.storage.local.set({ todos }, () => {
        if (chrome.runtime.lastError) {
          console.warn('[Sisyphus] follow-up save failed:', chrome.runtime.lastError.message);
        }
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
  rescheduleQueue.push(done);
  if (rescheduleQueue.length === 1) runNextReschedule();
}

function runNextReschedule() {
  const done = rescheduleQueue[0];
  const finish = (scheduled) => {
    try {
      if (typeof done === 'function') done(scheduled);
    } finally {
      rescheduleQueue.shift();
      if (rescheduleQueue.length) runNextReschedule();
    }
  };
  chrome.storage.local.get(['reminderEnabled', 'reminderTime', 'todos'], (res) => {
    if (chrome.runtime.lastError) {
      console.warn('[Sisyphus] schedule read failed:', chrome.runtime.lastError.message);
      finish([]);
      return;
    }
    const enabled = res.reminderEnabled !== false; // default ON
    const globalTime = res.reminderTime || '20:00';
    const todos = Array.isArray(res.todos) ? res.todos : [];
    const scheduled = [];

    chrome.alarms.getAll((alarms) => {
      if (chrome.runtime.lastError) {
        console.warn('[Sisyphus] alarm read failed:', chrome.runtime.lastError.message);
        finish([]);
        return;
      }
      // Rebuild all managed alarms from persisted state, including snoozes.
      // Runs are serialized, and every clear must finish before replacement.
      const managed = alarms.filter(a => a.name === 'dailyReminder' || parseAlarmName(a.name));
      let remaining = managed.length;
      if (!remaining) buildSchedule();
      managed.forEach(a => chrome.alarms.clear(a.name, () => {
        if (--remaining === 0) buildSchedule();
      }));

      function buildSchedule() {
        // Repeat 真循环: schedule each completed repeat todo to come back at the
        // start of its next period. Runs even when reminders are off, since this is
        // about the todo reappearing, not about notifying.
        todos.forEach((t) => {
          if (!t.completed) return;
          const when = nextRepeatResetTime(t.completedAt, t.repeat);
          if (when != null) chrome.alarms.create('reset_' + t.id, { when });
        });

        if (!enabled) {
          finish(scheduled);
          return;
        }

        // one alarm per unfinished todo, at its own time or the global default
        todos
          .filter((t) => !t.completed)
          .forEach((t) => {
            const snoozedUntil = Number(t.snoozedUntil);
            if (Number.isFinite(snoozedUntil) && snoozedUntil > 0) {
              // A persisted snooze missed while Chrome was closed is still due.
              chrome.alarms.create('snooze_' + t.id, { when: Math.max(Date.now(), snoozedUntil) });
            }
            const time = t.reminderTime || globalTime;
            const alarmOptions = reminderAlarmOptions(t, time);
            if (!alarmOptions) return;
            chrome.alarms.create('todo_' + t.id, alarmOptions);
            scheduled.push({
              id: t.id,
              text: t.text,
              time,
              whenMs: alarmOptions.when,
              when: new Date(alarmOptions.when).toLocaleString()
            });
          });
        finish(scheduled);
      }
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

function snoozeTodo(todoId, notificationId) {
  chrome.storage.local.get(['snoozeMinutes', 'todos', 'reminderEnabled'], (res) => {
    const todos = Array.isArray(res.todos) ? res.todos : [];
    const todo = todos.find((t) => String(t.id) === String(todoId));
    // Deleted meanwhile: writing the whole (possibly stale) array back would
    // widen the lost-update window for zero benefit, and a snooze alarm for a
    // missing todo would fire into silence anyway.
    if (!todo || todo.completed || res.reminderEnabled === false) {
      chrome.notifications.clear(notificationId);
      return;
    }
    const minutes = clampSnoozeMinutes(res.snoozeMinutes);
    const when = Date.now() + minutes * 60 * 1000;
    todo.snoozedUntil = when;
    chrome.storage.local.set({ todos }, () => {
      if (chrome.runtime.lastError) {
        console.warn('[Sisyphus] snooze save failed:', chrome.runtime.lastError.message);
        return;
      }
      chrome.alarms.create('snooze_' + todoId, { when });
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
      delete todo.snoozedUntil;
      chrome.storage.local.set({ todos }, () => {
        if (chrome.runtime.lastError) {
          console.warn('[Sisyphus] complete save failed:', chrome.runtime.lastError.message);
        }
        reschedule();
      });
    }
    chrome.alarms.clear('snooze_' + todoId);
    chrome.notifications.clear(notificationId);
  });
}

function reminderAlarmOptions(todo, hhmm) {
  // A dated one-shot either fires once at its due moment or not at all. Without
  // this explicit branch an EXPIRED one-shot (dueDate in the past) would fall
  // through to the daily branch and nag every day forever.
  if (todo && todo.oneShotReminder) {
    const oneShotWhen = oneShotReminderTime(todo, hhmm);
    return oneShotWhen != null ? { when: oneShotWhen } : null;
  }
  return { when: nextOccurrence(hhmm) };
}

function oneShotReminderTime(todo, hhmm) {
  if (!todo || !todo.oneShotReminder || !todo.dueDate) return null;
  const date = parseDateInput(todo.dueDate);
  const time = parseTimeParts(hhmm);
  if (!date) return null;
  const when = date.setHours(time.h, time.m, 0, 0);
  if (!Number.isFinite(when) || when <= Date.now()) return null;
  return when;
}

function parseTimeParts(hhmm) {
  const normalized = parseReminderInput(String(hhmm || '')) || '20:00';
  const [h, m] = normalized.split(':').map(Number);
  return { h, m };
}

function nextOccurrence(hhmm) {
  const { h, m } = parseTimeParts(hhmm);
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime();
}
