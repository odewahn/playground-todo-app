export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        background: '#fff',
        borderRadius: '8px',
        marginBottom: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer', accentColor: '#4f46e5' }}
      />
      <span
        style={{
          flex: 1,
          fontSize: '1rem',
          textDecoration: todo.completed ? 'line-through' : 'none',
          color: todo.completed ? '#999' : '#222',
        }}
      >
        {todo.title}
      </span>
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
