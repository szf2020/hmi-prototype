import { useState, useRef, useEffect } from 'react';
import { Typography, Button, Card, IconButton } from '../../design-system';
import './MapSearchOverlay.css';

// Helper function to get maneuver icon based on type and modifier
const getManeuverIcon = (type, modifier) => {
  // Map of maneuver types to SVG icons
  const iconMap = {
    'turn-left': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 6L3 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 12H15C18.3137 12 21 14.6863 21 18V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'turn-right': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 6L21 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12H9C5.68629 12 3 14.6863 3 18V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'slight-left': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 3L3 7L7 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 7H8C13.5228 7 18 11.4772 18 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'slight-right': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 3L21 7L17 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 7H16C10.4772 7 6 11.4772 6 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'straight': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 10L12 3L19 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'depart': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="4" fill="currentColor"/>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    'arrive': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
      </svg>
    ),
    'merge': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 3V12C8 15.3137 10.6863 18 14 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 3V12C16 15.3137 13.3137 18 10 18H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'roundabout': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 2V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 17V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M9 4L12 2L15 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'fork': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 14L6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 14L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M3 3L6 6L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 3L18 6L21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'ramp': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 3L21 7L17 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 21V14C3 10.134 6.13401 7 10 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'default': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 10L12 3L19 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  };

  // Determine which icon to use based on type and modifier
  if (type === 'depart') return iconMap['depart'];
  if (type === 'arrive') return iconMap['arrive'];
  if (type === 'merge') return iconMap['merge'];
  if (type === 'roundabout' || type === 'rotary') return iconMap['roundabout'];
  if (type === 'fork') return iconMap['fork'];
  if (type === 'off ramp' || type === 'on ramp') return iconMap['ramp'];
  
  if (type === 'turn' || type === 'new name' || type === 'continue') {
    if (modifier === 'left' || modifier === 'sharp left') return iconMap['turn-left'];
    if (modifier === 'right' || modifier === 'sharp right') return iconMap['turn-right'];
    if (modifier === 'slight left') return iconMap['slight-left'];
    if (modifier === 'slight right') return iconMap['slight-right'];
    if (modifier === 'straight') return iconMap['straight'];
  }
  
  return iconMap['default'];
};

// Helper function to format distance (imperial units)
const formatDistance = (meters) => {
  const feet = meters * 3.28084;
  const miles = meters / 1609.34;
  
  // Use feet for distances under 0.1 miles (528 ft)
  if (miles < 0.1) {
    return `${Math.round(feet)} ft`;
  }
  // Use miles with one decimal for distances under 10 miles
  if (miles < 10) {
    return `${miles.toFixed(1)} mi`;
  }
  // Round miles for larger distances
  return `${Math.round(miles)} mi`;
};

// Helper function to format duration
const formatDuration = (seconds) => {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
};

// Helper function to get maneuver description
const getManeuverDescription = (type, modifier, name) => {
  const streetName = name && name !== 'unnamed road' ? ` onto ${name}` : '';
  
  if (type === 'depart') return `Start${streetName}`;
  if (type === 'arrive') return 'Arrive at destination';
  if (type === 'merge') return `Merge${streetName}`;
  if (type === 'roundabout' || type === 'rotary') return `Take roundabout${streetName}`;
  if (type === 'fork') return `Take fork${streetName}`;
  if (type === 'off ramp') return `Take exit${streetName}`;
  if (type === 'on ramp') return `Take ramp${streetName}`;
  
  if (modifier === 'left' || modifier === 'sharp left') return `Turn left${streetName}`;
  if (modifier === 'right' || modifier === 'sharp right') return `Turn right${streetName}`;
  if (modifier === 'slight left') return `Bear left${streetName}`;
  if (modifier === 'slight right') return `Bear right${streetName}`;
  if (modifier === 'straight') return `Continue straight${streetName}`;
  if (modifier === 'uturn') return `Make a U-turn${streetName}`;
  
  if (type === 'new name' || type === 'continue') return `Continue${streetName}`;
  
  return `Continue${streetName}`;
};

// Category colors for result icons
const CATEGORY_COLORS = {
  'Food': '#f79009',
  'Coffee': '#c19b5f',
  'Charging': '#12b76a',
  'Shopping': '#c26eb4',
  'Parking': '#4a7fb8',
  'Car Wash': '#7e5fc2',
  'default': '#335FFF'
};

