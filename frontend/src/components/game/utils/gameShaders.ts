import { Effect } from 'babylonjs';

export function registerRetroShaders() {
  // Scanlines effect with more parameters
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

  // VHS tracking and distortion effect
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

  // Phosphor dots/CRT pixel grid effect
  Effect.ShadersStore['phosphorDotsVertexShader'] = `
    precision highp float;
    attribute vec2 position;
    varying vec2 vUV;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
      vUV = position * 0.5 + 0.5;
    }
  `;

  Effect.ShadersStore['phosphorDotsFragmentShader'] = `
    precision highp float;
    varying vec2 vUV;
    uniform sampler2D textureSampler;
    uniform vec2 screenSize;
    uniform float dotSize;
    uniform float dotIntensity;
    uniform vec2 dotScale; // Allows for non-square pixels

    void main() {
      // Get base color
      vec4 color = texture2D(textureSampler, vUV);

      // Calculate pixel grid coordinates
      vec2 pixelCoord = vUV * screenSize;
      vec2 dotCoord = fract(pixelCoord / dotSize / dotScale);

      // Create RGB phosphor pattern
      vec3 dotMask = vec3(1.0);

      // Choose pattern type based on dotSize
      if (dotSize < 3.0) {
        // Aperture grille (vertical lines like Trinitron)
        float xCoord = fract(pixelCoord.x / (dotSize * 3.0));
        if (xCoord < 0.33) {
          dotMask = vec3(1.0, 0.5, 0.5); // R stronger
        } else if (xCoord < 0.66) {
          dotMask = vec3(0.5, 1.0, 0.5); // G stronger
        } else {
          dotMask = vec3(0.5, 0.5, 1.0); // B stronger
        }
      } else {
        // Classic RGB triad pattern
        float dist = length((dotCoord - 0.5) * dotScale);
        float circle = smoothstep(0.3, 0.6, dist);

        // Create RGB subpixel pattern
        vec2 triCoord = fract(pixelCoord / (dotSize * 3.0));
        float triPhase = floor(mod(pixelCoord.y / dotSize, 2.0)) * 0.5;
        float triX = fract(triCoord.x * 3.0 + triPhase);

        if (triX < 0.33) {
          dotMask.r = 1.0 - circle * dotIntensity;
        } else if (triX < 0.66) {
          dotMask.g = 1.0 - circle * dotIntensity;
        } else {
          dotMask.b = 1.0 - circle * dotIntensity;
        }
      }

      // Apply dot mask to color
      color.rgb *= mix(vec3(1.0), dotMask, dotIntensity);

      // Slightly boost overall brightness to compensate
      color.rgb *= 1.0 + (dotIntensity * 0.2);

      gl_FragColor = color;
    }
  `;

  // Add TV channel flipping/switching effect
  Effect.ShadersStore['tvSwitchVertexShader'] = `
    precision highp float;
    attribute vec2 position;
    varying vec2 vUV;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
      vUV = position * 0.5 + 0.5;
    }
  `;

  Effect.ShadersStore['tvSwitchFragmentShader'] = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D textureSampler;
  uniform float time;
  uniform float switchProgress; // 0 to 1
  uniform vec4 transitionColor;

  float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // Create a sinewave pattern for the rolling effect
  float sinewave(float y, float amplitude, float frequency, float speed) {
    return amplitude * sin(y * frequency + time * speed);
  }

  void main() {
    vec2 uv = vUV;
    vec4 baseColor = texture2D(textureSampler, uv);
    vec4 outputColor = baseColor;

    if (switchProgress > 0.0) {
      // Calculate phases for multi-stage transition
      float phase1 = smoothstep(0.0, 0.4, switchProgress); // Initial distortion
      float phase2 = smoothstep(0.3, 0.7, switchProgress); // Rolling collapse
      float phase3 = smoothstep(0.6, 1.0, switchProgress); // Final fade

      // HARDCODED VALUE: Rolling wave strength (1.0 = normal, 2.0 = stronger)
      float rollStrengthValue = 1.2;

      // Create rolling bands effect - stronger as transition progresses
      float rollingStrength = phase1 * 0.3 * rollStrengthValue;
      float rollSpeed = 15.0 + phase1 * 30.0;
      float rollFreq = 10.0 + phase1 * 40.0;

      // Multiple rolling waves with different frequencies
      float roll1 = sinewave(uv.y, 0.08 * rollingStrength, rollFreq, rollSpeed);
      float roll2 = sinewave(uv.y, 0.05 * rollingStrength, rollFreq * 2.0, -rollSpeed * 0.7);
      float roll3 = sinewave(uv.x, 0.03 * rollingStrength, rollFreq * 0.5, rollSpeed * 0.3);

      // Combined rolling effect
      vec2 rollingUV = vec2(
        uv.x + roll1 + roll3,
        uv.y + roll2
      );

      // Tracking noise lines that move vertically
      float trackingPos = fract(time * 0.5 + uv.y * 3.0);
      float trackingLine = step(0.97, trackingPos) * step(phase1, 0.5);

      // Vertical collapse animation
      float collapseAmount = phase2 * 0.8;
      float screenHeight = 1.0 - collapseAmount;

      // Create visible division in the screen with straight dark bar that has random vertical movement

      // Base position for the division line (center of screen)
      float baseDivisionPos = 0.5;

      // HARDCODED VALUES: Line jump frequency and amount (1.0 = normal, 2.0 = more/larger)
      float lineJumpFrequencyValue = 1.4;  // Make jumps more frequent
      float lineJumpAmountValue = 1.2;     // Make jumps slightly larger

      // Random vertical position changes
      // Use time-based random jumps for vertical movement
      float jumpTime = floor(time * 12.0 * lineJumpFrequencyValue);
      float jumpSeed1 = rand(vec2(jumpTime, 1.0));
      float jumpSeed2 = rand(vec2(jumpTime, 2.0));
      float jumpSeed3 = rand(vec2(jumpTime + 0.5, 1.5));

      // Create large jumps mixed with smaller jumps
      float largeJump = (jumpSeed1 * 2.0 - 1.0) * 0.2 * phase2 * lineJumpAmountValue;
      float smallJump = (jumpSeed2 * 2.0 - 1.0) * 0.05 * phase2 * lineJumpAmountValue;

      // Occasional very large jumps
      float extraLargeJump = 0.0;
      if (jumpSeed3 > 0.8) {
          extraLargeJump = (jumpSeed3 - 0.8) * 0.5 * phase2 * lineJumpAmountValue;
      }

      // Calculate final line position with random movement
      float divisionLinePos = baseDivisionPos + largeJump + smallJump + extraLargeJump;

      // Line thickness
      float divisionLineWidth = 0.08 * phase2;

      float inDivisionLine = step(divisionLinePos - divisionLineWidth/2.0, uv.y) *
                             step(uv.y, divisionLinePos + divisionLineWidth/2.0) *
                             phase2;

      // Heavy distortion
      float distortionAmount = min(phase1 * 2.0, 1.0) * rollStrengthValue;
      vec2 distortedUV = rollingUV;

      // Apply increasing distortion and compression
      if (phase2 > 0.0) {
        // Apply vertical compression
        float normalizedY = ((uv.y - (0.5 - screenHeight/2.0)) / screenHeight);

        // Increasing wave distortion during collapse
        float waveDistX = sin(normalizedY * 30.0 + time * 10.0) * 0.08 * phase2 * rollStrengthValue;
        float waveDistY = cos(uv.x * 20.0 + time * 8.0) * 0.05 * phase2 * rollStrengthValue;

        if (normalizedY >= 0.0 && normalizedY <= 1.0) {
          distortedUV = vec2(
            uv.x + waveDistX + roll1,
            normalizedY + waveDistY + roll2
          );
        } else {
          // Outside the collapsed area - black
          outputColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
      }

      // Apply increasing chromatic aberration
      float rgbOffset = 0.01 * distortionAmount;
      vec4 colorDistorted;

      // Check if we're in valid UV space
      if (distortedUV.x >= 0.0 && distortedUV.x <= 1.0 &&
          distortedUV.y >= 0.0 && distortedUV.y <= 1.0 &&
          inDivisionLine < 0.5) {

        // Apply color fringing/bleeding
        colorDistorted.r = texture2D(textureSampler, vec2(distortedUV.x + rgbOffset, distortedUV.y - rgbOffset)).r;
        colorDistorted.g = texture2D(textureSampler, distortedUV).g;
        colorDistorted.b = texture2D(textureSampler, vec2(distortedUV.x - rgbOffset, distortedUV.y + rgbOffset)).b;
        colorDistorted.a = 1.0;

        // Add VHS noise
        float staticNoise = rand(vec2(distortedUV.x * time * 10.0, distortedUV.y * time * 5.0)) * 0.3 * distortionAmount;
        colorDistorted.rgb = mix(colorDistorted.rgb, vec3(staticNoise), distortionAmount * 0.4);

        // Add occasional horizontal noise lines
        if (trackingLine > 0.0) {
          colorDistorted.rgb += vec3(0.8);
        }

        outputColor = colorDistorted;
      } else if (inDivisionLine > 0.0) {
        // Division line - darker with slight gradient and internal details
        float distFromCenter = abs(uv.y - divisionLinePos) / (divisionLineWidth/2.0);
        outputColor = vec4(0.0, 0.0, 0.0, 1.0);

        // Create bright edges on the division line
        float edgeGlow = smoothstep(0.8, 1.0, distFromCenter) * 0.3;

        // Create internal texture with scanlines and noise
        float scanline = sin(uv.y * 150.0 - time * 30.0) * 0.15 + 0.05;
        float horizNoise = rand(vec2(floor(uv.y * 50.0), time * 10.0)) * 0.1;

        // Horizontal streak effect inside the division line
        float streak =
            step(0.98, rand(vec2(floor(uv.y * 100.0), time))) *
            0.4 * (1.0 - distFromCenter);

        // Apply all effects to the division line
        outputColor.rgb += vec3(scanline * (1.0 - distFromCenter) +
                               edgeGlow + horizNoise + streak);
      }

      // Complete blackout at end of transition
      if (phase3 > 0.0) {
        float fadeToBlack = phase3;
        outputColor = mix(outputColor, vec4(0.0, 0.0, 0.0, 1.0), fadeToBlack);
      }
    }

    gl_FragColor = outputColor;
  }
  `;

  // Add CRT distortion effect with proper screen curvature
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
      return p2 * 0.5 * 1.01 + 0.5;
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

  // Add a CRT turn ON shader
  Effect.ShadersStore['crtTurnOnVertexShader'] = `
  precision highp float;
  attribute vec2 position;
  varying vec2 vUV;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    vUV = position * 0.5 + 0.5;
  }
`;

  Effect.ShadersStore['crtTurnOnFragmentShader'] = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D textureSampler;
  uniform float turnOnProgress; // 0 to 1
  uniform float time;
  uniform float noise;
  uniform float scanlineIntensity;
  uniform float flickerAmount;

  float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // Base color with black default
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
    vec2 uv = vUV;

    // Initial horizontal line expanding
    if (turnOnProgress < 0.3) {
      float lineSize = turnOnProgress * 3.0;
      float distFromCenter = abs(uv.y - 0.5);

      if (distFromCenter < lineSize * 0.05) {
        // Horizontal line
        float lineIntensity = 1.0 - (distFromCenter / (lineSize * 0.05));
        color = vec4(1.0, 1.0, 1.0, 1.0) * lineIntensity;
      }
    }
    // Screen expands from middle with scanlines
    else if (turnOnProgress < 0.7) {
      float expandProgress = (turnOnProgress - 0.3) / 0.4; // 0 to 1 during this phase
      float verticalExpand = expandProgress * 0.5; // How much to expand from center

      if (abs(uv.y - 0.5) < verticalExpand) {
        // Calculate UV for the expanded region
        float normalizedY = ((uv.y - (0.5 - verticalExpand)) / (2.0 * verticalExpand));
        vec2 expandedUV = vec2(uv.x, normalizedY);

        // Get texture but add heavy scanlines
        color = texture2D(textureSampler, expandedUV);

        // Strong scanlines effect during expansion
        float scanlineFreq = 100.0;
        float scanline = sin(expandedUV.y * scanlineFreq) * 0.4 + 0.6;
        color.rgb *= scanline;

        // Add noise during expansion
        float staticNoise = rand(vec2(expandedUV.x * time, expandedUV.y * time)) * noise * (1.0 - expandProgress);
        color.rgb = mix(color.rgb, vec3(staticNoise), (1.0 - expandProgress) * 0.5);

        // Add flicker during turn on
        float flicker = 1.0 - flickerAmount * (1.0 - expandProgress) * sin(time * 30.0);
        color.rgb *= flicker;

        // Edge glow
        float edgeGlow = smoothstep(0.0, 0.1, abs(normalizedY - 0.5) * 2.0);
        color.rgb += vec3(1.0, 1.0, 1.0) * (1.0 - edgeGlow) * (1.0 - expandProgress) * 0.5;
      }
    }
    // Final refinement phase
    else {
      float finalProgress = (turnOnProgress - 0.7) / 0.3; // 0 to 1 during this phase
      color = texture2D(textureSampler, uv);

      // Reduced scanlines and noise as it stabilizes
      float scanlineFreq = 100.0;
      float scanline = sin(uv.y * scanlineFreq) * 0.2 + 0.8;
      color.rgb *= mix(scanline, 1.0, finalProgress);

      // Reducing static noise
      float staticNoise = rand(vec2(uv.x * time, uv.y * time)) * noise * (1.0 - finalProgress);
      color.rgb = mix(color.rgb, vec3(staticNoise), (1.0 - finalProgress) * 0.2);

      // Subtle flicker that decreases
      float flicker = 1.0 - flickerAmount * (1.0 - finalProgress) * 0.5 * sin(time * 20.0);
      color.rgb *= flicker;

      // Brightness increase to normal
      color.rgb *= mix(0.8, 1.0, finalProgress);
    }

    gl_FragColor = color;
  }
`;

  // Add a CRT turn OFF shader
  Effect.ShadersStore['crtTurnOffVertexShader'] = `
  precision highp float;
  attribute vec2 position;
  varying vec2 vUV;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    vUV = position * 0.5 + 0.5;
  }
`;

  Effect.ShadersStore['crtTurnOffFragmentShader'] = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D textureSampler;
  uniform float turnOffProgress; // 0 to 1
  uniform float time;
  uniform float noise;

  float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = vUV;
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0); // Default black

    if (turnOffProgress < 0.3) {
      // Phase 1: Full screen with increasing noise and initial vertical collapse
      float phase1Progress = turnOffProgress / 0.3; // 0 to 1 for this phase

      // Apply ease-in curve to make collapse start slow and accelerate
      // Using cubic ease-in: progress^3
      float easedProgress = phase1Progress * phase1Progress * phase1Progress;

      // Calculate collapse factor - starts very slow, then accelerates
      float verticalCollapse = easedProgress * 0.35; // Controls how much vertical height is removed

      // Calculate the visible region - starts as full screen, shrinks toward center
      float visibleHalfHeight = 0.5 - verticalCollapse;

      // Check if pixel is in the visible region
      if (abs(uv.y - 0.5) <= visibleHalfHeight) {
        // Renormalize Y coordinate to sample from original texture
        float normalizedY = ((uv.y - 0.5) / visibleHalfHeight) * 0.5 + 0.5;
        color = texture2D(textureSampler, vec2(uv.x, normalizedY));

        // Add increasing noise as we progress - also follows the eased curve
        float noiseAmount = mix(phase1Progress * 0.5, easedProgress, 0.7) * noise;
        float staticNoise = rand(vec2(uv.x * time * 10.0, uv.y * time * 5.0)) * noiseAmount;
        color.rgb = mix(color.rgb, vec3(staticNoise), phase1Progress * 0.3);

        // Add slight color distortion/bleeding
        if (phase1Progress > 0.5) {
          float distortion = phase1Progress * 0.02;
          color.r = texture2D(textureSampler, vec2(uv.x + distortion, normalizedY)).r;
          color.b = texture2D(textureSampler, vec2(uv.x - distortion, normalizedY)).b;
        }

        // Add scan lines that get more pronounced - follows easing curve
        float scanlineIntensity = mix(phase1Progress * 0.3, easedProgress, 0.7);
        float scanline = sin(normalizedY * 100.0 + time * 10.0) * 0.1 * scanlineIntensity;
        color.rgb *= (1.0 - scanline);

        // Slight vignetting effect - follows easing curve
        float vignette = length(vec2(uv.x - 0.5, (uv.y - 0.5) / (1.0 - verticalCollapse))) * easedProgress;
        color.rgb *= (1.0 - vignette * 0.5);
      }

      // Add slight flickering - starts very subtle, increases with progress
      float flickerAmount = mix(phase1Progress * 0.4, easedProgress, 0.6);
      float flicker = 1.0 - 0.1 * sin(time * 20.0) * flickerAmount;
      color.rgb *= flicker;
    }
    else if (turnOffProgress < 0.6) {
      // Phase 2: Extreme vertical collapse to a horizontal line
      float phase2Progress = (turnOffProgress - 0.3) / 0.3; // 0 to 1 for this phase

      // Thickness of center line, gets thinner
      float lineThickness = 0.1 * (1.0 - phase2Progress * 0.9);

      // Distance from center line
      float distFromCenter = abs(uv.y - 0.5);

      if (distFromCenter < lineThickness) {
        // Calculate intensity based on distance from center
        float lineIntensity = 1.0 - (distFromCenter / lineThickness);
        lineIntensity = pow(lineIntensity, 1.2); // Sharpen the falloff slightly

        // Sample from the center of the screen with slight x distortion
        float xDistortion = sin(uv.x * 20.0 + time * 15.0) * 0.01 * phase2Progress;
        vec2 samplePos = vec2(uv.x + xDistortion, 0.5);

        // Get original color from the center of the screen
        vec4 originalColor = texture2D(textureSampler, samplePos);

        // Brighten the line as it gets thinner
        float brightness = mix(1.0, 2.5, phase2Progress);

        // Make it progressively whiter
        vec3 lineColor = mix(originalColor.rgb, vec3(1.0), phase2Progress * 0.7);

        // Apply intensity and brightness
        color.rgb = lineColor * lineIntensity * brightness;
        color.a = 1.0;

        // Add slight horizontal variation/noise
        float lineNoise = rand(vec2(uv.x * 50.0, time)) * 0.2 * phase2Progress;
        color.rgb *= (1.0 - lineNoise);

        // As we progress, start shortening the line from the edges
        if (phase2Progress > 0.5) {
          float shortenProgress = (phase2Progress - 0.5) * 2.0; // 0 to 1
          float maxWidth = 1.0 - shortenProgress * 0.4; // Controls how much the line shortens
          float distFromCenterX = abs(uv.x - 0.5) / 0.5; // 0 at center, 1 at edges

          if (distFromCenterX > maxWidth) {
            float edgeFade = (distFromCenterX - maxWidth) / (1.0 - maxWidth);
            color.rgb *= (1.0 - edgeFade);
          }
        }
      }
    }
    else {
      // Phase 3: Final bright dot
      float phase3Progress = (turnOffProgress - 0.6) / 0.4; // 0 to 1 for this phase

      // The line continues to shorten
      float lineMaxWidth = 0.6 * (1.0 - phase3Progress * 0.8);
      float lineThickness = 0.015 * (1.0 - phase3Progress * 0.8);
      float distFromCenterY = abs(uv.y - 0.5);
      float distFromCenterX = abs(uv.x - 0.5) / 0.5; // Normalized 0-1

      // Show the remaining line if we're in the first half of this phase
      if (phase3Progress < 0.5 && distFromCenterY < lineThickness && distFromCenterX < lineMaxWidth) {
        float lineBrightness = 1.0 - (distFromCenterY / lineThickness);
        lineBrightness = pow(lineBrightness, 1.5);

        // Line fades as we transition to the dot
        float lineFade = 1.0 - (phase3Progress * 2.0);
        color.rgb = vec3(1.0) * lineBrightness * lineFade * 2.0;
      }

      // Calculate dot parameters - starts small, grows slightly, then shrinks
      float dotPhase = phase3Progress * 3.0; // 0 to 3
      float dotSize = 0.0;
      float dotBrightness = 0.0;

      if (dotPhase < 1.0) {
        // Initial small dot
        dotSize = 0.02 + dotPhase * 0.03;
        dotBrightness = 2.0 + dotPhase * 1.0;
      }
      else if (dotPhase < 2.0) {
        // Slightly larger, brightest phase
        dotSize = 0.05 - (dotPhase - 1.0) * 0.01;
        dotBrightness = 3.0;
      }
      else {
        // Shrinking and fading
        dotSize = 0.04 - (dotPhase - 2.0) * 0.04;
        dotBrightness = 3.0 - (dotPhase - 2.0) * 3.0;
      }

      // Distance from screen center
      float dotDist = length(vec2(uv.x - 0.5, (uv.y - 0.5) * 1.2));

      if (dotDist < dotSize) {
        // Calculate intensity based on distance from center
        float dotIntensity = 1.0 - (dotDist / dotSize);
        dotIntensity = pow(dotIntensity, 1.5); // Sharper falloff

        // Apply the dot color (bright white)
        vec3 dotColor = vec3(1.0);

        // Combine with any existing color (line)
        color.rgb = mix(color.rgb, dotColor * dotBrightness, min(1.0, dotIntensity));
      }
    }

    gl_FragColor = color;
  }
