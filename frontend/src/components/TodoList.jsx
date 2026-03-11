import { useState } from 'react';
import TodoItem from './TodoItem.jsx';

export default function TodoList({ todos, onToggle, onDelete, onEdit, onReorder }) {
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  if (!todos.length) {
    return (
      <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem 0' }}>
        No todos yet. Add one above!
      </p>
    );
  }

  const remaining = todos.filter((t) => !t.completed).length;

  function handleDragStart(id) {
    setDragId(id);
  }

  function handleDragOver(e, id) {
    e.preventDefault();
    if (id !== dragId) setDragOverId(id);
  }

  function handleDrop(targetId) {
    if (!dragId || dragId === targetId) return;
    const from = todos.findIndex((t) => t.id === dragId);
    const to = todos.findIndex((t) => t.id === targetId);
    const reordered = [...todos];
    reordered.splice(to, 0, reordered.splice(from, 1)[0]);
    onReorder(reordered.map((t) => t.id));
    setDragId(null);
    setDragOverId(null);
  }

  function handleDragEnd() {
    setDragId(null);
    setDragOverId(null);
  }

  return (
    <>
      <p style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: '#666' }}>
        {remaining} of {todos.length} remaining
      </p>
      <ul style={{ listStyle: 'none' }}>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
            isDragging={dragId === todo.id}
            isDragOver={dragOverId === todo.id}
            onDragStart={() => handleDragStart(todo.id)}
            onDragOver={(e) => handleDragOver(e, todo.id)}
            onDrop={() => handleDrop(todo.id)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </ul>
    </>
  );
}
