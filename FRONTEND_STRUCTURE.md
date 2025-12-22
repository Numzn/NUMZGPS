# Frontend Structure & Architecture

Complete overview of the NumzTrak React frontend application.

## 📦 Tech Stack

### Core Framework
- **React 19.2.0** - UI library
- **React Router DOM 7.9.3** - Client-side routing
- **Redux Toolkit 2.9.0** - State management
- **Material-UI (MUI) 7.3.4** - Component library
- **Vite 7.1.9** - Build tool and dev server

### Maps & Geospatial
- **MapLibre GL JS 5.8.0** - Open-source map rendering
- **Mapbox GL Draw 1.5.0** - Map drawing tools
- **@maplibre/maplibre-gl-geocoder 1.9.1** - Geocoding
- **@turf/circle 7.2.0** - Geospatial calculations
- **wellknown 0.5.0** - GeoJSON/WKT conversion

### Real-time Communication
- **Socket.io Client 4.8.1** - WebSocket client
- Real-time updates for:
  - Vehicle positions
  - Fuel requests
  - Events and notifications

### Data Visualization
- **Recharts 3.2.1** - Chart library
- **ExcelJS 4.4.0** - Excel export
- **file-saver 2.0.5** - File downloads

### Utilities
- **dayjs 1.11.18** - Date manipulation
- **react-window 2.2.0** - Virtual scrolling
- **react-rnd 10.5.2** - Resizable/draggable components
- **react-qr-code 2.0.18** - QR code generation
- **@yudiel/react-qr-scanner 2.3.1** - QR code scanning

## 📁 Project Structure

