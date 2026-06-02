const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');

function loadBackground(storage = {}) {
  const listeners = {};
  const chrome = {
    runtime: {
      onInstalled: { addListener(fn) { listeners.installed = fn; } },
      onStartup: { addListener(fn) { listeners.startup = fn; } },
      onMessage: { addListener(fn) { listeners.message = fn; } }
    },
    alarms: {
      onAlarm: { addListener(fn) { listeners.alarm = fn; } },
      getAll(cb) { cb([]); },
      clear() {},
      create() {}
    },
    notifications: {
      onClicked: { addListener(fn) { listeners.notificationClicked = fn; } },
      onButtonClicked: { addListener(fn) { listeners.notificationButtonClicked = fn; } },
      getAll(cb) { cb({}); },
      clear(id, cb) { if (cb) cb(true); },
      create() {}
    },
    storage: {
      local: {
        get(keys, cb) {
          const result = {};
          keys.forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(storage, key)) result[key] = storage[key];
          });
          cb(result);
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
  return listeners;
}

test('installed event reschedules without treating Chrome details as callback', () => {
  const listeners = loadBackground({
    reminderEnabled: true,
    reminderTime: '20:00',
    todos: [{ id: 'todo-a', text: '干饭', completed: false }]
  });

  assert.doesNotThrow(() => {
    listeners.installed({ reason: 'install' });
  });
});
