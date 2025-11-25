# Testing State Persistence

## Quick Test Guide

Follow these steps to verify that your HMI application now loads the latest data from the backend on every page reload.

### Prerequisites
- Backend server running on port 3001
- Frontend dev server running on port 5173

### Test 1: Basic State Persistence Across Page Reloads

1. **Open the HMI application** in your browser:
   - Go to `http://localhost:5173/central` (Central Display)
   - Or `http://localhost:5173/cluster` (Cluster Display)

2. **Make some changes in the UI**:
   - Adjust the temperature settings
   - Change the volume level
   - Modify any other settings

3. **Reload the webpage** (press F5 or Cmd+R)

4. **✅ Verify**: Your changes are still there! The page loaded the latest data from the backend.

### Test 2: State Persistence Across Backend Restarts

1. **Make changes in the HMI** (temperature, volume, etc.)

2. **Stop the backend server**:
   - Find the backend terminal
   - Press Ctrl+C to stop the server

3. **Check the state file**:
   - Look at `backend/hmi-state.json`
   - You should see your latest values saved there

4. **Restart the backend server**:
   ```bash
   cd backend
   node server.js
   ```
   
5. **Look for the console message**:
   - You should see: `✅ Loaded saved HMI state from file`

6. **Reload your webpage**

7. **✅ Verify**: Your changes are still there! Even after restarting the backend.

### Test 3: Cross-Display Synchronization

1. **Open multiple displays** in different browser tabs:
   - Tab 1: `http://localhost:5173/cluster`
   - Tab 2: `http://localhost:5173/central`

2. **Make changes in one display** (e.g., change temperature in Central)

3. **✅ Verify**: The changes appear in both displays in real-time

4. **Reload both tabs**

5. **✅ Verify**: Both displays load with the latest synchronized data

### Test 4: Direct API Testing

You can also test the backend API directly:

**Get current state:**
```bash
curl http://localhost:3001/api/state
```

**Update state:**
```bash
curl -X POST http://localhost:3001/api/state \
  -H "Content-Type: application/json" \
  -d '{"driverTemp":75,"volume":65}'
```

**Check the browser** - changes should appear immediately in all open displays!

## What Changed vs Before

### Before ❌
- Frontend used hardcoded initial values
- Backend reset to default values on restart
- Page reload would show default values until WebSocket reconnected
- State was lost when backend restarted

### After ✅
- Frontend fetches latest state from backend immediately on load
- Backend loads saved state from disk on startup
- Page reload always shows the latest data
- State persists across backend restarts
- All displays stay synchronized

## How It Works

1. **On Page Load**: Frontend makes REST API call to `GET /api/state` to fetch latest data immediately
2. **On WebSocket Connect**: Backend sends current state to newly connected displays
3. **On State Update**: Backend saves state to `hmi-state.json` file
4. **On Backend Restart**: Backend loads state from `hmi-state.json` file if it exists

## Troubleshooting

### Issue: Still seeing default values
**Solution**: Make sure backend is running on port 3001
```bash
# Check if backend is running
lsof -i :3001

# Or try to fetch state
curl http://localhost:3001/api/state
```

### Issue: State file not being created
**Solution**: Check backend console for error messages. Make sure backend has write permissions in the `backend/` directory.

### Issue: Changes not syncing across displays
**Solution**: Check browser console for WebSocket connection errors. Make sure you're connecting to the correct port (3001).

### Issue: Port mismatch
**Solution**: Verify these ports in your configuration:
- Backend runs on: `3001`
- Frontend runs on: `5173`
- Frontend connects to backend on: `3001` (check `HMIContext.jsx`)

## Current Test Status

As of this implementation:
- ✅ Backend running on port 3001
- ✅ REST API endpoint working (`/api/state`)
- ✅ State file created and persisting (`backend/hmi-state.json`)
- ✅ State saves on every update
- ✅ Test update successful (driverTemp: 75, passengerTemp: 72, volume: 60)
- ✅ Two WebSocket clients connected

**Your HMI now loads the latest data on every page reload!** 🎉

