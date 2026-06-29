// DOM elements
const addBtn = document.getElementById('addBtn');
const appTitle = document.getElementById('appTitle');
const addTodoForm = document.getElementById('addTodoForm');
const editTodoForm = document.getElementById('editTodoForm');
const todoInput = document.getElementById('todoInput');
const editTodoInput = document.getElementById('editTodoInput');
const cancelBtn = document.getElementById('cancelBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const repeatViewBtn = document.getElementById('repeatViewBtn');
const dueDateInput = document.getElementById('dueDateInput');
const dueDateDisplay = document.getElementById('dueDateDisplay');
const clearDueDateBtn = document.getElementById('clearDueDateBtn');
const editDueDateInput = document.getElementById('editDueDateInput');
const editDueDateDisplay = document.getElementById('editDueDateDisplay');
const clearEditDueDateBtn = document.getElementById('clearEditDueDateBtn');
const reminderBtn = document.getElementById('reminderBtn');
const reminderPanel = document.getElementById('reminderPanel');
const reminderToggle = document.getElementById('reminderToggle');
const reminderTimeInput = document.getElementById('reminderTimeInput');
const snoozeMinutes = document.getElementById('snoozeMinutes');
const todoReminderInput = document.getElementById('todoReminderInput');
const editTodoReminderInput = document.getElementById('editTodoReminderInput');
const todoNagMinutes = document.getElementById('todoNagMinutes');
const editTodoNagMinutes = document.getElementById('editTodoNagMinutes');
const reminderHistory = document.getElementById('reminderHistory');
const quoteFooter = document.getElementById('quoteFooter');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const {
  clampNagMinutes,
  clampSnoozeMinutes,
  filterTodosForView,
  formatDateDisplay,
  isTodoOverdue,
  mergeMissingTodos,
  normalizeAppTitle,
  normalizeQuoteSettings,
  normalizeTodoViewMode,
  nextReminderHistory,
  parseQuickAdd,
  parseReminderInput,
  renderTextWithSystemNumbers,
  rolloverRepeatTodos,
  shouldAutoDeleteCompletedTodo,
  sortTodosForDisplay
} = globalThis.TodoCore;

// State
let todos = [];
let editingId = null;
let isAddFormVisible = false;
let todoViewMode = 'all';
let fadeTimers = {};
const editFormHome = document.createComment('edit-form-home');
editTodoForm.before(editFormHome);

// Completed todos auto-disappear after this delay (ms)
const FADE_DELAY = 60000;
const APP_TITLE_KEY = 'appTitle';
const QUOTE_SETTINGS_KEY = 'quoteSettings';
const TODO_VIEW_MODE_KEY = 'todoViewMode';
const EXAM_IMPORT_KEY = 'examImport_2026_07_google_tasks_20260629';
const EXAM_IMPORT_CREATED_AT = '2026-06-29T03:28:00.000Z';
const EXAM_TITLE_MIGRATION_KEY = 'examTitleMigration_20260629_subject_dates';

// Initialize
if (typeof I18N !== 'undefined') I18N.applyStaticI18n();
applyTheme();
setInterval(applyTheme, 60000); // re-check every minute so it flips while open
loadLocale();
loadTodos();
renderReminderHistory();
loadAppTitle();
loadQuoteSettings();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;
  if (changes.todos) syncTodosFromStorage(changes.todos.newValue || []);
  if (changes[APP_TITLE_KEY] && !appTitle.isContentEditable) {
    renderAppTitle(changes[APP_TITLE_KEY].newValue);
  }
  if (changes.quoteSettings && !quoteFooter.classList.contains('editing')) {
    renderQuoteSettings(changes.quoteSettings.newValue);
  }
});

