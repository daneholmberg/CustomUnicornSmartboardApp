import React, { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    if (throws.length > 0) {
      setLastThrow(throws[throws.length - 1]);
    }
  }, [throws]);

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
  return useContext(SmartboardContext);
} 