import { useState } from 'react';

export default function AddTodo({ onAdd }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value);
    setValue('');
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What needs to be done?"
        style={{
          flex: 1,
          padding: '0.6rem 0.8rem',
          fontSize: '1rem',
          border: '1px solid #ccc',
          borderRadius: '6px',
        }}
      />
      <button
        type="submit"
        style={{
          padding: '0.6rem 1.2rem',
          fontSize: '1rem',
          background: '#4f46e5',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Add
      </button>
    </form>
  );
}
