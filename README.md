# HMI Multi-Display Prototype

A scalable web-based HMI (Human-Machine Interface) prototype system for user testing across multiple displays simultaneously. Perfect for automotive interfaces with cluster, central, and passenger displays.

## 🚀 Features

- **Real-time Multi-Display Sync**: Changes on one display instantly reflect across all connected displays
- **WebSocket Communication**: Fast, bi-directional communication between displays
- **Modern UI**: Beautiful, responsive interface built with React
- **Scalable Architecture**: Easy to extend with new features and displays
- **User Testing Ready**: Perfect for prototyping and gathering user feedback

## 📦 What's Included

### Three Display Types:

1. **Cluster Display** 🎯
   - Speedometer with animated needle
   - Vehicle information (fuel, range, trip distance)
   - Media status
   - Climate information

2. **Central Display** 🎛️
   - Climate control (temperature, fan speed, AC mode)
   - Media player with volume control
   - Vehicle information and diagnostics
   - Speed simulator for testing

3. **Passenger Display** 🎬
   - Entertainment center (video, music, games, streaming)
   - Comfort controls (seat heating, ventilation, ambient lighting)
   - System information
   - Brightness control

## 🛠️ Tech Stack

### Backend
- Node.js
- Express
- Socket.IO (WebSocket)

### Frontend
- React 18
- Vite
- React Router
- Socket.IO Client

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🚦 Getting Started

### 1. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 2. Start the Backend Server

```bash
cd backend
npm start
```

The server will start on `http://localhost:3000`

### 3. Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Open Multiple Displays

You have several options:

#### Option A: Single Computer, Multiple Monitors
1. Open your browser and navigate to `http://localhost:5173`
2. From the home page, click on "Open Cluster ↗", "Open Central ↗", and "Open Passenger ↗"
3. Drag each window to a different monitor
4. Press F11 on each window for fullscreen mode (optional)

#### Option B: Multiple Devices on Same Network
1. Find your computer's local IP address:
   - macOS/Linux: `ifconfig` or `ip addr`
   - Windows: `ipconfig`
2. On each device, navigate to `http://[YOUR_IP]:5173`
3. Select the appropriate display for each device

#### Option C: Mixed Setup
Combine both approaches for maximum flexibility!

## 🎮 Using the Prototype

### Interacting Across Displays

**Try these interactions to see real-time sync:**

1. **Climate Control** (Central Display)
   - Adjust temperature → See it update on Cluster and Passenger displays
   - Change fan speed → Reflected everywhere

2. **Media Control** (Central Display)
   - Play/Pause media → Status shows on all displays
   - Adjust volume → Updates across all displays

3. **Speed Simulation** (Central Display)
   - Use the speed slider → Watch the speedometer needle move on Cluster display

4. **Brightness** (Passenger Display)
   - Adjust brightness → System setting updated everywhere

## 📁 Project Structure

```
hmi-prototype/
├── backend/
│   ├── server.js          # WebSocket server & state management
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Display components
│   │   │   ├── Home.jsx
│   │   │   ├── ClusterDisplay.jsx
│   │   │   ├── CentralDisplay.jsx
│   │   │   └── PassengerDisplay.jsx
│   │   ├── contexts/      # React Context for state management
│   │   │   └── HMIContext.jsx
│   │   ├── styles/        # Global styles
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🔧 Customization

### Adding New State Variables

1. **Update the initial state** in `backend/server.js`:
```javascript
const hmiState = {
  // Add your new state here
  newFeature: initialValue,
  // ...
};
```

2. **Add state to frontend context** in `frontend/src/contexts/HMIContext.jsx`:
```javascript
const [state, setState] = useState({
  // Add matching state here
  newFeature: initialValue,
  // ...
});
```

### Creating New Actions

1. **Add action handler** in `backend/server.js`:
```javascript
function handleAction(action) {
  switch (action.type) {
    case 'YOUR_NEW_ACTION':
      // Update state based on action
      hmiState.someValue = action.payload;
      break;
    // ...
  }
}
```

2. **Dispatch from frontend**:
```javascript
dispatchAction({
  type: 'YOUR_NEW_ACTION',
  payload: someValue
});
```

### Adding a New Display

1. Create new component in `frontend/src/components/YourDisplay.jsx`
2. Register it in `frontend/src/App.jsx`
3. Add route: `<Route path="/yourdisplay" element={<YourDisplay />} />`
4. Update backend display tracking if needed

## 🧪 Testing Tips

1. **Open Developer Console** on each display to see WebSocket messages
2. **Network Tab** helps debug connection issues
3. **Use the Speed Simulator** on Central Display to test dynamic updates
4. **Test on Different Devices** to ensure cross-device compatibility

## 🐛 Troubleshooting

### Displays Not Connecting
- Ensure backend server is running on port 3000
- Check firewall settings if using multiple devices
- Verify WebSocket URL in `HMIContext.jsx` matches your setup

### State Not Syncing
- Check browser console for errors
- Verify all displays show "Connected" status
- Restart backend server if state becomes inconsistent

### Styling Issues
- Clear browser cache
- Check for CSS file imports
- Verify viewport settings for mobile devices

## 🚀 Production Deployment

### Backend
```bash
cd backend
npm start
```

For production, consider using:
- PM2 for process management
- Environment variables for configuration
- HTTPS for secure WebSocket connections

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

Deploy the `dist` folder to any static hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Your own server

## 📝 Future Enhancements

Some ideas to extend this prototype:

- [ ] Add authentication for multi-user testing
- [ ] Record and replay user interactions
- [ ] Add haptic feedback simulation
- [ ] Implement gesture controls
- [ ] Add voice command simulation
- [ ] Create admin dashboard for monitoring
- [ ] Add data analytics and heatmaps
- [ ] Support for custom themes
- [ ] Offline mode with service workers
- [ ] Add more vehicle simulations

## 🤝 Contributing

This is a prototype framework designed for easy customization. Feel free to:
- Add new features
- Improve UI/UX
- Optimize performance
- Add documentation

## 📄 License

MIT License - feel free to use this for your projects!

## 💡 Tips for User Testing

1. **Prepare Test Scenarios**: Create specific tasks for users to complete
2. **Observe Cross-Display Interactions**: Watch how users expect changes to propagate
3. **Record Sessions**: Use screen recording on all displays
4. **Gather Feedback**: Ask users about the multi-display experience
5. **Iterate Quickly**: The modular structure makes rapid prototyping easy

## 🎯 Use Cases

- Automotive HMI design
- Smart home control interfaces
- Multi-screen entertainment systems
- Industrial control panels
- Retail kiosk systems
- Educational interfaces

---

**Happy Prototyping! 🚗💨**

For questions or issues, please create an issue in your repository or contact your development team.

# hmi-prototype
# hmi-prototype