// Auto day/night theme: dark 18:00鈥?6:00, light otherwise. No manual toggle.
function applyTheme() {
  const hour = new Date().getHours();
  const dark = hour >= 18 || hour < 6;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

// Resolve UI language: stored `lang` override wins, else navigator (set in i18n.js).
// No visible switcher; the override is mainly for screenshots and power users.
function loadLocale() {
  if (typeof I18N === 'undefined') return;
  chrome.storage.local.get(['lang'], (res) => {
    if (res && res.lang) I18N.setLocale(res.lang);
    I18N.applyStaticI18n();
  });
}

// ---------- Daily reminder settings ----------
function setTodoReminderField(input, val) {
  input.value = val || '';
}

function todoVisibleReminderTime(todo) {
  const snoozedUntil = Number(todo.snoozedUntil || 0);
  if (snoozedUntil > Date.now()) {
    return hhmmFromTimestamp(snoozedUntil);
  }
  return todo.reminderTime || '';
}

function hhmmFromTimestamp(ts) {
  const date = new Date(ts);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatReminderInput(input) {
  const raw = input.value.trim();
  if (/^\d{4}$/.test(raw)) {
    input.value = `${raw.slice(0, 2)}:${raw.slice(2)}`;
  }
}

function rememberReminderTime(time) {
  if (!time) return;
  chrome.storage.local.get(['reminderHistory'], (res) => {
    const next = nextReminderHistory(res.reminderHistory, time);
    chrome.storage.local.set({ reminderHistory: next }, renderReminderHistory);
  });
}

function renderReminderHistory() {
  chrome.storage.local.get(['reminderHistory'], (res) => {
    const history = nextReminderHistory(res.reminderHistory, null);
    reminderHistory.innerHTML = history
      .map(time => `<option value="${escapeHtml(time)}"></option>`)
      .join('');
  });
}

function renderAppTitle(value) {
  const title = normalizeAppTitle(value);
  appTitle.textContent = title;
  document.title = title;
}

function loadAppTitle() {
  chrome.storage.local.get([APP_TITLE_KEY], (res) => {
    renderAppTitle(res[APP_TITLE_KEY]);
  });
}

function saveAppTitle() {
  const title = normalizeAppTitle(appTitle.textContent);
  chrome.storage.local.set({ [APP_TITLE_KEY]: title }, () => {
    renderAppTitle(title);
  });
}

function beginAppTitleEdit() {
  appTitle.setAttribute('contenteditable', 'plaintext-only');
  appTitle.setAttribute('spellcheck', 'false');
  appTitle.classList.add('editing');
  appTitle.focus();
  selectElementText(appTitle);
}

function finishAppTitleEdit() {
  if (!appTitle.isContentEditable) return;
  appTitle.removeAttribute('contenteditable');
  appTitle.removeAttribute('spellcheck');
  appTitle.classList.remove('editing');
  saveAppTitle();
}

function cancelAppTitleEdit() {
  if (!appTitle.isContentEditable) return;
  appTitle.removeAttribute('contenteditable');
  appTitle.removeAttribute('spellcheck');
  appTitle.classList.remove('editing');
  loadAppTitle();
}

function renderQuoteSettings(settings) {
  const quote = normalizeQuoteSettings(settings);
  quoteText.textContent = quote.text;
  quoteAuthor.textContent = quote.author;
}

function loadQuoteSettings() {
  chrome.storage.local.get([QUOTE_SETTINGS_KEY], (res) => {
    renderQuoteSettings(res[QUOTE_SETTINGS_KEY]);
  });
}

function saveQuoteSettings() {
  const quote = normalizeQuoteSettings({
    text: quoteText.textContent,
    author: quoteAuthor.textContent
  });
  chrome.storage.local.set({ [QUOTE_SETTINGS_KEY]: quote }, () => {
    renderQuoteSettings(quote);
  });
}

function setQuoteEditing(editing) {
  quoteFooter.classList.toggle('editing', editing);
  [quoteText, quoteAuthor].forEach((el) => {
    if (editing) {
      el.setAttribute('contenteditable', 'plaintext-only');
      el.setAttribute('spellcheck', 'false');
    } else {
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
    }
  });
}

function selectElementText(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function beginQuoteEdit(target) {
  if (!quoteFooter.classList.contains('editing')) setQuoteEditing(true);
  const focusTarget = target || quoteText;
  focusTarget.focus();
  selectElementText(focusTarget);
}

function finishQuoteEdit() {
  if (!quoteFooter.classList.contains('editing')) return;
  setQuoteEditing(false);
  saveQuoteSettings();
}

function cancelQuoteEdit() {
  if (!quoteFooter.classList.contains('editing')) return;
  setQuoteEditing(false);
  loadQuoteSettings();
}

function createTodoId() {
  if (globalThis.crypto && globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function normalizeTodoIds() {
  const seen = new Set();
  let changed = false;
  todos.forEach(todo => {
    const id = String(todo.id || '');
    if (!id || seen.has(id)) {
      todo.id = createTodoId();
      changed = true;
    }
    seen.add(String(todo.id));
  });
  return changed;
}

const EXAM_TITLES_BY_ID = {
  'exam-20260701-high-statistics': '高等统计学 7.1',
  'exam-20260702-operating-system': '操作系统 7.2',
  'exam-20260703-marxism-principles': '马克思主义基本原理 7.3',
  'exam-20260707-college-english-iv-translation': '大学英语 IV（翻译） 7.7',
  'exam-20260708-software-engineering-basics': '软件工程 7.8'
};

function migrateExamTitles(list) {
  let changed = false;
  const next = (Array.isArray(list) ? list : []).map((todo) => {
    const title = todo && EXAM_TITLES_BY_ID[String(todo.id)];
    if (!title || todo.text === title) return todo;
    changed = true;
    return { ...todo, text: title };
  });
  return { todos: next, changed };
}

function buildExamImportTodos() {
  return [
    {
      id: 'exam-20260701-high-statistics',
      text: '高等统计学 7.1',
      completed: false,
      dueDate: '2026-07-01',
      repeat: 'none',
      reminderTime: '14:00',
      nagMinutes: 0,
      pinned: false,
      oneShotReminder: true,
      createdAt: EXAM_IMPORT_CREATED_AT
    },
    {
      id: 'exam-20260702-operating-system',
      text: '操作系统 7.2',
      completed: false,
      dueDate: '2026-07-02',
      repeat: 'none',
      reminderTime: '08:00',
      nagMinutes: 0,
      pinned: false,
      oneShotReminder: true,
      createdAt: EXAM_IMPORT_CREATED_AT
    },
    {
      id: 'exam-20260703-marxism-principles',
      text: '马克思主义基本原理 7.3',
      completed: false,
      dueDate: '2026-07-03',
      repeat: 'none',
      reminderTime: '14:00',
      nagMinutes: 0,
      pinned: false,
      oneShotReminder: true,
      createdAt: EXAM_IMPORT_CREATED_AT
    },
    {
      id: 'exam-20260707-college-english-iv-translation',
      text: '大学英语 IV（翻译） 7.7',
      completed: false,
      dueDate: '2026-07-07',
      repeat: 'none',
      reminderTime: '08:00',
      nagMinutes: 0,
      pinned: false,
      oneShotReminder: true,
      createdAt: EXAM_IMPORT_CREATED_AT
    },
    {
      id: 'exam-20260708-software-engineering-basics',
      text: '软件工程 7.8',
      completed: false,
      dueDate: '2026-07-08',
      repeat: 'none',
      reminderTime: '14:00',
      nagMinutes: 0,
      pinned: false,
      oneShotReminder: true,
      createdAt: EXAM_IMPORT_CREATED_AT
    }
  ];
}

loadReminderSettings();

function loadReminderSettings() {
  chrome.storage.local.get(['reminderEnabled', 'reminderTime', 'snoozeMinutes'], (res) => {
    reminderToggle.checked = res.reminderEnabled !== false; // default ON
    reminderTimeInput.value = parseReminderInput(res.reminderTime || '20:00') || '20:00';
    snoozeMinutes.value = String(clampSnoozeMinutes(res.snoozeMinutes));
  });
}

function saveReminderSettings() {
  const reminderTime = parseReminderInput(reminderTimeInput.value) || '20:00';
  reminderTimeInput.value = reminderTime;
  chrome.storage.local.set(
    {
      reminderEnabled: reminderToggle.checked,
      reminderTime,
      snoozeMinutes: clampSnoozeMinutes(snoozeMinutes.value)
    },
    () => {
      chrome.runtime.sendMessage({ type: 'updateReminder' });
    }
  );
}

reminderBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  reminderPanel.classList.toggle('hidden');
});

reminderToggle.addEventListener('change', saveReminderSettings);
reminderTimeInput.addEventListener('input', () => {
  formatReminderInput(reminderTimeInput);
});
reminderTimeInput.addEventListener('blur', saveReminderSettings);
reminderTimeInput.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  e.stopPropagation();
  reminderTimeInput.blur();
});
snoozeMinutes.addEventListener('change', saveReminderSettings);

// close the panel when clicking outside it
document.addEventListener('click', (e) => {
  if (reminderPanel.classList.contains('hidden')) return;
  if (e.target.closest('#reminderPanel') || e.target.closest('#reminderBtn')) return;
  reminderPanel.classList.add('hidden');
});

// Collapse the inline editor when the user clicks back into the list/background.
document.addEventListener('click', (e) => {
  if (editTodoForm.classList.contains('hidden')) return;
  if (e.target.closest('#editTodoForm')) return;
  if (e.target.closest('.todo-item.editing')) return;
  hideEditForm();
});

// Event listeners
addBtn.addEventListener('click', toggleAddForm);
repeatViewBtn.addEventListener('click', toggleRepeatView);
cancelBtn.addEventListener('click', hideAddForm);
cancelEditBtn.addEventListener('click', hideEditForm);

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  if (e.target && e.target.closest('#reminderPanel')) return;
  if (addTodoForm.classList.contains('hidden')) return;
  if (e.isComposing) return;
  if (e.target && e.target.closest('#editTodoForm')) return;
  if (e.target && e.target.closest('#appTitle')) return;
  if (e.target && e.target.closest('#quoteFooter')) return;
  e.preventDefault();
  e.stopPropagation();
  addTodo();
}, true);

