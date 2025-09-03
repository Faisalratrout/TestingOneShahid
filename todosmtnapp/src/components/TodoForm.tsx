import React, { useState, useCallback, memo } from 'react';
import './TodoForm.css';

interface TodoFormProps {
  onAddTodo: (text: string) => void;
}

const TodoForm: React.FC<TodoFormProps> = memo(({ onAddTodo }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTodo(inputValue);
      setInputValue('');
    }
  }, [inputValue, onAddTodo]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const isDisabled = !inputValue.trim();

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="What needs to be done?"
          className="todo-input"
          aria-label="Add new todo"
        />
        <button 
          type="submit" 
          className="add-button"
          disabled={isDisabled}
          aria-label="Add todo"
        >
          Add Task
        </button>
      </div>
    </form>
  );
});

TodoForm.displayName = 'TodoForm';

export default TodoForm;
