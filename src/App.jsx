import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, message } from 'antd';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import CategoriesPage from './pages/CategoriesPage';
import PomodoroPage from './pages/PomodoroPage';
import SettingsPage from './pages/SettingsPage';
import AppContext from './context/AppContext';
import { PomodoroProvider } from './context/PomodoroContext';
import './App.css';

// Configure message
message.config({
  top: 100,
  duration: 2,
  maxCount: 3,
});

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <div className="app">
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="pomodoro" element={<PomodoroPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </div>
    </ConfigProvider>
  );
}

export default function AppWithContext() {
  return (
    <AppContext>
      <PomodoroProvider>
        <App />
      </PomodoroProvider>
    </AppContext>
  );
}
