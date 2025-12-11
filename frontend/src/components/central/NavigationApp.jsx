import { useEffect, useRef, useState, useCallback } from 'react';
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

// ===== CATEGORY TO OSM TAG MAPPING =====
const CATEGORY_TAG_MAP = {
  'Food': 'amenity:restaurant',
  'Coffee': 'amenity:cafe',
  'Charging': 'amenity:charging_station',
  'Shopping': 'shop',
  'Parking': 'amenity:parking',
  'Car Wash': 'amenity:car_wash'
};

// ===== CATEGORY COLORS (matching MapSearchOverlay) =====
const CATEGORY_COLORS = {
  'Food': '#f79009',
  'Coffee': '#c19b5f',
  'Charging': '#12b76a',
  'Shopping': '#c26eb4',
  'Parking': '#4a7fb8',
  'Car Wash': '#7e5fc2',
  'default': '#335FFF'
};

// ===== PHOTON SEARCH API =====
// Helper to format Photon address from properties
const formatPhotonAddress = (props) => {
  const parts = [];
  if (props.housenumber && props.street) {
    parts.push(`${props.housenumber} ${props.street}`);
  } else if (props.street) {
    parts.push(props.street);
  }
  if (props.city) parts.push(props.city);
  if (props.state) parts.push(props.state);
  if (props.postcode) parts.push(props.postcode);
  
  return parts.join(', ') || props.name || 'Address unavailable';
};

// Maximum search radius in miles
const MAX_SEARCH_RADIUS_MILES = 20;

