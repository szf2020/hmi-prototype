import { useEffect } from 'react';
import { useHMI } from '../contexts/HMIContext';
import './ClusterDisplay.css';

function ClusterDisplay() {
  const { state, registerDisplay, connected } = useHMI();

  useEffect(() => {
    registerDisplay('cluster');
  }, []);

  // Calculate speedometer needle rotation (0-280 degrees for 0-240 km/h)
  const speedRotation = (state.currentSpeed / 240) * 280 - 140;

  return (
    <div className="cluster-display">
      <div className="cluster-header">
        <div className={`connection-indicator ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '● Connected' : '○ Disconnected'}
        </div>
        <h2>CLUSTER DISPLAY</h2>
      </div>

      <div className="cluster-content">
        {/* Speedometer */}
        <div className="speedometer">
          <div className="speed-gauge">
            <div className="speed-needle" style={{ transform: `rotate(${speedRotation}deg)` }}></div>
            <div className="speed-center"></div>
            <div className="speed-markers">
              {[0, 40, 80, 120, 160, 200, 240].map((speed) => (
                <div key={speed} className="speed-marker" data-speed={speed}>
                  {speed}
                </div>
              ))}
            </div>
          </div>
          <div className="speed-digital">
            <div className="speed-value">{state.currentSpeed}</div>
            <div className="speed-unit">km/h</div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="info-panel">
          <div className="info-row">
            <div className="info-item">
              <div className="info-icon">⛽</div>
              <div className="info-details">
                <div className="info-label">Fuel</div>
                <div className="info-value">{state.fuelLevel}%</div>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">🛣️</div>
              <div className="info-details">
                <div className="info-label">Range</div>
                <div className="info-value">{state.range} km</div>
              </div>
            </div>
          </div>

          <div className="info-row">
            <div className="info-item">
              <div className="info-icon">🌡️</div>
              <div className="info-details">
                <div className="info-label">Driver Temp</div>
                <div className="info-value">{state.driverTemp}°F</div>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">🌡️</div>
              <div className="info-details">
                <div className="info-label">Passenger</div>
                <div className="info-value">{state.passengerTemp}°F</div>
              </div>
            </div>
          </div>

          <div className="info-row">
            <div className="info-item">
              <div className="info-icon">🔊</div>
              <div className="info-details">
                <div className="info-label">Volume</div>
                <div className="info-value">{state.radio?.volume ?? 50}%</div>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">💨</div>
              <div className="info-details">
                <div className="info-label">Fan Speed</div>
                <div className="info-value">{state.fanSpeed}</div>
              </div>
            </div>
          </div>

          <div className="media-info">
            <div className="media-status">
              {state.mediaPlaying ? '▶️ Playing' : '⏸️ Paused'}
            </div>
            <div className="media-track">{state.currentTrack}</div>
          </div>
        </div>
      </div>

      <div className="cluster-footer">
        <div className="trip-info">
          Trip: {state.tripDistance.toFixed(1)} km
        </div>
      </div>
    </div>
  );
}

export default ClusterDisplay;

