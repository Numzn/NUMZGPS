import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import { List } from 'react-window';
import { Box, Typography, Chip, Divider } from '@mui/material';
import { devicesActions } from '../store';
import { useEffectAsync } from '../reactHelper';
import DeviceRow from './DeviceRow';
import fetchOrThrow from '../common/util/fetchOrThrow';
import EmptyState from '../common/components/EmptyState';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
  },
  statsBar: {
    display: 'flex',
    gap: theme.spacing(0.5),
    padding: theme.spacing(1, 1.25),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: 'rgba(6, 182, 212, 0.03)',
    flexWrap: 'wrap',
  },
  statChip: {
    fontWeight: 600,
    fontSize: '0.75rem',
    height: '24px',
    '& .MuiChip-label': {
      padding: theme.spacing(0, 1),
    },
  },
  sectionHeader: {
    padding: theme.spacing(1, 2, 0.5, 2),
    marginTop: theme.spacing(0.5),
  },
  sectionTitle: {
    fontSize: '0.688rem',
    fontWeight: 700,
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    color: theme.palette.text.secondary,
    opacity: 0.6,
  },
  listContainer: {
    flex: 1,
    position: 'relative',
  },
  list: {
    height: '100%',
    direction: theme.direction,
    // Custom scrollbar
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(6, 182, 212, 0.2)',
      borderRadius: '3px',
      '&:hover': {
        backgroundColor: 'rgba(6, 182, 212, 0.3)',
      },
    },
  },
  listInner: {
    position: 'relative',
    margin: theme.spacing(0.25, 0),
  },
}));

const DeviceList = ({ devices }) => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const positions = useSelector((state) => state.session.positions);

  const [, setTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 60000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffectAsync(async () => {
    const response = await fetchOrThrow('/api/devices');
    dispatch(devicesActions.refresh(await response.json()));
  }, []);

  // Group devices by status
  const groupedDevices = useMemo(() => {
    const groups = {
      online: [],
      offline: [],
      unknown: [],
    };

    devices.forEach((device) => {
      const status = device.status || 'unknown';
      if (groups[status]) {
        groups[status].push(device);
      }
    });

    return groups;
  }, [devices]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = devices.length;
    const online = groupedDevices.online.length;
    const moving = Object.values(positions).filter(p => p.speed > 0).length;
    const idling = online - moving;

    return { total, online, moving, idling, offline: groupedDevices.offline.length };
  }, [devices, groupedDevices, positions]);

  if (devices.length === 0) {
    return (
      <Box className={classes.root}>
        <EmptyState
          icon="🚗"
          title="No Vehicles"
          message="Click the + button to add your first vehicle"
          actionLabel="Add Vehicle"
          onAction={() => {/* Navigation handled by MainToolbar */}}
        />
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      {/* Statistics Bar */}
      <Box className={classes.statsBar}>
        <Chip
          label={`${stats.total} Total`}
          size="small"
          className={classes.statChip}
          color="default"
        />
        <Chip
          label={`${stats.moving} Moving`}
          size="small"
          className={classes.statChip}
          color="success"
        />
        <Chip
          label={`${stats.idling} Idle`}
          size="small"
          className={classes.statChip}
          color="warning"
        />
        <Chip
          label={`${stats.offline} Offline`}
          size="small"
          className={classes.statChip}
          color="error"
        />
      </Box>

      {/* Device List */}
      <Box className={classes.listContainer}>
        <div 
          className={classes.list}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <List
            className={classes.list}
            rowComponent={DeviceRow}
            rowCount={devices.length}
            rowHeight={72}
            rowProps={{ devices }}
            overscanCount={5}
            innerElementType={({ children, ...props }) => (
              <div {...props} className={classes.listInner}>
                {children}
              </div>
            )}
          />
        </div>
      </Box>
    </Box>
  );
};

export default DeviceList;
