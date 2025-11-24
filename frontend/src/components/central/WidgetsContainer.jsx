import { useState, useEffect } from 'react';
import { Card, Button, Typography, IconButton } from '../../design-system';
import './WidgetsContainer.css';

const WidgetsContainer = ({ setActiveView }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatAMPM = (date) => {
    return date.getHours() >= 12 ? 'PM' : 'AM';
  };

  const formatDate = (date) => {
    const options = { weekday: 'long' };
    const weekday = date.toLocaleDateString('en-US', options);

    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();

    return `${weekday}, ${month} ${day}, ${year}`;
  };

  return (
    <div className="widgets-container">
      {/* Fixed Header with Clock and Date */}
      <div className="widgets-header">
        <div className="widgets-clock">
          <div className="widgets-time">{formatTime(currentTime)}</div>
          <div className="widgets-datetime-info">
            <Typography variant="headline-small" className="widgets-ampm">
              {formatAMPM(currentTime)}
            </Typography>
            <Typography variant="body-medium" className="widgets-date">
              {formatDate(currentTime)}
            </Typography>
          </div>
        </div>
      </div>

      {/* Scrollable Area with Widget Cards */}
      <div className="widgets-scroll-area">
        <div className="widgets-grid">
          {/* Widget Card 1 - Music Player */}
          <Card variant="elevated" className="widget-card music-widget">
            <div className="music-widget-content">
              <div className="music-album-cover">
                <img 
                  src="https://images.unsplash.com/photo-1530549387789-4c1017266635?w=300&h=300&fit=crop" 
                  alt="Album Cover"
                  className="album-image"
                />
              </div>
              <div className="music-info">
                <Typography variant="headline-medium" className="music-title">
                  Recto Verso
                </Typography>
                <Typography variant="body-large" className="music-artist">
                  Paradis
                </Typography>
                
                <div className="music-progress-container">
                  <div className="music-progress-bar">
                    <div className="music-progress-fill" style={{ width: '48%' }}></div>
                  </div>
                </div>

                <div className="music-controls">
                  <IconButton
                    icon={
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M24 42L20.55 38.85C11.4 30.48 5.25 24.84 5.25 17.85C5.25 12.21 9.66 7.8 15.3 7.8C18.54 7.8 21.66 9.36 24 11.82C26.34 9.36 29.46 7.8 32.7 7.8C38.34 7.8 42.75 12.21 42.75 17.85C42.75 24.84 36.6 30.48 27.45 38.85L24 42Z" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                      </svg>
                    }
                    label="Like"
                    className="music-control-btn"
                  />
                  
                  <IconButton
                    icon={
                      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                        <path d="M14 14V42M42 28L22 14V42L42 28Z" fill="currentColor"/>
                      </svg>
                    }
                    label="Previous"
                    className="music-control-btn"
                  />
                  
                  <IconButton
                    icon={
                      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                        <rect x="18" y="14" width="6" height="28" rx="2" fill="currentColor"/>
                        <rect x="32" y="14" width="6" height="28" rx="2" fill="currentColor"/>
                      </svg>
                    }
                    label="Pause"
                    className="music-control-btn music-control-play"
                  />
                  
                  <IconButton
                    icon={
                      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                        <path d="M42 14V42M14 28L34 42V14L14 28Z" fill="currentColor"/>
                      </svg>
                    }
                    label="Next"
                    className="music-control-btn"
                  />
                  
                  <IconButton
                    icon={
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M36 10.5L42 16.5L36 22.5M36 25.5L42 31.5L36 37.5M42 16.5H33C28.05 16.5 24 20.55 24 25.5C24 30.45 28.05 34.5 33 34.5H42M6 16.5H15C19.95 16.5 24 20.55 24 25.5M24 25.5C24 30.45 19.95 34.5 15 34.5H6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    }
                    label="Shuffle"
                    className="music-control-btn"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Widget Card 2 - Navigation Widget */}
          <Card variant="elevated" className="widget-card navigation-widget">
            <div className="navigation-widget-content">
              <div className="navigation-widget-info">
                <IconButton
                  icon={
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M16 2L19.708 12.292L30 16L19.708 19.708L16 30L12.292 19.708L2 16L12.292 12.292L16 2Z" fill="currentColor"/>
                    </svg>
                  }
                  label="Favorite destination"
                  className="navigation-star-button"
                />
                <Button 
                  variant="primary"
                  size="small"
                  className="navigation-eta-button"
                  onClick={() => setActiveView('navigation')}
                  icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L4.5 20.5L12 17L19.5 20.5L12 2Z" fill="currentColor"/>
                    </svg>
                  }
                  iconPosition="left"
                >
                  12 minutes away
                </Button>
              </div>
              <div className="navigation-destination-image">
                <img 
                  src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop" 
                  alt="Destination"
                  className="destination-image"
                />
              </div>
            </div>
          </Card>

          {/* Widget Card 3 */}
          <Card variant="elevated" className="widget-card">
            {/* Content will be added later */}
          </Card>

          {/* Widget Card 4 */}
          <Card variant="elevated" className="widget-card">
            {/* Content will be added later */}
          </Card>

          {/* Widget Card 5 */}
          <Card variant="elevated" className="widget-card">
            {/* Content will be added later */}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WidgetsContainer;
