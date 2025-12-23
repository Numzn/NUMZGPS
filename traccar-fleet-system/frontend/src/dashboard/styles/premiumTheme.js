// Premium theme system for dashboard
export const premiumTheme = {
  colors: {
    primary: {
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      solid: '#667eea',
      light: 'rgba(102, 126, 234, 0.1)',
      dark: '#5568d3',
    },
    success: {
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      solid: '#11998e',
      light: 'rgba(17, 153, 142, 0.1)',
      dark: '#0e8070',
    },
    warning: {
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      solid: '#f093fb',
      light: 'rgba(240, 147, 251, 0.1)',
      dark: '#d877de',
    },
    danger: {
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      solid: '#fa709a',
      light: 'rgba(250, 112, 154, 0.1)',
      dark: '#f85a87',
    },
    info: {
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      solid: '#4facfe',
      light: 'rgba(79, 172, 254, 0.1)',
      dark: '#3a8ed8',
    },
  },
  effects: {
    glassmorphism: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },
    glassmorphismDark: {
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(10px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    },
    // Theme-aware glassmorphism
    glassmorphismLight: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px) saturate(180%)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },
    elevation: {
      low: '0 2px 8px rgba(0, 0, 0, 0.08)',
      medium: '0 4px 16px rgba(0, 0, 0, 0.12)',
      high: '0 8px 32px rgba(0, 0, 0, 0.16)',
      ultra: '0 12px 48px rgba(0, 0, 0, 0.20)',
    },
    glow: {
      primary: '0 0 20px rgba(102, 126, 234, 0.3)',
      success: '0 0 20px rgba(17, 153, 142, 0.3)',
      warning: '0 0 20px rgba(240, 147, 251, 0.3)',
      danger: '0 0 20px rgba(250, 112, 154, 0.3)',
    },
  },
  animations: {
    smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    easeOut: 'all 0.3s ease-out',
    easeIn: 'all 0.3s ease-in',
  },
  borderRadius: {
    small: '8px',
    medium: '12px',
    large: '16px',
    xlarge: '24px',
    round: '50%',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
};

// Helper function to get gradient by type
export const getGradient = (type = 'primary') => {
  return premiumTheme.colors[type]?.gradient || premiumTheme.colors.primary.gradient;
};

// Helper function to get solid color by type
export const getSolidColor = (type = 'primary') => {
  return premiumTheme.colors[type]?.solid || premiumTheme.colors.primary.solid;
};

// Helper function to apply glassmorphism effect
export const applyGlassmorphism = (isDark = false) => {
  const glass = isDark ? premiumTheme.effects.glassmorphismDark : premiumTheme.effects.glassmorphism;
  return {
    background: glass.background,
    backdropFilter: glass.backdropFilter,
    border: glass.border,
    boxShadow: glass.boxShadow,
  };
};

export default premiumTheme;







