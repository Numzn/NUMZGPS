import { useMemo } from 'react';
import {
  Card, CardContent, Typography, Box, Grid, LinearProgress, Chip,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const useStyles = makeStyles()((theme) => ({
  card: {
    background: 'rgba(15, 23, 35, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '14px',
    height: '100%',
  },
  cardContent: {
    padding: theme.spacing(3),
    '&:last-child': {
      paddingBottom: theme.spacing(3),
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3),
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.5),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.spacing(1),
  },
  statusLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontSize: '1rem',
    fontWeight: 600,
  },
  statusCount: {
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  locationSection: {
    marginTop: theme.spacing(3),
  },
  locationItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    borderRadius: theme.spacing(0.5),
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  },
  locationName: {
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  locationStats: {
    fontSize: '0.875rem',
    opacity: 0.8,
  },
  progressSection: {
    marginTop: theme.spacing(2),
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  // Status indicator colors
  movingIndicator: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.success.main,
  },
  idleIndicator: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.warning.main,
  },
  offlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.error.main,
  },
}));

const FleetStatus = ({ devices, positions }) => {
  const { classes } = useStyles();

  // Calculate fleet status statistics
  const fleetStats = useMemo(() => {
    const stats = { moving: 0, idle: 0, offline: 0, total: devices.length };
    
    devices.forEach((device) => {
      const position = positions.find(p => p.deviceId === device.id);
      if (!position) {
        stats.offline++;
      } else if (position.speed > 0) {
        stats.moving++;
      } else {
        stats.idle++;
      }
    });
    
    return stats;
  }, [devices, positions]);

  // Mock location-based breakdown (would come from groups/geofences in real implementation)
  const locationStats = useMemo(() => {
    const locations = [
      {
        name: 'Lusaka',
        total: Math.floor(devices.length * 0.4),
        moving: Math.floor(devices.length * 0.25),
        idle: Math.floor(devices.length * 0.1),
        offline: Math.floor(devices.length * 0.05),
      },
      {
        name: 'Ndola',
        total: Math.floor(devices.length * 0.35),
        moving: Math.floor(devices.length * 0.2),
        idle: Math.floor(devices.length * 0.1),
        offline: Math.floor(devices.length * 0.05),
      },
      {
        name: 'Kitwe',
        total: Math.floor(devices.length * 0.25),
        moving: Math.floor(devices.length * 0.15),
        idle: Math.floor(devices.length * 0.08),
        offline: Math.floor(devices.length * 0.02),
      },
    ];
    
    return locations;
  }, [devices]);

  // Calculate average idle time (mock data)
  const averageIdleTime = useMemo(() => {
    // In real implementation, this would be calculated from position history
    return Math.floor(Math.random() * 30) + 15; // 15-45 minutes
  }, []);

  const getProgressValue = (value, total) => (total > 0 ? (value / total) * 100 : 0);

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Box className={classes.header}>
          <Typography className={classes.title}>
            <TrendingUpIcon />
            Real-Time Fleet Status
          </Typography>
          <Chip
            label="Live"
            size="small"
            color="success"
            variant="outlined"
          />
        </Box>

        {/* Status Overview */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box className={classes.statusRow}>
              <Box className={classes.statusLabel}>
                <div className={classes.movingIndicator} />
                Moving
              </Box>
              <Typography className={classes.statusCount} style={{ color: '#10b981' }}>
                {fleetStats.moving}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box className={classes.statusRow}>
              <Box className={classes.statusLabel}>
                <div className={classes.idleIndicator} />
                Idle
              </Box>
              <Typography className={classes.statusCount} style={{ color: '#f59e0b' }}>
                {fleetStats.idle}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box className={classes.statusRow}>
              <Box className={classes.statusLabel}>
                <div className={classes.offlineIndicator} />
                Offline
              </Box>
              <Typography className={classes.statusCount} style={{ color: '#ef4444' }}>
                {fleetStats.offline}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Location Breakdown */}
        <Box className={classes.locationSection}>
          <Typography variant="h6" gutterBottom>
            Operations by Location
          </Typography>
          
          {locationStats.map((location, index) => (
            <Box key={index} className={classes.locationItem}>
              <Box className={classes.locationName}>
                <LocationOnIcon fontSize="small" />
                {location.name}
              </Box>
              <Box className={classes.locationStats}>
                {location.total} vehicles ({location.moving} moving, {location.idle} idle, {location.offline} offline)
              </Box>
            </Box>
          ))}
        </Box>

        {/* Fleet Efficiency */}
        <Box className={classes.progressSection}>
          <Box className={classes.progressLabel}>
            <Typography variant="body2">
              <AccessTimeIcon fontSize="small" style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Average Idle Time
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {averageIdleTime} minutes
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min((averageIdleTime / 60) * 100, 100)}
            color={averageIdleTime > 30 ? 'warning' : 'success'}
            style={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default FleetStatus;

