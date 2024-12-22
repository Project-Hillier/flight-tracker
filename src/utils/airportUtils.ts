// src/utils/airportUtils.ts
import { airportsGeoJSON } from '../data/airports';

export interface NearestAirport {
  icao: string;
  name: string;
  distance: number;  // in nautical miles
  feeds: {
    tower?: string | string[];
    ground?: string | string[];
    approach?: string | string[];
    departure?: string | string[];
    atis?: string;
  };
}

export function findNearestAirport(lat: number, lon: number): NearestAirport | null {
  if (!airportsGeoJSON.features.length) return null;

  let nearest = null;
  let shortestDistance = Infinity;

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3440.065; // Earth's radius in nautical miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  airportsGeoJSON.features.forEach(airport => {
    const [airportLon, airportLat] = airport.geometry.coordinates;
    const distance = calculateDistance(lat, lon, airportLat, airportLon);

    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearest = {
        icao: airport.properties.icao,
        name: airport.properties.name,
        distance: Math.round(distance),
        feeds: airport.properties.feeds
      };
    }
  });

  return nearest;
}