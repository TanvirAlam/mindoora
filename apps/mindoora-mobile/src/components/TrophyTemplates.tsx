import React from 'react';
import Svg, { 
  Path, 
  Rect, 
  Circle, 
  Ellipse, 
  Polygon, 
  Defs, 
  LinearGradient, 
  Stop, 
  RadialGradient,
  Group 
} from 'react-native-svg';
import { TrophyMaterial } from '../types/trophy';

interface TrophyTemplateProps {
  width: number;
  height: number;
  material: TrophyMaterial;
  gradientId: string;
  strokeColor?: string;
  strokeWidth?: number;
}

// Classic Trophy with Handles and Pedestal
export const ClassicTrophy: React.FC<TrophyTemplateProps> = ({
  width,
  height,
  material,
  gradientId,
  strokeColor = 'transparent',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height}>
      <Defs>
        {/* Cup gradient */}
        <LinearGradient id={`${gradientId}-cup`} x1="0%" y1="0%" x2="100%" y2="100%">
          {material.gradient?.colors.map((color, index) => (
            <Stop
              key={index}
              offset={`${material.gradient!.locations[index] * 100}%`}
              stopColor={color}
            />
          )) || <Stop offset="0%" stopColor={material.color} />}
        </LinearGradient>
        
        {/* Pedestal gradient - darker */}
        <LinearGradient id={`${gradientId}-pedestal`} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#8B4513" />
          <Stop offset="50%" stopColor="#A0522D" />
          <Stop offset="100%" stopColor="#654321" />
        </LinearGradient>

        {/* Base gradient - darkest */}
        <LinearGradient id={`${gradientId}-base`} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#5D4037" />
          <Stop offset="50%" stopColor="#6D4C41" />
          <Stop offset="100%" stopColor="#3E2723" />
        </LinearGradient>
      </Defs>

      {/* Multi-tier base */}
      <Rect
        x={width * 0.1}
        y={height * 0.8}
        width={width * 0.8}
        height={height * 0.15}
        fill={`url(#${gradientId}-base)`}
        stroke={strokeColor}
        strokeWidth={strokeWidth * 0.5}
        rx={2}
      />
      
      <Rect
        x={width * 0.15}
        y={height * 0.75}
        width={width * 0.7}
        height={height * 0.1}
        fill={`url(#${gradientId}-pedestal)`}
        stroke={strokeColor}
        strokeWidth={strokeWidth * 0.5}
        rx={2}
      />

      {/* Trophy stem */}
      <Rect
        x={width * 0.45}
        y={height * 0.65}
        width={width * 0.1}
        height={height * 0.15}
        fill={material.gradient ? `url(#${gradientId}-cup)` : material.color}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {/* Main cup body with decorative pattern */}
      <Path
        d={`M ${width * 0.25} ${height * 0.3}
            Q ${width * 0.25} ${height * 0.25} ${width * 0.3} ${height * 0.25}
            L ${width * 0.7} ${height * 0.25}
            Q ${width * 0.75} ${height * 0.25} ${width * 0.75} ${height * 0.3}
            L ${width * 0.75} ${height * 0.55}
            Q ${width * 0.75} ${height * 0.6} ${width * 0.7} ${height * 0.6}
            L ${width * 0.55} ${height * 0.6}
            L ${width * 0.55} ${height * 0.65}
            L ${width * 0.45} ${height * 0.65}
            L ${width * 0.45} ${height * 0.6}
            L ${width * 0.3} ${height * 0.6}
            Q ${width * 0.25} ${height * 0.6} ${width * 0.25} ${height * 0.55}
            Z`}
        fill={material.gradient ? `url(#${gradientId}-cup)` : material.color}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {/* Decorative pattern on cup */}
      <Path
        d={`M ${width * 0.3} ${height * 0.35}
            L ${width * 0.35} ${height * 0.45}
            L ${width * 0.4} ${height * 0.35}
            L ${width * 0.45} ${height * 0.45}
            L ${width * 0.5} ${height * 0.35}
            L ${width * 0.55} ${height * 0.45}
            L ${width * 0.6} ${height * 0.35}
            L ${width * 0.65} ${height * 0.45}
            L ${width * 0.7} ${height * 0.35}`}
        fill="none"
        stroke={material.metallic ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}
        strokeWidth={strokeWidth}
      />

      {/* Left handle */}
      <Path
        d={`M ${width * 0.25} ${height * 0.35}
            Q ${width * 0.15} ${height * 0.35} ${width * 0.15} ${height * 0.45}
            Q ${width * 0.15} ${height * 0.5} ${width * 0.25} ${height * 0.5}`}
        fill="none"
        stroke={material.gradient ? `url(#${gradientId}-cup)` : material.color}
        strokeWidth={strokeWidth * 3}
        strokeLinecap="round"
      />

      {/* Right handle */}
      <Path
        d={`M ${width * 0.75} ${height * 0.35}
            Q ${width * 0.85} ${height * 0.35} ${width * 0.85} ${height * 0.45}
            Q ${width * 0.85} ${height * 0.5} ${width * 0.75} ${height * 0.5}`}
        fill="none"
        stroke={material.gradient ? `url(#${gradientId}-cup)` : material.color}
        strokeWidth={strokeWidth * 3}
        strokeLinecap="round"
      />

      {/* Decorative leaves on base */}
      <Path
        d={`M ${width * 0.2} ${height * 0.85}
            Q ${width * 0.15} ${height * 0.82} ${width * 0.18} ${height * 0.88}
            Q ${width * 0.2} ${height * 0.9} ${width * 0.22} ${height * 0.88}`}
        fill="#4CAF50"
        stroke="#2E7D32"
        strokeWidth={0.5}
      />

      <Path
        d={`M ${width * 0.8} ${height * 0.85}
            Q ${width * 0.85} ${height * 0.82} ${width * 0.82} ${height * 0.88}
            Q ${width * 0.8} ${height * 0.9} ${width * 0.78} ${height * 0.88}`}
        fill="#4CAF50"
        stroke="#2E7D32"
        strokeWidth={0.5}
      />
    </Svg>
  );
};

