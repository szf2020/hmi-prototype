import { useState, useEffect, useRef } from 'react';
import './BottomNav.css';
import { useHMI } from '../../contexts/HMIContext';

function BottomNav({ activeView, setActiveView }) {
  const { state, dispatchAction } = useHMI();
  const [localDriverTemp, setLocalDriverTemp] = useState(state.driverTemp || 70);
  const [localPassengerTemp, setLocalPassengerTemp] = useState(state.passengerTemp || 70);
  const isUpdatingDriver = useRef(false);
  const isUpdatingPassenger = useRef(false);

  // Sync local state when backend state changes (from other displays)
  useEffect(() => {
    if (state.driverTemp !== undefined && !isUpdatingDriver.current) {
      setLocalDriverTemp(state.driverTemp);
    }
    isUpdatingDriver.current = false;
  }, [state.driverTemp]);

  useEffect(() => {
    if (state.passengerTemp !== undefined && !isUpdatingPassenger.current) {
      setLocalPassengerTemp(state.passengerTemp);
    }
    isUpdatingPassenger.current = false;
  }, [state.passengerTemp]);

  const handleTempChange = (zone, direction) => {
    const currentTemp = zone === 'driver' ? localDriverTemp : localPassengerTemp;
    const newTemp = direction === 'up' 
      ? Math.min(currentTemp + 1, 85) 
      : Math.max(currentTemp - 1, 60);
    
    // Mark that we're updating this temperature
    if (zone === 'driver') {
      isUpdatingDriver.current = true;
      setLocalDriverTemp(newTemp);
    } else {
      isUpdatingPassenger.current = true;
      setLocalPassengerTemp(newTemp);
    }
    
    // Dispatch to backend for sync across displays
    dispatchAction({
      type: zone === 'driver' ? 'SET_DRIVER_TEMP' : 'SET_PASSENGER_TEMP',
      payload: newTemp
    });
  };

  const homeButton = {
    id: 'home',
    label: 'Home',
    svg: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M56.305 27.9271L33.305 8.12309C32.5549 7.4772 31.4451 7.4772 30.695 8.12309L7.69501 27.9271C7.25376 28.3071 7 28.8604 7 29.4427V54.9994C7 56.104 7.89543 56.9994 9 56.9994H25.4546C26.5592 56.9994 27.4546 56.104 27.4546 54.9994V43.779C27.4546 42.6744 28.3501 41.779 29.4546 41.779H34.5454C35.6499 41.779 36.5454 42.6744 36.5454 43.779V54.9994C36.5454 56.104 37.4408 56.9994 38.5454 56.9994H55C56.1046 56.9994 57 56.104 57 54.9994V29.4427C57 28.8604 56.7462 28.3071 56.305 27.9271Z" fill="url(#paint0_linear_home)"/>
        <defs>
          <linearGradient id="paint0_linear_home" x1="1.95781" y1="5.79991" x2="61.7231" y2="63.4564" gradientUnits="userSpaceOnUse">
            <stop stopColor="white"/>
            <stop offset="1" stopColor="#9A9A9A"/>
          </linearGradient>
        </defs>
      </svg>
    )
  };

  const otherButtons = [
    {
      id: 'navigation',
      label: 'Navigation',
      svg: (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.867 33.4048L49.8912 6.36066C51.2801 5.39816 53.1627 6.48511 53.0236 8.16915L49.1149 55.4872C48.9434 57.5624 46.1102 58.0268 45.2853 56.1148L36.4524 35.6427C36.1024 34.8314 35.2616 34.346 34.3841 34.4485L12.2382 37.0351C10.17 37.2767 9.1555 34.5908 10.867 33.4048Z" fill="url(#paint0_linear_nav)"/>
          <defs>
            <linearGradient id="paint0_linear_nav" x1="5.6606" y1="4.0881" x2="66.3012" y2="52.5092" gradientUnits="userSpaceOnUse">
              <stop stopColor="#969696"/>
              <stop offset="1" stopColor="#595959"/>
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'camera',
      label: 'Camera',
      svg: (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M32 14.4004C41.7201 14.4004 49.6004 22.28 49.6006 32C49.6006 41.7202 41.7202 49.6006 32 49.6006C22.28 49.6004 14.4004 41.7201 14.4004 32C14.4006 22.2801 22.2801 14.4006 32 14.4004ZM22.5527 29C21.172 29 20.0527 30.1193 20.0527 31.5C20.0527 32.8807 21.172 34 22.5527 34C23.9334 34 25.0527 32.8807 25.0527 31.5C25.0527 30.1193 23.9334 29 22.5527 29ZM29.5527 20C27.0675 20 25.0527 22.0147 25.0527 24.5C25.0527 26.9853 27.0675 29 29.5527 29C32.038 29 34.0527 26.9853 34.0527 24.5C34.0527 22.0147 32.038 20 29.5527 20Z" fill="url(#paint0_linear_camera)"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M31.999 7.19922C45.6956 7.19922 56.7987 18.3025 56.7988 31.999C56.7988 45.6957 45.6957 56.7988 31.999 56.7988C18.3025 56.7987 7.19922 45.6956 7.19922 31.999C7.19932 18.3025 18.3025 7.19932 31.999 7.19922ZM32 10.4004C20.071 10.4006 10.4006 20.071 10.4004 32C10.4004 43.9292 20.0708 53.6004 32 53.6006C43.9294 53.6006 53.6006 43.9294 53.6006 32C53.6004 20.0708 43.9292 10.4004 32 10.4004Z" fill="url(#paint1_linear_camera)"/>
          <defs>
            <linearGradient id="paint0_linear_camera" x1="2.1974" y1="5.35156" x2="62.2192" y2="62.5152" gradientUnits="userSpaceOnUse">
              <stop stopColor="#969696"/>
              <stop offset="1" stopColor="#595959"/>
            </linearGradient>
            <linearGradient id="paint1_linear_camera" x1="2.1974" y1="5.35156" x2="62.2192" y2="62.5152" gradientUnits="userSpaceOnUse">
              <stop stopColor="#969696"/>
              <stop offset="1" stopColor="#595959"/>
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'media',
      label: 'Media',
      svg: (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M49.5925 6.99158C50.8156 6.76683 51.9451 7.7011 51.9539 8.9447L52.2224 47.1C52.2306 47.2396 52.2361 47.3802 52.2361 47.5219C52.2361 51.4368 49.0622 54.6107 45.1472 54.6107C41.2325 54.6105 38.0593 51.4366 38.0593 47.5219C38.0594 43.6071 41.2325 40.4332 45.1472 40.433C45.7647 40.433 46.3642 40.5122 46.9353 40.6605V19.7963L23.4343 23.9095V50.7123C23.4344 50.7246 23.4353 50.7371 23.4353 50.7494C23.4353 50.7614 23.4344 50.7735 23.4343 50.7855V51.8236L23.3533 51.8246C22.8351 55.2291 19.8957 57.8381 16.3464 57.8383C12.4315 57.8383 9.25764 54.6643 9.25757 50.7494C9.25757 46.8345 12.4315 43.6605 16.3464 43.6605C16.9515 43.6605 17.5387 43.7366 18.0994 43.8793V14.4506C18.0996 13.4857 18.7891 12.6583 19.738 12.4838L49.5925 6.99158Z" fill="url(#paint0_linear_media)"/>
          <defs>
            <linearGradient id="paint0_linear_media" x1="4.92345" y1="5.06304" x2="65.1366" y2="53.504" gradientUnits="userSpaceOnUse">
              <stop stopColor="#969696"/>
              <stop offset="1" stopColor="#595959"/>
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      svg: (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M29.5926 58.6673H34.4048C35.777 58.6673 36.7314 57.872 37.0497 56.5005L38.3621 50.9545C39.2768 50.6365 40.1915 50.2787 41.0068 49.9009L45.8589 52.9025C47.0125 53.6381 48.2852 53.5189 49.2196 52.5646L52.6003 49.2052C53.5547 48.2511 53.694 46.9589 52.9183 45.7861L49.9356 40.9757C50.3133 40.1208 50.6713 39.2463 50.9497 38.3717L56.5376 37.0596C57.9097 36.7416 58.6654 35.7873 58.6654 34.4158V29.6649C58.6654 28.3133 57.9097 27.379 56.5376 27.0411L50.9896 25.7092C50.6713 24.755 50.2936 23.8804 49.9753 23.1051L52.9583 18.2151C53.694 17.0423 53.6143 15.8297 52.64 14.8556L49.2196 11.4764C48.2453 10.5818 47.0719 10.3831 45.9186 11.1186L41.0068 14.1599C40.2115 13.7623 39.3167 13.4244 38.3621 13.1064L37.0497 7.5007C36.7314 6.12911 35.777 5.33398 34.4048 5.33398H29.5926C28.2204 5.33398 27.2659 6.12911 26.9477 7.5007L25.6353 13.0666C24.7205 13.3847 23.8058 13.7226 22.9706 14.14L18.0787 11.1186C16.9254 10.3831 15.7124 10.5421 14.7777 11.4764L11.3574 14.8556C10.383 15.8297 10.3035 17.0423 11.0392 18.2151L14.0221 23.1051C13.7039 23.8804 13.3261 24.755 13.0079 25.7092L7.45979 27.0411C6.10757 27.379 5.33203 28.3133 5.33203 29.6649V34.4158C5.33203 35.7873 6.10757 36.7416 7.45979 37.0596L13.0477 38.3717C13.3261 39.2463 13.684 40.1208 14.0618 40.9757L11.079 45.7861C10.3035 46.9589 10.4427 48.2511 11.3972 49.2052L14.7777 52.5646C15.7124 53.5189 16.985 53.6381 18.1384 52.9025L22.9905 49.9009C23.8257 50.2787 24.7205 50.6365 25.6353 50.9545L26.9477 56.5005C27.2659 57.872 28.2204 58.6673 29.5926 58.6673ZM31.9987 41.1147C26.9676 41.1147 22.8712 37.0199 22.8712 31.9907C22.8712 26.9615 26.9676 22.8666 31.9987 22.8666C37.0298 22.8666 41.1262 26.9615 41.1262 31.9907C41.1262 37.0199 37.0298 41.1147 31.9987 41.1147Z" fill="url(#paint0_linear_settings)"/>
          <defs>
            <linearGradient id="paint0_linear_settings" x1="-0.0463101" y1="3.34724" x2="64.4938" y2="64.814" gradientUnits="userSpaceOnUse">
              <stop stopColor="#969696"/>
              <stop offset="1" stopColor="#595959"/>
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'apps',
      label: 'Apps',
      svg: (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.707 35.5625C15.4046 35.3916 20.1597 35.3916 24.8535 35.5625C26.7538 35.6357 28.3632 37.2454 28.4365 39.1416C28.6074 43.8392 28.6074 48.5943 28.4365 53.2881C28.3633 55.1945 26.7537 56.7979 24.8574 56.8711H24.8516C22.5078 56.9606 20.1435 57.002 17.7793 57.002C15.4193 57.002 13.0548 56.9606 10.7109 56.8711C8.80458 56.7978 7.20117 55.1923 7.12793 53.292C6.95704 48.5945 6.95703 43.8392 7.12793 39.1455C7.20132 37.2453 8.80683 35.6357 10.707 35.5625ZM39.1416 35.5625C43.8391 35.3916 48.5944 35.3916 53.2881 35.5625C55.1944 35.6357 56.7978 37.2454 56.8711 39.1416C57.042 43.8392 57.042 48.5943 56.8711 53.2881C56.7979 55.1945 55.1923 56.7979 53.292 56.8711H53.2861C50.9425 56.9606 48.5778 57.002 46.2178 57.002C43.8538 57.0019 41.4892 56.9606 39.1455 56.8711C37.2454 56.7976 35.6367 55.1921 35.5635 53.292C35.3926 48.5945 35.3926 43.8392 35.5635 39.1455C35.6369 37.2454 37.2456 35.6359 39.1416 35.5625ZM10.707 7.12891C15.4047 6.958 20.1597 6.958 24.8535 7.12891C26.7537 7.20213 28.363 8.80693 28.4365 10.707C28.6074 15.4047 28.6074 20.1607 28.4365 24.8545C28.3631 26.7546 26.7535 28.3633 24.8574 28.4365H24.8516C22.5078 28.526 20.1435 28.5674 17.7793 28.5674C15.4193 28.5674 13.0548 28.526 10.7109 28.4365C8.80468 28.3632 7.20131 26.7545 7.12793 24.8584C6.95703 20.1609 6.95704 15.4056 7.12793 10.7119C7.20116 8.80551 8.81079 7.20215 10.707 7.12891ZM39.1416 7.12891C43.8391 6.95801 48.5944 6.95802 53.2881 7.12891C55.1882 7.20213 56.7976 8.80693 56.8711 10.707C57.042 15.4047 57.042 20.1607 56.8711 24.8545C56.7976 26.7545 55.1929 28.3631 53.293 28.4365H53.2861C50.9426 28.526 48.5786 28.5674 46.2188 28.5674C43.8547 28.5674 41.4902 28.526 39.1465 28.4365C37.2463 28.3633 35.6369 26.7545 35.5635 24.8584C35.3926 20.1609 35.3926 15.4056 35.5635 10.7119C35.6367 8.80562 37.2455 7.20232 39.1416 7.12891Z" fill="url(#paint0_linear_apps)"/>
          <defs>
            <linearGradient id="paint0_linear_apps" x1="1.95785" y1="5.13738" x2="62.4656" y2="62.7618" gradientUnits="userSpaceOnUse">
              <stop stopColor="#969696"/>
              <stop offset="1" stopColor="#595959"/>
            </linearGradient>
          </defs>
        </svg>
      )
    }
  ];

  return (
    <div className="bottom-nav">
      {/* Left: Home Button and Driver Temp */}
      <div className="nav-left">
        <button
          className={`nav-button home-button ${activeView === homeButton.id ? 'active' : ''}`}
          onClick={() => setActiveView(homeButton.id)}
          title={homeButton.label}
        >
          {homeButton.svg}
        </button>
        
        {/* Driver Temperature Control */}
        <div className="temp-control">
          <button 
            className="temp-button"
            onClick={() => handleTempChange('driver', 'down')}
            aria-label="Decrease driver temperature"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 12C7 12.2525 7.10332 12.4821 7.28699 12.6772L14.3814 19.7246C14.5536 19.9082 14.7946 20 15.0587 20C15.5982 20 16 19.5983 16 19.0589C16 18.7949 15.8967 18.5653 15.7245 18.3817L9.31888 12L15.7245 5.61836C15.8967 5.43472 16 5.19369 16 4.94118C16 4.40172 15.5982 4 15.0587 4C14.7946 4 14.5536 4.09182 14.3814 4.27547L7.28699 11.3228C7.10332 11.518 7 11.7475 7 12Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </button>
          <div className="temp-display">{localDriverTemp}°</div>
          <button 
            className="temp-button"
            onClick={() => handleTempChange('driver', 'up')}
            aria-label="Increase driver temperature"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(180deg)' }}>
              <path d="M7 12C7 12.2525 7.10332 12.4821 7.28699 12.6772L14.3814 19.7246C14.5536 19.9082 14.7946 20 15.0587 20C15.5982 20 16 19.5983 16 19.0589C16 18.7949 15.8967 18.5653 15.7245 18.3817L9.31888 12L15.7245 5.61836C15.8967 5.43472 16 5.19369 16 4.94118C16 4.40172 15.5982 4 15.0587 4C14.7946 4 14.5536 4.09182 14.3814 4.27547L7.28699 11.3228C7.10332 11.518 7 11.7475 7 12Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Right: Other Navigation Buttons and Passenger Temp */}
      <div className="nav-right">
        {/* Passenger Temperature Control */}
        <div className="temp-control">
          <button 
            className="temp-button"
            onClick={() => handleTempChange('passenger', 'down')}
            aria-label="Decrease passenger temperature"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 12C7 12.2525 7.10332 12.4821 7.28699 12.6772L14.3814 19.7246C14.5536 19.9082 14.7946 20 15.0587 20C15.5982 20 16 19.5983 16 19.0589C16 18.7949 15.8967 18.5653 15.7245 18.3817L9.31888 12L15.7245 5.61836C15.8967 5.43472 16 5.19369 16 4.94118C16 4.40172 15.5982 4 15.0587 4C14.7946 4 14.5536 4.09182 14.3814 4.27547L7.28699 11.3228C7.10332 11.518 7 11.7475 7 12Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </button>
          <div className="temp-display">{localPassengerTemp}°</div>
          <button 
            className="temp-button"
            onClick={() => handleTempChange('passenger', 'up')}
            aria-label="Increase passenger temperature"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(180deg)' }}>
              <path d="M7 12C7 12.2525 7.10332 12.4821 7.28699 12.6772L14.3814 19.7246C14.5536 19.9082 14.7946 20 15.0587 20C15.5982 20 16 19.5983 16 19.0589C16 18.7949 15.8967 18.5653 15.7245 18.3817L9.31888 12L15.7245 5.61836C15.8967 5.43472 16 5.19369 16 4.94118C16 4.40172 15.5982 4 15.0587 4C14.7946 4 14.5536 4.09182 14.3814 4.27547L7.28699 11.3228C7.10332 11.518 7 11.7475 7 12Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </button>
        </div>
        
        <div className="nav-buttons-group">
          {otherButtons.map((button) => (
            <button
              key={button.id}
              className={`nav-button ${activeView === button.id ? 'active' : ''}`}
              onClick={() => setActiveView(button.id)}
              title={button.label}
            >
              {button.svg}
            </button>
          ))}
        </div>
        
        {/* AI Button */}
        <button 
          className="ai-button"
          onClick={() => console.log('AI button clicked')}
          aria-label="AI Assistant"
          title="AI Assistant"
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M26 16C26.4295 16 26.7481 16.3052 26.8037 16.7354C28.0235 26.8275 29.3266 28.161 39.2373 29.2021C39.6946 29.2438 39.9999 29.5766 40 30.0068C40 30.4371 39.6946 30.7562 39.2373 30.7979C29.3266 31.8391 28.0235 33.1725 26.8037 43.2646C26.7481 43.7087 26.4296 44 26 44C25.5704 44 25.2657 43.7087 25.1963 43.2646C23.8933 33.1863 22.6456 32.0751 12.7627 30.7979C12.3053 30.7562 12 30.4371 12 30.0068C12.0001 29.5766 12.3053 29.2438 12.7627 29.2021C22.6733 28.161 23.9765 26.8276 25.1963 16.7354C25.2657 16.3052 25.5705 16 26 16ZM15 10C15.2891 10 15.5063 10.2027 15.5498 10.5068C16.2295 15.5647 16.3595 15.6667 21.5078 16.4492C21.7826 16.4927 22 16.6957 22 17C22 17.3043 21.7826 17.4929 21.5078 17.5508C16.3597 18.5362 16.2439 18.493 15.5498 23.5068C15.5064 23.7967 15.2893 24 15 24C14.7108 24 14.4936 23.7972 14.4502 23.4785C13.7994 18.4785 13.6405 18.4059 8.5498 17.5508C8.21716 17.4929 8 17.3189 8 17C8.00001 16.6957 8.2174 16.5072 8.49219 16.4492C13.6116 15.4638 13.7994 15.5214 14.4502 10.5215C14.4937 10.2028 14.7108 10 15 10ZM22 4C22.2058 4.00001 22.3091 4.11568 22.3477 4.30859C22.7978 6.94523 22.7589 7.1636 25.6914 7.65234C25.8844 7.67807 26 7.80707 26 8C26 8.1929 25.8843 8.30824 25.6914 8.33398C22.7589 8.82273 22.7978 9.04205 22.3477 11.6787C22.309 11.8715 22.2058 12 22 12C21.7943 12 21.691 11.8715 21.6523 11.6787C21.2022 9.04205 21.2411 8.82273 18.3086 8.33398C18.1157 8.30821 18 8.19287 18 8C18 7.80708 18.1157 7.67808 18.3086 7.65234C21.2411 7.16359 21.2022 6.94525 21.6523 4.30859C21.6909 4.11567 21.7943 4 22 4Z" fill="url(#paint0_linear_1308_5114)"/>
            <defs>
              <linearGradient id="paint0_linear_1308_5114" x1="4.773" y1="2.50994" x2="51.4974" y2="38.1095" gradientUnits="userSpaceOnUse">
                <stop stopColor="white"/>
                <stop offset="1" stopColor="#9A9A9A"/>
              </linearGradient>
            </defs>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default BottomNav;
