import React from 'react';

import { BoxDiv } from '../../visual/svg/containers/SvgBoxContainer';

const powerUps = ['Speed Boost', 'Shield', 'Double Points', 'Freeze Opponent'];

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
          className={`aspect-square text-center cursor-pointer ${selectedPowerUps.includes(powerUp) ? 'text-primary' : ' opacity-40'}`}
        >
          <BoxDiv index={index} key={powerUp}>
            <div
              className={`aspect-square p-5 text-center cursor-pointer ${selectedPowerUps.includes(powerUp) ? 'text-primary' : 'text-grey'}`}
            >
              {powerUp}
              <img
                src={'./src/assets/images/powerup_no_bg.png'}
                className="object-contain p-5"
              ></img>
            </div>
          </BoxDiv>
        </span>
      ))}
    </div>
  );
};
