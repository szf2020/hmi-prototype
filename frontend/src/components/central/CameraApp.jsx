import { useState } from 'react';
import './CameraApp.css';

function CameraApp() {
  const [activeCamera, setActiveCamera] = useState('rear');

  const cameras = [
    { id: 'front', label: 'Front', position: 'top' },
    { id: 'front-left', label: 'Front Left', position: 'top-left' },
    { id: 'front-right', label: 'Front Right', position: 'top-right' },
    { id: 'rear', label: 'Rear', position: 'bottom' },
    { id: 'rear-left', label: 'Rear Left', position: 'bottom-left' },
    { id: 'rear-right', label: 'Rear Right', position: 'bottom-right' }
  ];

  return (
    <div className="camera-app">
      <div className="camera-content">
        {/* Left Side - Surround View with Camera Selector */}
        <div className="camera-left-panel">
          {/* Surround View Display */}
          <div className="surround-view">
            <div className="surround-view-container">
              {/* Camera Selector Dots - Overlaid on top */}
              <div className="camera-selector">
                {cameras.map((camera) => (
                  <div
                    key={camera.id}
                    className={`camera-dot ${camera.position} ${activeCamera === camera.id ? 'active' : ''}`}
                    aria-label={camera.label}
                  >
                    <span className="dot-inner"></span>
                  </div>
                ))}
              </div>

              {/* Vehicle Icon in Center */}
              <img src="/images/top down car.png" alt="Vehicle Top View" className="vehicle-icon" />

              {/* Proximity Zones */}
              <div className="proximity-zones">
                <div 
                  className={`zone zone-front ${activeCamera === 'front' ? 'active' : ''}`}
                  onClick={() => setActiveCamera('front')}
                  role="button"
                  tabIndex={0}
                  aria-label="Select front camera"
                ></div>
                <div 
                  className={`zone zone-front-left ${activeCamera === 'front-left' ? 'active' : ''}`}
                  onClick={() => setActiveCamera('front-left')}
                  role="button"
                  tabIndex={0}
                  aria-label="Select front left camera"
                ></div>
                <div 
                  className={`zone zone-front-right ${activeCamera === 'front-right' ? 'active' : ''}`}
                  onClick={() => setActiveCamera('front-right')}
                  role="button"
                  tabIndex={0}
                  aria-label="Select front right camera"
                ></div>
                <div 
                  className={`zone zone-rear ${activeCamera === 'rear' ? 'active' : ''}`}
                  onClick={() => setActiveCamera('rear')}
                  role="button"
                  tabIndex={0}
                  aria-label="Select rear camera"
                ></div>
                <div 
                  className={`zone zone-rear-left ${activeCamera === 'rear-left' ? 'active' : ''}`}
                  onClick={() => setActiveCamera('rear-left')}
                  role="button"
                  tabIndex={0}
                  aria-label="Select rear left camera"
                ></div>
                <div 
                  className={`zone zone-rear-right ${activeCamera === 'rear-right' ? 'active' : ''}`}
                  onClick={() => setActiveCamera('rear-right')}
                  role="button"
                  tabIndex={0}
                  aria-label="Select rear right camera"
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Individual Camera View */}
        <div className="camera-right-panel">
          <div className="individual-camera-view">
            <div className="camera-placeholder">
              <svg width="120" height="120" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M32 14.4004C41.7201 14.4004 49.6004 22.28 49.6006 32C49.6006 41.7202 41.7202 49.6006 32 49.6006C22.28 49.6004 14.4004 41.7201 14.4004 32C14.4006 22.2801 22.2801 14.4006 32 14.4004ZM22.5527 29C21.172 29 20.0527 30.1193 20.0527 31.5C20.0527 32.8807 21.172 34 22.5527 34C23.9334 34 25.0527 32.8807 25.0527 31.5C25.0527 30.1193 23.9334 29 22.5527 29ZM29.5527 20C27.0675 20 25.0527 22.0147 25.0527 24.5C25.0527 26.9853 27.0675 29 29.5527 29C32.038 29 34.0527 26.9853 34.0527 24.5C34.0527 22.0147 32.038 20 29.5527 20Z" fill="url(#paint0_linear_camera_placeholder)"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M31.999 7.19922C45.6956 7.19922 56.7987 18.3025 56.7988 31.999C56.7988 45.6957 45.6957 56.7988 31.999 56.7988C18.3025 56.7987 7.19922 45.6956 7.19922 31.999C7.19932 18.3025 18.3025 7.19932 31.999 7.19922ZM32 10.4004C20.071 10.4006 10.4006 20.071 10.4004 32C10.4004 43.9292 20.0708 53.6004 32 53.6006C43.9294 53.6006 53.6006 43.9294 53.6006 32C53.6004 20.0708 43.9292 10.4004 32 10.4004Z" fill="url(#paint1_linear_camera_placeholder)"/>
                <defs>
                  <linearGradient id="paint0_linear_camera_placeholder" x1="2.1974" y1="5.35156" x2="62.2192" y2="62.5152" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#969696"/>
                    <stop offset="1" stopColor="#595959"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear_camera_placeholder" x1="2.1974" y1="5.35156" x2="62.2192" y2="62.5152" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#969696"/>
                    <stop offset="1" stopColor="#595959"/>
                  </linearGradient>
                </defs>
              </svg>
              <p className="camera-label">{cameras.find(cam => cam.id === activeCamera)?.label}</p>
              <p className="camera-status">Camera feed would appear here</p>
            </div>

            {/* Camera Overlay Guidelines */}
            {(activeCamera === 'rear' || activeCamera === 'front') && (
              <div className="parking-guidelines">
                <svg className="guideline-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 20 100 Q 50 60, 80 100" stroke="rgba(0, 255, 0, 0.6)" strokeWidth="2" fill="none"/>
                  <path d="M 25 85 Q 50 50, 75 85" stroke="rgba(255, 255, 0, 0.6)" strokeWidth="2" fill="none"/>
                  <path d="M 30 70 Q 50 40, 70 70" stroke="rgba(255, 0, 0, 0.6)" strokeWidth="2" fill="none"/>
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CameraApp;

