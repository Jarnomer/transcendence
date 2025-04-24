import { Effect } from 'babylonjs';

export function registerRetroShaders() {
  Effect.ShadersStore['enhancedScanlinesVertexShader'] = `
    precision highp float;
    attribute vec2 position;
    varying vec2 vUV;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
      vUV = position * 0.5 + 0.5;
    }
  `;

  Effect.ShadersStore['enhancedScanlinesFragmentShader'] = `
    precision highp float;
    varying vec2 vUV;
    uniform sampler2D textureSampler;
    uniform float time;
    uniform vec2 screenSize;
    uniform float scanlineIntensity;
    uniform float scanlineDensity;
    uniform float scanlineSpeed;
    uniform float noise;
    uniform float vignette;
    uniform float flickerAmount;
    uniform float colorBleed;

    // Random function
    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUV;
      vec4 color = texture2D(textureSampler, uv);

      // ------------ SCANLINES ------------
      // Dynamic scanline frequency based on density
      float scanlineFreq = screenSize.y * scanlineDensity;

      // Moving scanlines with speed control
      float timeShift = time * scanlineSpeed;

      // Add some noise to scanlines if noise parameter > 0
      float scanlineNoise = (noise > 0.0) ? rand(vec2(uv.y * 100.0, time)) * noise : 0.0;

      // Main scanline effect with noise
      float scanline = sin(uv.y * scanlineFreq - timeShift + scanlineNoise) * 0.5 + 0.5;
      scanline = pow(scanline, 1.2) * scanlineIntensity;

      // Apply scanline darkening
      color.rgb *= (1.0 - scanline);

      // ------------ COLOR BLEED ------------
      if (colorBleed > 0.0) {
        float rgbOffset = colorBleed * 0.01;
        color.r = texture2D(textureSampler, vec2(uv.x + rgbOffset, uv.y)).r;
        color.b = texture2D(textureSampler, vec2(uv.x - rgbOffset, uv.y)).b;
      }

      // ------------ VIGNETTE ------------
      if (vignette > 0.0) {
        float vignetteAmount = length(vec2(0.5, 0.5) - uv) * vignette;
        vignetteAmount = pow(vignetteAmount, 1.5);
        color.rgb *= (1.0 - vignetteAmount);
      }

      // ------------ FLICKER ------------
      if (flickerAmount > 0.0) {
        float flicker = 1.0 - (rand(vec2(time * 4.0, 0.0)) * flickerAmount);
        color.rgb *= flicker;
      }

      gl_FragColor = color;
    }
  `;

  Effect.ShadersStore['glitchEffectVertexShader'] = `
  precision highp float;
  attribute vec2 position;
  varying vec2 vUV;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    vUV = position * 0.5 + 0.5;
  }
`;

  Effect.ShadersStore['glitchEffectFragmentShader'] = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D textureSampler;
  uniform float time;
  uniform float trackingNoiseAmount;
  uniform float staticNoiseAmount;
  uniform float distortionAmount;
  uniform float colorBleedAmount;

  float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // Calculate timing for various effects
    float glitchTime = time * 2.0;
    float jitterTime = floor(time * 4.0);

    // Base UV coordinates
    vec2 uv = vUV;

    // ------------ DISTORTION ------------
    if (distortionAmount > 0.0) {
      // Create horizontal jitter with higher intensity
      float jitterNoise = rand(vec2(jitterTime, 2.0));
      float jitterAmount = rand(vec2(jitterTime, uv.y * 100.0)) * distortionAmount * 0.1;
      uv.x += jitterAmount * sin(time * 50.0);

      // Add vertical distortion
      float verticalDistortion = sin(uv.y * 20.0 + time * 5.0) * distortionAmount * 0.05;
      uv.y += verticalDistortion;

      // Large glitch jumps at random intervals
      float bigGlitchTime = floor(time);
      float bigGlitch = rand(vec2(bigGlitchTime, 5.0));
      if (bigGlitch > 0.8) {
        float jumpOffset = rand(vec2(bigGlitchTime, 8.0)) * distortionAmount * 0.2;
        uv.x += (rand(vec2(uv.y, bigGlitchTime)) - 0.5) * jumpOffset;

        // Create block shifts
        float blockSize = 0.1;
        float blockY = floor(uv.y / blockSize) * blockSize;
        float blockShift = (rand(vec2(blockY, bigGlitchTime)) - 0.5) * jumpOffset * 2.0;

        if (rand(vec2(blockY, bigGlitchTime + 1.0)) > 0.7) {
          uv.x += blockShift;
        }
      }
    }

    // ------------ TRACKING NOISE ------------
    if (trackingNoiseAmount > 0.0) {
      // Create more intense tracking noise
      float trackingPos = fract(glitchTime + uv.y * 5.0);

      // Add tracking noise bands with higher density
      if (trackingPos < 0.2) {
        float trackingNoise = smoothstep(0.0, 0.2, trackingPos) * trackingNoiseAmount;
        float yOffset = pow(1.0 - trackingPos * 5.0, 2.0) * 0.02 * trackingNoiseAmount;
        float xOffset = (rand(vec2(time, floor(uv.y * 200.0))) * 2.0 - 1.0) * 0.04 * trackingNoiseAmount;

        uv.y += yOffset;
        uv.x += xOffset;
      }
    }

    // ------------ COLOR SAMPLING ------------
    vec4 color;

    // Check if UV coordinates are still valid
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      color = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
      // Apply stronger RGB color shift/bleeding
      if (colorBleedAmount > 0.0) {
        float bleedOffset = 0.004 * colorBleedAmount;
        color.r = texture2D(textureSampler, vec2(uv.x + bleedOffset, uv.y - bleedOffset)).r;
        color.g = texture2D(textureSampler, uv).g;
        color.b = texture2D(textureSampler, vec2(uv.x - bleedOffset, uv.y + bleedOffset)).b;
        color.a = 1.0;
      } else {
        color = texture2D(textureSampler, uv);
      }

      // ------------ STATIC NOISE ------------
      if (staticNoiseAmount > 0.0) {
        float staticNoise = rand(vec2(uv.x * time * 10.0, uv.y * time * 10.0)) * staticNoiseAmount;
        color.rgb = mix(color.rgb, vec3(staticNoise), staticNoiseAmount * 0.4);

        // Add scan lines with noise
        float scanline = sin(uv.y * 200.0 + time * 30.0) * 0.1 * staticNoiseAmount;
        color.rgb *= (1.0 - scanline);
      }

      // Create more white noise lines
      if (staticNoiseAmount > 0.0) {
        float lineNoise = rand(vec2(floor(time * 15.0), floor(uv.y * 200.0)));
        if (lineNoise > 0.93) {
          color.rgb += vec3(0.2) * staticNoiseAmount;
        }
      }
    }

    gl_FragColor = color;
  }
