import { useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import palette from './palette';
import dimensions from './dimensions';
import components from './components';

export default (server, darkMode, direction) => useMemo(() => createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Segoe UI", "Helvetica Neue", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',        // 32px - Page headers
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.5rem',      // 24px - Section headers
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.25rem',     // 20px - Card titles
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',        // 16px - Main content
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',    // 14px - Secondary content
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',     // 12px - Labels, timestamps
      lineHeight: 1.4,
    },
    kpi: {
      fontSize: '2.5rem',      // 40px - Large KPI numbers
      fontWeight: 700,
      lineHeight: 1,
    },
  },
  palette: palette(server, darkMode),
  direction,
  dimensions,
  components,
}), [server, darkMode, direction]);
