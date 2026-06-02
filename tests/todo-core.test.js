const assert = require('assert');
const {
  advanceRepeatDate,
  clampSnoozeMinutes,
  filterTodosForView,
  formatDateDisplay,
  mergeMissingTodos,
  nextRepeatResetTime,
  normalizeAppTitle,
  normalizeQuoteSettings,
  normalizeTodoViewMode,
  parseQuickAdd,
  renderTextWithSystemNumbers,
  rolloverRepeatTodos,
  shouldAutoDeleteCompletedTodo,
  sortTodosForDisplay
} = require('../todo-core');

const now = new Date(2026, 5, 1, 12, 0, 0, 0); // 2026-06-01, Monday

assert.deepStrictEqual(parseQuickAdd('明天0930 干饭', now), {
  text: '干饭',
  dueDate: '2026-06-02',
  repeat: 'none',
  reminderTime: '09:30'
});

assert.deepStrictEqual(parseQuickAdd('后天0600 干饭', now), {
  text: '干饭',
  dueDate: '2026-06-03',
  repeat: 'none',
  reminderTime: '06:00'
});

assert.deepStrictEqual(parseQuickAdd('后天 0600 干饭', now), {
  text: '干饭',
  dueDate: '2026-06-03',
  repeat: 'none',
  reminderTime: '06:00'
});

assert.deepStrictEqual(parseQuickAdd('每天2100 干饭', now), {
  text: '干饭',
  dueDate: null,
  repeat: 'daily',
  reminderTime: '21:00'
});

assert.deepStrictEqual(parseQuickAdd('周五1120 干饭', now), {
  text: '干饭',
  dueDate: '2026-06-05',
  repeat: 'none',
  reminderTime: '11:20'
});

assert.deepStrictEqual(parseQuickAdd('12300217 干饭', now), {
  text: '干饭',
  dueDate: '2026-12-30',
  repeat: 'none',
  reminderTime: '02:17'
});

assert.deepStrictEqual(parseQuickAdd('干饭', now), {
  text: '干饭',
  dueDate: null,
  repeat: 'none',
  reminderTime: null
});

assert.strictEqual(formatDateDisplay('2026-06-05'), '06/05');
assert.strictEqual(formatDateDisplay(''), '');
assert.strictEqual(formatDateDisplay(null), '');
assert.strictEqual(formatDateDisplay('not-a-date'), '');

assert.deepStrictEqual(normalizeQuoteSettings({
  text: '  Stay hungry.  ',
  author: '  Steve Jobs  '
}), {
  text: 'Stay hungry.',
  author: 'Steve Jobs'
});

assert.deepStrictEqual(normalizeQuoteSettings({
  text: '   ',
  author: ''
}), {
  text: 'One must imagine Sisyphus happy.',
  author: 'Albert Camus'
});

assert.strictEqual(normalizeAppTitle('  My private ritual  '), 'My private ritual');
assert.strictEqual(normalizeAppTitle(''), 'Sisyphus');
assert.strictEqual(normalizeAppTitle('  a\nb\tc  '), 'a b c');
assert.strictEqual(normalizeTodoViewMode('repeat'), 'repeat');
assert.strictEqual(normalizeTodoViewMode('all'), 'all');
assert.strictEqual(normalizeTodoViewMode('wat'), 'all');

assert.strictEqual(
  renderTextWithSystemNumbers('15:05 <干饭> & 0930'),
  '<span class="num">15</span>:<span class="num">05</span> &lt;干饭&gt; &amp; <span class="num">0930</span>'
);

assert.strictEqual(clampSnoozeMinutes(5), 5);
assert.strictEqual(clampSnoozeMinutes('30'), 30);
assert.strictEqual(clampSnoozeMinutes('999'), 10);

const sorted = sortTodosForDisplay([
  { id: 'a', text: 'normal', createdAt: '2026-06-01T10:00:00.000Z' },
  { id: 'b', text: 'pinned old', pinned: true, createdAt: '2026-06-01T09:00:00.000Z' },
  { id: 'c', text: 'overdue', dueDate: '2026-05-31', createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'd', text: 'pinned new', pinned: true, createdAt: '2026-06-01T11:00:00.000Z' }
], now).map(t => t.id);

assert.deepStrictEqual(sorted, ['d', 'b', 'c', 'a']);

assert.deepStrictEqual(filterTodosForView([
  { id: 'a', repeat: 'none' },
  { id: 'b', repeat: 'daily' },
  { id: 'c', repeat: null },
  { id: 'd', repeat: 'weekly' },
  { id: 'e' },
  { id: 'f', repeat: 'monthly' }
], 'repeat').map(t => t.id), ['b', 'd', 'f']);

assert.deepStrictEqual(filterTodosForView([
  { id: 'a', repeat: 'none' },
  { id: 'b', repeat: 'daily' }
], 'all').map(t => t.id), ['a', 'b']);

