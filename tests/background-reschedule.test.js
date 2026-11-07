const test = require('node:test');
const assert = require('node:assert/strict');
const { loadBackground } = require('./helpers/background.cjs');

test('installed event reschedules without treating Chrome details as callback', () => {
  const { listeners } = loadBackground({ storage: {
    reminderEnabled: true,
    reminderTime: '20:00',
    todos: [{ id: 'todo-a', text: '干饭', completed: false }]
  } });

  assert.doesNotThrow(() => {
    listeners.installed({ reason: 'install' });
  });
});