function MapSearchOverlay({ 
  isOpen, 
  onClose, 
  onSearch, 
  onSelectDestination,
  searchResults = [],
  isSearching = false,
  activeCategory = null,
  onPanelSideChange, 
  activeRoute, 
  navigationInstructions, 
  routeSummary, 
  onClearRoute, 
  isLoadingRoute 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [panelSide, setPanelSide] = useState('left'); // 'left' or 'right'
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  
  const dragStartX = useRef(0);
  const dragStartTime = useRef(0);
  const panelRef = useRef(null);

  // Notify parent of initial panel side on mount
  useEffect(() => {
    if (onPanelSideChange) {
      onPanelSideChange(panelSide);
    }
  }, []); // Empty dependency array - only run on mount
  
  const shortcuts = [
    { 
      id: 'home', 
      label: 'Home',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 8.25464L22.6666 14.2546V24.668H20V16.668H12V24.668H9.33329V14.2546L16 8.25464ZM16 4.66797L2.66663 16.668H6.66663V27.3346H14.6666V19.3346H17.3333V27.3346H25.3333V16.668H29.3333L16 4.66797Z" fill="#F0F4F8"/>
        </svg>
      )
    },
    { 
      id: 'work', 
      label: 'Work',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.6666 8.66536V5.9987H13.3333V8.66536H18.6666ZM5.33329 11.332V25.9987H26.6666V11.332H5.33329ZM26.6666 8.66536C28.1466 8.66536 29.3333 9.85203 29.3333 11.332V25.9987C29.3333 27.4787 28.1466 28.6654 26.6666 28.6654H5.33329C3.85329 28.6654 2.66663 27.4787 2.66663 25.9987L2.67996 11.332C2.67996 9.85203 3.85329 8.66536 5.33329 8.66536H10.6666V5.9987C10.6666 4.5187 11.8533 3.33203 13.3333 3.33203H18.6666C20.1466 3.33203 21.3333 4.5187 21.3333 5.9987V8.66536H26.6666Z" fill="#F0F4F8"/>
        </svg>
      )
    }
  ];
  
  const nearbyCategories = [
    { 
      id: 'food', 
      label: 'Food',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.45589 22C9.18034 22 9.62881 21.5946 9.62019 20.8875L9.4477 11.2022C9.4477 10.9004 9.57707 10.6762 9.84442 10.5554C10.9828 10.0552 11.4744 9.52913 11.4141 8.01983L11.1726 2.72445C11.1553 2.34498 10.9311 2.12937 10.5775 2.12937C10.2411 2.12937 10.0342 2.3536 10.0342 2.7417L10.0945 7.89047C10.0945 8.19232 9.90479 8.38206 9.62019 8.38206C9.32696 8.38206 9.11997 8.20094 9.11997 7.91634L9.03373 2.58646C9.02511 2.21561 8.8095 2 8.45589 2C8.10229 2 7.89531 2.21561 7.88668 2.58646L7.80044 7.91634C7.80044 8.20094 7.59345 8.38206 7.30023 8.38206C7.01562 8.38206 6.81726 8.19232 6.81726 7.89047L6.87763 2.7417C6.87763 2.3536 6.67927 2.12937 6.33429 2.12937C5.98069 2.12937 5.75646 2.34498 5.73921 2.72445L5.50635 8.01983C5.43735 9.52913 5.92894 10.0552 7.06736 10.5554C7.33472 10.6762 7.46409 10.9004 7.46409 11.2022L7.30023 20.8875C7.2916 21.5946 7.73144 22 8.45589 22ZM15.2002 14.4795L15.0191 20.8443C14.9932 21.5946 15.4502 22 16.1661 22C16.8992 22 17.3477 21.6292 17.3477 20.9392V2.64683C17.3477 2.20699 17.0458 2 16.7353 2C16.4076 2 16.192 2.17249 15.916 2.57783C14.5274 4.52695 13.6133 8.17507 13.6133 11.6248V12.0474C13.6133 12.6425 13.8289 13.0824 14.2601 13.367L14.769 13.712C15.0794 13.9275 15.2174 14.1691 15.2002 14.4795Z" fill="white"/>
        </svg>
      ),
      color: '#f79009'
    },
    { 
      id: 'coffee', 
      label: 'Coffee',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.22222 20C6.06111 20 5.06713 19.5524 4.24028 18.6571C3.41343 17.7619 3 16.6857 3 15.4286V5C3 4.44772 3.44772 4 4 4H19.8889C20.4694 4 20.9664 4.22381 21.3799 4.67143C21.7933 5.11905 22 5.65714 22 6.28571V9.71429C22 10.3429 21.7933 10.881 21.3799 11.3286C20.9664 11.7762 20.4694 12 19.8889 12H18.1778C17.9569 12 17.7778 12.1791 17.7778 12.4V15.4286C17.7778 16.6857 17.3644 17.7619 16.5375 18.6571C15.7106 19.5524 14.7167 20 13.5556 20H7.22222ZM17.7778 9.31429C17.7778 9.5352 17.9569 9.71429 18.1778 9.71429H19.4889C19.7098 9.71429 19.8889 9.5352 19.8889 9.31429V6.68571C19.8889 6.4648 19.7098 6.28571 19.4889 6.28571H18.1778C17.9569 6.28571 17.7778 6.4648 17.7778 6.68571V9.31429Z" fill="white"/>
        </svg>
      ),
      color: '#c19b5f'
    },
    { 
      id: 'charging', 
      label: 'Charging',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.5 12.9995C5.5 13.3902 5.81267 13.6806 6.21468 13.6806H11.1393L8.54855 20.7157C8.18004 21.7319 9.22972 22.279 9.89973 21.4527L17.884 11.4807C18.0404 11.2686 18.1297 11.0787 18.1297 10.8554C18.1297 10.4645 17.8282 10.1742 17.415 10.1742H12.4904L15.0812 3.1391C15.4608 2.12292 14.4 1.57575 13.73 2.40209L5.74567 12.3741C5.58933 12.5863 5.5 12.7761 5.5 12.9995Z" fill="white"/>
        </svg>
      ),
      color: '#12b76a'
    },
    { 
      id: 'shopping', 
      label: 'Shopping',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 22C4.45 22 3.97917 21.8135 3.5875 21.4405C3.19583 21.0675 3 20.6191 3 20.0952V8.66667C3 8.14286 3.19583 7.69445 3.5875 7.32143C3.97917 6.94841 4.45 6.76191 5 6.76191H7C7 5.44445 7.4875 4.32143 8.4625 3.39286C9.4375 2.46429 10.6167 2 12 2C13.3833 2 14.5625 2.46429 15.5375 3.39286C16.5125 4.32143 17 5.44445 17 6.76191H19C19.55 6.76191 20.0208 6.94841 20.4125 7.32143C20.8042 7.69445 21 8.14286 21 8.66667V20.0952C21 20.6191 20.8042 21.0675 20.4125 21.4405C20.0208 21.8135 19.55 22 19 22H5ZM12 14.381C13.3833 14.381 14.5625 13.9167 15.5375 12.9881C16.5125 12.0595 17 10.9365 17 9.61905H15C15 10.4127 14.7083 11.0873 14.125 11.6429C13.5417 12.1984 12.8333 12.4762 12 12.4762C11.1667 12.4762 10.4583 12.1984 9.875 11.6429C9.29167 11.0873 9 10.4127 9 9.61905H7C7 10.9365 7.4875 12.0595 8.4625 12.9881C9.4375 13.9167 10.6167 14.381 12 14.381ZM9 6.76191H15C15 5.96825 14.7083 5.29365 14.125 4.7381C13.5417 4.18254 12.8333 3.90476 12 3.90476C11.1667 3.90476 10.4583 4.18254 9.875 4.7381C9.29167 5.29365 9 5.96825 9 6.76191Z" fill="white"/>
        </svg>
      ),
      color: '#c26eb4'
    },
    { 
      id: 'parking', 
      label: 'Parking',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 6.03096V17.9788C21 19.993 19.9832 21 17.9299 21H6.07008C4.02662 21 3 19.993 3 17.9788V6.03096C3 4.01684 4.02662 3 6.07008 3H17.9299C19.9832 3 21 4.01684 21 6.03096ZM9.84411 7.30201C9.31614 7.30201 9.04238 7.67355 9.04238 8.22108V15.7008C9.04238 16.2385 9.32591 16.6198 9.84411 16.6198C10.3819 16.6198 10.6654 16.258 10.6654 15.7008V13.5008H12.6404C14.6252 13.5008 15.9354 12.2689 15.9354 10.4112C15.9354 8.55351 14.6057 7.30201 12.6502 7.30201H9.84411ZM14.3319 10.4112C14.3319 11.5551 13.6083 12.2689 12.4253 12.2689H10.6654V8.54373H12.4253C13.5986 8.54373 14.3319 9.25747 14.3319 10.4112Z" fill="white"/>
        </svg>
      ),
      color: '#4a7fb8'
    },
    { 
      id: 'carwash', 
      label: 'Car Wash',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 6C11.6154 6 11.2885 5.8434 11.0192 5.5302C10.75 5.217 10.6154 4.83669 10.6154 4.38926C10.6154 4.06711 10.6769 3.78076 10.8 3.5302C10.9231 3.27964 11.2077 2.84116 11.6538 2.21477C11.7462 2.07159 11.8615 2 12 2C12.1385 2 12.2538 2.07159 12.3462 2.21477C12.7923 2.84116 13.0769 3.27964 13.2 3.5302C13.3231 3.78076 13.3846 4.06711 13.3846 4.38926C13.3846 4.83669 13.25 5.217 12.9808 5.5302C12.7115 5.8434 12.3846 6 12 6ZM7.38462 6C7 6 6.67308 5.8434 6.40385 5.5302C6.13462 5.217 6 4.83669 6 4.38926C6 4.06711 6.06154 3.78076 6.18462 3.5302C6.30769 3.27964 6.59231 2.84116 7.03846 2.21477C7.13077 2.07159 7.24615 2 7.38462 2C7.52308 2 7.63846 2.07159 7.73077 2.21477C8.17692 2.84116 8.46154 3.27964 8.58462 3.5302C8.70769 3.78076 8.76923 4.06711 8.76923 4.38926C8.76923 4.83669 8.63461 5.217 8.36538 5.5302C8.09615 5.8434 7.76923 6 7.38462 6ZM16.6154 6C16.2308 6 15.9038 5.8434 15.6346 5.5302C15.3654 5.217 15.2308 4.83669 15.2308 4.38926C15.2308 4.06711 15.2923 3.78076 15.4154 3.5302C15.5385 3.27964 15.8231 2.84116 16.2692 2.21477C16.3615 2.07159 16.4769 2 16.6154 2C16.7538 2 16.8692 2.07159 16.9615 2.21477C17.4077 2.84116 17.6923 3.27964 17.8154 3.5302C17.9385 3.78076 18 4.06711 18 4.38926C18 4.83669 17.8654 5.217 17.5962 5.5302C17.3269 5.8434 17 6 16.6154 6Z" fill="white"/>
          <path d="M5.813 11.5848C5.98659 10.7679 6.38482 9.58339 6.65031 9.1239C6.85453 8.7563 7.05875 8.62356 7.44677 8.5725C8.03901 8.49082 9.38687 8.42954 11.9805 8.42954C14.5741 8.42954 15.9219 8.47039 16.5142 8.5725C16.892 8.63377 17.086 8.7563 17.3107 9.1239C17.5864 9.57318 17.9437 10.7679 18.148 11.5848C18.2296 11.9013 18.0867 12.0034 17.7701 11.983C16.4631 11.9013 14.86 11.8094 11.9805 11.8094C9.10096 11.8094 7.48761 11.9013 6.19081 11.983C5.87427 12.0034 5.74152 11.9013 5.813 11.5848ZM6.21124 17.6195C5.4454 17.6195 4.86337 17.0374 4.86337 16.2716C4.86337 15.5058 5.4454 14.9238 6.21124 14.9238C6.97706 14.9238 7.55909 15.5058 7.55909 16.2716C7.55909 17.0374 6.97706 17.6195 6.21124 17.6195ZM17.7498 17.6195C16.9839 17.6195 16.4019 17.0374 16.4019 16.2716C16.4019 15.5058 16.9839 14.9238 17.7498 14.9238C18.5156 14.9238 19.0975 15.5058 19.0975 16.2716C19.0975 17.0374 18.5156 17.6195 17.7498 17.6195ZM11.9805 19.7638C14.7069 19.7638 18.2807 19.6311 19.8021 19.4575C20.9254 19.3349 21.5482 18.7019 21.5482 17.6502V16.241C21.5482 14.9136 21.293 14.1375 20.5169 13.1368L19.8532 12.2689C19.5571 10.8291 19.0261 9.31791 18.7504 8.72567C18.3215 7.8271 17.4843 7.25528 16.3814 7.11232C15.8403 7.04084 14.1146 7 11.9805 7C9.84637 7 8.11049 7.05106 7.57951 7.11232C6.47672 7.24507 5.63941 7.8271 5.21055 8.72567C4.93485 9.31791 4.40388 10.8291 4.10775 12.2689L3.44403 13.1368C2.668 14.1375 2.41272 14.9136 2.41272 16.241V17.6502C2.41272 18.7019 3.03559 19.3349 4.15881 19.4575C5.68026 19.6311 9.25412 19.7638 11.9805 19.7638ZM3.48488 22H4.44472C5.05739 22 5.52709 21.5405 5.52709 20.9381V18.9163L2.41272 17.4357V20.9381C2.41272 21.5405 2.88243 22 3.48488 22ZM19.5162 22H20.4659C21.0785 22 21.5482 21.5405 21.5482 20.9381V17.4357L18.4338 18.9163V20.9381C18.4338 21.5405 18.9036 22 19.5162 22Z" fill="white"/>
        </svg>
      ),
      color: '#7e5fc2'
    }
  ];
  
  const recentSearches = [
    {
      id: 1,
      name: '10 Butchers Korean BBQ',
      address: '595 E El Camino Real, Sunnyvale, CA 94087'
    },
    {
      id: 2,
      name: 'Hyatt Place San Jose/Downtown',
      address: '282 S Almaden Blvd, San Jose, CA 95113'
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery, false); // false = not a category search
      // Keep overlay open
    }
  };

  const handleCategoryClick = (category) => {
    onSearch(category.label, true); // true = category search
    // Keep overlay open
  };

  const handleRecentClick = (place) => {
    onSearch(place.address, false);
    // Keep overlay open
  };

  const handleShortcutClick = (shortcut) => {
    onSearch(shortcut.label, false); // Shortcuts go directly to predefined destinations
    // Keep overlay open
  };

  // Handle clicking on a search result
  const handleResultClick = (result) => {
    if (onSelectDestination) {
      onSelectDestination(result);
    }
  };

  // Handle back button to clear results and return to default navigation view
  const handleBackToSearch = () => {
    if (onClearRoute) {
      onClearRoute(); // Clears search results, POI markers, and returns to default view
    }
  };

  // Drag handlers
  const handleDragStart = (clientX) => {
    setIsDragging(true);
    dragStartX.current = clientX;
    dragStartTime.current = Date.now();
    setDragOffset(0);
  };

  const handleDragMove = (clientX) => {
    if (!isDragging) return;
    
    const offset = clientX - dragStartX.current;
    setDragOffset(offset);
  };

  const handleDragEnd = (clientX) => {
    if (!isDragging) return;
    
    const endOffset = clientX - dragStartX.current;
    const dragDuration = Date.now() - dragStartTime.current;
    const velocity = endOffset / dragDuration; // pixels per millisecond
    
    // Determine if we should snap to the other side
    // Snap if dragged more than 30% of screen width OR fast swipe (velocity > 0.5)
    const threshold = window.innerWidth * 0.3;
    const shouldSnapToOtherSide = Math.abs(endOffset) > threshold || Math.abs(velocity) > 0.5;
    
    if (shouldSnapToOtherSide) {
      // Snap to opposite side
      if (panelSide === 'left' && endOffset > 0) {
        setPanelSide('right');
        if (onPanelSideChange) {
          onPanelSideChange('right');
        }
      } else if (panelSide === 'right' && endOffset < 0) {
        setPanelSide('left');
        if (onPanelSideChange) {
          onPanelSideChange('left');
        }
      }
    }
    
    // Reset drag state
    setIsDragging(false);
    setDragOffset(0);
  };

  // Mouse events
  const handleMouseDown = (e) => {
    // Only start drag from the drag handle area (top part of panel)
    if (e.target.closest('.drag-handle')) {
      handleDragStart(e.clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      handleDragMove(e.clientX);
    }
  };

  const handleMouseUp = (e) => {
    if (isDragging) {
      handleDragEnd(e.clientX);
    }
  };

  // Touch events
  const handleTouchStart = (e) => {
    if (e.target.closest('.drag-handle')) {
      handleDragStart(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      handleDragMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e) => {
    if (isDragging) {
      handleDragEnd(e.changedTouches[0].clientX);
    }
  };

  if (!isOpen) return null;

  // Calculate transform for drag effect and position
  const getTransform = () => {
    // Calculate the target X position based on panel side
    // Right side = window width - panel width - margin * 2
    const rightPosition = window.innerWidth - 420 - 16; // width + margins
    const targetX = panelSide === 'right' ? rightPosition : 0;
    
    if (isDragging) {
      // During drag, add offset to current target position
      return `translateX(${targetX + dragOffset}px)`;
    }
    
    // When not dragging, smoothly transition to target position
    return `translateX(${targetX}px)`;
  };

  // Destination pin icon
  const DestinationIcon = (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
    </svg>
  );

  // Render navigation view when route is active
  const renderNavigationView = () => (
    <div className="search-overlay-content navigation-view">
      {/* Route Summary - Using Design System Card */}
      {routeSummary && (
        <Card variant="elevated" className="route-summary-card">
          <div className="route-destination">
            <div className="destination-icon">
              {DestinationIcon}
            </div>
            <Typography variant="headline-small" as="div" className="destination-name">
              {routeSummary.destinationName}
            </Typography>
          </div>
          <div className="route-stats">
            <div className="route-stat">
              <Typography variant="headline-small" as="div" className="stat-value">
                {formatDuration(routeSummary.duration)}
              </Typography>
              <Typography variant="body-tiny" as="div" className="stat-label">
                ETA
              </Typography>
            </div>
            <div className="route-stat-divider"></div>
            <div className="route-stat">
              <Typography variant="headline-small" as="div" className="stat-value">
                {formatDistance(routeSummary.distance)}
              </Typography>
              <Typography variant="body-tiny" as="div" className="stat-label">
                Distance
              </Typography>
            </div>
          </div>
        </Card>
      )}

      {/* Turn-by-Turn Instructions */}
      <div className="section directions-section">
        <div className="directions-list">
          {isLoadingRoute ? (
            <Card variant="default" className="loading-card">
              <div className="loading-directions">
                <div className="loading-spinner"></div>
                <Typography variant="body-small" as="div" className="loading-text">Loading directions...</Typography>
              </div>
            </Card>
          ) : navigationInstructions && navigationInstructions.length > 0 ? (
            navigationInstructions.map((instruction, index) => (
              <div 
                key={instruction.id} 
                className={`direction-item ${index === 0 ? 'direction-item--active' : ''}`}
              >
                <div className="direction-item-content">
                  <div className="direction-icon">
                    {getManeuverIcon(instruction.type, instruction.modifier)}
                  </div>
                  <div className="direction-content">
                    <Typography variant="body-small" as="div" className="direction-instruction">
                      {getManeuverDescription(instruction.type, instruction.modifier, instruction.name)}
                    </Typography>
                    <Typography variant="body-tiny" as="div" className="direction-distance">
                      {formatDistance(instruction.distance)}
                    </Typography>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <Card variant="default" className="no-directions-card">
              <Typography variant="body-small" as="div" className="no-directions-text">No directions available</Typography>
            </Card>
          )}
        </div>
      </div>

      {/* Navigation Action Buttons - At the bottom */}
      <div className="navigation-buttons">
        <Button 
          variant="primary" 
          size="small" 
          className="start-route-button"
        >
          Start
        </Button>
        <Button 
          variant="secondary" 
          size="small" 
          onClick={onClearRoute}
          className="end-route-button"
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  // Render search results view
  const renderSearchResultsView = () => {
    const categoryColor = CATEGORY_COLORS[activeCategory] || CATEGORY_COLORS.default;
    
    return (
      <div className="search-overlay-content">
        {/* Results Header */}
        <div className="results-header">
          <Button 
            variant="secondary" 
            size="small" 
            onClick={handleBackToSearch}
            aria-label="Go back"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
          <Typography variant="headline-small" as="h2" className="results-title">
            {activeCategory || 'Search Results'}
          </Typography>
          <Typography variant="body-tiny" as="span" className="results-count">
            {searchResults.length} results
          </Typography>
        </div>

        {/* Loading state */}
        {isSearching && (
          <div className="search-loading">
            <div className="loading-spinner"></div>
            <Typography variant="body-small" as="span">Searching nearby...</Typography>
          </div>
        )}

        {/* Results list */}
        {!isSearching && searchResults.length > 0 && (
          <div className="search-results-list">
            {searchResults.map((result, index) => (
              <button
                key={result.id}
                className="search-result-item"
                onClick={() => handleResultClick(result)}
              >
                <div 
                  className="result-number" 
                  style={{ backgroundColor: categoryColor }}
                >
                  <Typography variant="label-small" as="span">{index + 1}</Typography>
                </div>
                <div className="result-content">
                  <Typography variant="body-small" as="div" className="result-name">
                    {result.name}
                  </Typography>
                  <Typography variant="body-tiny" as="div" className="result-address">
                    {result.address}
                  </Typography>
                  {result.type && (
                    <Typography variant="body-tiny" as="div" className="result-type">
                      {result.type.replace(/_/g, ' ')}
                    </Typography>
                  )}
                </div>
                <div className="result-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results */}
        {!isSearching && searchResults.length === 0 && (
          <div className="no-results">
            <Typography variant="body-small" as="div">No results found nearby</Typography>
            <Typography variant="body-tiny" as="div" className="no-results-hint">
              Try a different category or search term
            </Typography>
          </div>
        )}
      </div>
    );
  };

  // Render search view (default)
  const renderSearchView = () => (
    <div className="search-overlay-content">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-container">
          <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search maps"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="button" className="close-button" onClick={() => setSearchQuery('')}>
            ✕
          </button>
        </div>
      </form>

      {/* Shortcuts: Home & Work */}
      <div className="shortcuts-container">
        {shortcuts.map((shortcut) => (
          <button
            key={shortcut.id}
            className="shortcut-button"
            onClick={() => handleShortcutClick(shortcut)}
          >
            <span className="shortcut-icon-svg">{shortcut.icon}</span>
            <Typography variant="label-small" as="span" className="shortcut-label">{shortcut.label}</Typography>
          </button>
        ))}
      </div>

      {/* Search Nearby */}
      <div className="section">
        <Typography variant="body-tiny" as="h3" className="section-title">SEARCH NEARBY</Typography>
        <div className="category-grid">
          {nearbyCategories.map((category) => (
            <button
              key={category.id}
              className="category-button"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="category-icon" style={{ backgroundColor: category.color }}>
                {category.icon}
              </div>
              <Typography variant="body-small" as="span" className="category-label">
                {category.label}
              </Typography>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Searches */}
      <div className="section">
        <Typography variant="body-tiny" as="h3" className="section-title">RECENT</Typography>
        <div className="recent-list">
          {recentSearches.map((place) => (
            <button
              key={place.id}
              className="recent-item"
              onClick={() => handleRecentClick(place)}
            >
              <div className="recent-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="recent-content">
                <Typography variant="body-small" as="div" className="recent-name">
                  {place.name}
                </Typography>
                <Typography variant="body-tiny" as="div" className="recent-address">
                  {place.address}
                </Typography>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div 
      ref={panelRef}
      className={`map-search-overlay ${isDragging ? 'dragging' : ''}`}
      style={{ transform: getTransform() }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Drag Handle */}
      <div className="drag-handle">
        <div className="drag-handle-indicator"></div>
      </div>
      
      {/* Conditionally render navigation view, search results, or search view */}
      {activeRoute && navigationInstructions 
        ? renderNavigationView() 
        : (isSearching || searchResults.length > 0 || activeCategory)
          ? renderSearchResultsView()
          : renderSearchView()
      }
    </div>
  );
}

export default MapSearchOverlay;

