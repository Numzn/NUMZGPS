import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box, List, ListItem, ListItemIcon, ListItemText, Chip, Avatar, useTheme } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';

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
    color: theme.palette.error.main,
    marginRight: theme.spacing(1),
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 600,
  fontSize: '1.125rem',
}));

const AttentionItem = styled(ListItem)(({ theme, type }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: '8px',
  marginBottom: theme.spacing(1),
  padding: theme.spacing(2),
  borderLeft: `4px solid ${getBorderColor(type)}`,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#CBD5E1',
  },
}));

const IconAvatar = styled(Avatar)(({ theme, type }) => ({
  width: 32,
  height: 32,
  backgroundColor: getIconBackgroundColor(type),
  '& svg': {
    fontSize: '1rem',
    color: getIconColor(type),
  },
}));

function getBorderColor(type) {
  switch (type) {
    case 'error': return '#EF4444';
    case 'warning': return '#F59E0B';
    default: return '#3B82F6';
  }
}

function getIconBackgroundColor(type) {
  switch (type) {
    case 'error': return '#FEF2F2';
    case 'warning': return '#FFFBEB';
    default: return '#EBF4FF';
  }
}

function getIconColor(type) {
  switch (type) {
    case 'error': return '#EF4444';
    case 'warning': return '#F59E0B';
    default: return '#3B82F6';
  }
}

const ImmediateAttentionCard = (props) => {
  const theme = useTheme();
  const events = useSelector((state) => state.events.items);
  const devices = useSelector((state) => state.devices.items);
  const positions = useSelector((state) => state.session.positions);
  
  // Convert real events to attention items
  const attentionItems = useMemo(() => {
    // Get recent urgent events (last 30 minutes)
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
    const recentEvents = Object.values(events)
      .filter(event => {
        const eventTime = new Date(event.eventTime || event.serverTime || Date.now()).getTime();
        return eventTime > thirtyMinutesAgo;
      })
      .sort((a, b) => {
        const timeA = new Date(a.eventTime || a.serverTime || 0).getTime();
        const timeB = new Date(b.eventTime || b.serverTime || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, 5)
      .map(event => {
        const device = devices[event.deviceId];
        const position = positions[event.positionId];
        
        let type = 'info';
        let icon = <InfoIcon />;
        let title = event.type || 'Event';
        
        // Determine event type and icon
        if (event.type === 'alarm' || event.type === 'panic' || event.type === 'deviceOffline') {
          type = 'error';
          icon = <ErrorIcon />;
          title = event.type === 'panic' ? 'Panic Alert' : event.type === 'deviceOffline' ? 'Device Offline' : 'Vehicle Alarm';
        } else if (event.type === 'deviceOverspeed' || event.type === 'overspeed') {
          type = 'warning';
          icon = <WarningIcon />;
          title = 'Overspeed Alert';
        } else if (event.type === 'geofenceExit' || event.type === 'geofenceEnter') {
          type = 'info';
          icon = <InfoIcon />;
          title = event.type === 'geofenceExit' ? 'Geofence Exit' : 'Geofence Enter';
        } else if (event.type?.includes('fuel') || event.attributes?.fuelLevel) {
          type = 'warning';
          icon = <WarningIcon />;
          title = 'Low Fuel Alert';
        } else if (event.type?.includes('maintenance') || event.type?.includes('engine')) {
          type = 'error';
          icon = <ErrorIcon />;
          title = 'Maintenance Alert';
        }
        
        // Calculate time ago
        const eventTime = new Date(event.eventTime || event.serverTime || Date.now());
        const minutesAgo = Math.floor((Date.now() - eventTime.getTime()) / 60000);
        const timeAgo = minutesAgo < 1 ? 'Just now' : 
                       minutesAgo < 60 ? `${minutesAgo} min ago` :
                       `${Math.floor(minutesAgo / 60)} hour${Math.floor(minutesAgo / 60) > 1 ? 's' : ''} ago`;
        
        // Build description
        const deviceName = device ? (device.name || `Device ${event.deviceId}`) : `Device ${event.deviceId}`;
        const message = event.attributes?.message || event.type || 'Event occurred';
        const description = `${deviceName}: ${message}`;
        
        return {
          id: event.id,
          type,
          title,
          description,
          time: timeAgo,
          icon,
        };
      });
    
    return recentEvents;
  }, [events, devices, positions]);

  const getChipColor = (type) => {
    switch (type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  return (
    <StyledCard {...props}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Header>
          <WarningIcon />
          <Title variant="h6">
            Immediate Attention
          </Title>
        </Header>
        
        <Box sx={{ flex: 1 }}>
          <List sx={{ p: 0 }}>
            {attentionItems.map((item) => (
              <AttentionItem key={item.id} type={item.type}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <IconAvatar type={item.type}>
                    {item.icon}
                  </IconAvatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      <Chip
                        label={item.time}
                        size="small"
                        sx={{ 
                          color: 'text.secondary',
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#F1F5F9',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      {item.description}
                    </Typography>
                  }
                />
              </AttentionItem>
            ))}
          </List>
        </Box>

        {attentionItems.length === 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No immediate attention items
            </Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default ImmediateAttentionCard;
