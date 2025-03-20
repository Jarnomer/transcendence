import React, { useEffect, useState } from 'react';

import { Vibrant } from 'node-vibrant/browser';

// Define the type for the props
interface RadialBackgroundProps {
  avatar_url: string | null;
}

export const RadialBackground: React.FC<RadialBackgroundProps> = ({ avatar_url }) => {
  const [dominantColor, setDominantColor] = useState<string>();

  useEffect(() => {
    if (!avatar_url) return null;
    const extractDominantColor = async () => {
      const imageUrl = `https://localhost:8443/${avatar_url}`;
      try {
        Vibrant.from(imageUrl)
          .getPalette()
          .then((palette) => {
            const vibrantColor = palette.Vibrant._rgb; // Get the RGB values for the Vibrant swatch
            const vibrantBgColor = `rgb(${vibrantColor[0]}, ${vibrantColor[1]}, ${vibrantColor[2]})`; // Convert to CSS format
            setDominantColor(vibrantBgColor); // Update the state with the vibrant background color
          });
      } catch (error) {
        console.error('Error extracting dominant color: ', error);
      }
    };
    extractDominantColor();
  }, [avatar_url]);

  // TRIED DO MA
  const animationStyle = `
    @keyframes move-radial {
      0% {
        background: radial-gradient(circle at 50% 50%, ${dominantColor} 5%, rgba(0, 0, 0, 0) 80%);
      }
      25% {
        background: radial-gradient(circle at 100% 0%, ${dominantColor} 5%, rgba(0, 0, 0, 0) 80%);
      }
      50% {
        background: radial-gradient(circle at 50% 100%, ${dominantColor} 5%, rgba(0, 0, 0, 0) 80%);
      }
      75% {
        background: radial-gradient(circle at 0% 50%, ${dominantColor} 5%, rgba(0, 0, 0, 0) 80%);
      }
      100% {
        background: radial-gradient(circle at 50% 50%, ${dominantColor} 5%, rgba(0, 0, 0, 0) 80%);
      }
    }
  `;

  const gradientBackground = dominantColor
    ? `radial-gradient(circle at 50% 50%, ${dominantColor} 5%, rgba(0, 0, 0, 0) 80%)`
    : 'none';

  return (
    <div
      id="radial-bg"
      className="absolute animate-[pulse_5s_ease-in-out_infinite] inset-0 z-0 w-full h-full opacity-30 pointer-events-none"
      style={{
        background: gradientBackground,
      }}
    ></div>
  );
};
