// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8080/api/tasks"; // Java Spring Boot backend URL

// ─── STATE ───────────────────────────────────────────────────────────────────
let tasks = [];
let currentFilter = "all";

// ─── INIT (Page Load) ─────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", async () => {
  await fetchTasks();

  // Enter key → Add task
  document.getElementById("task-input").addEventListener("keydown", e => {
    if (e.key === "Enter") addTask();
  });
});

// ─── FETCH ALL TASKS from Backend ─────────────────────────────────────────────
async function fetchTasks() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error("Server error");
    tasks = await response.json();
    setApiStatus(true);
  } catch (error) {
    // Backend not running → use localStorage fallback
    console.warn("Backend not reachable. Using local storage.", error);
    setApiStatus(false);
    tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  }
  renderTasks();
}

// ─── ADD TASK ─────────────────────────────────────────────────────────────────
async function addTask() {
  const input = document.getElementById("task-input");
  const text = input.value.trim();

  if (!text) {
    showToast("Please enter a task!");
    return;
  }

  const newTask = {
    title: text,
    completed: false,
    createdAt: new Date().toISOString()
  };

  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask)
    });

    if (!response.ok) throw new Error("Failed to create");
    const savedTask = await response.json();
    tasks.push(savedTask);
  } catch (error) {
    // Fallback: save locally
    newTask.id = Date.now();
    tasks.push(newTask);
    saveToLocalStorage();
  }

  input.value = "";
  renderTasks();
  showToast("Task added! ✦");
}

// ─── TOGGLE COMPLETE ──────────────────────────────────────────────────────────
async function toggleTask(id) {
  const task = tasks.find(t => t.id == id);
  if (!task) return;

  task.completed = !task.completed;

  try {
    await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task)
    });
  } catch (error) {
    saveToLocalStorage();
  }

  renderTasks();
}

// ─── DELETE TASK ──────────────────────────────────────────────────────────────
async function deleteTask(id) {
  try {
    await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  } catch (error) {
    console.warn("Delete failed on server, removing locally.");
  }

  tasks = tasks.filter(t => t.id != id);
  saveToLocalStorage();
  renderTasks();
  showToast("Task removed.");
}

// ─── CLEAR ALL COMPLETED ──────────────────────────────────────────────────────
async function clearCompleted() {
  const completedTasks = tasks.filter(t => t.completed);

  if (completedTasks.length === 0) {
    showToast("No completed tasks!");
    return;
  }

  // Try server delete
  completedTasks.forEach(t => {
    fetch(`${API_BASE}/${t.id}`, { method: "DELETE" }).catch(() => {});
  });

  tasks = tasks.filter(t => !t.completed);
  saveToLocalStorage();
  renderTasks();
  showToast(`Cleared ${completedTasks.length} task(s).`);
}

// ─── CLEAR ALL TASKS ──────────────────────────────────────────────────────────
async function clearAllTasks() {
  if (tasks.length === 0) {
    showToast("No tasks to clear!");
    return;
  }

  // Confirmation dialog
  if (
    !confirm(
      "Are you sure you want to delete all tasks? This cannot be undone."
    )
  ) {
    return;
  }

  // Try server delete
  tasks.forEach(t => {
    fetch(`${API_BASE}/${t.id}`, { method: "DELETE" }).catch(() => {});
  });

  const count = tasks.length;
  tasks = [];
  saveToLocalStorage();
  renderTasks();
  showToast(`Cleared all ${count} task(s).`);
}

// ─── RENDER TASKS ────────────────────────────────────────────────────────────
function renderTasks() {
  const list = document.getElementById("task-list");
  const empty = document.getElementById("empty-state");

  // Apply filter
  let filtered = tasks;
  if (currentFilter === "pending") filtered = tasks.filter(t => !t.completed);
  if (currentFilter === "done") filtered = tasks.filter(t => t.completed);

  list.innerHTML = "";

  if (filtered.length === 0) {
    empty.classList.add("visible");
  } else {
    empty.classList.remove("visible");

    filtered.forEach((task, index) => {
      const item = document.createElement("div");
      item.className = "task-item" + (task.completed ? " done" : "");
      item.style.animationDelay = `${index * 0.05}s`;

      const dateStr = task.createdAt
        ? new Date(task.createdAt).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric"
          })
        : "";

      item.innerHTML = `
        <div class="custom-check" onclick="toggleTask(${task.id})">
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4L4 7.5L10 1" stroke="#120808ff" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="task-text">${escapeHtml(task.title)}</span>
        <span class="task-date">${dateStr}</span>
        <button class="delete-btn" onclick="deleteTask(${
          task.id
        })" title="Delete">✕</button>
      `;

      list.appendChild(item);
    });
  }

  updateStats();
}

// ─── UPDATE STATS ─────────────────────────────────────────────────────────────
function updateStats() {
  document.getElementById("count-total").textContent = tasks.length;
  document.getElementById("count-done").textContent = tasks.filter(
    t => t.completed
  ).length;
  document.getElementById("count-pending").textContent = tasks.filter(
    t => !t.completed
  ).length;
}

// ─── SET FILTER ───────────────────────────────────────────────────────────────
function setFilter(filter, btn) {
  currentFilter = filter;
  document
    .querySelectorAll(".filter-btn")
    .forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderTasks();
}

// ─── API STATUS BADGE ─────────────────────────────────────────────────────────
function setApiStatus(isOnline) {
  const dot = document.getElementById("api-dot");
  const label = document.getElementById("api-label");

  if (isOnline) {
    dot.classList.remove("offline");
    label.textContent = "Backend Connected";
  } else {
    dot.classList.add("offline");
    label.textContent = "Local Mode (No Backend)";
  }
}

// ─── LOCALSTORAGE FALLBACK ────────────────────────────────────────────────────
function saveToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ─── TOAST NOTIFICATION ───────────────────────────────────────────────────────
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

// ─── ESCAPE HTML (Security) ───────────────────────────────────────────────────
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
