import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { ClippedButton } from '../components/UI/buttons/ClippedButton';
import { SvgBorderBig } from '../components/visual/svg/borders/SvgBorderBig';
import { useGameOptionsContext } from '../contexts/gameContext/GameOptionsContext';

export const CreateTournament: React.FC = () => {
  const [playerCount, setPlayerCount] = useState(8);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [enablePowerUps, setEnablePowerUps] = useState(false);
  const [selectedPowerUps, setSelectedPowerUps] = useState<string[]>([]);
  const [tournamentName, setTournamentName] = useState('');
  const { setTournamentOptions, setDifficulty } = useGameOptionsContext();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      playerCount,
      tournamentName,
      isPrivate,
      password: isPrivate ? password : null,
      // enablePowerUps,
      // selectedPowerUps: enablePowerUps ? selectedPowerUps : [],
    };
    setTournamentOptions(formData);
    setDifficulty(formData.playerCount.toString());
    navigate('/game');
    console.log('Submitting tournament data:', formData);
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
              min={2}
              max={16}
              step={2}
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
              className="block  h-2 rounded-lg appearance-none cursor-pointer"
            />
          </label>

          <label className="block w-full md:w-[50%]">
            Tournament Name:
            <input
              type="text"
              placeholder="Enter tournament name"
              className="block w-full p-2 border rounded"
              required
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
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
          {/* <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={enablePowerUps}
              onChange={() => setEnablePowerUps(!enablePowerUps)}
              className="w-5 h-5 border-2 border-current bg-transparent appearance-none cursor-pointer checked:bg-transparent checked:border-current checked:text-current checked:after:content-['✔'] checked:after:text-current checked:after:block checked:after:text-center"
            />
            <span>Enable Power-Ups</span>
          </label>

          {enablePowerUps && (
            <PowerUpSelection
              selectedPowerUps={selectedPowerUps}
              setSelectedPowerUps={setSelectedPowerUps}
            />
          )} */}

          <ClippedButton label={'Create tournament'} type="submit" />
        </form>
      </div>
    </motion.div>
  );
};
