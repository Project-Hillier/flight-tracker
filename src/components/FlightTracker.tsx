// src/components/FlightTracker.tsx
import React, { useState, useEffect } from 'react';
import openSkyService from '../services/openSkyService';
import mapboxService from '../services/mapboxService';
import FlightInfoPanel from './FlightInfoPanel';
import { Flight } from '../types/Flight';

interface FlightTrackerProps {
  mapboxToken: string;
}

const FlightTracker: React.FC<FlightTrackerProps> = ({ mapboxToken }) => {
  const [searchId, setSearchId] = useState<string>('');
  const [isCallsign, setIsCallsign] = useState<boolean>(true);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string>('');
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (trackingInterval) {
        openSkyService.stopTracking(trackingInterval);
      }
    };
  }, [trackingInterval]);

  useEffect(() => {
    if (flight) {
      mapboxService.updatePlaneWithFlight(flight);
    }
  }, [flight]);

  const startTracking = async () => {
    if (!searchId.trim()) {
      setError('Please enter a flight callsign or hex ID');
      return;
    }

    try {
      setError('');
      setIsTracking(true);

      const interval = openSkyService.trackFlight(
        searchId.trim(),
        isCallsign,
        (updatedFlight) => {
          if (updatedFlight) {
            setFlight(updatedFlight);
          } else {
            setError(`Flight not found with ${isCallsign ? 'callsign' : 'hex ID'}: ${searchId}`);
            stopTracking();
          }
        }
      );

      setTrackingInterval(interval);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track flight');
      setIsTracking(false);
    }
  };

  const stopTracking = () => {
    if (trackingInterval) {
      openSkyService.stopTracking(trackingInterval);
      setTrackingInterval(null);
    }
    setIsTracking(false);
    mapboxService.removePlaneMarker();
    setFlight(null);
  };

  return (
    <div className="fixed left-4 top-4 bottom-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
      {/* Search Panel */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setIsCallsign(true)}
            className={`flex-1 px-3 py-1 rounded ${
              isCallsign ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Callsign
          </button>
          <button
            onClick={() => setIsCallsign(false)}
            className={`flex-1 px-3 py-1 rounded ${
              !isCallsign ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Hex ID
          </button>
        </div>

        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value.toUpperCase())}
          placeholder={`Enter flight ${isCallsign ? 'callsign' : 'hex ID'}`}
          className="w-full p-2 border rounded text-black mb-2"
          disabled={isTracking}
        />

        <div className="flex gap-2">
          <button
            onClick={startTracking}
            disabled={isTracking || !searchId}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            Start Tracking
          </button>
          <button
            onClick={stopTracking}
            disabled={!isTracking}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            Stop Tracking
          </button>
        </div>

        {error && (
          <div className="mt-2 text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Scrollable Flight Info */}
      <div className="flex-1 overflow-y-auto">
        {flight && <FlightInfoPanel flight={flight} isTracking={isTracking} />}
      </div>
    </div>
  );
};

export default FlightTracker;