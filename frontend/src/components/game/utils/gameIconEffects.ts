import {
  Animation,
  Color3,
  Color4,
  CubicEase,
  EasingFunction,
  GlowLayer,
  Mesh,
  MeshBuilder,
  ParticleSystem,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from 'babylonjs';

import { createParticleTexture, gameToSceneSize, getPowerUpIconPath } from '@game/utils';

import {
  Player,
  PowerUpType,
  defaultGameObjectParams,
  defaultGameParams,
  playerPowerUp,
} from '@shared/types';

interface ActivePowerUpDisplay {
  id: string;
  powerUpType: PowerUpType;
  iconMesh: Mesh;
  barMesh: Mesh;
  barParticles: ParticleSystem;
  glowLayer: GlowLayer;
  timeToExpire: number;
  initialTime: number;
  position: Vector3;
  player: 'player1' | 'player2';
  index: number;
}

export class ActivePowerUpIconManager {
  private scene: Scene;
  private activeDisplays: Map<string, ActivePowerUpDisplay> = new Map();
  private primaryColor: Color3;
  private secondaryColor: Color3;
  private soundManager: any;
  private gameWidth: number;
  private iconSize: number;
  private ySpacing: number;
  private barHeight: number;
  private barWidth: number;

  private iconXOffset: number = 3.5;
  private iconYOffset: number = 9.0;
  private iconSizeMultiplier: number = 1.5;
  private barOffsetMultiplier: number = 0.7;

  constructor(scene: Scene, primaryColor: Color3, secondaryColor: Color3, soundManager?: any) {
    this.scene = scene;
    this.primaryColor = primaryColor;
    this.secondaryColor = secondaryColor;
    this.soundManager = soundManager;
    this.gameWidth = gameToSceneSize(defaultGameParams.dimensions.gameWidth) / 2;
    this.iconSize = gameToSceneSize(defaultGameParams.powerUps.size) * this.iconSizeMultiplier;
    this.ySpacing = this.iconSize * 1.5;
    this.barHeight = this.iconSize * 0.8;
    this.barWidth = this.iconSize * 0.1;
  }

  updatePowerUpDisplays(players: { player1: Player; player2: Player }): void {
    this.updatePlayerPowerUps(players.player1, 'player1');
    this.updatePlayerPowerUps(players.player2, 'player2');

    this.activeDisplays.forEach((display) => {
      this.updateProgressBar(display);
    });
  }

  private updatePlayerPowerUps(player: Player, playerType: 'player1' | 'player2'): void {
    const currentPowerUpIds = new Set<string>();

    // Process current active power-ups
    player.activePowerUps.forEach((powerUp, index) => {
      const id = `${playerType}-${powerUp.type}-${index}`;
      currentPowerUpIds.add(id);

      if (!this.activeDisplays.has(id)) {
        // Create new display for this power-up
        this.createPowerUpDisplay(powerUp, playerType, index);
      } else {
        // Update existing display
        const display = this.activeDisplays.get(id)!;
        display.timeToExpire = powerUp.timeToExpire;
      }
    });

    // Remove expired displays
    const expiredDisplays: string[] = [];
    this.activeDisplays.forEach((display, id) => {
      if (display.player === playerType && !currentPowerUpIds.has(id)) {
        expiredDisplays.push(id);
      }
    });

    expiredDisplays.forEach((id) => {
      this.removePowerUpDisplay(id);
    });

    // Reposition remaining displays
    this.repositionPlayerDisplays(playerType);
  }

  private createPowerUpDisplay(
    powerUp: playerPowerUp,
    playerType: 'player1' | 'player2',
    index: number
  ): void {
    const isPlayer1 = playerType === 'player1';
    const id = `${playerType}-${powerUp.type}-${index}`;

    const xOffset = this.gameWidth + this.iconXOffset;
    const xPosition = isPlayer1 ? -xOffset : xOffset;
    const yPosition = this.iconYOffset + index * this.ySpacing;
    const zPosition = defaultGameObjectParams.distanceFromFloor;

    const effectColor = powerUp.isNegative ? this.secondaryColor : this.primaryColor;

    const iconPosition = new Vector3(xPosition, yPosition, zPosition);
    const barPosition = iconPosition.clone();

    if (isPlayer1) {
      barPosition.x -= this.iconSize * this.barOffsetMultiplier;
    } else {
      barPosition.x += this.iconSize * this.barOffsetMultiplier;
    }

    const iconMesh = this.createPowerUpIcon(powerUp.type, iconPosition, effectColor, id);
    const barMesh = this.createProgressBar(barPosition, effectColor, id);

    const barParticles = this.createBarParticle(barPosition, effectColor, id);

    const glowLayer = new GlowLayer(`powerUp-glow-${id}`, this.scene);
    glowLayer.intensity = 0.2;
    glowLayer.blurKernelSize = 32;
    glowLayer.addIncludedOnlyMesh(barMesh);

    // Store the display
    const display: ActivePowerUpDisplay = {
      id,
      powerUpType: powerUp.type,
      iconMesh: iconMesh,
      barMesh: barMesh,
      barParticles: barParticles,
      glowLayer,
      timeToExpire: powerUp.timeToExpire,
      initialTime: powerUp.timeToExpire,
      position: iconPosition,
      player: playerType,
      index,
    };

    this.activeDisplays.set(id, display);

    this.animateActiveDisplay(display);
  }

  private createPowerUpIcon(
    powerUpType: PowerUpType,
    position: Vector3,
    effectColor: Color3,
    id: string
  ): Mesh {
    const icon = MeshBuilder.CreatePlane(
      `powerUpIcon-${id}`,
      { width: this.iconSize, height: this.iconSize },
      this.scene
    );

    const material = new StandardMaterial(`powerUpIconMat-${id}`, this.scene);
    const texture = new Texture(getPowerUpIconPath(powerUpType), this.scene);

    material.emissiveColor = effectColor;
    material.diffuseTexture = texture;
    material.opacityTexture = texture;

    material.useAlphaFromDiffuseTexture = true;
    material.disableLighting = true;
    material.backFaceCulling = false;

    icon.material = material;
    icon.position = position.clone();
    icon.scaling = new Vector3(1, 1, 1);

    return icon;
  }

  private createProgressBar(position: Vector3, effectColor: Color3, id: string): Mesh {
    const bar = MeshBuilder.CreateBox(
      `powerUpBar-${id}`,
      { width: this.barWidth, height: this.barHeight, depth: 0.05 },
      this.scene
    );

    const material = new StandardMaterial(`powerUpBarMat-${id}`, this.scene);

    material.emissiveColor = effectColor;

    bar.material = material;
    bar.position = position.clone();
    bar.scaling = new Vector3(1, 0, 1);

    // Create transformation point at bottom for scaling
    bar.setPivotPoint(new Vector3(0, -this.barHeight / 2, 0));

    return bar;
  }

  private createBarParticle(sourcePosition: Vector3, color: Color3, id: string): ParticleSystem {
    const particleSystem = new ParticleSystem(`powerUpParticles-${id}`, 50, this.scene);

    particleSystem.particleTexture = createParticleTexture(this.scene, color);

    particleSystem.emitter = sourcePosition.clone();
    particleSystem.minEmitBox = new Vector3(-0.1, -this.barHeight / 2, 0);
    particleSystem.maxEmitBox = new Vector3(0.1, this.barHeight / 2, 0);

    particleSystem.color1 = new Color4(color.r, color.g, color.b, 0.7);
    particleSystem.color2 = new Color4(color.r * 1.5, color.g * 1.5, color.b * 1.5, 0.7);
    particleSystem.colorDead = new Color4(color.r * 0.5, color.g * 0.5, color.b * 0.5, 0);

    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.2;
    particleSystem.minEmitPower = 0.3;
    particleSystem.maxEmitPower = 0.7;
    particleSystem.minLifeTime = 0.8;
    particleSystem.maxLifeTime = 1.5;
    particleSystem.emitRate = 20;

    particleSystem.direction1 = new Vector3(-0.1, 0.8, 0);
    particleSystem.direction2 = new Vector3(0.1, 1.2, 0);

    particleSystem.gravity = new Vector3(0, -0.1, 0);

    particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

    particleSystem.start();

    return particleSystem;
  }

  private updateProgressBar(display: ActivePowerUpDisplay): void {
    const percentRemaining = Math.max(0, display.timeToExpire / display.initialTime);

    if (display.barMesh) {
      display.barMesh.scaling.y = percentRemaining;

      if (display.barParticles && percentRemaining < 0.25) {
        const pulseFrequency = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
        display.barParticles.emitRate = 20 + Math.floor(pulseFrequency * 10);
      }

      if (display.timeToExpire <= 50 && !display.barMesh.metadata?.expiring) {
        display.barMesh.metadata = { expiring: true };
        setTimeout(() => {
          // Give a slight delay before disposing
          if (this.activeDisplays.has(display.id)) {
            this.removePowerUpDisplay(display.id);
          }
        }, 200);
      }
    }
  }

  private removePowerUpDisplay(id: string): void {
    const display = this.activeDisplays.get(id);

    if (!display) return;

    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    // Animate disappearance
    const scaleAnim = new Animation(
      `powerUpRemoveAnim-${id}`,
      'scaling',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const keys = [
      { frame: 0, value: display.iconMesh.scaling.clone() },
      { frame: 30, value: new Vector3(0, 0, 0) },
    ];

    scaleAnim.setKeys(keys);
    scaleAnim.setEasingFunction(easingFunction);

    display.iconMesh.animations = [scaleAnim];
    display.barMesh.animations = [scaleAnim.clone()];

    if (display.barParticles) display.barParticles.emitRate = 0;

    this.scene.beginAnimation(display.iconMesh, 0, 30, false, 1, () => {
      this.disposeDisplay(id);
    });

    this.scene.beginAnimation(display.barMesh, 0, 30, false);
  }

  private repositionPlayerDisplays(playerType: 'player1' | 'player2'): void {
    // Get all displays for this player
    const playerDisplays = Array.from(this.activeDisplays.values())
      .filter((d) => d.player === playerType)
      .sort((a, b) => a.index - b.index);

    playerDisplays.forEach((display, index) => {
      display.index = index;

      const isPlayer1 = playerType === 'player1';

      // Use absolute positioning in scene units
      // Calculate base X position - positioned at sides of screen
      const xOffset = isPlayer1 ? -this.iconXOffset : this.iconXOffset;

      // Calculate Y position - negative values are toward the top of screen
      // Add spacing for multiple icons
      const yPos = this.iconYOffset + index * this.ySpacing;

      const newPosition = new Vector3(xOffset, yPos, defaultGameObjectParams.distanceFromFloor);

      this.animatePositionChange(display, newPosition);
    });
  }

  private animatePositionChange(display: ActivePowerUpDisplay, newPosition: Vector3): void {
    // this.scene.stopAnimation(display.iconMesh);
    // this.scene.stopAnimation(display.barMesh);

    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    const posAnim = new Animation(
      `powerUpRepositionAnim-${display.id}`,
      'position',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const keys = [
      { frame: 0, value: display.iconMesh.position.clone() },
      { frame: 30, value: newPosition },
    ];
    posAnim.setKeys(keys);
    posAnim.setEasingFunction(easingFunction);

    // Choose progress bar position
    const barPosition = newPosition.clone();
    const barOffset = this.iconSize * this.barOffsetMultiplier;

    if (display.player === 'player1') {
      barPosition.x -= barOffset;
    } else {
      barPosition.x += barOffset;
    }

    // Progress bar position animation
    const barPosAnim = new Animation(
      `progressBarRepositionAnim-${display.id}`,
      'position',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const barKeys = [
      { frame: 0, value: display.barMesh.position.clone() },
      { frame: 30, value: barPosition },
    ];
    barPosAnim.setKeys(barKeys);
    barPosAnim.setEasingFunction(easingFunction);

    display.iconMesh.animations = [posAnim];
    display.barMesh.animations = [barPosAnim];

    this.scene.beginAnimation(display.iconMesh, 0, 30, false, 1, () => {
      display.position = newPosition.clone();
    });

    this.scene.beginAnimation(display.barMesh, 0, 30, false, 1, () => {
      if (display.barParticles) display.barParticles.emitter = barPosition;
    });
  }

  private animateActiveDisplay(display: ActivePowerUpDisplay): void {
    // Power-up icon animations
    const scaleXAnim = new Animation(
      `powerUpScaleXAnim-${display.id}`,
      'scaling.x',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const scaleXKeys = [
      { frame: 0, value: 0.8 },
      { frame: 15, value: 1.2 },
      { frame: 30, value: 1.0 },
    ];
    scaleXAnim.setKeys(scaleXKeys);

    const scaleYAnim = new Animation(
      `powerUpScaleYAnim-${display.id}`,
      'scaling.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const scaleYKeys = [
      { frame: 0, value: 0.8 },
      { frame: 15, value: 1.2 },
      { frame: 30, value: 1.0 },
    ];
    scaleYAnim.setKeys(scaleYKeys);

    const scaleZAnim = new Animation(
      `powerUpScaleZAnim-${display.id}`,
      'scaling.z',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const scaleZKeys = [
      { frame: 0, value: 0.5 },
      { frame: 30, value: 0.5 },
    ];
    scaleZAnim.setKeys(scaleZKeys);

    // Progress bar animations
    const barScaleYAnim = new Animation(
      `powerUpBarAppearAnim-${display.id}`,
      'scaling.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const barScaleKeys = [
      { frame: 0, value: 0.8 },
      { frame: 15, value: 1.2 },
      { frame: 30, value: 1.0 },
    ];
    barScaleYAnim.setKeys(barScaleKeys);

    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    scaleXAnim.setEasingFunction(easingFunction);
    scaleYAnim.setEasingFunction(easingFunction);
    barScaleYAnim.setEasingFunction(easingFunction);

    display.iconMesh.animations = [scaleXAnim, scaleYAnim, scaleZAnim];
    display.barMesh.animations = [barScaleYAnim];

    this.scene.beginAnimation(display.iconMesh, 0, 30, true);
    this.scene.beginAnimation(display.barMesh, 0, 30, true);
  }

  private disposeDisplay(id: string): void {
    const display = this.activeDisplays.get(id);

    if (!display) return;

    if (display.iconMesh.material) display.iconMesh.material.dispose();
    if (display.barMesh.material) display.barMesh.material.dispose();

    display.iconMesh.dispose();
    display.barMesh.dispose();

    if (display.barParticles) display.barParticles.dispose();
    if (display.glowLayer) display.glowLayer.dispose();

    this.activeDisplays.delete(id);
  }

  public disposeAll(): void {
    this.activeDisplays.forEach((_, id) => {
      this.disposeDisplay(id);
    });
    this.activeDisplays.clear();
  }
}
