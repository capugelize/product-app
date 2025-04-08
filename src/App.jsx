import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { useAppContext } from './context/AppContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import CategoriesPage from './pages/CategoriesPage';
import PomodoroPage from './pages/PomodoroPage';
import SettingsPage from './pages/SettingsPage';
import AppContext from './context/AppContext';
import './App.css';

function App() {
  const { settings } = useAppContext();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
        components: {
          Layout: {
            headerBg: settings?.darkMode ? '#141414' : '#fff',
            bodyBg: settings?.darkMode ? '#000' : '#f0f2f5',
          },
        },
      }}
    >
      <div className={`app ${settings?.darkMode ? 'dark-mode' : ''}`}>
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
      <App />
    </AppContext>
  );
}
