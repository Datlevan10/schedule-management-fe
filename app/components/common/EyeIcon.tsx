import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface EyeIconProps {
  isVisible: boolean;
  size?: number;
  color?: string;
}

export const EyeIcon: React.FC<EyeIconProps> = ({ 
  isVisible, 
  size = 24, 
  color = '#8E8E93' 
}) => {
  return (
    <Ionicons 
      name={isVisible ? 'eye-off-outline' : 'eye-outline'} 
      size={size} 
      color={color} 
    />
  );
};