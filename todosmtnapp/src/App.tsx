import React, { useEffect, useCallback, useMemo, useState } from 'react';
import './App.css';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import FilterButtons from './components/FilterButtons';
import UserProfile from './components/UserProfile';
import WelcomeBackNotification from './components/WelcomeBackNotification';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { 
  addTodo, 
  toggleTodo, 
  deleteTodo, 
  editTodo, 
  clearCompleted, 
  setFilter, 
  loadTodos 
} from './store/todoSlice';
import { 
  incrementTotalTasks,
  incrementCompletedTasks,
  decrementCompletedTasks,
  decrementTotalTasks,
  openProfileModal,
  closeProfileModal,
  loadUserProfile,
  initializeUserProfile, 
} from './store/userSlice';
import {
  selectFilteredTodos,
  selectActiveTodosCount,
  selectCompletedTodosCount,
  selectTotalTodosCount,
  selectCompletionPercentage,
  selectHasCompletedTodos,
} from './selectors/todoSelectors';
import {
  selectUserDisplayInfo,
  selectIsProfileModalOpen
} from './selectors/userSelectors';
import AppStorage from './utils/storage';

const MemoizedTodoForm = React.memo(TodoForm);
const MemoizedTodoList = React.memo(TodoList);
const MemoizedFilterButtons = React.memo(FilterButtons);
const MemoizedUserProfile = React.memo(UserProfile);
const MemoizedWelcomeBackNotification = React.memo(WelcomeBackNotification);

