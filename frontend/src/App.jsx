import { useState, useEffect } from 'react';
import AddTodo from './components/AddTodo.jsx';
import TodoList from './components/TodoList.jsx';

const API = '/api/todos';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then(setTodos)
      .catch(() => setError('Could not load todos. Is the backend running?'));
  }, []);

  async function handleAdd(title) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const todo = await res.json();
    setTodos((prev) => [todo, ...prev]);
  }

  async function handleToggle(id) {
    const res = await fetch(`${API}/${id}`, { method: 'PATCH' });
    const updated = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function handleDelete(id) {
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '2rem', fontWeight: 700 }}>Todos</h1>
      {error && (
        <p style={{ color: '#dc2626', marginBottom: '1rem', padding: '0.75rem', background: '#fef2f2', borderRadius: '6px' }}>
          {error}
        </p>
      )}
      <AddTodo onAdd={handleAdd} />
      <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />
    </div>
  );
}
