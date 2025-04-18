import React, { useEffect, useState } from 'react';

import { Vibrant } from 'node-vibrant/browser';

// Define the type for the props
interface RadialBackgroundProps {
  avatar_url: string | undefined;
}

export const RadialBackground: React.FC<RadialBackgroundProps> = ({ avatar_url }) => {
  const [dominantColor, setDominantColor] = useState<string>();

  useEffect(() => {
    if (!avatar_url) return;
    const extractDominantColor = async () => {
      const imageUrl = `https://localhost:8443/${avatar_url}`;
      try {
        Vibrant.from(imageUrl)
          .getPalette()
          .then((palette) => {
            const vibrantColor = palette.Vibrant?._rgb; // Get the RGB values for the Vibrant swatch
            const vibrantBgColor = `rgb(${vibrantColor[0]}, ${vibrantColor[1]}, ${vibrantColor[2]})`; // Convert to CSS format
            setDominantColor(vibrantBgColor); // Update the state with the vibrant background color
          });
      } catch (error) {
        console.error('Error extracting dominant color: ', error);
      }
    };
    extractDominantColor();
  }, [avatar_url]);

  const gradientBackground = dominantColor
    ? `radial-gradient(circle at 50% 50%, ${dominantColor} 5%, rgba(0, 0, 0, 0) 80%)`
    : 'none';

  if (!gradientBackground) return <></>;

  return (
    <div
      id="radial-bg"
      className="absolute top-0 left-0 w-screen h-screen animate-[pulse_5s_ease-in-out_infinite] inset-0 z-0 opacity-30 pointer-events-none"
      style={{
        background: gradientBackground,
      }}
    ></div>
  );
};
