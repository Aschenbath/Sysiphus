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
