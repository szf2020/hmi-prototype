import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './NavigationApp.css';
import MapSearchOverlay from './MapSearchOverlay';

// Module-level variable to track initialization globally
let globalMapInstance = null;

// ===== PRESET FAKE LOCATION =====
// San Mateo Downtown, CA coordinates
const FAKE_CURRENT_LOCATION = {
  latitude: 37.5630,
  longitude: -122.3255
};

function NavigationApp() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const geolocateControl = useRef(null);
  const carMarker = useRef(null);
  const destinationMarker = useRef(null);
  const isInitialized = useRef(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationStatus, setLocationStatus] = useState('requesting');
  const [isSearchOpen, setIsSearchOpen] = useState(true); // Show by default
  const [searchDestination, setSearchDestination] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [overlayPanelSide, setOverlayPanelSide] = useState('left'); // Track which side the overlay is on

  useEffect(() => {
    // Prevent double initialization (React StrictMode guard)
    if (isInitialized.current) {
      console.log('Already initialized, skipping');
      return;
    }
    if (map.current) {
      console.log('Map ref exists, skipping');
      return;
    }
    if (globalMapInstance) {
      console.log('Global map instance exists, skipping');
      return;
    }
    
    // Wait for container to be ready
    if (!mapContainer.current) {
      console.log('Container not ready, skipping');
      return;
    }
    
    // Check if container already has maplibregl elements (most important check!)
    const hasMapLibreElements = mapContainer.current.querySelector('.maplibregl-canvas-container');
    if (hasMapLibreElements) {
      console.log('MapLibre elements already exist in container, skipping initialization');
      return;
    }
    
    console.log('Initializing map...');
    
    // Completely clear container to ensure clean state
    while (mapContainer.current.firstChild) {
      mapContainer.current.removeChild(mapContainer.current.firstChild);
    }
    
    // Mark as initialized IMMEDIATELY to prevent race conditions
    isInitialized.current = true;

    // Get user's location first, then initialize map
    const initializeMap = (userLocation) => {
      try {
        console.log('Initializing map with container:', mapContainer.current);
        console.log('Container dimensions:', {
          width: mapContainer.current?.offsetWidth,
          height: mapContainer.current?.offsetHeight
        });
        
        const center = userLocation 
          ? [userLocation.longitude, userLocation.latitude]
          : [-122.4194, 37.7749]; // Fallback to San Francisco
        
        console.log('Map center:', center, userLocation ? '(your location)' : '(default)');
        
        const mapInstance = new maplibregl.Map({
          container: mapContainer.current,
          // Satellite imagery from ESRI World Imagery
          style: {
            version: 8,
            sources: {
              'satellite': {
                type: 'raster',
                tiles: [
                  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                ],
                tileSize: 256,
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              },
              'labels': {
                type: 'raster',
                tiles: [
                  'https://a.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png',
                  'https://b.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png',
                  'https://c.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png',
                  'https://d.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png'
                ],
                tileSize: 256
              },
              'openmaptiles': {
                type: 'vector',
                tiles: ['https://tiles.openfreemap.org/planet/{z}/{x}/{y}.pbf'],
                attribution: '© OpenMapTiles © OpenStreetMap'
              }
            },
            layers: [
     
              {
                id: 'satellite-layer',
                type: 'raster',
                source: 'satellite',
                minzoom: 0,
                maxzoom: 22,
                paint: {
                  'raster-opacity': 0.5
                }
              },
              {
                id: 'labels-layer',
                type: 'raster',
                source: 'labels',
                paint: {
                  'raster-opacity': 1
                }
              }
            ],
            glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf'
          },
          center: center,
          zoom: 16,
          pitch: 0,
          bearing: 0,
          attributionControl: false // Hide attribution control
        });

        // Store in both ref and global
        map.current = mapInstance;
        globalMapInstance = mapInstance;

        // Map controls hidden for cleaner interface
        // Uncomment below to show navigation and geolocation controls
        /*
        // Add navigation controls
        mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');

        // Add geolocate control to track user location
        // Hide default marker since we're using custom car icon
        geolocateControl.current = new maplibregl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
            timeout: 6000
          },
          trackUserLocation: true,
          showUserLocation: false, // Hide default blue dot
          showAccuracyCircle: false // Hide accuracy circle
        });

        mapInstance.addControl(geolocateControl.current, 'top-right');

        // Listen for geolocation events to update car marker position
        geolocateControl.current.on('geolocate', (e) => {
          console.log('Location updated:', e.coords);
          setLocationStatus('found');
          
          // Update car marker position
          if (carMarker.current) {
            carMarker.current.setLngLat([e.coords.longitude, e.coords.latitude]);
            
            // Rotate car based on heading if available
            if (e.coords.heading !== null && e.coords.heading !== undefined) {
              const carElement = carMarker.current.getElement();
              if (carElement) {
                carElement.style.transform = `rotate(${e.coords.heading}deg)`;
              }
            }
          } else if (map.current) {
            // Create marker if it doesn't exist yet
            const carElement = createCarMarker();
            carMarker.current = new maplibregl.Marker({
              element: carElement,
              anchor: 'center',
              rotationAlignment: 'map',
              pitchAlignment: 'map'
            })
              .setLngLat([e.coords.longitude, e.coords.latitude])
              .addTo(map.current);
          }
        });

        geolocateControl.current.on('error', (e) => {
          console.warn('Geolocation error:', e.message);
          if (locationStatus !== 'found') {
            setLocationStatus('error');
          }
        });

        geolocateControl.current.on('trackuserlocationstart', () => {
          console.log('Started tracking user location');
          setLocationStatus('tracking');
        });
        */

        // Wait for map to load before adding car marker and triggering geolocation
        mapInstance.on('load', () => {
          setMapLoaded(true);
          console.log('Map loaded successfully');
          setLocationStatus(userLocation ? 'found' : 'error');
          
          // Add car marker if we have user location
          if (userLocation) {
            // Create SVG as a data URL for MapLibre image
            const carSvg = `
              <svg width="98" height="98" viewBox="0 0 98 98" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_d_5753_109516)">
                  <path d="M46.3208 14.5407L17.2586 73.3893C16.0454 75.846 19.4325 78.0679 21.7988 76.3675L47.1469 58.1535C48.2256 57.3783 49.7822 57.3783 50.861 58.1535L76.209 76.3675C78.5753 78.0679 81.9624 75.8461 80.7492 73.3893L51.6871 14.5407C50.6725 12.4864 47.3353 12.4864 46.3208 14.5407Z" fill="url(#paint0_linear_5753_109516)"/>
                  <path d="M46.3208 14.5407L17.2586 73.3893C16.0454 75.846 19.4325 78.0679 21.7988 76.3675L47.1469 58.1535C48.2256 57.3783 49.7822 57.3783 50.861 58.1535L76.209 76.3675C78.5753 78.0679 81.9624 75.8461 80.7492 73.3893L51.6871 14.5407C50.6725 12.4864 47.3353 12.4864 46.3208 14.5407Z" stroke="#F0F4F8" stroke-width="2"/>
                </g>
                <defs>
                  <filter id="filter0_d_5753_109516" x="0" y="0" width="98.0078" height="97.9653" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feOffset dy="4"/>
                    <feGaussianBlur stdDeviation="8"/>
                    <feComposite in2="hardAlpha" operator="out"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.7 0"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_5753_109516"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_5753_109516" result="shape"/>
                  </filter>
                  <linearGradient id="paint0_linear_5753_109516" x1="17.0039" y1="74" x2="81.0039" y2="74" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#9D9D9D"/>
                    <stop offset="0.499388" stop-color="#D6D6D6"/>
                    <stop offset="0.503297" stop-color="#8A8A8A"/>
                    <stop offset="1" stop-color="#7E7E7E"/>
                  </linearGradient>
                </defs>
              </svg>
            `;
            
            // Convert SVG to image and add to map
            const img = new Image(98, 98);
            img.onload = () => {
              if (!mapInstance.hasImage('car-icon')) {
                mapInstance.addImage('car-icon', img);
              }
              
              // Create GeoJSON for car position
              const carGeoJSON = {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: [userLocation.longitude, userLocation.latitude]
                }
              };
              
              // Add car position source
              mapInstance.addSource('car-position', {
                type: 'geojson',
                data: carGeoJSON
              });
              
              // Add car marker as symbol layer
              mapInstance.addLayer({
                id: 'car-marker',
                type: 'symbol',
                source: 'car-position',
                layout: {
                  'icon-image': 'car-icon',
                  'icon-size': 0.8,
                  'icon-allow-overlap': true,
                  'icon-ignore-placement': true,
                  'icon-rotation-alignment': 'map'
                }
              });
              
              console.log('Car marker added at:', userLocation);
            };
            
            // Create blob URL for SVG
            const blob = new Blob([carSvg], { type: 'image/svg+xml' });
            img.src = URL.createObjectURL(blob);
            
            // ===== REAL-TIME LOCATION TRACKING (COMMENTED OUT) =====
            // Uncomment below to enable real-time location tracking
            /*
            setTimeout(() => {
              if (geolocateControl.current) {
                geolocateControl.current.trigger();
              }
            }, 100);
            */
          }
        });

        // Log errors
        mapInstance.on('error', (e) => {
          console.error('Map error:', e);
        });

      } catch (error) {
        console.error('Failed to initialize map:', error);
        setLocationStatus('error');
      }
    };
    
    console.log('Using preset fake location:', FAKE_CURRENT_LOCATION);
    initializeMap(FAKE_CURRENT_LOCATION);
    
    // ===== REAL GEOLOCATION CODE (COMMENTED OUT FOR FUTURE USE) =====
    // Uncomment the code below to use real device location instead of fake location
    /*
    if ('geolocation' in navigator) {
      console.log('Requesting your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Got your location:', position.coords);
          initializeMap({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Could not get location:', error.message);
          setLocationStatus('error');
          initializeMap(null); // Initialize with default location
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.warn('Geolocation not supported');
      setLocationStatus('error');
      initializeMap(null);
    }
    */

    return () => {
      // Cleanup function - only run when component truly unmounts
      if (map.current) {
        // Remove car marker layer and source
        if (map.current.getLayer('car-marker')) {
          map.current.removeLayer('car-marker');
        }
        if (map.current.getSource('car-position')) {
          map.current.removeSource('car-position');
        }
        
        // Remove destination marker layers
        if (map.current.getLayer('destination-marker-inner')) {
          map.current.removeLayer('destination-marker-inner');
        }
        if (map.current.getLayer('destination-marker-outer')) {
          map.current.removeLayer('destination-marker-outer');
        }
        if (map.current.getLayer('destination-marker-glow')) {
          map.current.removeLayer('destination-marker-glow');
        }
        if (map.current.getSource('destination')) {
          map.current.removeSource('destination');
        }
        
        // Remove route layers
        if (map.current.getLayer('route-line')) {
          map.current.removeLayer('route-line');
        }
        if (map.current.getLayer('route-outline')) {
          map.current.removeLayer('route-outline');
        }
        if (map.current.getLayer('route-shadow')) {
          map.current.removeLayer('route-shadow');
        }
        if (map.current.getSource('route')) {
          map.current.removeSource('route');
        }
        
        map.current.remove();
        map.current = null;
      }
      
      if (destinationMarker.current) {
        destinationMarker.current.remove();
        destinationMarker.current = null;
      }
      if (carMarker.current) {
        carMarker.current = null;
      }
      globalMapInstance = null;
      isInitialized.current = false;
    };
  }, []);

  // Predefined destinations for simulation
  const DESTINATIONS = {
    'Home': {
      name: 'Home - Foster City',
      latitude: 37.5585,
      longitude: -122.2711
    },
    'Work': {
      name: 'Work',
      latitude: 37.5700,
      longitude: -122.3200
    }
  };

  // Function to fetch actual route from OSRM routing API
  const fetchRouteGeometry = async (start, end) => {
    try {
      // OSRM API endpoint (free public instance)
      const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
      
      console.log('Fetching route from OSRM:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        // Return the route geometry coordinates
        return data.routes[0].geometry.coordinates;
      } else {
        console.warn('OSRM routing failed, using fallback');
        return createFallbackRoute(start, end);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      return createFallbackRoute(start, end);
    }
  };

  // Fallback: Create a simple curved route if API fails
  const createFallbackRoute = (start, end) => {
    const steps = 50;
    const coordinates = [];
    
    const midLat = (start.latitude + end.latitude) / 2;
    const midLng = (start.longitude + end.longitude) / 2;
    
    const offsetLat = (end.longitude - start.longitude) * 0.1;
    const offsetLng = -(end.latitude - start.latitude) * 0.1;
    
    const controlLat = midLat + offsetLat;
    const controlLng = midLng + offsetLng;
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const t1 = 1 - t;
      
      const lat = t1 * t1 * start.latitude + 2 * t1 * t * controlLat + t * t * end.latitude;
      const lng = t1 * t1 * start.longitude + 2 * t1 * t * controlLng + t * t * end.longitude;
      
      coordinates.push([lng, lat]);
    }
    
    return coordinates;
  };

  // Function to draw route on map
  const drawRoute = async (destinationName) => {
    if (!map.current || !mapLoaded) return;
    
    const destination = DESTINATIONS[destinationName];
    if (!destination) {
      console.log('Unknown destination:', destinationName);
      return;
    }

    // Show loading state
    setIsLoadingRoute(true);

    // Get current car position (using fake location)
    const currentLocation = FAKE_CURRENT_LOCATION;
    
    // Fetch actual route geometry from OSRM API
    const routeCoordinates = await fetchRouteGeometry(currentLocation, destination);
    
    setIsLoadingRoute(false);
    
    // Create GeoJSON for the route
    const routeGeoJSON = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: routeCoordinates
      }
    };

    // Remove existing route if any
    if (map.current.getSource('route')) {
      if (map.current.getLayer('route-line')) {
        map.current.removeLayer('route-line');
      }
      if (map.current.getLayer('route-outline')) {
        map.current.removeLayer('route-outline');
      }
      if (map.current.getLayer('route-shadow')) {
        map.current.removeLayer('route-shadow');
      }
      map.current.removeSource('route');
    }

    // Remove existing destination marker if any
    if (destinationMarker.current) {
      destinationMarker.current.remove();
      destinationMarker.current = null;
    }

    // Remove existing destination layers if any
    if (map.current.getLayer('destination-marker-inner')) {
      map.current.removeLayer('destination-marker-inner');
    }
    if (map.current.getLayer('destination-marker-outer')) {
      map.current.removeLayer('destination-marker-outer');
    }
    if (map.current.getLayer('destination-marker-glow')) {
      map.current.removeLayer('destination-marker-glow');
    }
    if (map.current.getSource('destination')) {
      map.current.removeSource('destination');
    }

    // Add route source
    map.current.addSource('route', {
      type: 'geojson',
      data: routeGeoJSON
    });

    // Add route shadow/glow (for depth)
    map.current.addLayer({
      id: 'route-shadow',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#000000',
        'line-width': 14,
        'line-opacity': 0.4,
        'line-blur': 4
      }
    });

    // Add route outline (darker blue for depth)
    map.current.addLayer({
      id: 'route-outline',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#0047AB',
        'line-width': 10,
        'line-opacity': 0.8
      }
    });

    // Add route line (bright blue)
    map.current.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#4A90E2',
        'line-width': 7
      }
    });

    // Add destination marker as a GeoJSON layer (more reliable positioning)
    const destinationGeoJSON = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [destination.longitude, destination.latitude]
      }
    };

    console.log('Adding destination marker at:', [destination.longitude, destination.latitude]);

    // Add destination point source
    map.current.addSource('destination', {
      type: 'geojson',
      data: destinationGeoJSON
    });

    // Add pulsing outer glow
    map.current.addLayer({
      id: 'destination-marker-glow',
      type: 'circle',
      source: 'destination',
      paint: {
        'circle-radius': 30,
        'circle-color': '#4A90E2',
        'circle-opacity': 0.3,
        'circle-blur': 0.8
      }
    });

    // Add outer circle (blue with white border)
    map.current.addLayer({
      id: 'destination-marker-outer',
      type: 'circle',
      source: 'destination',
      paint: {
        'circle-radius': 20,
        'circle-color': '#4A90E2',
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Add inner circle (white center)
    map.current.addLayer({
      id: 'destination-marker-inner',
      type: 'circle',
      source: 'destination',
      paint: {
        'circle-radius': 8,
        'circle-color': '#ffffff'
      }
    });

    // Animate the glow effect
    let glowSize = 30;
    let glowDirection = 1;
    const animateGlow = () => {
      if (!map.current || !map.current.getLayer('destination-marker-glow')) return;
      
      glowSize += glowDirection * 0.5;
      if (glowSize >= 35) glowDirection = -1;
      if (glowSize <= 25) glowDirection = 1;
      
      map.current.setPaintProperty('destination-marker-glow', 'circle-radius', glowSize);
      requestAnimationFrame(animateGlow);
    };
    animateGlow();

    // Ensure car marker is on top of route layers
    if (map.current.getLayer('car-marker')) {
      map.current.moveLayer('car-marker');
    }

    // Fit map to show both start and end points
    const bounds = new maplibregl.LngLatBounds();
    bounds.extend([currentLocation.longitude, currentLocation.latitude]);
    bounds.extend([destination.longitude, destination.latitude]);
    
    // Dynamic padding based on which side the overlay is on
    // This ensures the search overlay doesn't block the route and markers
    const overlayPadding = 550; // Padding to account for overlay (420px wide + extra margin)
    const padding = overlayPanelSide === 'left' 
      ? { top: 100, bottom: 100, left: overlayPadding, right: 100 }  // Overlay on left, shift map right
      : { top: 100, bottom: 100, left: 100, right: overlayPadding }; // Overlay on right, shift map left
    
    map.current.fitBounds(bounds, {
      padding,
      duration: 1000
    });

    setActiveRoute(destinationName);
    console.log(`Route drawn to ${destinationName} (overlay on ${overlayPanelSide} side)`);
  };

  const handleSearch = async (query) => {
    console.log('Searching for:', query);
    setSearchDestination(query);
    
    // If it's a known destination (Home or Work), draw the route
    if (DESTINATIONS[query]) {
      await drawRoute(query);
    }
  };

  // Handle overlay panel side change
  const handlePanelSideChange = (newSide) => {
    console.log('Overlay panel moved to:', newSide);
    setOverlayPanelSide(newSide);
    
    // Re-center the map if there's an active route
    if (activeRoute && map.current && mapLoaded) {
      const destination = DESTINATIONS[activeRoute];
      if (destination) {
        const currentLocation = FAKE_CURRENT_LOCATION;
        const bounds = new maplibregl.LngLatBounds();
        bounds.extend([currentLocation.longitude, currentLocation.latitude]);
        bounds.extend([destination.longitude, destination.latitude]);
        
        // Apply padding based on new panel side
        const overlayPadding = 550;
        const padding = newSide === 'left' 
          ? { top: 100, bottom: 100, left: overlayPadding, right: 100 }
          : { top: 100, bottom: 100, left: 100, right: overlayPadding };
        
        map.current.fitBounds(bounds, {
          padding,
          duration: 800
        });
      }
    }
  };

  return (
    <div className="navigation-app">
      {/* Map Container */}
      <div ref={mapContainer} className="map-container" />

      {/* Search Overlay - Always visible */}
      <MapSearchOverlay 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
        onPanelSideChange={handlePanelSideChange}
      />
      {!mapLoaded && (
        <div className="map-loading">
          <div className="loading-text">
            {locationStatus === 'requesting' && 'Finding Your Location...'}
            {locationStatus === 'error' && 'Loading Map (Using Default Location)...'}
            {locationStatus === 'found' && 'Loading Map at Your Location...'}
          </div>
        </div>
      )}
      {mapLoaded && locationStatus === 'requesting' && (
        <div className="location-status">
          <div className="status-indicator">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="2" strokeDasharray="4 4">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 10 10"
                  to="360 10 10"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
            <span>Finding your location...</span>
          </div>
        </div>
      )}
      {mapLoaded && locationStatus === 'error' && (
        <div className="location-status error">
          <div className="status-indicator">
            <span>⚠️ Location unavailable - showing default view</span>
          </div>
        </div>
      )}
      {isLoadingRoute && (
        <div className="route-loading-status">
          <div className="status-indicator">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" stroke="#4A90E2" strokeWidth="2" strokeDasharray="4 4">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 10 10"
                  to="360 10 10"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
            <span>Calculating route...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default NavigationApp;

