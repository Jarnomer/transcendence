import { Color3 } from 'babylonjs';

// Color parser that handles converts color formats to Color3
export function parseColor(colorValue: string): Color3 {
  // Handle named colors with a simple map
  const namedColors: Record<string, Color3> = {
    black: new Color3(0, 0, 0),
    // Add more named colors as needed
  };

  // Trim the color value
  colorValue = colorValue.trim();

  // Handle empty values
  if (!colorValue) {
    return new Color3(1, 1, 1); // Default to white
  }

  // Handle hex colors
  if (colorValue.startsWith('#')) {
    return hexToColor3(colorValue);
  }

  // Handle OKLCH colors
  if (colorValue.toLowerCase().startsWith('oklch')) {
    return oklchToColor3(colorValue);
  }

  // Handle RGB colors
  if (colorValue.toLowerCase().startsWith('rgb')) {
    return rgbToColor3(colorValue);
  }

  // Handle HSL colors
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

/**
 * Converts OKLCH color values to a Babylon.js Color3 (RGB).
 *
 * OKLCH is a perceptually uniform color space:
 * - L: Lightness (0-100%)
 * - C: Chroma (saturation/colorfulness)
 * - H: Hue (angle in degrees, 0-360)
 */
// Converts OKLCH color values to a Babylon.js Color3
export function oklchToColor3(colorValue: string): Color3 {
  const okLchRegex = /oklch\(\s*([0-9.]+)%\s+([0-9.]+)\s+([0-9.]+)\s*\)/;
  const matches = colorValue.match(okLchRegex);

  if (!matches) {
    console.warn(`Failed to parse OKLCH color: ${colorValue}`);
    return new Color3(1, 1, 1); // Return white as fallback
  }

  // Extract the three components
  const lightness = parseFloat(matches[1]) / 100; // Convert to 0-1 range
  const chroma = parseFloat(matches[2]);
  const hue = parseFloat(matches[3]);

  // Convert from OKLCH to OKLAB
  // OKLAB is an intermediate perceptually uniform color space
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
}

// Convert hex color to Babylon.js Color3
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

// Convert RGB color to Babylon.js Color3
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

// Convert HSL color to Babylon.js Color3
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