```
traccar-fleet-system/frontend/
├── public/                    # Static assets
│   ├── NUMZLOGO.png          # Main logo
│   ├── favicon.ico           # Favicon
│   ├── pwa-*.png             # PWA icons
│   └── sw-push.js             # Service worker push handlers
│
├── src/
│   ├── App.jsx                # Main app component
│   ├── AppThemeProvider.jsx   # Theme provider
│   ├── index.jsx              # Entry point
│   │
│   ├── common/                # Shared utilities & components
│   │   ├── attributes/        # Attribute hooks (9 files)
│   │   ├── components/        # Reusable components (36 files)
│   │   ├── styles/            # Shared styles
│   │   ├── theme/             # MUI theme configuration
│   │   └── util/              # Utility functions (13 files)
│   │
│   ├── dashboard/              # Dashboard module
│   │   ├── components/        # Dashboard components (9 files)
│   │   ├── DashboardPage.jsx  # Main dashboard page
│   │   ├── animations/        # Animation utilities
│   │   ├── styles/            # Dashboard styles
│   │   └── utils/             # Dashboard utilities
│   │
│   ├── fuelRequests/           # Fuel management module
│   │   ├── components/        # Fuel UI components
│   │   │   ├── FuelRequestsCard.jsx
│   │   │   └── FuelApprovalDialog.jsx
│   │   ├── socket/            # Socket.io integration
│   │   │   └── FuelSocketController.jsx
│   │   ├── services/          # API services
│   │   │   └── fuelRequestApi.js
│   │   └── store/             # Redux store
│   │       └── fuelRequests.js
│   │
│   ├── main/                  # Main map view
│   │   ├── MainPage.jsx       # Main page container
│   │   ├── MainMap.jsx        # Map component
│   │   ├── MainToolbar.jsx    # Top toolbar
│   │   ├── DeviceList.jsx     # Device list sidebar
│   │   ├── DeviceRow.jsx      # Device row component
│   │   ├── EventsDrawer.jsx   # Events drawer
│   │   ├── components/        # Main view components (11 files)
│   │   ├── styles/            # Main view styles
│   │   └── useFilter.js       # Filtering logic
│   │
│   ├── map/                   # Map components
│   │   ├── core/             # Core map functionality
│   │   │   ├── MapView.jsx   # Main map container
│   │   │   └── [4 other core files]
│   │   ├── components/        # Map UI components
│   │   ├── draw/              # Drawing tools
│   │   ├── geocoder/          # Geocoding component
│   │   ├── legend/             # Map legend
│   │   ├── main/              # Main map features
│   │   ├── notification/      # Map notifications
│   │   ├── overlay/           # Map overlays
│   │   ├── switcher/          # Map style switcher
│   │   ├── MapCurrentLocation.js  # Geolocation button
│   │   ├── MapGeofence.js     # Geofence rendering
│   │   ├── MapMarkers.js      # Vehicle markers
│   │   ├── MapPositions.js    # Position tracking
│   │   ├── MapRoutePath.js    # Route rendering
│   │   └── MapScale.js        # Scale control
│   │
│   ├── login/                 # Authentication
│   │   ├── LoginPage.jsx      # Login form
│   │   ├── RegisterPage.jsx   # Registration
│   │   ├── ResetPasswordPage.jsx
│   │   ├── ChangeServerPage.jsx
│   │   └── LoginLayout.jsx    # Auth layout
│   │
│   ├── reports/               # Reporting module
│   │   ├── SummaryReportPage.jsx
│   │   ├── TripReportPage.jsx
│   │   ├── StopReportPage.jsx
│   │   ├── EventReportPage.jsx
│   │   ├── StatisticsPage.jsx
│   │   ├── ChartReportPage.jsx
│   │   ├── CombinedReportPage.jsx
│   │   ├── AuditPage.jsx
│   │   ├── LogsPage.jsx
│   │   ├── ScheduledPage.jsx
│   │   ├── PositionsReportPage.jsx
│   │   ├── common/            # Report utilities
│   │   └── components/        # Report components
│   │
│   ├── settings/              # Settings module
│   │   ├── DevicesPage.jsx    # Device management
│   │   ├── DevicePage.jsx     # Device details
│   │   ├── UsersPage.jsx      # User management
│   │   ├── GroupsPage.jsx     # Group management
│   │   ├── GeofencesPage.jsx  # Geofence management
│   │   ├── DriversPage.jsx    # Driver management
│   │   ├── MaintenancesPage.jsx
│   │   ├── CommandsPage.jsx   # Command management
│   │   ├── NotificationsPage.jsx
│   │   ├── PreferencesPage.jsx
│   │   ├── ServerPage.jsx     # Server settings
│   │   ├── VehicleSpecsPage.jsx
│   │   ├── components/        # Settings components (9 files)
│   │   └── common/            # Settings utilities
│   │
│   ├── other/                 # Other pages
│   │   ├── GeofencesList.jsx
│   │   ├── EventPage.jsx
│   │   ├── PositionPage.jsx
│   │   ├── ReplayPage.jsx
│   │   ├── NetworkPage.jsx
│   │   └── EmulatorPage.jsx
│   │
│   ├── store/                 # Redux store
│   │   ├── index.js           # Store configuration
│   │   ├── session.js         # Session state
│   │   ├── devices.js         # Devices state
│   │   ├── events.js          # Events state
│   │   ├── geofences.js       # Geofences state
│   │   ├── groups.js          # Groups state
│   │   ├── drivers.js         # Drivers state
│   │   ├── maintenances.js    # Maintenance state
│   │   ├── calendars.js       # Calendars state
│   │   ├── errors.js          # Error handling
│   │   └── throttleMiddleware.js
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useToastNotifications.jsx
│   │   ├── useBrowserNotifications.js
│   │   └── useServiceWorker.js
│   │
│   ├── resources/             # Static resources
│   │   ├── l10n/              # Localization (61 languages)
│   │   ├── images/            # SVG icons (28 files)
│   │   └── alarm.mp3          # Alert sound
│   │
│   ├── SocketController.jsx   # Main Socket.io controller
│   ├── CachingController.js  # Cache management
│   ├── UpdateController.jsx  # Update notifications
│   ├── ErrorBoundary.jsx     # Error boundary
│   ├── Navigation.jsx        # Navigation component
│   └── ServerProvider.jsx    # Server context
│
├── vite.config.js            # Vite configuration
├── eslint.config.js          # ESLint configuration
├── Dockerfile.dev            # Docker dev image
└── package.json              # Dependencies
```

