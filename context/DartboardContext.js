import React, { createContext, useContext, useState, useEffect } from 'react';
import { GAME_CONSTANTS } from '../constants';

const DartboardContext = createContext();

export function DartboardProvider({ children }) {
  const [highlightedSection, setHighlightedSection] = useState(null);
  
  useEffect(() => {
    if (highlightedSection) {
      const timer = setTimeout(() => {
        setHighlightedSection(null);
      }, GAME_CONSTANTS.HIGHLIGHT_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [highlightedSection]);

  return (
    <DartboardContext.Provider value={{ 
      highlightedSection, 
      setHighlightedSection 
    }}>
      {children}
    </DartboardContext.Provider>
  );
}

export function useDartboardContext() {
  return useContext(DartboardContext);
}

export { DartboardContext }; 