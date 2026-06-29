const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
const popupHtml = fs.readFileSync(path.join(__dirname, '..', 'popup.html'), 'utf8');
const popupJs = fs.readFileSync(path.join(__dirname, '..', 'popup.js'), 'utf8');
const readme = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
const screenshotScript = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'readme-screenshots.mjs'), 'utf8');

function selectorHasDeclaration(selector, declaration) {
  const rulePattern = /([^{}]+)\{([^{}]*)\}/g;
  let match;
  while ((match = rulePattern.exec(css)) !== null) {
    const selectors = match[1].split(',').map(item => item.trim());
    if (!selectors.includes(selector)) continue;
    if (match[2].includes(declaration)) return true;
  }
  return false;
}

test('user-entered todo content and controls use the system font', () => {
  const systemFontDeclaration = 'font-family: var(--font-system);';
  [
    'button',
    'input',
    'select',
    'textarea',
    '.todo-input',
    '.form-input',
    '.todo-text',
    '.todo-meta',
    '.todo-due',
    '.form-group label',
    '.select-display',
    '.select-option',
    '.reminder-label',
    '.reminder-hint',
    '.empty-state'
  ].forEach(selector => {
    assert.equal(
      selectorHasDeclaration(selector, systemFontDeclaration),
      true,
      `${selector} should declare ${systemFontDeclaration}`
    );
  });
});

test('global reminder time uses manual 24-hour input instead of native dropdowns', () => {
  assert.match(popupHtml, /id="reminderTimeInput"/);
  assert.doesNotMatch(popupHtml, /id="reminderHour"/);
  assert.doesNotMatch(popupHtml, /id="reminderMinute"/);

  assert.match(popupJs, /reminderTimeInput/);
  assert.doesNotMatch(popupJs, /fillTimeSelect/);
  assert.doesNotMatch(popupJs, /reminderHour/);
  assert.doesNotMatch(popupJs, /reminderMinute/);
});

test('add-form Enter shortcut does not intercept reminder panel fields', () => {
  assert.match(popupJs, /e\.target && e\.target\.closest\('#reminderPanel'\)/);
});

test('reminder-time field commits the form on Enter', () => {
  // The edit form has no submit button, and the document-level Enter shortcut
  // excludes #editTodoForm, so editing only the reminder time and pressing
  // Enter used to do nothing. Guard the keydown routing so it cannot regress.
  assert.match(
    popupJs,
    /input === editTodoReminderInput\)\s*\{\s*updateTodo\(\);\s*\}\s*else\s*\{\s*addTodo\(\);/,
    'reminder-time Enter should route to updateTodo (edit) / addTodo (add)'
  );
});

test('clicking anywhere on a todo row opens the inline editor', () => {
  // The edit click must be bound to the whole .todo-item row, not just
  // .todo-content. Otherwise the padding, the flex gaps, and the invisible
  // actions column on the right are dead zones even though the row shows a
  // pointer cursor.
  const start = popupJs.indexOf("querySelectorAll('.todo-item')");
  assert.notEqual(start, -1, 'edit click should be bound to .todo-item');
  const block = popupJs.slice(start, start + 400);
  assert.match(block, /addEventListener\('click'/);
  assert.match(block, /showEditForm\(todo\)/);
});

test('README demos split real Quick Add parsing from global reminder settings', () => {
  assert.match(readme, /sisyphus-quick-add-demo\.gif/);
  assert.match(readme, /sisyphus-reminder-demo\.gif/);
  assert.doesNotMatch(readme, /sisyphus-demo\.gif/);
});

test('Quick Add demo uses the app flow and does not open global reminder panel', () => {
  assert.match(screenshotScript, /function captureQuickAddDemoGif/);
  assert.match(screenshotScript, /function captureReminderDemoGif/);
  const quickStart = screenshotScript.indexOf('function captureQuickAddDemoGif');
  const reminderStart = screenshotScript.indexOf('function captureReminderDemoGif');
  const quickDemo = screenshotScript.slice(quickStart, reminderStart);
  assert.match(quickDemo, /addTodo\(\)/);
  assert.match(quickDemo, /showEditForm\(todos\[0\]\)/);
  assert.doesNotMatch(quickDemo, /reminderPanel/);
});

test('one-shot exam import has complete popup bindings and visible exams', () => {
  assert.match(popupJs, /mergeMissingTodos,/);
  assert.match(popupJs, /const EXAM_IMPORT_KEY =/);
  assert.match(popupJs, /const EXAM_IMPORT_CREATED_AT =/);
  assert.match(popupJs, /function saveTodos\(extra = \{\}\)/);
  assert.match(popupJs, /chrome\.storage\.local\.set\(\{ todos: todos, \.\.\.extra \}/);
  assert.match(popupJs, /oneShotReminder: true/);
  [
    ['高等统计学 考试地点：4305，考试时间：15:00-17:00', '2026-07-01', '14:00'],
    ['操作系统 考试地点：5C601，考试时间：09:00-11:00', '2026-07-02', '08:00'],
    ['马克思主义基本原理 考试地点：4303，考试时间：15:00-17:00', '2026-07-03', '14:00'],
    ['大学英语 IV（翻译） 考试地点：5B703，考试时间：09:00-11:00', '2026-07-07', '08:00'],
    ['软件工程基础 考试地点：4104，考试时间：15:00-17:00', '2026-07-08', '14:00']
  ].forEach(([text, dueDate, reminderTime]) => {
    assert.ok(popupJs.includes(text), `${text} should be imported`);
    assert.match(popupJs, new RegExp(`dueDate: '${dueDate}'`));
    assert.match(popupJs, new RegExp(`reminderTime: '${reminderTime}'`));
  });
});
