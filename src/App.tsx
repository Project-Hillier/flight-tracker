// src/App.tsx
import React from 'react';
import MapView from './components/MapView';
import FlightTracker from './components/FlightTracker';

function App() {
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  if (!mapboxToken) {
    return <div>Please add your Mapbox access token to .env file</div>;
  }

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      <MapView accessToken={mapboxToken} />
      <FlightTracker mapboxToken={mapboxToken} />
    </div>
  );
}

export default App;