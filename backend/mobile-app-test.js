// NumzTrak Mobile App - Connection Test Script
// This script tests all mobile app connection endpoints

const config = {
  // Auto-detected server IP
  serverIP: '10.152.184.242',
  
  // API endpoints for mobile app
  endpoints: {
    traccar: 'http://10.152.184.242:8082/api',
    frontend: 'http://10.152.184.242:3002',
    fuel: 'http://10.152.184.242:3001',
    websocket: 'ws://10.152.184.242:8082/api/socket'
  },
  
  // GPS protocol ports
  gpsPorts: {
    osmand: 5055,      // Recommended for React Native
    generic: 5001,
    tk103: 5002,
    gl200: 5003,
    teltonika: 5006
  }
};

// Test function to verify mobile app connectivity
async function testMobileConnectivity() {
  console.log('🚀 Testing NumzTrak Mobile App Connectivity...\n');
  
  const results = {
    traccar: false,
    frontend: false,
    fuel: false,
    websocket: false
  };
  
  try {
    // Test Traccar API
    console.log('📡 Testing Traccar API...');
    const traccarResponse = await fetch(`${config.endpoints.traccar}/server`);
    results.traccar = traccarResponse.ok;
    console.log(`   ${results.traccar ? '✅' : '❌'} Traccar API: ${traccarResponse.status}`);
    
    // Test Frontend
    console.log('🌐 Testing Frontend...');
    const frontendResponse = await fetch(config.endpoints.frontend);
    results.frontend = frontendResponse.ok;
    console.log(`   ${results.frontend ? '✅' : '❌'} Frontend: ${frontendResponse.status}`);
    
    // Test Fuel API
    console.log('⛽ Testing Fuel API...');
    const fuelResponse = await fetch(`${config.endpoints.fuel}/health`);
    results.fuel = fuelResponse.ok;
    console.log(`   ${results.fuel ? '✅' : '❌'} Fuel API: ${fuelResponse.status}`);
    
    // Test WebSocket (basic connection test)
    console.log('🔌 Testing WebSocket...');
    try {
      const ws = new WebSocket(config.endpoints.websocket);
      ws.onopen = () => {
        results.websocket = true;
        console.log(`   ✅ WebSocket: Connected`);
        ws.close();
      };
      ws.onerror = () => {
        results.websocket = false;
        console.log(`   ❌ WebSocket: Connection failed`);
      };
    } catch (error) {
      results.websocket = false;
      console.log(`   ❌ WebSocket: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  // Summary
  console.log('\n📊 Connection Summary:');
  console.log(`   Traccar API: ${results.traccar ? '✅ Connected' : '❌ Failed'}`);
  console.log(`   Frontend: ${results.frontend ? '✅ Connected' : '❌ Failed'}`);
  console.log(`   Fuel API: ${results.fuel ? '✅ Connected' : '❌ Failed'}`);
  console.log(`   WebSocket: ${results.websocket ? '✅ Connected' : '❌ Failed'}`);
  
  const allConnected = Object.values(results).every(status => status);
  console.log(`\n🎯 Overall Status: ${allConnected ? '✅ ALL SYSTEMS OPERATIONAL' : '⚠️ SOME ISSUES DETECTED'}`);
  
  return results;
}

// Mobile app configuration for React Native/Expo
const mobileAppConfig = {
  // Network service configuration
  network: {
    baseURL: 'http://10.152.184.242:8082',
    apiBase: 'http://10.152.184.242:8082/api',
    websocketURL: 'ws://10.152.184.242:8082/api/socket',
    fuelAPI: 'http://10.152.184.242:3001'
  },
  
  // GPS configuration
  gps: {
    server: '10.152.184.242',
    port: 5055, // OsmAnd protocol
    protocol: 'http',
    interval: 10000, // 10 seconds
    accuracy: 'high'
  },
  
  // Authentication
  auth: {
    method: 'basic',
    endpoints: {
      login: '/api/session',
      logout: '/api/session',
      check: '/api/session'
    }
  },
  
  // Fuel management
  fuel: {
    endpoints: {
      requests: '/api/fuel-requests',
      create: '/api/fuel-requests',
      update: '/api/fuel-requests/:id',
      cancel: '/api/fuel-requests/:id/cancel'
    }
  }
};

// Export for use in mobile app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    config,
    testMobileConnectivity,
    mobileAppConfig
  };
}

// Run test if executed directly
if (typeof window !== 'undefined') {
  testMobileConnectivity();
}










