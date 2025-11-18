# Deployment Guide: Running on Multiple PCs

## 📋 Overview

You have 3 options to run this HMI prototype on another PC:
1. **Git Repository** (Recommended - Best for collaboration)
2. **Direct File Copy** (Quick and simple)
3. **Network Setup** (For multi-device testing)

---

## Option 1: Using Git (Recommended) ✅

### On Your Current Mac (This Computer)

#### Step 1: Commit Your Code
```bash
cd /Users/luyaozhang/hmi-prototype
git add -A
git commit -m "Initial commit: HMI Multi-Display Prototype"
```

#### Step 2: Create GitHub Repository
1. Go to https://github.com
2. Click "New Repository"
3. Name it: `hmi-prototype`
4. Don't initialize with README (we already have one)
5. Click "Create Repository"

#### Step 3: Push to GitHub
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/hmi-prototype.git
git branch -M main
git push -u origin main
```

### On Your Other PC

#### Step 1: Install Prerequisites
- Install Node.js from: https://nodejs.org (LTS version)
- Install Git from: https://git-scm.com/downloads
- **No need to install Cursor** - it's just a code editor!

#### Step 2: Clone the Repository
```bash
# Replace YOUR_USERNAME with your GitHub username
git clone https://github.com/YOUR_USERNAME/hmi-prototype.git
cd hmi-prototype
```

#### Step 3: Install Dependencies
```bash
# Install all dependencies
npm run install:all

# Or manually:
cd backend && npm install
cd ../frontend && npm install
```

#### Step 4: Run the Application
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Option 2: Direct File Copy (Simple)

### Step 1: Copy Project to USB/Cloud

**Using USB Drive:**
```bash
# Copy entire project
cp -r /Users/luyaozhang/hmi-prototype /Volumes/YOUR_USB/
```

**Using Cloud (Dropbox, Google Drive, etc.):**
- Just drag the `hmi-prototype` folder to your cloud folder

### Step 2: On Other PC

1. Copy folder from USB or download from cloud
2. Install Node.js (https://nodejs.org)
3. Open terminal/command prompt:
   ```bash
   cd path/to/hmi-prototype
   
   # Install dependencies
   cd backend && npm install
   cd ../frontend && npm install
   
   # Run servers (2 terminal windows)
   # Terminal 1:
   cd backend && npm start
   
   # Terminal 2:
   cd frontend && npm run dev
   ```

---

## Option 3: Multi-Device Network Setup 🌐

**Use this if you want to run displays on DIFFERENT devices simultaneously**
(e.g., Cluster on PC1, Central on PC2, Passenger on tablet)

### Setup

#### On Server PC (runs backend):

1. **Find your IP address:**
   - **Windows:** `ipconfig` (look for IPv4)
   - **Mac/Linux:** `ifconfig` or `ip addr` (look for inet)
   - Example: `192.168.1.100`

2. **Update backend server to allow external connections:**

Edit `backend/server.js`:
```javascript
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, '0.0.0.0', () => {  // Changed from localhost
  console.log(`🚗 HMI Backend Server running on port ${PORT}`);
  console.log(`📡 Local: http://localhost:${PORT}`);
  console.log(`📡 Network: http://YOUR_IP_ADDRESS:${PORT}`);
});
```

3. **Update CORS settings in `backend/server.js`:**
```javascript
const io = new Server(httpServer, {
  cors: {
    origin: "*",  // Allow all origins (for testing)
    methods: ["GET", "POST"]
  }
});
```

4. **Start backend:**
```bash
cd backend
npm start
```

#### On Client Devices (runs frontend):

1. **Update WebSocket connection:**

Edit `frontend/src/contexts/HMIContext.jsx`:
```javascript
// Replace localhost with server's IP address
const newSocket = io('http://192.168.1.100:3000');  // Use server's IP
```

2. **Update Vite config for network access:**

Edit `frontend/vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',  // Listen on all interfaces
    strictPort: true
  }
});
```

3. **Start frontend and access from any device:**
```bash
cd frontend
npm run dev

# Access from any device on same network:
# http://CLIENT_DEVICE_IP:5173
```

### Network Testing Scenarios

#### Scenario A: All displays on different PCs
```
PC 1 (Server): Runs backend
PC 2: Opens http://PC1_IP:5173/cluster
PC 3: Opens http://PC1_IP:5173/central
PC 4: Opens http://PC1_IP:5173/passenger
```

#### Scenario B: Mixed setup
```
Main PC: Runs backend + opens Cluster display
Tablet: Opens http://MAIN_PC_IP:5173/passenger
Laptop: Opens http://MAIN_PC_IP:5173/central
```

---

## 🔧 Troubleshooting

### Firewall Issues

**Windows:**
```powershell
# Allow Node.js through firewall
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes
```

**Mac:**
```bash
# System Preferences → Security & Privacy → Firewall → Firewall Options
# Allow Node.js to accept incoming connections
```

**Linux:**
```bash
# Ubuntu/Debian
sudo ufw allow 3000
sudo ufw allow 5173

# CentOS/RHEL
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --add-port=5173/tcp --permanent
sudo firewall-cmd --reload
```

### Connection Issues

1. **Can't connect to backend:**
   - Verify backend is running: `curl http://localhost:3000/health`
   - Check firewall settings
   - Ensure devices are on same network

2. **Displays not syncing:**
   - Check browser console for WebSocket errors
   - Verify IP address in HMIContext.jsx
   - Check CORS settings in server.js

3. **Port already in use:**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   
   # Kill process on port 5173
   lsof -ti:5173 | xargs kill -9
   ```

---

## 🎯 Quick Reference

### What You Need on Each PC:
- ✅ Node.js (v16+)
- ✅ Project files
- ❌ Cursor (NOT needed - it's just a code editor)
- ❌ Git (optional, only for cloning)

### Commands Cheat Sheet:
```bash
# Install dependencies
npm run install:all

# Start backend
cd backend && npm start

# Start frontend  
cd frontend && npm run dev

# Access app
http://localhost:5173
```

### Network Access:
```bash
# Backend: http://SERVER_IP:3000
# Frontend: http://CLIENT_IP:5173
```

---

## 📱 Platform-Specific Notes

### Windows PC
- Use Command Prompt or PowerShell
- No need for `.sh` scripts, use `npm` commands directly

### Mac
- Terminal app works great
- Can use the `.sh` scripts provided

### Linux
- Terminal app
- May need `sudo` for port binding < 1024

---

## 🚀 Production Deployment (Optional)

For more permanent setup:

1. **Backend on Cloud Server:**
   - Deploy to Heroku, DigitalOcean, AWS, etc.
   - Use environment variables for configuration

2. **Frontend on CDN:**
   - Build: `npm run build`
   - Deploy `dist/` folder to Netlify, Vercel, etc.

3. **Docker Container (Advanced):**
   - Create Dockerfile for easy deployment
   - Run entire stack in containers

---

**Need help? Check the README.md or create an issue in your Git repository!**

