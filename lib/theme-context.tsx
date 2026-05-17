import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from '@/hooks/use-color-scheme';
import { getSettings, setTheme as saveThemeToStorage, Theme } from '@/lib/settings-store';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
  colorScheme: 'light' | 'dark';
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const settings = await getSettings();
      setThemeState(settings.theme);
    } catch (error) {
      console.error('Failed to load theme:', error);
      setThemeState('system');
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      await saveThemeToStorage(newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  // Determine effective color scheme based on selected theme
  const effectiveSystem = systemColorScheme === 'dark' ? 'dark' : 'light';
  const colorScheme = (theme === 'system' ? effectiveSystem : theme) as 'light' | 'dark';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colorScheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
