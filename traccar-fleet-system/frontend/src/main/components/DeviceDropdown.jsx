import React from 'react';
import { 
  Paper, 
  Popper, 
  ClickAwayListener, 
  Box, 
  Typography, 
  Button,
  Chip,
  Divider,
  List
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import DeviceItem from './DeviceItem';

const useStyles = makeStyles()((theme) => ({
  dropdown: {
    width: 320,
    maxHeight: 400,
    overflow: 'hidden',
    borderRadius: theme.spacing(1),
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    border: `1px solid ${theme.palette.divider}`,
  },
  header: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: 'rgba(6, 182, 212, 0.02)',
  },
  statsRow: {
    display: 'flex',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  deviceList: {
    maxHeight: 280,
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.divider,
      borderRadius: '3px',
    },
  },
  viewAllButton: {
    width: '100%',
    marginTop: theme.spacing(1),
    borderRadius: theme.spacing(0.5),
  },
}));

const DeviceDropdown = ({
  open,
  anchorEl,
  onClose, 
  devices = [], 
  onViewAll,
  onDeviceSelect,
  keyword = ''
}) => {
  const { classes } = useStyles();
  const theme = useTheme();

  if (!open) return null;

  // Calculate device stats
  const onlineCount = devices.filter(d => d.status === 'online').length;
  const offlineCount = devices.filter(d => d.status === 'offline').length;
  const movingCount = devices.filter(d => d.speed > 0).length;

  // Filter devices based on keyword if provided
  const filteredDevices = keyword 
    ? devices.filter(device => 
        device.name?.toLowerCase().includes(keyword.toLowerCase()) ||
        device.uniqueId?.toLowerCase().includes(keyword.toLowerCase())
      )
    : devices;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      style={{ zIndex: theme.zIndex.modal }}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper className={classes.dropdown}>
          {/* Header with stats */}
          <Box className={classes.header}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {keyword ? `Search Results` : `Devices`} ({filteredDevices.length})
            </Typography>
            
            <Box className={classes.statsRow}>
              <Chip 
                label={`${onlineCount} Online`}
                size="small"
                color="success"
                variant="outlined"
              />
              <Chip 
                label={`${offlineCount} Offline`}
                size="small"
                color="error"
                variant="outlined"
              />
              <Chip 
                label={`${movingCount} Moving`}
                size="small"
                color="info"
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Device list */}
          <Box className={classes.deviceList}>
            {filteredDevices.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {keyword ? 'No devices match your search' : 'No devices found'}
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {filteredDevices.slice(0, 8).map((device) => (
                  <DeviceItem
                    key={device.id}
                    device={device}
                    onClick={() => {
                      onDeviceSelect(device);
                      onClose();
                    }}
                    compact
                  />
                ))}
              </List>
            )}
          </Box>

          {/* View All button */}
          {filteredDevices.length > 8 && (
            <>
              <Divider />
              <Box sx={{ p: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  className={classes.viewAllButton}
                  onClick={onViewAll}
                >
                  View All {filteredDevices.length} Devices
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default DeviceDropdown;




