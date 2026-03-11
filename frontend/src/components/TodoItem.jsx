import { useState, useRef, useEffect } from 'react';

export default function TodoItem({
  todo, onToggle, onDelete, onEdit,
  isDragging, isDragOver,
  onDragStart, onDragOver, onDrop, onDragEnd,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function startEdit() {
    if (todo.completed) return;
    setDraft(todo.title);
    setEditing(true);
  }

  function commitEdit() {
    if (draft.trim() && draft.trim() !== todo.title) {
      onEdit(todo.id, draft.trim());
    }
    setEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') setEditing(false);
  }

  return (
    <li
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        background: '#fff',
        borderRadius: '8px',
        marginBottom: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        opacity: isDragging ? 0.4 : 1,
        borderTop: isDragOver ? '2px solid #4f46e5' : '2px solid transparent',
        cursor: 'grab',
      }}
    >
      <span style={{ color: '#ccc', fontSize: '1rem', userSelect: 'none' }}>⠿</span>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer', accentColor: '#4f46e5' }}
      />
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            fontSize: '1rem',
            border: 'none',
            borderBottom: '2px solid #4f46e5',
            outline: 'none',
            padding: '0.1rem 0',
            background: 'transparent',
          }}
        />
      ) : (
        <span
          onDoubleClick={startEdit}
          title={todo.completed ? undefined : 'Double-click to edit'}
          style={{
            flex: 1,
            fontSize: '1rem',
            textDecoration: todo.completed ? 'line-through' : 'none',
            color: todo.completed ? '#999' : '#222',
            cursor: todo.completed ? 'default' : 'text',
          }}
        >
          {todo.title}
        </span>
      )}
      <button
        onClick={() => onDelete(todo.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.1rem',
          color: '#ccc',
          lineHeight: 1,
          padding: '0 0.25rem',
        }}
        aria-label="Delete"
      >
        ×
      </button>
    </li>
  );
}
