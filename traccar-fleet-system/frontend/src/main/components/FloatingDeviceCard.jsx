import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Divider,
  Collapse,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import MaximizeIcon from '@mui/icons-material/Maximize';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SpeedIcon from '@mui/icons-material/Speed';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { formatStatus, formatBoolean, formatPercentage } from '../../common/util/formatter';
import { useTranslation } from '../../common/components/LocalizationProvider';

const useStyles = makeStyles()((theme) => ({
  floatingCard: {
    position: 'fixed',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(6, 182, 212, 0.1)',
    zIndex: 1300,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'move',
    userSelect: 'none',
    minWidth: '320px',
    maxWidth: '400px',
  },
  minimizedCard: {
    minWidth: '200px',
    maxWidth: '250px',
    padding: theme.spacing(1),
  },
  normalCard: {
    minWidth: '320px',
    maxWidth: '400px',
  },
  expandedCard: {
    minWidth: '400px',
    maxWidth: '500px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    borderBottom: '1px solid rgba(6, 182, 212, 0.1)',
    backgroundColor: 'rgba(6, 182, 212, 0.02)',
    borderRadius: '16px 16px 0 0',
  },
  minimizedHeader: {
    padding: theme.spacing(1),
    borderBottom: 'none',
    backgroundColor: 'transparent',
  },
  deviceInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    flex: 1,
    minWidth: 0,
  },
  deviceIcon: {
    width: 32,
    height: 32,
    borderRadius: '8px',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  },
  deviceDetails: {
    flex: 1,
    minWidth: 0,
  },
  deviceName: {
    fontSize: '1rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  minimizedName: {
    fontSize: '0.875rem',
  },
  deviceStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
  },
  statusOnline: {
    backgroundColor: '#10b981',
  },
  statusOffline: {
    backgroundColor: '#ef4444',
  },
  statusUnknown: {
    backgroundColor: '#6b7280',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  controlButton: {
    padding: '6px',
    borderRadius: '6px',
    transition: 'all 0.2s',
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
  minimizeButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
    '&:hover': {
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
    },
  },
  expandButton: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: 'rgba(6, 182, 212, 0.2)',
    },
  },
  closeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: theme.palette.error.main,
    '&:hover': {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },
  },
  content: {
    padding: theme.spacing(2),
  },
  minimizedContent: {
    padding: theme.spacing(1),
  },
  expandedContent: {
    padding: theme.spacing(3),
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    backgroundColor: 'rgba(6, 182, 212, 0.02)',
    borderRadius: '8px',
    border: '1px solid rgba(6, 182, 212, 0.1)',
  },
  metricIcon: {
    fontSize: '20px',
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(0.5),
  },
  metricValue: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  metricLabel: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    textAlign: 'center',
  },
  detailsSection: {
    marginTop: theme.spacing(2),
  },
  detailsTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
  },
  detailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.875rem',
  },
  detailLabel: {
    color: theme.palette.text.secondary,
  },
  detailValue: {
    color: theme.palette.text.primary,
    fontWeight: 500,
  },
  dragHandle: {
    position: 'absolute',
    top: '50%',
    left: -8,
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: '4px',
    padding: '4px',
    cursor: 'grab',
    '&:active': {
      cursor: 'grabbing',
    },
  },
  mobileCard: {
    position: 'fixed',
    bottom: 20,
    left: 20,
    right: 20,
    maxWidth: 'none',
    minWidth: 'auto',
  },
}));

