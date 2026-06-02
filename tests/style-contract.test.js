const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
const popupHtml = fs.readFileSync(path.join(__dirname, '..', 'popup.html'), 'utf8');
const popupJs = fs.readFileSync(path.join(__dirname, '..', 'popup.js'), 'utf8');

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
