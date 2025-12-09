import { useState, useEffect } from 'react';
import { Card, Button, Typography, IconButton } from '../../design-system';
import { useRadio } from '../../hooks/useRadio';
import './WidgetsContainer.css';

// Fallback image for stations without a logo
const FALLBACK_LOGO = 'data:image/svg+xml,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
    <rect width="80" height="80" rx="8" fill="#335fff" fill-opacity="0.2"/>
    <path d="M40 20C28.954 20 20 28.954 20 40s8.954 20 20 20 20-8.954 20-20-8.954-20-20-20zm0 36c-8.837 0-16-7.163-16-16s7.163-16 16-16 16 7.163 16 16-7.163 16-16 16z" fill="#335fff"/>
    <circle cx="40" cy="40" r="6" fill="#335fff"/>
  </svg>
`);

const WidgetsContainer = ({ setActiveView }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Radio state and controls
  const {
    currentStation,
    isPlaying,
    isLoading,
    togglePlayback,
    nextStation,
    prevStation,
    toggleFavorite,
    isFavorite,
    fetchStations,
    hasStations
  } = useRadio();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch stations if not loaded (for background playback support)
  useEffect(() => {
    if (!hasStations) {
      fetchStations('popular');
    }
  }, [hasStations, fetchStations]);

  // Generate calendar days for the current month
  const getCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty slots for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

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

  // Get station tags for display
  const getStationTags = (station) => {
    if (!station?.tags) return station?.country || 'Radio';
    const tags = station.tags
      .split(',')
      .slice(0, 2)
      .map(tag => tag.trim().charAt(0).toUpperCase() + tag.trim().slice(1).toLowerCase())
      .join(' • ');
    return tags || station.country || 'Radio';
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
      <div className="widgets-scroll-wrapper">
        <div className="widgets-scroll-area">
          <div className="widgets-grid">
          {/* Widget Card 1 - Radio Player */}
          <Card 
            variant="default" 
            className="widget-card music-widget"
            style={currentStation?.favicon ? {
              '--station-bg-image': `url(${currentStation.favicon})`
            } : undefined}
          >
            {currentStation?.favicon && (
              <div className={`music-widget-bg ${isPlaying ? 'is-playing' : 'is-paused'}`} />
            )}
            <div className="music-widget-content">
              <div className="music-header">
                <div className="music-album-cover">
                  <img 
                    src={currentStation?.favicon || FALLBACK_LOGO}
                    alt={currentStation?.name || 'Radio'}
                    className="album-image"
                    onError={(e) => { e.target.src = FALLBACK_LOGO; }}
                  />
                </div>
                <div className="music-track-info">
                  <Typography variant="body-medium" className="music-title" truncate>
                    {currentStation?.name || 'No Station Selected'}
                  </Typography>
                  <Typography variant="body-medium" className="music-artist">
                    {currentStation ? getStationTags(currentStation) : 'Open Media to browse'}
                  </Typography>
                </div>
              </div>
              
              {/* Live indicator hidden for now
              <div className="music-progress-container">
                {isLoading ? (
                  <div className="music-loading-indicator">
                    <span className="music-loading-dot"></span>
                    <span className="music-loading-dot"></span>
                    <span className="music-loading-dot"></span>
                    <Typography variant="label-small" className="music-loading-text">
                      Buffering...
                    </Typography>
                  </div>
                ) : isPlaying ? (
                  <div className="music-live-indicator">
                    <span className="music-live-dot"></span>
                    <Typography variant="label-small" className="music-live-text">
                      LIVE
                    </Typography>
                  </div>
                ) : currentStation ? (
                  <div className="music-paused-indicator">
                    <Typography variant="label-small" className="music-paused-text">
                      Paused
                    </Typography>
                  </div>
                ) : (
                  <div className="music-progress-bar">
                    <div className="music-progress-fill" style={{ width: '0%' }}></div>
                  </div>
                )}
              </div>
              */}

              <div className="music-controls">
                  <IconButton
                    icon={
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {currentStation && isFavorite(currentStation) ? (
                          <path d="M20 35.7534C19.6399 35.7534 19.0681 35.4991 18.6869 35.2451C9.17825 29.2307 3.33325 22.1998 3.33325 15.0206C3.33325 9.04854 7.44169 4.81305 12.9055 4.81305C16.0397 4.81305 18.4752 6.25312 19.9999 8.39204C21.5458 6.23194 23.9602 4.81305 27.0943 4.81305C32.5582 4.81305 36.6666 9.04854 36.6666 15.0206C36.6666 22.1998 30.8216 29.2307 21.3129 35.2451C20.9317 35.4991 20.3811 35.7534 19.9999 35.7534Z" fill="currentColor"/>
                        ) : (
                          <path d="M3.33325 15.0206C3.33325 22.1998 9.17825 29.2307 18.6869 35.2451C19.0681 35.4991 19.6399 35.7534 19.9999 35.7534C20.3811 35.7534 20.9317 35.4991 21.3129 35.2451C30.8216 29.2307 36.6666 22.1998 36.6666 15.0206C36.6666 9.04854 32.5582 4.81305 27.0943 4.81305C23.9602 4.81305 21.5458 6.23194 19.9999 8.39204C18.4752 6.25312 16.0397 4.81305 12.9055 4.81305C7.44169 4.81305 3.33325 9.04854 3.33325 15.0206ZM6.38281 15.0206C6.38281 10.7216 9.15707 7.86262 12.8843 7.86262C16.0186 7.86262 17.7128 9.83212 18.7505 11.3357C19.2587 12.0769 19.5764 12.2887 19.9999 12.2887C20.4447 12.2887 20.6988 12.0558 21.2494 11.3357C22.3719 9.87447 24.0025 7.86262 27.1368 7.86262C30.864 7.86262 33.617 10.7216 33.617 15.0206C33.617 21.1621 27.0732 27.8753 20.3811 32.3225C20.1905 32.4496 20.0635 32.5343 19.9999 32.5343C19.9364 32.5343 19.8093 32.4496 19.6399 32.3225C12.9266 27.8753 6.38281 21.1621 6.38281 15.0206Z" fill="currentColor"/>
                        )}
                      </svg>
                    }
                    label={currentStation && isFavorite(currentStation) ? 'Remove from favorites' : 'Add to favorites'}
                    className={`music-control-btn ${currentStation && isFavorite(currentStation) ? 'is-favorite' : ''}`}
                    onClick={() => currentStation && toggleFavorite(currentStation)}
                    disabled={!currentStation}
                  />
                  
                  <IconButton
                    icon={
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M34.9062 9.83402L34.9062 30.0571C34.9062 31.5767 34.0333 32.288 32.9825 32.288C32.5299 32.288 32.0449 32.1586 31.5761 31.8838L14.6023 21.9905C13.6647 21.4571 13.1798 21.0206 12.9858 20.471L12.9858 30.041C12.9858 31.4635 12.2583 32.2071 10.8358 32.2071L7.16617 32.2071C5.7436 32.2071 4.99999 31.5282 4.99999 30.041L4.99999 9.85019C4.99999 8.42762 5.7436 7.68401 7.16617 7.68401L10.8357 7.68401C12.2583 7.68401 12.9858 8.42762 12.9858 9.85019L12.9858 19.404C13.1798 18.8706 13.6647 18.4341 14.6023 17.8845L31.5761 7.99115C32.0449 7.7325 32.5299 7.58701 32.9825 7.58701C34.0333 7.58701 34.9062 8.31446 34.9062 9.83402Z" fill="currentColor"/>
                      </svg>
                    }
                    label="Previous station"
                    className="music-control-btn"
                    onClick={prevStation}
                    disabled={!currentStation}
                  />
                  
                  <IconButton
                    icon={
                      isPlaying ? (
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10.877 35C9.21303 35 8.33325 34.1657 8.33325 32.5695V7.41233C8.33325 5.8162 9.21303 5 10.877 5H15.2376C16.9016 5 17.7813 5.74365 17.7813 7.41233V32.5695C17.7813 34.1657 16.9016 35 15.2376 35H10.877ZM24.7813 35C23.0983 35 22.2185 34.1657 22.2185 32.5695V7.41233C22.2185 5.8162 23.0983 5 24.7813 5H29.1229C30.8059 5 31.6666 5.74365 31.6666 7.41233V32.5695C31.6666 34.1657 30.8059 35 29.1229 35H24.7813Z" fill="currentColor"/>
                        </svg>
                      ) : (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.13281 19.9766C4.13281 21.1367 4.80078 21.6875 5.59766 21.6875C5.94922 21.6875 6.3125 21.5703 6.67578 21.3828L20.3281 13.4023C21.3008 12.8398 21.6289 12.4531 21.6289 11.8438C21.6289 11.2227 21.3008 10.8477 20.3281 10.2852L6.67578 2.30469C6.3125 2.10547 5.94922 2 5.59766 2C4.80078 2 4.13281 2.55078 4.13281 3.71094V19.9766Z" fill="currentColor"/>
                        </svg>
                      )
                    }
                    label={isPlaying ? 'Pause' : 'Play'}
                    className="music-control-btn music-control-play"
                    onClick={togglePlayback}
                    disabled={!currentStation}
                  />
                  
                  <IconButton
                    icon={
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 30.041V9.81788C5 8.29832 5.87294 7.58704 6.9237 7.58704C7.37634 7.58704 7.8613 7.71636 8.3301 7.99117L25.3039 17.8845C26.2415 18.418 26.7265 18.8544 26.9205 19.404V9.83405C26.9205 8.41148 27.6479 7.66786 29.0705 7.66786H32.7401C34.1626 7.66786 34.9063 8.34682 34.9063 9.83405V30.0248C34.9063 31.4474 34.1626 32.191 32.7401 32.191H29.0705C27.6479 32.191 26.9205 31.4474 26.9205 30.0248V20.471C26.7265 21.0044 26.2415 21.4409 25.3039 21.9905L8.3301 31.8839C7.8613 32.1425 7.37634 32.288 6.9237 32.288C5.87294 32.288 5 31.5605 5 30.041Z" fill="currentColor"/>
                      </svg>
                    }
                    label="Next station"
                    className="music-control-btn"
                    onClick={nextStation}
                    disabled={!currentStation}
                  />
                  
                  <IconButton
                    icon={
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6H8.3l8.26-3.34L15.88 1 3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM8 18.98c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm6-9H4V8h10v1.98z" fill="currentColor" transform="scale(1.8) translate(1, 1)"/>
                      </svg>
                    }
                    label="Open Radio"
                    className="music-control-btn"
                    onClick={() => setActiveView('media')}
                  />
              </div>
            </div>
          </Card>

          {/* Widget Card 2 - Navigation Widget */}
          <Card variant="default" className="widget-card navigation-widget">
            <div className="navigation-widget-content">
              <div className="navigation-widget-left">
                <div className="navigation-text-content">
                  <Typography variant="body-medium" className="navigation-heading">
                    Feeling hungry?
                  </Typography>
                  <Typography variant="body-small" className="navigation-restaurant-name">
                    Meyhouse
                  </Typography>
                  <Typography variant="body-small" className="navigation-details-text">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="navigation-star-icon">
                      <path d="M6.13723 20.8328C6.53655 21.1323 7.02219 21.0147 7.60497 20.5974L11.9975 17.3988L16.4007 20.5974C16.9727 21.0147 17.4583 21.1323 17.8576 20.8328C18.2461 20.544 18.3217 20.0519 18.0842 19.3886L16.3467 14.2645L20.7823 11.1087C21.3651 10.7129 21.6134 10.2743 21.4515 9.80363C21.3003 9.35434 20.8471 9.12968 20.1348 9.14038L14.6955 9.18318L13.0443 4.02696C12.8284 3.35302 12.4939 3 11.9975 3C11.5118 3 11.1772 3.35302 10.9506 4.02696L9.29937 9.18318L3.86006 9.14038C3.14777 9.12968 2.70529 9.35434 2.5434 9.80363C2.39231 10.2743 2.64053 10.7129 3.21252 11.1087L7.64815 14.2645L5.91059 19.3886C5.67316 20.0519 5.74871 20.544 6.13723 20.8328Z" fill="#335FFF"/>
                    </svg>
                    5.0 · $$$ · New American
                  </Typography>
                </div>
                <Button 
                  variant="primary"
                  size="small"
                  className="navigation-eta-button"
                  onClick={() => setActiveView('navigation')}
                  icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

          {/* Widget Card 3 - Calendar Widget */}
          <Card variant="default" className="widget-card calendar-widget">
            <div className="calendar-widget-content">
              <div className="calendar-left">
                <div className="calendar-day-number">
                  {currentTime.getDate()}
                </div>
                <div className="calendar-info">
                  <Typography variant="body-small" className="calendar-month">
                    {currentTime.toLocaleString('en-US', { month: 'long' })}, {currentTime.getFullYear()}
                  </Typography>
                  <Typography variant="body-small" className="calendar-weekday-name">
                    {currentTime.toLocaleString('en-US', { weekday: 'long' })}
                  </Typography>
                </div>
                <div className="calendar-events">
                  <Typography variant="body-small" className="calendar-events-text">
                    No events today
                  </Typography>
                </div>
              </div>
              <div className="calendar-right">
                <div className="calendar-month-view">
                  <div className="calendar-weekdays">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <div key={index} className="calendar-weekday">
                        <Typography variant="body-small">{day}</Typography>
                      </div>
                    ))}
                  </div>
                  <div className="calendar-days-grid">
                    {getCalendarDays(currentTime).map((day, index) => (
                      <div
                        key={index}
                        className={`calendar-day ${day === currentTime.getDate() ? 'calendar-day-current' : ''} ${day === null ? 'calendar-day-empty' : ''}`}
                      >
                        {day && <Typography variant="body-small">{day}</Typography>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Widget Card 4 */}
          <Card variant="default" className="widget-card">
            {/* Content will be added later */}
          </Card>

          {/* Widget Card 5 */}
          <Card variant="default" className="widget-card">
            {/* Content will be added later */}
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetsContainer;
