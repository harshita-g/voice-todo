// Temporary in-memory storage for local testing
// Will be replaced with Vercel KV after deployment

let memoryTasks = [];

const todayKey = () => {
  const d = new Date();
  return `tasks:${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export async function getTasks() {
  return memoryTasks;
}

export async function addTask(text, source) {
  const newTask = {
    id: Date.now().toString(),
    text,
    source,
    done: false,
    createdAt: new Date().toISOString(),
  };
  memoryTasks.push(newTask);
  return newTask;
}

export async function toggleTask(id) {
  memoryTasks = memoryTasks.map(t =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  return memoryTasks;
}