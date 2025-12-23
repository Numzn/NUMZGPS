import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import {
  IconButton, Tooltip, Avatar, ListItemAvatar, ListItemText, ListItemButton,
  Typography, Box, Chip,
} from '@mui/material';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import Battery60Icon from '@mui/icons-material/Battery60';
import BatteryCharging60Icon from '@mui/icons-material/BatteryCharging60';
import Battery20Icon from '@mui/icons-material/Battery20';
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';
import ErrorIcon from '@mui/icons-material/Error';
import SpeedIcon from '@mui/icons-material/Speed';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { devicesActions } from '../store';
import {
  formatAlarm, formatBoolean, formatPercentage, formatStatus, getStatusColor,
} from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { mapIconKey, mapIcons } from '../map/core/preloadImages';
import { useAdministrator } from '../common/util/permissions';
import EngineIcon from '../resources/images/data/engine.svg';
import { useAttributePreference } from '../common/util/preferences';

dayjs.extend(relativeTime);

const useStyles = makeStyles()((theme) => ({
  deviceItem: {
    borderRadius: theme.spacing(1),
    margin: theme.spacing(0, 0.75, 0.25, 0.75),
    padding: theme.spacing(0.875, 1),
    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    border: `1px solid transparent`,
    '&:hover': {
      backgroundColor: 'rgba(6, 182, 212, 0.05)',
      borderColor: 'rgba(6, 182, 212, 0.2)',
      transform: 'translateX(2px)',
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
  },
  deviceItemSelected: {
    backgroundColor: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    boxShadow: '0 2px 8px rgba(6, 182, 212, 0.25)',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      borderColor: theme.palette.primary.dark,
    },
    '& .MuiListItemText-primary': {
      color: theme.palette.primary.contrastText,
      fontWeight: 700,
    },
    '& .MuiListItemText-secondary': {
      color: theme.palette.primary.contrastText,
      opacity: 0.9,
    },
    '& .MuiAvatar-root': {
      backgroundColor: theme.palette.primary.contrastText,
    },
  },
  avatar: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  icon: {
    width: '18px',
    height: '18px',
    filter: 'brightness(0) saturate(100%) invert(70%) sepia(51%) saturate(2878%) hue-rotate(154deg) brightness(91%) contrast(101%)',
  },
  iconSelected: {
    filter: 'brightness(0) saturate(100%) invert(70%) sepia(51%) saturate(2878%) hue-rotate(154deg) brightness(91%) contrast(101%)',
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontSize: '0.7rem',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
  },
  deviceInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
  },
  deviceName: {
    fontWeight: 600,
    fontSize: '0.8rem',
    lineHeight: 1.2,
  },
  deviceMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontSize: '0.7rem',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  indicators: {
    display: 'flex',
    gap: theme.spacing(0.25),
  },
  success: {
    color: theme.palette.success.main,
  },
  warning: {
    color: theme.palette.warning.main,
  },
  error: {
    color: theme.palette.error.main,
  },
  neutral: {
    color: theme.palette.neutral.main,
  },
}));

const DeviceRow = ({ devices, index, style }) => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const admin = useAdministrator();
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);

  const item = devices[index];
  const position = useSelector((state) => state.session.positions[item.id]);

  const devicePrimary = useAttributePreference('devicePrimary', 'name');
  const deviceSecondary = useAttributePreference('deviceSecondary', '');

  const isSelected = selectedDeviceId === item.id;

  const getStatusDotColor = () => {
    switch (item.status) {
      case 'online':
        return '#10b981';
      case 'offline':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = () => {
    if (item.status === 'online' || !item.lastUpdate) {
      return formatStatus(item.status, t);
    }
    return dayjs(item.lastUpdate).fromNow();
  };

  const getSpeed = () => {
    if (position && position.speed > 0) {
      return `${Math.round(position.speed * 1.852)} km/h`; // Convert knots to km/h
    }
    return null;
  };

  return (
    <div style={style}>
      <ListItemButton
        onClick={() => dispatch(devicesActions.selectId(item.id))}
        disabled={!admin && item.disabled}
        className={`${classes.deviceItem} ${isSelected ? classes.deviceItemSelected : ''}`}
      >
        <ListItemAvatar>
          <Avatar className={classes.avatar}>
            <img 
              className={isSelected ? classes.iconSelected : classes.icon} 
              src={mapIcons[mapIconKey(item.category)]} 
              alt="" 
            />
          </Avatar>
        </ListItemAvatar>

        <Box className={classes.deviceInfo} sx={{ flex: 1, minWidth: 0 }}>
          <Typography className={classes.deviceName} noWrap>
            {item[devicePrimary]}
          </Typography>

          <Box className={classes.deviceMeta}>
            {/* Status Indicator */}
            <Box className={classes.statusIndicator}>
              <Box
                className={classes.statusDot}
                sx={{ backgroundColor: getStatusDotColor() }}
              />
              <Typography variant="caption" className={classes[getStatusColor(item.status)]}>
                {getStatusText()}
              </Typography>
            </Box>

            {/* Speed */}
            {getSpeed() && (
              <Box className={classes.metaItem}>
                <SpeedIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption" fontWeight={600}>
                  {getSpeed()}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Right Side Indicators */}
        <Box className={classes.indicators}>
          {position && (
            <>
              {position.attributes.hasOwnProperty('alarm') && (
                <Tooltip title={`${t('eventAlarm')}: ${formatAlarm(position.attributes.alarm, t)}`}>
                  <IconButton size="small">
                    <ErrorIcon fontSize="small" className={classes.error} />
                  </IconButton>
                </Tooltip>
              )}
              {position.attributes.hasOwnProperty('ignition') && (
                <Tooltip title={`${t('positionIgnition')}: ${formatBoolean(position.attributes.ignition, t)}`}>
                  <IconButton size="small">
                    {position.attributes.ignition ? (
                      <EngineIcon width={18} height={18} className={classes.success} />
                    ) : (
                      <EngineIcon width={18} height={18} className={classes.neutral} />
                    )}
                  </IconButton>
                </Tooltip>
              )}
              {position.attributes.hasOwnProperty('batteryLevel') && (
                <Tooltip title={`${t('positionBatteryLevel')}: ${formatPercentage(position.attributes.batteryLevel)}`}>
                  <IconButton size="small">
                    {(position.attributes.batteryLevel > 70 && (
                      position.attributes.charge
                        ? (<BatteryChargingFullIcon fontSize="small" className={classes.success} />)
                        : (<BatteryFullIcon fontSize="small" className={classes.success} />)
                    )) || (position.attributes.batteryLevel > 30 && (
                      position.attributes.charge
                        ? (<BatteryCharging60Icon fontSize="small" className={classes.warning} />)
                        : (<Battery60Icon fontSize="small" className={classes.warning} />)
                    )) || (
                      position.attributes.charge
                        ? (<BatteryCharging20Icon fontSize="small" className={classes.error} />)
                        : (<Battery20Icon fontSize="small" className={classes.error} />)
                    )}
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </Box>
      </ListItemButton>
    </div>
  );
};

export default DeviceRow;
