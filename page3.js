var taskInput = document.getElementById("taskInput");
var addTaskBtn = document.getElementById("addTaskBtn");
var todoList = document.getElementById("todoList");
var taskBadge = document.getElementById("taskBadge");
var clearCompletedBtn = document.getElementById("clearCompletedBtn");
var markAllBtn = document.getElementById("markAllBtn");
var domStatus = document.getElementById("domStatus");

var storageKey = "page3Tasks";
var tasks = [];
var nextId = 1;

function loadTasks() {
  var saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      var parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        tasks = parsed;
      }
    } catch (error) {
      tasks = [];
    }
  }

  if (tasks.length === 0) {
    tasks = buildTasksFromDom();
  }

  normalizeTasks();
}

function buildTasksFromDom() {
  var domItems = todoList.querySelectorAll("li");
  var fromDom = [];
  var idCounter = 1;

  for (var i = 0; i < domItems.length; i++) {
    var item = domItems[i];
    var textEl = item.querySelector(".todo-text");
    var checkEl = item.querySelector(".todo-check");
    var text = textEl ? textEl.textContent.trim() : "";

    if (text === "") {
      continue;
    }

    var done = false;
    if (checkEl && checkEl.checked) {
      done = true;
    }
    if (item.classList.contains("done")) {
      done = true;
    }

    fromDom.push({ id: idCounter, text: text, done: done });
    idCounter += 1;
  }

  nextId = idCounter;
  return fromDom;
}

function normalizeTasks() {
  var normalized = [];
  var maxId = 0;

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i] || {};
    var text = String(task.text || "").trim();

    if (text === "") {
      continue;
    }

    var done = Boolean(task.done);
    var id = typeof task.id === "number" && isFinite(task.id) ? task.id : 0;
    if (id <= 0) {
      id = maxId + 1;
    }

    if (id > maxId) {
      maxId = id;
    }

    normalized.push({ id: id, text: text, done: done });
  }

  tasks = normalized;
  nextId = maxId + 1;
}

function saveTasks() {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function setDomStatus(message) {
  if (!domStatus) {
    return;
  }

  domStatus.textContent = message;
}

function updateBadge() {
  var remaining = 0;
  for (var i = 0; i < tasks.length; i++) {
    if (!tasks[i].done) {
      remaining += 1;
    }
  }

  var label = remaining + (remaining === 1 ? " Task" : " Tasks");
  taskBadge.textContent = label;
}

function updateButtons() {
  var hasTasks = tasks.length > 0;
  var hasCompleted = false;
  var allDone = hasTasks;

  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].done) {
      hasCompleted = true;
    } else {
      allDone = false;
    }
  }

  clearCompletedBtn.disabled = !hasCompleted;
  markAllBtn.disabled = !hasTasks;
  markAllBtn.textContent = allDone ? "Unmark All" : "Mark All Done";
}

function renderTasks() {
  todoList.innerHTML = "";

  if (tasks.length === 0) {
    var emptyRow = document.createElement("li");
    emptyRow.className = "empty-state";
    emptyRow.textContent = "No tasks yet.";
    todoList.appendChild(emptyRow);
    updateBadge();
    updateButtons();
    return;
  }

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];
    var item = document.createElement("li");
    item.className = task.done ? "todo-item done" : "todo-item";
    item.setAttribute("data-id", String(task.id));

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-check";
    checkbox.checked = task.done;

    var text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = task.text;

    item.appendChild(checkbox);
    item.appendChild(text);
    todoList.appendChild(item);
  }

  updateBadge();
  updateButtons();
}

function addTask() {
  var text = taskInput.value.trim();
  if (text === "") {
    taskInput.focus();
    return;
  }

  tasks.unshift({ id: nextId, text: text, done: false });
  nextId += 1;
  taskInput.value = "";
  renderTasks();
  saveTasks();
}

function setTaskDone(id, done) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].done = done;
      break;
    }
  }

  renderTasks();
  saveTasks();
}

function toggleTask(id) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].done = !tasks[i].done;
      break;
    }
  }

  renderTasks();
  saveTasks();
}

function clearCompleted() {
  var remaining = [];
  for (var i = 0; i < tasks.length; i++) {
    if (!tasks[i].done) {
      remaining.push(tasks[i]);
    }
  }

  tasks = remaining;
  renderTasks();
  saveTasks();
}

function toggleAll() {
  if (tasks.length === 0) {
    return;
  }

  var allDone = true;
  for (var i = 0; i < tasks.length; i++) {
    if (!tasks[i].done) {
      allDone = false;
      break;
    }
  }

  var nextState = !allDone;
  for (var j = 0; j < tasks.length; j++) {
    tasks[j].done = nextState;
  }

  renderTasks();
  saveTasks();
}

function getTaskIdFromTarget(target) {
  var row = target.closest("li");
  if (!row) {
    return null;
  }

  var id = Number(row.getAttribute("data-id"));
  if (!isFinite(id) || id <= 0) {
    return null;
  }

  return id;
}

function bindEvents() {
  addTaskBtn.addEventListener("click", function () {
    addTask();
  });

  addTaskBtn.addEventListener("mouseenter", function () {
    addTaskBtn.classList.add("dom-hover");
    setDomStatus("DOM: hover detected on Add button.");
  });

  addTaskBtn.addEventListener("mouseleave", function () {
    addTaskBtn.classList.remove("dom-hover");
    setDomStatus("DOM ready. Hover the Add button.");
  });

  taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addTask();
    }
  });

  todoList.addEventListener("change", function (event) {
    if (!event.target.classList.contains("todo-check")) {
      return;
    }

    var id = getTaskIdFromTarget(event.target);
    if (id === null) {
      return;
    }

    setTaskDone(id, event.target.checked);
  });

  todoList.addEventListener("click", function (event) {
    if (!event.target.classList.contains("todo-text")) {
      return;
    }

    var id = getTaskIdFromTarget(event.target);
    if (id === null) {
      return;
    }

    toggleTask(id);
  });

  clearCompletedBtn.addEventListener("click", function () {
    clearCompleted();
  });

  markAllBtn.addEventListener("click", function () {
    toggleAll();
  });
}

function initTodo() {
  loadTasks();
  renderTasks();
  bindEvents();
  saveTasks();
  setDomStatus("DOM ready. Hover the Add button.");
}

initTodo();