`;

  Effect.ShadersStore['vhsEffectVertexShader'] = `
    precision highp float;
    attribute vec2 position;
    varying vec2 vUV;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
      vUV = position * 0.5 + 0.5;
    }
  `;

  Effect.ShadersStore['vhsEffectFragmentShader'] = `
    precision highp float;
    varying vec2 vUV;
    uniform sampler2D textureSampler;
    uniform float time;
    uniform float trackingNoiseAmount;
    uniform float staticNoiseAmount;
    uniform float distortionAmount;
    uniform float colorBleedAmount;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      // Calculate timing for various effects
      float trackingTime = time * 0.5;
      float jitterTime = floor(time * 2.5);

      // Base UV coordinates
      vec2 uv = vUV;

      // ------------ HORIZONTAL JITTER ------------
      if (distortionAmount > 0.0) {
        // Create horizontal jitter at random times
        float jitterNoise = rand(vec2(jitterTime, 2.0));
        if (jitterNoise > 0.8) {
          float jitterAmount = rand(vec2(jitterTime, uv.y * 100.0)) * distortionAmount * 0.05;
          uv.x += jitterAmount;
        }

        // Large distortions at random intervals
        float bigJumpTime = floor(time * 0.5);
        float bigJump = rand(vec2(bigJumpTime, 5.0));
        if (bigJump > 0.97) {
          float jumpOffset = rand(vec2(bigJumpTime, 8.0)) * distortionAmount * 0.1;
          uv.y += (rand(vec2(uv.y, bigJumpTime)) - 0.5) * jumpOffset;
        }
      }

      // ------------ TRACKING NOISE ------------
      if (trackingNoiseAmount > 0.0) {
        // Create tracking noise bands that move up the screen
        float trackingPos = fract(trackingTime + uv.y * 3.0);

        // Add some tracking noise bands at random positions
        if (trackingPos < 0.1) {
          float trackingNoise = smoothstep(0.0, 0.1, trackingPos) * trackingNoiseAmount;
          float yOffset = pow(1.0 - trackingPos * 10.0, 3.0) * 0.01 * trackingNoiseAmount;

          // Randomize x offset based on y position
          float xOffset = (rand(vec2(time, floor(uv.y * 100.0))) * 2.0 - 1.0) * 0.02 * trackingNoiseAmount;

          uv.y += yOffset;
          uv.x += xOffset;
        }
      }

      // ------------ COLOR SAMPLING ------------
      // Base color - this will be modified by effects
      vec4 color;

      // Check if UV coordinates are still valid
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        color = vec4(0.0, 0.0, 0.0, 1.0);
      } else {
        // Apply RGB color bleed/shift
        if (colorBleedAmount > 0.0) {
          float bleedOffset = 0.002 * colorBleedAmount;
          color.r = texture2D(textureSampler, vec2(uv.x + bleedOffset, uv.y)).r;
          color.g = texture2D(textureSampler, uv).g;
          color.b = texture2D(textureSampler, vec2(uv.x - bleedOffset, uv.y)).b;
          color.a = 1.0;
        } else {
          color = texture2D(textureSampler, uv);
        }

        // ------------ STATIC NOISE ------------
        if (staticNoiseAmount > 0.0) {
          float staticNoise = rand(vec2(uv.x * time, uv.y * time)) * staticNoiseAmount;
          color.rgb = mix(color.rgb, vec3(staticNoise), staticNoiseAmount * 0.2);
        }

        // Create occasional horizontal white noise lines
        if (staticNoiseAmount > 0.0) {
          float lineNoise = rand(vec2(floor(time * 8.0), floor(uv.y * 100.0)));
          if (lineNoise > 0.97) {
            color.rgb += vec3(0.1) * staticNoiseAmount;
          }
        }
      }

      gl_FragColor = color;
    }
  `;

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
    uniform float vignette;
    uniform float colorBleed;
    uniform float time;

    vec2 distort(vec2 p, vec2 curvatureStrength) {
      // Convert to -1.0 to 1.0 range
      vec2 p2 = p * 2.0 - 1.0;

      // Apply curvature - MODIFIED: now using multiplication instead of division
      // Higher values of curvatureStrength = more distortion
      // Zero = no distortion
      vec2 offset = abs(p2.yx) * curvatureStrength;
      p2 = p2 + p2 * offset * offset;

      // Convert back to 0.0 to 1.0 range
      return p2 * 0.5 * 1.05 + 0.5;
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
      float scanlineFreq = 400.0;
      float scanline = sin(uv.y * scanlineFreq) * 0.5 + 0.5;
      scanline = pow(scanline, 1.5) * scanlineIntensity;
      color.rgb *= (0.95 - scanline);

      // Vignette effect
      if (vignette > 0.0) {
        float vignetteAmount = length(vec2(0.5, 0.5) - uv) * vignette;
        vignetteAmount = pow(vignetteAmount, 1.5);
        color.rgb *= (1.0 - vignetteAmount);
      }

      // Color bleeding
      if (colorBleed > 0.0) {
        float rgbOffset = colorBleed * 0.01;
        color.r = texture2D(textureSampler, vec2(uv.x + rgbOffset, uv.y)).r;
        color.b = texture2D(textureSampler, vec2(uv.x - rgbOffset, uv.y)).b;
      }

      gl_FragColor = color;
    }
  `;
}
