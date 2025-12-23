import React from 'react';
import { 
  ListItemButton, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Typography, 
  Box, 
  Chip
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Battery60Icon from '@mui/icons-material/Battery60';
import Battery20Icon from '@mui/icons-material/Battery20';
import ErrorIcon from '@mui/icons-material/Error';
import SpeedIcon from '@mui/icons-material/Speed';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { formatStatus, formatPercentage } from '../../common/util/formatter';
import { useTranslation } from '../../common/components/LocalizationProvider';

dayjs.extend(relativeTime);

const useStyles = makeStyles()((theme) => ({
  deviceItem: {
    borderRadius: theme.spacing(0.5),
    margin: theme.spacing(0.25, 0.5),
    transition: 'all 0.15s',
    '&:hover': {
      backgroundColor: 'rgba(6, 182, 212, 0.08)',
    },
  },
  deviceItemSelected: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  avatar: {
    width: 32,
    height: 32,
    fontSize: '0.75rem',
  },
  primaryText: {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  secondaryText: {
    fontSize: '0.75rem',
    lineHeight: 1.2,
    marginTop: theme.spacing(0.25),
  },
  statusChip: {
    height: 20,
    fontSize: '0.65rem',
    fontWeight: 600,
  },
  batteryIcon: {
    fontSize: '0.875rem',
  },
  speedIcon: {
    fontSize: '0.875rem',
  },
}));

const DeviceItem = ({ 
  device, 
  selected = false, 
  onClick,
  compact = false 
}) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const t = useTranslation();
  
  // Get position from Redux store
  const position = useSelector((state) => state.session.positions[device.id]);

  if (!device) return null;

  const getBatteryIcon = (batteryLevel) => {
    if (batteryLevel > 80) return <BatteryFullIcon className={classes.batteryIcon} />;
    if (batteryLevel > 60) return <Battery60Icon className={classes.batteryIcon} />;
    if (batteryLevel > 20) return <Battery20Icon className={classes.batteryIcon} />;
    return <ErrorIcon className={classes.batteryIcon} />;
  };

  const getBatteryColor = (batteryLevel) => {
    if (batteryLevel > 20) return theme.palette.success.main;
    return theme.palette.error.main;
  };

  const formatLastUpdate = (time) => {
    if (!time) return t('sharedNever');
    return dayjs(time).fromNow();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return theme.palette.success.main;
      case 'offline': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  return (
    <ListItemButton
      className={`${classes.deviceItem} ${selected ? classes.deviceItemSelected : ''}`}
      onClick={onClick}
      sx={{
        py: compact ? 0.5 : 1,
        px: compact ? 1 : 1.5,
      }}
    >
      <ListItemAvatar>
        <Avatar 
          className={classes.avatar}
          sx={{ 
            backgroundColor: getStatusColor(device.status),
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 600
          }}
        >
          {device.name?.charAt(0)?.toUpperCase() || 'D'}
        </Avatar>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
            <Typography className={classes.primaryText} noWrap>
              {device.name || device.uniqueId}
            </Typography>
            <Chip
              label={formatStatus(device.status, t)}
              size="small"
              className={classes.statusChip}
              sx={{
                backgroundColor: getStatusColor(device.status),
                color: 'white',
                fontSize: '0.65rem',
                height: 18,
              }}
            />
          </Box>
        }
        secondary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {position?.speed > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                <SpeedIcon className={classes.speedIcon} />
                <Typography variant="caption">
                  {Math.round(position.speed)} km/h
                </Typography>
              </Box>
            )}
            
            {position?.batteryLevel && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                {getBatteryIcon(position.batteryLevel)}
                <Typography 
                  variant="caption" 
                  sx={{ color: getBatteryColor(position.batteryLevel) }}
                >
                  {formatPercentage(position.batteryLevel)}
                </Typography>
              </Box>
            )}

            <Typography variant="caption" color="text.secondary">
              {formatLastUpdate(position?.fixTime)}
            </Typography>
          </Box>
        }
      />
    </ListItemButton>
  );
};

export default DeviceItem;





