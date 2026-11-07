const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the real popup with storage snapshots, controllable timers, and only
// the DOM surface used by its lifecycle. Browser layout is checked separately.
function loadPopup(initialStorage = {}, now = new Date(2026, 5, 1, 12).getTime()) {
  const storage = structuredClone({
    examImport_2026_07_google_tasks_20260629: true,
    examTitleMigration_20260629_subject_dates: true,
    ...initialStorage
  });
  const io = [];
  const timers = new Map();
  const writes = [];
  const changes = [];
  let nextTimer = 0;
  let rows = [];
  let document;

  class Element {
    constructor(id = '', classes = '') {
      this.id = id;
      this.value = '';
      this.dataset = {};
      this.listeners = {};
      this.isConnected = true;
      const names = new Set(classes.split(/\s+/).filter(Boolean));
      this.classList = {
        contains: name => names.has(name),
        add: name => names.add(name),
        remove: name => names.delete(name),
        toggle(name, force = !names.has(name)) {
          if (force) names.add(name); else names.delete(name);
        }
      };
    }
    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
    setAttribute() {}
    removeAttribute() {}
    before() {}
    after(el) { el.isConnected = true; }
    focus() { document.activeElement = this; }
    querySelector() { return this.extra ||= new Element(); }
    closest(selector) { return selector === '.custom-select' ? this.wrapper : null; }
    remove() { this.isConnected = false; rows = rows.filter(row => row !== this); }
    set innerHTML(value) {
      this.html = value;
      if (this.id !== 'todoList') return;
      rows.forEach(row => { row.isConnected = false; });
      rows = [...value.matchAll(/<div class="todo-item ([^"]*)" data-id="([^"]*)">/g)].map(match => {
        const row = new Element('', `todo-item ${match[1]}`);
        row.dataset.id = match[2];
        return row;
      });
    }
    get innerHTML() { return this.html || ''; }
  }

  const html = fs.readFileSync(path.resolve(__dirname, '../../popup.html'), 'utf8');
  const nodes = new Map([...html.matchAll(/<[\w]+\b[^>]*\bid="([^"]+)"[^>]*>/g)].map(match =>
    [match[1], new Element(match[1], match[0].match(/class="([^"]*)"/)?.[1])]
  ));
  for (const [id, values] of [
    ['repeatSelect', ['none', 'daily', 'weekly', 'monthly']],
    ['editRepeatSelect', ['none', 'daily', 'weekly', 'monthly']],
    ['todoNagMinutes', ['0', '5', '10', '15', '30']],
    ['editTodoNagMinutes', ['0', '5', '10', '15', '30']]
  ]) {
    const node = nodes.get(id);
    node.value = values[0];
    node.options = values.map(value => ({ value, textContent: value }));
    node.wrapper = new Element();
  }
  document = {
    documentElement: { dataset: {} },
    getElementById: id => nodes.get(id),
    createComment: () => new Element(),
    createElement: () => new Element(),
    addEventListener() {},
    querySelector(selector) {
      if (selector.startsWith('.todo-item[data-id=')) {
        return rows.find(row => row.dataset.id === selector.match(/data-id="(.*)"/)[1]) || null;
      }
      if (selector.includes(' .extra-fields')) return nodes.get(selector.split(' ')[0].slice(1)).querySelector();
      return nodes.get(selector.slice(1));
    },
    querySelectorAll(selector) {
      if (selector === '.todo-item') return rows;
      if (selector === '.todo-item.editing') return rows.filter(row => row.classList.contains('editing'));
      return [];
    }
  };
  const sandbox = {
    document, console,
    Date: class extends Date {
      constructor(...args) { super(...(args.length ? args : [now])); }
      static now() { return now; }
    },
    setInterval() {},
    setTimeout(fn, ms = 0) { const id = ++nextTimer; timers.set(id, { fn, at: now + ms }); return id; },
    clearTimeout(id) { timers.delete(id); },
    chrome: {
      runtime: { sendMessage() {} },
      storage: {
        onChanged: { addListener(fn) { changes.push(fn); } },
        local: {
          get(keys, cb) {
            const snapshot = structuredClone(Object.fromEntries(keys.map(key => [key, storage[key]])));
            io.push(() => cb(snapshot));
          },
          set(values, cb) {
            const snapshot = structuredClone(values);
            writes.push(snapshot);
            const updates = Object.fromEntries(Object.keys(snapshot).map(key =>
              [key, { oldValue: storage[key], newValue: snapshot[key] }]
            ));
            Object.assign(storage, snapshot);
            io.push(() => {
              changes.forEach(fn => fn(structuredClone(updates), 'local'));
              if (cb) cb();
            });
          }
        }
      }
    }
  };
  const context = vm.createContext(sandbox);
  for (const file of ['todo-core.js', 'popup.js']) {
    vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../..', file), 'utf8'), context);
  }
  const flush = () => { while (io.length) io.shift()(); };
  flush();
  return {
    storage, writes, nodes,
    evaluate: expression => vm.runInContext(expression, context),
    flush,
    externalTodos(todos) {
      storage.todos = structuredClone(todos);
      changes.forEach(fn => fn({ todos: { newValue: structuredClone(todos) } }, 'local'));
      flush();
    },
    advance(ms) {
      const target = now + ms;
      while (true) {
        const next = [...timers].filter(([, timer]) => timer.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        now = next[1].at;
        timers.delete(next[0]);
        next[1].fn();
        flush();
      }
      now = target;
    }
  };
}

module.exports = { loadPopup };
