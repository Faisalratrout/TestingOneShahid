import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
createdAt: string; 
}

export type FilterType = 'all' | 'active' | 'completed';

interface TodoState {
  todos: Todo[];
  filter: FilterType;
}

const initialState: TodoState = {
  todos: [],
  filter: 'all',
};

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<string>) => {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: action.payload.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      state.todos.push(newTodo);
    },
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.todos.find(t => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    deleteTodo: (state, action: PayloadAction<string>) => {
      state.todos = state.todos.filter(t => t.id !== action.payload);
    },
    editTodo: (state, action: PayloadAction<{ id: string; text: string }>) => {
      const todo = state.todos.find(t => t.id === action.payload.id);
      if (todo) {
        todo.text = action.payload.text.trim();
      }
    },
    clearCompleted: (state) => {
      state.todos = state.todos.filter(t => !t.completed);
    },
    setFilter: (state, action: PayloadAction<FilterType>) => {
      state.filter = action.payload;
    },
    loadTodos: (state, action: PayloadAction<Todo[]>) => {
      state.todos = action.payload;
    },
  },
});

export const {
  addTodo,
  toggleTodo,
  deleteTodo,
  editTodo,
  clearCompleted,
  setFilter,
  loadTodos,
} = todoSlice.actions;

export default todoSlice.reducer;
