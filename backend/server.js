import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Path to store persistent state
const STATE_FILE = path.join(__dirname, 'hmi-state.json');

// Default initial state
const defaultState = {
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
  
  // Radio (persisted)
  radioFavorites: [],
  radioVolume: 50,
  
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
  theme: 'dark',
  graphicsQuality: 'medium'
};

// Load state from file or use default
let hmiState = { ...defaultState };
try {
  if (fs.existsSync(STATE_FILE)) {
    const savedState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    hmiState = { ...defaultState, ...savedState };
    console.log('✅ Loaded saved HMI state from file');
  } else {
    console.log('ℹ️  No saved state found, using default values');
  }
} catch (error) {
  console.error('⚠️  Error loading saved state, using defaults:', error.message);
}

// Save state to file
function saveState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(hmiState, null, 2));
    console.log('💾 State saved to file');
  } catch (error) {
    console.error('❌ Error saving state:', error.message);
  }
}

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
    
    // Save state to disk
    saveState();
    
    // Broadcast to all connected displays
    io.emit('state-update', hmiState);
  });
  
  // Handle display-specific actions
  socket.on('action', (action) => {
    console.log(`Action from ${socket.displayType}:`, action);
    
    // Process action and update state accordingly
    handleAction(action);
    
    // Save state to disk
    saveState();
    
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
    case 'ADD_RADIO_FAVORITE':
      // Add station to favorites if not already there
      if (action.payload && !hmiState.radioFavorites.some(f => f.stationuuid === action.payload.stationuuid)) {
        hmiState.radioFavorites.push(action.payload);
        console.log(`📻 Added favorite: ${action.payload.name}`);
      }
      break;
    case 'REMOVE_RADIO_FAVORITE':
      // Remove station from favorites
      if (action.payload) {
        const beforeCount = hmiState.radioFavorites.length;
        hmiState.radioFavorites = hmiState.radioFavorites.filter(f => f.stationuuid !== action.payload.stationuuid);
        if (hmiState.radioFavorites.length < beforeCount) {
          console.log(`📻 Removed favorite: ${action.payload.name}`);
        }
      }
      break;
    case 'SET_RADIO_FAVORITES':
      // Replace all favorites (for sync)
      if (Array.isArray(action.payload)) {
        hmiState.radioFavorites = action.payload;
        console.log(`📻 Synced ${action.payload.length} favorites`);
      }
      break;
    case 'SET_RADIO_VOLUME':
      // Set radio volume (0-100)
      if (typeof action.payload === 'number') {
        hmiState.radioVolume = Math.max(0, Math.min(100, action.payload));
        console.log(`🔊 Radio volume set to ${hmiState.radioVolume}%`);
      }
      break;
    default:
      console.log('Unknown action:', action.type);
  }
}

// API endpoint to get current state
app.get('/api/state', (req, res) => {
  res.json(hmiState);
});

// API endpoint to update state via REST
app.post('/api/state', (req, res) => {
  try {
    const updates = req.body;
    Object.assign(hmiState, updates);
    saveState();
    
    // Broadcast to all WebSocket clients
    io.emit('state-update', hmiState);
    
    res.json({ success: true, state: hmiState });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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

// Now playing metadata endpoint - fetches ICY metadata from radio streams
app.get('/api/now-playing', async (req, res) => {
  const streamUrl = req.query.url;
  
  if (!streamUrl) {
    return res.status(400).json({ error: 'Stream URL is required' });
  }

  try {
    // Create an AbortController to timeout the request
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(streamUrl, {
      method: 'GET',
      headers: {
        'Icy-MetaData': '1',
        'User-Agent': 'HMI-Prototype/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    // Get ICY metadata interval from headers
    const icyMetaInt = parseInt(response.headers.get('icy-metaint') || '0', 10);
    const icyName = response.headers.get('icy-name') || '';
    const icyDescription = response.headers.get('icy-description') || '';
    const icyGenre = response.headers.get('icy-genre') || '';

    if (icyMetaInt > 0) {
      // Read stream data up to the metadata
      const reader = response.body.getReader();
      let bytesRead = 0;
      let metadata = '';
      
      try {
        while (bytesRead < icyMetaInt + 4081) { // Read a bit past the metadata position
          const { value, done } = await reader.read();
          if (done) break;
          
          bytesRead += value.length;
          
          // Check if we've passed the metadata position
          if (bytesRead >= icyMetaInt) {
            // Try to find and extract the StreamTitle
            const chunk = new TextDecoder('utf-8', { fatal: false }).decode(value);
            const streamTitleMatch = chunk.match(/StreamTitle='([^']*?)'/);
            if (streamTitleMatch) {
              metadata = streamTitleMatch[1];
              break;
            }
          }
        }
      } catch (readError) {
        console.log('Stream read error (expected):', readError.message);
      } finally {
        reader.cancel();
      }

      // Parse artist and title from metadata (usually "Artist - Title" format)
      let artist = '';
      let title = '';
      
      if (metadata) {
        const parts = metadata.split(' - ');
        if (parts.length >= 2) {
          artist = parts[0].trim();
          title = parts.slice(1).join(' - ').trim();
        } else {
          title = metadata.trim();
        }
      }

      res.json({
        success: true,
        nowPlaying: metadata || null,
        artist: artist || null,
        title: title || null,
        stationName: icyName || null,
        genre: icyGenre || null,
        description: icyDescription || null
      });
    } else {
      // No ICY metadata support
      res.json({
        success: true,
        nowPlaying: null,
        artist: null,
        title: null,
        stationName: icyName || null,
        genre: icyGenre || null,
        description: icyDescription || null,
        message: 'Stream does not support ICY metadata'
      });
    }
  } catch (error) {
    console.error('Error fetching now-playing:', error.message);
    res.json({
      success: false,
      nowPlaying: null,
      artist: null,
      title: null,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // Listen on all network interfaces

httpServer.listen(PORT, HOST, () => {
  console.log(`🚗 HMI Backend Server running on:`);
  console.log(`   ➜ Local:    http://localhost:${PORT}`);
  console.log(`   ➜ Network:  Use your local IP address with port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
});

