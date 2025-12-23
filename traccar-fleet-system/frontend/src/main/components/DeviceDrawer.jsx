import React, { useState } from 'react';
import { 
  Drawer, 
  Box, 
  Typography, 
  IconButton, 
  Chip,
  Divider,
  Tooltip,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Menu,
  MenuItem,
  Link
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import RouteIcon from '@mui/icons-material/Route';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PendingIcon from '@mui/icons-material/Pending';
import DeviceList from '../DeviceList';
import RemoveDialog from '../../common/components/RemoveDialog';
import PositionValue from '../../common/components/PositionValue';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useDeviceReadonly, useRestriction } from '../../common/util/permissions';
import usePositionAttributes from '../../common/attributes/usePositionAttributes';
import { devicesActions } from '../../store';
import { useCatch, useCatchCallback } from '../../reactHelper';
import { useAttributePreference } from '../../common/util/preferences';
import fetchOrThrow from '../../common/util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  drawer: {
    width: 240,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: 240,
      boxSizing: 'border-box',
      top: '64px', // Start below the larger topbar
      height: 'calc(100vh - 64px)',
      borderLeft: `1px solid ${theme.palette.divider}`,
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: 'rgba(6, 182, 212, 0.02)',
    minHeight: 48,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  title: {
    fontWeight: 600,
    fontSize: '1rem',
  },
  statsRow: {
    display: 'flex',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
  },
  content: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  pinButton: {
    transition: 'all 0.2s',
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
  deviceDetails: {
    padding: theme.spacing(1, 1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: 'rgba(6, 182, 212, 0.02)',
  },
  deviceImage: {
    height: 60,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(0.5),
  },
  deviceName: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  positionTable: {
    '& .MuiTableCell-sizeSmall': {
      paddingLeft: 0,
      paddingRight: 0,
      borderBottom: 'none',
    },
    '& .MuiTableCell-sizeSmall:first-of-type': {
      paddingRight: theme.spacing(1),
    },
  },
  actions: {
    justifyContent: 'space-between',
    padding: theme.spacing(1),
  },
}));

