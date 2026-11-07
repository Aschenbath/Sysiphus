const assert = require('node:assert/strict');
const test = require('node:test');
const { loadPopup } = require('./helpers/popup.cjs');

const now = new Date(2026, 5, 1, 12).getTime();
const completed = { id: 'a', text: 'keep me', repeat: 'none', completed: true, completedAt: now - 59000 };

test('storage reopening a completed todo cancels its old deletion timer', () => {
  const popup = loadPopup({ todos: [completed] }, now);
  popup.externalTodos([{ ...completed, completed: false, completedAt: undefined }]);
  popup.advance(2000);
  assert.equal(popup.storage.todos.length, 1);
  assert.equal(popup.storage.todos[0].completed, false);
});

test('unchecking a todo during its fade cancels the second deletion timeout', () => {
  const popup = loadPopup({ todos: [completed] }, now);
  popup.advance(1000);
  popup.evaluate("toggleTodo('a')");
  popup.flush();
  popup.advance(1000);
  assert.equal(popup.storage.todos.length, 1);
  assert.equal(popup.storage.todos[0].completed, false);
});

test('a new completion window supersedes an old fade animation', () => {
  const popup = loadPopup({ todos: [completed] }, now);
  popup.advance(1000);
  popup.externalTodos([{ ...completed, completedAt: now + 1000 }]);
  popup.advance(1000);
  assert.equal(popup.storage.todos.length, 1);
  popup.advance(60000);
  assert.equal(popup.storage.todos.length, 0);
});

test('ordinary completions expire while repeat completions remain archived', () => {
  const popup = loadPopup({ todos: [completed, { ...completed, id: 'r', repeat: 'weekly' }] }, now);
  popup.advance(2000);
  assert.deepEqual(popup.storage.todos.map(todo => todo.id), ['r']);
});

test('legacy completion timestamps are saved and survive reopening the popup', () => {
  const popup = loadPopup({ todos: [{ id: 'r', repeat: 'daily', completed: true }] }, now);
  assert.equal(popup.storage.todos[0].completedAt, now);
  const reopened = loadPopup(popup.storage, now + 10000);
  assert.equal(reopened.storage.todos[0].completedAt, now);
  assert.equal(reopened.writes.length, 0);
});

test('editing a snoozed title preserves its regular reminder time', () => {
  const popup = loadPopup({ todos: [{
    id: 'a', text: 'old', completed: false, reminderTime: '09:30', snoozedUntil: now + 600000
  }] }, now);
  popup.evaluate('showEditForm(todos[0])');
  popup.nodes.get('editTodoInput').value = 'new';
  popup.evaluate('updateTodo()');
  popup.flush();
  assert.equal(popup.storage.todos[0].text, 'new');
  assert.equal(popup.storage.todos[0].reminderTime, '09:30');
});
