export interface TrophyShape {
  id: string;
  type: 'circle' | 'rectangle' | 'trophy-cup' | 'star' | 'polygon' | 'classic-trophy' | 'silver-trophy' | 'crystal-trophy';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  material: TrophyMaterial;
  zIndex: number;
}

export interface TrophyMaterial {
  type: 'gold' | 'silver' | 'bronze' | 'crystal';
  color: string;
  metallic?: boolean;
  gradient?: {
    colors: string[];
    locations: number[];
  };
}

export interface TrophyText {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  rotation: number;
  zIndex: number;
}

export interface TrophyDesign {
  id: string;
  name: string;
  shapes: TrophyShape[];
  texts: TrophyText[];
  background: {
    color: string;
    gradient?: {
      colors: string[];
      locations: number[];
    };
  };
  dimensions: {
    width: number;
    height: number;
  };
}

export const TROPHY_MATERIALS: Record<string, TrophyMaterial> = {
  gold: {
    type: 'gold',
    color: '#FFD700',
    metallic: true,
    gradient: {
      colors: ['#FFD700', '#FFA500', '#FF8C00'],
      locations: [0, 0.5, 1],
    },
  },
  silver: {
    type: 'silver',
    color: '#C0C0C0',
    metallic: true,
    gradient: {
      colors: ['#F5F5F5', '#C0C0C0', '#808080'],
      locations: [0, 0.5, 1],
    },
  },
  bronze: {
    type: 'bronze',
    color: '#CD7F32',
    metallic: true,
    gradient: {
      colors: ['#D2691E', '#CD7F32', '#A0522D'],
      locations: [0, 0.5, 1],
    },
  },
  crystal: {
    type: 'crystal',
    color: '#E0E6FF',
    metallic: false,
    gradient: {
      colors: ['#F0F8FF', '#E0E6FF', '#B0C4DE'],
      locations: [0, 0.5, 1],
    },
  },
};
