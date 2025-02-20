import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useSmartboard, { CONNECTION_STATE } from '../useSmartboard';

const SmartboardContext = createContext();

export function SmartboardProvider({ children }) {
  const { 
    connectionState,
    connected,
    connecting,
    throws,
    error,
    mockThrow,
    connect,
    disconnect,
    useMock
  } = useSmartboard();
  const [lastThrow, setLastThrow] = useState(null);

  // Debounce throw updates to prevent rapid-fire updates
  const updateLastThrow = useCallback((newThrow) => {
    if (!newThrow) return;
    
    // Validate throw data
    if (typeof newThrow.score !== 'number' || typeof newThrow.multiplier !== 'number') {
      console.error('Invalid throw data:', newThrow);
      return;
    }

    setLastThrow(newThrow);
  }, []);

  useEffect(() => {
    if (throws.length > 0) {
      const latestThrow = throws[throws.length - 1];
      updateLastThrow(latestThrow);
    }
  }, [throws, updateLastThrow]);

  return (
    <SmartboardContext.Provider value={{
      connectionState,
      connected,
      connecting,
      error,
      lastThrow,
      mockThrow,
      connect,
      disconnect,
      useMock,
    }}>
      {children}
    </SmartboardContext.Provider>
  );
}

export function useSmartboardContext() {
  const context = useContext(SmartboardContext);
  if (!context) {
    throw new Error('useSmartboardContext must be used within SmartboardProvider');
  }
  return context;
} 