import { useRef, useEffect } from 'react';

export function useAutoScroll(scrollViewRef, currentPlayerIndex, playerCount) {
  const lastPlayerIndex = useRef(currentPlayerIndex);
  
  useEffect(() => {
    if (!scrollViewRef.current || playerCount <= 5) return;
    
    // Only scroll if the player index actually changed
    if (currentPlayerIndex !== lastPlayerIndex.current) {
      const cardHeight = 35; // Updated to match new compact card height
      const padding = 4; // Vertical padding between cards
      const scrollPosition = (currentPlayerIndex * (cardHeight + padding));
      
      scrollViewRef.current.scrollTo({
        y: scrollPosition,
        animated: true
      });
      
      lastPlayerIndex.current = currentPlayerIndex;
    }
  }, [currentPlayerIndex, playerCount]);
} 