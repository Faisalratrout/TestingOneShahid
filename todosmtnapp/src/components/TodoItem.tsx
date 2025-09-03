import React, { useState, useCallback, memo, useMemo } from 'react';
import { Todo } from '../store/todoSlice';
import './TodoItem.css';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = memo(({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleEdit = useCallback(() => {
    if (isEditing && editText.trim() !== todo.text) {
      onEdit(todo.id, editText);
    }
    setIsEditing(!isEditing);
  }, [isEditing, editText, todo.text, todo.id, onEdit]);

  const handleCancel = useCallback(() => {
    setEditText(todo.text);
    setIsEditing(false);
  }, [todo.text]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleEdit, handleCancel]);

  const handleToggle = useCallback(() => {
    onToggle(todo.id);
  }, [onToggle, todo.id]);

  const handleDelete = useCallback(() => {
    onDelete(todo.id);
  }, [onDelete, todo.id]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
  }, []);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const toggleLabel = useMemo(() => 
    `Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`
  , [todo.text, todo.completed]);

  const editLabel = useMemo(() => `Edit "${todo.text}"`, [todo.text]);
  const deleteLabel = useMemo(() => `Delete "${todo.text}"`, [todo.text]);

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="todo-checkbox"
          aria-label={toggleLabel}
        />
        
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onBlur={handleEdit}
            className="edit-input"
            autoFocus
            aria-label="Edit todo text"
          />
        ) : (
          <span 
            className="todo-text"
            onDoubleClick={handleDoubleClick}
            title="Double-click to edit"
          >
            {todo.text}
          </span>
        )}
      </div>
      
      <div className="todo-actions">
        {isEditing ? (
          <>
            <button
              onClick={handleEdit}
              className="save-button"
              aria-label="Save changes"
            >
              ✓
            </button>
            <button
              onClick={handleCancel}
              className="cancel-button"
              aria-label="Cancel editing"
            >
              ✕
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleDoubleClick}
              className="edit-button"
              aria-label={editLabel}
            >
              ✎
            </button>
            <button
              onClick={handleDelete}
              className="delete-button"
              aria-label={deleteLabel}
            >
              🗑
            </button>
          </>
        )}
      </div>
    </div>
  );
});

TodoItem.displayName = 'TodoItem';

export default TodoItem;
