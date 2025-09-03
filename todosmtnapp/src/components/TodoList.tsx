import React, { memo, useMemo } from 'react';
import TodoItem from './TodoItem';
import { Todo } from '../store/todoSlice';
import './TodoList.css';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

const TodoList: React.FC<TodoListProps> = memo(({ todos, onToggle, onDelete, onEdit }) => {
  const isEmpty = useMemo(() => todos.length === 0, [todos.length]);

  if (isEmpty) {
    return (
      <div className="empty-state">
        <p>No tasks yet. Add one above to get started!</p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
});

TodoList.displayName = 'TodoList';

export default TodoList;
