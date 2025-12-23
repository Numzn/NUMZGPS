import { useMemo } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, List, ListItem, ListItemIcon, ListItemText,
  Chip, Button, LinearProgress,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useSelector } from 'react-redux';
import WarningIcon from '@mui/icons-material/Warning';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SpeedIcon from '@mui/icons-material/Speed';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

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
    marginBottom: theme.spacing(2),
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  alertItem: {
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.spacing(1),
    borderLeft: '4px solid',
  },
  urgentAlert: {
    borderLeftColor: theme.palette.error.main,
  },
  warningAlert: {
    borderLeftColor: theme.palette.warning.main,
  },
  infoAlert: {
    borderLeftColor: theme.palette.info.main,
  },
  alertText: {
    fontSize: '0.875rem',
  },
  alertCount: {
    fontWeight: 700,
    fontSize: '1.1rem',
  },
  fuelMetric: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.spacing(1),
  },
  fuelLabel: {
    fontSize: '0.875rem',
    opacity: 0.8,
  },
  fuelValue: {
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  lowFuelItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(0.5),
    fontSize: '0.875rem',
  },
  budgetProgress: {
    marginTop: theme.spacing(2),
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  viewAllButton: {
    marginTop: theme.spacing(2),
    textTransform: 'none',
    borderRadius: theme.spacing(1),
  },
}));

