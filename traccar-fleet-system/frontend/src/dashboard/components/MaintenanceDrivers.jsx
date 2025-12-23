import { useMemo } from 'react';
import {
  Card, CardContent, Typography, Box, Grid, List, ListItem, ListItemText, 
  Button, Chip, LinearProgress, Avatar,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useSelector } from 'react-redux';
import BuildIcon from '@mui/icons-material/Build';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

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
  section: {
    marginBottom: theme.spacing(3),
    '&:last-child': {
      marginBottom: 0,
    },
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  maintenanceItem: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.spacing(1),
    borderLeft: '4px solid',
  },
  overdueItem: {
    borderLeftColor: theme.palette.error.main,
  },
  upcomingItem: {
    borderLeftColor: theme.palette.warning.main,
  },
  vehicleId: {
    fontWeight: 600,
    fontSize: '0.875rem',
  },
  maintenanceType: {
    fontSize: '0.875rem',
    opacity: 0.8,
  },
  overdueText: {
    fontSize: '0.75rem',
    color: theme.palette.error.main,
    fontWeight: 500,
  },
  scheduleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(0.5, 0),
    fontSize: '0.875rem',
  },
  dayLabel: {
    fontWeight: 600,
  },
  driverItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.spacing(1),
  },
  driverInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  driverName: {
    fontWeight: 600,
    fontSize: '0.875rem',
  },
  driverScore: {
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  performanceBar: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  performanceLabel: {
    fontSize: '0.75rem',
    minWidth: 60,
  },
  performanceCount: {
    fontSize: '0.75rem',
    fontWeight: 600,
    minWidth: 20,
    textAlign: 'center',
  },
  viewButton: {
    marginTop: theme.spacing(2),
    textTransform: 'none',
    borderRadius: theme.spacing(1),
  },
}));

const MaintenanceDrivers = ({ devices }) => {
  const { classes } = useStyles();

  // Mock maintenance data
  const maintenanceData = useMemo(() => {
    const overdue = [
      {
        vehicleId: 'Toyota Hilux ZT-2456',
        type: 'Oil Change',
        overdueDays: 2,
      },
      {
        vehicleId: 'Isuzu Truck ZT-7890',
        type: 'Brake Inspection',
        overdueDays: 1,
      },
      {
        vehicleId: 'Nissan Van ZT-1122',
        type: 'Tire Rotation',
        overdueDays: 3,
      },
    ];

    const weeklySchedule = [
      { day: 'Mon', count: 2 },
      { day: 'Tue', count: 3 },
      { day: 'Wed', count: 1 },
      { day: 'Thu', count: 2 },
      { day: 'Fri', count: 1 },
      { day: 'Sat', count: 0 },
      { day: 'Sun', count: 0 },
    ];

    return { overdue, weeklySchedule };
  }, [devices]);

  // Mock driver performance data
  const driverData = useMemo(() => {
    const drivers = [
      { name: 'Numz Tembo', score: 98, status: 'excellent' },
      { name: 'John Banda', score: 85, status: 'good' },
      { name: 'Alice Mwale', score: 92, status: 'excellent' },
      { name: 'Peter Phiri', score: 78, status: 'good' },
      { name: 'Mary Zulu', score: 65, status: 'needs_improvement' },
    ];

    const distribution = {
      excellent: 8,
      good: 12,
      needs_improvement: 5,
    };

    const topPerformer = drivers.reduce((prev, current) => 
      (prev.score > current.score) ? prev : current
    );

    const needsAttention = drivers.filter(d => d.score < 80).length;

    return { drivers, distribution, topPerformer, needsAttention };
  }, [devices]);

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 75) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const getDriverAvatar = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Box className={classes.header}>
          <Typography className={classes.title}>
            <BuildIcon />
            Maintenance & Driver Performance
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CalendarTodayIcon />}
            style={{ borderRadius: 8 }}
          >
            Schedule
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Maintenance Section */}
          <Grid item xs={12} md={6}>
            <Box className={classes.section}>
              <Typography className={classes.sectionTitle} color="error">
                🚨 Overdue Maintenance ({maintenanceData.overdue.length} vehicles)
              </Typography>
              
              {maintenanceData.overdue.map((item, index) => (
                <Box key={index} className={`${classes.maintenanceItem} ${classes.overdueItem}`}>
                  <Typography className={classes.vehicleId}>
                    {item.vehicleId}
                  </Typography>
                  <Typography className={classes.maintenanceType}>
                    {item.type}
                  </Typography>
                  <Typography className={classes.overdueText}>
                    ({item.overdueDays} day{item.overdueDays > 1 ? 's' : ''} overdue)
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box className={classes.section}>
              <Typography className={classes.sectionTitle}>
                📅 Upcoming This Week
              </Typography>
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                {maintenanceData.weeklySchedule.map((day, index) => (
                  <Box key={index} textAlign="center">
                    <Typography className={classes.dayLabel}>
                      {day.day}
                    </Typography>
                    <Chip
                      label={day.count}
                      size="small"
                      color={day.count > 0 ? 'primary' : 'default'}
                      style={{ marginTop: 4, minWidth: 32 }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Driver Performance Section */}
          <Grid item xs={12} md={6}>
            <Box className={classes.section}>
              <Typography className={classes.sectionTitle}>
                👥 Driver Performance Summary
              </Typography>
              
              <Box className={classes.driverItem} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <Box className={classes.driverInfo}>
                  <EmojiEventsIcon color="success" />
                  <Box>
                    <Typography className={classes.driverName}>
                      🏆 Top Performer: {driverData.topPerformer.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      ({driverData.topPerformer.score}% score)
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box className={classes.driverItem} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <Box className={classes.driverInfo}>
                  <WarningIcon color="error" />
                  <Box>
                    <Typography className={classes.driverName}>
                      ⚠️ Needs Attention: {driverData.needsAttention} drivers
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Score below 80%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box className={classes.section}>
              <Typography className={classes.sectionTitle}>
                📊 Performance Distribution
              </Typography>
              
              <Box className={classes.performanceBar}>
                <Typography className={classes.performanceLabel}>
                  Excellent
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(driverData.distribution.excellent / 25) * 100}
                  color="success"
                  style={{ flex: 1, height: 6, borderRadius: 3 }}
                />
                <Typography className={classes.performanceCount}>
                  {driverData.distribution.excellent}
                </Typography>
              </Box>

              <Box className={classes.performanceBar}>
                <Typography className={classes.performanceLabel}>
                  Good
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(driverData.distribution.good / 25) * 100}
                  color="warning"
                  style={{ flex: 1, height: 6, borderRadius: 3 }}
                />
                <Typography className={classes.performanceCount}>
                  {driverData.distribution.good}
                </Typography>
              </Box>

              <Box className={classes.performanceBar}>
                <Typography className={classes.performanceLabel}>
                  Needs Impr
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(driverData.distribution.needs_improvement / 25) * 100}
                  color="error"
                  style={{ flex: 1, height: 6, borderRadius: 3 }}
                />
                <Typography className={classes.performanceCount}>
                  {driverData.distribution.needs_improvement}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Grid container spacing={2} style={{ marginTop: 16 }}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              fullWidth
              className={classes.viewButton}
            >
              View Maintenance Schedule
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              fullWidth
              className={classes.viewButton}
            >
              View Driver Reports
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MaintenanceDrivers;























