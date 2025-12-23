import { useMemo } from 'react';
import { Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import WarningIcon from '@mui/icons-material/Warning';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import ModernKPICard from './ModernKPICard';

// Removed useStyles - using ModernKPICard instead

const KPICards = ({ devices, positions }) => {
  const events = useSelector((state) => state.events.items);

  // Calculate device statistics
  const deviceStats = useMemo(() => {
    const stats = { active: 0, idle: 0, offline: 0, total: devices.length };
    
    devices.forEach((device) => {
      const position = positions.find(p => p.deviceId === device.id);
      if (!position) {
        stats.offline++;
      } else if (position.speed > 0) {
        stats.active++;
      } else {
        stats.idle++;
      }
    });

    const activePercentage = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;
    
    return { ...stats, activePercentage };
  }, [devices, positions]);

  // Calculate alert statistics
  const alertStats = useMemo(() => {
    const stats = { urgent: 0, warning: 0, info: 0, total: events.length };
    
    events.forEach((event) => {
      if (event.type === 'alarm' || event.type === 'panic') {
        stats.urgent++;
      } else if (event.type === 'deviceOverspeed' || event.type === 'geofenceExit') {
        stats.warning++;
      } else {
        stats.info++;
      }
    });
    
    return stats;
  }, [events]);

  // Calculate fuel statistics
  const fuelStats = useMemo(() => {
    const dailyFuel = 245; // Liters
    const fuelPrice = 63; // Price per liter in Kwacha
    const monthlyTotal = dailyFuel * 30;
    const totalCost = Math.round(monthlyTotal * fuelPrice);
    
    return {
      monthlyTotal,
      totalCost,
      trend: '+8%',
    };
  }, []);

  return (
    <Grid container spacing={2.5} sx={{ alignItems: 'stretch', width: '100%' }}>
      <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
        <ModernKPICard
          value={deviceStats.total}
          label="Active Vehicles"
          progress={deviceStats.activePercentage}
          icon={<DirectionsCarIcon />}
          color="primary"
          sx={{ width: '100%' }}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
        <ModernKPICard
          value={alertStats.urgent}
          label="Urgent Alerts"
          icon={<WarningIcon />}
          color="danger"
          sx={{ width: '100%' }}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
        <ModernKPICard
          value={`K${fuelStats.totalCost.toLocaleString()}`}
          label="Monthly Fuel Cost"
          trend={fuelStats.trend}
          icon={<LocalGasStationIcon />}
          color="success"
          sx={{ width: '100%' }}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
        <ModernKPICard
          value={deviceStats.active}
          label="Online Now"
          progress={deviceStats.activePercentage}
          icon={<DirectionsCarIcon />}
          color="info"
          sx={{ width: '100%' }}
        />
      </Grid>
    </Grid>
  );
};

export default KPICards;