appTitle.addEventListener('dblclick', (e) => {
  e.preventDefault();
  e.stopPropagation();
  beginAppTitleEdit();
});

appTitle.addEventListener('blur', finishAppTitleEdit);

appTitle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    e.stopPropagation();
    finishAppTitleEdit();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    cancelAppTitleEdit();
  }
});

appTitle.addEventListener('paste', (e) => {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData)
    .getData('text/plain')
    .replace(/\s*\r?\n\s*/g, ' ');
  document.execCommand('insertText', false, text);
});

quoteFooter.addEventListener('dblclick', (e) => {
  e.preventDefault();
  e.stopPropagation();
  beginQuoteEdit(e.target.closest('.quote-text, .quote-author'));
});

quoteFooter.addEventListener('focusout', () => {
  setTimeout(() => {
    if (quoteFooter.classList.contains('editing') && !quoteFooter.contains(document.activeElement)) {
      finishQuoteEdit();
    }
  }, 0);
});

[quoteText, quoteAuthor].forEach((el) => {
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      finishQuoteEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cancelQuoteEdit();
    }
  });

  el.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData)
      .getData('text/plain')
      .replace(/\s*\r?\n\s*/g, ' ');
    document.execCommand('insertText', false, text);
  });
});

editTodoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    updateTodo();
  }
});

