const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const coreSource = fs.readFileSync(path.join(__dirname, '..', 'todo-core.js'), 'utf8');
const popupSource = fs.readFileSync(path.join(__dirname, '..', 'popup.js'), 'utf8');
const destructureLine = popupSource.match(/const \{[\s\S]*?\} = globalThis\.TodoCore;/);

assert(destructureLine, 'popup.js TodoCore destructuring not found');

const sandbox = {
  globalThis: {},
  module: { exports: {} }
};
sandbox.globalThis = sandbox;

vm.createContext(sandbox);
vm.runInContext(coreSource, sandbox);
vm.runInContext(destructureLine[0], sandbox);

assert.strictEqual(typeof sandbox.TodoCore.parseReminderInput, 'function');