## 🎨 Key Features

### 1. Real-time GPS Tracking
- **Live Map View**: MapLibre GL JS with real-time vehicle positions
- **Marker Rendering**: Custom vehicle markers with status indicators
- **Route Visualization**: Historical and live route paths
- **Geofence Display**: Visual geofence boundaries on map
- **Map Controls**: Zoom, pan, geolocation, style switcher

### 2. Fuel Management
- **Fuel Request Card**: Complete fuel request workflow UI
- **Approval Dialog**: Manager approval interface
- **Real-time Updates**: Socket.io integration for live status
- **Status Tracking**: Pending, approved, rejected, fulfilled states
- **Validation**: Client-side and server-side validation

### 3. Dashboard Analytics
- **KPI Cards**: Key performance indicators
- **Charts**: Recharts integration for data visualization
- **Data Aggregation**: Real-time statistics
- **Responsive Design**: Mobile and desktop layouts

### 4. Device Management
- **Device List**: Sidebar with filterable device list
- **Device Details**: Comprehensive device information
- **Status Indicators**: Online/offline, moving/stopped
- **Commands**: Send commands to devices
- **History**: Position and event history

### 5. Reporting System
- **Trip Reports**: Vehicle trip analysis
- **Stop Reports**: Stop duration and location
- **Event Reports**: Event logs and analysis
- **Statistics**: Comprehensive fleet statistics
- **Export**: Excel export functionality

### 6. Settings & Configuration
- **User Management**: Create, edit, delete users
- **Device Configuration**: Device settings and attributes
- **Geofence Management**: Create and edit geofences
- **Driver Management**: Driver profiles and assignment
- **Maintenance Tracking**: Vehicle maintenance schedules
- **Preferences**: User and system preferences

## 🔌 API Integration

### Traccar API
- **Base URL**: `/api` (proxied to Traccar server)
- **Endpoints**:
  - `/api/session` - Authentication
  - `/api/devices` - Device management
  - `/api/positions` - Position data
  - `/api/events` - Event data
  - `/api/geofences` - Geofence management
  - `/api/users` - User management

### Fuel API
- **Base URL**: `/api/fuel-requests` (proxied to Fuel API)
- **Endpoints**:
  - `GET /api/fuel-requests` - List requests
  - `POST /api/fuel-requests` - Create request
  - `PUT /api/fuel-requests/:id` - Update request
  - `POST /api/fuel-requests/:id/approve` - Approve
  - `POST /api/fuel-requests/:id/reject` - Reject
  - `GET /api/vehicle-specs` - Vehicle specs

### WebSocket Connections
- **Traccar Socket**: `/api/socket` - Vehicle position updates
- **Fuel Socket**: `/socket.io` - Fuel request updates

## 🎯 State Management (Redux)

### Store Structure
```javascript
{
  session: {
    user: {...},
    server: {...},
    attributes: {...}
  },
  devices: {
    items: [...],
    selectedId: null
  },
  events: {
    items: [...]
  },
  geofences: {
    items: [...]
  },
  groups: {
    items: [...]
  },
  drivers: {
    items: [...]
  },
  maintenances: {
    items: [...]
  },
  fuelRequests: {
    items: [...],
    filters: {...}
  }
}
```

## 🌐 Internationalization

- **61 Languages** supported
- **Translation Files**: `src/resources/l10n/*.json`
- **Language Detection**: Browser language detection
- **RTL Support**: Right-to-left language support (Arabic, Hebrew)

## 📱 Progressive Web App (PWA)

### Features
- **Service Worker**: Offline support
- **App Manifest**: Installable app
- **Push Notifications**: Browser notifications
- **Offline Caching**: Asset caching strategy
- **Update Notifications**: Auto-update prompts