const FloatingDeviceCard = ({
  device,
  position,
  onClose,
  onMinimize,
  onExpand,
  isMinimized = false,
  isExpanded = false,
  isDraggable = true,
  initialPosition = { bottom: 20, right: 20 },
}) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const t = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [cardPosition, setCardPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Handle drag functionality
  const handleMouseDown = useCallback((event) => {
    if (!isDraggable || isMobile) return;
    
    event.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: event.clientX - cardPosition.left,
      y: event.clientY - cardPosition.top,
    };
  }, [isDraggable, isMobile, cardPosition]);

  const handleMouseMove = useCallback((event) => {
    if (!isDragging) return;
    
    const newPosition = {
      left: event.clientX - dragStartRef.current.x,
      top: event.clientY - dragStartRef.current.y,
    };
    
    setCardPosition(newPosition);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Get device status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return classes.statusOnline;
      case 'offline': return classes.statusOffline;
      default: return classes.statusUnknown;
    }
  };

  // Get device metrics
  const getDeviceMetrics = () => {
    if (!position) return {};
    
    return {
      speed: position.speed ? `${Math.round(position.speed * 1.852)} km/h` : '0 km/h',
      course: position.course ? `${Math.round(position.course)}°` : '0°',
      altitude: position.altitude ? `${Math.round(position.altitude)}m` : '0m',
      battery: position.attributes?.batteryLevel ? formatPercentage(position.attributes.batteryLevel) : 'N/A',
    };
  };

  const metrics = getDeviceMetrics();

  // Get card size class
  const getCardSizeClass = () => {
    if (isMinimized) return classes.minimizedCard;
    if (isExpanded) return classes.expandedCard;
    return classes.normalCard;
  };

  // Get content class
  const getContentClass = () => {
    if (isMinimized) return classes.minimizedContent;
    if (isExpanded) return classes.expandedContent;
    return classes.content;
  };

  if (!device) return null;

  return (
    <Fade in timeout={300}>
      <Slide direction="up" in timeout={300}>
        <Paper
          ref={cardRef}
          className={`${classes.floatingCard} ${getCardSizeClass()} ${isMobile ? classes.mobileCard : ''}`}
          style={{
            ...cardPosition,
            cursor: isDragging ? 'grabbing' : 'move',
          }}
          onMouseDown={handleMouseDown}
          elevation={0}
        >
          {/* Drag Handle */}
          {isDraggable && !isMobile && (
            <Box className={classes.dragHandle}>
              <DragIndicatorIcon fontSize="small" />
            </Box>
          )}

          {/* Header */}
          <Box className={`${classes.header} ${isMinimized ? classes.minimizedHeader : ''}`}>
            <Box className={classes.deviceInfo}>
              <Box className={classes.deviceIcon}>
                🚗
              </Box>
              <Box className={classes.deviceDetails}>
                <Typography 
                  className={`${classes.deviceName} ${isMinimized ? classes.minimizedName : ''}`}
                >
                  {device.name}
                </Typography>
                {!isMinimized && (
                  <Box className={classes.deviceStatus}>
                    <Box 
                      className={`${classes.statusDot} ${getStatusColor(device.status)}`}
                    />
                    <Typography variant="caption">
                      {formatStatus(device.status, t)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Box className={classes.controls}>
              {!isMinimized && (
                <IconButton
                  size="small"
                  className={`${classes.controlButton} ${classes.minimizeButton}`}
                  onClick={onMinimize}
                  title="Minimize"
                >
                  <MinimizeIcon fontSize="small" />
                </IconButton>
              )}
              
              {isMinimized && (
                <IconButton
                  size="small"
                  className={`${classes.controlButton} ${classes.expandButton}`}
                  onClick={onExpand}
                  title="Expand"
                >
                  <MaximizeIcon fontSize="small" />
                </IconButton>
              )}

              <IconButton
                size="small"
                className={`${classes.controlButton} ${classes.closeButton}`}
                onClick={onClose}
                title="Close"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Content */}
          {!isMinimized && (
            <Collapse in={!isMinimized} timeout={300}>
              <Box className={getContentClass()}>
                {/* Metrics Grid */}
                {isExpanded && (
                  <Box className={classes.metricsGrid}>
                    <Box className={classes.metricItem}>
                      <SpeedIcon className={classes.metricIcon} />
                      <Typography className={classes.metricValue}>
                        {metrics.speed}
                      </Typography>
                      <Typography className={classes.metricLabel}>
                        Speed
                      </Typography>
                    </Box>
                    
                    <Box className={classes.metricItem}>
                      <BatteryFullIcon className={classes.metricIcon} />
                      <Typography className={classes.metricValue}>
                        {metrics.battery}
                      </Typography>
                      <Typography className={classes.metricLabel}>
                        Battery
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Device Details */}
                <Box className={classes.detailsSection}>
                  <Typography className={classes.detailsTitle}>
                    Device Information
                  </Typography>
                  <Box className={classes.detailsList}>
                    <Box className={classes.detailItem}>
                      <Typography className={classes.detailLabel}>
                        ID:
                      </Typography>
                      <Typography className={classes.detailValue}>
                        {device.uniqueId}
                      </Typography>
                    </Box>
                    
                    <Box className={classes.detailItem}>
                      <Typography className={classes.detailLabel}>
                        Last Update:
                      </Typography>
                      <Typography className={classes.detailValue}>
                        {device.lastUpdate ? new Date(device.lastUpdate).toLocaleString() : 'Never'}
                      </Typography>
                    </Box>
                    
                    {position?.attributes?.ignition !== undefined && (
                      <Box className={classes.detailItem}>
                        <Typography className={classes.detailLabel}>
                          Engine:
                        </Typography>
                        <Typography className={classes.detailValue}>
                          {formatBoolean(position.attributes.ignition, t)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Collapse>
          )}
        </Paper>
      </Slide>
    </Fade>
  );
};

export default FloatingDeviceCard;
