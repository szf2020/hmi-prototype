import { useEffect } from 'react';
import { useHMI } from '../contexts/HMIContext';
import StatusBar from './central/StatusBar';
import Environment3D from './central/Environment3D';
import TheaterApp from './central/TheaterApp';
import './PassengerDisplay.css';

function PassengerDisplay() {
  const { registerDisplay } = useHMI();

  useEffect(() => {
    registerDisplay('passenger');
  }, []);

  return (
    <div className="passenger-display">
      <Environment3D />
      <StatusBar />
      
      {/* Passenger Login - positioned over status bar */}
      <button className="passenger-login">
        <span className="passenger-login-text">Login</span>
        <svg width="32" height="32" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_passenger_login)">
            <g clipPath="url(#clip1_passenger_login)">
              <path d="M15 0C23.2795 3.58142e-07 30 6.7206 30 15C30 23.2795 23.2795 30 15 30C6.7206 30 3.58119e-07 23.2795 0 15C0 6.7206 6.7206 0 15 0ZM15 2.5C8.08825 2.5 2.5 8.08825 2.5 15C2.5 18.2077 3.70461 21.1295 5.68555 23.3408C7.17774 21.5871 10.5812 20 15 20C19.4237 20 22.8252 21.5824 24.3135 23.3408C26.2947 21.1294 27.5 18.208 27.5 15C27.5 8.08825 21.9118 2.5 15 2.5ZM15 6.5293C17.8235 6.5293 20.0439 8.98547 20.0439 11.9561C20.0439 15.1178 17.8382 17.5295 15 17.5C12.1765 17.4706 9.97083 15.1178 9.95605 11.9561C9.94136 8.98547 12.1765 6.5293 15 6.5293Z" fill="white" fillOpacity="0.9"/>
            </g>
          </g>
          <defs>
            <clipPath id="clip0_passenger_login">
              <rect width="30" height="30" rx="15" fill="white"/>
            </clipPath>
            <clipPath id="clip1_passenger_login">
              <rect width="30" height="30" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      </button>

      {/* Theater App Card Panel */}
      <div className="passenger-app-panel">
        <TheaterApp />
      </div>
    </div>
  );
}

export default PassengerDisplay;
