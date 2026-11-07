const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');
const { loadBackground } = require('./helpers/background.cjs');

const now = new Date(2026, 5, 1, 12).getTime();
const todo = { id: 'a', text: 'task', completed: false, reminderTime: '09:30' };

test('rescheduling restores a persisted snooze and removes obsolete managed alarms', () => {
  const worker = loadBackground({
    now, storage: { todos: [{ ...todo, snoozedUntil: now + 600000 }] },
    alarms: [{ name: 'snooze_gone' }, { name: 'snooze_a', when: now + 1000 }, { name: 'unrelated' }]
  });
  worker.listeners.startup();
  assert.equal(worker.alarmState.get('snooze_a').when, now + 600000);
  assert.equal(worker.alarmState.has('snooze_gone'), false);
  assert.equal(worker.alarmState.has('unrelated'), true);
});

test('editing away a snooze, completing, or deleting its todo removes its alarm', () => {
  for (const todos of [[todo], [{ ...todo, completed: true }], []]) {
    const worker = loadBackground({ now, storage: { todos }, alarms: [{ name: 'snooze_a', when: now + 600000 }] });
    worker.listeners.message({ type: 'updateReminder' });
    assert.equal(worker.alarmState.has('snooze_a'), false);
  }
});

test('disabling reminders clears snoozes while repeat reset alarms remain active', () => {
  const worker = loadBackground({
    now, storage: { reminderEnabled: false, todos: [{ ...todo, completed: true, repeat: 'daily', completedAt: now }] },
    alarms: [{ name: 'todo_a' }, { name: 'snooze_a' }]
  });
  worker.listeners.startup();
  assert.equal(worker.alarmState.has('snooze_a'), false);
  assert.equal(worker.alarmState.has('todo_a'), false);
  assert.equal(worker.alarmState.has('reset_a'), true);
});

test('a daily alarm cannot interrupt a future snooze', () => {
  const worker = loadBackground({ now, storage: { todos: [{ ...todo, snoozedUntil: now + 600000 }] } });
  worker.fire('todo_a');
  assert.equal(worker.calls.notificationCreates.length, 0);
  assert.equal(worker.storage.todos[0].snoozedUntil, now + 600000);
  assert.equal(worker.alarmState.has('todo_a'), true);
});

test('a snooze missed while Chrome was closed is restored for immediate delivery', () => {
  const worker = loadBackground({ now, storage: { todos: [{ ...todo, snoozedUntil: now - 60000 }] } });
  worker.listeners.startup();
  assert.equal(worker.alarmState.get('snooze_a').when, now);
  worker.fire('snooze_a');
  assert.equal(worker.calls.notificationCreates.length, 1);
  assert.equal('snoozedUntil' in worker.storage.todos[0], false);
});

test('a queued snooze event stays silent after its snooze was cancelled by editing', () => {
  const worker = loadBackground({ now, storage: { todos: [todo] } });
  worker.fire('snooze_a');
  assert.equal(worker.calls.notificationCreates.length, 0);
});

test('nag reminders persist and rearm after multiple intervals', () => {
  const worker = loadBackground({ now, storage: { todos: [{ ...todo, nagMinutes: 5 }] } });
  worker.fire('todo_a');
  for (let interval = 1; interval <= 3; interval++) {
    const next = now + interval * 300000;
    assert.equal(worker.storage.todos[0].snoozedUntil, next);
    assert.equal(worker.alarmState.get('snooze_a').when, next);
    worker.setNow(next);
    worker.fire('snooze_a');
  }
  assert.equal(worker.calls.notificationCreates.length, 4);
});

test('Snooze on a stale completed notification never creates an alarm', () => {
  const worker = loadBackground({ now, storage: { todos: [{ ...todo, completed: true }] } });
  worker.listeners.buttonClicked('todo_a', 0);
  assert.equal(worker.calls.alarmCreates.length, 0);
  assert.equal(worker.calls.writes.length, 0);
  assert.ok(worker.calls.notificationClears.includes('todo_a'));
});

test('notification completion clears persisted snooze state and both reminder alarms', () => {
  const worker = loadBackground({
    now, defer: true, storage: { todos: [{ ...todo, snoozedUntil: now + 600000 }] },
    alarms: [{ name: 'snooze_a' }, { name: 'todo_a' }]
  });
  worker.listeners.buttonClicked('todo_a', 1);
  worker.flush();
  assert.equal(worker.storage.todos[0].completed, true);
  assert.equal('snoozedUntil' in worker.storage.todos[0], false);
  assert.equal(worker.alarmState.has('snooze_a'), false);
  assert.equal(worker.alarmState.has('todo_a'), false);
});

test('one-shot reminders reject impossible or missing dates instead of becoming daily', () => {
  for (const dueDate of ['2099-02-31', '2099-13-01', null]) {
    const worker = loadBackground({ now, storage: { todos: [{ ...todo, oneShotReminder: true, dueDate }] } });
    worker.listeners.startup();
    assert.equal(worker.alarmState.has('todo_a'), false);
  }
});

test('overlapping reschedules finish with the latest settings after delayed clears', () => {
  const worker = loadBackground({
    now, defer: true, storage: { todos: [todo] }, alarms: [{ name: 'todo_a', when: now + 60000 }]
  });
  worker.listeners.startup();
  worker.flush(1); // first run has read its old snapshot; enumeration is pending
  worker.storage.todos = [{ ...todo, reminderTime: '18:45' }];
  worker.listeners.message({ type: 'updateReminder' });
  worker.flush();
  assert.equal(worker.alarmState.get('todo_a')?.when, new Date(2026, 5, 1, 18, 45).getTime());
});

test('daily delivery rearms at the same local time across both DST transitions', () => {
  const result = spawnSync(process.execPath, ['-e', `
    const assert = require('node:assert/strict');
    const { loadBackground } = require(${JSON.stringify(path.resolve(__dirname, 'helpers/background.cjs'))});
    for (const [month, day, hours] of [[2, 7, 23], [9, 31, 25]]) {
      const now = new Date(2026, month, day, 9, 30).getTime();
      const worker = loadBackground({ now, storage: { todos: [{ id: 'a', reminderTime: '09:30' }] } });
      worker.fire('todo_a');
      const next = worker.alarmState.get('todo_a');
      assert.ok(next, 'delivery must schedule its successor');
      assert.equal(next.periodInMinutes, undefined);
      assert.equal(next.when - now, hours * 3600000);
      assert.equal(new Date(next.when).getHours(), 9);
      assert.equal(new Date(next.when).getMinutes(), 30);
    }
  `], { env: { ...process.env, TZ: 'America/Los_Angeles' }, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || String(result.error));
});
