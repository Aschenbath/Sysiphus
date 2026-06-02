const assert = require('assert');
const { parseReminderInput } = require('../todo-core');

assert.strictEqual(parseReminderInput('09:30'), '09:30');
assert.strictEqual(parseReminderInput('9:5'), '09:05');
assert.strictEqual(parseReminderInput('09：30'), '09:30');
assert.strictEqual(parseReminderInput('0930'), '09:30');
assert.strictEqual(parseReminderInput('1120'), '11:20');
assert.strictEqual(parseReminderInput('2460'), null);
assert.strictEqual(parseReminderInput(''), null);
