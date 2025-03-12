import React from 'react';

// Define the type for the props
interface RadialBackgroundProps {
  dominantColor: string | null;
}

export const RadialBackground: React.FC<RadialBackgroundProps> = ({ dominantColor }) => {
  if (!dominantColor) return null;

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
      className="absolute animate-[pulse_5s_ease-in-out_infinite] inset-0 z-0 w-full h-full opacity-30 pointer-events-none overflow-hidden"
      style={{
        background: gradientBackground,
      }}
    ></div>
  );
};
