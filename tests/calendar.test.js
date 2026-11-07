const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');

for (const timezone of ['UTC', 'America/Los_Angeles', 'Asia/Shanghai', 'Europe/Berlin']) {
  test(`deadline display, overdue checks and rollover use local dates in ${timezone}`, () => {
    const result = spawnSync(process.execPath, ['-e', `
      const assert = require('node:assert/strict');
      const core = require(${JSON.stringify(path.resolve(__dirname, '../todo-core.js'))});
      const now = new Date(2026, 5, 1, 12);
      assert.equal(core.formatDateDisplay('2026-06-05'), '06/05');
      assert.equal(core.isTodoOverdue({ dueDate: '2026-06-01' }, now), false);
      assert.equal(core.isTodoOverdue({ dueDate: '2026-05-31' }, now), true);
      assert.equal(core.advanceRepeatDate('2026-06-01', 'daily'), '2026-06-02');
      assert.equal(core.advanceRepeatDate('2026-06-01', 'weekly'), '2026-06-08');
      assert.equal(core.advanceRepeatDate('2026-01-31', 'monthly'), '2026-02-28');
      assert.equal(core.advanceRepeatDate('2028-01-31', 'monthly'), '2028-02-29');
      assert.equal(core.advanceRepeatDate('2026-03-08', 'daily'), '2026-03-09');
      assert.equal(core.advanceRepeatDate('2026-11-01', 'daily'), '2026-11-02');
      assert.equal(core.formatDateDisplay('2026-02-31'), '');
      assert.equal(core.formatDateDisplay('2026-13-01'), '');
      assert.equal(core.isTodoOverdue({ dueDate: '2026-02-31' }, now), false);
      assert.equal(core.advanceRepeatDate('2026-02-31', 'daily'), '2026-02-31');
      for (const date of ['2026-05-31', '2020-01-01']) {
        const rolled = core.rolloverRepeatTodos([{
          id: 'repeat', repeat: 'daily', completed: true,
          completedAt: new Date(2026, 4, 31, 20).getTime(), dueDate: date
        }], now);
        assert.equal(rolled.todos[0].completed, false);
        assert.equal(rolled.todos[0].dueDate, '2026-06-01');
      }
    `], { env: { ...process.env, TZ: timezone }, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || String(result.error));
  });
}
