import React from 'react';
import { StyleSheet } from 'react-native';
import { PanGestureHandler, PinchGestureHandler, RotationGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, Rect, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { TrophyShape } from '../types/trophy';
import { ClassicTrophy, SilverTrophy, CrystalTrophy } from './TrophyTemplates';

interface DraggableShapeProps {
  shape: TrophyShape;
  onUpdate: (id: string, updates: Partial<TrophyShape>) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

const DraggableShape: React.FC<DraggableShapeProps> = ({
  shape,
  onUpdate,
  onSelect,
  isSelected,
  canvasWidth,
  canvasHeight,
}) => {
  const translateX = useSharedValue(shape.x);
  const translateY = useSharedValue(shape.y);
  const scale = useSharedValue(shape.scale);
  const rotation = useSharedValue(shape.rotation);
  const baseScale = useSharedValue(1);
  const baseRotation = useSharedValue(0);

  const panGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
      runOnJS(onSelect)(shape.id);
    },
    onActive: (event, context) => {
      const newX = context.startX + event.translationX;
      const newY = context.startY + event.translationY;
      
      // Keep shape within canvas bounds
      const minX = shape.width * scale.value / 2;
      const maxX = canvasWidth - shape.width * scale.value / 2;
      const minY = shape.height * scale.value / 2;
      const maxY = canvasHeight - shape.height * scale.value / 2;
      
      translateX.value = Math.max(minX, Math.min(maxX, newX));
      translateY.value = Math.max(minY, Math.min(maxY, newY));
    },
    onEnd: () => {
      runOnJS(onUpdate)(shape.id, {
        x: translateX.value,
        y: translateY.value,
      });
    },
  });

  const pinchGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startScale = scale.value;
      runOnJS(onSelect)(shape.id);
    },
    onActive: (event, context) => {
      const newScale = context.startScale * event.scale;
      scale.value = Math.max(0.5, Math.min(3, newScale)); // Limit scale between 0.5x and 3x
    },
    onEnd: () => {
      scale.value = withSpring(scale.value);
      runOnJS(onUpdate)(shape.id, {
        scale: scale.value,
      });
    },
  });

  const rotationGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startRotation = rotation.value;
      runOnJS(onSelect)(shape.id);
    },
    onActive: (event, context) => {
      rotation.value = context.startRotation + event.rotation;
    },
    onEnd: () => {
      rotation.value = withSpring(rotation.value);
      runOnJS(onUpdate)(shape.id, {
        rotation: rotation.value,
      });
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
    zIndex: shape.zIndex,
  }));

  const renderShape = () => {
    const gradientId = `gradient-${shape.id}`;
    const strokeWidth = isSelected ? 3 : 1;
    const strokeColor = isSelected ? '#007AFF' : 'transparent';

    return (
      <Svg width={shape.width} height={shape.height} style={StyleSheet.absoluteFillObject}>
        <Defs>
          {shape.material.gradient && (
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {shape.material.gradient.colors.map((color, index) => (
                <Stop
                  key={index}
                  offset={`${shape.material.gradient!.locations[index] * 100}%`}
                  stopColor={color}
                />
              ))}
            </LinearGradient>
          )}
        </Defs>
        
        {shape.type === 'circle' && (
          <Circle
            cx={shape.width / 2}
            cy={shape.height / 2}
            r={Math.min(shape.width, shape.height) / 2 - strokeWidth}
            fill={shape.material.gradient ? `url(#${gradientId})` : shape.material.color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        )}
        
        {shape.type === 'rectangle' && (
          <Rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={shape.width - strokeWidth}
            height={shape.height - strokeWidth}
            fill={shape.material.gradient ? `url(#${gradientId})` : shape.material.color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            rx={5}
          />
        )}
        
        {shape.type === 'trophy-cup' && (
          <Path
            d={`M ${shape.width * 0.2} ${shape.height * 0.3} 
                Q ${shape.width * 0.1} ${shape.height * 0.4} ${shape.width * 0.2} ${shape.height * 0.5}
                L ${shape.width * 0.2} ${shape.height * 0.7}
                Q ${shape.width * 0.2} ${shape.height * 0.8} ${shape.width * 0.3} ${shape.height * 0.8}
                L ${shape.width * 0.7} ${shape.height * 0.8}
                Q ${shape.width * 0.8} ${shape.height * 0.8} ${shape.width * 0.8} ${shape.height * 0.7}
                L ${shape.width * 0.8} ${shape.height * 0.5}
                Q ${shape.width * 0.9} ${shape.height * 0.4} ${shape.width * 0.8} ${shape.height * 0.3}
                L ${shape.width * 0.8} ${shape.height * 0.2}
                Q ${shape.width * 0.8} ${shape.height * 0.1} ${shape.width * 0.7} ${shape.height * 0.1}
                L ${shape.width * 0.3} ${shape.height * 0.1}
                Q ${shape.width * 0.2} ${shape.height * 0.1} ${shape.width * 0.2} ${shape.height * 0.2}
                Z
                M ${shape.width * 0.35} ${shape.height * 0.85}
                L ${shape.width * 0.65} ${shape.height * 0.85}
                L ${shape.width * 0.6} ${shape.height * 0.95}
                L ${shape.width * 0.4} ${shape.height * 0.95}
                Z`}
            fill={shape.material.gradient ? `url(#${gradientId})` : shape.material.color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        )}
        
        {shape.type === 'star' && (
          <Path
            d={`M ${shape.width / 2} ${strokeWidth}
                L ${shape.width * 0.6} ${shape.height * 0.35}
                L ${shape.width - strokeWidth} ${shape.height * 0.35}
                L ${shape.width * 0.75} ${shape.height * 0.6}
                L ${shape.width * 0.8} ${shape.height - strokeWidth}
                L ${shape.width / 2} ${shape.height * 0.75}
                L ${shape.width * 0.2} ${shape.height - strokeWidth}
                L ${shape.width * 0.25} ${shape.height * 0.6}
                L ${strokeWidth} ${shape.height * 0.35}
                L ${shape.width * 0.4} ${shape.height * 0.35}
                Z`}
            fill={shape.material.gradient ? `url(#${gradientId})` : shape.material.color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        )}
      </Svg>
    );
  };

  const renderTemplate = () => {
    const gradientId = `gradient-${shape.id}`;
    const strokeWidth = isSelected ? 3 : 1;
    const strokeColor = isSelected ? '#007AFF' : 'transparent';
    
    switch (shape.type) {
      case 'classic-trophy':
        return (
          <ClassicTrophy 
            width={shape.width} 
            height={shape.height} 
            material={shape.material} 
            gradientId={gradientId} 
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      case 'silver-trophy':
        return (
          <SilverTrophy 
            width={shape.width} 
            height={shape.height} 
            material={shape.material} 
            gradientId={gradientId} 
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      case 'crystal-trophy':
        return (
          <CrystalTrophy 
            width={shape.width} 
            height={shape.height} 
            material={shape.material} 
            gradientId={gradientId} 
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      default:
        return renderShape();
    }
  };

  return (
    <PanGestureHandler onGestureEvent={panGestureHandler}>
      <Animated.View style={[animatedStyle, { position: 'absolute' }]}>
        <PinchGestureHandler onGestureEvent={pinchGestureHandler}>
          <Animated.View>
            <RotationGestureHandler onGestureEvent={rotationGestureHandler}>
              <Animated.View style={{ width: shape.width, height: shape.height }}>
                {renderTemplate()}
              </Animated.View>
            </RotationGestureHandler>
          </Animated.View>
        </PinchGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default DraggableShape;
