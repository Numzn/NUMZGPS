import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ListIcon from '@mui/icons-material/List';
import GridViewIcon from '@mui/icons-material/GridView';
import DeviceList from '../DeviceList';
import DeviceStatsChips from './DeviceStatsChips';

const useStyles = makeStyles()((theme) => ({
  quickView: {
    position: 'fixed',
    top: 80,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '90%',
    maxWidth: 700,
    maxHeight: 'calc(100vh - 120px)',
    background: 'rgba(255, 255, 255, 0.98)',
    borderRadius: '16px',
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(6, 182, 212, 0.1)',
    zIndex: 1200,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  mobileQuickView: {
    top: 70,
    width: '95%',
    maxWidth: 'none',
    maxHeight: 'calc(100vh - 100px)',
    borderRadius: '12px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2, 3),
    borderBottom: '1px solid rgba(6, 182, 212, 0.1)',
    backgroundColor: 'rgba(6, 182, 212, 0.02)',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  deviceCount: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2, 3),
    backgroundColor: 'rgba(6, 182, 212, 0.02)',
    borderBottom: '1px solid rgba(6, 182, 212, 0.1)',
  },
  searchField: {
    flex: 1,
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
      },
      '&.Mui-focused': {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        boxShadow: '0 4px 12px rgba(6, 182, 212, 0.15)',
      },
    },
  },
  viewToggle: {
    '& .MuiToggleButton-root': {
      padding: theme.spacing(1),
      borderRadius: '8px',
      border: '1px solid rgba(6, 182, 212, 0.2)',
      '&.Mui-selected': {
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        color: theme.palette.primary.main,
      },
    },
  },
  content: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  statsSection: {
    padding: theme.spacing(1.5, 3),
    backgroundColor: 'rgba(6, 182, 212, 0.02)',
    borderBottom: '1px solid rgba(6, 182, 212, 0.1)',
  },
  deviceListContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  closeButton: {
    padding: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    color: theme.palette.error.main,
    '&:hover': {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      transform: 'scale(1.05)',
    },
  },
  mobileHeader: {
    padding: theme.spacing(1.5, 2),
  },
  mobileToolbar: {
    padding: theme.spacing(1.5, 2),
    gap: theme.spacing(1),
  },
  mobileTitle: {
    fontSize: '1.1rem',
  },
}));

const DeviceQuickView = ({
  devices = [],
  onClose,
  onDeviceSelect,
  initialSearch = '',
  showStats = true,
}) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [viewMode, setViewMode] = useState('list');
  const [filteredDevices, setFilteredDevices] = useState(devices);

  // Filter devices based on search term
  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    const filtered = devices.filter(device => {
      if (!value.trim()) return true;
      
      const searchLower = value.toLowerCase();
      return (
        device.name?.toLowerCase().includes(searchLower) ||
        device.uniqueId?.toLowerCase().includes(searchLower) ||
        device.phone?.toLowerCase().includes(searchLower)
      );
    });
    
    setFilteredDevices(filtered);
  }, [devices]);

  // Handle view mode change
  const handleViewModeChange = useCallback((event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  }, []);

  // Calculate stats for the filtered devices
  const stats = useMemo(() => {
    const total = filteredDevices.length;
    const online = filteredDevices.filter(d => d.status === 'online').length;
    const moving = filteredDevices.filter(d => {
      // This would need position data to determine if moving
      return d.status === 'online';
    }).length;
    const idling = online - moving;
    const offline = filteredDevices.filter(d => d.status === 'offline').length;

    return { total, online, moving, idling, offline };
  }, [filteredDevices]);

  // Initialize filtered devices when devices prop changes
  React.useEffect(() => {
    setFilteredDevices(devices);
  }, [devices]);

  return (
    <Fade in timeout={300}>
      <Slide direction="down" in timeout={300}>
        <Paper 
          className={`${classes.quickView} ${isMobile ? classes.mobileQuickView : ''}`}
          elevation={0}
        >
          {/* Header */}
          <Box className={`${classes.header} ${isMobile ? classes.mobileHeader : ''}`}>
            <Box>
              <Typography className={`${classes.title} ${isMobile ? classes.mobileTitle : ''}`}>
                🚗 All Devices
                <Typography component="span" className={classes.deviceCount}>
                  ({filteredDevices.length})
                </Typography>
              </Typography>
            </Box>
            <IconButton 
              onClick={onClose}
              className={classes.closeButton}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Toolbar */}
          <Box className={`${classes.toolbar} ${isMobile ? classes.mobileToolbar : ''}`}>
            <TextField
              placeholder="Filter devices..."
              value={searchTerm}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              className={classes.searchField}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" color="action" />,
              }}
            />
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
              className={classes.viewToggle}
            >
              <ToggleButton value="list">
                <ListIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="grid">
                <GridViewIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Stats Section */}
          {showStats && (
            <Box className={classes.statsSection}>
              <DeviceStatsChips 
                stats={stats}
                compact={isMobile}
                showTooltips={!isMobile}
              />
            </Box>
          )}

          <Divider />

          {/* Device List */}
          <Box className={classes.deviceListContainer}>
            <DeviceList 
              devices={filteredDevices}
              onDeviceSelect={onDeviceSelect}
              compact={true}
            />
          </Box>
        </Paper>
      </Slide>
    </Fade>
  );
};

export default DeviceQuickView;
