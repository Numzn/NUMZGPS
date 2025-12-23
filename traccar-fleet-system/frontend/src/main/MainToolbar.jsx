import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, IconButton, OutlinedInput, InputAdornment, Popover, FormControl, InputLabel, 
  Select, MenuItem, FormGroup, FormControlLabel, Checkbox, Badge, ListItemButton, 
  ListItemText, Tooltip, Divider, Typography,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useDeviceReadonly } from '../common/util/permissions';
import DeviceRow from './DeviceRow';

const useStyles = makeStyles()((theme) => ({
  toolbar: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(6, 182, 212, 0.05)',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: 'rgba(6, 182, 212, 0.08)',
      },
      '&.Mui-focused': {
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        '& fieldset': {
          borderColor: theme.palette.primary.main,
          borderWidth: '2px',
        },
      },
    },
  },
  filterButton: {
    transition: 'all 0.15s',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  addButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    transition: 'all 0.15s',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(6, 182, 212, 0.3)',
    },
    '&:disabled': {
      backgroundColor: theme.palette.action.disabledBackground,
    },
  },
  filterPanel: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2.5),
    gap: theme.spacing(2),
    width: '300px',
  },
  filterHeader: {
    marginBottom: theme.spacing(1),
  },
  filterTitle: {
    fontWeight: 700,
    fontSize: '0.875rem',
    color: theme.palette.primary.main,
  },
  filterSubtitle: {
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
  quickSearchResults: {
    maxHeight: '300px',
    overflowY: 'auto',
  },
  resultsDivider: {
    margin: theme.spacing(1, 0),
  },
  resultsHeader: {
    padding: theme.spacing(0.75, 1.5),
    fontSize: '0.65rem',
    fontWeight: 700,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
}));

