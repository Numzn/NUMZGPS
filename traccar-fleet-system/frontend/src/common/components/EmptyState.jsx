import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    textAlign: 'center',
    minHeight: '200px',
  },
  icon: {
    fontSize: '4rem',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 500,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
    maxWidth: '300px',
  },
  action: {
    marginTop: theme.spacing(1),
  },
}));

const EmptyState = ({ 
  icon, 
  title = 'No data available', 
  subtitle = 'There are no items to display at the moment.', 
  action, 
  actionText,
  onAction 
}) => {
  const { classes } = useStyles();

  return (
    <Box className={classes.root}>
      {icon && (
        <Box className={classes.icon}>
          {icon}
        </Box>
      )}
      <Typography variant="h6" className={classes.title}>
        {title}
      </Typography>
      <Typography variant="body2" className={classes.subtitle}>
        {subtitle}
      </Typography>
      {action && (
        <Button 
          variant="outlined" 
          onClick={onAction}
          className={classes.action}
        >
          {actionText || 'Refresh'}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;