// src/services/flightSchedulerService.ts
import { ScheduledFlight } from '../types/Flight';
import openSkyService from './openSkyService';

class FlightSchedulerService {
  private scheduledFlights: ScheduledFlight[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 60 * 1000; // Check every minute
  private readonly PRESTART_MINUTES = 10; // Start looking 10 minutes before scheduled time

  constructor() {
    this.startCheckingSchedule();
  }

  private startCheckingSchedule() {
    if (this.checkInterval) return;

    this.checkInterval = setInterval(() => {
      this.checkScheduledFlights();
    }, this.CHECK_INTERVAL);
  }

  private async checkScheduledFlights() {
    const now = new Date();
    
    for (const flight of this.scheduledFlights) {
      const timeDiff = flight.startTime.getTime() - now.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      // Start looking for flight if within prestart window
      if (!flight.isActive && minutesDiff <= this.PRESTART_MINUTES && minutesDiff > -30) {
        await this.startTrackingFlight(flight);
      }
      
      // Stop tracking if more than 30 minutes past start time
      if (flight.isActive && minutesDiff < -30) {
        this.stopTrackingFlight(flight);
      }
    }

    // Clean up old flights
    this.scheduledFlights = this.scheduledFlights.filter(flight => {
      const minutesPast = (now.getTime() - flight.startTime.getTime()) / (1000 * 60);
      return minutesPast < 60; // Remove flights more than 1 hour old
    });
  }

  private async startTrackingFlight(flight: ScheduledFlight) {
    try {
      const flightData = flight.isCallsign 
        ? await openSkyService.getFlightByCallsign(flight.searchId)
        : await openSkyService.getFlightByHexId(flight.searchId);

      if (flightData) {
        flight.isActive = true;
        flight.flight = flightData;
      }
    } catch (error) {
      console.error('Failed to start tracking flight:', error);
    }
  }

  private stopTrackingFlight(flight: ScheduledFlight) {
    flight.isActive = false;
    flight.flight = null;
  }

  addScheduledFlight(flightData: Omit<ScheduledFlight, 'id' | 'isActive' | 'flight'>): ScheduledFlight {
    const newFlight: ScheduledFlight = {
      ...flightData,
      id: Math.random().toString(36).substring(7),
      isActive: false,
      flight: null
    };

    this.scheduledFlights.push(newFlight);
    return newFlight;
  }

  getScheduledFlights(): ScheduledFlight[] {
    return [...this.scheduledFlights];
  }

  cleanup() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export default new FlightSchedulerService();