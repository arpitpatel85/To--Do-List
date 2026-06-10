// ── State ──────────────────────────────────────────────
let tasks = [
  { id: 1, text: 'Buy groceries', done: false },
  { id: 2, text: 'Read for 20 minutes', done: false },
  { id: 3, text: 'Reply to emails', done: true },
];
let filter = 'all';
let nextId = 4;

// ── DOM refs ────────────────────────────────────────────
const taskInput = document.getElementById('task-input');
const addBtn    = document.getElementById('add-btn');
const listEl    = document.getElementById('task-list');
const countEl   = document.getElementById('task-count');
const clearBtn  = document.getElementById('clear-btn');
const dateLabel = document.getElementById('date-label');
const filterBtns = document.querySelectorAll('.filter-btn');

// ── Init ────────────────────────────────────────────────
dateLabel.textContent = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric'
});

// ── Render ──────────────────────────────────────────────
function render() {
  const visible = tasks.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'done')   return  t.done;
    return true;
  });

  listEl.innerHTML = '';

  if (visible.length === 0) {
    const msg =
      filter === 'done'   ? 'No completed tasks yet.' :
      filter === 'active' ? 'All caught up! 🎉' :
                            'No tasks yet. Add one above!';
    listEl.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📋</span>
        ${msg}
      </div>`;
  } else {
    visible.forEach(task => {
      const item = document.createElement('div');
      item.className = 'task-item' + (task.done ? ' done' : '');
      item.dataset.id = task.id;

      item.innerHTML = `
        <button class="check-btn ${task.done ? 'checked' : ''}"
          aria-label="${task.done ? 'Mark incomplete' : 'Mark complete'}">
          ${task.done ? '✓' : ''}
        </button>
        <span class="task-text" title="Double-click to edit">${escapeHTML(task.text)}</span>
        <button class="delete-btn" aria-label="Delete task">✕</button>
      `;

      item.querySelector('.check-btn').addEventListener('click', () => toggleTask(task.id));
      item.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
      item.querySelector('.task-text').addEventListener('dblclick', () => startEdit(task.id, item));

      listEl.appendChild(item);
    });
  }

  // Update footer count
  const activeCount = tasks.filter(t => !t.done).length;
  countEl.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`;
}

// ── Add task ────────────────────────────────────────────
function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    return;
  }
  tasks.unshift({ id: nextId++, text, done: false });
  taskInput.value = '';
  taskInput.focus();
  render();
}

// ── Toggle done ─────────────────────────────────────────
function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  render();
}

// ── Delete task ──────────────────────────────────────────
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  render();
}

// ── Inline edit ──────────────────────────────────────────
function startEdit(id, item) {
  const task    = tasks.find(t => t.id === id);
  const spanEl  = item.querySelector('.task-text');
  const editInput = document.createElement('input');

  editInput.type      = 'text';
  editInput.className = 'edit-input';
  editInput.value     = task.text;
  spanEl.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  function finishEdit() {
    const val = editInput.value.trim();
    if (val) task.text = val;
    render();
  }

  editInput.addEventListener('blur',    finishEdit);
  editInput.addEventListener('keydown', e => {
    if (e.key === 'Enter')  finishEdit();
    if (e.key === 'Escape') render();
  });
}

// ── Clear completed ──────────────────────────────────────
clearBtn.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  render();
});

// ── Filter buttons ────────────────────────────────────────
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

// ── Input events ─────────────────────────────────────────
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// ── Helpers ───────────────────────────────────────────────
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Initial render ─────────────────────────────────────────
render();
