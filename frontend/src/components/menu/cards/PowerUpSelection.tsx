import React from 'react';

import { BoxDiv } from '../../visual/svg/containers/SvgBoxContainer';
import { PaddleBiggerIcon } from '../../visual/svg/icons/PaddleBiggerIcon';
import { PaddleFasterIcon } from '../../visual/svg/icons/PaddleFasterIcont';
import { PaddleSlowerIcon } from '../../visual/svg/icons/PaddleSlowerIcon';
import { PaddleSmallerIcon } from '../../visual/svg/icons/PaddleSmallerIcon';

const powerUps = ['Paddle Slower', 'Paddle Smaller', 'Paddle Bigger', 'Paddle Faster'];

const powerUpIcons: Record<string, React.ReactNode> = {
  'Paddle Slower': <PaddleSlowerIcon />,
  'Paddle Faster': <PaddleFasterIcon />,
  'Paddle Bigger': <PaddleBiggerIcon />,
  'Paddle Smaller': <PaddleSmallerIcon />,
};

type PowerUpSelectionProps = {
  selectedPowerUps: string[];
  setSelectedPowerUps: React.Dispatch<React.SetStateAction<string[]>>;
};

export const PowerUpSelection: React.FC<PowerUpSelectionProps> = ({
  selectedPowerUps,
  setSelectedPowerUps,
}) => {
  const handlePowerUpToggle = (powerUp: string) => {
    console.log(selectedPowerUps);
    setSelectedPowerUps((prev) =>
      prev.includes(powerUp) ? prev.filter((p) => p !== powerUp) : [...prev, powerUp]
    );
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-2 border p-3 rounded">
      {powerUps.map((powerUp, index) => (
        <span
          key={powerUp}
          onClick={() => handlePowerUpToggle(powerUp)}
          className={`aspect-square text-center cursor-pointer ${selectedPowerUps.includes(powerUp) ? 'text-secondary' : 'hover:opacity-100 opacity-60'}`}
        >
          <BoxDiv index={index} key={powerUp}>
            <div
              className={`aspect-square max-w-full max-h-full p-3 flex flex-col gap-2 text-center cursor-pointer ${selectedPowerUps.includes(powerUp) ? 'text-primary' : 'text-grey'}`}
            >
              <div className="">{powerUpIcons[powerUp] || <PaddleSlowerIcon />}</div>
            </div>
          </BoxDiv>
          <span className="text-secondary text-[10px]">{powerUp}</span>
        </span>
      ))}
    </div>
  );
};
