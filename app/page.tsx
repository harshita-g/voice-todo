"use client";
import { useState, useRef, useEffect } from "react";

interface Task {
  id: string;
  text: string;
  source: string;
  done: boolean;
  createdAt: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => setTasks(data.tasks || []));
  }, []);

  const startListening = () => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Use Chrome or Edge for voice input"); return; }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev + " " + transcript).trim());
    };
    rec.onend = () => setIsListening(false);
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setStatus("Extracting tasks with Gemini...");
    try {
      const processRes = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const { todos } = await processRes.json();
      setStatus("Saving tasks...");
      for (const todo of todos) {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: todo,
            source: isListening ? "voice" : "text",
          }),
        });
      }
      const listRes = await fetch("/api/tasks");
      const { tasks: updated } = await listRes.json();
      setTasks(updated);
      setInput("");
      setStatus(`✓ Added ${todos.length} task(s)`);
    } catch (err: any) {
      setStatus("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDone = async (id: string) => {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: "0 20px",
                   fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>🎙 VoiceTodo</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        Speak or type — AI extracts your tasks automatically
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or speak your notes..."
          rows={3}
          style={{ flex: 1, padding: 10, borderRadius: 8,
                   border: "1px solid #d1d5db", fontSize: 14 }}
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={isListening ? stopListening : startListening}
          style={{ padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                   background: isListening ? "#ef4444" : "#6366f1",
                   color: "white", border: "none", fontSize: 14 }}>
          {isListening ? "⏹ Stop" : "🎙 Record"}
        </button>
        <button onClick={handleSubmit} disabled={loading || !input.trim()}
          style={{ padding: "8px 20px", borderRadius: 8, cursor: "pointer",
                   background: "#10b981", color: "white", border: "none",
                   fontSize: 14, opacity: loading || !input.trim() ? 0.5 : 1 }}>
          {loading ? "Processing..." : "Add Tasks →"}
        </button>
      </div>

      {status && (
        <p style={{ color: "#6366f1", fontSize: 13, marginBottom: 12 }}>
          {status}
        </p>
      )}

      <div>
        {tasks.length === 0 && (
          <p style={{ color: "#9ca3af", textAlign: "center", padding: "40px 0" }}>
            No tasks yet — add one above
          </p>
        )}
        {tasks.map((task) => (
          <div key={task.id} onClick={() => toggleDone(task.id)}
            style={{ display: "flex", alignItems: "center", gap: 10,
                     padding: "10px 14px", marginBottom: 6, borderRadius: 8,
                     background: task.done ? "#f9fafb" : "white",
                     border: "1px solid #e5e7eb", cursor: "pointer" }}>
            <span style={{ fontSize: 18 }}>{task.done ? "✅" : "⬜"}</span>
            <span style={{ flex: 1,
                           textDecoration: task.done ? "line-through" : "none",
                           color: task.done ? "#9ca3af" : "#111827", fontSize: 14 }}>
              {task.text}
            </span>
            <span style={{ fontSize: 11, color: "#d1d5db" }}>
              {task.source === "voice" ? "🎙" : "⌨"}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}