// Silver Trophy with Curved Design
export const SilverTrophy: React.FC<TrophyTemplateProps> = ({
  width,
  height,
  material,
  gradientId,
  strokeColor = 'transparent',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={`${gradientId}-cup`} x1="0%" y1="0%" x2="100%" y2="100%">
          {material.gradient?.colors.map((color, index) => (
            <Stop
              key={index}
              offset={`${material.gradient!.locations[index] * 100}%`}
              stopColor={color}
            />
          )) || <Stop offset="0%" stopColor={material.color} />}
        </LinearGradient>
        
        <LinearGradient id={`${gradientId}-base`} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#8D6E63" />
          <Stop offset="50%" stopColor="#A1887F" />
          <Stop offset="100%" stopColor="#6D4C41" />
        </LinearGradient>
      </Defs>

      {/* Wooden base with carved details */}
      <Rect
        x={width * 0.15}
        y={height * 0.75}
        width={width * 0.7}
        height={height * 0.2}
        fill={`url(#${gradientId}-base)`}
        stroke={strokeColor}
        strokeWidth={strokeWidth * 0.5}
        rx={3}
      />

      {/* Carved detail on base */}
      <Circle
        cx={width * 0.3}
        cy={height * 0.85}
        r={width * 0.05}
        fill="none"
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={1}
      />
      
      <Circle
        cx={width * 0.7}
        cy={height * 0.85}
        r={width * 0.05}
        fill="none"
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={1}
      />

      {/* Trophy stem with detail */}
      <Path
        d={`M ${width * 0.44} ${height * 0.75}
            L ${width * 0.44} ${height * 0.6}
            Q ${width * 0.44} ${height * 0.58} ${width * 0.46} ${height * 0.58}
            L ${width * 0.54} ${height * 0.58}
            Q ${width * 0.56} ${height * 0.58} ${width * 0.56} ${height * 0.6}
            L ${width * 0.56} ${height * 0.75}
            Z`}
        fill={material.gradient ? `url(#${gradientId}-cup)` : material.color}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {/* Main cup with ornate curves */}
      <Path
        d={`M ${width * 0.3} ${height * 0.25}
            Q ${width * 0.28} ${height * 0.2} ${width * 0.35} ${height * 0.2}
            L ${width * 0.65} ${height * 0.2}
            Q ${width * 0.72} ${height * 0.2} ${width * 0.7} ${height * 0.25}
            L ${width * 0.7} ${height * 0.45}
            Q ${width * 0.7} ${height * 0.55} ${width * 0.6} ${height * 0.55}
            L ${width * 0.56} ${height * 0.55}
            L ${width * 0.56} ${height * 0.6}
            L ${width * 0.44} ${height * 0.6}
            L ${width * 0.44} ${height * 0.55}
            L ${width * 0.4} ${height * 0.55}
            Q ${width * 0.3} ${height * 0.55} ${width * 0.3} ${height * 0.45}
            Z`}
        fill={material.gradient ? `url(#${gradientId}-cup)` : material.color}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {/* Ornate pattern */}
      <Path
        d={`M ${width * 0.35} ${height * 0.3}
            Q ${width * 0.4} ${height * 0.35} ${width * 0.45} ${height * 0.3}
            Q ${width * 0.5} ${height * 0.35} ${width * 0.55} ${height * 0.3}
            Q ${width * 0.6} ${height * 0.35} ${width * 0.65} ${height * 0.3}`}
        fill="none"
        stroke={material.metallic ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'}
        strokeWidth={strokeWidth}
      />

      {/* Curved handles */}
      <Path
        d={`M ${width * 0.3} ${height * 0.3}
            Q ${width * 0.18} ${height * 0.32} ${width * 0.2} ${height * 0.42}
            Q ${width * 0.22} ${height * 0.48} ${width * 0.3} ${height * 0.46}`}
        fill="none"
        stroke={material.gradient ? `url(#${gradientId}-cup)` : material.color}
        strokeWidth={strokeWidth * 2}
        strokeLinecap="round"
      />

      <Path
        d={`M ${width * 0.7} ${height * 0.3}
            Q ${width * 0.82} ${height * 0.32} ${width * 0.8} ${height * 0.42}
            Q ${width * 0.78} ${height * 0.48} ${width * 0.7} ${height * 0.46}`}
        fill="none"
        stroke={material.gradient ? `url(#${gradientId}-cup)` : material.color}
        strokeWidth={strokeWidth * 2}
        strokeLinecap="round"
      />

      {/* Decorative plant elements */}
      <Path
        d={`M ${width * 0.82} ${height * 0.8}
            Q ${width * 0.88} ${height * 0.75} ${width * 0.85} ${height * 0.85}
            L ${width * 0.87} ${height * 0.87}
            Q ${width * 0.84} ${height * 0.9} ${width * 0.81} ${height * 0.87}`}
        fill="#66BB6A"
        stroke="#388E3C"
        strokeWidth={0.5}
      />
    </Svg>
  );
};

// Modern Crystal Trophy
export const CrystalTrophy: React.FC<TrophyTemplateProps> = ({
  width,
  height,
  material,
  gradientId,
  strokeColor = 'transparent',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={`${gradientId}-crystal`} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FF6B9D" />
          <Stop offset="50%" stopColor="#C44569" />
          <Stop offset="100%" stopColor="#F8B500" />
        </LinearGradient>
        
        <LinearGradient id={`${gradientId}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFD700" />
          <Stop offset="50%" stopColor="#FFA500" />
          <Stop offset="100%" stopColor="#FF8C00" />
        </LinearGradient>

        <LinearGradient id={`${gradientId}-base`} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#E1BEE7" />
          <Stop offset="33%" stopColor="#BB86FC" />
          <Stop offset="66%" stopColor="#6200EE" />
          <Stop offset="100%" stopColor="#3700B3" />
        </LinearGradient>
      </Defs>

      {/* Hexagonal multi-tier base */}
      <Polygon
        points={`${width * 0.1},${height * 0.9} ${width * 0.2},${height * 0.95} ${width * 0.8},${height * 0.95} ${width * 0.9},${height * 0.9} ${width * 0.85},${height * 0.8} ${width * 0.15},${height * 0.8}`}
        fill={`url(#${gradientId}-base)`}
        stroke={strokeColor}
        strokeWidth={strokeWidth * 0.5}
      />

      <Polygon
        points={`${width * 0.15},${height * 0.8} ${width * 0.25},${height * 0.85} ${width * 0.75},${height * 0.85} ${width * 0.85},${height * 0.8} ${width * 0.8},${height * 0.7} ${width * 0.2},${height * 0.7}`}
        fill={`url(#${gradientId}-base)`}
        stroke={strokeColor}
        strokeWidth={strokeWidth * 0.5}
        opacity={0.8}
      />

      <Polygon
        points={`${width * 0.2},${height * 0.7} ${width * 0.3},${height * 0.75} ${width * 0.7},${height * 0.75} ${width * 0.8},${height * 0.7} ${width * 0.75},${height * 0.6} ${width * 0.25},${height * 0.6}`}
        fill={`url(#${gradientId}-base)`}
        stroke={strokeColor}
        strokeWidth={strokeWidth * 0.5}
        opacity={0.6}
      />

      {/* Golden square base element */}
      <Rect
        x={width * 0.4}
        y={height * 0.55}
        width={width * 0.2}
        height={width * 0.2}
        fill={`url(#${gradientId}-gold)`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        rx={2}
      />

      {/* Golden circle detail */}
      <Circle
        cx={width * 0.5}
        cy={height * 0.65}
        r={width * 0.05}
        fill="none"
        stroke={material.metallic ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)'}
        strokeWidth={strokeWidth}
      />

      {/* Crystal trophy body - shield shape */}
      <Path
        d={`M ${width * 0.5} ${height * 0.15}
            L ${width * 0.65} ${height * 0.25}
            L ${width * 0.7} ${height * 0.45}
            L ${width * 0.65} ${height * 0.55}
            L ${width * 0.35} ${height * 0.55}
            L ${width * 0.3} ${height * 0.45}
            L ${width * 0.35} ${height * 0.25}
            Z`}
        fill={`url(#${gradientId}-crystal)`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {/* Crystal facets for 3D effect */}
      <Path
        d={`M ${width * 0.5} ${height * 0.15}
            L ${width * 0.5} ${height * 0.55}
            L ${width * 0.35} ${height * 0.55}`}
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={strokeWidth}
      />

      <Path
        d={`M ${width * 0.5} ${height * 0.15}
            L ${width * 0.5} ${height * 0.55}
            L ${width * 0.65} ${height * 0.55}`}
        fill="none"
        stroke="rgba(0,0,0,0.2)"
        strokeWidth={strokeWidth}
      />

      {/* Inner crystal detail */}
      <Path
        d={`M ${width * 0.45} ${height * 0.3}
            L ${width * 0.55} ${height * 0.3}
            L ${width * 0.55} ${height * 0.45}
            L ${width * 0.45} ${height * 0.45}
            Z`}
        fill="rgba(255,255,255,0.3)"
        stroke="none"
      />

      {/* Golden handles/wings */}
      <Path
        d={`M ${width * 0.3} ${height * 0.35}
            L ${width * 0.2} ${height * 0.3}
            L ${width * 0.15} ${height * 0.4}
            L ${width * 0.25} ${height * 0.45}
            Z`}
        fill={`url(#${gradientId}-gold)`}
        stroke={strokeColor}
        strokeWidth={strokeWidth * 0.5}
      />

      <Path
        d={`M ${width * 0.7} ${height * 0.35}
            L ${width * 0.8} ${height * 0.3}
            L ${width * 0.85} ${height * 0.4}
            L ${width * 0.75} ${height * 0.45}
            Z`}
        fill={`url(#${gradientId}-gold)`}
        stroke={strokeColor}
        strokeWidth={strokeWidth * 0.5}
      />

      {/* Decorative gem on base */}
      <Circle
        cx={width * 0.85}
        cy={height * 0.75}
        r={width * 0.03}
        fill="#4CAF50"
        stroke="#2E7D32"
        strokeWidth={0.5}
      />
    </Svg>
  );
};
