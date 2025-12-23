import { useDispatch, useSelector, connect } from 'react-redux';
import {
  geofencesActions, groupsActions, driversActions, maintenancesActions, calendarsActions, fuelRequestsActions,
} from './store';
import { useEffectAsync } from './reactHelper';
import fetchOrThrow from './common/util/fetchOrThrow';

const CachingController = () => {
  const authenticated = useSelector((state) => !!state.session.user);
  const user = useSelector((state) => state.session.user);
  const dispatch = useDispatch();

  useEffectAsync(async () => {
    if (authenticated) {
      const response = await fetchOrThrow('/api/geofences');
      dispatch(geofencesActions.refresh(await response.json()));
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated) {
      const response = await fetchOrThrow('/api/groups');
      dispatch(groupsActions.refresh(await response.json()));
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated) {
      const response = await fetchOrThrow('/api/drivers');
      dispatch(driversActions.refresh(await response.json()));
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated) {
      const response = await fetchOrThrow('/api/maintenance');
      dispatch(maintenancesActions.refresh(await response.json()));
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated) {
      const response = await fetchOrThrow('/api/calendars');
      dispatch(calendarsActions.refresh(await response.json()));
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated) {
      try {
        // Prepare headers with fallback authentication
        const headers = {
          'Content-Type': 'application/json',
        };
        
        // FALLBACK: Send user ID as header if cookies don't work
        // This ensures authentication works even if cookie forwarding fails
        if (user?.id) {
          headers['x-user-id'] = user.id.toString();
          if (process.env.NODE_ENV === 'development') {
            console.log('🔑 Sending user ID header as fallback:', user.id);
          }
        }
        
        // Fetch fuel requests with credentials to ensure session cookies are sent
        const response = await fetchOrThrow('/api/fuel-requests', {
          credentials: 'include', // Important: sends session cookies
          headers: headers,
        });
        const requests = await response.json();
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Loaded fuel requests:', requests.length, 'requests');
        }
        
        // Log if no requests found but we expect some
        if (requests.length === 0) {
          console.warn('⚠️ No fuel requests found. This could mean:');
          console.warn('   1. No requests exist in the database');
          console.warn('   2. User is a driver and has no requests');
          console.warn('   3. Authentication issue - check backend logs');
        }
        
        dispatch(fuelRequestsActions.refresh(requests));
      } catch (error) {
        // Fuel API might not be available in all environments
        console.error('❌ Fuel requests API error:', error);
        console.warn('⚠️ Fuel requests API not available:', error.message);
        // Initialize with empty array to prevent errors
        dispatch(fuelRequestsActions.refresh([]));
      }
    }
  }, [authenticated, user?.id]);

  return null;
};

export default connect()(CachingController);
