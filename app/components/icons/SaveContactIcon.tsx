import React from 'react';
import { Path, Svg } from 'react-native-svg';

interface SaveContactIconProps {
  size?: number;
  color?: string;
}

export const SaveContactIcon: React.FC<SaveContactIconProps> = ({
  size = 25,
  color = 'black'
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 68 79" fill="none">
      <Path
        d="M35.194 45.5507C40.573 45.5507 44.9335 41.1902 44.9335 35.8112C44.9335 30.4323 40.573 26.0718 35.194 26.0718C29.8151 26.0718 25.4546 30.4323 25.4546 35.8112C25.4546 41.1902 29.8151 45.5507 35.194 45.5507Z"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M53.7157 66.086C52.4576 62.1629 49.9861 58.7406 46.6577 56.3125C43.3292 53.8845 39.3157 52.5762 35.1957 52.5762C31.0758 52.5762 27.0622 53.8845 23.7338 56.3125C20.4053 58.7406 17.9339 62.1629 16.6758 66.086H53.7157Z"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M64.8736 70.5439C64.8736 72.0478 64.2762 73.4901 63.2128 74.5535C62.1494 75.6169 60.7072 76.2143 59.2033 76.2143H8.17033C6.66646 76.2143 5.22419 75.6169 4.1608 74.5535C3.09741 73.4901 2.5 72.0478 2.5 70.5439V8.17033C2.5 6.66646 3.09741 5.22419 4.1608 4.1608C5.22419 3.09741 6.66646 2.5 8.17033 2.5H45.0275L64.8736 22.3462V70.5439Z"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M45.0293 5.33496V22.3459H62.0403"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};