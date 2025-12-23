import { useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import AppLayout from '../common/components/AppLayout';
import FuelRequestsCard from '../fuelRequests/components/FuelRequestsCard';
import useFilter from '../main/useFilter';
import usePersistedState from '../common/util/usePersistedState';

const DashboardPage = () => {
  const theme = useTheme();
  const positions = useSelector((state) => state.session.positions);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);

  const [keyword] = useState('');
  const [filter] = usePersistedState('filter', {
    statuses: [],
    groups: [],
  });
  const [filterSort] = usePersistedState('filterSort', '');
  const [filterMap] = usePersistedState('filterMap', false);

  useFilter(keyword, filter, filterSort, filterMap, positions, setFilteredDevices, setFilteredPositions);

  return (
    <AppLayout showSidebar={true}>
      <Box sx={{ 
        px: { xs: 2, sm: 3, md: 4, lg: 4 },  // Optimized padding: 16px, 24px, 32px, 32px
        py: { xs: 3, sm: 4, md: 5 },   // Responsive vertical padding
        backgroundColor: theme.palette.background.default, 
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
        height: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Fuel Requests Section */}
        <Box sx={{ mb: 5, width: '100%', maxWidth: '100%' }}>  {/* Add: 40px bottom margin for scroll space */}
          <FuelRequestsCard devices={filteredDevices} positions={filteredPositions} />
        </Box>
      </Box>
    </AppLayout>
  );
};

export default DashboardPage;

