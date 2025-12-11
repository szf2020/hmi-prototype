import { useEffect, useState } from 'react';
import { Card, Typography, IconButton, Slider, Button } from '../../design-system';
import { useRadio } from '../../hooks/useRadio';
import './RadioView.css';

// Media source options
const MEDIA_SOURCES = [
  { id: 'radio', label: 'Radio', icon: 'radio', enabled: true },
  { id: 'bluetooth', label: 'Bluetooth', icon: 'bluetooth', enabled: false },
  { id: 'spotify', label: 'Spotify', icon: 'spotify', enabled: false },
  { id: 'youtube', label: 'YouTube', icon: 'youtube', enabled: false }
];

// Source icons component
const SourceIcon = ({ type, size = 24 }) => {
  switch (type) {
    case 'radio':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6H8.3l8.26-3.34L15.88 1 3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM8 18.98c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm6-9H4V8h10v1.98z" fill="currentColor"/>
        </svg>
      );
    case 'bluetooth':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z" fill="currentColor"/>
        </svg>
      );
    case 'spotify':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 14.36c-.18.29-.55.38-.84.2-2.31-1.41-5.21-1.73-8.64-.95-.33.08-.65-.13-.73-.46-.08-.33.13-.65.46-.73 3.75-.85 6.97-.48 9.56 1.1.29.18.38.55.19.84zm1.22-2.71c-.23.36-.72.48-1.08.25-2.64-1.63-6.68-2.1-9.81-1.15-.41.13-.84-.1-.97-.51-.13-.41.1-.84.51-.97 3.58-1.08 8.03-.56 11.1 1.31.36.22.47.71.25 1.07zm.11-2.81c-3.17-1.88-8.39-2.06-11.41-1.14-.49.15-1-.13-1.15-.61-.14-.49.13-1 .61-1.15 3.47-1.06 9.24-.85 12.89 1.32.44.26.59.84.33 1.28-.26.44-.84.59-1.27.3z" fill="currentColor"/>
        </svg>
      );
    case 'youtube':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3C6.48 3 2 7.48 2 12s4.48 9 10 9 10-4.48 10-9-4.48-9-10-9zm-1 13V8l6 4-6 4z" fill="currentColor"/>
        </svg>
      );
    default:
      return null;
  }
};

// Chevron icon for dropdown
const ChevronIcon = ({ isOpen }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
  >
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill="currentColor"/>
  </svg>
);

// Category options for filtering stations
const CATEGORIES = [
  { id: 'favorites', label: 'Favorites', icon: '❤️' },
  { id: 'popular', label: 'Popular' },
  { id: 'us', label: 'US' },
  { id: 'rock', label: 'Rock' },
  { id: 'jazz', label: 'Jazz' },
  { id: 'news', label: 'News' }
];

// Fallback image for stations without a logo
// Uses NeutralGray colors from the design system with music note icon
const FALLBACK_LOGO = 'data:image/svg+xml,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
    <rect width="80" height="80" rx="8" fill="#4c4c4c" fill-opacity="0.5"/>
    <g transform="translate(8, 8)">
      <path d="M49.5925 6.99158C50.8156 6.76683 51.9451 7.7011 51.9539 8.9447L52.2224 47.1C52.2306 47.2396 52.2361 47.3802 52.2361 47.5219C52.2361 51.4368 49.0622 54.6107 45.1472 54.6107C41.2325 54.6105 38.0593 51.4366 38.0593 47.5219C38.0594 43.6071 41.2325 40.4332 45.1472 40.433C45.7647 40.433 46.3642 40.5122 46.9353 40.6605V19.7963L23.4343 23.9095V50.7123C23.4344 50.7246 23.4353 50.7371 23.4353 50.7494C23.4353 50.7614 23.4344 50.7735 23.4343 50.7855V51.8236L23.3533 51.8246C22.8351 55.2291 19.8957 57.8381 16.3464 57.8383C12.4315 57.8383 9.25764 54.6643 9.25757 50.7494C9.25757 46.8345 12.4315 43.6605 16.3464 43.6605C16.9515 43.6605 17.5387 43.7366 18.0994 43.8793V14.4506C18.0996 13.4857 18.7891 12.6583 19.738 12.4838L49.5925 6.99158Z" fill="#7d7d7d"/>
    </g>
  </svg>
