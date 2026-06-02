const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadBackground({ storage = {}, notifications = {} } = {}) {
  const listeners = {};
  const calls = {
    alarmCreates: [],
    alarmClears: [],
    notificationCreates: [],
    notificationClears: []
  };

  const chrome = {
    runtime: {
      onInstalled: { addListener(fn) { listeners.installed = fn; } },
      onStartup: { addListener(fn) { listeners.startup = fn; } },
      onMessage: { addListener(fn) { listeners.message = fn; } }
    },
    alarms: {
      onAlarm: { addListener(fn) { listeners.alarm = fn; } },
      create(name, opts) {
        calls.alarmCreates.push({ name, opts });
      },
      clear(name, cb) {
        calls.alarmClears.push(name);
        if (cb) cb(true);
      },
      getAll(cb) {
        cb([]);
      }
    },
    notifications: {
      onClicked: { addListener(fn) { listeners.clicked = fn; } },
      onButtonClicked: { addListener(fn) { listeners.buttonClicked = fn; } },
      create(id, opts, cb) {
        calls.notificationCreates.push({ id, opts });
        if (cb) cb(id);
      },
      clear(id, cb) {
        calls.notificationClears.push(id);
        if (cb) cb(true);
      },
      getAll(cb) {
        cb(notifications);
      }
    },
    storage: {
      local: {
        get(keys, cb) {
          if (Array.isArray(keys)) {
            const out = {};
            keys.forEach(key => {
              out[key] = storage[key];
            });
            cb(out);
            return;
          }
          cb({ ...storage });
        },
        set(values, cb) {
          Object.assign(storage, values);
          if (cb) cb();
        }
      }
    }
  };

  const sandbox = { chrome, console, Date };
  const context = vm.createContext(sandbox);
  sandbox.importScripts = (...files) => {
    files.forEach((f) => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), context));
  };
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'background.js'), 'utf8'), context);

  return { listeners, calls, storage };
}

test('a todo reminder uses one stable notification id', () => {
  const { listeners, calls } = loadBackground({
    storage: {
      reminderEnabled: true,
      todos: [{ id: 'todo-a', text: '起床', completed: false, nagMinutes: 0 }]
    }
  });

  listeners.alarm({ name: 'todo_todo-a' });

  assert.deepEqual(
    calls.notificationCreates.map(call => call.id),
    ['todo_todo-a']
  );
});

test('clicking a todo notification falls back to snooze when buttons are hidden', () => {
  const { listeners, calls } = loadBackground({
    storage: {
      snoozeMinutes: 10,
      todos: [{ id: 'todo-a', text: '起床', completed: false }]
    }
  });

  listeners.clicked('todo_todo-a');

  assert.equal(calls.alarmCreates.length, 1);
  assert.equal(calls.alarmCreates[0].name, 'snooze_todo-a');
  assert.equal(calls.notificationClears.at(-1), 'todo_todo-a');
});

test('snoozing stores the next visible reminder time on the todo', () => {
  const { listeners, calls, storage } = loadBackground({
    storage: {
      snoozeMinutes: 10,
      todos: [{ id: 'todo-a', text: '起床', completed: false, reminderTime: '15:04' }]
    }
  });

  listeners.buttonClicked('todo_todo-a', 0);

  assert.equal(storage.todos[0].completed, false);
  assert.equal(storage.todos[0].reminderTime, '15:04');
  assert.equal(storage.todos[0].snoozedUntil, calls.alarmCreates[0].opts.when);
});

test('creating a todo notification clears stale dynamic ids for the same todo', () => {
  const { listeners, calls } = loadBackground({
    storage: {
      reminderEnabled: true,
      snoozeMinutes: 10,
      todos: [{ id: 'todo-a', text: '起床', completed: false, nagMinutes: 0 }]
    },
    notifications: {
      'todo_todo-a_1780302683303': {},
      'todo_other_1780302683303': {}
    }
  });

  listeners.alarm({ name: 'todo_todo-a' });

  assert.ok(calls.notificationClears.includes('todo_todo-a_1780302683303'));
  assert.ok(!calls.notificationClears.includes('todo_other_1780302683303'));
  assert.equal(calls.notificationCreates.at(-1).id, 'todo_todo-a');
});

test('a completed repeat todo is scheduled to come back next period', () => {
  const completedAt = new Date(2020, 0, 1, 21, 0, 0, 0).getTime();
  const { listeners, calls } = loadBackground({
    storage: {
      reminderEnabled: true,
      reminderTime: '20:00',
      todos: [{ id: 'r1', text: '公益签到', completed: true, completedAt, repeat: 'daily' }]
    }
  });

  listeners.installed({ reason: 'install' });

  const resetAlarm = calls.alarmCreates.find((c) => c.name === 'reset_r1');
  assert.ok(resetAlarm, 'reset_r1 alarm should be scheduled');
  assert.equal(resetAlarm.opts.when, new Date(2020, 0, 2, 0, 0, 0, 0).getTime());
  // a completed todo must not get a normal reminder alarm
  assert.ok(!calls.alarmCreates.some((c) => c.name === 'todo_r1'));
});

test('a reset alarm flips a due completed repeat todo back to active', () => {
  const completedAt = new Date(2020, 0, 1, 21, 0, 0, 0).getTime();
  const { listeners, storage } = loadBackground({
    storage: {
      reminderEnabled: true,
      reminderTime: '20:00',
      todos: [{ id: 'r1', text: '公益签到', completed: true, completedAt, repeat: 'daily', dueDate: '2020-01-01' }]
    }
  });

  listeners.alarm({ name: 'reset_r1' });

  assert.equal(storage.todos[0].completed, false);
  assert.equal('completedAt' in storage.todos[0], false);
});

test('overlapping daily and snooze alarms within one minute show one toast', () => {
  const { listeners, calls } = loadBackground({
    storage: {
      reminderEnabled: true,
      snoozeMinutes: 10,
      todos: [{ id: 'todo-a', text: '起床', completed: false, nagMinutes: 0 }]
    }
  });

  listeners.alarm({ name: 'todo_todo-a' });
  listeners.alarm({ name: 'snooze_todo-a' });

  assert.equal(calls.notificationCreates.length, 1);
});
