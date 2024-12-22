// src/components/FlightScheduler.tsx
import React, { useState } from 'react';
import { ScheduledFlight } from '../types/Flight';

interface FlightSchedulerProps {
  onScheduleFlight: (flight: Omit<ScheduledFlight, 'id' | 'isActive' | 'flight'>) => void;
  scheduledFlights: ScheduledFlight[];
  maxFlights?: number;
}

const FlightScheduler: React.FC<FlightSchedulerProps> = ({ 
  onScheduleFlight, 
  scheduledFlights,
  maxFlights = 5 
}) => {
  const [searchId, setSearchId] = useState('');
  const [isCallsign, setIsCallsign] = useState(true);
  const [startTime, setStartTime] = useState('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (scheduledFlights.length >= maxFlights) {
      setError(`Maximum of ${maxFlights} scheduled flights allowed`);
      return;
    }

    const startDateTime = new Date(startTime);
    if (isNaN(startDateTime.getTime())) {
      setError('Please enter a valid start time');
      return;
    }

    if (startDateTime < new Date()) {
      setError('Start time must be in the future');
      return;
    }

    onScheduleFlight({
      searchId: searchId.trim(),
      isCallsign,
      startTime: startDateTime
    });

    // Clear form
    setSearchId('');
    setStartTime('');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
      <h2 className="text-lg font-bold text-black mb-4">Schedule Flight Tracking</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Type Toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsCallsign(true)}
            className={`flex-1 px-3 py-1 rounded ${
              isCallsign ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Callsign
          </button>
          <button
            type="button"
            onClick={() => setIsCallsign(false)}
            className={`flex-1 px-3 py-1 rounded ${
              !isCallsign ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Hex ID
          </button>
        </div>

        {/* Flight ID Input */}
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value.toUpperCase())}
          placeholder={`Enter flight ${isCallsign ? 'callsign' : 'hex ID'}`}
          className="w-full p-2 border rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Start Time Input */}
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full p-2 border rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Schedule Flight
        </button>

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}
      </form>

      {/* Scheduled Flights List */}
      <div className="mt-4">
        <h3 className="font-bold text-black mb-2">Scheduled Flights ({scheduledFlights.length}/{maxFlights})</h3>
        {scheduledFlights.map(flight => (
          <div key={flight.id} className="p-2 border rounded mb-2">
            <div className="text-black">
              {flight.isCallsign ? 'Callsign: ' : 'Hex ID: '}{flight.searchId}
            </div>
            <div className="text-sm text-gray-600">
              Starts: {flight.startTime.toLocaleString()}
            </div>
            {flight.isActive && (
              <div className="text-sm text-green-600">
                Currently tracking
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlightScheduler;