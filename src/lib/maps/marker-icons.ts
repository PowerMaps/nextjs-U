// Marker icon configurations for different POI types
export const getMarkerIcon = (type: 'origin' | 'destination' | 'poi' = 'poi'): google.maps.Icon => {
  const baseConfig = {
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 32)
  };

  switch (type) {
    case 'origin':
      return {
        ...baseConfig,
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#22c55e" stroke="#ffffff" stroke-width="2"/>
            <circle cx="16" cy="16" r="6" fill="#ffffff"/>
            <text x="16" y="20" text-anchor="middle" fill="#22c55e" font-size="10" font-weight="bold">A</text>
          </svg>
        `)
      };
    
    case 'destination':
      return {
        ...baseConfig,
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
            <circle cx="16" cy="16" r="6" fill="#ffffff"/>
            <text x="16" y="20" text-anchor="middle" fill="#ef4444" font-size="10" font-weight="bold">B</text>
          </svg>
        `)
      };
    
    case 'poi':
    default:
      return {
        ...baseConfig,
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2C10.48 2 6 6.48 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.52-4.48-10-10-10z" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
            <circle cx="16" cy="12" r="4" fill="#ffffff"/>
          </svg>
        `)
      };
  }
};

// Alternative: Simple colored circle markers
export const getSimpleMarkerIcon = (color: string = '#3b82f6'): google.maps.Icon => {
  return {
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="#ffffff" stroke-width="2"/>
      </svg>
    `),
    scaledSize: new google.maps.Size(24, 24),
    anchor: new google.maps.Point(12, 12)
  };
};