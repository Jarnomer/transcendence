import { Camera, Effect, PostProcess, Scene } from 'babylonjs';

export function registerCustomShaders() {
  // Scanlines effect shader
  Effect.ShadersStore['scanlinesVertexShader'] = `
    precision highp float;
    attribute vec2 position;
    varying vec2 vUV;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
      vUV = position * 0.5 + 0.5;
    }
  `;

  Effect.ShadersStore['scanlinesFragmentShader'] = `
    precision highp float;
    varying vec2 vUV;
    uniform sampler2D textureSampler;
    uniform float time;
    uniform vec2 screenSize;
    uniform float scanlineIntensity;

    void main() {
      vec2 uv = vUV;
      vec4 color = texture2D(textureSampler, uv);

      // Scanline effect
      float scanline = sin(uv.y * screenSize.y * 1.0 - time * 10.0) * 0.5 + 0.5;
      scanline = pow(scanline, 1.0) * scanlineIntensity;

      // Apply scanline
      color.rgb *= (1.0 - scanline);

      // Slight RGB separation
      float rgbOffset = 0.002;
      color.r += texture2D(textureSampler, vec2(uv.x + rgbOffset, uv.y)).r * 0.1;
      color.b += texture2D(textureSampler, vec2(uv.x - rgbOffset, uv.y)).b * 0.1;

      gl_FragColor = color;
    }
  `;

  // Glitch effect shader
  Effect.ShadersStore['glitchVertexShader'] = `
    precision highp float;
    attribute vec2 position;
    varying vec2 vUV;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
      vUV = position * 0.5 + 0.5;
    }
  `;

  Effect.ShadersStore['glitchFragmentShader'] = `
    precision highp float;
    varying vec2 vUV;
    uniform sampler2D textureSampler;
    uniform float time;
    uniform float amount;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUV;

      // Random glitch blocks
      float blockIntensity = amount * 0.1;
      float blockThreshold = 0.95 - amount * 0.15;
      float blockNoise = rand(floor(uv.yy * 10.0) + floor(time * 20.0));

      if (blockNoise > blockThreshold) {
        // Create block glitch
        float blockOffset = (blockNoise - blockThreshold) / (1.0 - blockThreshold) * blockIntensity;
        uv.x += blockOffset * (rand(vec2(time)) * 2.0 - 1.0);
      }

      // RGB shift
      float rgbOffset = amount * 0.01;
      float noise = rand(vec2(time * 0.001, uv.y * 0.2)) * 2.0 - 1.0;

      // Apply color channel shifting
      vec4 color;
      color.r = texture2D(textureSampler, vec2(uv.x + rgbOffset * noise, uv.y)).r;
      color.g = texture2D(textureSampler, uv).g;
      color.b = texture2D(textureSampler, vec2(uv.x - rgbOffset * noise, uv.y)).b;
      color.a = 1.0;

      // Random scan lines
      float scanLineNoise = rand(vec2(floor(uv.y * 40.0), time * 10.0));
      float scanLineIntensity = amount * 0.5;

      if (scanLineNoise > 0.97) {
        color.rgb *= 1.0 + scanLineIntensity;
      } else if (scanLineNoise < 0.03) {
        color.rgb *= 1.0 - scanLineIntensity;
      }

      gl_FragColor = color;
    }
  `;

  // CRT Distortion shader
  Effect.ShadersStore['crtDistortionVertexShader'] = `
    precision highp float;
    attribute vec2 position;
    varying vec2 vUV;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
      vUV = position * 0.5 + 0.5;
    }
  `;

  Effect.ShadersStore['crtDistortionFragmentShader'] = `
    precision highp float;
    varying vec2 vUV;
    uniform sampler2D textureSampler;
    uniform vec2 curvature;
    uniform float scanlineIntensity;

    vec2 distort(vec2 p, vec2 curvature) {
      // Convert to -1.0 to 1.0 range
      vec2 p2 = p * 2.0 - 1.0;

      // Apply curvature
      vec2 offset = abs(p2.yx) / curvature;
      p2 = p2 + p2 * offset * offset;

      // Convert back to 0.0 to 1.0 range
      return p2 * 0.5 + 0.5;
    }

    void main() {
      // Apply CRT curvature distortion
      vec2 uv = distort(vUV, curvature);

      // If outside of texture bounds, return black
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }

      vec4 color = texture2D(textureSampler, uv);

      // Scanline effect
      float scanline = sin(uv.y * 400.0) * 0.5 + 0.5;
      scanline = pow(scanline, 1.5) * scanlineIntensity;

      // Vignette effect
      float vignette = length(vec2(0.5, 0.5) - uv) * 1.0;
      vignette = 1.0 - vignette * vignette;

      // Apply effects
      color.rgb *= (0.95 - scanline);
      color.rgb *= vignette;

      // Slight color shift
      color.r *= 1.05;
      color.b *= 1.05;

      gl_FragColor = color;
    }
  `;
}

export function createScanlinesEffect(
  scene: Scene,
  camera: Camera,
  intensity: number = 0.3
): PostProcess {
  const scanlineEffect = new PostProcess(
    'scanlines',
    'scanlines',
    ['time', 'screenSize', 'scanlineIntensity'],
    null,
    1.0,
    camera
  );

  const engine = scene.getEngine();
  let time = 0;

  scanlineEffect.onApply = (effect) => {
    time += engine.getDeltaTime() / 1000.0;
    effect.setFloat('time', time);
    effect.setFloat2('screenSize', engine.getRenderWidth(), engine.getRenderHeight());
    effect.setFloat('scanlineIntensity', intensity);
  };

  return scanlineEffect;
}

export function createGlitchEffect(
  scene: Scene,
  camera: Camera
): { effect: PostProcess; setGlitchAmount: (amount: number) => void } {
  const glitchEffect = new PostProcess('glitch', 'glitch', ['time', 'amount'], null, 1.0, camera);

  const engine = scene.getEngine();
  let time = 0;
  let glitchAmount = 0;

  glitchEffect.onApply = (effect) => {
    time += engine.getDeltaTime() / 1000.0;
    effect.setFloat('time', time);
    effect.setFloat('amount', glitchAmount);
  };

  const setGlitchAmount = (amount: number) => {
    glitchAmount = Math.max(0, Math.min(1, amount));
  };

  return { effect: glitchEffect, setGlitchAmount };
}

export function createCRTEffect(
  scene: Scene,
  camera: Camera,
  curvatureAmount: number = 4.0,
  scanlineIntensity: number = 0.2
): PostProcess {
  const crtEffect = new PostProcess(
    'crtDistortion',
    'crtDistortion',
    ['curvature', 'scanlineIntensity'],
    null,
    1.0,
    camera
  );

  crtEffect.onApply = (effect) => {
    effect.setFloat2('curvature', curvatureAmount, curvatureAmount);
    effect.setFloat('scanlineIntensity', scanlineIntensity);
  };

  return crtEffect;
}
