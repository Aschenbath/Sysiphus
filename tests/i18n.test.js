const assert = require('node:assert/strict');
const test = require('node:test');
const I18N = require('../i18n.js');

const LOCALES = ['en', 'zh', 'ja', 'ko'];

test('supports exactly en/zh/ja/ko', () => {
  assert.deepEqual([...I18N.SUPPORTED].sort(), [...LOCALES].sort());
});

test('every locale defines the same keys with non-empty strings', () => {
  const enKeys = Object.keys(I18N.MESSAGES.en).sort();
  for (const loc of LOCALES) {
    const keys = Object.keys(I18N.MESSAGES[loc]).sort();
    assert.deepEqual(keys, enKeys, `${loc} keys must match en exactly`);
    for (const k of keys) {
      assert.equal(typeof I18N.MESSAGES[loc][k], 'string', `${loc}.${k} should be a string`);
      assert.ok(I18N.MESSAGES[loc][k].length > 0, `${loc}.${k} should be non-empty`);
    }
  }
});

test('normalizeLocale maps regional tags and rejects unknowns', () => {
  assert.equal(I18N.normalizeLocale('zh-CN'), 'zh');
  assert.equal(I18N.normalizeLocale('ja'), 'ja');
  assert.equal(I18N.normalizeLocale('ko-KR'), 'ko');
  assert.equal(I18N.normalizeLocale('en-US'), 'en');
  assert.equal(I18N.normalizeLocale('fr'), null);
  assert.equal(I18N.normalizeLocale(''), null);
  assert.equal(I18N.normalizeLocale(undefined), null);
});

test('resolveLocale prefers a valid stored override', () => {
  assert.equal(I18N.resolveLocale('ja'), 'ja');
  assert.equal(I18N.resolveLocale('zh-TW'), 'zh');
  // A junk override falls through to navigator.language (Node exposes it) then en,
  // so the result is environment-dependent; just require a supported locale.
  assert.ok(I18N.SUPPORTED.includes(I18N.resolveLocale('xx')));
});

test('t() localizes, interpolates, and returns the key for unknown messages', () => {
  I18N.setLocale('zh');
  assert.equal(I18N.t('bell.title'), '每日提醒');
  I18N.setLocale('ja');
  assert.equal(I18N.t('bell.title'), '毎日リマインド');
  I18N.setLocale('en');
  assert.equal(I18N.t('notify.clickToSnooze', { min: 10 }), 'Click to snooze 10 min');
  assert.equal(I18N.t('does.not.exist'), 'does.not.exist');
});