[todoReminderInput, editTodoReminderInput].forEach(input => {
  input.addEventListener('input', () => {
    formatReminderInput(input);
  });
  input.addEventListener('blur', () => {
    const normalized = parseReminderInput(input.value);
    input.value = normalized || '';
  });
  // Enter in the reminder-time field should commit the form. The add form's
  // Enter is already handled by the document capture listener, but the edit
  // form excludes itself there (and has no submit button), so a reminder-time
  // edit could only be saved by tabbing back to the text field. Wire Enter
  // here so saving works from whichever field has focus.
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    e.preventDefault();
    e.stopPropagation();
    if (input === editTodoReminderInput) {
      updateTodo();
    } else {
      addTodo();
    }
  });
});

// Auto-expand extra fields on input focus
todoInput.addEventListener('focus', () => {
  const extraFields = document.querySelector('#addTodoForm .extra-fields');
  if (extraFields) {
    extraFields.classList.add('show');
  }
});

editTodoInput.addEventListener('focus', () => {
  const extraFields = document.querySelector('#editTodoForm .extra-fields');
  if (extraFields) {
    extraFields.classList.add('show');
  }
});

// Date input handlers
function syncDateDisplay(input, display) {
  display.value = formatDateDisplay(input.value);
}

function clearDate(input, display) {
  input.value = '';
  display.value = '';
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

dueDateDisplay.addEventListener('mousedown', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dueDateInput.showPicker();
});

