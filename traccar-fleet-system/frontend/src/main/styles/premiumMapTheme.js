import { createTheme } from '@mui/material/styles';

// Premium Map Theme with Glass Morphism and Modern Styling
export const premiumMapTheme = createTheme({
  palette: {
    primary: {
      main: '#06b6d4',
      light: '#67e8f9',
      dark: '#0891b2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: 'rgba(255, 255, 255, 0.95)',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.05)',
    '0 4px 6px rgba(0, 0, 0, 0.05)',
    '0 8px 12px rgba(0, 0, 0, 0.08)',
    '0 12px 16px rgba(0, 0, 0, 0.1)',
    '0 16px 24px rgba(0, 0, 0, 0.12)',
    '0 20px 32px rgba(0, 0, 0, 0.15)',
    '0 24px 40px rgba(0, 0, 0, 0.18)',
    '0 28px 48px rgba(0, 0, 0, 0.2)',
    '0 32px 56px rgba(0, 0, 0, 0.22)',
    '0 36px 64px rgba(0, 0, 0, 0.24)',
    '0 40px 72px rgba(0, 0, 0, 0.26)',
    '0 44px 80px rgba(0, 0, 0, 0.28)',
    '0 48px 88px rgba(0, 0, 0, 0.3)',
    '0 52px 96px rgba(0, 0, 0, 0.32)',
    '0 56px 104px rgba(0, 0, 0, 0.34)',
    '0 60px 112px rgba(0, 0, 0, 0.36)',
    '0 64px 120px rgba(0, 0, 0, 0.38)',
    '0 68px 128px rgba(0, 0, 0, 0.4)',
    '0 72px 136px rgba(0, 0, 0, 0.42)',
    '0 76px 144px rgba(0, 0, 0, 0.44)',
    '0 80px 152px rgba(0, 0, 0, 0.46)',
    '0 84px 160px rgba(0, 0, 0, 0.48)',
    '0 88px 168px rgba(0, 0, 0, 0.5)',
    '0 92px 176px rgba(0, 0, 0, 0.52)',
  ],
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  components: {
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        },
        elevation3: {
          boxShadow: '0 8px 12px rgba(0, 0, 0, 0.08)',
        },
        elevation4: {
          boxShadow: '0 12px 16px rgba(0, 0, 0, 0.1)',
        },
        elevation5: {
          boxShadow: '0 16px 24px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&.Mui-focused': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.15)',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
  },
});

// Premium Map Styles for specific components
export const premiumMapStyles = {
  topBar: {
    height: 64,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  floatingCard: {
    borderRadius: 16,
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(6, 182, 212, 0.1)',
  },
  
  searchResults: {
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    border: '1px solid rgba(6, 182, 212, 0.1)',
  },
  
  filterPanel: {
    borderRadius: '0 16px 16px 0',
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    borderLeft: '1px solid rgba(6, 182, 212, 0.1)',
  },
  
  deviceQuickView: {
    borderRadius: 16,
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(6, 182, 212, 0.1)',
  },
  
  animations: {
    slideIn: {
      animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    fadeIn: {
      animation: 'fadeIn 0.2s ease-in',
    },
    slideUp: {
      animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    scaleIn: {
      animation: 'scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  glassMorphism: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  
  glassMorphismDark: {
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  
  premiumShadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.05)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.08)',
    large: '0 8px 24px rgba(0, 0, 0, 0.12)',
    xlarge: '0 16px 48px rgba(0, 0, 0, 0.15)',
    xxlarge: '0 24px 64px rgba(0, 0, 0, 0.2)',
  },
  
  premiumGradients: {
    primary: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    secondary: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  },
  
  responsiveBreakpoints: {
    mobile: {
      topBarHeight: 56,
      searchWidth: '100%',
      deviceCardWidth: '95%',
    },
    tablet: {
      topBarHeight: 60,
      searchWidth: '300px',
      deviceCardWidth: '85%',
    },
    desktop: {
      topBarHeight: 64,
      searchWidth: '400px',
      deviceCardWidth: '700px',
    },
  },
};

// CSS Keyframes for animations
export const premiumAnimations = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translateY(0);
    }
    40%, 43% {
      transform: translateY(-8px);
    }
    70% {
      transform: translateY(-4px);
    }
    90% {
      transform: translateY(-2px);
    }
  }
`;

// Utility functions for premium styling
export const getPremiumStyles = (component, variant = 'default') => {
  const styles = {
    topBar: premiumMapStyles.topBar,
    floatingCard: premiumMapStyles.floatingCard,
    searchResults: premiumMapStyles.searchResults,
    filterPanel: premiumMapStyles.filterPanel,
    deviceQuickView: premiumMapStyles.deviceQuickView,
  };
  
  return styles[component] || {};
};

export const getResponsiveStyles = (breakpoint) => {
  return premiumMapStyles.responsiveBreakpoints[breakpoint] || premiumMapStyles.responsiveBreakpoints.desktop;
};

export const getGlassMorphism = (dark = false) => {
  return dark ? premiumMapStyles.glassMorphismDark : premiumMapStyles.glassMorphism;
};

export const getPremiumShadow = (size = 'medium') => {
  return premiumMapStyles.premiumShadows[size] || premiumMapStyles.premiumShadows.medium;
};

export const getPremiumGradient = (type = 'primary') => {
  return premiumMapStyles.premiumGradients[type] || premiumMapStyles.premiumGradients.primary;
};

export default premiumMapTheme;
