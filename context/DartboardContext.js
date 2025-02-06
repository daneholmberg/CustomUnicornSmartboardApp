import React, { createContext, useState, useEffect } from 'react';

const DartboardContext = React.createContext();

export function DartboardProvider({ children, lastHit }) {
  const [highlightedSection, setHighlightedSection] = useState(null);
  
  useEffect(() => {
    if (lastHit) {
      setHighlightedSection(lastHit);
      const timer = setTimeout(() => {
        setHighlightedSection(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastHit]);

  return (
    <DartboardContext.Provider value={highlightedSection}>
      {children}
    </DartboardContext.Provider>
  );
} 