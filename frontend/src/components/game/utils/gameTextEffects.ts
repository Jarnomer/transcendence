import {
  Color3,
  DynamicTexture,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
  Animation,
} from 'babylonjs';

import { GameStatus } from '@shared/types';

import { getGameSoundManager } from './gameSoundEffects';

class GameTextManager {
  private scene: Scene;
  private textMesh: Mesh | null = null;
  private textTexture: DynamicTexture | null = null;
  private fontName: string = "'joystix monospace', monospace";
  private fontSize: number = 180;
  private textColor: Color3;
  private fontLoaded: boolean = false;
  private currentAnimation: Animation | null = null;
  private currentAnimationKey: string | null = null;
  private soundManager = getGameSoundManager();

  constructor(scene: Scene, textColor: Color3) {
    this.scene = scene;
    this.textColor = textColor;
    this.loadFont();
    this.createTextMesh();
  }

  // Load custom font
  private loadFont(): void {
    const fontFace = new FontFace('joystix monospace', 'url(/fonts/joystix_monospace.otf)');

    fontFace
      .load()
      .then((loadedFace) => {
        document.fonts.add(loadedFace);
        this.fontLoaded = true;
        console.log('Joystix font loaded successfully');
      })
      .catch((error) => {
        console.error('Error loading Joystix font:', error);
        this.fontName = 'Arial'; // Fallback to Arial
        this.fontLoaded = true;
      });
  }

  // Create the mesh that will display the text
  private createTextMesh(): void {
    // Create a plane mesh for our text
    this.textMesh = MeshBuilder.CreatePlane('textPlane', { width: 10, height: 5 }, this.scene);
    this.textMesh.position = new Vector3(0, 0, -2); // Position in front of the game
    this.textMesh.isPickable = false;

    // Create a dynamic texture for the text
    this.textTexture = new DynamicTexture(
      'textTexture',
      { width: 1024, height: 512 },
      this.scene,
      true
    );

    // Create material with transparency
    const textMaterial = new StandardMaterial('textMaterial', this.scene);
    textMaterial.diffuseTexture = this.textTexture;
    textMaterial.specularColor = new Color3(0, 0, 0);
    textMaterial.emissiveColor = this.textColor;
    textMaterial.disableLighting = true;
    textMaterial.useAlphaFromDiffuseTexture = true;

    // Apply material to mesh
    this.textMesh.material = textMaterial;

    // Initially hide the text
    this.textMesh.visibility = 0;
  }

  // Update the text color
  public updateTextColor(color: Color3): void {
    this.textColor = color;

    if (this.textMesh && this.textMesh.material) {
      const material = this.textMesh.material as StandardMaterial;
      material.emissiveColor = this.textColor;
    }
  }

  // Draw text on the dynamic texture
  private drawText(text: string, fontSize: number = this.fontSize): void {
    if (!this.textTexture || !this.fontLoaded) return;

    const ctx = this.textTexture.getContext();

    // Clear the canvas
    ctx.clearRect(0, 0, 1024, 512);

    // Explicitly type ctx as CanvasRenderingContext2D to access text properties
    const canvas2dCtx = ctx as unknown as CanvasRenderingContext2D;

    // Set font properties
    canvas2dCtx.font = `${fontSize}px ${this.fontName}`;
    canvas2dCtx.fillStyle = `rgb(${Math.floor(this.textColor.r * 255)}, ${Math.floor(this.textColor.g * 255)}, ${Math.floor(this.textColor.b * 255)})`;
    canvas2dCtx.textAlign = 'center';
    canvas2dCtx.textBaseline = 'middle';

    // Draw the text in the center
    canvas2dCtx.fillText(text, 512, 256);

    // Update the texture
    this.textTexture.update();
  }

  // Create fade in animation
  private createFadeInAnimation(): Animation {
    const fadeIn = new Animation(
      'fadeIn',
      'visibility',
      30, // frames per second
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keyFrames = [];
    keyFrames.push({ frame: 0, value: 0 });
    keyFrames.push({ frame: 20, value: 1 });

    fadeIn.setKeys(keyFrames);
    return fadeIn;
  }

  // Create fade out animation
  private createFadeOutAnimation(): Animation {
    const fadeOut = new Animation(
      'fadeOut',
      'visibility',
      30, // frames per second
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keyFrames = [];
    keyFrames.push({ frame: 0, value: 1 });
    keyFrames.push({ frame: 20, value: 0 });

    fadeOut.setKeys(keyFrames);
    return fadeOut;
  }

  // Show text with fade in effect
  public showText(
    text: string,
    duration: number = 2000,
    fontSize: number = this.fontSize,
    playSound: boolean = false
  ): void {
    if (!this.textMesh || !this.textTexture) return;

    // Stop any current animation
    if (this.currentAnimation && this.currentAnimationKey) {
      this.scene.stopAnimation(this.textMesh, this.currentAnimationKey);
    }

    // Draw the text
    this.drawText(text, fontSize);

    // Create and start fade in animation
    const fadeIn = this.createFadeInAnimation();
    this.currentAnimation = fadeIn;
    this.currentAnimationKey = 'visibility';

    // Play sound effect if requested
    if (playSound) {
      switch (text) {
        case '3':
          this.soundManager.playCountDown3Sound();
          break;
        case '2':
          this.soundManager.playCountDown2Sound();
          break;
        case '1':
          this.soundManager.playCountDown1Sound();
          break;
        case 'PLAY':
          this.soundManager.playGameStartSound();
          break;
        case 'SCORE':
          this.soundManager.playScoreSound();
          break;
      }
    }

    // Start the animation
    this.scene.beginDirectAnimation(
      this.textMesh,
      [fadeIn],
      0,
      20,
      false,
      1,
      // When fade in completes, wait then fade out
      () => {
        setTimeout(() => {
          if (!this.textMesh) return;

          const fadeOut = this.createFadeOutAnimation();
          this.currentAnimation = fadeOut;

          this.scene.beginDirectAnimation(this.textMesh, [fadeOut], 0, 20, false);
        }, duration);
      }
    );
  }

  // Handle game status changes
  public handleGameStatus(
    gameStatus: GameStatus,
    prevStatus: GameStatus | null,
    countdown?: number
  ): void {
    if (prevStatus === 'countdown' && gameStatus === 'playing') {
      this.showText('PLAY', 800, this.fontSize, true);
    } else if (prevStatus === 'playing' && gameStatus === 'waiting') {
      this.showText('SCORE', 800, this.fontSize, true);
    } else if (
      gameStatus === 'countdown' &&
      countdown !== undefined &&
      countdown <= 3 &&
      countdown >= 1
    ) {
      this.showText(countdown.toString(), 500, this.fontSize, true);
    }
  }

  // Dispose resources
  public dispose(): void {
    if (this.textMesh) {
      this.textMesh.dispose();
      this.textMesh = null;
    }

    if (this.textTexture) {
      this.textTexture.dispose();
      this.textTexture = null;
    }
  }
}

// Export function to create a text manager
export function createGameTextManager(scene: Scene, textColor: Color3): GameTextManager {
  return new GameTextManager(scene, textColor);
}
