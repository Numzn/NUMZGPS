import React from 'react';
import { Box, Button, ButtonGroup, Typography, Chip, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const StyledActionBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: '8px',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)'
    : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(0, 0, 0, 0.05)',
  marginBottom: 0,  // Remove - parent controls spacing
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '6px',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.875rem',
  padding: theme.spacing(1, 2),
  borderColor: theme.palette.divider,
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#F8FAFC',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#CBD5E1',
  },
  '&.primary': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      borderColor: theme.palette.primary.dark,
    },
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5',
  color: theme.palette.mode === 'dark' ? theme.palette.success.light : '#065F46',
  fontWeight: 500,
  fontSize: '0.75rem',
  border: theme.palette.mode === 'dark' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #A7F3D0',
}));

const DashboardActionBar = ({ onRefresh }) => {
  const theme = useTheme();
  
  const handleRefresh = () => {
    onRefresh && onRefresh();
  };

  const handleFilter = () => {
    // Filter functionality
    // TODO: Implement filter functionality
    if (process.env.NODE_ENV === 'development') {
      console.log('Filter clicked');
    }
  };

  const handleExport = () => {
    // Export functionality
    // TODO: Implement export functionality
    if (process.env.NODE_ENV === 'development') {
      console.log('Export clicked');
    }
  };

  const handleDateRange = () => {
    // Date range picker
    // TODO: Implement date range picker
    if (process.env.NODE_ENV === 'development') {
      console.log('Date range clicked');
    }
  };

  return (
    <StyledActionBar>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Quick Actions
        </Typography>
        <ButtonGroup variant="outlined" size="small">
          <ActionButton
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            className="primary"
          >
            Refresh
          </ActionButton>
          <ActionButton
            startIcon={<FilterListIcon />}
            onClick={handleFilter}
          >
            Filter
          </ActionButton>
          <ActionButton
            startIcon={<CalendarTodayIcon />}
            onClick={handleDateRange}
          >
            Date Range
          </ActionButton>
          <ActionButton
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export
          </ActionButton>
        </ButtonGroup>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
          System Status:
        </Typography>
        <StatusChip label="All Systems Operational" size="small" />
      </Box>
    </StyledActionBar>
  );
};

export default DashboardActionBar;