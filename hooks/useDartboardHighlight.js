import { useState, useEffect } from 'react';

export function useDartboardHighlight(lastHit, duration = 5000) {
  const [highlightedSection, setHighlightedSection] = useState(null);

  useEffect(() => {
    if (lastHit) {
      setHighlightedSection(lastHit);
      const timer = setTimeout(() => {
        setHighlightedSection(null);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [lastHit, duration]);

  return highlightedSection;
} 