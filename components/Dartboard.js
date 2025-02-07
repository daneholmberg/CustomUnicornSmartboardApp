import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Text } from 'react-native-svg';
import { useDartboardHighlight } from '../hooks/useDartboardHighlight';

const NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

const calculateBoardSize = (containerWidth, containerHeight) => {
  // Leave some padding around the board
  const maxWidth = containerWidth * 0.95;
  const maxHeight = containerHeight * 0.95;
  // Use the smaller dimension to ensure the board fits
  return Math.min(maxWidth, maxHeight);
};

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

function getSegmentFill(number, multiplier, highlightedSection, expectedTarget, targetNumbers, defaultColor) {
  // Debug logging
  if (highlightedSection && highlightedSection.score === number && highlightedSection.multiplier === multiplier) {
    // console.log('Hit detected:', {
    //   number,
    //   multiplier,
    //   highlightedScore: highlightedSection.score,
    //   targetNumbers,
    //   isTarget: highlightedSection.score === targetNumbers?.[0]
    // });
  }

  // First check if this was just hit
  if (highlightedSection && highlightedSection.score === number && highlightedSection.multiplier === multiplier) {
    if (targetNumbers?.length) {
      // In games with targets (like Around the World)
      const wasCorrectHit = highlightedSection.score === expectedTarget;
      // console.log('Checking hit:', { wasCorrectHit, score: highlightedSection.score, target: expectedTarget });
      
      if (wasCorrectHit) {
        return '#ffff00'; // Yellow highlight for hitting the correct target
      }
      return '#cccccc'; // Grey highlight for hitting wrong number
    }
    return '#ffff00'; // Yellow highlight for games without specific targets (like X01)
  }

  // Then check if this is a target number
  if (targetNumbers?.includes(number)) {
    // For triple ring, blend the target highlight with the red
    if (multiplier === 3) {
      return '#ffb8b8'; // Blend of target color and triple red
    }
    // For double ring, blend the target highlight with the green
    if (multiplier === 2) {
      return '#88ff88'; // Blend of target color and double green
    }
    return '#b8f7b8'; // Default target highlight for singles
  }
  
  return defaultColor;
}

