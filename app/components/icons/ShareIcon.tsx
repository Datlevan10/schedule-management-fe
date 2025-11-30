import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface ShareIconProps {
  size?: number;
  color?: string;
}

export const ShareIcon: React.FC<ShareIconProps> = ({ 
  size = 24, 
  color = 'black' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Main horizontal line from left to center */}
      <Path
        d="M3 12h10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Upper arrow pointing up-right */}
      <Path
        d="M13 12l7-7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M17 2l3 3-3-3z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17 8l3-3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Lower arrow pointing down-right */}
      <Path
        d="M13 12l7 7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M17 16l3 3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M20 19l-3-3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
};