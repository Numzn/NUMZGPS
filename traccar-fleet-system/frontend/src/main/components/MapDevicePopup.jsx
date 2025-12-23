import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Card,
  CardContent,
  Collapse,
  Button,
  Divider,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BarChartIcon from '@mui/icons-material/BarChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useDeviceReadonly } from '../../common/util/permissions';
import { useCatch } from '../../reactHelper';
import { map } from '../../map/core/MapView';

const useStyles = makeStyles()((theme) => ({
  popup: {
    position: 'absolute',
    zIndex: 1000,
    minWidth: 200,
    maxWidth: 280,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    userSelect: 'none',
    cursor: 'move',
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
    },
  },
  dragHandle: {
    width: '100%',
    height: 8,
    backgroundColor: theme.palette.divider,
    cursor: 'move',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&::before': {
      content: '"▬▬▬▬▬▬▬▬▬▬▬▬"',
      fontSize: '8px',
      color: theme.palette.text.secondary,
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 1.5),
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  deviceInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  deviceIcon: {
    fontSize: '1.2rem',
  },
  deviceName: {
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    marginLeft: theme.spacing(0.5),
  },
  statusOnline: {
    backgroundColor: theme.palette.success.main,
  },
  statusOffline: {
    backgroundColor: theme.palette.error.main,
  },
  statusUnknown: {
    backgroundColor: theme.palette.grey[500],
  },
  content: {
    padding: theme.spacing(1.5),
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    fontSize: '0.8rem',
  },
  infoIcon: {
    fontSize: '0.9rem',
    width: 16,
    textAlign: 'center',
  },
  infoText: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
  },
  actions: {
    display: 'flex',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
    justifyContent: 'center',
  },
  actionButton: {
    minWidth: 32,
    height: 32,
    padding: theme.spacing(0.5),
    borderRadius: theme.spacing(0.5),
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    '&:hover': {
      backgroundColor: 'rgba(6, 182, 212, 0.2)',
    },
  },
  expandButton: {
    width: '100%',
    marginTop: theme.spacing(1),
    fontSize: '0.75rem',
    textTransform: 'none',
    color: theme.palette.primary.main,
  },
  expandedContent: {
    paddingTop: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(1),
  },
  resizeHandle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    cursor: 'nw-resize',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 0,
      height: 0,
      borderLeft: '4px solid transparent',
      borderBottom: '4px solid',
      borderBottomColor: theme.palette.divider,
    },
  },
}));

const MapDevicePopup = ({ 
  device, 
  position, 
  onClose,
  initialPosition = { x: 100, y: 100 }
}) => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();
  
  const [popupPosition, setPopupPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const popupRef = useRef(null);
  const deviceReadonly = useDeviceReadonly();

  // Get device icon based on type
  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'truck':
      case 'van':
        return <LocalShippingIcon className={classes.deviceIcon} />;
      case 'motorcycle':
      case 'bike':
        return <TwoWheelerIcon className={classes.deviceIcon} />;
      default:
        return <DirectionsCarIcon className={classes.deviceIcon} />;
    }
  };

  // Get status color
  const getStatusClass = (status) => {
    switch (status) {
      case 'online':
        return classes.statusOnline;
      case 'offline':
        return classes.statusOffline;
      default:
        return classes.statusUnknown;
    }
  };

  // Format time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'No data';
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Handle drag start
  const handleDragStart = (e) => {
    setIsDragging(true);
    const rect = popupRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Handle drag move
  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep popup within viewport bounds
    const maxX = window.innerWidth - 280;
    const maxY = window.innerHeight - 200;
    
    setPopupPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e) => handleDragMove(e);
      const handleMouseUp = () => handleDragEnd();
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Quick actions
  const handleFocusOnMap = () => {
    if (position && position.latitude && position.longitude) {
      // Focus map on device position with smooth animation
      map.easeTo({
        center: [position.longitude, position.latitude],
        zoom: Math.max(map.getZoom(), 12), // Ensure minimum zoom level
        duration: 1000, // 1 second smooth animation
      });
    }
  };

  const handleStartTracking = () => {
    navigate(`/replay?deviceId=${device.id}`);
  };

  const handleShowStats = () => {
    navigate(`/settings/device/${device.id}`);
  };

  if (!device || !position) {
    if (process.env.NODE_ENV === 'development') {
      console.log('MapDevicePopup: Missing device or position', { device, position });
    }
    return null;
  }

  // Additional safety checks
  if (!device.id || !device.name) {
    if (process.env.NODE_ENV === 'development') {
      console.log('MapDevicePopup: Invalid device data', device);
    }
    return null;
  }

  return (
    <Box
      ref={popupRef}
      className={classes.popup}
      style={{
        left: popupPosition.x,
        top: popupPosition.y,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {/* Drag Handle */}
      <Box 
        className={classes.dragHandle}
        onMouseDown={handleDragStart}
      />
      
      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.deviceInfo}>
          {getDeviceIcon(device.attributes?.deviceType)}
          <Typography className={classes.deviceName}>
            {device.name}
          </Typography>
          <Box 
            className={`${classes.statusDot} ${getStatusClass(device.status)}`}
          />
        </Box>
        
        <IconButton 
          size="small" 
          onClick={onClose}
          sx={{ p: 0.5 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Content */}
      <Box className={classes.content}>
        {/* Essential Info */}
        <Box className={classes.infoRow}>
          <span className={classes.infoIcon}>🕐</span>
          <Typography className={classes.infoText}>
            {getTimeAgo(position.fixTime)}
          </Typography>
        </Box>
        
        <Box className={classes.infoRow}>
          <span className={classes.infoIcon}>📍</span>
          <Typography className={classes.infoText}>
            {position.speed ? `${position.speed} km/h` : '0 km/h'}
          </Typography>
        </Box>
        
        <Box className={classes.infoRow}>
          <span className={classes.infoIcon}>🏁</span>
          <Typography className={classes.infoText}>
            {position.totalDistance ? `${position.totalDistance} km` : '0 km'}
          </Typography>
        </Box>

        {/* Expanded Content */}
        <Collapse in={isExpanded}>
          <Box className={classes.expandedContent}>
            <Box className={classes.infoRow}>
              <span className={classes.infoIcon}>📌</span>
              <Typography className={classes.infoText}>
                {position.address || 'Address not available'}
              </Typography>
            </Box>
            
            <Box className={classes.infoRow}>
              <span className={classes.infoIcon}>⛽</span>
              <Typography className={classes.infoText}>
                {device.attributes?.fuelLevel ? `${device.attributes.fuelLevel}% Fuel` : 'Fuel data unavailable'}
              </Typography>
            </Box>
          </Box>
        </Collapse>

        {/* Quick Actions */}
        <Box className={classes.actions}>
          <Tooltip title="Focus on Map">
            <IconButton 
              className={classes.actionButton}
              onClick={handleFocusOnMap}
              size="small"
            >
              <MyLocationIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Live Tracking">
            <IconButton 
              className={classes.actionButton}
              onClick={handleStartTracking}
              size="small"
            >
              <PlayArrowIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Device Stats">
            <IconButton 
              className={classes.actionButton}
              onClick={handleShowStats}
              size="small"
            >
              <BarChartIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Expand/Collapse Button */}
        <Button
          className={classes.expandButton}
          onClick={() => setIsExpanded(!isExpanded)}
          endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {isExpanded ? 'Less Details' : 'Full Details'}
        </Button>
      </Box>

      {/* Resize Handle */}
      <Box className={classes.resizeHandle} />
    </Box>
  );
};

export default MapDevicePopup;
