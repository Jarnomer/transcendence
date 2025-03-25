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

  // Effect.ShadersStore['crtDistortionFragmentShader'] = `
  //   precision highp float;
  //   varying vec2 vUV;
  //   uniform sampler2D textureSampler;
  //   uniform vec2 curvature;
  //   uniform float scanlineIntensity;
  //   uniform float vignette;
  //   uniform float colorBleed;
  //   uniform float time;

  //   vec2 distort(vec2 p, vec2 curvature) {
  //     // Convert to -1.0 to 1.0 range
  //     vec2 p2 = p * 2.0 - 1.0;

  //     // Apply curvature
  //     vec2 offset = abs(p2.yx) / curvature;
  //     p2 = p2 + p2 * offset * offset;

  //     // Convert back to 0.0 to 1.0 range
  //     return p2 * 0.5 + 0.5;
  //   }

  //   void main() {
  //     // Apply CRT curvature distortion
  //     vec2 uv = distort(vUV, curvature);

  //     // If outside of texture bounds, return black
  //     if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
  //       gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  //       return;
  //     }

  //     vec4 color = texture2D(textureSampler, uv);

  //     // Scanline effect
  //     float scanlineFreq = 400.0;
  //     float scanline = sin(uv.y * scanlineFreq) * 0.5 + 0.5;
  //     scanline = pow(scanline, 1.5) * scanlineIntensity;
  //     color.rgb *= (0.95 - scanline);

  //     // Vignette effect
  //     if (vignette > 0.0) {
  //       float vignetteAmount = length(vec2(0.5, 0.5) - uv) * vignette;
  //       vignetteAmount = pow(vignetteAmount, 1.5);
  //       color.rgb *= (1.0 - vignetteAmount);
  //     }

  //     // Color bleeding
  //     if (colorBleed > 0.0) {
  //       float rgbOffset = colorBleed * 0.01;
  //       color.r = texture2D(textureSampler, vec2(uv.x + rgbOffset, uv.y)).r;
  //       color.b = texture2D(textureSampler, vec2(uv.x - rgbOffset, uv.y)).b;
  //     }

  //     gl_FragColor = color;
  //   }
  // `;

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
    vec4 color = texture2D(textureSampler, uv);

    if (turnOffProgress < 0.2) {
      // Initial vertical collapse and increased noise
      float initialNoise = rand(vec2(uv.x * time, uv.y * time)) * noise * turnOffProgress * 5.0;
      color.rgb = mix(color.rgb, vec3(initialNoise), turnOffProgress * 2.0);

      // Light flicker at start of turn off
      float flicker = 1.0 - 0.2 * sin(time * 50.0 * turnOffProgress);
      color.rgb *= flicker;
    }
    else if (turnOffProgress < 0.5) {
      // Picture degradation phase
      float verticalCollapse = (turnOffProgress - 0.2) / 0.3; // 0 to 1 for this phase

      // Shrink the picture vertically from center
      float collapse = 1.0 - verticalCollapse * 0.5;
      float normalizedY = ((uv.y - 0.5) / collapse) + 0.5;

      if (normalizedY >= 0.0 && normalizedY <= 1.0) {
        color = texture2D(textureSampler, vec2(uv.x, normalizedY));
      } else {
        color = vec4(0.0, 0.0, 0.0, 1.0);
      }

      // Add distortions
      float distortion = sin(normalizedY * 20.0 + time * 10.0) * 0.03 * verticalCollapse;
      if (normalizedY >= 0.0 && normalizedY <= 1.0) {
        color.r = texture2D(textureSampler, vec2(uv.x + distortion, normalizedY)).r;
        color.b = texture2D(textureSampler, vec2(uv.x - distortion, normalizedY)).b;
      }

      // Add growing darkness
      color.rgb *= max(0.0, 1.0 - verticalCollapse * 0.7);
    }
    else if (turnOffProgress < 0.7) {
      // Extreme collapse to a horizontal line
      float extremeCollapse = (turnOffProgress - 0.5) / 0.2; // 0 to 1 for this phase
      float lineSize = 1.0 - extremeCollapse;
      float distFromCenter = abs(uv.y - 0.5);

      if (distFromCenter < lineSize * 0.1) {
        float sampleY = 0.5;
        color = texture2D(textureSampler, vec2(uv.x, sampleY));

        // Line brightness decreases
        color.rgb *= max(0.0, 1.0 - extremeCollapse * 0.8);

        // Add some bright horizontal scan distortion
        float scanIntensity = sin(uv.x * 50.0 + time * 20.0) * 0.4 + 0.6;
        color.rgb *= scanIntensity;
      } else {
        color = vec4(0.0, 0.0, 0.0, 1.0);
      }

      // Brightness fade
      color.rgb *= (1.0 - extremeCollapse);
    }
    else {
      // Final dot/light collapse
      float finalCollapse = (turnOffProgress - 0.7) / 0.3;

      // Create a small bright dot in the center that fades out
      float dotRadius = 0.05 * (1.0 - finalCollapse);
      float distFromCenter = length(uv - vec2(0.5, 0.5));

      if (distFromCenter < dotRadius) {
        // White to blue-ish dot that fades out
        float intensity = 1.0 - (distFromCenter / dotRadius);
        color = vec4(intensity * (1.0 - finalCollapse),
                    intensity * (1.0 - finalCollapse),
                    intensity * (1.0 - finalCollapse * 0.7),
                    1.0);
      } else {
        color = vec4(0.0, 0.0, 0.0, 1.0);
      }
    }

    gl_FragColor = color;
  }
`;
}
