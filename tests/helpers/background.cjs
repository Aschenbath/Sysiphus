const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadBackground({ storage: initialStorage = {}, notifications = {}, alarms = [], defer = false, now = Date.now() } = {}) {
  const storage = structuredClone(initialStorage);
  const alarmState = new Map(alarms.map(alarm => [alarm.name, structuredClone(alarm)]));
  const listeners = {};
  const calls = { alarmCreates: [], alarmClears: [], notificationCreates: [], notificationClears: [], writes: [] };
  const pending = [];
  const later = fn => { if (defer) pending.push(fn); else fn(); };
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
        alarmState.set(name, { name, ...structuredClone(opts) });
      },
      clear(name, cb) {
        calls.alarmClears.push(name);
        later(() => { const cleared = alarmState.delete(name); if (cb) cb(cleared); });
      },
      getAll(cb) {
        const snapshot = structuredClone([...alarmState.values()]);
        later(() => cb(snapshot));
      }
    },
    notifications: {
      onClicked: { addListener(fn) { listeners.clicked = fn; } },
      onButtonClicked: { addListener(fn) { listeners.buttonClicked = fn; } },
      create(id, opts, cb) {
        calls.notificationCreates.push({ id, opts });
        notifications[id] = structuredClone(opts);
        if (cb) later(() => cb(id));
      },
      clear(id, cb) {
        calls.notificationClears.push(id);
        later(() => { delete notifications[id]; if (cb) cb(true); });
      },
      getAll(cb) {
        const snapshot = structuredClone(notifications);
        later(() => cb(snapshot));
      }
    },
    storage: {
      local: {
        get(keys, cb) {
          const snapshot = structuredClone(Object.fromEntries(keys.map(key => [key, storage[key]])));
          later(() => cb(snapshot));
        },
        set(values, cb) {
          const snapshot = structuredClone(values);
          calls.writes.push(snapshot);
          later(() => { Object.assign(storage, snapshot); if (cb) cb(); });
        }
      }
    }
  };
  const sandbox = {
    chrome, console,
    Date: class extends Date {
      constructor(...args) { super(...(args.length ? args : [now])); }
      static now() { return now; }
    }
  };
  const context = vm.createContext(sandbox);
  sandbox.importScripts = (...files) => {
    files.forEach(file => vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../..', file), 'utf8'), context));
  };
  vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../../background.js'), 'utf8'), context);
  return {
    listeners, calls, storage, alarmState,
    setNow(value) { now = value; },
    flush(count = Infinity) {
      let flushed = 0;
      while (pending.length && flushed++ < count) {
        if (flushed > 1000) throw new Error('Background callback loop did not settle');
        pending.shift()();
      }
    },
    fire(name) {
      const alarm = alarmState.get(name);
      if (alarm && !alarm.periodInMinutes) alarmState.delete(name);
      listeners.alarm({ name, scheduledTime: alarm?.when });
    }
  };
}

module.exports = { loadBackground };
