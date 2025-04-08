import { Switch } from 'antd';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useAppContext } from '../context/AppContext';

const Header = () => {
  const { settings, updateSettings } = useAppContext();

  const toggleDarkMode = (checked) => {
    updateSettings({ darkMode: checked });
    document.documentElement.classList.toggle('dark', checked);
  };

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          HabitHUB
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <Switch
          checked={settings.darkMode}
          onChange={toggleDarkMode}
          checkedChildren={<MoonIcon className="w-4 h-4" />}
          unCheckedChildren={<SunIcon className="w-4 h-4" />}
          className="bg-gray-300 dark:bg-gray-600"
        />
      </div>
    </header>
  );
};

export default Header; 