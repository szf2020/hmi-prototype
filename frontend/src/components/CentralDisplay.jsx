import { useEffect, useState } from 'react';
import { useHMI } from '../contexts/HMIContext';
import StatusBar from './central/StatusBar';
import BottomNav from './central/BottomNav';
import NavigationApp from './central/NavigationApp';
import CameraApp from './central/CameraApp';
import WidgetsContainer from './central/WidgetsContainer';
import './CentralDisplay.css';
import './central/NavigationApp.css';

function CentralDisplay() {
  const { registerDisplay } = useHMI();
  const [activeView, setActiveView] = useState('home');

  useEffect(() => {
    registerDisplay('central');
  }, []);

  return (
    <div className="central-display">
      <StatusBar />
      
      {/* Home View - Vehicle Image and Widgets */}
      {activeView === 'home' && (
        <div className="home-vehicle-view">
          <div className="home-vehicle-container">
            <img 
              src="/images/vehicle.png" 
              alt="Porsche Vehicle" 
              className="home-vehicle-image"
            />
          </div>
          <WidgetsContainer setActiveView={setActiveView} />
        </div>
      )}
      
      {/* Navigation App */}
      {activeView === 'navigation' && <NavigationApp key="navigation-map" />}
      
      {/* Camera App */}
      {activeView === 'camera' && <CameraApp />}
      
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
}

export default CentralDisplay;
