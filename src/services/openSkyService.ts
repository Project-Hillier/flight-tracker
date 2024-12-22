// src/services/openSkyService.ts
import axios from 'axios';
import { Flight, FlightTrackingResponse } from '../types/Flight';

class OpenSkyService {
  private baseUrl = 'https://opensky-network.org/api';
  private readonly UPDATE_INTERVAL = 5 * 60 * 1000; // Strict 5-minute interval
  private lastFetchTime: number = 0;
  private cachedFlight: Flight | null = null;

  private getAuthConfig() {
    const username = import.meta.env.VITE_OPENSKY_USERNAME;
    const password = import.meta.env.VITE_OPENSKY_PASSWORD;
    
    if (username && password) {
      return { auth: { username, password } };
    }
    return {};
  }

  async getFlightByCallsign(callsign: string, force: boolean = false): Promise<Flight | null> {
    try {
      console.log('Fetching flight data for callsign:', callsign);
      
      // Get all states and filter by callsign
      const response = await axios.get(`${this.baseUrl}/states/all`, {
        ...this.getAuthConfig()
      });

      if (!response.data?.states) {
        return null;
      }

      // Find the flight with matching callsign (case-insensitive and trim spaces)
      const flight = response.data.states.find((state: any[]) => 
        state[1]?.trim().toLowerCase() === callsign.trim().toLowerCase()
      );

      if (!flight) {
        console.log('No flight found with callsign:', callsign);
        return null;
      }

      const flightData: Flight = {
        hexId: flight[0],
        callsign: flight[1] ? flight[1].trim() : undefined,
        originCountry: flight[2],
        longitude: parseFloat(flight[5]) || 0,
        latitude: parseFloat(flight[6]) || 0,
        altitude: parseFloat(flight[7]) || 0,
        velocity: parseFloat(flight[9]) || 0,
        heading: parseFloat(flight[10]) || 0,
        verticalRate: parseFloat(flight[11]) || 0,
        timestamp: response.data.time
      };

      this.cachedFlight = flightData;
      this.lastFetchTime = Date.now();

      return flightData;

    } catch (error) {
      console.error('Error fetching flight data:', error);
      throw error;
    }
  }

  // Keep existing getFlightByHexId method for backward compatibility
  async getFlightByHexId(hexId: string, force: boolean = false): Promise<Flight | null> {
    const now = Date.now();
    
    if (!force && this.cachedFlight && 
        this.cachedFlight.hexId === hexId && 
        now - this.lastFetchTime < this.UPDATE_INTERVAL) {
      console.log('Returning cached flight data');
      return this.cachedFlight;
    }

    try {
      console.log('Fetching fresh flight data');
      const response = await axios.get(`${this.baseUrl}/states/all`, {
        params: {
          icao24: hexId.toLowerCase(),
          extended: 1
        },
        ...this.getAuthConfig()
      });

      if (!response.data?.states?.[0]) {
        return null;
      }

      const flightData = response.data.states[0];
      this.lastFetchTime = now;
      
      this.cachedFlight = {
        hexId: flightData[0],
        callsign: flightData[1] ? flightData[1].trim() : undefined,
        originCountry: flightData[2],
        longitude: parseFloat(flightData[5]) || 0,
        latitude: parseFloat(flightData[6]) || 0,
        altitude: parseFloat(flightData[7]) || 0,
        velocity: parseFloat(flightData[9]) || 0,
        heading: parseFloat(flightData[10]) || 0,
        verticalRate: parseFloat(flightData[11]) || 0,
        timestamp: response.data.time
      };

      return this.cachedFlight;

    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        console.error('Rate limit reached');
        return this.cachedFlight;
      }
      throw error;
    }
  }

  trackFlight(
    identifier: string,
    isCallsign: boolean = false,
    callback: (flight: Flight | null) => void
  ): NodeJS.Timeout {
    // Initial fetch
    const fetchMethod = isCallsign ? this.getFlightByCallsign.bind(this) : this.getFlightByHexId.bind(this);
    
    fetchMethod(identifier, true)
      .then(callback)
      .catch(error => {
        console.error('Initial tracking fetch failed:', error);
        callback(null);
      });

    // Set up strict 5-minute interval updates
    return setInterval(async () => {
      try {
        const flightData = await fetchMethod(identifier);
        callback(flightData);
      } catch (error) {
        console.error('Tracking update failed:', error);
        callback(null);
      }
    }, this.UPDATE_INTERVAL);
  }

  stopTracking(intervalId: NodeJS.Timeout): void {
    clearInterval(intervalId);
  }
}

export default new OpenSkyService();