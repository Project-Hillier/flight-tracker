// src/services/mapboxService.ts
import mapboxgl from 'mapbox-gl';
import { Flight } from '../types/Flight';

class MapboxService {
  private map: mapboxgl.Map | null = null;
  private planeMarker: mapboxgl.Marker | null = null;
  private readonly defaultCenter: [number, number] = [-97.0364, 39.8097];
  private animationFrameId: number | null = null;
  private currentPosition: { lng: number; lat: number } | null = null;
  private lastUpdateTime: number = Date.now();
  private currentHeading: number = 0;
  private currentSpeed: number = 0;

  private createPlaneMarkerElement(): HTMLDivElement {
    const el = document.createElement('div');
    el.style.width = '48px';
    el.style.height = '48px';
    el.style.backgroundImage = 'url(/plane-blue.svg)';
    el.style.backgroundSize = 'contain';
    el.style.backgroundRepeat = 'no-repeat';
    return el;
  }

  private calculateNextPosition(deltaSeconds: number): [number, number] {
    if (!this.currentPosition) return [0, 0];

    // Convert speed from m/s to degrees/second
    const speedInDegreesPerSecond = this.currentSpeed / 111111;
    
    // Calculate distance moved in this time step
    const distance = speedInDegreesPerSecond * deltaSeconds;

    // Convert aviation heading to radians
    // Aviation: 0° = North, 90° = East, 180° = South, 270° = West
    // Math: 0° = East, 90° = North, 180° = West, 270° = South
    const headingRadians = (360 - this.currentHeading + 90) * (Math.PI / 180);

    // Calculate lat/lng changes
    const latChange = distance * Math.sin(headingRadians);
    const lngChange = distance * Math.cos(headingRadians) / 
                     Math.cos(this.currentPosition.lat * (Math.PI / 180));
    /*
    console.log('Position Calculation:', {
        heading: this.currentHeading,
        mathAngle: (360 - this.currentHeading + 90),
        distance,
        latChange,
        lngChange,
        newLat: this.currentPosition.lat + latChange,
        newLng: this.currentPosition.lng + lngChange
    });
    */
    return [
        this.currentPosition.lng + lngChange,
        this.currentPosition.lat + latChange
    ];
  }
  

  private animate = () => {
    const now = Date.now();
    const deltaSeconds = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    if (this.planeMarker && this.currentPosition) {
      const [newLng, newLat] = this.calculateNextPosition(deltaSeconds);
      /*
      console.log('Animation Update:', {
        heading: this.currentHeading,
        speed: this.currentSpeed,
        oldPos: [this.currentPosition.lng, this.currentPosition.lat],
        newPos: [newLng, newLat],
        deltaTime: deltaSeconds
      });
      */
      this.currentPosition = { lng: newLng, lat: newLat };
      this.planeMarker.setLngLat([newLng, newLat]);
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  initializeMap(
    containerRef: HTMLElement,
    accessToken: string,
    initialCenter?: [number, number]
  ): mapboxgl.Map {
    mapboxgl.accessToken = accessToken;

    this.map = new mapboxgl.Map({
      container: containerRef,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCenter || this.defaultCenter,
      zoom: 4,
      attributionControl: true
    });

    this.map.addControl(new mapboxgl.NavigationControl());
    return this.map;
  }

  updatePlaneWithFlight(flight: Flight): void {
    if (!this.map) return;

    // Update current values
    this.currentPosition = { lng: flight.longitude, lat: flight.latitude };
    this.currentHeading = flight.heading;
    this.currentSpeed = flight.velocity;
    this.lastUpdateTime = Date.now();

    // Adjust icon rotation (icon points left by default)
    const iconRotation = flight.heading - 270;

    if (!this.planeMarker) {
      // Create new marker
      const el = this.createPlaneMarkerElement();
      this.planeMarker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
        rotationAlignment: 'map',
        pitchAlignment: 'map',
        rotation: iconRotation
      })
        .setLngLat([flight.longitude, flight.latitude])
        .addTo(this.map);

      // Start animation
      this.animate();
    } else {
      // Update existing marker
      this.planeMarker.setLngLat([flight.longitude, flight.latitude]);
      this.planeMarker.setRotation(iconRotation);
    }

    // Center map on plane
    this.map.easeTo({
      center: [flight.longitude, flight.latitude],
      duration: 1000
    });
  }

  removePlaneMarker(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    if (this.planeMarker) {
      this.planeMarker.remove();
      this.planeMarker = null;
    }
    
    this.currentPosition = null;
  }

  cleanup(): void {
    this.removePlaneMarker();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}

export default new MapboxService();