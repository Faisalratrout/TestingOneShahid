# TodoSmtnApp

A modern, feature-rich todo application built with React, TypeScript, and Redux Toolkit.

## 🚀 Quick Start

```bash
# Navigate to the project
cd todosmtnapp

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## ✨ Features

- 📝 Create, edit, and manage todos with real-time updates
- 🔍 Smart filtering (All, Active, Completed tasks)
- 🎨 Light/Dark theme support with system preference detection
- 💾 Auto-save with import/export functionality
- 👤 User profiles with customizable avatars and statistics
- 📱 Fully responsive design that works on all devices
- ♿ Full accessibility support with keyboard navigation
- 🔄 Data migration and backward compatibility

## 🏗️ Tech Stack

- **React 19** + TypeScript for type safety
- **Redux Toolkit** for efficient state management
- **CSS Variables** for dynamic theming
- **LocalStorage** for data persistence
- **Modern CSS** with flexbox and responsive design

## 📦 Project Structure

```
src/
├── components/     # React components
│   ├── TodoForm.tsx     # Task creation
│   ├── TodoList.tsx     # Task container
│   ├── TodoItem.tsx     # Individual tasks
│   ├── FilterButtons.tsx # Task filtering
│   ├── UserProfile.tsx   # User settings
│   └── ...
├── store/         # Redux store & slices
├── utils/         # Storage utilities
├── contexts/      # React contexts
└── selectors/     # Memoized state selectors
```

## 🎯 Key Features Explained

### Task Management
- **Create**: Type and press Enter or click "Add Task"
- **Edit**: Double-click any task to edit inline
- **Complete**: Click checkbox to mark done/undone
- **Delete**: Click delete button to remove tasks
- **Filter**: Use All/Active/Completed buttons

### User Profiles
- **Customizable Avatars**: Choose from 8+ colors
- **Statistics Tracking**: Total tasks, completion rate, streaks
- **Preferences**: Theme, notifications, auto-save settings
- **Data Export/Import**: Full backup and restore capability

### Responsive Design
- **No Media Queries**: Uses modern CSS techniques
- **Flexbox Layout**: Automatic responsive behavior
- **Fluid Typography**: CSS clamp() for scaling text
- **Touch Friendly**: Optimized for mobile interaction

## 🚀 Development

### Available Scripts
- `npm start` - Development server (http://localhost:3000)
- `npm run build` - Production build
- `npm test` - Run test suite

### Code Quality
- **TypeScript** for type safety
- **React.memo** for performance optimization
- **Custom hooks** for logic reuse
- **Memoized selectors** for efficient state access

---

**Built with ❤️ by Faisal Ratrout**

Part of the [TestingOneShahid](https://github.com/Faisalratrout/TestingOneShahid) repository.
