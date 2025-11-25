import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const HMIContext = createContext();

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
    graphicsQuality: 'medium' // low, medium, high
  });

  // Fetch initial state from backend on mount
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/state');
        if (response.ok) {
          const initialState = await response.json();
          setState(initialState);
          console.log('✅ Initial state loaded from backend:', initialState);
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
      setState(newState);
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
    dispatchAction
  };

  return <HMIContext.Provider value={value}>{children}</HMIContext.Provider>;
};

