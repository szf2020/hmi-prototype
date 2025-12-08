# State Persistence Implementation Summary

## Problem
The HMI application was loading hardcoded/preset data on every page reload instead of fetching the latest data from the backend. Additionally, the backend would lose all state when restarted.

## Solutions Implemented

### 1. Fixed WebSocket Connection Port
**File**: `frontend/src/contexts/HMIContext.jsx`
- Changed connection from `http://localhost:3000` to `http://localhost:3001`
- This matches the actual backend server port

### 2. Added REST API for Initial State Load
**File**: `frontend/src/contexts/HMIContext.jsx`
- Added a `useEffect` hook that fetches initial state from backend on mount
- Uses REST API endpoint `/api/state` to get current state immediately
- Falls back to default values if backend is unavailable
- This ensures the frontend always has the latest data, even before WebSocket connects

### 3. Backend State Persistence to Disk
**File**: `backend/server.js`
- Added file system imports (`fs`, `path`, `fileURLToPath`)
- State is now saved to `backend/hmi-state.json` file
- Backend loads saved state on startup if file exists
- State is automatically saved whenever:
  - A state update is received via WebSocket (`update-state` event)
  - An action is dispatched (`action` event)
  - A REST API update is made (`POST /api/state`)

### 4. Added REST API Endpoints
**File**: `backend/server.js`

#### GET `/api/state`
- Returns current HMI state as JSON
- Used by frontend to fetch initial state on load

#### POST `/api/state`
- Updates HMI state via REST API
- Saves state to disk
- Broadcasts update to all connected WebSocket clients
- Returns success status and updated state

### 5. Updated .gitignore
**File**: `.gitignore`
- Added `backend/hmi-state.json` to prevent committing runtime state to git
- This keeps the repository clean while allowing local state persistence

## Benefits

### For Users
- **Page Reload**: Webpage now loads the latest data from backend immediately
- **Backend Restart**: Backend remembers the last state and restores it on startup
- **Cross-Display Sync**: All displays (Cluster, Central, Passenger) stay synchronized
- **No Data Loss**: State persists across restarts and reloads

### Technical Improvements
- Dual communication channels (WebSocket for real-time + REST for initial load)
- Automatic state persistence without manual intervention
- Graceful fallback if backend is unavailable
- Clean separation between default values and runtime state

## Data Flow

### On Frontend Load
1. Frontend fetches initial state via REST API (`GET /api/state`)
2. Frontend connects to backend via WebSocket
3. Display registers with backend (sends `register` event)
4. Backend sends current state via WebSocket (`state-update` event)
5. Frontend is now synchronized with latest backend state

### On State Update
1. User interacts with display (e.g., changes temperature)
2. Frontend sends update via WebSocket (`update-state` or `action` event)
3. Backend updates state in memory
4. Backend saves state to `hmi-state.json` file
5. Backend broadcasts update to all connected displays
6. All displays receive and render the new state

### On Backend Restart
1. Backend starts up
2. Backend checks for `hmi-state.json` file
3. If file exists, loads saved state
4. If file doesn't exist, uses default values
5. Backend is ready with the correct state

## Testing the Changes

### Test 1: Page Reload
1. Make changes in the HMI (adjust temperature, volume, etc.)
2. Reload the webpage
3. ✅ Verify that your changes persist and the latest values are displayed

### Test 2: Backend Restart
1. Make changes in the HMI
2. Stop the backend server
3. Start the backend server again
4. Reload the webpage
5. ✅ Verify that your changes were preserved across the restart

### Test 3: Cross-Display Sync
1. Open multiple displays (e.g., Cluster and Central)
2. Make changes in one display
3. ✅ Verify that changes appear in all displays in real-time

## Files Modified
- `frontend/src/contexts/HMIContext.jsx` - Added REST API fetch and fixed port
- `backend/server.js` - Added state persistence and REST API endpoints
- `.gitignore` - Added state file to ignore list

## New Files Created
- `backend/hmi-state.json` - (Generated at runtime) Persistent state storage




