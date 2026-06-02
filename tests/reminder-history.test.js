const test = require('node:test');
const assert = require('node:assert/strict');

require('../todo-core.js');

test('nextReminderHistory keeps only the latest three unique times', () => {
  assert.deepEqual(
    globalThis.TodoCore.nextReminderHistory(['09:30', '11:20', '15:05', '20:00'], '11:20'),
    ['11:20', '09:30', '15:05']
  );
});

test('nextReminderHistory trims existing history to three when rendering', () => {
  assert.deepEqual(
    globalThis.TodoCore.nextReminderHistory(['09:30', '11:20', '15:05', '20:00'], null),
    ['09:30', '11:20', '15:05']
  );
});
