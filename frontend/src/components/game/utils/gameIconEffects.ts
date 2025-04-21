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
  icon: Mesh;
  progressBar: Mesh;
  progressMaterial: StandardMaterial;
  particleSystem: ParticleSystem;
  glowLayer: GlowLayer;
  isNegative: boolean;
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
  private gameHeight: number;
  private ySpacing: number = 2.0;
  private xOffset: number = -1.0;
  private xOffsetMultiplier: number = 1;
  private iconSize: number = 1.0;
  private barWidth: number = 0.25;
  private barHeight: number = 1.5;

  constructor(scene: Scene, primaryColor: Color3, secondaryColor: Color3, soundManager?: any) {
    this.scene = scene;
    this.primaryColor = primaryColor;
    this.secondaryColor = secondaryColor;
    this.soundManager = soundManager;
    this.gameWidth = defaultGameParams.dimensions.gameWidth;
    this.gameHeight = defaultGameParams.dimensions.gameHeight;
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
    const xPosition = isPlayer1 ? this.xOffset : this.gameWidth - this.xOffset;
    const yPosition = this.gameHeight / 2 - (index + 1) * this.ySpacing;
    const id = `${playerType}-${powerUp.type}-${index}`;

    const position = new Vector3(
      gameToSceneSize(xPosition),
      gameToSceneSize(yPosition),
      defaultGameObjectParams.distanceFromFloor
    );

    const icon = this.createPowerUpIcon(powerUp.type, position, powerUp.isNegative, id);

    // Choose progress bar position
    const barPosition = position.clone();
    if (isPlayer1) {
      barPosition.x -= this.iconSize * this.xOffsetMultiplier;
    } else {
      barPosition.x += this.iconSize * this.xOffsetMultiplier;
    }

    const { progressBar, progressMaterial } = this.createProgressBar(
      barPosition,
      powerUp.isNegative,
      id
    );

    const particleSystem = this.createParticleSystem(
      barPosition,
      position,
      powerUp.isNegative ? this.secondaryColor : this.primaryColor,
      id
    );

    const glowLayer = new GlowLayer(`powerUp-glow-${id}`, this.scene);
    glowLayer.intensity = 0.2;
    glowLayer.blurKernelSize = 32;
    glowLayer.addIncludedOnlyMesh(icon);
    glowLayer.addIncludedOnlyMesh(progressBar);

    // Store the display
    const display: ActivePowerUpDisplay = {
      id,
      powerUpType: powerUp.type,
      icon,
      progressBar,
      progressMaterial,
      particleSystem,
      glowLayer,
      isNegative: powerUp.isNegative,
      timeToExpire: powerUp.timeToExpire,
      initialTime: powerUp.timeToExpire,
      position,
      player: playerType,
      index,
    };

    this.activeDisplays.set(id, display);

    this.animateActiveDisplay(display);
  }

  private createPowerUpIcon(
    powerUpType: PowerUpType,
    position: Vector3,
    isNegative: boolean,
    id: string
  ): Mesh {
    const icon = MeshBuilder.CreatePlane(
      `powerUpIcon-${id}`,
      { width: this.iconSize, height: this.iconSize },
      this.scene
    );

    const color = isNegative ? this.secondaryColor : this.primaryColor;
    const material = new StandardMaterial(`powerUpIconMat-${id}`, this.scene);

    const texture = new Texture(getPowerUpIconPath(powerUpType), this.scene);
    material.diffuseTexture = texture;
    material.opacityTexture = texture;
    material.emissiveColor = color;

    material.useAlphaFromDiffuseTexture = true;
    material.disableLighting = true;
    material.backFaceCulling = false;

    icon.material = material;
    icon.position = position.clone();
    icon.scaling = new Vector3(1, 1, 1);

    return icon;
  }

  private createProgressBar(
    position: Vector3,
    isNegative: boolean,
    id: string
  ): { progressBar: Mesh; progressMaterial: StandardMaterial } {
    const progressBar = MeshBuilder.CreateBox(
      `powerUpBar-${id}`,
      { width: this.barWidth, height: this.barHeight, depth: 0.05 },
      this.scene
    );

    const progressMaterial = new StandardMaterial(`powerUpBarMat-${id}`, this.scene);
    progressMaterial.emissiveColor = isNegative ? this.secondaryColor : this.primaryColor;

    progressBar.material = progressMaterial;
    progressBar.position = position.clone();

    // Create transformation point at bottom for scaling
    progressBar.setPivotPoint(new Vector3(0, -this.barHeight / 2, 0));
    progressBar.scaling = new Vector3(1, 0, 1); // Start zero height

    return { progressBar, progressMaterial };
  }

  private createParticleSystem(
    sourcePosition: Vector3,
    targetPosition: Vector3,
    color: Color3,
    id: string
  ): ParticleSystem {
    const particleSystem = new ParticleSystem(`powerUpParticles-${id}`, 50, this.scene);
    particleSystem.particleTexture = createParticleTexture(this.scene, color);

    // Set direction from bar to icon
    const direction = targetPosition.subtract(sourcePosition).normalize();

    particleSystem.emitter = sourcePosition.clone();
    particleSystem.minEmitBox = new Vector3(-0.1, -this.barHeight / 2, 0);
    particleSystem.maxEmitBox = new Vector3(0.1, this.barHeight / 2, 0);

    particleSystem.color1 = new Color4(color.r, color.g, color.b, 0.7);
    particleSystem.color2 = new Color4(color.r * 1.5, color.g * 1.5, color.b * 1.5, 0.7);
    particleSystem.colorDead = new Color4(color.r * 0.5, color.g * 0.5, color.b * 0.5, 0);

    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.15;
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 0.6;
    particleSystem.emitRate = 15;

    particleSystem.direction1 = direction.scale(0.8);
    particleSystem.direction2 = direction.scale(1.2);
    particleSystem.minEmitPower = 0.5;
    particleSystem.maxEmitPower = 1;

    particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

    particleSystem.start();

    return particleSystem;
  }

  private updateProgressBar(display: ActivePowerUpDisplay): void {
    const percentRemaining = Math.max(0, display.timeToExpire / display.initialTime);

    if (display.progressBar) {
      display.progressBar.scaling.y = percentRemaining;

      if (display.particleSystem && percentRemaining < 0.25) {
        const pulseFrequency = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
        display.particleSystem.emitRate = 20 + Math.floor(pulseFrequency * 10);
      }

      if (display.timeToExpire <= 50 && !display.progressBar.metadata?.expiring) {
        display.progressBar.metadata = { expiring: true };
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

    this.scene.stopAnimation(display.icon);
    this.scene.stopAnimation(display.progressBar);

    if (display.progressBar.material) {
      this.scene.stopAnimation(display.progressBar.material);
    }

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
      { frame: 0, value: display.icon.scaling.clone() },
      { frame: 30, value: new Vector3(0, 0, 0) },
    ];

    scaleAnim.setKeys(keys);
    scaleAnim.setEasingFunction(easingFunction);

    display.icon.animations = [scaleAnim];
    display.progressBar.animations = [scaleAnim.clone()];

    if (display.particleSystem) display.particleSystem.emitRate = 0;

    this.scene.beginAnimation(display.icon, 0, 30, false, 1, () => {
      this.disposeDisplay(id);
    });

    this.scene.beginAnimation(display.progressBar, 0, 30, false);
  }

  private repositionPlayerDisplays(playerType: 'player1' | 'player2'): void {
    // Get all displays for this player
    const playerDisplays = Array.from(this.activeDisplays.values())
      .filter((d) => d.player === playerType)
      .sort((a, b) => a.index - b.index);

    playerDisplays.forEach((display, index) => {
      display.index = index;

      const isPlayer1 = playerType === 'player1';
      const xPosition = isPlayer1 ? this.xOffset : this.gameWidth - this.xOffset;
      const yPosition = this.gameHeight / 2 - (index + 1) * this.ySpacing;

      const newPosition = new Vector3(
        gameToSceneSize(xPosition),
        gameToSceneSize(yPosition),
        defaultGameObjectParams.distanceFromFloor
      );

      this.animatePositionChange(display, newPosition);
    });
  }

  private animatePositionChange(display: ActivePowerUpDisplay, newPosition: Vector3): void {
    this.scene.stopAnimation(display.icon);
    this.scene.stopAnimation(display.progressBar);

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
      { frame: 0, value: display.icon.position.clone() },
      { frame: 30, value: newPosition },
    ];
    posAnim.setKeys(keys);
    posAnim.setEasingFunction(easingFunction);

    // Choose progress bar position
    const barPosition = newPosition.clone();
    if (display.player === 'player1') {
      barPosition.x -= this.iconSize * this.xOffsetMultiplier;
    } else {
      barPosition.x += this.iconSize * this.xOffsetMultiplier;
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
      { frame: 0, value: display.progressBar.position.clone() },
      { frame: 30, value: barPosition },
    ];
    barPosAnim.setKeys(barKeys);
    barPosAnim.setEasingFunction(easingFunction);

    display.icon.animations = [posAnim];
    display.progressBar.animations = [barPosAnim];

    this.scene.beginAnimation(display.icon, 0, 30, false, 1, () => {
      display.position = newPosition.clone();
    });

    this.scene.beginAnimation(display.progressBar, 0, 30, false, 1, () => {
      if (display.particleSystem) display.particleSystem.emitter = barPosition;
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

    display.icon.animations = [scaleXAnim, scaleYAnim, scaleZAnim];
    display.progressBar.animations = [barScaleYAnim];

    this.scene.beginAnimation(display.icon, 0, 30, true);
    this.scene.beginAnimation(display.progressBar, 0, 30, true);
  }

  private disposeDisplay(id: string): void {
    const display = this.activeDisplays.get(id);

    if (!display) return;

    this.scene.stopAnimation(display.icon);
    this.scene.stopAnimation(display.progressBar);

    if (display.progressBar.material) {
      this.scene.stopAnimation(display.progressBar.material);
    }

    if (display.icon.material) display.icon.material.dispose();
    if (display.progressBar.material) display.progressBar.material.dispose();

    display.icon.dispose();
    display.progressBar.dispose();

    if (display.particleSystem) display.particleSystem.dispose();
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
