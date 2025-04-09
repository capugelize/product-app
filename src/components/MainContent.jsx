import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import CalendarPage from '../pages/CalendarPage';
import CategoriesPage from '../pages/CategoriesPage';
import SettingsPage from '../pages/SettingsPage';

const MainContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default MainContent; 