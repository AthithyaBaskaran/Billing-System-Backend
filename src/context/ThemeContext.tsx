import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { getDesignTokens } from '../theme/theme';

type ThemeContextType = {
  mode: PaletteMode;
  toggleColorMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Try to get the saved theme from localStorage, default to 'light'
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as PaletteMode) || 'light';
  });

  // Create the theme based on the current mode
  const theme = React.useMemo(() => {
    let newTheme = createTheme(getDesignTokens(mode));
    newTheme = responsiveFontSizes(newTheme);
    return newTheme;
  }, [mode]);

  // Toggle between light and dark mode
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Save the theme preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const contextValue = {
    mode,
    toggleColorMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};