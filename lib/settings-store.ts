import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'ne';

interface Settings {
  theme: Theme;
  language: Language;
}

const SETTINGS_KEY = 'app.settings.v1';

const defaultSettings: Settings = {
  theme: 'dark',
  language: 'en',
};

export const getSettings = async (): Promise<Settings> => {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : defaultSettings;
  } catch (error) {
    console.error('Failed to get settings:', error);
    return defaultSettings;
  }
};

export const saveSettings = async (settings: Partial<Settings>): Promise<Settings> => {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
};

export const setTheme = async (theme: Theme): Promise<void> => {
  await saveSettings({ theme });
};

export const setLanguage = async (language: Language): Promise<void> => {
  await saveSettings({ language });
};