`;

  // Dust and scratch effect shader
  Effect.ShadersStore['dustScratchVertexShader'] = `
  precision highp float;
  attribute vec2 position;
  varying vec2 vUV;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    vUV = position * 0.5 + 0.5;
  }
`;

  Effect.ShadersStore['dustScratchFragmentShader'] = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D textureSampler;
  uniform float time;
  uniform float dustAmount;
  uniform float scratchAmount;
  uniform float dustSize;
  uniform float edgeIntensity;
  uniform vec2 screenSize;
  uniform float movementSpeed;

  // Random function
  float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // Better hash function for more dynamic patterns
  float hash(vec2 p) {
    p = 50.0*fract(p*0.3183099 + vec2(0.71,0.113));
    return -1.0+2.0*fract(p.x*p.y*(p.x+p.y));
  }

  // Improved noise function for more natural patterns
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);

    return mix(mix(hash(i + vec2(0.0,0.0)),
                   hash(i + vec2(1.0,0.0)), u.x),
               mix(hash(i + vec2(0.0,1.0)),
                   hash(i + vec2(1.0,1.0)), u.x), u.y);
  }

  // Curved line function that creates more natural-looking scratches
  float curvedLine(vec2 uv, vec2 start, vec2 control, vec2 end, float width) {
    // Parametric time
    float t = 0.0;
    float minDist = 1.0;
    vec2 pt = vec2(0.0);

    // Test multiple points along the curve (quadratic bezier)
    for (int i = 0; i < 25; i++) {
      t = float(i) / 24.0; // 0 to 1

      // Quadratic bezier formula
      vec2 q0 = mix(start, control, t);
      vec2 q1 = mix(control, end, t);
      pt = mix(q0, q1, t);

      // Calculate distance to the current point
      float dist = length(uv - pt);
      minDist = min(minDist, dist);
    }

    // Create a smooth line with variable alpha
    float line = smoothstep(width, width * 0.5, minDist);

    // Add some variation in intensity along the line
    float variation = 0.7 + 0.3 * noise(pt * 50.0 + time * 2.0);

    return line * variation;
  }

  void main() {
    vec2 uv = vUV;
    vec4 color = texture2D(textureSampler, uv);

    // Faster time progression for more dynamic effect
    float fastTime = time * movementSpeed * 3.0;

    // ---------- DUST PARTICLES ----------
    float dust = 0.0;
    if (dustAmount > 0.0) {
      // Generate multiple layers of dust with various properties
      for (int i = 0; i < 4; i++) {
        // Each layer has different parameters
        float sizeMod = (float(i) * 0.5 + 1.0) * dustSize;
        float speedMod = 0.2 + float(i) * 0.2;

        // Faster movement with more erratic patterns
        vec2 movement = vec2(
          fastTime * speedMod * (0.5 + 0.5 * sin(fastTime * 0.1 + float(i))),
          fastTime * speedMod * 0.7 * (0.5 + 0.5 * cos(fastTime * 0.13 + float(i)))
        );

        // Base noise for this dust layer
        vec2 dustUV = uv * screenSize / (sizeMod * 8.0);
        float n1 = noise((dustUV + movement) * (1.0 + float(i) * 0.2));
        float n2 = noise((dustUV * 2.3 - movement * 0.8) * (1.2 + float(i) * 0.3));

        // Combine noise patterns for more varied dust
        float combined = n1 * n2 * 0.5 + 0.5;

        // Create dust with various thresholds for different sizes
        float baseThreshold = 0.95 - (float(i) * 0.02); // Larger particles for higher i
        float dustThreshold = baseThreshold + 0.02 * sin(dustUV.x * 10.0 + fastTime);

        // Create the dust effect with a sharp falloff
        float layerDust = smoothstep(dustThreshold, dustThreshold + 0.01, combined);

        // More dust toward edges
        float edgeFactor = length(vec2(0.5, 0.5) - uv);
        layerDust *= mix(0.8, 1.0 + edgeFactor * 2.0 * edgeIntensity, edgeIntensity);

        // Layer-specific intensity
        float intensity = 0.3 - float(i) * 0.05;
        dust += layerDust * intensity;
      }

      // Additional very small dust particles with faster movement
      vec2 microDustUV = uv * screenSize / (dustSize * 2.0);
      vec2 microMovement = vec2(fastTime * 0.3, fastTime * 0.25);
      float microNoise = noise(microDustUV * 5.0 + microMovement);

      float microDust = step(0.985, microNoise) * 0.15;
      dust += microDust;

      // Scale dust by amount parameter
      dust *= dustAmount;
    }

    // ---------- SCRATCHES ----------
    float scratches = 0.0;
    if (scratchAmount > 0.0) {
      // Remove long vertical scratches, replace with shorter segments
      for (int i = 0; i < 8; i++) {
        // Change scratch parameters with time
        float scratchTime = floor(fastTime * 0.8 + float(i * 3));
        float seed = float(i) * 10.0 + scratchTime * 0.1;

        // Random parameters for this scratch - no edge-to-edge lines
        float xPos = 0.2 + rand(vec2(seed, 2.0)) * 0.6; // Keep away from edges

        // Shorter scratch segments - only partial height
        float yStart = 0.2 + rand(vec2(seed, 3.0)) * 0.3; // Start in middle section
        float yEnd = yStart + 0.1 + rand(vec2(seed, 4.0)) * 0.3; // Never full height

        // Some curve but not too extreme
        float xControl = xPos + (rand(vec2(seed, 5.0)) * 2.0 - 1.0) * 0.05;
        float xEnd = xPos + (rand(vec2(seed, 6.0)) * 2.0 - 1.0) * 0.08;

        // Width varies along the scratch
        float baseWidth = (0.0008 + rand(vec2(seed, 7.0)) * 0.002) * scratchAmount;

        // Only show scratch if random value is high enough
        float scratchChance = rand(vec2(seed, 8.0));
        if (scratchChance > 0.6) {
          // Draw curved scratch
          float scratch = curvedLine(
            uv,
            vec2(xPos, yStart),
            vec2(xControl, (yStart + yEnd) * 0.5),
            vec2(xEnd, yEnd),
            baseWidth
          );

          // Vary intensity along the scratch
          float intensity = 0.6 + 0.4 * noise(vec2(uv.y * 20.0, fastTime));
          scratches += scratch * intensity;
        }
      }

      // Remove long horizontal scratches, replace with shorter segments
      for (int i = 0; i < 5; i++) {
        float scratchTime = floor(fastTime * 0.5 + float(i * 4));
        float seed = float(i) * 25.0 + scratchTime * 0.1;

        float yPos = 0.2 + rand(vec2(seed, 12.0)) * 0.6; // Keep away from top/bottom edges

        // Shorter scratch segments - only partial width
        float xStart = 0.2 + rand(vec2(seed, 13.0)) * 0.3; // Start in middle section
        float xEnd = xStart + 0.1 + rand(vec2(seed, 14.0)) * 0.3; // Never full width

        // Some curve but not extreme
        float yControl = yPos + (rand(vec2(seed, 15.0)) * 2.0 - 1.0) * 0.05;
        float yEnd = yPos + (rand(vec2(seed, 16.0)) * 2.0 - 1.0) * 0.08;

        float baseWidth = (0.0004 + rand(vec2(seed, 17.0)) * 0.001) * scratchAmount;

        float scratchChance = rand(vec2(seed, 18.0));
        if (scratchChance > 0.7) {
          float scratch = curvedLine(
            uv,
            vec2(xStart, yPos),
            vec2((xStart + xEnd) * 0.5, yControl),
            vec2(xEnd, yEnd),
            baseWidth
          );

          float intensity = 0.5 + 0.5 * noise(vec2(uv.x * 20.0, fastTime * 0.5));
          scratches += scratch * intensity;
        }
      }

      // Keep the short "dash" scratches - these are good
      for (int i = 0; i < 15; i++) { // Increased count to compensate for removed long scratches
        float scratchTime = floor(fastTime + float(i * 2));
        float seed = float(i) * 30.0 + scratchTime * 0.2;

        float xPos = 0.1 + rand(vec2(seed, 20.0)) * 0.8;
        float yPos = 0.1 + rand(vec2(seed, 21.0)) * 0.8;

        // Random length and direction but always short
        float angle = rand(vec2(seed, 22.0)) * 3.14159 * 2.0;
        float length = 0.02 + rand(vec2(seed, 23.0)) * 0.08; // Keep these shorter

        vec2 dir = vec2(cos(angle), sin(angle));
        vec2 start = vec2(xPos, yPos);
        vec2 control = start + dir * length * 0.5 + vec2(rand(vec2(seed, 24.0)), rand(vec2(seed, 25.0))) * 0.03;
        vec2 end = start + dir * length;

        float width = (0.0002 + rand(vec2(seed, 26.0)) * 0.0008) * scratchAmount;

        float scratchChance = rand(vec2(seed, 27.0));
        if (scratchChance > 0.4) { // Increased frequency
          float scratch = curvedLine(uv, start, control, end, width);
          scratches += scratch * 0.4;
        }
      }

      // Scale scratches by amount parameter
      scratches *= scratchAmount;
    }

    // ---------- COMBINED EFFECT ----------
    // Add dust and scratches to original image with a slight glow
    color.rgb += vec3(dust + scratches) * 1.2;

    gl_FragColor = color;
  }
`;
}
