import { Color3 } from 'babylonjs';

export interface ThemeColors {
  primaryColor: Color3;
  secondaryColor: Color3;
  backgroundColor: Color3;
  gameboardColor: Color3;
  sceneBackgroundColor: Color3;
}

export function getThemeColors(
  primaryColorStr: string,
  secondaryColorStr: string,
  thirdColorStr: string,
  backgroundColorStr: string,
  gameboardColorStr: string,
  sceneBackgroundColorStr: string
) {
  const primaryColor = parseColor(primaryColorStr);
  const secondaryColor = parseColor(secondaryColorStr);
  const thirdColor = parseColor(thirdColorStr);
  const backgroundColor = parseColor(backgroundColorStr);
  const gameboardColor = parseColor(gameboardColorStr);
  const sceneBackgroundColor = parseColor(sceneBackgroundColorStr);

  return {
    primaryColor,
    secondaryColor,
    thirdColor,
    backgroundColor,
    gameboardColor,
    sceneBackgroundColor,
  };
}

export function parseColor(colorValue: string): Color3 {
  const namedColors: Record<string, Color3> = {
    black: new Color3(0, 0, 0),
  };

  colorValue = colorValue.trim();

  if (!colorValue) {
    return new Color3(1, 1, 1); // Default to white
  }

  if (colorValue.startsWith('#')) {
    return hexToColor3(colorValue);
  }

  if (colorValue.toLowerCase().startsWith('oklch')) {
    return oklchToColor3(colorValue);
  }

  if (colorValue.toLowerCase().startsWith('rgb')) {
    return rgbToColor3(colorValue);
  }

  if (colorValue.toLowerCase().startsWith('hsl')) {
    return hslToColor3(colorValue);
  }

  // Check if the color name exists in the map
  if (namedColors[colorValue.toLowerCase()]) {
    return namedColors[colorValue.toLowerCase()];
  }

  // Use white as default fallback
  console.warn(`Unsupported color format: ${colorValue}`);
  return new Color3(1, 1, 1);
}

export function oklchToColor3(colorValue: string): Color3 {
  try {
    // Remove the 'oklch(' prefix and ')' suffix
    const cleanedStr = colorValue
      .toLowerCase()
      .replace(/oklch\s*\(\s*/, '')
      .replace(/\s*\)$/, '');

    // Split by commas or whitespace
    const parts = cleanedStr.split(/[\s,]+/);

    if (parts.length < 3) {
      throw new Error(`Invalid OKLCH format: ${colorValue}`);
    }

    // Parse each component with proper handling of percentages
    let lightness = parseFloat(parts[0]);
    if (parts[0].includes('%')) {
      lightness /= 100; // Convert percentage to 0-1
    }

    let chroma = parseFloat(parts[1]);
    if (parts[1].includes('%')) {
      chroma /= 100; // Convert percentage to decimal
    }

    let hue = parseFloat(parts[2]);
    if (parts[2].includes('%')) {
      hue = hue * 3.6; // Convert percentage to degrees
    }

    // Ensure values are in expected ranges
    lightness = Math.max(0, Math.min(1, lightness)); // 0-1
    chroma = Math.max(0, chroma); // Non-negative
    hue = hue % 360; // 0-360

    // Convert from OKLCH to OKLAB
    const L = lightness;
    const A = chroma * Math.cos((hue * Math.PI) / 180); // Convert hue
    const B = chroma * Math.sin((hue * Math.PI) / 180); // Convert chroma

    // First, convert to an intermediate color space (LMS)
    const l = L + 0.3963377774 * A + 0.2158037573 * B;
    const m = L - 0.1055613458 * A - 0.0638541728 * B;
    const s = L - 0.0894841775 * A - 1.291485548 * B;

    // Then, apply nonlinear transformation (cube function)
    const lCubed = l * l * l;
    const mCubed = m * m * m;
    const sCubed = s * s * s;

    // Finally, convert to linear RGB
    let r = +4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed;
    let g = -1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed;
    let b = -0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.707614701 * sCubed;

    // Apply gamma correction and clamp values
    r = Math.max(0, Math.min(1, r));
    g = Math.max(0, Math.min(1, g));
    b = Math.max(0, Math.min(1, b));

    // Create and return Babylon.js Color3
    return new Color3(r, g, b);
  } catch (error) {
    console.warn(`Failed to parse OKLCH color: ${colorValue}`, error);
    return new Color3(1, 1, 1); // Return white as fallback
  }
}

function hexToColor3(hex: string): Color3 {
  hex = hex.replace('#', ''); // Remove # if present

  // Handle shorthand hex
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // Convert to RGB values between 0-1
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  return new Color3(r, g, b);
}

function rgbToColor3(rgb: string): Color3 {
  const rgbRegex = /rgb\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/;
  const matches = rgb.match(rgbRegex);

  if (!matches) {
    console.warn(`Failed to parse RGB color: ${rgb}`);
    return new Color3(1, 1, 1);
  }

  const r = parseInt(matches[1], 10) / 255;
  const g = parseInt(matches[2], 10) / 255;
  const b = parseInt(matches[3], 10) / 255;

  return new Color3(r, g, b);
}

function hslToColor3(hsl: string): Color3 {
  const hslRegex = /hsl\(\s*([0-9]+)\s*,\s*([0-9]+)%\s*,\s*([0-9]+)%\s*\)/;
  const matches = hsl.match(hslRegex);

  if (!matches) {
    console.warn(`Failed to parse HSL color: ${hsl}`);
    return new Color3(1, 1, 1);
  }

  const h = parseInt(matches[1], 10) / 360;
  const s = parseInt(matches[2], 10) / 100;
  const l = parseInt(matches[3], 10) / 100;

  let r, g, b; // Convert HSL to RGB

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return new Color3(r, g, b);
}