`);

const RadioView = () => {
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState('radio');
  const [nowPlaying, setNowPlaying] = useState({ artist: null, title: null });
  const [shouldAnimateNowPlaying, setShouldAnimateNowPlaying] = useState(false);
  
  const {
    currentStation,
    isPlaying,
    isLoading,
    stations,
    category,
    volume,
    favorites,
    fetchStations,
    playStation,
    togglePlayback,
    nextStation,
    prevStation,
    toggleFavorite,
    setRadioVolume,
    isFavorite
  } = useRadio();

  const currentSource = MEDIA_SOURCES.find(s => s.id === selectedSource);

  // Fetch stations on mount if not already loaded
  useEffect(() => {
    if (stations.length === 0) {
      fetchStations(category);
    }
  }, []);

  // Fetch now-playing info every 30 seconds
  useEffect(() => {
    // Reset animation state when station changes
    setShouldAnimateNowPlaying(false);
    
    // Enable animation after 500ms delay
    const animationTimer = setTimeout(() => {
      setShouldAnimateNowPlaying(true);
    }, 500);

    const fetchNowPlaying = async () => {
      if (!currentStation?.url_resolved && !currentStation?.url) {
        setNowPlaying({ artist: null, title: null });
        return;
      }

      const streamUrl = currentStation.url_resolved || currentStation.url;
      
      try {
        const response = await fetch(
          `http://localhost:3001/api/now-playing?url=${encodeURIComponent(streamUrl)}`
        );
        const data = await response.json();
        
        if (data.success && (data.artist || data.title)) {
          setNowPlaying({
            artist: data.artist,
            title: data.title
          });
        } else {
          setNowPlaying({ artist: null, title: null });
        }
      } catch (error) {
        console.error('Error fetching now-playing info:', error);
        setNowPlaying({ artist: null, title: null });
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 30000);
    return () => {
      clearInterval(interval);
      clearTimeout(animationTimer);
    };
  }, [currentStation]);

  const handleSourceSelect = (sourceId) => {
    const source = MEDIA_SOURCES.find(s => s.id === sourceId);
    if (source?.enabled) {
      setSelectedSource(sourceId);
    }
    setIsSourceDropdownOpen(false);
  };

  const handleCategoryChange = (newCategory) => {
    if (newCategory === 'favorites') {
      // For favorites, we don't fetch - just switch the category view
      // The favorites are already in state
      fetchStations(newCategory); // This will update the category in state
    } else {
      fetchStations(newCategory);
    }
  };

  // Get the list of stations to display based on category
  const displayStations = category === 'favorites' ? favorites : stations;

  const handleStationClick = (station) => {
    playStation(station);
  };

  const handleVolumeChange = (e) => {
    setRadioVolume(parseInt(e.target.value));
  };

  const formatBitrate = (bitrate) => {
    if (!bitrate || bitrate === 0) return '';
    return `${bitrate} kbps`;
  };

  const getStationTags = (station) => {
    if (!station?.tags) return '';
    const tags = station.tags
      .split(',')
      .slice(0, 2)
      .map(tag => tag.trim().charAt(0).toUpperCase() + tag.trim().slice(1).toLowerCase())
      .join(' • ');
    return tags || station.country || '';
  };

  return (
    <div className="radio-view">
      {/* Left Panel - Playback Controls */}
      <div className="radio-left-panel">
        {/* Source Selector */}
        <div className="radio-source-wrapper">
          <Button
            variant="secondary"
            size="large"
            className="radio-source-selector"
            icon={<SourceIcon type={currentSource?.icon} size={24} />}
            onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)}
          >
            {currentSource?.label}
            <ChevronIcon isOpen={isSourceDropdownOpen} />
          </Button>

          {isSourceDropdownOpen && (
            <div className="radio-source-dropdown">
              {MEDIA_SOURCES.map((source) => (
                <button
                  key={source.id}
                  className={`radio-source-option ${source.id === selectedSource ? 'is-selected' : ''} ${!source.enabled ? 'is-disabled' : ''}`}
                  onClick={() => handleSourceSelect(source.id)}
                  disabled={!source.enabled}
                >
                  <SourceIcon type={source.icon} size={20} />
                  <span className="radio-source-option-label">{source.label}</span>
                  {!source.enabled && (
                    <span className="radio-source-coming-soon">Coming Soon</span>
                  )}
                  {source.id === selectedSource && source.enabled && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="radio-source-check">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Click overlay to close dropdown */}
        {isSourceDropdownOpen && (
          <div 
            className="radio-source-overlay"
            onClick={() => setIsSourceDropdownOpen(false)}
          />
        )}

        {/* Now Playing Section */}
        <Card 
          variant="default" 
          className="radio-now-playing"
          style={currentStation?.favicon ? {
            '--station-bg-image': `url(${currentStation.favicon})`
          } : undefined}
        >
          {currentStation?.favicon && (
            <div className={`radio-now-playing-bg ${isPlaying ? 'is-playing' : 'is-paused'}`} />
          )}
          <div className="radio-now-playing-content">
            <div className="radio-station-info">
              <Typography variant="headline-medium" className="radio-station-name">
                {currentStation?.name || 'Select a Station'}
              </Typography>
              <Typography 
                variant="body-medium" 
                className={`radio-station-meta ${shouldAnimateNowPlaying && nowPlaying.artist && nowPlaying.title ? 'radio-station-meta--animate' : ''}`}
                truncate
                key={nowPlaying.artist && nowPlaying.title ? `${nowPlaying.artist}-${nowPlaying.title}` : 'default'}
              >
                {nowPlaying.artist && nowPlaying.title 
                  ? `${nowPlaying.artist} - ${nowPlaying.title}`
                  : (currentStation ? getStationTags(currentStation) : 'Browse stations to the right')}
              </Typography>
              <div className="radio-status">
                {isLoading ? (
                  <span className="radio-status-loading">
                    <span className="radio-loading-dot"></span>
                    <span className="radio-loading-dot"></span>
                    <span className="radio-loading-dot"></span>
                    Buffering...
                  </span>
                ) : isPlaying ? (
                  <span className="radio-status-live">
                    <span className="radio-live-dot"></span>
                    LIVE
                  </span>
                ) : currentStation ? (
                  <Typography variant="label-small" className="radio-status-paused">
                    Paused
                  </Typography>
                ) : null}
              </div>
            </div>
            {currentStation && (
              <IconButton
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {isFavorite(currentStation) ? (
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
                    ) : (
                      <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" fill="currentColor"/>
                    )}
                  </svg>
                }
                label={isFavorite(currentStation) ? 'Remove from favorites' : 'Add to favorites'}
                className={`radio-favorite-btn ${isFavorite(currentStation) ? 'is-favorite' : ''}`}
                onClick={() => toggleFavorite(currentStation)}
              />
            )}
          </div>
        </Card>

        {/* Playback Controls */}
        <div className="radio-controls">
          <IconButton
            icon={
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M34.9062 9.83402L34.9062 30.0571C34.9062 31.5767 34.0333 32.288 32.9825 32.288C32.5299 32.288 32.0449 32.1586 31.5761 31.8838L14.6023 21.9905C13.6647 21.4571 13.1798 21.0206 12.9858 20.471L12.9858 30.041C12.9858 31.4635 12.2583 32.2071 10.8358 32.2071L7.16617 32.2071C5.7436 32.2071 4.99999 31.5282 4.99999 30.041L4.99999 9.85019C4.99999 8.42762 5.7436 7.68401 7.16617 7.68401L10.8357 7.68401C12.2583 7.68401 12.9858 8.42762 12.9858 9.85019L12.9858 19.404C13.1798 18.8706 13.6647 18.4341 14.6023 17.8845L31.5761 7.99115C32.0449 7.7325 32.5299 7.58701 32.9825 7.58701C34.0333 7.58701 34.9062 8.31446 34.9062 9.83402Z" fill="currentColor"/>
              </svg>
            }
            label="Previous station"
            size="large"
            className="radio-control-btn"
            onClick={prevStation}
            disabled={!currentStation || stations.length === 0}
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
            size="large"
            className="radio-control-btn radio-control-play"
            onClick={togglePlayback}
            disabled={!currentStation}
          />
          
          <IconButton
            icon={
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 30.041V9.81788C5 8.29832 5.87294 7.58704 6.9237 7.58704C7.37634 7.58704 7.8613 7.71636 8.3301 7.99117L25.3039 17.8845C26.2415 18.418 26.7265 18.8544 26.9205 19.404V9.83405C26.9205 8.41148 27.6479 7.66786 29.0705 7.66786H32.7401C34.1626 7.66786 34.9063 8.34682 34.9063 9.83405V30.0248C34.9063 31.4474 34.1626 32.191 32.7401 32.191H29.0705C27.6479 32.191 26.9205 31.4474 26.9205 30.0248V20.471C26.7265 21.0044 26.2415 21.4409 25.3039 21.9905L8.3301 31.8839C7.8613 32.1425 7.37634 32.288 6.9237 32.288C5.87294 32.288 5 31.5605 5 30.041Z" fill="currentColor"/>
              </svg>
            }
            label="Next station"
            size="large"
            className="radio-control-btn"
            onClick={nextStation}
            disabled={!currentStation || stations.length === 0}
          />
        </div>

        {/* Volume Control */}
        <div className="radio-volume">
          <Slider
            label="Volume"
            value={volume}
            onChange={handleVolumeChange}
            min={0}
            max={100}
            formatValue={(val) => `${val}%`}
          />
        </div>
      </div>

      {/* Right Panel - Station Selection */}
      <div className="radio-right-panel">
        {/* Category Tabs */}
        <div className="radio-categories">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? 'primary' : 'secondary'}
              size="large"
              onClick={() => handleCategoryChange(cat.id)}
              className={`radio-category-btn ${cat.id === 'favorites' ? 'radio-category-favorites' : ''}`}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Station List */}
        <div className="radio-station-list">
          <Typography variant="label-large" className="radio-list-header">
            {category === 'favorites' 
              ? `${displayStations.length} Favorite${displayStations.length !== 1 ? 's' : ''}`
              : `${displayStations.length} Stations`
            }
          </Typography>
          
          {isLoading && displayStations.length === 0 ? (
            <div className="radio-loading">
              <div className="radio-loading-spinner"></div>
              <Typography variant="body-medium">Loading stations...</Typography>
            </div>
          ) : displayStations.length === 0 ? (
            <div className="radio-empty">
              <Typography variant="body-medium">
                {category === 'favorites' 
                  ? 'No favorites yet. Tap the ❤️ on a station to add it!'
                  : 'No stations found'
                }
              </Typography>
            </div>
          ) : (
            <div className="radio-stations">
              {displayStations.map((station) => (
                <Card
                  key={station.stationuuid}
                  variant="default"
                  className={`radio-station-item ${currentStation?.stationuuid === station.stationuuid ? 'is-playing' : ''}`}
                  compact
                >
                  <div className="radio-station-item-content">
                    <button 
                      className="radio-station-item-clickable"
                      onClick={() => handleStationClick(station)}
                      type="button"
                      aria-label={`Play ${station.name}`}
                    >
                      <div className="radio-station-item-logo">
                        <img
                          src={station.favicon || FALLBACK_LOGO}
                          alt={station.name}
                          onError={(e) => { e.target.src = FALLBACK_LOGO; }}
                        />
                        {currentStation?.stationuuid === station.stationuuid && isPlaying && (
                          <div className="radio-playing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        )}
                      </div>
                      <div className="radio-station-item-info">
                        <Typography variant="body-medium" className="radio-station-item-name" truncate>
                          {station.name}
                        </Typography>
                        <Typography variant="label-small" className="radio-station-item-meta">
                          {getStationTags(station)}
                          {station.bitrate > 0 && ` • ${formatBitrate(station.bitrate)}`}
                        </Typography>
                      </div>
                    </button>
                    <IconButton
                      icon={
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {isFavorite(station) ? (
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
                          ) : (
                            <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" fill="currentColor"/>
                          )}
                        </svg>
                      }
                      label={isFavorite(station) ? 'Remove from favorites' : 'Add to favorites'}
                      className={`radio-station-favorite ${isFavorite(station) ? 'is-favorite' : ''}`}
                      onClick={() => toggleFavorite(station)}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RadioView;

