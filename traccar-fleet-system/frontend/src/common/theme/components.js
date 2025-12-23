export default {
  MuiUseMediaQuery: {
    defaultProps: {
      noSsr: true,
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        borderRadius: '14px',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.875rem',
        padding: '10px 20px',
        transition: 'all 0.2s ease',
      },
      sizeMedium: {
        height: '44px',
      },
      contained: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        },
      },
      outlined: {
        borderWidth: '1.5px',
        '&:hover': {
          borderWidth: '1.5px',
        },
      },
    },
    variants: [
      {
        props: { variant: 'approve' },
        style: {
          backgroundColor: '#10b981',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#059669',
            transform: 'translateY(-1px)',
          },
        },
      },
      {
        props: { variant: 'reject' },
        style: {
          backgroundColor: '#ef4444',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#dc2626',
            transform: 'translateY(-1px)',
          },
        },
      },
    ],
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
        // Dark mode enhancements
        '&.MuiCard-root': {
          '&[data-theme="dark"]': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        },
      },
    },
    variants: [
      {
        props: { variant: 'priority' },
        style: {
          border: '2px solid #3b82f6',
          boxShadow: '0 4px 12px rgba(59,130,246,0.2)',
        },
      },
      {
        props: { variant: 'alert' },
        style: {
          borderLeft: '4px solid #ef4444',
        },
      },
      {
        props: { variant: 'hover' },
        style: {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          },
        },
      },
    ],
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        // Dark mode table borders
        '&[data-theme="dark"]': {
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
        // Light mode table borders
        '&[data-theme="light"]': {
          borderColor: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
  MuiFormControl: {
    defaultProps: {
      size: 'small',
    },
  },
  MuiSnackbar: {
    defaultProps: {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center',
      },
    },
  },
  MuiTooltip: {
    defaultProps: {
      enterDelay: 500,
      enterNextDelay: 500,
    },
  },
};
