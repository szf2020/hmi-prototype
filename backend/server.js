import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true, // Allow all origins in development (localhost + network)
    credentials: true,
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store the current state of the HMI system
const hmiState = {
  // Climate Control
  temperature: 22,
  driverTemp: 70,
  passengerTemp: 70,
  fanSpeed: 2,
  acMode: 'auto',
  
  // Media
  mediaPlaying: false,
  currentTrack: 'No Track Playing',
  volume: 50,
  
  // Navigation
  destination: null,
  eta: null,
  currentSpeed: 0,
  
  // Vehicle Info
  fuelLevel: 75,
  range: 450,
  tripDistance: 0,
  
  // Display Settings
  brightness: 80,
  theme: 'dark'
};

// Connected clients by display type
const connectedDisplays = {
  cluster: [],
  central: [],
  passenger: []
};

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Register display type
  socket.on('register', (displayType) => {
    console.log(`Display registered: ${displayType} (${socket.id})`);
    socket.displayType = displayType;
    
    if (connectedDisplays[displayType]) {
      connectedDisplays[displayType].push(socket.id);
    }
    
    // Send current state to newly connected display
    socket.emit('state-update', hmiState);
  });
  
  // Handle state updates from any display
  socket.on('update-state', (updates) => {
    console.log(`State update from ${socket.displayType}:`, updates);
    
    // Merge updates into current state
    Object.assign(hmiState, updates);
    
    // Broadcast to all connected displays
    io.emit('state-update', hmiState);
  });
  
  // Handle display-specific actions
  socket.on('action', (action) => {
    console.log(`Action from ${socket.displayType}:`, action);
    
    // Process action and update state accordingly
    handleAction(action);
    
    // Broadcast updated state
    io.emit('state-update', hmiState);
  });
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Remove from connected displays
    if (socket.displayType && connectedDisplays[socket.displayType]) {
      connectedDisplays[socket.displayType] = connectedDisplays[socket.displayType]
        .filter(id => id !== socket.id);
    }
  });
});

// Action handler
function handleAction(action) {
  switch (action.type) {
    case 'INCREMENT_VOLUME':
      hmiState.volume = Math.min(100, hmiState.volume + 5);
      break;
    case 'DECREMENT_VOLUME':
      hmiState.volume = Math.max(0, hmiState.volume - 5);
      break;
    case 'TOGGLE_MEDIA':
      hmiState.mediaPlaying = !hmiState.mediaPlaying;
      break;
    case 'INCREMENT_TEMP':
      hmiState.temperature = Math.min(30, hmiState.temperature + 0.5);
      break;
    case 'DECREMENT_TEMP':
      hmiState.temperature = Math.max(16, hmiState.temperature - 0.5);
      break;
    case 'SET_DRIVER_TEMP':
      hmiState.driverTemp = Math.max(60, Math.min(85, action.payload));
      break;
    case 'SET_PASSENGER_TEMP':
      hmiState.passengerTemp = Math.max(60, Math.min(85, action.payload));
      break;
    case 'SET_FAN_SPEED':
      hmiState.fanSpeed = action.payload;
      break;
    case 'UPDATE_SPEED':
      hmiState.currentSpeed = action.payload;
      break;
    default:
      console.log('Unknown action:', action.type);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    connectedDisplays: {
      cluster: connectedDisplays.cluster.length,
      central: connectedDisplays.central.length,
      passenger: connectedDisplays.passenger.length
    }
  });
});

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // Listen on all network interfaces

httpServer.listen(PORT, HOST, () => {
  console.log(`🚗 HMI Backend Server running on:`);
  console.log(`   ➜ Local:    http://localhost:${PORT}`);
  console.log(`   ➜ Network:  Use your local IP address with port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
});