const AlertsFuel = ({ devices, positions }) => {
  const { classes } = useStyles();
  const events = useSelector((state) => state.events.items);

  // Process alerts by priority
  const alertData = useMemo(() => {
    const alerts = {
      urgent: [],
      warning: [],
      info: [],
    };

    // Mock alert data based on events and positions
    const urgentAlerts = [
      { type: 'fuel', message: 'Fuel Request - Numz Tembo (12% fuel)', priority: 'urgent' },
      { type: 'fuel', message: 'Fuel Request - John Banda (14% fuel)', priority: 'urgent' },
      { type: 'fuel', message: 'Fuel Request - Alice Mwale (18% fuel)', priority: 'urgent' },
    ];

    const warningAlerts = [
      { type: 'speed', message: 'Overspeed - ZT-2456 (85 km/h in 60 zone)', priority: 'warning' },
      { type: 'brake', message: 'Harsh Braking - ZT-7890', priority: 'warning' },
    ];

    const infoAlerts = [
      { type: 'geofence', message: 'Geofence Exit - ZT-1122', priority: 'info' },
      { type: 'time', message: 'Late Start - ZT-3344', priority: 'info' },
      { type: 'route', message: 'Route Deviation - ZT-5566', priority: 'info' },
      { type: 'stop', message: 'Extended Stop - ZT-7788', priority: 'info' },
    ];

    alerts.urgent = urgentAlerts;
    alerts.warning = warningAlerts;
    alerts.info = infoAlerts;

    return alerts;
  }, [events, positions]);

  // Calculate fuel statistics
  const fuelData = useMemo(() => {
    // Mock fuel data - in real implementation, this would come from device attributes and calculations
    const dailyFuel = 245; // Liters
    const fuelCost = 15435; // Local currency
    const efficiency = 8.2; // km/L
    const monthlyBudget = 52000;
    const budgetUsed = (fuelCost * 30); // Monthly projection
    const budgetPercentage = Math.min((budgetUsed / monthlyBudget) * 100, 100);

    const lowFuelVehicles = [
      { id: 'ZT-2456', level: 12, range: 25 },
      { id: 'ZT-7890', level: 14, range: 42 },
      { id: 'ZT-1122', level: 18, range: 65 },
      { id: 'ZT-3344', level: 16, range: 38 },
      { id: 'ZT-5566', level: 19, range: 52 },
    ];

    return {
      dailyFuel,
      fuelCost,
      efficiency,
      budgetPercentage,
      lowFuelVehicles,
      monthlyBudget,
    };
  }, [devices]);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'fuel': return <LocalGasStationIcon fontSize="small" />;
      case 'speed': return <SpeedIcon fontSize="small" />;
      case 'geofence': return <GpsFixedIcon fontSize="small" />;
      case 'time': return <AccessTimeIcon fontSize="small" />;
      default: return <WarningIcon fontSize="small" />;
    }
  };

  const getAlertClass = (priority) => {
    switch (priority) {
      case 'urgent': return classes.urgentAlert;
      case 'warning': return classes.warningAlert;
      default: return classes.infoAlert;
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Alerts Section */}
      <Grid item xs={12} md={6}>
        <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <Box className={classes.header}>
              <Typography className={classes.title}>
                <WarningIcon />
                Active Alerts
              </Typography>
              <Chip
                label={alertData.urgent.length + alertData.warning.length + alertData.info.length}
                size="small"
                color="warning"
              />
            </Box>

            {/* Urgent Alerts */}
            {alertData.urgent.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  🔴 Fuel Requests ({alertData.urgent.length})
                </Typography>
                {alertData.urgent.slice(0, 3).map((alert, index) => (
                  <Box key={index} className={`${classes.alertItem} ${getAlertClass(alert.priority)}`}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getAlertIcon(alert.type)}
                      <Typography className={classes.alertText}>
                        {alert.message}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* Warning Alerts */}
            {alertData.warning.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="warning.main" gutterBottom>
                  ⚠️ Safety Alerts ({alertData.warning.length})
                </Typography>
                {alertData.warning.map((alert, index) => (
                  <Box key={index} className={`${classes.alertItem} ${getAlertClass(alert.priority)}`}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getAlertIcon(alert.type)}
                      <Typography className={classes.alertText}>
                        {alert.message}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* Info Alerts */}
            {alertData.info.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="info.main" gutterBottom>
                  🟡 Operational ({alertData.info.length})
                </Typography>
                {alertData.info.slice(0, 4).map((alert, index) => (
                  <Box key={index} className={`${classes.alertItem} ${getAlertClass(alert.priority)}`}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getAlertIcon(alert.type)}
                      <Typography className={classes.alertText}>
                        {alert.message}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            <Button
              variant="outlined"
              size="small"
              className={classes.viewAllButton}
              fullWidth
            >
              View All Alerts
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* Fuel Management Section */}
      <Grid item xs={12} md={6}>
        <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <Box className={classes.header}>
              <Typography className={classes.title}>
                <LocalGasStationIcon />
                Fuel Management
              </Typography>
              <Chip
                label="Today"
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>

            {/* Daily Fuel Metrics */}
            <Box className={classes.fuelMetric}>
              <Typography className={classes.fuelLabel}>
                📊 Today's Consumption
              </Typography>
              <Typography className={classes.fuelValue}>
                {fuelData.dailyFuel}L
              </Typography>
            </Box>

            <Box className={classes.fuelMetric}>
              <Typography className={classes.fuelLabel}>
                💰 Cost
              </Typography>
              <Typography className={classes.fuelValue}>
                K{fuelData.fuelCost.toLocaleString()}
              </Typography>
            </Box>

            <Box className={classes.fuelMetric}>
              <Typography className={classes.fuelLabel}>
                ⚡ Efficiency
              </Typography>
              <Typography className={classes.fuelValue}>
                {fuelData.efficiency} km/L
              </Typography>
            </Box>

            {/* Low Fuel Vehicles */}
            <Box mt={2} mb={2}>
              <Typography variant="subtitle2" color="error" gutterBottom>
                🔴 Low Fuel Vehicles ({fuelData.lowFuelVehicles.length})
              </Typography>
              {fuelData.lowFuelVehicles.slice(0, 3).map((vehicle, index) => (
                <Box key={index} className={classes.lowFuelItem}>
                  <Typography>
                    {vehicle.id}: {vehicle.level}%
                  </Typography>
                  <Typography color="textSecondary">
                    ({vehicle.range}km range)
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Budget Progress */}
            <Box className={classes.budgetProgress}>
              <Box className={classes.progressLabel}>
                <Typography variant="body2">
                  💰 Monthly Budget
                </Typography>
                <Typography variant="body2">
                  {Math.round(fuelData.budgetPercentage)}% used
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={fuelData.budgetPercentage}
                color={fuelData.budgetPercentage > 90 ? 'error' : fuelData.budgetPercentage > 75 ? 'warning' : 'success'}
                style={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="textSecondary" style={{ marginTop: 4, display: 'block' }}>
                K{(fuelData.fuelCost * 30).toLocaleString()} / K{fuelData.monthlyBudget.toLocaleString()}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              size="small"
              className={classes.viewAllButton}
              fullWidth
            >
              View Fuel Analytics
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AlertsFuel;