### PWA Configuration
- **Icons**: Multiple sizes (64x64, 192x192, 512x512)
- **Theme Color**: `#0A2540`
- **Display Mode**: Standalone
- **Start URL**: `/`

## 🛠️ Development

### Scripts
```bash
# Start development server
npm start

# Start with local backend URLs
npm run start:local

# Build for production
npm run build

# Lint code
npm run lint
npm run lint:fix

# Generate PWA assets
npm run generate-pwa-assets
```

### Environment Variables
- `LOCAL_DEV=true` - Use localhost URLs for backend
- `VITE_HMR_HOST` - HMR host configuration
- `VITE_HMR_PORT` - HMR port configuration
- `VITE_HMR_EXTERNAL` - External HMR access

### Vite Configuration
- **Port**: 3002
- **Host**: 0.0.0.0 (accessible from network)
- **HMR**: Hot Module Replacement enabled
- **Proxy**: API proxying to backend services
- **PWA**: Service worker and manifest generation

## 🎨 Theming

### Material-UI Theme
- **Custom Palette**: Brand colors
- **Dark Mode**: Supported
- **RTL Support**: Right-to-left layouts
- **Responsive**: Mobile-first design
- **Custom Components**: Themed MUI components

### Theme Configuration
- **Primary Color**: `#0A2540` (Dark blue)
- **Secondary Color**: Brand secondary
- **Typography**: Custom font stack
- **Spacing**: 8px base unit
- **Breakpoints**: Mobile, Tablet, Desktop

## 🔐 Authentication

### Flow
1. **Login Page**: User credentials
2. **Session Management**: Cookie-based sessions
3. **Token Handling**: Automatic token refresh
4. **Protected Routes**: Route guards
5. **Permission Checks**: Role-based access

## 📊 Performance Optimizations

### Implemented
- **Code Splitting**: Route-based splitting
- **Virtual Scrolling**: `react-window` for large lists
- **Memoization**: React.memo, useMemo, useCallback
- **Lazy Loading**: Dynamic imports
- **Image Optimization**: Optimized assets
- **Caching**: Redux state caching
- **Throttling**: API request throttling

## 🧪 Testing

### Test Files
- `src/test/ToastNotificationTest.jsx` - Toast notification testing

### Testing Setup
- ESLint for code quality
- Error boundaries for error handling
- Console logging for debugging

## 🚀 Deployment

### Docker
- **Dockerfile.dev**: Development container
- **Volume Mounts**: Hot reload support
- **Port**: 3002
- **Environment**: Development mode

### Production Build
- **Output**: `build/` directory
- **Optimization**: Minification, tree-shaking
- **Asset Hashing**: Cache busting
- **Service Worker**: Offline support

## 📝 Code Style

### ESLint Configuration
- **Config**: Airbnb style guide
- **Plugins**: React, React Hooks, JSX A11y
- **Rules**: Strict linting rules

### Component Structure
```jsx
// 1. Imports
import React from 'react';

// 2. Component
const MyComponent = ({ prop1, prop2 }) => {
  // 3. Hooks
  const [state, setState] = useState(null);
  
  // 4. Effects
  useEffect(() => {
    // effect logic
  }, []);
  
  // 5. Handlers
  const handleClick = () => {
    // handler logic
  };
  
  // 6. Render
  return <div>...</div>;
};

export default MyComponent;
```

## 🔄 Real-time Updates

### Socket.io Integration
- **Traccar Socket**: Vehicle positions, events
- **Fuel Socket**: Fuel request status updates
- **Reconnection**: Automatic reconnection
- **Error Handling**: Connection error handling

### Update Flow
1. Socket connection established
2. Subscribe to channels
3. Receive real-time updates
4. Update Redux store
5. UI re-renders automatically

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- Bottom navigation menu
- Touch-optimized controls
- Swipe gestures
- Mobile-friendly forms

---

**Frontend Version**: 6.10.0  
**React Version**: 19.2.0  
**Build Tool**: Vite 7.1.9