dueDateInput.addEventListener('mousedown', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dueDateInput.showPicker();
});

dueDateInput.addEventListener('change', (e) => {
  syncDateDisplay(e.target, dueDateDisplay);
});

clearDueDateBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  clearDate(dueDateInput, dueDateDisplay);
});

editDueDateDisplay.addEventListener('mousedown', (e) => {
  e.preventDefault();
  e.stopPropagation();
  editDueDateInput.showPicker();
});

editDueDateInput.addEventListener('mousedown', (e) => {
  e.preventDefault();
  e.stopPropagation();
  editDueDateInput.showPicker();
});

editDueDateInput.addEventListener('change', (e) => {
  syncDateDisplay(e.target, editDueDateDisplay);
});

clearEditDueDateBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  clearDate(editDueDateInput, editDueDateDisplay);
});

// Custom select handlers - using event delegation
document.addEventListener('click', (e) => {
  const selectDisplay = e.target.closest('.select-display');
  const selectOption = e.target.closest('.select-option');
  const extraFields = e.target.closest('.extra-fields');

  if (selectDisplay) {
    e.stopPropagation();
    const wrapper = selectDisplay.closest('.custom-select');
    const dropdown = wrapper.querySelector('.select-dropdown');
    const isOpen = dropdown.classList.contains('open');

    // Close all other dropdowns
    document.querySelectorAll('.select-dropdown').forEach(d => {
      if (d !== dropdown) {
        d.classList.remove('open');
      }
    });

    // Toggle current dropdown
    if (isOpen) {
      dropdown.classList.remove('open');
    } else {
      dropdown.classList.add('open');
    }
  } else if (selectOption) {
    e.stopPropagation();
    const wrapper = selectOption.closest('.custom-select');
    const select = wrapper.querySelector('select');
    const display = wrapper.querySelector('.select-display');
    const dropdown = wrapper.querySelector('.select-dropdown');

    select.value = selectOption.dataset.value;
    display.textContent = selectOption.textContent;
    dropdown.classList.remove('open');
  } else if (!extraFields) {
    // Only close dropdowns when clicking outside extra-fields area
    document.querySelectorAll('.select-dropdown').forEach(d => {
      d.classList.remove('open');
    });
  }
});

// Functions
function setCustomSelectValue(select, value) {
  select.value = value;
  const wrapper = select.closest('.custom-select');
  if (!wrapper) return;
  const display = wrapper.querySelector('.select-display');
  const option = Array.from(select.options).find(opt => opt.value === value);
  if (display && option) display.textContent = option.textContent;
}

function toggleAddForm() {
  if (isAddFormVisible) {
    hideAddForm();
  } else {
    showAddForm();
  }
}

function toggleRepeatView(e) {
  if (e) e.stopPropagation();
  todoViewMode = todoViewMode === 'repeat' ? 'all' : 'repeat';
  chrome.storage.local.set({ [TODO_VIEW_MODE_KEY]: todoViewMode });
  hideEditForm();
  renderTodos();
}

function updateRepeatViewButton() {
  const repeatOnly = todoViewMode === 'repeat';
  repeatViewBtn.classList.toggle('active', repeatOnly);
  repeatViewBtn.setAttribute('aria-pressed', repeatOnly ? 'true' : 'false');
  repeatViewBtn.title = repeatOnly ? 'Show all todos' : 'Show repeating todos';
  repeatViewBtn.setAttribute('aria-label', repeatOnly ? 'Show all todos' : 'Show repeating todos');
}

function showAddForm() {
  isAddFormVisible = true;
  addTodoForm.classList.remove('hidden');
  editTodoForm.classList.add('hidden');
  restoreEditingItem();
  editFormHome.after(editTodoForm);

  dueDateInput.value = '';
  dueDateDisplay.value = '';

  setTimeout(() => {
    todoInput.focus();
  }, 100);
}