function App() {
  const dispatch = useAppDispatch();
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  
  const filteredTodos = useAppSelector(selectFilteredTodos);
  const activeCount = useAppSelector(selectActiveTodosCount);
  const completedCount = useAppSelector(selectCompletedTodosCount);
  const totalCount = useAppSelector(selectTotalTodosCount);
  const completionPercentage = useAppSelector(selectCompletionPercentage);
  const hasCompletedTodos = useAppSelector(selectHasCompletedTodos);
  const currentFilter = useAppSelector(state => state.todos.filter);
  
  const userInfo = useAppSelector(selectUserDisplayInfo);
  const isProfileModalOpen = useAppSelector(selectIsProfileModalOpen);

  useEffect(() => {
    const loadAppData = () => {
      console.log('🚀 Loading app data...');
      const savedData = AppStorage.loadAppData();
      
      if (savedData) {
        if (savedData.todos && savedData.todos.length > 0) {
          dispatch(loadTodos(savedData.todos));
          console.log(`📝 Loaded ${savedData.todos.length} todos`);
        }
        
        if (savedData.userProfile) {
          dispatch(loadUserProfile(savedData.userProfile));
          console.log(`👤 Loaded profile for ${savedData.userProfile.name}`);
          
          const lastActive = new Date(savedData.userProfile.stats.lastActiveDate);
          const now = new Date();
          const timeDiff = now.getTime() - lastActive.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          
          if (hoursDiff > 1 && savedData.todos.length > 0) {
            setShowWelcomeBack(true);
          }
        }
        
        console.log(`📊 Last saved: ${new Date(savedData.lastSavedAt).toLocaleString()}`);
      } else {
        console.log('📝 No saved data found - fresh start!');
        dispatch(initializeUserProfile({
          name: 'Welcome User',
          joinDate: new Date().toISOString()
        }));
      }
    };

    loadAppData();
  }, [dispatch]);

  const allTodos = useAppSelector(state => state.todos.todos);
  const userProfile = useAppSelector(state => state.user.profile);
  
  useEffect(() => {
    if (allTodos.length > 0 || userProfile.name !== 'User') {
      console.log('💾 Saving app data...');
      AppStorage.saveAppData(allTodos, userProfile);
    }
  }, [allTodos, userProfile]);

  const handleAddTodo = useCallback((text: string) => {
    dispatch(addTodo(text));
    dispatch(incrementTotalTasks());
  }, [dispatch]);

  const handleToggleTodo = useCallback((id: string) => {
    const todo = allTodos.find(t => t.id === id);
    if (todo) {
      dispatch(toggleTodo(id));
      if (!todo.completed) {
        dispatch(incrementCompletedTasks());
      } else {
        dispatch(decrementCompletedTasks());
      }
    }
  }, [dispatch, allTodos]);

  const handleDeleteTodo = useCallback((id: string) => {
    const todo = allTodos.find(t => t.id === id);
    if (todo) {
      dispatch(deleteTodo(id));
      dispatch(decrementTotalTasks());
      if (todo.completed) {
        dispatch(decrementCompletedTasks());
      }
    }
  }, [dispatch, allTodos]);

  const handleEditTodo = useCallback((id: string, newText: string) => {
    dispatch(editTodo({ id, text: newText }));
  }, [dispatch]);

  const handleClearCompleted = useCallback(() => {
    dispatch(clearCompleted());
  }, [dispatch]);

  const handleFilterChange = useCallback((filter: import('./store/todoSlice').FilterType) => {
    dispatch(setFilter(filter));
  }, [dispatch]);

  const handleOpenProfile = useCallback(() => {
    dispatch(openProfileModal());
  }, [dispatch]);

  const handleCloseProfile = useCallback(() => {
    dispatch(closeProfileModal());
  }, [dispatch]);

  const quickStats = useMemo(() => [
    { number: activeCount, label: 'Active' },
    { number: completedCount, label: 'Done' },
    { number: totalCount, label: 'Total' }
  ], [activeCount, completedCount, totalCount]);

  return (
    <div className="App">
      <nav className="app-navbar">
        <div className="app-logo">
          TaskFlow
        </div>
        <div className="navbar-actions">
          <ThemeToggle />
          <div className="user-info">
            <span>{userInfo.greeting}</span>
            <div 
              className="user-avatar" 
              style={{ backgroundColor: userInfo.avatarColor }}
              onClick={handleOpenProfile}
              role="button"
              tabIndex={0}
              aria-label="Open user profile"
              onKeyDown={(e) => e.key === 'Enter' && handleOpenProfile()}
            >
              {userInfo.avatar}
            </div>
          </div>
        </div>
      </nav>

      <div className="main-content">
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Progress</h3>
            <div className="progress-ring">
              <div className="progress-content">
                <span className="progress-percentage">
                  {completionPercentage}%
                </span>
                <span className="progress-text">Complete</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Quick Stats</h3>
            <div className="quick-stats">
              {quickStats.map((stat, index) => (
                <div key={stat.label} className="quick-stat">
                  <span className="quick-stat-number">{stat.number}</span>
                  <span className="quick-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="content-area">
          <div className="content-header">
            <h1 className="page-title">My Tasks</h1>
            <p className="page-subtitle">Stay organized and get things done efficiently</p>
            
            <MemoizedTodoForm onAddTodo={handleAddTodo} />
            
            <MemoizedFilterButtons
              currentFilter={currentFilter}
              onFilterChange={handleFilterChange}
            />
          </div>

          <div className="content-body">
            <MemoizedTodoList
              todos={filteredTodos}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
              onEdit={handleEditTodo}
            />

            {hasCompletedTodos && (
              <button 
                className="clear-completed"
                onClick={handleClearCompleted}
                aria-label={`Clear ${completedCount} completed tasks`}
              >
                Clear Completed ({completedCount})
              </button>
            )}
          </div>
        </main>
      </div>
      
      <MemoizedUserProfile 
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfile}
      />
      
      <MemoizedWelcomeBackNotification
        userName={userInfo.name}
        tasksCount={totalCount}
        lastActiveDate={userProfile.stats.lastActiveDate}
        show={showWelcomeBack}
      />
    </div>
  );
}

const AppWithTheme: React.FC = () => {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
};

export default AppWithTheme;
