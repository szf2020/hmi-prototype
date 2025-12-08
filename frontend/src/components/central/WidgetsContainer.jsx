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
          {/* Widget Card 1 - Music Player */}
          <Card variant="default" className="widget-card music-widget">
            <div className="music-widget-content">
              <div className="music-header">
                <div className="music-album-cover">
                  <img 
                    src="https://images.unsplash.com/photo-1530549387789-4c1017266635?w=300&h=300&fit=crop" 
                    alt="Album Cover"
                    className="album-image"
                  />
                </div>
                <div className="music-track-info">
                  <Typography variant="body-medium" className="music-title">
                    Recto Verso
                  </Typography>
                  <Typography variant="body-medium" className="music-artist">
                    Paradis
                  </Typography>
                </div>
              </div>
              
              <div className="music-progress-container">
                <div className="music-progress-bar">
                  <div className="music-progress-fill" style={{ width: '48%' }}></div>
                </div>
              </div>

              <div className="music-controls">
                  <IconButton
                    icon={
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.33325 15.0206C3.33325 22.1998 9.17825 29.2307 18.6869 35.2451C19.0681 35.4991 19.6399 35.7534 19.9999 35.7534C20.3811 35.7534 20.9317 35.4991 21.3129 35.2451C30.8216 29.2307 36.6666 22.1998 36.6666 15.0206C36.6666 9.04854 32.5582 4.81305 27.0943 4.81305C23.9602 4.81305 21.5458 6.23194 19.9999 8.39204C18.4752 6.25312 16.0397 4.81305 12.9055 4.81305C7.44169 4.81305 3.33325 9.04854 3.33325 15.0206ZM6.38281 15.0206C6.38281 10.7216 9.15707 7.86262 12.8843 7.86262C16.0186 7.86262 17.7128 9.83212 18.7505 11.3357C19.2587 12.0769 19.5764 12.2887 19.9999 12.2887C20.4447 12.2887 20.6988 12.0558 21.2494 11.3357C22.3719 9.87447 24.0025 7.86262 27.1368 7.86262C30.864 7.86262 33.617 10.7216 33.617 15.0206C33.617 21.1621 27.0732 27.8753 20.3811 32.3225C20.1905 32.4496 20.0635 32.5343 19.9999 32.5343C19.9364 32.5343 19.8093 32.4496 19.6399 32.3225C12.9266 27.8753 6.38281 21.1621 6.38281 15.0206Z" fill="currentColor"/>
                      </svg>
                    }
                    label="Like"
                    className="music-control-btn"
                  />
                  
                  <IconButton
                    icon={
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M34.9062 9.83402L34.9062 30.0571C34.9062 31.5767 34.0333 32.288 32.9825 32.288C32.5299 32.288 32.0449 32.1586 31.5761 31.8838L14.6023 21.9905C13.6647 21.4571 13.1798 21.0206 12.9858 20.471L12.9858 30.041C12.9858 31.4635 12.2583 32.2071 10.8358 32.2071L7.16617 32.2071C5.7436 32.2071 4.99999 31.5282 4.99999 30.041L4.99999 9.85019C4.99999 8.42762 5.7436 7.68401 7.16617 7.68401L10.8357 7.68401C12.2583 7.68401 12.9858 8.42762 12.9858 9.85019L12.9858 19.404C13.1798 18.8706 13.6647 18.4341 14.6023 17.8845L31.5761 7.99115C32.0449 7.7325 32.5299 7.58701 32.9825 7.58701C34.0333 7.58701 34.9062 8.31446 34.9062 9.83402Z" fill="currentColor"/>
                      </svg>
                    }
                    label="Previous"
                    className="music-control-btn"
                  />
                  
                  <IconButton
                    icon={
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.877 35C9.21303 35 8.33325 34.1657 8.33325 32.5695V7.41233C8.33325 5.8162 9.21303 5 10.877 5H15.2376C16.9016 5 17.7813 5.74365 17.7813 7.41233V32.5695C17.7813 34.1657 16.9016 35 15.2376 35H10.877ZM24.7813 35C23.0983 35 22.2185 34.1657 22.2185 32.5695V7.41233C22.2185 5.8162 23.0983 5 24.7813 5H29.1229C30.8059 5 31.6666 5.74365 31.6666 7.41233V32.5695C31.6666 34.1657 30.8059 35 29.1229 35H24.7813Z" fill="currentColor"/>
                      </svg>
                    }
                    label="Pause"
                    className="music-control-btn music-control-play"
                  />
                  
                  <IconButton
                    icon={
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 30.041V9.81788C5 8.29832 5.87294 7.58704 6.9237 7.58704C7.37634 7.58704 7.8613 7.71636 8.3301 7.99117L25.3039 17.8845C26.2415 18.418 26.7265 18.8544 26.9205 19.404V9.83405C26.9205 8.41148 27.6479 7.66786 29.0705 7.66786H32.7401C34.1626 7.66786 34.9063 8.34682 34.9063 9.83405V30.0248C34.9063 31.4474 34.1626 32.191 32.7401 32.191H29.0705C27.6479 32.191 26.9205 31.4474 26.9205 30.0248V20.471C26.7265 21.0044 26.2415 21.4409 25.3039 21.9905L8.3301 31.8839C7.8613 32.1425 7.37634 32.288 6.9237 32.288C5.87294 32.288 5 31.5605 5 30.041Z" fill="currentColor"/>
                      </svg>
                    }
                    label="Next"
                    className="music-control-btn"
                  />
                  
                  <IconButton
                    icon={
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.33325 27.1427C3.33325 26.4207 3.88198 25.9442 4.66174 25.9442H8.02629C9.49918 25.9442 10.4955 25.4099 11.7518 23.9515L15.3907 19.6916L11.7518 15.4462C10.51 13.9878 9.51362 13.4535 8.02629 13.4535H4.66174C3.88198 13.4535 3.33325 12.9625 3.33325 12.255C3.33325 11.533 3.86754 11.0564 4.66174 11.0564H7.95409C10.3511 11.0564 11.723 11.7351 13.4702 13.7423L16.9792 17.8433L20.4881 13.7423C22.2209 11.7207 23.6072 11.042 26.0187 11.042H29.0366V7.56194C29.0366 6.98434 29.3688 6.66666 29.9608 6.66666C30.2352 6.66666 30.4951 6.7533 30.7117 6.92658L36.1701 11.4608C36.6321 11.8651 36.6321 12.4571 36.1701 12.8326L30.7117 17.3523C30.4951 17.5256 30.2352 17.6267 29.9608 17.6267C29.3688 17.6267 29.0366 17.2946 29.0366 16.717V13.4535H26.0909C24.5024 13.4535 23.4628 13.9878 22.2209 15.4318L18.5676 19.6916L22.2209 23.9515C23.4628 25.4099 24.5024 25.9442 26.0909 25.9442H29.0366V22.7674C29.0366 22.1898 29.3688 21.8576 29.9608 21.8576C30.2352 21.8576 30.4951 21.9587 30.7117 22.132L36.1701 26.6662C36.6321 27.0705 36.6321 27.6481 36.1701 28.038L30.7117 32.5578C30.4951 32.731 30.2352 32.8177 29.9608 32.8177C29.3688 32.8177 29.0366 32.5 29.0366 31.9224V28.3413H26.0187C23.6072 28.3413 22.2209 27.6626 20.4881 25.6554L16.9792 21.5544L13.4702 25.641C11.723 27.6626 10.3511 28.3413 7.95409 28.3413H4.66174C3.86754 28.3413 3.33325 27.8647 3.33325 27.1427Z" fill="currentColor"/>
                      </svg>
                    }
                    label="Shuffle"
                    className="music-control-btn"
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
