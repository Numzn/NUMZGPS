import React from 'react';
import { Chip } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  badge: {
    fontWeight: 500,
    fontSize: '0.75rem',
    height: '24px',
    borderRadius: '12px',
  },
  online: {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  },
  offline: {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
  idle: {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  },
  moving: {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.contrastText,
  },
  pending: {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.grey[700],
  },
  approved: {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  },
  rejected: {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
}));

const getStatusColor = (status) => {
  const statusMap = {
    online: 'online',
    offline: 'offline',
    idle: 'idle',
    moving: 'moving',
    pending: 'pending',
    approved: 'approved',
    rejected: 'rejected',
  };
  return statusMap[status?.toLowerCase()] || 'pending';
};

const StatusBadge = ({ 
  status, 
  label, 
  size = 'small',
  variant = 'filled',
  className 
}) => {
  const { classes } = useStyles();
  const statusClass = getStatusColor(status);
  
  return (
    <Chip
      label={label || status}
      size={size}
      variant={variant}
      className={`${classes.badge} ${classes[statusClass]} ${className || ''}`}
    />
  );
};

export default StatusBadge;