assert.strictEqual(shouldAutoDeleteCompletedTodo({ completed: true, repeat: 'none' }), true);
assert.strictEqual(shouldAutoDeleteCompletedTodo({ completed: true, repeat: 'daily' }), false);

const oldCompletedAt = now.getTime() - 60001;
const recentCompletedAt = now.getTime() - 30000;
const repeatArchiveTodos = [
  { id: 'old-repeat', completed: true, completedAt: oldCompletedAt, repeat: 'daily' },
  { id: 'old-normal', completed: true, completedAt: oldCompletedAt, repeat: 'none' },
  { id: 'recent-repeat', completed: true, completedAt: recentCompletedAt, repeat: 'weekly' },
  { id: 'open-repeat', completed: false, repeat: 'monthly' },
  { id: 'open-normal', completed: false, repeat: 'none' }
];

assert.deepStrictEqual(
  filterTodosForView(repeatArchiveTodos, 'all', { now, fadeDelay: 60000 }).map(t => t.id),
  ['recent-repeat', 'open-repeat', 'open-normal']
);

assert.deepStrictEqual(
  filterTodosForView(repeatArchiveTodos, 'repeat', { now, fadeDelay: 60000 }).map(t => t.id),
  ['old-repeat', 'recent-repeat', 'open-repeat']
);

// ---- Repeat 真循环: 下一周期重置 + dueDate 推进 ----
assert.strictEqual(advanceRepeatDate('2026-06-01', 'daily'), '2026-06-02');
assert.strictEqual(advanceRepeatDate('2026-06-01', 'weekly'), '2026-06-08');
assert.strictEqual(advanceRepeatDate('2026-06-15', 'monthly'), '2026-07-15');
assert.strictEqual(advanceRepeatDate('2026-06-01', 'none'), '2026-06-01');
assert.strictEqual(advanceRepeatDate('2026-06-01', 'daily', 3), '2026-06-04');

const completed601 = new Date(2026, 5, 1, 21, 0, 0, 0).getTime();
assert.strictEqual(nextRepeatResetTime(completed601, 'daily'), new Date(2026, 5, 2, 0, 0, 0, 0).getTime());
assert.strictEqual(nextRepeatResetTime(completed601, 'weekly'), new Date(2026, 5, 8, 0, 0, 0, 0).getTime());
assert.strictEqual(nextRepeatResetTime(completed601, 'monthly'), new Date(2026, 6, 1, 0, 0, 0, 0).getTime());
assert.strictEqual(nextRepeatResetTime(completed601, 'none'), null);
assert.strictEqual(nextRepeatResetTime(undefined, 'daily'), null);

const day2noon = new Date(2026, 5, 2, 12, 0, 0, 0).getTime();
const rolled = rolloverRepeatTodos([
  { id: 'r1', completed: true, completedAt: completed601, repeat: 'daily', dueDate: '2026-06-01', snoozedUntil: 123 },
  { id: 'r2', completed: true, completedAt: completed601, repeat: 'weekly' },
  { id: 'n1', completed: true, completedAt: completed601, repeat: 'none' },
  { id: 'o1', completed: false, repeat: 'daily' }
], day2noon);
assert.strictEqual(rolled.changed, true);
const r1 = rolled.todos.find(t => t.id === 'r1');
assert.strictEqual(r1.completed, false);
assert.strictEqual('completedAt' in r1, false);
assert.strictEqual('snoozedUntil' in r1, false);
assert.strictEqual(r1.dueDate, '2026-06-02');
assert.strictEqual(rolled.todos.find(t => t.id === 'r2').completed, true); // weekly not due yet
assert.strictEqual(rolled.todos.find(t => t.id === 'n1').completed, true); // normal stays archived
assert.strictEqual(rolled.todos.find(t => t.id === 'o1').completed, false);

// no completed repeat is due to reset -> unchanged, same array reference
const noChange = rolloverRepeatTodos(
  [{ id: 'r2', completed: true, completedAt: completed601, repeat: 'weekly' }],
  day2noon
);
assert.strictEqual(noChange.changed, false);

// stale dueDate far in the past is advanced to a future (>= today) period
const day10 = new Date(2026, 5, 10, 9, 0, 0, 0).getTime();
const lateRoll = rolloverRepeatTodos([
  { id: 'r3', completed: true, completedAt: completed601, repeat: 'daily', dueDate: '2026-06-01' }
], day10);
assert.strictEqual(lateRoll.todos[0].completed, false);
assert.strictEqual(lateRoll.todos[0].dueDate, '2026-06-10');

const recovery = mergeMissingTodos(
  [{ id: 'existing', text: '干饭1', repeat: 'daily' }],
  [
    { id: 'recover-a', text: '干饭2', repeat: 'daily' },
    { id: 'recover-b', text: '干饭1', repeat: 'daily' }
  ]
);
assert.strictEqual(recovery.changed, true);
assert.deepStrictEqual(recovery.todos.map(t => t.text), ['干饭2', '干饭1']);
