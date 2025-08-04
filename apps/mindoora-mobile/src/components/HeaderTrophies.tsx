import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Rect } from 'react-native-svg';

interface HeaderTrophyProps {
  width?: number;
  height?: number;
  type: 'left' | 'right';
}

export const HeaderTrophy: React.FC<HeaderTrophyProps> = ({ 
  width = 32, 
  height = 40, 
  type 
}) => {
  if (type === 'left') {
    // Crown-style trophy with leaves
    return (
      <Svg width={width} height={height} viewBox="0 0 32 40">
        <Defs>
          <LinearGradient id="trophy-left-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFD700" />
            <Stop offset="50%" stopColor="#FFA500" />
            <Stop offset="100%" stopColor="#FF8C00" />
          </LinearGradient>
          <LinearGradient id="trophy-left-base" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#8B4513" />
            <Stop offset="50%" stopColor="#A0522D" />
            <Stop offset="100%" stopColor="#654321" />
          </LinearGradient>
        </Defs>
        
        {/* Base */}
        <Rect x="6" y="32" width="20" height="6" fill="url(#trophy-left-base)" rx="1" />
        <Rect x="8" y="28" width="16" height="6" fill="url(#trophy-left-base)" rx="1" />
        
        {/* Trophy cup with crown-like top */}
        <Path
          d="M 10 16
             L 10 24
             Q 10 26 12 26
             L 20 26
             Q 22 26 22 24
             L 22 16
             Q 24 14 22 12
             L 22 8
             Q 22 6 20 6
             L 12 6
             Q 10 6 10 8
             L 10 12
             Q 8 14 10 16
             Z"
          fill="url(#trophy-left-gold)"
          stroke="#B8860B"
          strokeWidth="0.5"
        />
        
        {/* Crown leaves on top */}
        <Path
          d="M 12 6 L 14 2 L 16 6 L 18 2 L 20 6"
          fill="#D2691E"
          stroke="#B8860B"
          strokeWidth="0.5"
        />
        
        {/* Handles */}
        <Path
          d="M 10 12 Q 6 12 6 16 Q 6 18 10 18"
          fill="none"
          stroke="url(#trophy-left-gold)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M 22 12 Q 26 12 26 16 Q 26 18 22 18"
          fill="none"
          stroke="url(#trophy-left-gold)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Decorative leaves at base */}
        <Path
          d="M 4 30 Q 2 28 4 32 Q 6 34 8 32"
          fill="#4CAF50"
          stroke="#2E7D32"
          strokeWidth="0.3"
        />
        <Path
          d="M 28 30 Q 30 28 28 32 Q 26 34 24 32"
          fill="#4CAF50"
          stroke="#2E7D32"
          strokeWidth="0.3"
        />
      </Svg>
    );
  } else {
    // Star trophy with circular base
    return (
      <Svg width={width} height={height} viewBox="0 0 32 40">
        <Defs>
          <LinearGradient id="trophy-right-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFD700" />
            <Stop offset="50%" stopColor="#FFA500" />
            <Stop offset="100%" stopColor="#FF8C00" />
          </LinearGradient>
          <LinearGradient id="trophy-right-red" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF6B9D" />
            <Stop offset="50%" stopColor="#E91E63" />
            <Stop offset="100%" stopColor="#C2185B" />
          </LinearGradient>
          <LinearGradient id="trophy-right-base" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#D2691E" />
            <Stop offset="50%" stopColor="#CD7F32" />
            <Stop offset="100%" stopColor="#A0522D" />
          </LinearGradient>
        </Defs>
        
        {/* Multi-tier base */}
        <Rect x="6" y="32" width="20" height="6" fill="url(#trophy-right-base)" rx="2" />
        <Rect x="8" y="28" width="16" height="6" fill="url(#trophy-right-base)" rx="2" />
        <Rect x="10" y="24" width="12" height="6" fill="url(#trophy-right-base)" rx="1" />
        
        {/* Main circular trophy */}
        <Circle cx="16" cy="16" r="8" fill="url(#trophy-right-gold)" stroke="#B8860B" strokeWidth="0.5" />
        
        {/* Central emblem */}
        <Circle cx="16" cy="16" r="4" fill="url(#trophy-right-red)" stroke="#AD1457" strokeWidth="0.3" />
        
        {/* Left star */}
        <Path
          d="M 6 16 L 8 12 L 10 16 L 8 20 Z"
          fill="#FFD700"
          stroke="#FFA500"
          strokeWidth="0.3"
        />
        
        {/* Right star */}
        <Path
          d="M 26 16 L 24 12 L 22 16 L 24 20 Z"
          fill="#FF6B9D"
          stroke="#E91E63"
          strokeWidth="0.3"
        />
        
        {/* Top cross/plus */}
        <Path
          d="M 16 4 L 16 12 M 12 8 L 20 8"
          stroke="url(#trophy-right-red)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    );
  }
};

export default HeaderTrophy;
