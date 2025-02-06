import React, { createContext, useContext, useState, useEffect } from 'react';
import useSmartboard from '../useSmartboard';

const SmartboardContext = createContext();

export function SmartboardProvider({ children }) {
  const { connected, throws, error, mockThrow } = useSmartboard();
  const [lastThrow, setLastThrow] = useState(null);

  useEffect(() => {
    if (throws.length > 0) {
      setLastThrow(throws[throws.length - 1]);
    }
  }, [throws]);

  return (
    <SmartboardContext.Provider value={{
      connected,
      error,
      lastThrow,
      mockThrow,
    }}>
      {children}
    </SmartboardContext.Provider>
  );
}

export function useSmartboardContext() {
  return useContext(SmartboardContext);
} 