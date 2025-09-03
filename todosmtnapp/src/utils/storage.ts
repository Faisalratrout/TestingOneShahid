import { Todo } from '../store/todoSlice';
import { UserProfile } from '../store/userSlice';

export interface AppData {
  todos: Todo[];
  userProfile: UserProfile;
  lastSavedAt: string;
  version: string;
}

export class AppStorage {
  private static readonly STORAGE_KEY = 'todosmtnapp_data';
  private static readonly VERSION = '1.0.0';

  static saveAppData(todos: Todo[], userProfile: UserProfile): void {
    try {
      const appData: AppData = {
        todos,
        userProfile,
        lastSavedAt: new Date().toISOString(),
        version: this.VERSION,
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(appData));
      console.log(' App data saved successfully');
    } catch (error) {
      console.error(' Failed to save app data:', error);
    }
  }

  static loadAppData(): AppData | null {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (!savedData) {
        console.log('📁 No saved data found');
        return null;
      }

      const appData: AppData = JSON.parse(savedData);
      
      if (appData.version !== this.VERSION) {
        console.warn(' Version mismatch - migrating data');
        return this.migrateData(appData);
      }

      console.log(' App data loaded successfully');
      return appData;
    } catch (error) {
      console.error(' Failed to load app data:', error);
      return null;
    }
  }

  static clearAppData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🗑️ App data cleared');
    } catch (error) {
      console.error(' Failed to clear app data:', error);
    }
  }

  private static migrateData(oldData: any): AppData | null {
    try {
      if (!oldData.version) {
        const todos = this.loadLegacyTodos();
        const userProfile = this.loadLegacyUserProfile();
        
        if (todos || userProfile) {
          const migratedData: AppData = {
            todos: todos || [],
            userProfile: userProfile || this.getDefaultUserProfile(),
            lastSavedAt: new Date().toISOString(),
            version: this.VERSION,
          };
          
          this.saveAppData(migratedData.todos, migratedData.userProfile);
          this.cleanupLegacyStorage();

          console.log(' Data migration completed');
          return migratedData;
        }
      }
      
      return null;
    } catch (error) {
      console.error(' Data migration failed:', error);
      return null;
    }
  }

  private static loadLegacyTodos(): Todo[] | null {
    try {
      const savedTodos = localStorage.getItem('todos');
      return savedTodos ? JSON.parse(savedTodos) : null;
    } catch {
      return null;
    }
  }

  private static loadLegacyUserProfile(): UserProfile | null {
    try {
      const savedProfile = localStorage.getItem('userProfile');
      return savedProfile ? JSON.parse(savedProfile) : null;
    } catch {
      return null;
    }
  }

  private static cleanupLegacyStorage(): void {
    localStorage.removeItem('todos');
    localStorage.removeItem('userProfile');
    console.log('🧹 Legacy storage cleaned up');
  }

  private static getDefaultUserProfile(): UserProfile {
    return {
      id: Date.now().toString(),
      name: 'New User',
      email: 'user@example.com',
      avatar: 'NU',
      avatarColor: '#667eea',
      joinDate: new Date().toISOString(),
      preferences: {
        theme: 'light',
        notifications: true,
        autoSave: true,
        completionSound: true,
      },
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        streakDays: 0,
        lastActiveDate: new Date().toISOString(),
      },
    };
  }

  static exportAppData(): string {
    const appData = this.loadAppData();
    if (!appData) {
      throw new Error('No data to export');
    }
    return JSON.stringify(appData, null, 2);
  }

  static importAppData(dataString: string): boolean {
    try {
      const appData: AppData = JSON.parse(dataString);
      
      if (!this.validateAppData(appData)) {
        throw new Error('Invalid data structure');
      }
      
      this.saveAppData(appData.todos, appData.userProfile);
      console.log(' App data imported successfully');
      return true;
    } catch (error) {
      console.error(' Failed to import app data:', error);
      return false;
    }
  }

  private static validateAppData(data: any): data is AppData {
    return (
      data &&
      Array.isArray(data.todos) &&
      data.userProfile &&
      typeof data.userProfile === 'object' &&
      data.lastSavedAt &&
      data.version
    );
  }

  static getStorageInfo() {
    const appData = this.loadAppData();
    if (!appData) {
      return { hasData: false };
    }

    return {
      hasData: true,
      todosCount: appData.todos.length,
      userName: appData.userProfile.name,
      lastSaved: appData.lastSavedAt,
      version: appData.version,
      storageSize: new Blob([JSON.stringify(appData)]).size,
    };
  }
}

export default AppStorage;