const MainToolbar = ({
  filteredDevices,
  devicesOpen,
  setDevicesOpen,
  keyword,
  setKeyword,
  filter,
  setFilter,
  filterSort,
  setFilterSort,
  filterMap,
  setFilterMap,
}) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const deviceReadonly = useDeviceReadonly();

  const groups = useSelector((state) => state.groups.items);
  const devices = useSelector((state) => state.devices.items);

  const toolbarRef = useRef();
  const inputRef = useRef();
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [devicesAnchorEl, setDevicesAnchorEl] = useState(null);

  const deviceStatusCount = (status) => Object.values(devices).filter((d) => d.status === status).length;
  
  const hasActiveFilters = filter.statuses.length > 0 || filter.groups.length > 0 || filterSort || filterMap;

  return (
    <Box ref={toolbarRef} className={classes.toolbar}>
      {/* Search Input */}
      <OutlinedInput
        ref={inputRef}
        placeholder={t('sharedSearchDevices')}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onFocus={() => setDevicesAnchorEl(toolbarRef.current)}
        onBlur={() => setTimeout(() => setDevicesAnchorEl(null), 200)}
        className={classes.searchInput}
        startAdornment={(
          <InputAdornment position="start">
            <SearchIcon fontSize="small" color="action" />
          </InputAdornment>
        )}
        endAdornment={(
          <InputAdornment position="end">
            {keyword && (
              <IconButton
                size="small"
                onClick={() => setKeyword('')}
                edge="end"
                sx={{ mr: 0.5 }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
            <Tooltip title="Filter & Sort">
              <IconButton 
                size="small" 
                edge="end" 
                onClick={() => setFilterAnchorEl(inputRef.current)}
                className={classes.filterButton}
              >
                <Badge 
                  color="primary" 
                  variant="dot" 
                  invisible={!hasActiveFilters}
                >
                  <TuneIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
          </InputAdornment>
        )}
        size="small"
        fullWidth
      />

      {/* Quick Search Results Popover */}
      <Popover
        open={!!devicesAnchorEl && keyword.length > 0}
        anchorEl={devicesAnchorEl}
        onClose={() => setDevicesAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: { 
              width: toolbarRef.current?.clientWidth || 300,
              maxWidth: '100%',
              mt: 1,
            },
          },
        }}
        elevation={3}
        disableAutoFocus
        disableEnforceFocus
      >
        <Box className={classes.quickSearchResults}>
          <Typography className={classes.resultsHeader}>
            Search Results ({filteredDevices.length})
          </Typography>
          <Divider className={classes.resultsDivider} />
          {filteredDevices.slice(0, 5).map((_, deviceIndex) => (
            <DeviceRow 
              key={filteredDevices[deviceIndex].id} 
              devices={filteredDevices} 
              index={deviceIndex} 
            />
          ))}
          {filteredDevices.length > 5 && (
            <>
              <Divider className={classes.resultsDivider} />
              <ListItemButton 
                onClick={() => setDevicesAnchorEl(null)}
                sx={{ justifyContent: 'center' }}
              >
                <ListItemText
                  primary={`View all ${filteredDevices.length} results`}
                  primaryTypographyProps={{ 
                    textAlign: 'center', 
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'primary.main',
                  }}
                />
              </ListItemButton>
            </>
          )}
        </Box>
      </Popover>

      {/* Filter Panel Popover */}
      <Popover
        open={!!filterAnchorEl}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            elevation: 3,
          },
        }}
      >
        <Box className={classes.filterPanel}>
          <Box className={classes.filterHeader}>
            <Typography className={classes.filterTitle}>
              Filter & Sort
            </Typography>
            <Typography className={classes.filterSubtitle}>
              Refine your vehicle list
            </Typography>
          </Box>

          <Divider />

          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={filter.statuses}
              onChange={(e) => setFilter({ ...filter, statuses: e.target.value })}
              multiple
              renderValue={(selected) => `${selected.length} selected`}
            >
              <MenuItem value="online">
                <Checkbox checked={filter.statuses.indexOf('online') > -1} />
                <ListItemText primary={`${t('deviceStatusOnline')} (${deviceStatusCount('online')})`} />
              </MenuItem>
              <MenuItem value="offline">
                <Checkbox checked={filter.statuses.indexOf('offline') > -1} />
                <ListItemText primary={`${t('deviceStatusOffline')} (${deviceStatusCount('offline')})`} />
              </MenuItem>
              <MenuItem value="unknown">
                <Checkbox checked={filter.statuses.indexOf('unknown') > -1} />
                <ListItemText primary={`${t('deviceStatusUnknown')} (${deviceStatusCount('unknown')})`} />
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Groups</InputLabel>
            <Select
              label="Groups"
              value={filter.groups}
              onChange={(e) => setFilter({ ...filter, groups: e.target.value })}
              multiple
              renderValue={(selected) => selected.length > 0 ? `${selected.length} selected` : 'All groups'}
            >
              {Object.values(groups).sort((a, b) => a.name.localeCompare(b.name)).map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  <Checkbox checked={filter.groups.indexOf(group.id) > -1} />
                  <ListItemText primary={group.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              label="Sort By"
              value={filterSort}
              onChange={(e) => setFilterSort(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Default Order</MenuItem>
              <MenuItem value="name">Name (A-Z)</MenuItem>
              <MenuItem value="lastUpdate">Last Update</MenuItem>
            </Select>
          </FormControl>

          <Divider />

          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={filterMap} 
                  onChange={(e) => setFilterMap(e.target.checked)} 
                />
              }
              label={t('sharedFilterMap')}
            />
          </FormGroup>
        </Box>
      </Popover>

      {/* Add Device Button */}
      <Tooltip title="Add New Vehicle">
        <IconButton 
          edge="end" 
          onClick={(e) => { 
            e.stopPropagation(); 
            navigate('/settings/device'); 
          }} 
          disabled={deviceReadonly}
          className={classes.addButton}
          size="small"
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default MainToolbar;
