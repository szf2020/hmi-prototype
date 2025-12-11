import { useState } from 'react';
import { Button } from '../../design-system';
import './TheaterApp.css';

const streamingServices = [
  {
    id: 'netflix',
    name: 'Netflix',
    coverImage: '/images/app-cover-netflix.png',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    coverImage: '/images/app-cover-youtube.png',
  },
  {
    id: 'prime',
    name: 'Prime Video',
    coverImage: '/images/app-cover-prime.png',
  },
  {
    id: 'hulu',
    name: 'Hulu',
    coverImage: '/images/app-cover-hulu.png',
  },
  {
    id: 'appletv',
    name: 'Apple TV+',
    coverImage: '/images/app-cover-apple.png',
  },
];

const tabs = [
  { id: 'home', label: 'Home' },
  { id: 'library', label: 'Library' },
  { id: 'tv', label: 'TV' },
  { id: 'movies', label: 'Movies' },
];

function TheaterApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedService, setSelectedService] = useState(null);

  return (
    <div className="theater-app">
      {/* Featured Banner */}
      <div className="theater-banner">
        <img 
          src="/images/theater-banner.png" 
          alt="Featured content" 
          className="theater-banner-image"
        />
        <div className="theater-banner-content">
          <div className="theater-banner-provider">
            <svg height="64" viewBox="0 0 93 67" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g opacity="0.7">
                <path d="M24.5715 23.2622C25.6864 21.9107 26.2389 20.1774 26.1133 18.425C24.4046 18.5911 22.8273 19.4206 21.7157 20.7378C21.1622 21.3687 20.7379 22.1035 20.4673 22.9C20.1967 23.6965 20.0851 24.539 20.1389 25.3791C20.99 25.3959 21.8335 25.2134 22.6027 24.8461C23.3719 24.4787 24.0459 23.9365 24.5715 23.2622ZM26.0082 25.6984C23.5553 25.5555 21.4879 27.1097 20.3141 27.1097C19.1402 27.1097 17.3531 25.776 15.4259 25.8113C14.164 25.8471 12.9335 26.2158 11.8574 26.8804C10.7813 27.545 9.8973 28.4824 9.29373 29.5988C6.66567 34.1855 8.59291 41.0178 11.1509 44.7524C12.3948 46.5271 13.8841 48.6422 15.8639 48.5734C17.8437 48.5046 18.4569 47.3385 20.717 47.3385C22.9772 47.3385 23.6429 48.5734 25.6052 48.5293C27.5675 48.4852 28.9341 46.7511 30.1605 44.8247C31.0452 43.5089 31.7357 42.0709 32.2104 40.5556C31.0323 40.0305 30.0301 39.1736 29.3244 38.0881C28.6188 37.0027 28.2399 35.735 28.2333 34.4377C28.2478 33.2867 28.5489 32.1577 29.1091 31.1542C29.6692 30.1507 30.4705 29.3047 31.4395 28.6938C30.8238 27.8075 30.0136 27.0758 29.0717 26.5558C28.1297 26.0357 27.0815 25.7411 26.0082 25.6949M41.6539 22.1385V27.175H45.6486V30.5003H41.6539V42.4167C41.6539 44.1949 42.4423 45.1017 44.1944 45.1017C44.6748 45.0929 45.1544 45.0576 45.631 44.9958V48.3476C44.8492 48.4751 44.0578 48.5341 43.2658 48.524C39.131 48.524 37.5366 46.9063 37.5366 42.8507V30.5797H34.4005V27.2455H37.449V22.142L41.6539 22.1385ZM59.6123 48.3406H55.2322L47.8737 27.2455H52.2362L57.4048 44.1949H57.5099L62.6784 27.2455H66.9534L59.6123 48.3406ZM78.8497 48.3406H75.0653V39.6965H66.9359V35.8896H75.0478V27.2455H78.8322V35.8896H86.9617V39.6965H78.8497V48.3406Z" fill="white"/>
              </g>
            </svg>
          </div>
          <img 
            src="/images/severance-title.png" 
            alt="Severance" 
            className="theater-banner-title-image"
          />
          <p className="theater-banner-description">
            Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. They begin a journey to discover the truth about their jobs - and themselves
          </p>
          <Button
            variant="secondary"
            size="regular"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.13281 19.9766C4.13281 21.1367 4.80078 21.6875 5.59766 21.6875C5.94922 21.6875 6.3125 21.5703 6.67578 21.3828L20.3281 13.4023C21.3008 12.8398 21.6289 12.4531 21.6289 11.8438C21.6289 11.2227 21.3008 10.8477 20.3281 10.2852L6.67578 2.30469C6.3125 2.10547 5.94922 2 5.59766 2C4.80078 2 4.13281 2.55078 4.13281 3.71094V19.9766Z" fill="white" fillOpacity="0.9"/>
              </svg>
            }
          >
            Play Now
          </Button>
        </div>
        {/* Search Icon */}
        <button className="theater-search-btn" aria-label="Search">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </button>
        {/* Carousel Indicators */}
        <div className="theater-banner-indicators">
          <span className="indicator active" />
          <span className="indicator" />
          <span className="indicator" />
          <span className="indicator" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="theater-tabs">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'tertiary'}
            size="regular"
            className="theater-tab"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </nav>

      {/* Streaming Services */}
      <section className="theater-services">
        <h2 className="theater-services-title">Apps</h2>
        <div className="theater-services-grid">
          {streamingServices.map((service) => (
            <button
              key={service.id}
              className={`theater-service-card ${service.isPlaceholder ? 'placeholder' : ''} ${selectedService === service.id ? 'selected' : ''}`}
              onClick={() => !service.isPlaceholder && setSelectedService(service.id)}
              aria-label={service.name}
            >
              {service.coverImage ? (
                <img 
                  src={service.coverImage} 
                  alt={service.name} 
                  className="theater-service-cover"
                />
              ) : (
                <>
                  <div className="theater-service-icon">
                    {service.icon}
                  </div>
                  {service.isPlaceholder && (
                    <span className="theater-service-placeholder-text">PLACEHOLDER</span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default TheaterApp;
