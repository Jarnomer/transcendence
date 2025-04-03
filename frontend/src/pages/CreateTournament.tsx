import React, { useState } from 'react';

import { motion } from 'framer-motion';

import { ClippedButton } from '../components/UI/buttons/ClippedButton';
import { SvgBorderBig } from '../components/visual/svg/borders/SvgBorderBig';
import { BoxDiv } from '../components/visual/svg/containers/SvgBoxContainer';

export const CreateTournament: React.FC = () => {
  const [playerCount, setPlayerCount] = useState(8);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [enablePowerUps, setEnablePowerUps] = useState(false);
  const [selectedPowerUps, setSelectedPowerUps] = useState<string[]>([]);

  const powerUps = ['Speed Boost', 'Shield', 'Double Points', 'Freeze Opponent'];

  const handlePowerUpToggle = (powerUp: string) => {
    console.log(selectedPowerUps);
    setSelectedPowerUps((prev) =>
      prev.includes(powerUp) ? prev.filter((p) => p !== powerUp) : [...prev, powerUp]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      playerCount,
      isPrivate,
      password: isPrivate ? password : undefined,
      enablePowerUps,
      selectedPowerUps: enablePowerUps ? selectedPowerUps : [],
    };
    console.log('Submitting tournament data:', formData);
    // Send data to backend
    fetch('/api/tournament', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => console.log('Response:', data))
      .catch((error) => console.error('Error:', error));
  };

  return (
    <motion.div className="h-full w-full min-h-[450px] relative glass-box mt-10 text-sm">
      <span className="absolute top-0 left-0 translate-y-[-50%] w-full mb-2">
        <SvgBorderBig />
      </span>
      <div className="w-full h-full p-5">
        <h1 className="font-heading text-4xl">Create Tournament</h1>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 w-full">
          {/* Player Count Slider */}
          <label className="block w-full md:w-[50%]">
            Player Count: {playerCount}
            <input
              type="range"
              min={4}
              max={16}
              step={2}
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
              className="block  h-2 rounded-lg appearance-none cursor-pointer"
            />
          </label>

          {/* Private Tournament Checkbox & Password Field */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
              className="w-5 h-5 border-2 border-current bg-transparent appearance-none cursor-pointer checked:bg-transparent checked:border-current checked:text-current checked:after:content-['✔'] checked:after:text-current checked:after:block checked:after:text-center"
            />
            <span>Private Tournament</span>
          </label>
          {isPrivate && (
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full p-2 border rounded"
            />
          )}

          {/* Enable Power-Ups Checkbox & Power-Up Selection */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={enablePowerUps}
              onChange={() => setEnablePowerUps(!enablePowerUps)}
              className="w-5 h-5 border-2 border-current bg-transparent appearance-none cursor-pointer checked:bg-transparent checked:border-current checked:text-current checked:after:content-['✔'] checked:after:text-current checked:after:block checked:after:text-center"
            />
            <span>Enable Power-Ups</span>
          </label>
          {enablePowerUps && (
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
          )}

          {/* Submit Button */}
          <ClippedButton label={'Create tournament'} type="submit" />
        </form>
      </div>
    </motion.div>
  );
};
