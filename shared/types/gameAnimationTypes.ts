export enum AnimationPriority {
  LOWEST = 1,
  LOW = 3,
  NORMAL = 5,
  HIGH = 10,
  VERY_HIGH = 15,
  CRITICAL = 20,
  OVERRIDE_ALL = 100,
}

export enum AnimationGrouping {
  HOVER = 'hover',
  COLLISION = 'collision',
  POWERUP = 'powerup',
  SCORE = 'score',
  RESIZE = 'resize',
  MATERIAL = 'material',
  POSITION = 'position',
  ROTATION = 'rotation',
  SCALE = 'scale',
}

export enum AnimationBlendMode {
  OVERRIDE = 'override',
  ADDITIVE = 'additive',
}

export interface AnimationMetadata {
  id: string;
  property: string;
  priority: AnimationPriority;
  group: AnimationGrouping;
  startTime: number;
  endTime?: number;
}

export interface AnimationOptions {
  priority?: AnimationPriority;
  group?: AnimationGrouping;
  blendMode?: AnimationBlendMode;
  duration?: number;
  easingMode?: number;
  onStart?: () => void;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
  loop?: boolean;
}

export interface AnimationHandle {
  id: string;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isActive: () => boolean;
}
