import { grey, green, indigo } from '@mui/material/colors';

const validatedColor = (color) => (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null);

export default (server, darkMode) => {
  if (darkMode) {
    // Professional dark mode with navy/cyan theme
    return {
      mode: 'dark',
      background: {
        default: '#0F172A',    // Deep navy
        paper: '#1E293B',       // Slate navy
      },
      primary: {
        main: '#06B6D4',       // Cyan
        light: '#22D3EE',      // Bright cyan
        dark: '#0891B2',       // Deep cyan
      },
      secondary: {
        main: '#0EA5E9',       // Sky blue
        light: '#38BDF8',
        dark: '#0284C7',
      },
      text: {
        primary: '#F1F5F9',    // Almost white
        secondary: '#94A3B8',  // Muted gray
      },
      success: {
        main: '#10B981',       // Professional green
        light: '#34D399',
      },
      warning: {
        main: '#F59E0B',       // Amber
        light: '#FBBF24',
      },
      error: {
        main: '#EF4444',       // Coral red
        light: '#F87171',
      },
      divider: 'rgba(255, 255, 255, 0.1)',
      neutral: {
        main: grey[500],
      },
      geometry: {
        main: '#06B6D4',       // Cyan for geometry
      },
      alwaysDark: {
        main: '#1E293B',
      }
    };
  } else {
    // Professional light mode
    return {
      mode: 'light',
      background: {
        default: '#F8FAFC',    // Subtle gray background
        paper: '#FFFFFF',      // Clean white cards
      },
      primary: {
        main: '#3B82F6',       // Professional blue
        light: '#60A5FA',
        dark: '#2563EB',
      },
      secondary: {
        main: '#06B6D4',       // Teal accent for success/active states
        light: '#22D3EE',
        dark: '#0891B2',
      },
      text: {
        primary: '#1E293B',    // Charcoal text
        secondary: '#64748B',  // Muted gray text
      },
      success: {
        main: '#10B981',       // Professional green
        light: '#34D399',
      },
      warning: {
        main: '#F59E0B',       // Amber
        light: '#FBBF24',
      },
      error: {
        main: '#EF4444',       // Coral red
        light: '#F87171',
      },
      divider: 'rgba(0, 0, 0, 0.06)',
      neutral: {
        main: grey[500],
      },
      geometry: {
        main: '#3B82F6',
      },
      alwaysDark: {
        main: '#1E293B',
      }
    };
  }
};
