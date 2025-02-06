export function HighlightedSegment({ segment, highlightedSection, defaultColor, children }) {
  const isHighlighted = highlightedSection?.score === segment.score && 
                       highlightedSection?.multiplier === segment.multiplier;
  
  return React.cloneElement(children, {
    fill: isHighlighted ? '#ffff00' : defaultColor
  });
} 