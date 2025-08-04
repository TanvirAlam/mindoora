// Setup fetch mock for testing
require('jest-fetch-mock').enableMocks();

// Setup @testing-library/jest-dom
import '@testing-library/jest-dom';

// Setup DOM environment polyfills
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

// Add additional polyfills for Node.js environment
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = require('stream/web').ReadableStream;
}
if (typeof global.WritableStream === 'undefined') {
  global.WritableStream = require('stream/web').WritableStream;
}
if (typeof global.TransformStream === 'undefined') {
  global.TransformStream = require('stream/web').TransformStream;
}

// Create a DOM container for React components
if (typeof document !== 'undefined') {
  const div = document.createElement('div');
  div.setAttribute('id', 'root');
  document.body.appendChild(div);
}

// Mock console.log to reduce test output noise
global.console = {
  ...console,
  // Uncomment to ignore specific console outputs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock specific React Native modules if needed
// Note: We don't want to mock the entire react-native module
// as it interferes with @testing-library/react-native

// Mock @xenova/transformers since we're not using it anymore
jest.mock('@xenova/transformers', () => ({
  pipeline: jest.fn(),
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: (props) => null,
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  default: 'Svg',
  Svg: 'Svg',
  Circle: 'Circle',
  Ellipse: 'Ellipse',
  G: 'G',
  Text: 'Text',
  TSpan: 'TSpan',
  TextPath: 'TextPath',
  Path: 'Path',
  Polygon: 'Polygon',
  Polyline: 'Polyline',
  Line: 'Line',
  Rect: 'Rect',
  Use: 'Use',
  Image: 'Image',
  Symbol: 'Symbol',
  Defs: 'Defs',
  LinearGradient: 'LinearGradient',
  RadialGradient: 'RadialGradient',
  Stop: 'Stop',
  ClipPath: 'ClipPath',
  Pattern: 'Pattern',
  Mask: 'Mask',
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  default: {
    Value: jest.fn(),
    View: 'View',
  },
  Easing: {
    in: jest.fn(),
    out: jest.fn(),
    inOut: jest.fn(),
  },
  useSharedValue: jest.fn(() => ({ value: 0 })),
  useAnimatedStyle: jest.fn(() => ({})),
  withSpring: jest.fn(),
  Layout: {
    springify: jest.fn(),
  },
  SlideInRight: jest.fn(),
}));
