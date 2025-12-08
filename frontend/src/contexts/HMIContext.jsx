import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const HMIContext = createContext();

// Radio API base URL
const RADIO_API_BASE = 'https://de1.api.radio-browser.info/json';

export const useHMI = () => {
  const context = useContext(HMIContext);
  if (!context) {
    throw new Error('useHMI must be used within HMIProvider');
  }
  return context;
};

export const HMIProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [state, setState] = useState({
    temperature: 22,
    driverTemp: 70,
    passengerTemp: 70,
    fanSpeed: 2,
    acMode: 'auto',
    mediaPlaying: false,
    currentTrack: 'No Track Playing',
    volume: 50,
    destination: null,
    eta: null,
    currentSpeed: 0,
    fuelLevel: 75,
    range: 450,
    tripDistance: 0,
    brightness: 80,
    theme: 'dark',
    graphicsQuality: 'medium', // low, medium, high
    // Radio state for persistent background playback
    radio: {
      currentStation: null,
      isPlaying: false,
      isLoading: false,
      favorites: [],
      recentStations: [],
      category: 'popular',
      stations: [],
      volume: 50
    }
  });

  // Global Audio instance for persistent radio playback
  const audioRef = useRef(null);
  
  // Initialize audio element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = state.radio.volume / 100;
    }
    
    const audio = audioRef.current;
    
    // Audio event handlers
    const handlePlay = () => {
      setState(prev => ({
        ...prev,
        radio: { ...prev.radio, isPlaying: true, isLoading: false }
      }));
    };
    
    const handlePause = () => {
      setState(prev => ({
        ...prev,
        radio: { ...prev.radio, isPlaying: false }
      }));
    };
    
    const handleWaiting = () => {
      setState(prev => ({
        ...prev,
        radio: { ...prev.radio, isLoading: true }
      }));
    };
    
    const handleCanPlay = () => {
      setState(prev => ({
        ...prev,
        radio: { ...prev.radio, isLoading: false }
      }));
    };
    
    const handleError = () => {
      setState(prev => ({
        ...prev,
        radio: { ...prev.radio, isPlaying: false, isLoading: false }
      }));
    };
    
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Radio control functions
  const fetchStations = useCallback(async (category = 'popular') => {
    // For favorites category, just update the category state - no API call needed
    if (category === 'favorites') {
      setState(prev => ({
        ...prev,
        radio: { ...prev.radio, category, isLoading: false }
      }));
      return;
    }
    
    setState(prev => ({
      ...prev,
      radio: { ...prev.radio, isLoading: true, category }
    }));
    
    try {
      let endpoint;
      switch (category) {
        case 'popular':
          endpoint = `${RADIO_API_BASE}/stations/topvote?limit=30&hidebroken=true`;
          break;
        case 'us':
          endpoint = `${RADIO_API_BASE}/stations/bycountry/United%20States?limit=30&hidebroken=true&order=votes&reverse=true`;
          break;
        case 'rock':
          endpoint = `${RADIO_API_BASE}/stations/bytag/rock?limit=30&hidebroken=true&order=votes&reverse=true`;
          break;
        case 'jazz':
          endpoint = `${RADIO_API_BASE}/stations/bytag/jazz?limit=30&hidebroken=true&order=votes&reverse=true`;
          break;
        case 'news':
          endpoint = `${RADIO_API_BASE}/stations/bytag/news?limit=30&hidebroken=true&order=votes&reverse=true`;
          break;
        default:
          endpoint = `${RADIO_API_BASE}/stations/topvote?limit=30&hidebroken=true`;
      }
      
      const response = await fetch(endpoint);
      const stations = await response.json();
      
      setState(prev => ({
        ...prev,
        radio: { ...prev.radio, stations, isLoading: false }
      }));
      
      return stations;
    } catch (error) {
      console.error('Failed to fetch stations:', error);
      setState(prev => ({
        ...prev,
        radio: { ...prev.radio, isLoading: false }
      }));
      return [];
    }
  }, []);

  const playStation = useCallback((station) => {
    if (!audioRef.current || !station?.url_resolved) return;
    
    setState(prev => ({
      ...prev,
      radio: { ...prev.radio, currentStation: station, isLoading: true }
    }));
    
    audioRef.current.src = station.url_resolved;
    audioRef.current.play().catch(err => {
      console.error('Failed to play station:', err);
      setState(prev => ({
        ...prev,
        radio: { ...prev.radio, isLoading: false }
      }));
    });
  }, []);

  const pauseStation = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;
    
    if (audioRef.current.paused) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, []);

  const nextStation = useCallback(() => {
    setState(prev => {
      const { stations, currentStation } = prev.radio;
      if (!stations.length) return prev;
      
      const currentIndex = stations.findIndex(s => s.stationuuid === currentStation?.stationuuid);
      const nextIndex = (currentIndex + 1) % stations.length;
      const nextStationData = stations[nextIndex];
      
      if (nextStationData && audioRef.current) {
        audioRef.current.src = nextStationData.url_resolved;
        audioRef.current.play().catch(console.error);
      }
      
      return {
        ...prev,
        radio: { ...prev.radio, currentStation: nextStationData, isLoading: true }
      };
    });
  }, []);

  const prevStation = useCallback(() => {
    setState(prev => {
      const { stations, currentStation } = prev.radio;
      if (!stations.length) return prev;
      
      const currentIndex = stations.findIndex(s => s.stationuuid === currentStation?.stationuuid);
      const prevIndex = currentIndex <= 0 ? stations.length - 1 : currentIndex - 1;
      const prevStationData = stations[prevIndex];
      
      if (prevStationData && audioRef.current) {
        audioRef.current.src = prevStationData.url_resolved;
        audioRef.current.play().catch(console.error);
      }
      
      return {
        ...prev,
        radio: { ...prev.radio, currentStation: prevStationData, isLoading: true }
      };
    });
  }, []);

  const toggleFavorite = useCallback((station) => {
    setState(prev => {
      const { favorites } = prev.radio;
      const isFavorite = favorites.some(f => f.stationuuid === station.stationuuid);
      
      const newFavorites = isFavorite
        ? favorites.filter(f => f.stationuuid !== station.stationuuid)
        : [...favorites, station];
      
      // Dispatch action to backend for persistence
      if (socket) {
        socket.emit('action', {
          type: isFavorite ? 'REMOVE_RADIO_FAVORITE' : 'ADD_RADIO_FAVORITE',
          payload: station
        });
      }
      
      return {
        ...prev,
        radio: { ...prev.radio, favorites: newFavorites }
      };
    });
  }, [socket]);

  const setRadioVolume = useCallback((volume) => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
    setState(prev => ({
      ...prev,
      radio: { ...prev.radio, volume }
    }));
    // Persist volume to backend
    if (socket) {
      socket.emit('action', {
        type: 'SET_RADIO_VOLUME',
        payload: volume
      });
    }
  }, [socket]);

  // Fetch initial state from backend on mount
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/state');
        if (response.ok) {
          const initialState = await response.json();
          // Load persisted radio settings from backend
          const radioVolume = initialState.radioVolume ?? 50;
          
          // Set audio volume
          if (audioRef.current) {
            audioRef.current.volume = radioVolume / 100;
          }
          
          // Preserve radio state but load favorites and volume from backend
          setState(prev => ({
            ...initialState,
            radio: {
              ...prev.radio,
              favorites: initialState.radioFavorites || [],
              volume: radioVolume
            }
          }));
          console.log('✅ Initial state loaded from backend');
          if (initialState.radioFavorites?.length > 0) {
            console.log(`📻 Loaded ${initialState.radioFavorites.length} favorite stations`);
          }
          console.log(`🔊 Radio volume: ${radioVolume}%`);
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch initial state, using defaults:', error.message);
      }
    };
    
    fetchInitialState();
  }, []);

  useEffect(() => {
    // Connect to backend via WebSocket
    const newSocket = io('http://localhost:3001');
    
    newSocket.on('connect', () => {
      console.log('Connected to HMI backend');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from HMI backend');
      setConnected(false);
    });

    newSocket.on('state-update', (newState) => {
      console.log('State update received:', newState);
      // Preserve radio state but sync favorites and volume from backend
      setState(prev => {
        const newVolume = newState.radioVolume ?? prev.radio.volume;
        // Update audio volume if it changed
        if (audioRef.current && newVolume !== prev.radio.volume) {
          audioRef.current.volume = newVolume / 100;
        }
        return {
          ...newState,
          radio: {
            ...prev.radio,
            favorites: newState.radioFavorites || prev.radio.favorites,
            volume: newVolume
          }
        };
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const registerDisplay = (displayType) => {
    if (socket) {
      socket.emit('register', displayType);
    }
  };

  const updateState = (updates) => {
    if (socket) {
      socket.emit('update-state', updates);
    }
  };

  const dispatchAction = (action) => {
    if (socket) {
      socket.emit('action', action);
    }
  };

  const value = {
    socket,
    connected,
    state,
    registerDisplay,
    updateState,
    dispatchAction,
    // Radio controls
    fetchStations,
    playStation,
    pauseStation,
    togglePlayback,
    nextStation,
    prevStation,
    toggleFavorite,
    setRadioVolume
  };

  return <HMIContext.Provider value={value}>{children}</HMIContext.Provider>;
};

