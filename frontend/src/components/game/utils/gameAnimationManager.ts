import { Animation, Color3, Material, Mesh, Scene, Vector3 } from 'babylonjs';

import { applyEasing } from '@game/utils';

import {
  AnimationBlendMode,
  AnimationGrouping,
  AnimationHandle,
  AnimationMetadata,
  AnimationOptions,
  AnimationPriority,
} from '@shared/types';

export class GameAnimationManager {
  private static instance: GameAnimationManager;
  private scene: Scene;
  private animations: Map<string, Map<string, Animation[]>> = new Map();
  private activeHandles: Map<string, AnimationHandle[]> = new Map();

  private constructor(scene: Scene) {
    this.scene = scene;
  }

  static getInstance(scene?: Scene): GameAnimationManager {
    if (!GameAnimationManager.instance) {
      if (!scene) throw new Error('Scene required on first initialization');
      GameAnimationManager.instance = new GameAnimationManager(scene);
    }
    return GameAnimationManager.instance;
  }

  animate(
    target: Mesh | Material,
    property: string,
    keyframes: { frame: number; value: any }[],
    options: AnimationOptions = {}
  ): AnimationHandle {
    const targetId = target instanceof Mesh ? target.id : (target as Material).name;
    const priority = options.priority || AnimationPriority.NORMAL;
    const group = options.group || AnimationGrouping.POSITION;
    const blendMode = options.blendMode || AnimationBlendMode.OVERRIDE;

    const animId = `${targetId}_${property}_${Date.now()}`;

    // Resolve conflicts if we're in override mode
    if (blendMode === AnimationBlendMode.OVERRIDE) {
      this.handleConflicts(target, property, priority, group);
    }

    const animation = this.createAnimation(property, keyframes, options);

    // Register in animations map
    if (!this.animations.has(targetId)) {
      this.animations.set(targetId, new Map());
    }

    if (!this.animations.get(targetId)!.has(property)) {
      this.animations.get(targetId)!.set(property, []);
    }

    this.animations.get(targetId)!.get(property)!.push(animation);

    // Update target's metadata
    this.updateTargetMetadata(target, animId, property, priority, group);

    // Start the animation
    const animatable = this.scene.beginAnimation(
      target,
      0,
      keyframes[keyframes.length - 1].frame,
      options.loop || false,
      1,
      () => {
        this.removeAnimation(target, animId);
        if (options.onComplete) options.onComplete();
      }
    );

    // Create and store the handle
    const handle: AnimationHandle = {
      id: animId,
      stop: () => {
        animatable.stop();
        this.removeAnimation(target, animId);
      },
      pause: () => animatable.pause(),
      resume: () => animatable.restart(),
      isActive: () => animatable.animationStarted && !(animatable as any)._stopped,
    };

    if (!this.activeHandles.has(targetId)) {
      this.activeHandles.set(targetId, []);
    }
    this.activeHandles.get(targetId)!.push(handle);

    if (options.onStart) options.onStart();

    return handle;
  }

  stopAnimationGroup(target: Mesh | Material, group: AnimationGrouping): void {
    const targetId = target instanceof Mesh ? target.id : (target as Material).name;

    if (!target.metadata?.animations) return;

    const animationsToStop: string[] = [];

    // Find all animations in this group
    Object.values(target.metadata.animations).forEach((propAnims: any) => {
      propAnims.forEach((anim: AnimationMetadata) => {
        if (anim.group === group) {
          animationsToStop.push(anim.id);
        }
      });
    });

    // Stop all identified animations
    if (this.activeHandles.has(targetId)) {
      const handles = this.activeHandles.get(targetId)!;
      handles.filter((h) => animationsToStop.includes(h.id)).forEach((h) => h.stop());
    }
  }

  stopAnimationsOnProperty(target: Mesh | Material, property: string): void {
    const targetId = target instanceof Mesh ? target.id : (target as Material).name;

    if (!this.activeHandles.has(targetId)) return;

    const handles = this.activeHandles.get(targetId)!;
    const animationsToStop: AnimationHandle[] = [];

    if (target.metadata?.animations?.[property]) {
      const ids = target.metadata.animations[property].map((a: AnimationMetadata) => a.id);
      animationsToStop.push(...handles.filter((h) => ids.includes(h.id)));
    }

    animationsToStop.forEach((h) => h.stop());
  }

  private handleConflicts(
    target: Mesh | Material,
    property: string,
    priority: AnimationPriority,
    group: AnimationGrouping
  ): void {
    if (!target.metadata?.animations?.[property]) return;

    const targetId = target instanceof Mesh ? target.id : (target as Material).name;
    const handles = this.activeHandles.get(targetId);
    if (!handles) return;

    // Get animations with lower priority (or same priority but different group)
    const animationsToStop = target.metadata.animations[property]
      .filter((a: AnimationMetadata) => {
        return a.priority < priority || (a.priority === priority && a.group !== group);
      })
      .map((a: AnimationMetadata) => a.id);

    // Stop the conflicting animations
    handles.filter((h) => animationsToStop.includes(h.id)).forEach((h) => h.stop());
  }

  private updateTargetMetadata(
    target: Mesh | Material,
    animId: string,
    property: string,
    priority: AnimationPriority,
    group: AnimationGrouping
  ): void {
    if (!target.metadata) target.metadata = {};
    if (!target.metadata.animations) target.metadata.animations = {};
    if (!target.metadata.animations[property]) {
      target.metadata.animations[property] = [];
    }

    const animMeta: AnimationMetadata = {
      id: animId,
      property,
      priority,
      group,
      startTime: Date.now(),
    };

    target.metadata.animations[property].push(animMeta);
  }

  private removeAnimation(target: Mesh | Material, animId: string): void {
    const targetId = target instanceof Mesh ? target.id : (target as Material).name;

    // Remove from handles
    if (this.activeHandles.has(targetId)) {
      const handles = this.activeHandles.get(targetId)!;
      const index = handles.findIndex((h) => h.id === animId);
      if (index !== -1) {
        handles.splice(index, 1);
      }
    }

    // Remove from metadata
    if (target.metadata?.animations) {
      Object.keys(target.metadata.animations).forEach((prop) => {
        const propAnims = target.metadata.animations[prop];
        const index = propAnims.findIndex((a: AnimationMetadata) => a.id === animId);
        if (index !== -1) {
          propAnims.splice(index, 1);
        }
      });
    }
  }

  private createAnimation(
    property: string,
    keyframes: { frame: number; value: any }[],
    options: AnimationOptions
  ): Animation {
    const animType = this.determineAnimationType(keyframes[0].value);
    const frameRate = 30;

    const animation = new Animation(
      `${property}Animation_${Date.now()}`,
      property,
      frameRate,
      animType,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    animation.setKeys(keyframes);

    if (options.easingMode) applyEasing(animation, options.easingMode);

    return animation;
  }

  private determineAnimationType(value: any): number {
    if (typeof value === 'number') {
      return Animation.ANIMATIONTYPE_FLOAT;
    } else if (value instanceof Vector3) {
      return Animation.ANIMATIONTYPE_VECTOR3;
    } else if (value instanceof Color3) {
      return Animation.ANIMATIONTYPE_COLOR3;
    }
    return Animation.ANIMATIONTYPE_FLOAT;
  }
}
