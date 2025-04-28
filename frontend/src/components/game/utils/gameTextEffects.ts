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
  private fontSize: number = 200;
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

  private loadFont(): void {
    const fontFace = new FontFace('joystix monospace', 'url(/fonts/joystix_monospace.otf)');

    fontFace
      .load()
      .then((loadedFace) => {
        document.fonts.add(loadedFace);
        this.fontLoaded = true;
      })
      .catch((error) => {
        console.error('Error loading font:', error);
        console.error('Falling back to Arial...');
        this.fontName = 'Arial';
        this.fontLoaded = true;
      });
  }

  private createTextMesh(): void {
    this.textMesh = MeshBuilder.CreatePlane('textPlane', { width: 20, height: 10 }, this.scene);

    this.textMesh.position = new Vector3(0, 0, -5);
    this.textMesh.isPickable = false;

    this.textTexture = new DynamicTexture(
      'textTexture',
      { width: 2048, height: 1024 },
      this.scene,
      true
    );

    const textMaterial = new StandardMaterial('textMaterial', this.scene);

    textMaterial.diffuseTexture = this.textTexture;
    textMaterial.specularColor = new Color3(0, 0, 0);
    textMaterial.emissiveColor = this.textColor;
    textMaterial.disableLighting = true;
    textMaterial.diffuseTexture.hasAlpha = true;
    textMaterial.useAlphaFromDiffuseTexture = true;

    this.textMesh.material = textMaterial;

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

  private drawText(text: string, fontSize: number = this.fontSize): void {
    if (!this.textTexture || !this.fontLoaded) return;

    this.textTexture.clear();

    const ctx = this.textTexture.getContext() as unknown as CanvasRenderingContext2D;

    const fontString = `${fontSize}px ${this.fontName}`;
    ctx.font = fontString;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const colorString = `rgb(${Math.floor(this.textColor.r * 255)}, ${Math.floor(this.textColor.g * 255)}, ${Math.floor(this.textColor.b * 255)})`;
    ctx.fillStyle = colorString;

    ctx.fillText(text, 1024, 512);

    this.textTexture.update();
  }

  private createFadeInAnimation(): Animation {
    const frameRate = 30;

    const fadeIn = new Animation(
      'fadeIn',
      'visibility',
      frameRate,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keyFrames = [];
    keyFrames.push({ frame: 0, value: 0 });
    keyFrames.push({ frame: 20, value: 1 });

    fadeIn.setKeys(keyFrames);
    return fadeIn;
  }

  private createFadeOutAnimation(): Animation {
    const frameRate = 30;

    const fadeOut = new Animation(
      'fadeOut',
      'visibility',
      frameRate,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keyFrames = [];
    keyFrames.push({ frame: 0, value: 1 });
    keyFrames.push({ frame: 20, value: 0 });

    fadeOut.setKeys(keyFrames);
    return fadeOut;
  }

  public showText(
    text: string,
    duration: number = 800,
    fontSize: number = this.fontSize,
    playSound: boolean = false
  ): void {
    if (!this.textMesh || !this.textTexture) return;

    if (this.currentAnimation && this.currentAnimationKey) {
      this.scene.stopAnimation(this.textMesh, this.currentAnimationKey);
    }

    this.drawText(text, fontSize);

    const fadeIn = this.createFadeInAnimation();

    this.currentAnimation = fadeIn;
    this.currentAnimationKey = 'visibility';

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
      this.showText(countdown.toString(), 800, this.fontSize, true);
    }
  }

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

export function createGameTextManager(scene: Scene, textColor: Color3): GameTextManager {
  return new GameTextManager(scene, textColor);
}
