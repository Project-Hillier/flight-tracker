// src/types/Flight.ts
export interface Flight {
  hexId: string;
  callsign?: string;
  originCountry?: string;
  longitude: number;
  latitude: number;
  altitude: number;
  velocity: number;
  heading: number;
  verticalRate: number;
  timestamp: number;
}

export interface ScheduledFlight {
  id: string;           // Unique identifier for this scheduled flight
  searchId: string;     // Hex ID or callsign to search for
  isCallsign: boolean;  // Whether searchId is a callsign
  startTime: Date;      // When to start tracking
  isActive: boolean;    // Whether flight is currently being tracked
  flight: Flight | null;// Current flight data if active
}

export interface FlightTrackingResponse {
  states: any[];
  time: number;
}