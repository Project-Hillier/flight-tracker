// src/components/MapView.tsx
import React, { useEffect, useRef } from 'react';
import mapboxService from '../services/mapboxService';

interface MapViewProps {
  accessToken: string;
}

const MapView: React.FC<MapViewProps> = ({ accessToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Initialize map using our service
      const map = mapboxService.initializeMap(
        mapContainer.current,
        accessToken
      );

      // Cleanup when component unmounts
      return () => {
        mapboxService.cleanup();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [accessToken]);

  return (
    <div 
      ref={mapContainer} 
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        height: '100vh',
        width: '100vw'
      }}
    />
  );
};

export default MapView;