const DeviceDrawer = ({ 
  open, 
  pinned, 
  onClose, 
  onPinToggle, 
  devices = [],
  selectedDeviceId,
  selectedPosition,
  children 
}) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const readonly = useRestriction('readonly');
  const deviceReadonly = useDeviceReadonly();
  const shareDisabled = useSelector((state) => state.session.server.attributes.disableShare);
  const user = useSelector((state) => state.session.user);
  const device = useSelector((state) => state.devices.items[selectedDeviceId]);

  const deviceImage = device?.attributes?.deviceImage;
  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference('positionItems', 'fixTime,address,speed,totalDistance');
  const navigationAppLink = useAttributePreference('navigationAppLink');
  const navigationAppTitle = useAttributePreference('navigationAppTitle');

  const [anchorEl, setAnchorEl] = useState(null);
  const [removing, setRemoving] = useState(false);

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetchOrThrow('/api/devices');
      dispatch(devicesActions.refresh(await response.json()));
    }
    setRemoving(false);
  });

  const handleGeofence = useCatchCallback(async () => {
    const newItem = {
      name: t('sharedGeofence'),
      area: `CIRCLE (${selectedPosition.latitude} ${selectedPosition.longitude}, 50)`,
    };
    const response = await fetchOrThrow('/api/geofences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    const item = await response.json();
    await fetchOrThrow('/api/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: selectedPosition.deviceId, geofenceId: item.id }),
    });
    navigate(`/settings/geofence/${item.id}`);
  }, [navigate, selectedPosition]);

  // Calculate device stats
  const onlineCount = devices.filter(d => d.status === 'online').length;
  const offlineCount = devices.filter(d => d.status === 'offline').length;
  const movingCount = devices.filter(d => d.speed > 0).length;

  return (
    <Drawer
      className={classes.drawer}
      variant="temporary"
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        '& .MuiDrawer-paper': {
          position: 'relative',
          height: '100vh',
        },
      }}
    >
      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Typography className={classes.title}>
            Devices ({devices.length})
          </Typography>
        </Box>
        
        <Box className={classes.headerRight}>
          <Tooltip title={pinned ? "Unpin drawer" : "Pin drawer"}>
            <IconButton
              size="small"
              onClick={onPinToggle}
              className={classes.pinButton}
              color={pinned ? "primary" : "default"}
            >
              {pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
            </IconButton>
          </Tooltip>
          
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ px: 1.5, py: 0.5 }}>
        <Box className={classes.statsRow}>
          <Chip 
            label={`${onlineCount} Online`}
            size="small"
            color="success"
            variant="outlined"
            sx={{ height: '20px', fontSize: '0.65rem' }}
          />
          <Chip 
            label={`${offlineCount} Offline`}
            size="small"
            color="error"
            variant="outlined"
            sx={{ height: '20px', fontSize: '0.65rem' }}
          />
          <Chip 
            label={`${movingCount} Moving`}
            size="small"
            color="info"
            variant="outlined"
            sx={{ height: '20px', fontSize: '0.65rem' }}
          />
        </Box>
      </Box>

      <Divider />

      {/* Selected Device Details */}
      {selectedDeviceId && device && (
        <Box className={classes.deviceDetails}>
          {deviceImage ? (
            <CardMedia
              className={classes.deviceImage}
              image={`/api/media/${device.uniqueId}/${deviceImage}`}
            >
              <IconButton
                size="small"
                onClick={onClose}
                sx={{ color: 'white', mixBlendMode: 'difference' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </CardMedia>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography className={classes.deviceName}>
                {device.name}
              </Typography>
              <IconButton size="small" onClick={onClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          
          {selectedPosition && (
            <CardContent sx={{ p: 0 }}>
              <Table size="small" classes={{ root: classes.positionTable }}>
                <TableBody>
                  {positionItems.split(',').filter((key) => selectedPosition.hasOwnProperty(key) || selectedPosition.attributes?.hasOwnProperty(key)).map((key) => (
                    <TableRow key={key}>
                      <TableCell>
                        <Typography variant="body2">{positionAttributes[key]?.name || key}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          <PositionValue
                            position={selectedPosition}
                            property={selectedPosition.hasOwnProperty(key) ? key : null}
                            attribute={selectedPosition.hasOwnProperty(key) ? null : key}
                          />
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <CardActions classes={{ root: classes.actions }} disableSpacing>
                <Tooltip title={t('sharedExtra')}>
                  <IconButton
                    color="secondary"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    disabled={!selectedPosition}
                  >
                    <PendingIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('reportReplay')}>
                  <IconButton
                    onClick={() => navigate(`/replay?deviceId=${selectedDeviceId}`)}
                    disabled={!selectedPosition}
                  >
                    <RouteIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('commandTitle')}>
                  <IconButton
                    onClick={() => navigate(`/settings/device/${selectedDeviceId}/command`)}
                  >
                    <SendIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('sharedEdit')}>
                  <IconButton
                    onClick={() => navigate(`/settings/device/${selectedDeviceId}`)}
                    disabled={deviceReadonly}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('sharedRemove')}>
                  <IconButton
                    color="error"
                    onClick={() => setRemoving(true)}
                    disabled={deviceReadonly}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </CardContent>
          )}
        </Box>
      )}

      {/* Content */}
      <Box className={classes.content}>
        {children || <DeviceList devices={devices} />}
      </Box>

      {/* Extra Menu */}
      {selectedPosition && (
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {!readonly && <MenuItem onClick={handleGeofence}>{t('sharedCreateGeofence')}</MenuItem>}
          <MenuItem component="a" target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${selectedPosition.latitude}%2C${selectedPosition.longitude}`}>{t('linkGoogleMaps')}</MenuItem>
          <MenuItem component="a" target="_blank" href={`http://maps.apple.com/?ll=${selectedPosition.latitude},${selectedPosition.longitude}`}>{t('linkAppleMaps')}</MenuItem>
          <MenuItem component="a" target="_blank" href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${selectedPosition.latitude}%2C${selectedPosition.longitude}&heading=${selectedPosition.course}`}>{t('linkStreetView')}</MenuItem>
          {navigationAppTitle && <MenuItem component="a" target="_blank" href={navigationAppLink.replace('{latitude}', selectedPosition.latitude).replace('{longitude}', selectedPosition.longitude)}>{navigationAppTitle}</MenuItem>}
          {!shareDisabled && !user.temporary && (
            <MenuItem onClick={() => navigate(`/settings/device/${selectedDeviceId}/share`)}><Typography color="secondary">{t('deviceShare')}</Typography></MenuItem>
          )}
        </Menu>
      )}

      {/* Remove Dialog */}
      <RemoveDialog
        open={removing}
        endpoint="devices"
        itemId={selectedDeviceId}
        onResult={(removed) => handleRemove(removed)}
      />
    </Drawer>
  );
};

export default DeviceDrawer;

