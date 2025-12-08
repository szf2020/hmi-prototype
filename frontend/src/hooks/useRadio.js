/**
 * useRadio Hook
 * 
 * A convenience hook that wraps the radio functionality from HMIContext.
 * Provides easy access to radio state and control functions.
 */

import { useHMI } from '../contexts/HMIContext';
import { useEffect } from 'react';

/**
 * Custom hook for radio functionality
 * @returns {Object} Radio state and control functions
 */
// Default radio state to prevent errors when state is not yet initialized
const DEFAULT_RADIO_STATE = {
  currentStation: null,
  isPlaying: false,
  isLoading: false,
  favorites: [],
  recentStations: [],
  category: 'popular',
  stations: [],
  volume: 50
};

export const useRadio = () => {
  const {
    state,
    fetchStations,
    playStation,
    pauseStation,
    togglePlayback,
    nextStation,
    prevStation,
    toggleFavorite,
    setRadioVolume
  } = useHMI();

  // Use default state if radio is not defined
  const radio = state?.radio || DEFAULT_RADIO_STATE;

  // Check if a station is in favorites
  const isFavorite = (station) => {
    if (!station || !radio.favorites) return false;
    return radio.favorites.some(f => f.stationuuid === station.stationuuid);
  };

  // Get current station index in the list
  const getCurrentStationIndex = () => {
    if (!radio.currentStation || !radio.stations?.length) return -1;
    return radio.stations.findIndex(s => s.stationuuid === radio.currentStation.stationuuid);
  };

  return {
    // State
    currentStation: radio.currentStation,
    isPlaying: radio.isPlaying,
    isLoading: radio.isLoading,
    favorites: radio.favorites || [],
    stations: radio.stations || [],
    category: radio.category,
    volume: radio.volume,
    
    // Computed
    isFavorite,
    getCurrentStationIndex,
    hasStations: (radio.stations?.length || 0) > 0,
    
    // Actions
    fetchStations,
    playStation,
    pauseStation,
    togglePlayback,
    nextStation,
    prevStation,
    toggleFavorite,
    setRadioVolume
  };
};

/**
 * Hook to auto-fetch stations on mount
 * @param {string} category - Initial category to fetch
 */
export const useRadioInit = (category = 'popular') => {
  const radio = useRadio();
  
  useEffect(() => {
    if (!radio.hasStations) {
      radio.fetchStations(category);
    }
  }, []);
  
  return radio;
};

export default useRadio;