export default function Dartboard({ onThrow, lastHit, targetNumbers }) {
  const [boardSize, setBoardSize] = useState(300); // Default size
  const containerRef = useRef(null);
  const highlightedSection = useDartboardHighlight(lastHit);
  // Instead of relying on usePrevious (which fails if the parent mutates targetNumbers in place),
  // capture the expected target at the moment of the hit in local state.
  const [savedExpectedTarget, setSavedExpectedTarget] = React.useState(targetNumbers?.[0]);
  React.useEffect(() => {
    if (lastHit) {
      setSavedExpectedTarget(targetNumbers?.[0]);
    }
  }, [lastHit, targetNumbers]);
  const expectedTarget = savedExpectedTarget;
  
  const handleLayout = () => {
    if (containerRef.current) {
      containerRef.current.measure((x, y, width, height) => {
        const newSize = calculateBoardSize(width, height);
        setBoardSize(newSize);
      });
    }
  };

  // Update constants based on dynamic board size
  const CENTER = boardSize / 2;
  const DOUBLE_RING_WIDTH = boardSize * 0.05;
  const TRIPLE_RING_WIDTH = boardSize * 0.05;
  const OUTER_RADIUS = boardSize / 2;
  const DOUBLE_RADIUS = OUTER_RADIUS - DOUBLE_RING_WIDTH;
  const TRIPLE_RADIUS = OUTER_RADIUS * 0.6;
  const BULL_OUTER_RADIUS = OUTER_RADIUS * 0.16;
  const BULL_INNER_RADIUS = OUTER_RADIUS * 0.08;
  const SEGMENT_ANGLE = 360 / NUMBERS.length;
  const ROTATION_OFFSET = -9;

  const createSegmentPath = (startAngle, endAngle, innerRadius, outerRadius) => {
    const startRadians = (startAngle + ROTATION_OFFSET - 90) * Math.PI / 180;
    const endRadians = (endAngle + ROTATION_OFFSET - 90) * Math.PI / 180;
    
    const startOuterX = CENTER + outerRadius * Math.cos(startRadians);
    const startOuterY = CENTER + outerRadius * Math.sin(startRadians);
    const endOuterX = CENTER + outerRadius * Math.cos(endRadians);
    const endOuterY = CENTER + outerRadius * Math.sin(endRadians);
    const startInnerX = CENTER + innerRadius * Math.cos(startRadians);
    const startInnerY = CENTER + innerRadius * Math.sin(startRadians);
    const endInnerX = CENTER + innerRadius * Math.cos(endRadians);
    const endInnerY = CENTER + innerRadius * Math.sin(endRadians);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return `M ${startOuterX} ${startOuterY}
            A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}
            L ${endInnerX} ${endInnerY}
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInnerX} ${startInnerY}
            Z`;
  };

  const renderSegments = () => {
    return NUMBERS.map((number, i) => {
      const startAngle = i * SEGMENT_ANGLE;
      const endAngle = (i + 1) * SEGMENT_ANGLE;
      const isEven = i % 2 === 0;

      return (
        <React.Fragment key={number}>
          {/* Main segment */}
          <Path
            d={createSegmentPath(startAngle, endAngle, BULL_OUTER_RADIUS, DOUBLE_RADIUS)}
            fill={getSegmentFill(number, 1, highlightedSection, expectedTarget, targetNumbers, isEven ? 'white' : 'black')}
            onPress={() => onThrow({ score: number, multiplier: 1 })}
          />
          
          {/* Double ring */}
          <Path
            d={createSegmentPath(startAngle, endAngle, DOUBLE_RADIUS, OUTER_RADIUS)}
            fill={getSegmentFill(number, 2, highlightedSection, expectedTarget, targetNumbers, "#44ff44")}
            onPress={() => onThrow({ score: number, multiplier: 2 })}
          />
          
          {/* Triple ring */}
          <Path
            d={createSegmentPath(startAngle, endAngle, TRIPLE_RADIUS, TRIPLE_RADIUS + TRIPLE_RING_WIDTH)}
            fill={getSegmentFill(number, 3, highlightedSection, expectedTarget, targetNumbers, "#ff4444")}
            onPress={() => onThrow({ score: number, multiplier: 3 })}
          />
        </React.Fragment>
      );
    });
  };

  const renderNumbers = () => {
    return NUMBERS.map((number, i) => {
      const midAngle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
      const isEven = i % 2 === 0;

      // Determine text color based on background.
      // Only force black text if a single is hit; otherwise, use default color.
      let textColor;
      if (highlightedSection && highlightedSection.score === number && highlightedSection.multiplier === 1) {
        textColor = 'black'; // Black text on yellow highlight for a single hit.
      } else {
        textColor = isEven ? 'black' : 'white'; // Default coloring: black for white sections, white for black sections.
      }

      return (
        <Text
          key={`number-${number}`}
          x={CENTER + (OUTER_RADIUS * 0.85) * Math.cos((midAngle + ROTATION_OFFSET - 90) * Math.PI / 180)}
          y={CENTER + (OUTER_RADIUS * 0.85) * Math.sin((midAngle + ROTATION_OFFSET - 90) * Math.PI / 180)}
          fill={textColor}
          fontSize={boardSize * 0.04}
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {number}
        </Text>
      );
    });
  };

  return (
    <View 
      ref={containerRef} 
      onLayout={handleLayout}
      style={styles.container}
    >
      <Svg width={boardSize} height={boardSize}>
        {/* Background circle */}
        <Circle cx={CENTER} cy={CENTER} r={OUTER_RADIUS} fill="#235c3e" />
        
        {/* Render all segments */}
        {renderSegments()}
        
        {/* Outer bullseye */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={BULL_OUTER_RADIUS}
          fill={
            targetNumbers?.includes(25) ? '#b8f7b8' :
            (highlightedSection?.score === 25 && highlightedSection?.multiplier === 1) ? 
              (highlightedSection?.score === expectedTarget ? '#ffff00' : '#cccccc') :
            "#44ff44"
          }
          onPress={() => onThrow({ score: 25, multiplier: 1 })}
        />
        
        {/* Inner bullseye */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={BULL_INNER_RADIUS}
          fill={
            targetNumbers?.includes(25) ? '#b8f7b8' :
            (highlightedSection?.score === 25 && highlightedSection?.multiplier === 2) ?
              (highlightedSection?.score === expectedTarget ? '#ffff00' : '#cccccc') :
            "#ff4444"
          }
          onPress={() => onThrow({ score: 25, multiplier: 2 })}
        />

        {/* Render all numbers on top */}
        {renderNumbers()}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    minHeight: 0, // Important for flex behavior
  },
}); 