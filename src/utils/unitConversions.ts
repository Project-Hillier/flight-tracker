// src/utils/unitConversions.ts

export const UnitConversions = {
    // Distance conversions
    metersToFeet: (meters: number): number => meters * 3.28084,
    
    // Speed conversions
    msToKnots: (ms: number): number => ms * 1.94384,
    msToKmh: (ms: number): number => ms * 3.6,
    
    // Format number to specified decimal places
    formatNumber: (num: number, decimals: number = 0): string => {
      return num.toFixed(decimals);
    },
  
    // Format bearing to cardinal direction
    degreesToCardinal: (degrees: number): string => {
      const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                        'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
      const index = Math.round(((degrees % 360) / 22.5));
      return cardinals[index % 16];
    }
  };
  