import maplibregl from 'maplibre-gl';
import { useEffect, useRef } from 'react';
import { map } from './core/MapView';
import { useTheme } from '@mui/material';
import './MapCurrentLocation.css';

const MapCurrentLocation = () => {
  const theme = useTheme();
  const geolocateControlRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }

    // Note: We don't block based on HTTP/HTTPS here
    // Modern browsers allow geolocation on localhost even over HTTP
    // The browser will handle security and prompt the user for permission

    const addButtonToNavigationGroup = () => {
      // Find the navigation control group
      const findNavigationGroup = () => {
        const controls = map.getContainer().querySelectorAll('.maplibregl-ctrl-group');
        for (const control of controls) {
          // Check if this is the navigation control (has zoom buttons)
          const hasZoomIn = control.querySelector('.maplibregl-ctrl-zoom-in');
          const hasZoomOut = control.querySelector('.maplibregl-ctrl-zoom-out');
          if (hasZoomIn || hasZoomOut) {
            return control;
          }
        }
        return null;
      };

      const navigationGroup = findNavigationGroup();
      
      if (!navigationGroup || buttonRef.current) {
        // Navigation group not found yet or button already added
        return;
      }

      // Create the geolocate control to get its functionality
      geolocateControlRef.current = new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 15000,
        },
        trackUserLocation: true,
        showUserHeading: true,
        showAccuracyCircle: true,
      });

      // Add error handling
      geolocateControlRef.current.on('error', (e) => {
        console.error('Geolocation error:', e);
        if (e.code === 1) {
          console.warn('User denied geolocation permission');
        } else if (e.code === 2) {
          console.warn('Geolocation position unavailable');
        } else if (e.code === 3) {
          console.warn('Geolocation timeout');
        }
      });

      geolocateControlRef.current.on('geolocate', (e) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Geolocation successful:', e.coords);
        }
      });

      // Initialize the control properly - add it to the map first
      const geolocateContainer = geolocateControlRef.current.onAdd(map);
      const originalButton = geolocateContainer.querySelector('button');
      
      if (originalButton) {
        // Hide the original geolocate control container
        geolocateContainer.style.display = 'none';
        
        // Create a new button for the navigation group that looks the same
        const navButton = originalButton.cloneNode(true);
        buttonRef.current = navButton;
        
        // Ensure button is enabled (remove disabled attribute if present)
        navButton.removeAttribute('disabled');
        navButton.disabled = false;
        
        // Clear any existing onclick and add our own handler
        navButton.onclick = null;
        navButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Always try to trigger geolocation, regardless of original button state
          if (geolocateControlRef.current) {
            try {
              // Try the control's trigger method first
              geolocateControlRef.current.trigger();
            } catch (error) {
              console.warn('Control trigger failed, trying direct geolocation:', error);
              // Fallback: manually request geolocation
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    map.flyTo({
                      center: [position.coords.longitude, position.coords.latitude],
                      zoom: Math.max(map.getZoom(), 15),
                    });
                  },
                  (err) => {
                    console.error('Geolocation error:', err);
                  },
                  {
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 15000,
                  }
                );
              }
            }
          }
          
          // Also try clicking the original button as backup
          if (originalButton && !originalButton.disabled) {
            try {
              originalButton.click();
            } catch (err) {
              // Ignore if it fails
            }
          }
        });

        // Also listen to the control's events to update button state
        const updateButtonState = () => {
          // Copy classes from original button to maintain state
          if (originalButton) {
            navButton.className = originalButton.className;
            // Sync disabled state but keep our button enabled
            // We'll handle the visual state through classes
            if (originalButton.disabled) {
              navButton.classList.add('maplibregl-ctrl-geolocate-disabled');
            } else {
              navButton.classList.remove('maplibregl-ctrl-geolocate-disabled');
            }
          }
        };
        
        // Initial state sync
        updateButtonState();

        // Update button state when control state changes
        geolocateControlRef.current.on('trackuserlocationstart', updateButtonState);
        geolocateControlRef.current.on('trackuserlocationend', updateButtonState);
        geolocateControlRef.current.on('geolocate', updateButtonState);
        geolocateControlRef.current.on('error', updateButtonState);
        
        // Ensure button stays enabled - periodically check and re-enable if needed
        const enableCheckInterval = setInterval(() => {
          if (navButton && navButton.disabled) {
            navButton.disabled = false;
            navButton.removeAttribute('disabled');
          }
        }, 1000);
        
        // Store interval ID for cleanup
        navButton._enableCheckInterval = enableCheckInterval;

        // Insert button into navigation group in the correct position
        // Navigation control typically has: zoom-in (first), zoom-out (second)
        // We'll add geolocate button after zoom-out (as the third/last button)
        const zoomOutButton = navigationGroup.querySelector('.maplibregl-ctrl-zoom-out');
        if (zoomOutButton) {
          // Insert after zoom-out button (as the last button in the group)
          navigationGroup.insertBefore(navButton, zoomOutButton.nextSibling);
        } else {
          // Fallback: append at the end if zoom-out not found
          navigationGroup.appendChild(navButton);
        }
      }
    };

    // Wait for map to load and navigation control to be added
    const tryAddButton = () => {
      if (map.loaded()) {
        // Give a small delay to ensure navigation control is added
        setTimeout(addButtonToNavigationGroup, 100);
      }
    };

    if (map.loaded()) {
      tryAddButton();
    } else {
      map.once('load', tryAddButton);
    }

    // Also try after a short delay in case navigation control is added later
    const timeoutId = setTimeout(addButtonToNavigationGroup, 500);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (buttonRef.current) {
        // Clear the enable check interval if it exists
        if (buttonRef.current._enableCheckInterval) {
          clearInterval(buttonRef.current._enableCheckInterval);
        }
        if (buttonRef.current.parentNode) {
          buttonRef.current.parentNode.removeChild(buttonRef.current);
        }
        buttonRef.current = null;
      }
      if (geolocateControlRef.current) {
        try {
          // Properly remove the control and its hidden container
          const container = geolocateControlRef.current._container;
          if (container && container.parentNode) {
            container.parentNode.removeChild(container);
          }
          geolocateControlRef.current.onRemove(map);
        } catch (e) {
          console.warn('Error removing geolocate control:', e);
        }
        geolocateControlRef.current = null;
      }
    };
  }, [theme.direction]);

  return null;
};

export default MapCurrentLocation;
