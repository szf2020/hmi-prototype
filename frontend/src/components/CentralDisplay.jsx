import { useEffect, useState } from 'react';
import { useHMI } from '../contexts/HMIContext';
import StatusBar from './central/StatusBar';
import BottomNav from './central/BottomNav';
import './CentralDisplay.css';

function CentralDisplay() {
  const { registerDisplay } = useHMI();
  const [activeView, setActiveView] = useState('home');

  useEffect(() => {
    registerDisplay('central');
  }, []);

  return (
    <div className="central-display">
      <StatusBar />
      
      {/* Home View - Vehicle Image */}
      {activeView === 'home' && (
        <div className="home-vehicle-view">
          <div className="home-vehicle-container">
            <img 
              src="/images/vehicle.png" 
              alt="Porsche Vehicle" 
              className="home-vehicle-image"
            />
          </div>
        </div>
      )}
      
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
}

export default CentralDisplay;
