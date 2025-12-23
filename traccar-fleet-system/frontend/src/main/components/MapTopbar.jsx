import React, { useState, useRef } from 'react';
import { 
  Box, 
  IconButton, 
  Chip, 
  TextField, 
  InputAdornment,
  Tooltip,
  Badge,
  Popover,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Typography
} from '@mui/material';
import { useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DevicesIcon from '@mui/icons-material/Devices';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useTranslation } from '../../common/components/LocalizationProvider';
import LogoImage from '../../login/LogoImage';
import { 
  UnifiedTopbar, 
  TopbarLeftSection, 
  TopbarCenterSection, 
  TopbarRightSection,
  TopbarDivider 
} from '../../common/components/topbar';
import { 
  getUnifiedSearchFieldStyles, 
  getUnifiedActionButtonStyles, 
  getUnifiedChipStyles 
} from '../../common/styles/topbarStyles';

const useStyles = makeStyles()((theme) => ({
  statusChips: {
    display: 'flex',
    gap: theme.spacing(0.25),
    alignItems: 'center',
  },
  searchField: getUnifiedSearchFieldStyles(theme),
  actionButton: getUnifiedActionButtonStyles(theme),
  chip: getUnifiedChipStyles(theme),
  filterPopover: {
    '& .MuiPopover-paper': {
      width: 320,
      maxHeight: 400,
      borderRadius: theme.spacing(1),
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    },
  },
  filterContent: {
    padding: theme.spacing(2),
  },
  filterHeader: {
    marginBottom: theme.spacing(2),
  },
  filterSection: {
    marginBottom: theme.spacing(2),
  },
  filterActions: {
    display: 'flex',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  activeFilters: {
    display: 'flex',
    gap: theme.spacing(0.5),
    flexWrap: 'wrap',
    marginTop: theme.spacing(1),
  },
}));

const MapTopbar = ({
  devices = [],
  onlineCount = 0,
  offlineCount = 0,
  movingCount = 0,
  keyword = '',
  onKeywordChange,
  onFilterClick,
  onDevicesClick,
  onAddDevice,
  onDashboardClick,
  devicesButtonRef,
  filter = {},
  setFilter = () => {},
  filterSort = '',
  setFilterSort = () => {},
  filterMap = false,
  setFilterMap = () => {}
}) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const t = useTranslation();
  
  // Get WebSocket connection status
  const socketConnected = useSelector((state) => state.session.socket);
  
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const filterOpen = Boolean(filterAnchorEl);

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
    onFilterClick();
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStatusFilter = (status) => {
    const newStatuses = filter.statuses?.includes(status)
      ? filter.statuses.filter(s => s !== status)
      : [...(filter.statuses || []), status];
    setFilter({ ...filter, statuses: newStatuses });
  };

  const handleClearFilters = () => {
    setFilter({ statuses: [], groups: [] });
    setFilterSort('');
    setFilterMap(false);
  };

  const hasActiveFilters = (filter.statuses?.length > 0) || (filter.groups?.length > 0) || filterSort || filterMap;

  return (
    <>
      {/* Use unified topbar */}
      <UnifiedTopbar variant="box" position="sticky" sx={{ top: 0, zIndex: 1100 }}>
        <TopbarLeftSection>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LogoImage
              color="#06b6d4"
              style={{ width: '48px', height: '48px', objectFit: 'contain' }}
            />
          </Box>
          
          <Box className={classes.statusChips}>
            <Chip
              label={`${onlineCount} Online`}
              size="small"
              color="success"
              variant="outlined"
              className={classes.chip}
              sx={{ 
                height: '24px',
                fontSize: '0.7rem',
                '& .MuiChip-label': { px: 1 }
              }}
            />
            <Chip
              label={`${offlineCount} Off`}
              size="small"
              color="error"
              variant="outlined"
              className={classes.chip}
              sx={{ 
                height: '24px',
                fontSize: '0.7rem',
                '& .MuiChip-label': { px: 1 }
              }}
            />
            <Chip
              label={`${movingCount} Moving`}
              size="small"
              color="info"
              variant="outlined"
              className={classes.chip}
              sx={{ 
                height: '24px',
                fontSize: '0.7rem',
                '& .MuiChip-label': { px: 1 }
              }}
            />
          </Box>
        </TopbarLeftSection>

        <TopbarCenterSection>
          <TextField
            placeholder="Search devices..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            size="small"
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: '1rem' }} />
                </InputAdornment>
              ),
              endAdornment: keyword && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => onKeywordChange('')}
                    sx={{ p: 0.25 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </TopbarCenterSection>

        <TopbarDivider />

        <TopbarRightSection>
          {/* Connection Status Indicator */}
          <Tooltip title={socketConnected ? 'Connected to backend' : 'Disconnected from backend'}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: socketConnected ? '#4caf50' : '#f44336',
              marginRight: 1,
              marginLeft: 1
            }} />
          </Tooltip>

          <Tooltip title="Filter">
            <IconButton 
              size="small" 
              onClick={handleFilterClick}
              className={classes.actionButton}
              sx={{
                backgroundColor: hasActiveFilters ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              }}
            >
              <FilterListIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Devices">
            <IconButton 
              ref={devicesButtonRef}
              size="small" 
              onClick={onDevicesClick}
              className={classes.actionButton}
              sx={{
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
              }}
            >
              <Badge badgeContent={devices.length} color="primary" max={99}>
                <DevicesIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Dashboard">
            <IconButton 
              size="small" 
              onClick={onDashboardClick}
              className={classes.actionButton}
              sx={{
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
              }}
            >
              <DashboardIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Add">
            <IconButton 
              size="small" 
              onClick={onAddDevice}
              className={classes.actionButton}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </TopbarRightSection>
      </UnifiedTopbar>

      {/* Filter Popover */}
      <Popover
        open={filterOpen}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        className={classes.filterPopover}
      >
        <Box className={classes.filterContent}>
          <Box className={classes.filterHeader}>
            <Typography variant="h6" fontWeight={600}>
              Filter Devices
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select criteria to filter your device list
            </Typography>
          </Box>

          {/* Status Filter */}
          <Box className={classes.filterSection}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Status
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filter.statuses?.includes('online') || false}
                    onChange={() => handleStatusFilter('online')}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: '14px' }}>📱</span>
                    <span>Online ({onlineCount})</span>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filter.statuses?.includes('offline') || false}
                    onChange={() => handleStatusFilter('offline')}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: '14px' }}>🔴</span>
                    <span>Offline ({offlineCount})</span>
                  </Box>
                }
              />
            </FormGroup>
          </Box>

          {/* Sort Options */}
          <Box className={classes.filterSection}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort by</InputLabel>
              <Select
                value={filterSort}
                onChange={(e) => setFilterSort(e.target.value)}
                label="Sort by"
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="status">Status</MenuItem>
                <MenuItem value="lastUpdate">Last Update</MenuItem>
                <MenuItem value="speed">Speed</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <Box className={classes.activeFilters}>
              <Typography variant="caption" color="text.secondary">
                Active filters:
              </Typography>
              {filter.statuses?.map(status => (
                <Chip
                  key={status}
                  label={status}
                  size="small"
                  onDelete={() => handleStatusFilter(status)}
                  color="primary"
                  variant="outlined"
                />
              ))}
              {filterSort && (
                <Chip
                  label={`Sort: ${filterSort}`}
                  size="small"
                  onDelete={() => setFilterSort('')}
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Box>
          )}

          {/* Filter Actions */}
          <Box className={classes.filterActions}>
            <Button
              size="small"
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
              disabled={!hasActiveFilters}
            >
              Clear All
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleFilterClose}
              sx={{ ml: 'auto' }}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default MapTopbar;
