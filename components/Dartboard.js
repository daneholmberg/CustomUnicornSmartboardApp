import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Text } from 'react-native-svg';
import { useDartboardHighlight } from '../hooks/useDartboardHighlight';

const NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const BOARDSIZE = Math.min(Dimensions.get('window').width - 40, 400);
const CENTER = BOARDSIZE / 2;
const DOUBLE_RING_WIDTH = BOARDSIZE * 0.05;
const TRIPLE_RING_WIDTH = BOARDSIZE * 0.05;
const OUTER_RADIUS = BOARDSIZE / 2;
const DOUBLE_RADIUS = OUTER_RADIUS - DOUBLE_RING_WIDTH;
const TRIPLE_RADIUS = OUTER_RADIUS * 0.6;
const BULL_OUTER_RADIUS = OUTER_RADIUS * 0.16;
const BULL_INNER_RADIUS = OUTER_RADIUS * 0.08;
const SEGMENT_ANGLE = 360 / NUMBERS.length;
const ROTATION_OFFSET = -9;

function getSegmentFill(number, multiplier, highlightedSection, defaultColor) {
  if (!highlightedSection) return defaultColor;
  if (highlightedSection.score === number && highlightedSection.multiplier === multiplier) {
    return '#ffff00'; // highlight color
  }
  return defaultColor;
}

export default function Dartboard({ onThrow, lastHit }) {
  const highlightedSection = useDartboardHighlight(lastHit);

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
            fill={getSegmentFill(number, 1, highlightedSection, isEven ? 'white' : 'black')}
            onPress={() => onThrow({ score: number, multiplier: 1 })}
          />
          
          {/* Double ring */}
          <Path
            d={createSegmentPath(startAngle, endAngle, DOUBLE_RADIUS, OUTER_RADIUS)}
            fill={getSegmentFill(number, 2, highlightedSection, "#44ff44")}
            onPress={() => onThrow({ score: number, multiplier: 2 })}
          />
          
          {/* Triple ring */}
          <Path
            d={createSegmentPath(startAngle, endAngle, TRIPLE_RADIUS, TRIPLE_RADIUS + TRIPLE_RING_WIDTH)}
            fill={getSegmentFill(number, 3, highlightedSection, "#ff4444")}
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
          fontSize={BOARDSIZE * 0.04}
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {number}
        </Text>
      );
    });
  };

  return (
    <View style={styles.container}>
      <Svg width={BOARDSIZE} height={BOARDSIZE}>
        {/* Background circle */}
        <Circle cx={CENTER} cy={CENTER} r={OUTER_RADIUS} fill="#235c3e" />
        
        {/* Render all segments */}
        {renderSegments()}
        
        {/* Outer bullseye */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={BULL_OUTER_RADIUS}
          fill={highlightedSection?.score === 25 && highlightedSection?.multiplier === 1 ? '#ffff00' : "#44ff44"}
          onPress={() => onThrow({ score: 25, multiplier: 1 })}
        />
        
        {/* Inner bullseye */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={BULL_INNER_RADIUS}
          fill={highlightedSection?.score === 25 && highlightedSection?.multiplier === 2 ? '#ffff00' : "#ff4444"}
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
}); 