// Calculate distance between two coordinates using Haversine formula (returns miles)
const calculateDistanceMiles = (lat1, lon1, lat2, lon2) => {
  const R = 3958.8; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Search for places using Photon API
const searchPhoton = async (query, isCategory = false) => {
  try {
    // Request more results to filter by distance, then take top 10 within range
    const params = new URLSearchParams({
      q: isCategory ? query : query,
      limit: 50,
      lat: FAKE_CURRENT_LOCATION.latitude,
      lon: FAKE_CURRENT_LOCATION.longitude,
      lang: 'en'
    });

    // Add OSM tag filter if searching by category
    if (isCategory && CATEGORY_TAG_MAP[query]) {
      params.append('osm_tag', CATEGORY_TAG_MAP[query]);
    }

    const url = `https://photon.komoot.io/api/?${params.toString()}`;
    console.log('Searching Photon:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Photon API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Photon returns GeoJSON FeatureCollection
    // Map results and calculate distance from current location
    const resultsWithDistance = data.features.map((feature, index) => {
      const lat = feature.geometry.coordinates[1];
      const lon = feature.geometry.coordinates[0];
      const distance = calculateDistanceMiles(
        FAKE_CURRENT_LOCATION.latitude,
        FAKE_CURRENT_LOCATION.longitude,
        lat,
        lon
      );
      
      return {
        id: `${feature.properties.osm_id || 'result'}-${index}`,
        name: feature.properties.name || feature.properties.street || 'Unknown',
        address: formatPhotonAddress(feature.properties),
        latitude: lat,
        longitude: lon,
        type: feature.properties.osm_value || feature.properties.osm_key,
        category: feature.properties.osm_key,
        distance: distance
      };
    });

    // Filter results within 20 miles, sort by distance, and take top 10
    const filteredResults = resultsWithDistance
      .filter(result => result.distance <= MAX_SEARCH_RADIUS_MILES)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    console.log(`Found ${data.features.length} total results, ${filteredResults.length} within ${MAX_SEARCH_RADIUS_MILES} miles`);
    
    return filteredResults;

  } catch (error) {
    console.error('Photon search failed:', error);
    return [];
  }
};

function NavigationApp() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const geolocateControl = useRef(null);
  const carMarker = useRef(null);
  const destinationMarker = useRef(null);
  const isInitialized = useRef(false);
  const routeSvgRef = useRef(null);
  const poiMarkers = useRef([]); // Array to track POI markers for cleanup
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationStatus, setLocationStatus] = useState('requesting');
  const [isSearchOpen, setIsSearchOpen] = useState(true); // Show by default
  const [searchDestination, setSearchDestination] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [overlayPanelSide, setOverlayPanelSide] = useState('left'); // Track which side the overlay is on
  const [routeCoordinates, setRouteCoordinates] = useState(null);
  const [navigationInstructions, setNavigationInstructions] = useState(null);
  const [routeSummary, setRouteSummary] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null); // Track which category is active

  // Function to update SVG route path based on current map view
  const updateSvgRoute = useCallback(() => {
    if (!map.current || !routeCoordinates || !routeSvgRef.current) return;
    
    // Convert geo coordinates to screen pixels using map.project()
    const points = routeCoordinates.map(coord => {
      const point = map.current.project([coord[0], coord[1]]);
      return `${point.x},${point.y}`;
    });
    
    // Build SVG path d attribute
    const pathD = `M ${points.join(' L ')}`;
    
    // Update all path elements with the new path
    routeSvgRef.current.querySelectorAll('path').forEach(path => {
      path.setAttribute('d', pathD);
    });
  }, [routeCoordinates]);

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
          
          // Create and insert SVG route layer into the map container
          const svgNS = 'http://www.w3.org/2000/svg';
          const svg = document.createElementNS(svgNS, 'svg');
          svg.setAttribute('class', 'route-svg-layer');
          
          // Create filter definition for shadow
          const defs = document.createElementNS(svgNS, 'defs');
          const filter = document.createElementNS(svgNS, 'filter');
          filter.setAttribute('id', 'route-shadow-filter');
          filter.setAttribute('x', '-50%');
          filter.setAttribute('y', '-50%');
          filter.setAttribute('width', '200%');
          filter.setAttribute('height', '200%');
          
          const feGaussianBlur = document.createElementNS(svgNS, 'feGaussianBlur');
          feGaussianBlur.setAttribute('in', 'SourceGraphic');
          feGaussianBlur.setAttribute('stdDeviation', '4');
          
          filter.appendChild(feGaussianBlur);
          defs.appendChild(filter);
          svg.appendChild(defs);
          
          // Insert SVG into the map container (before markers layer)
          const mapContainer = mapInstance.getContainer();
          mapContainer.appendChild(svg);
          routeSvgRef.current = svg;
          
          // Add car marker if we have user location
          if (userLocation) {
            // Create HTML element with inline SVG for car marker
            const carElement = document.createElement('div');
            carElement.className = 'car-marker';
            carElement.innerHTML = `
              <svg width="80" height="80" viewBox="0 0 98 98" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_d_car)">
                  <path d="M46.3208 14.5407L17.2586 73.3893C16.0454 75.846 19.4325 78.0679 21.7988 76.3675L47.1469 58.1535C48.2256 57.3783 49.7822 57.3783 50.861 58.1535L76.209 76.3675C78.5753 78.0679 81.9624 75.8461 80.7492 73.3893L51.6871 14.5407C50.6725 12.4864 47.3353 12.4864 46.3208 14.5407Z" fill="url(#paint0_linear_car)"/>
                  <path d="M46.3208 14.5407L17.2586 73.3893C16.0454 75.846 19.4325 78.0679 21.7988 76.3675L47.1469 58.1535C48.2256 57.3783 49.7822 57.3783 50.861 58.1535L76.209 76.3675C78.5753 78.0679 81.9624 75.8461 80.7492 73.3893L51.6871 14.5407C50.6725 12.4864 47.3353 12.4864 46.3208 14.5407Z" stroke="#F0F4F8" stroke-width="2"/>
                </g>
                <defs>
                  <filter id="filter0_d_car" x="0" y="0" width="98.0078" height="97.9653" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feOffset dy="4"/>
                    <feGaussianBlur stdDeviation="8"/>
                    <feComposite in2="hardAlpha" operator="out"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.7 0"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_car"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_car" result="shape"/>
                  </filter>
                  <linearGradient id="paint0_linear_car" x1="17.0039" y1="74" x2="81.0039" y2="74" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#9D9D9D"/>
                    <stop offset="0.499388" stop-color="#D6D6D6"/>
                    <stop offset="0.503297" stop-color="#8A8A8A"/>
                    <stop offset="1" stop-color="#7E7E7E"/>
                  </linearGradient>
                </defs>
              </svg>
            `;
            
            // Create marker using MapLibre Marker with HTML element (more stable)
            carMarker.current = new maplibregl.Marker({
              element: carElement,
              anchor: 'center',
              rotationAlignment: 'map',
              pitchAlignment: 'map'
            })
              .setLngLat([userLocation.longitude, userLocation.latitude])
              .addTo(mapInstance);
              
              console.log('Car marker added at:', userLocation);
            
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
      // Remove SVG route layer
      if (routeSvgRef.current) {
        routeSvgRef.current.remove();
        routeSvgRef.current = null;
      }
      
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      
      // Remove HTML markers
      if (destinationMarker.current) {
        destinationMarker.current.remove();
        destinationMarker.current = null;
      }
      if (carMarker.current) {
        carMarker.current.remove();
        carMarker.current = null;
      }
      
      // Remove POI markers
      poiMarkers.current.forEach(marker => marker.remove());
      poiMarkers.current = [];
      
      globalMapInstance = null;
      isInitialized.current = false;
    };
  }, []);

  // Effect to register map event listeners for SVG route updates
  useEffect(() => {
    // If no route coordinates, clear any existing SVG paths
    if (!routeCoordinates) {
      if (routeSvgRef.current) {
        routeSvgRef.current.querySelectorAll('path').forEach(path => path.remove());
      }
      return;
    }
    
    if (!map.current || !routeSvgRef.current) return;
    
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = routeSvgRef.current;
    
    // Remove existing path elements (but keep defs)
    svg.querySelectorAll('path').forEach(path => path.remove());
    
    // Create new path elements for the route
    const shadowPath = document.createElementNS(svgNS, 'path');
    shadowPath.setAttribute('class', 'route-shadow');
    shadowPath.setAttribute('filter', 'url(#route-shadow-filter)');
    
    const outlinePath = document.createElementNS(svgNS, 'path');
    outlinePath.setAttribute('class', 'route-outline');
    
    const linePath = document.createElementNS(svgNS, 'path');
    linePath.setAttribute('class', 'route-line');
    
    svg.appendChild(shadowPath);
    svg.appendChild(outlinePath);
    svg.appendChild(linePath);
    
    // Update SVG route immediately when coordinates change
    updateSvgRoute();
    
    // Register event listeners for map movement
    const handleMapMove = () => updateSvgRoute();
    
    map.current.on('move', handleMapMove);
    map.current.on('zoom', handleMapMove);
    map.current.on('rotate', handleMapMove);
    map.current.on('pitch', handleMapMove);
    
    // Cleanup listeners when routeCoordinates changes or component unmounts
    return () => {
      if (map.current) {
        map.current.off('move', handleMapMove);
        map.current.off('zoom', handleMapMove);
        map.current.off('rotate', handleMapMove);
        map.current.off('pitch', handleMapMove);
      }
      // Also remove SVG paths on cleanup
      if (routeSvgRef.current) {
        routeSvgRef.current.querySelectorAll('path').forEach(path => path.remove());
      }
    };
  }, [routeCoordinates, updateSvgRoute]);

  // Predefined destinations for simulation
  const DESTINATIONS = {
    'Home': {
      name: 'Alamo Square, San Francisco',
      latitude: 37.7764,
      longitude: -122.4350
    },
    'Work': {
      name: 'Work',
      latitude: 37.5700,
      longitude: -122.3200
    }
  };

  // Function to fetch actual route from OSRM routing API with turn-by-turn instructions
  const fetchRouteGeometry = async (start, end, destinationName) => {
    try {
      // OSRM API endpoint (free public instance) with steps=true for turn-by-turn
      const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson&steps=true&annotations=true`;
      
      console.log('Fetching route from OSRM:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Extract turn-by-turn instructions from steps
        const instructions = [];
        if (route.legs && route.legs.length > 0) {
          route.legs.forEach(leg => {
            if (leg.steps) {
              leg.steps.forEach((step, index) => {
                // Skip the last "arrive" step as we'll add it separately
                if (step.maneuver) {
                  instructions.push({
                    id: index,
                    type: step.maneuver.type,
                    modifier: step.maneuver.modifier || '',
                    name: step.name || 'unnamed road',
                    distance: step.distance, // in meters
                    duration: step.duration, // in seconds
                    location: step.maneuver.location
                  });
                }
              });
            }
          });
        }
        
        // Store instructions in state
        setNavigationInstructions(instructions);
        
        // Store route summary
        setRouteSummary({
          distance: route.distance, // total distance in meters
          duration: route.duration, // total duration in seconds
          destinationName: destinationName
        });
        
        console.log('Turn-by-turn instructions:', instructions);
        
        // Return the route geometry coordinates
        return route.geometry.coordinates;
      } else {
        console.warn('OSRM routing failed, using fallback');
        setNavigationInstructions(null);
        setRouteSummary(null);
        return createFallbackRoute(start, end);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      setNavigationInstructions(null);
      setRouteSummary(null);
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
    
    // Fetch actual route geometry from OSRM API with turn-by-turn instructions
    const fetchedRouteCoordinates = await fetchRouteGeometry(currentLocation, destination, destination.name);
    
    setIsLoadingRoute(false);
    
    // Store route coordinates in state for SVG rendering
    setRouteCoordinates(fetchedRouteCoordinates);

    // Remove existing destination marker if any
    if (destinationMarker.current) {
      destinationMarker.current.remove();
      destinationMarker.current = null;
    }

    console.log('Adding destination marker at:', {
      coords: [destination.longitude, destination.latitude],
      name: destination.name
    });

    // Create HTML element for destination marker with pulsing animation
    const destElement = document.createElement('div');
    destElement.className = 'destination-marker';
    destElement.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <foreignObject x="-70" y="-70" width="188" height="188">
          <div xmlns="http://www.w3.org/1999/xhtml" style="backdrop-filter:blur(35px);clip-path:url(#bgblur_dest_marker);height:100%;width:100%"></div>
        </foreignObject>
        <g data-figma-bg-blur-radius="70">
          <rect width="48" height="48" rx="24" fill="#335FFF"/>
          <circle cx="24" cy="24" r="12" fill="#EFF4F9"/>
        </g>
        <defs>
          <clipPath id="bgblur_dest_marker" transform="translate(70 70)">
            <rect width="48" height="48" rx="24"/>
          </clipPath>
        </defs>
      </svg>
    `;

    // Create destination marker using MapLibre Marker with HTML element
    // Use 'center' anchor for circular markers to position them accurately
    destinationMarker.current = new maplibregl.Marker({
      element: destElement,
      anchor: 'center',
      rotationAlignment: 'map',
      pitchAlignment: 'map'
    })
      .setLngLat([destination.longitude, destination.latitude])
      .addTo(map.current);
    
    console.log('Destination marker created successfully at lng:', destination.longitude, 'lat:', destination.latitude);

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

  // ===== POI MARKER MANAGEMENT =====
  // Clear all POI markers from the map
  const clearPoiMarkers = useCallback(() => {
    poiMarkers.current.forEach(marker => {
      marker.remove();
    });
    poiMarkers.current = [];
  }, []);

  // Display POI markers on the map for search results
  const displayPoiMarkers = useCallback((results, category) => {
    if (!map.current || !mapLoaded) return;

    // Clear existing POI markers first
    clearPoiMarkers();

    const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;

    results.forEach((result, index) => {
      // Create POI marker element
      const poiElement = document.createElement('div');
      poiElement.className = 'poi-marker';
      poiElement.innerHTML = `
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="16" fill="${color}" stroke="#ffffff" stroke-width="2"/>
          <text x="18" y="22" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="600">${index + 1}</text>
        </svg>
      `;

      const marker = new maplibregl.Marker({
        element: poiElement,
        anchor: 'center'
      })
        .setLngLat([result.longitude, result.latitude])
        .addTo(map.current);

      poiMarkers.current.push(marker);
    });

    // Fit map to show all markers plus current location
    if (results.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([FAKE_CURRENT_LOCATION.longitude, FAKE_CURRENT_LOCATION.latitude]);
      results.forEach(result => {
        bounds.extend([result.longitude, result.latitude]);
      });

      const overlayPadding = 550;
      const padding = overlayPanelSide === 'left' 
        ? { top: 100, bottom: 100, left: overlayPadding, right: 100 }
        : { top: 100, bottom: 100, left: 100, right: overlayPadding };
      
      map.current.fitBounds(bounds, {
        padding,
        duration: 1000,
        maxZoom: 14
      });
    }

    console.log(`Displayed ${results.length} POI markers for ${category}`);
  }, [mapLoaded, overlayPanelSide, clearPoiMarkers]);

  // Handle search from overlay (both text search and category search)
  const handleSearch = async (query, isCategory = false) => {
    console.log('Searching for:', query, isCategory ? '(category)' : '');
    
    // If it's a known shortcut destination (Home or Work), draw the route directly
    if (!isCategory && DESTINATIONS[query]) {
      setSearchDestination(query);
      clearPoiMarkers();
      setSearchResults([]);
      setActiveCategory(null);
      await drawRoute(query);
      return;
    }

    // Otherwise, search using Photon
    setIsSearching(true);
    setSearchResults([]);
    setActiveCategory(isCategory ? query : null);
    
    const results = await searchPhoton(query, isCategory);
    
    setSearchResults(results);
    setIsSearching(false);
    
    // Display POI markers on the map
    if (results.length > 0) {
      displayPoiMarkers(results, isCategory ? query : 'default');
    }
    
    console.log('Search results:', results);
  };

  // Handle selecting a destination from search results
  const handleSelectDestination = async (result) => {
    console.log('Selected destination:', result);
    
    // Clear POI markers and search results
    clearPoiMarkers();
    setSearchResults([]);
    setActiveCategory(null);
    
    setSearchDestination(result.name);
    setIsLoadingRoute(true);

    // Get current car position
    const currentLocation = FAKE_CURRENT_LOCATION;
    
    // Fetch route geometry
    const fetchedRouteCoordinates = await fetchRouteGeometry(currentLocation, result, result.name);
    
    setIsLoadingRoute(false);
    setRouteCoordinates(fetchedRouteCoordinates);

    // Remove existing destination marker if any
    if (destinationMarker.current) {
      destinationMarker.current.remove();
      destinationMarker.current = null;
    }

    // Create destination marker
    const destElement = document.createElement('div');
    destElement.className = 'destination-marker';
    destElement.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <foreignObject x="-70" y="-70" width="188" height="188">
          <div xmlns="http://www.w3.org/1999/xhtml" style="backdrop-filter:blur(35px);clip-path:url(#bgblur_dest_marker);height:100%;width:100%"></div>
        </foreignObject>
        <g data-figma-bg-blur-radius="70">
          <rect width="48" height="48" rx="24" fill="#335FFF"/>
          <circle cx="24" cy="24" r="12" fill="#EFF4F9"/>
        </g>
        <defs>
          <clipPath id="bgblur_dest_marker" transform="translate(70 70)">
            <rect width="48" height="48" rx="24"/>
          </clipPath>
        </defs>
      </svg>
    `;

    destinationMarker.current = new maplibregl.Marker({
      element: destElement,
      anchor: 'center',
      rotationAlignment: 'map',
      pitchAlignment: 'map'
    })
      .setLngLat([result.longitude, result.latitude])
      .addTo(map.current);

    // Fit map to show route
    const bounds = new maplibregl.LngLatBounds();
    bounds.extend([currentLocation.longitude, currentLocation.latitude]);
    bounds.extend([result.longitude, result.latitude]);
    
    const overlayPadding = 550;
    const padding = overlayPanelSide === 'left' 
      ? { top: 100, bottom: 100, left: overlayPadding, right: 100 }
      : { top: 100, bottom: 100, left: 100, right: overlayPadding };
    
    map.current.fitBounds(bounds, { padding, duration: 1000 });

    setActiveRoute(result.name);
  };

  // Function to clear the active route and return to default view
  const clearRoute = () => {
    // Remove route coordinates (clears SVG route)
    setRouteCoordinates(null);
    
    // Clear navigation instructions and summary
    setNavigationInstructions(null);
    setRouteSummary(null);
    
    // Remove destination marker
    if (destinationMarker.current) {
      destinationMarker.current.remove();
      destinationMarker.current = null;
    }
    
    // Clear POI markers and search results
    clearPoiMarkers();
    setSearchResults([]);
    setActiveCategory(null);
    
    // Clear active route state
    setActiveRoute(null);
    setSearchDestination(null);
    
    // Reset map view to current location
    if (map.current && mapLoaded) {
      map.current.easeTo({
        center: [FAKE_CURRENT_LOCATION.longitude, FAKE_CURRENT_LOCATION.latitude],
        zoom: 16,
        duration: 1000
      });
    }
    
    console.log('Route cleared');
  };

  // Handle overlay panel side change
  const handlePanelSideChange = (newSide) => {
    console.log('Overlay panel moved to:', newSide);
    setOverlayPanelSide(newSide);
    
    if (!map.current || !mapLoaded) return;
    
    const overlayPadding = 550;
    const padding = newSide === 'left' 
      ? { top: 100, bottom: 100, left: overlayPadding, right: 100 }
      : { top: 100, bottom: 100, left: 100, right: overlayPadding };
    
    // Re-center the map if there's an active route
    if (activeRoute) {
      const destination = DESTINATIONS[activeRoute];
      if (destination) {
        const currentLocation = FAKE_CURRENT_LOCATION;
        const bounds = new maplibregl.LngLatBounds();
        bounds.extend([currentLocation.longitude, currentLocation.latitude]);
        bounds.extend([destination.longitude, destination.latitude]);
        
        map.current.fitBounds(bounds, {
          padding,
          duration: 800
        });
      }
    }
    // Re-center the map if there are search results displayed
    else if (searchResults.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([FAKE_CURRENT_LOCATION.longitude, FAKE_CURRENT_LOCATION.latitude]);
      searchResults.forEach(result => {
        bounds.extend([result.longitude, result.latitude]);
      });
      
      map.current.fitBounds(bounds, {
        padding,
        duration: 800,
        maxZoom: 14
      });
    }
    // No route or results, just shift the current view
    else {
      const currentCenter = map.current.getCenter();
      const currentZoom = map.current.getZoom();
      
      // Calculate offset based on panel side (shift map center away from panel)
      const offsetLng = newSide === 'left' ? 0.01 : -0.01;
      
      map.current.easeTo({
        center: [currentCenter.lng + offsetLng, currentCenter.lat],
        zoom: currentZoom,
        duration: 800
      });
    }
  };

  return (
    <div className="navigation-app">
      {/* Map Container - SVG route layer is inserted here programmatically */}
      <div ref={mapContainer} className="map-container" />

      {/* Search Overlay - Always visible */}
      <MapSearchOverlay 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
        onSelectDestination={handleSelectDestination}
        searchResults={searchResults}
        isSearching={isSearching}
        activeCategory={activeCategory}
        onPanelSideChange={handlePanelSideChange}
        activeRoute={activeRoute}
        navigationInstructions={navigationInstructions}
        routeSummary={routeSummary}
        onClearRoute={clearRoute}
        isLoadingRoute={isLoadingRoute}
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
    </div>
  );
}

export default NavigationApp;

