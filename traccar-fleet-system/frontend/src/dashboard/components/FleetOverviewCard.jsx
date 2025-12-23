import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box, Grid, LinearProgress, useTheme } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { styled } from '@mui/material/styles';
import { useSelector, shallowEqual } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  width: '100%',  // Add: Ensure full width
  borderRadius: '12px',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)'
    : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(0, 0, 0, 0.05)',
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)'
      : '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    transform: 'translateY(-1px)',
  },
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& svg': {
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1),
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 600,
  fontSize: '1.125rem',
}));

const StatItem = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
  borderRadius: '8px',
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
}));

const StatValue = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: '2rem',
  fontWeight: 700,
  lineHeight: 1,
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginTop: theme.spacing(1),
}));

// Memoized selector to prevent unnecessary re-renders
const selectDevices = createSelector(
  [(state) => state.devices.items],
  (items) => Object.values(items)
);

const FleetOverviewCard = (props) => {
  const theme = useTheme();
  const devices = useSelector(selectDevices, shallowEqual);
  const positions = useSelector((state) => state.session.positions, shallowEqual);
  
  // Calculate real fleet statistics
  const fleetStats = useMemo(() => {
    const total = devices.length;
    let online = 0;
    let moving = 0;
    let idling = 0;
    let offline = 0;
    
    devices.forEach((device) => {
      const position = Object.values(positions).find(p => p.deviceId === device.id);
      if (!position || device.status === 'offline') {
        offline++;
      } else if (device.status === 'online') {
        online++;
        if (position.speed > 0) {
          moving++;
        } else {
          idling++;
        }
      } else {
        offline++;
      }
    });
    
    return { total, online, moving, idling, offline };
  }, [devices, positions]);

  const onlinePercentage = fleetStats.total > 0 ? Math.round((fleetStats.online / fleetStats.total) * 100) : 0;
  const movingPercentage = fleetStats.total > 0 ? Math.round((fleetStats.moving / fleetStats.total) * 100) : 0;

  return (
    <StyledCard {...props}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Header>
          <DirectionsCarIcon />
          <Title variant="h6">
            Fleet Overview
          </Title>
        </Header>
        
        <Box sx={{ flex: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <StatItem>
                <StatValue>
                  {fleetStats.total}
                </StatValue>
                <StatLabel>
                  Total Vehicles
                </StatLabel>
              </StatItem>
            </Grid>
            
            <Grid item xs={6}>
              <StatItem>
                <StatValue>
                  {fleetStats.online}
                </StatValue>
                <StatLabel>
                  Online Now
                </StatLabel>
                <LinearProgress
                  variant="determinate"
                  value={onlinePercentage}
                  sx={{
                    mt: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette.primary.main,
                    },
                  }}
                />
              </StatItem>
            </Grid>
            
            <Grid item xs={6}>
              <StatItem>
                <StatValue>
                  {fleetStats.moving}
                </StatValue>
                <StatLabel>
                  Moving
                </StatLabel>
                <LinearProgress
                  variant="determinate"
                  value={movingPercentage}
                  sx={{
                    mt: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette.success.main,
                    },
                  }}
                />
              </StatItem>
            </Grid>
            
            <Grid item xs={6}>
              <StatItem>
                <StatValue>
                  {fleetStats.idling}
                </StatValue>
                <StatLabel>
                  Idling
                </StatLabel>
              </StatItem>
            </Grid>
          </Grid>

          <Box sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9', 
            borderRadius: '8px', 
            border: `1px solid ${theme.palette.divider}` 
          }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', fontWeight: 500 }}>
              Fleet utilization: {onlinePercentage}% online • {movingPercentage}% active
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default FleetOverviewCard;