function hideAddForm() {
  isAddFormVisible = false;
  addTodoForm.classList.add('hidden');
  const extraFields = document.querySelector('#addTodoForm .extra-fields');
  if (extraFields) {
    extraFields.classList.remove('show');
  }
  // Close any open dropdowns
  document.querySelectorAll('.select-dropdown').forEach(d => {
    d.classList.remove('open');
  });
  todoInput.value = '';
  dueDateInput.value = '';
  dueDateDisplay.value = '';
  setCustomSelectValue(document.querySelector('#repeatSelect'), 'none');
  todoReminderInput.value = '';
  setCustomSelectValue(todoNagMinutes, '0');
}

function showEditForm(todo) {
  editingId = todo.id;
  const todoElement = document.querySelector(`.todo-item[data-id="${todo.id}"]`);
  if (todoElement) {
    restoreEditingItem();
    todoElement.after(editTodoForm);
    todoElement.classList.add('editing');
  }
  editTodoForm.classList.remove('hidden');
  addTodoForm.classList.add('hidden');
  isAddFormVisible = false;
  editTodoInput.value = todo.text;
  editDueDateInput.value = todo.dueDate || '';

  syncDateDisplay(editDueDateInput, editDueDateDisplay);

  const editSelect = document.querySelector('#editRepeatSelect');
  setCustomSelectValue(editSelect, todo.repeat || 'none');

  setTodoReminderField(editTodoReminderInput, todoVisibleReminderTime(todo));
  setCustomSelectValue(editTodoNagMinutes, String(clampNagMinutes(todo.nagMinutes)));

  setTimeout(() => {
    editTodoInput.focus();
  }, 100);
}

function hideEditForm() {
  editTodoForm.classList.add('hidden');
  restoreEditingItem();
  editFormHome.after(editTodoForm);
  const extraFields = document.querySelector('#editTodoForm .extra-fields');
  if (extraFields) {
    extraFields.classList.remove('show');
  }
  // Close any open dropdowns
  document.querySelectorAll('.select-dropdown').forEach(d => {
    d.classList.remove('open');
  });
  editingId = null;
}

function restoreEditingItem() {
  document.querySelectorAll('.todo-item.editing').forEach(item => {
    item.classList.remove('editing');
  });
}

function addTodo() {
  const parsed = parseQuickAdd(todoInput.value);
  const text = parsed.text.trim();
  if (!text) return;
  const explicitReminder = parseReminderInput(todoReminderInput.value);
  const reminderTime = explicitReminder || parsed.reminderTime;

  const todo = {
    id: createTodoId(),
    text: text,
    completed: false,
    dueDate: parsed.dueDate || dueDateInput.value || null,
    repeat: document.querySelector('#repeatSelect').value !== 'none'
      ? document.querySelector('#repeatSelect').value
      : parsed.repeat,
    reminderTime,
    nagMinutes: clampNagMinutes(todoNagMinutes.value),
    pinned: false,
    createdAt: new Date().toISOString()
  };

  todos.unshift(todo);
  rememberReminderTime(reminderTime);
  saveTodos();
  renderTodos();
  hideAddForm();
}

function syncTodosFromStorage(nextTodos) {
  todos = Array.isArray(nextTodos) ? nextTodos : [];
  const currentEditingId = editingId;
  renderTodos();
  scheduleAllFadeTimers();

  if (!currentEditingId) return;
  const freshTodo = todos.find(t => String(t.id) === String(currentEditingId));
  if (freshTodo) {
    showEditForm(freshTodo);
  } else {
    hideEditForm();
  }
}

function updateTodo() {
  const text = editTodoInput.value.trim();
  if (!text || !editingId) return;

  const todo = todos.find(t => String(t.id) === String(editingId));
  if (!todo) return;

  todo.text = text;
  todo.dueDate = editDueDateInput.value || null;
  todo.repeat = document.querySelector('#editRepeatSelect').value;
  const nextReminderTime = parseReminderInput(editTodoReminderInput.value);
  todo.reminderTime = nextReminderTime;
  delete todo.snoozedUntil;
  todo.nagMinutes = clampNagMinutes(editTodoNagMinutes.value);

  rememberReminderTime(todo.reminderTime);
  hideEditForm();
  saveTodos();
  renderTodos();
}

