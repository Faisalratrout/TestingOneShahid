import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

const selectTodos = (state: RootState) => state.todos.todos;
const selectFilter = (state: RootState) => state.todos.filter;

export const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  }
);

export const selectActiveTodosCount = createSelector(
  [selectTodos],
  (todos) => todos.filter(todo => !todo.completed).length
);

export const selectCompletedTodosCount = createSelector(
  [selectTodos],
  (todos) => todos.filter(todo => todo.completed).length
);

export const selectTotalTodosCount = createSelector(
  [selectTodos],
  (todos) => todos.length
);

export const selectCompletionPercentage = createSelector(
  [selectCompletedTodosCount, selectTotalTodosCount],
  (completed, total) => total > 0 ? Math.round((completed / total) * 100) : 0
);

export const selectHasCompletedTodos = createSelector(
  [selectCompletedTodosCount],
  (completedCount) => completedCount > 0
);

export { selectTodos, selectFilter };
