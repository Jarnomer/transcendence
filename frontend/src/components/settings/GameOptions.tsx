import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useGameOptionsContext } from '@contexts';

import { PowerUpSelection } from '@components/settings';
import { CheckBox, ClippedButton } from '@components/UI';

import { saveGameSettings } from '@services';

import { PowerUpType } from '@shared/types';

export const GameOptions: React.FC = () => {
  const [enablePowerUps, setEnablePowerUps] = useState(true);
  const [selectedPowerUps, setSelectedPowerUps] = useState<string[]>([]);
  const [maxScore, setMaxScore] = useState<number>(5);
  const [ballSpeed, setBallSpeed] = useState<number>(7);
  const [enableSpin, setEnableSpin] = useState<boolean>(true);
  const { setGameSettings, gameSettings, mode, difficulty } = useGameOptionsContext();
  const navigate = useNavigate();
  // useMatchmaking();

  const handleMaxScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > 999) {
      setMaxScore(999);
    } else if (value < 1) {
      setMaxScore(1);
    } else {
      setMaxScore(value);
    }
  };

  const handleBallSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > 999) {
      setBallSpeed(999);
    } else if (value < 1) {
      setBallSpeed(1);
    } else {
      setBallSpeed(value);
    }
  };

  useEffect(() => {
    console.log('--- loading game options ----');
    console.log('gamesettings: ', gameSettings);
    setMaxScore(gameSettings.maxScore);
    setBallSpeed(gameSettings.ballSpeed);
    setEnableSpin(gameSettings.enableSpin);
    setEnablePowerUps(gameSettings.enablePowerUps);
    setSelectedPowerUps(
      Object.keys(gameSettings.powerUpTypes).filter(
        (key) => gameSettings.powerUpTypes[key as PowerUpType]
      )
    );
  }, []);

  useEffect(() => {
    setGameSettings((prev) => ({
      ...prev,
      maxScore: maxScore,
      ballSpeed: ballSpeed,
      enableSpin: enableSpin,
      enablePowerUps: enablePowerUps,
      powerUpTypes: {
        [PowerUpType.SlowerPaddle]: selectedPowerUps.includes(PowerUpType.SlowerPaddle),
        [PowerUpType.SmallerPaddle]: selectedPowerUps.includes(PowerUpType.SmallerPaddle),
        [PowerUpType.BiggerPaddle]: selectedPowerUps.includes(PowerUpType.BiggerPaddle),
        [PowerUpType.FasterPaddle]: selectedPowerUps.includes(PowerUpType.FasterPaddle),
        [PowerUpType.MoreSpin]: selectedPowerUps.includes(PowerUpType.MoreSpin),
      },
    }));
  }, [maxScore, ballSpeed, enableSpin, enablePowerUps, selectedPowerUps, setGameSettings]);

  useEffect(() => {
    if (!enableSpin && selectedPowerUps.includes('Extra Spin')) {
      setSelectedPowerUps((prev) => prev.filter((p) => p !== 'Extra Spin'));
    }
  }, [enableSpin]);

  const handleSaveSettings = async () => {
    console.log('--- sending game options ----');
    console.log('Max score: ', maxScore);
    console.log('Ball speed: ', ballSpeed);
    console.log('Enable spin: ', enableSpin);
    console.log('Enable powerups: ', enablePowerUps);
    console.log('selected powerups: ', selectedPowerUps);
    await saveGameSettings({
      maxScore,
      ballSpeed,
      enableSpin,
      enablePowerUps,
      powerUpTypes: {
        [PowerUpType.SlowerPaddle]: selectedPowerUps.includes(PowerUpType.SlowerPaddle),
        [PowerUpType.SmallerPaddle]: selectedPowerUps.includes(PowerUpType.SmallerPaddle),
        [PowerUpType.BiggerPaddle]: selectedPowerUps.includes(PowerUpType.BiggerPaddle),
        [PowerUpType.FasterPaddle]: selectedPowerUps.includes(PowerUpType.FasterPaddle),
        [PowerUpType.MoreSpin]: selectedPowerUps.includes(PowerUpType.MoreSpin),
      },
    }).catch((err) => {
      console.error('Error saving game settings:', err);
    });
  };

  const handleGameStart = async () => {
    console.log('--- starting game ----');
    navigate('/game');
  };

  return (
    <div className="glass-box h-full w-full md:w-2xl md:max-w-2xl p-3 flex flex-col gap-2 justify-center">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="max-w-full">
          <label className="block font-heading text-2xl">Max Score</label>
          <input
            type="number"
            value={maxScore}
            min={1}
            step={1}
            onChange={handleMaxScoreChange}
            className="w-auto text-right border border-primary px-2 py-1"
          />
        </div>
        <div className="">
          <label className="block font-heading text-2xl">Ball speed</label>
          <input
            type="number"
            value={ballSpeed}
            min={1}
            step={1}
            onChange={handleBallSpeedChange}
            className="w-auto  text-right border border-primary px-2 py-1"
          />
        </div>
        <div className="">
          <label className="block font-heading text-2xl">Ball Spin</label>
          <CheckBox
            isEnabled={enableSpin}
            setIsEnabled={setEnableSpin}
            id={'enableSpin'}
          ></CheckBox>
        </div>
      </div>
      <div className="max-w-lg">
        <span className="font-heading text-2xl">Power Ups</span>
        <CheckBox
          isEnabled={enablePowerUps}
          setIsEnabled={setEnablePowerUps}
          id={'enablePowerups'}
        ></CheckBox>
        <PowerUpSelection
          isEnabled={enablePowerUps}
          setIsEnabled={setEnablePowerUps}
          selectedPowerUps={selectedPowerUps}
          setSelectedPowerUps={setSelectedPowerUps}
          isSpinEnabled={enableSpin}
        />
      </div>
      <div className="flex justify-end p-4">
        <ClippedButton label={'Save'} onClick={() => handleSaveSettings()} />
      </div>
      {(mode === 'singleplayer' || (mode === '1v1' && difficulty === 'local')) && (
        <div className="flex justify-end p-4">
          <ClippedButton label={'Start Game'} onClick={() => handleGameStart()} />
        </div>
      )}
    </div>
  );
};
