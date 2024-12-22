// src/components/FlightInfoPanel.tsx
import React, { useMemo } from 'react';
import { Flight } from '../types/Flight';
import AtcAudioPlayer from './AtcAudioPlayer';
import { findNearestAirport } from '../utils/airportUtils';

interface FlightInfoPanelProps {
  flight: Flight | null;
  isTracking: boolean;
}

const FlightInfoPanel: React.FC<FlightInfoPanelProps> = ({ flight, isTracking }) => {
  if (!flight) return null;

  // Calculate nearest airport when flight position changes
  const nearestAirport = useMemo(() => 
    findNearestAirport(flight.latitude, flight.longitude),
    [flight.latitude, flight.longitude]
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
      {/* Flight Identification */}
      <div className="border-b pb-2">
        <h2 className="text-lg font-bold text-black mb-1">{flight.callsign || 'Unknown'}</h2>
        <div className="text-sm text-black">
          Hex: {flight.hexId.toUpperCase()}
          <span className="mx-2">•</span>
          {flight.originCountry}
        </div>
      </div>

      {/* Flight Data */}
      <div className="space-y-3">
        {/* Altitude */}
        <div>
          <h3 className="font-semibold text-black mb-1">Altitude: {Math.round(flight.altitude * 3.28084)} feet</h3>
          <div className="text-black"></div>
        </div>

        {/* Speed */}
        <div>
          <h3 className="font-semibold text-black mb-1">Ground Speed: {Math.round(flight.velocity)} m/s</h3>
          <div className="text-black"></div>
        </div>

        {/* Heading */}
        <div>
          <h3 className="font-semibold text-black mb-1">Heading: {Math.round(flight.heading)}°</h3>
          <div className="text-black"></div>
        </div>

        {/* Position */}
        <div>
          <h3 className="font-semibold text-black mb-1">Position: Lat: {flight.latitude.toFixed(4)}°, Lon: {flight.longitude.toFixed(4)}°</h3>
          <div className="space-y-1 text-sm text-black">
            <div></div>
            <div></div>
          </div>
        </div>
      </div>

      {/* Last Update */}
      <div className="text-xs text-black pt-2 border-t">
        Last Updated: {new Date(flight.timestamp * 1000).toLocaleTimeString()}
      </div>

      {/* ATC Audio Player */}
      {nearestAirport && (
        <AtcAudioPlayer nearestAirport={nearestAirport} />
      )}
    </div>
  );
};

export default FlightInfoPanel;