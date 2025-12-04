import React from 'react';
import { Path, Svg } from 'react-native-svg';

interface ShareNewIconProps {
  size?: number;
  color?: string;
}

export const ShareNewIcon: React.FC<ShareNewIconProps> = ({
  size = 25,
  color = 'black'
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 67 67" fill="none">
      <Path
        d="M63.9287 37.9397L63.9287 59.2034C63.9287 60.4567 63.4309 61.6585 62.5447 62.5447C61.6585 63.4309 60.4567 63.9287 59.2034 63.9287L7.22543 63.9287C5.97221 63.9287 4.77032 63.4309 3.88416 62.5447C2.998 61.6585 2.50015 60.4567 2.50015 59.2034L2.50016 7.22542C2.50016 5.9722 2.998 4.77031 3.88416 3.88415C4.77032 2.99799 5.97221 2.50015 7.22543 2.50015L28.4892 2.50015"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M47.3903 2.5006L63.9287 2.5006L63.9287 19.0391"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M63.9287 2.50008L33.2144 33.2144"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};