function togglePin(id) {
  const todo = todos.find(t => String(t.id) === String(id));
  if (!todo) return;
  todo.pinned = !todo.pinned;
  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  const todo = todos.find(t => String(t.id) === String(id));
  if (todo) {
    todo.completed = !todo.completed;

    // Stamp / clear completion time
    if (todo.completed) {
      todo.completedAt = Date.now();
    } else {
      delete todo.completedAt;
      clearFadeTimer(id);
    }

    saveTodos();
    renderTodos();

    // Auto-disappear 1 min after completion
    if (todo.completed) {
      scheduleFadeTimer(todo);
    }
  }
}

function scheduleFadeTimer(todo) {
  clearFadeTimer(todo.id);
  if (!todo.completed || !todo.completedAt) return;

  const remaining = Math.max(0, FADE_DELAY - (Date.now() - todo.completedAt));

  fadeTimers[todo.id] = setTimeout(() => {
    const todoElement = document.querySelector(`.todo-item[data-id="${todo.id}"]`);
    // Repeat todos are kept as an archive and reset next period, so they fade out
    // of the active list instead of being deleted.
    if (!shouldAutoDeleteCompletedTodo(todo)) {
      if (todoElement) {
        todoElement.classList.add('fading');
        setTimeout(renderTodos, 500);
      } else {
        renderTodos();
      }
      return;
    }
    if (todoElement) {
      todoElement.classList.add('fading');
      setTimeout(() => {
        deleteTodo(todo.id, todoElement);
      }, 500);
    } else {
      deleteTodo(todo.id);
    }
  }, remaining);
}

// Drop completed todos whose 1-min window already elapsed (e.g. popup was closed)
function purgeExpiredCompleted() {
  const now = Date.now();
  const before = todos.length;
  todos = todos.filter(t => !(
    shouldAutoDeleteCompletedTodo(t) &&
    t.completedAt &&
    now - t.completedAt >= FADE_DELAY
  ));
  if (todos.length !== before) {
    saveTodos();
  }
}

// Re-arm fade timers for completed todos still within their window
function scheduleAllFadeTimers() {
  todos.forEach(todo => {
    if (todo.completed && todo.completedAt) {
      clearFadeTimer(todo.id);
      scheduleFadeTimer(todo);
    }
  });
}

function clearFadeTimer(id) {
  if (fadeTimers[id]) {
    clearTimeout(fadeTimers[id]);
    delete fadeTimers[id];
  }
}

function deleteTodo(id, todoElement = null) {
  clearFadeTimer(id);
  if (String(editingId) === String(id)) hideEditForm();
  todos = todos.filter(t => String(t.id) !== String(id));
  saveTodos();
  if (todoElement && todoElement.isConnected) {
    todoElement.remove();
    updateRepeatViewButton();
    if (filterTodosForView(todos, todoViewMode, { fadeDelay: FADE_DELAY }).length === 0) {
      renderTodos();
    }
    return;
  }
  renderTodos();
}

