import React, { useEffect } from 'react';

import {
  BoxDiv,
  PaddleBiggerIcon,
  PaddleFasterIcon,
  PaddleSlowerIcon,
  PaddleSmallerIcon,
  SpinPowerUp,
} from '@components/visual';

import { useSound } from '@hooks';

import { PowerUpType } from '@shared/types';

const powerUps = [
  PowerUpType.SmallerPaddle,
  PowerUpType.SlowerPaddle,
  PowerUpType.BiggerPaddle,
  PowerUpType.FasterPaddle,
  PowerUpType.MoreSpin,
];

const powerUpIcons: Record<string, React.ReactNode> = {
  [PowerUpType.SlowerPaddle]: <PaddleSlowerIcon />,
  [PowerUpType.FasterPaddle]: <PaddleFasterIcon />,
  [PowerUpType.BiggerPaddle]: <PaddleBiggerIcon />,
  [PowerUpType.SmallerPaddle]: <PaddleSmallerIcon />,
  [PowerUpType.MoreSpin]: <SpinPowerUp />,
};

type PowerUpSelectionProps = {
  isEnabled: boolean;
  isSpinEnabled: boolean;
  setIsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedPowerUps: string[];
  setSelectedPowerUps: React.Dispatch<React.SetStateAction<string[]>>;
};

export const PowerUpSelection: React.FC<PowerUpSelectionProps> = ({
  isEnabled,
  setIsEnabled,
  selectedPowerUps,
  setSelectedPowerUps,
  isSpinEnabled,
}) => {
  const playSelectPowerUpSound = useSound('/sounds/effects/select.wav');

  const handlePowerUpToggle = (powerUp: string) => {
    if (!isEnabled || (powerUp === PowerUpType.MoreSpin && !isSpinEnabled)) return;

    playSelectPowerUpSound();
    console.log(selectedPowerUps);
    setSelectedPowerUps((prev) =>
      prev.includes(powerUp) ? prev.filter((p) => p !== powerUp) : [...prev, powerUp]
    );
  };

  useEffect(() => {
    if (isEnabled) {
      setSelectedPowerUps((prev) => {
        // Only populate if empty
        if (prev.length === 0) {
          return powerUps;
        }
        return prev;
      });
    } else {
      setSelectedPowerUps([]);
    }
  }, []);

  const handleEnableToggle = () => {
    setIsEnabled((prev) => {
      const newEnabled = !prev;
      if (!newEnabled) {
        setSelectedPowerUps([]); // Clear all power-ups if disabling
      }
      return newEnabled;
    });
  };

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {powerUps.map((powerUp, index) => (
          <span
            key={powerUp}
            onClick={() => handlePowerUpToggle(powerUp)}
            className={`aspect-square text-center cursor-pointer ${selectedPowerUps.includes(powerUp) && isEnabled ? 'text-secondary' : !selectedPowerUps.includes(powerUp) && isEnabled ? 'hover:opacity-100 opacity-60' : !isEnabled ? 'text-gray-400/60' : ''} `}
          >
            <BoxDiv index={index} key={powerUp}>
              <div
                className={`aspect-square max-w-full max-h-full p-3 flex flex-col gap-2 text-center cursor-pointer ${selectedPowerUps.includes(powerUp) && isEnabled ? 'text-primary' : 'text-grey-500 opacity-60'}`}
              >
                <div className="">{powerUpIcons[powerUp] || <PaddleSlowerIcon />}</div>
              </div>
            </BoxDiv>
            <span className="text-secondary text-[10px]">{powerUp}</span>
          </span>
        ))}
      </div>
    </>
  );
};
