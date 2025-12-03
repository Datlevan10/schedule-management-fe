import React from 'react';
import { Path, Svg } from 'react-native-svg';

interface SplitMoneyIconProps {
  size?: number;
  color?: string;
}

export const SplitMoneyIcon: React.FC<SplitMoneyIconProps> = ({
  size = 25,
  color = 'black'
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 79 79" fill="none">
      <Path
        d="M73.9106 62.3926L54.7499 62.3926C43.7042 62.3926 34.7499 53.4383 34.7499 42.3926L34.7499 39.3569"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M34.75 39.3569L2.5 39.3569"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M62.3926 76.2146C67.7902 70.817 70.8164 67.7908 76.214 62.3932L62.3926 48.5718"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M73.9102 16.3222L54.7494 16.3222C43.7037 16.3222 34.7494 25.2765 34.7494 36.3222L34.7494 39.3579"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M62.3926 2.50021C67.7902 7.89781 70.8164 10.924 76.214 16.3216L62.3926 30.1431"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};