import { useEffect } from 'react';
import { map } from '../core/MapView';

const MarkerAnimations = () => {
  useEffect(() => {
    // Add smooth marker animations
    const addMarkerAnimations = () => {
      // Add CSS animations for marker interactions
      const style = document.createElement('style');
      style.textContent = `
        .maplibregl-marker {
          transition: all 0.3s ease;
        }
        
        .maplibregl-marker:hover {
          transform: scale(1.1);
          z-index: 1000;
        }
        
        .maplibregl-marker.selected {
          transform: scale(1.2);
          z-index: 1001;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(6, 182, 212, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(6, 182, 212, 0);
          }
        }
        
        .maplibregl-marker.moving {
          animation: bounce 1s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-5px);
          }
          60% {
            transform: translateY(-3px);
          }
        }
        
        .maplibregl-marker.offline {
          opacity: 0.6;
          filter: grayscale(100%);
        }
        
        .maplibregl-marker.online {
          opacity: 1;
          filter: none;
        }
      `;
      document.head.appendChild(style);
    };

    addMarkerAnimations();

    return () => {
      // Cleanup animations
      const existingStyle = document.querySelector('style[data-marker-animations]');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return null;
};

export default MarkerAnimations;









