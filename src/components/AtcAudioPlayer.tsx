// src/components/AtcAudioPlayer.tsx
import React, { useState } from 'react';
import { NearestAirport } from '../utils/airportUtils';

interface AtcAudioPlayerProps {
  nearestAirport: NearestAirport;
}

const AtcAudioPlayer: React.FC<AtcAudioPlayerProps> = ({ nearestAirport }) => {
  const [selectedFrequency, setSelectedFrequency] = useState<string>('tower');

  const frequencies = [
    { id: 'tower', label: 'Tower' },
    { id: 'ground', label: 'Ground' },
    { id: 'approach', label: 'Approach' },
    { id: 'departure', label: 'Departure' }
  ];

  const openLiveAtc = () => {
    const url = `https://www.liveatc.net/hlisten.php?mount=${nearestAirport.icao.toLowerCase()}_${selectedFrequency}&icao=${nearestAirport.icao}`;
    window.open(url, '_blank', 'width=400,height=600');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-black">LiveATC Feed</h3>
      </div>

      <div className="mb-4">
        <div className="text-sm text-black mb-2">Current Airport:</div>
        <div className="text-black font-medium">{nearestAirport.name}</div>
        <div className="text-sm text-gray-500">{nearestAirport.icao} ({nearestAirport.distance} nm)</div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-black mb-2">Select Frequency:</div>
        <div className="grid grid-cols-2 gap-2">
          {frequencies.map((freq) => (
            <button
              key={freq.id}
              onClick={() => setSelectedFrequency(freq.id)}
              className={`px-3 py-1 rounded text-sm ${
                selectedFrequency === freq.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {freq.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={openLiveAtc}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Listen to {selectedFrequency.charAt(0).toUpperCase() + selectedFrequency.slice(1)} Frequency
      </button>
    </div>
  );
};

export default AtcAudioPlayer;