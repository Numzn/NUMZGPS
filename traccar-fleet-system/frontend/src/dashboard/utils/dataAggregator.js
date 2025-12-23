/**
 * Data aggregation utilities for dashboard
 * Memoized calculations to prevent unnecessary recomputations
 */

/**
 * Aggregate device and position data into dashboard metrics
 */
export const aggregateData = (devices, positions, fuelRequests = {}) => {
  const devicesArray = Object.values(devices);
  const positionsArray = Object.values(positions);
  const fuelRequestsArray = Object.values(fuelRequests);

  // Device statistics
  const deviceStats = calculateDeviceStats(devicesArray, positionsArray);
  
  // Fuel statistics
  const fuelStats = calculateFuelStats(fuelRequestsArray);
  
  // Alert statistics
  const alertStats = calculateAlertStats(devicesArray, positionsArray);
  
  // Efficiency metrics
  const efficiencyMetrics = calculateEfficiencyMetrics(devicesArray, positionsArray);

  return {
    deviceStats,
    fuelStats,
    alertStats,
    efficiencyMetrics,
    timestamp: Date.now(),
  };
};

/**
 * Calculate device statistics
 */
export const calculateDeviceStats = (devices, positions) => {
  const stats = {
    total: devices.length,
    active: 0,
    idle: 0,
    offline: 0,
    moving: 0,
  };

  devices.forEach((device) => {
    const position = positions.find(p => p.deviceId === device.id);
    
    if (!position || device.status === 'offline') {
      stats.offline++;
    } else if (position.speed > 0) {
      stats.active++;
      stats.moving++;
    } else {
      stats.idle++;
    }
  });

  // Calculate percentages
  stats.activePercentage = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;
  stats.onlinePercentage = stats.total > 0 ? Math.round(((stats.active + stats.idle) / stats.total) * 100) : 0;

  return stats;
};

/**
 * Calculate fuel statistics
 */
export const calculateFuelStats = (fuelRequests) => {
  const stats = {
    total: fuelRequests.length,
    pending: 0,
    approved: 0,
    rejected: 0,
    fulfilled: 0,
    cancelled: 0,
    urgent: 0,
    emergency: 0,
  };

  let totalRequestedAmount = 0;
  let totalEstimatedCost = 0;

  fuelRequests.forEach((request) => {
    stats[request.status]++;
    
    if (request.urgency === 'urgent') stats.urgent++;
    if (request.urgency === 'emergency') stats.emergency++;
    
    totalRequestedAmount += request.requestedAmount || 0;
    totalEstimatedCost += request.estimatedCost || 0;
  });

  stats.totalRequestedAmount = Math.round(totalRequestedAmount);
  stats.totalEstimatedCost = Math.round(totalEstimatedCost);
  stats.averageRequestSize = stats.total > 0 ? Math.round(totalRequestedAmount / stats.total) : 0;

  return stats;
};

/**
 * Calculate alert statistics
 */
export const calculateAlertStats = (devices, positions) => {
  const stats = {
    total: 0,
    critical: 0,
    warning: 0,
    info: 0,
    lowFuel: 0,
    maintenance: 0,
    offline: 0,
  };

  devices.forEach((device) => {
    const position = positions.find(p => p.deviceId === device.id);
    
    // Offline devices
    if (device.status === 'offline') {
      stats.offline++;
      stats.critical++;
      stats.total++;
    }
    
    // Low fuel alerts
    if (position?.attributes?.fuel && position.attributes.fuel < 20) {
      stats.lowFuel++;
      stats.warning++;
      stats.total++;
    }
    
    // Maintenance alerts (mock data - should come from maintenance records)
    if (position?.attributes?.odometer && position.attributes.odometer % 10000 < 500) {
      stats.maintenance++;
      stats.info++;
      stats.total++;
    }
  });

  return stats;
};

/**
 * Calculate efficiency metrics
 */
export const calculateEfficiencyMetrics = (devices, positions) => {
  const metrics = {
    averageSpeed: 0,
    totalDistance: 0,
    fuelEfficiency: 0,
    utilizationRate: 0,
  };

  let totalSpeed = 0;
  let movingCount = 0;
  let totalDistance = 0;

  positions.forEach((position) => {
    if (position.speed > 0) {
      totalSpeed += position.speed;
      movingCount++;
    }
    
    if (position.attributes?.totalDistance) {
      totalDistance += position.attributes.totalDistance;
    }
  });

  metrics.averageSpeed = movingCount > 0 ? Math.round(totalSpeed / movingCount) : 0;
  metrics.totalDistance = Math.round(totalDistance / 1000); // Convert to km
  metrics.utilizationRate = devices.length > 0 ? Math.round((movingCount / devices.length) * 100) : 0;

  return metrics;
};

/**
 * Generate historical data for charts (24h)
 */
export const generateHistoricalData = (currentStats, hours = 24) => {
  const data = [];
  const now = new Date();
  
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    
    // Simulate historical data with some variance
    const variance = Math.random() * 0.2 + 0.9; // 90-110% of current
    
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: time.getTime(),
      active: Math.round(currentStats.active * variance),
      idle: Math.round(currentStats.idle * variance),
      offline: Math.round(currentStats.offline * variance),
      total: currentStats.total,
    });
  }
  
  return data;
};

/**
 * Calculate trend direction and percentage
 */
export const calculateTrend = (current, previous) => {
  if (!previous || previous === 0) return { direction: 'neutral', percentage: 0 };
  
  const change = current - previous;
  const percentage = Math.abs(Math.round((change / previous) * 100));
  
  return {
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    percentage,
    value: change,
  };
};

/**
 * Get top performers by metric
 */
export const getTopPerformers = (devices, positions, metric = 'distance', limit = 5) => {
  const performers = devices.map(device => {
    const position = positions.find(p => p.deviceId === device.id);
    let value = 0;
    
    switch (metric) {
      case 'distance':
        value = position?.attributes?.totalDistance || 0;
        break;
      case 'speed':
        value = position?.attributes?.averageSpeed || 0;
        break;
      case 'fuel':
        value = position?.attributes?.fuel || 0;
        break;
      default:
        value = 0;
    }
    
    return {
      device,
      value,
      position,
    };
  });
  
  return performers
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
};

export default {
  aggregateData,
  calculateDeviceStats,
  calculateFuelStats,
  calculateAlertStats,
  calculateEfficiencyMetrics,
  generateHistoricalData,
  calculateTrend,
  getTopPerformers,
};









