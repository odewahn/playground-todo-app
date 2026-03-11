import TodoItem from './TodoItem.jsx';

export default function TodoList({ todos, onToggle, onDelete }) {
  if (!todos.length) {
    return (
      <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem 0' }}>
        No todos yet. Add one above!
      </p>
    );
  }

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <>
      <p style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: '#666' }}>
        {remaining} of {todos.length} remaining
      </p>
      <ul style={{ listStyle: 'none' }}>
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </ul>
    </>
  );
}