function renderTodos() {
  updateRepeatViewButton();
  const filteredTodos = filterTodosForView(todos, todoViewMode, {
    fadeDelay: FADE_DELAY
  });
  if (filteredTodos.length === 0) {
    todoList.innerHTML = '';
    const emptyText = emptyState.querySelector('p');
    if (emptyText) {
      emptyText.textContent = todoViewMode === 'repeat'
        ? 'No repeating todos'
        : 'And miles to go before I sleep...';
    }
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  const displayTodos = sortTodosForDisplay(filteredTodos);
  todoList.innerHTML = displayTodos.map(todo => {
    const overdue = isTodoOverdue(todo);
    return `
      <div class="todo-item ${todo.completed ? 'completed' : ''} ${todo.pinned ? 'pinned' : ''} ${overdue ? 'overdue' : ''} ${editingId === todo.id ? 'editing' : ''}" data-id="${todo.id}">
        <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" data-id="${todo.id}"></div>
        <div class="todo-content" data-id="${todo.id}">
          <div class="todo-text">${renderTextWithSystemNumbers(todo.text)}</div>
        </div>
        <div class="todo-actions">
          <button class="pin-btn ${todo.pinned ? 'active' : ''}" data-id="${todo.id}" title="${todo.pinned ? 'Unpin' : 'Pin'}" aria-label="${todo.pinned ? 'Unpin' : 'Pin'}">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 4l6 6-3 1-4 4v5l-1 1-3.5-3.5L5 21l-1-1 3.5-3.5L4 13l1-1h5l4-4 1-4z"></path>
            </svg>
          </button>
          <button class="delete-btn" data-id="${todo.id}" title="Delete" aria-label="Delete">&times;</button>
        </div>
      </div>
    `;
  }).join('');

  // Add event listeners
  document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTodo(e.currentTarget.dataset.id);
    });
  });

  // Clicking anywhere on the row opens the inline editor. The checkbox, pin,
  // and delete controls each stopPropagation, so they never reach this handler.
  // (Attaching to .todo-content alone left the padding, the flex gaps, and the
  // invisible actions column on the right as dead zones even though the whole
  // row shows a pointer cursor.)
  document.querySelectorAll('.todo-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.dataset.id;
      const todo = todos.find(t => String(t.id) === String(id));
      if (todo) showEditForm(todo);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTodo(e.currentTarget.dataset.id, e.currentTarget.closest('.todo-item'));
    });
  });

  document.querySelectorAll('.pin-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePin(e.currentTarget.dataset.id);
    });
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);

  if (targetDate.getTime() === today.getTime()) return 'Today';
  if (targetDate.getTime() === tomorrow.getTime()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function saveTodos(extra = {}) {
  chrome.storage.local.set({ todos: todos, ...extra }, () => {
    // keep per-todo reminder alarms in sync with the latest list
    chrome.runtime.sendMessage({ type: 'updateReminder' });
  });
}

function loadTodos() {
  chrome.storage.local.get(['todos', TODO_VIEW_MODE_KEY, EXAM_IMPORT_KEY, EXAM_TITLE_MIGRATION_KEY], (result) => {
    todoViewMode = normalizeTodoViewMode(result[TODO_VIEW_MODE_KEY]);
    todos = result.todos || [];
    const storageUpdates = {};
    let importedChanged = false;

    if (!result[EXAM_IMPORT_KEY]) {
      const imported = mergeMissingTodos(todos, buildExamImportTodos());
      todos = imported.todos;
      importedChanged = imported.changed;
      storageUpdates[EXAM_IMPORT_KEY] = true;
      if (importedChanged) {
        todoViewMode = 'all';
        storageUpdates[TODO_VIEW_MODE_KEY] = todoViewMode;
      }
    }

    let titleMigratedChanged = false;
    if (!result[EXAM_TITLE_MIGRATION_KEY]) {
      const migrated = migrateExamTitles(todos);
      todos = migrated.todos;
      titleMigratedChanged = migrated.changed;
      storageUpdates[EXAM_TITLE_MIGRATION_KEY] = true;
    }

    // Migrate: any already-completed todo without a timestamp gets a fresh window
    todos.forEach(todo => {
      if (todo.completed && !todo.completedAt) {
        todo.completedAt = Date.now();
      }
    });
    const idsChanged = normalizeTodoIds();

    // Repeat 真循环: completed repeat todos whose next period has arrived flip
    // back to active right when the popup opens.
    const rolled = rolloverRepeatTodos(todos, Date.now());
    const rolledChanged = rolled.changed;
    if (rolledChanged) todos = rolled.todos;

    purgeExpiredCompleted();
    if (importedChanged || titleMigratedChanged || idsChanged || rolledChanged) {
      saveTodos(storageUpdates);
    } else if (Object.keys(storageUpdates).length > 0) {
      chrome.storage.local.set(storageUpdates);
    }
    renderTodos();
    scheduleAllFadeTimers();
  });
}
