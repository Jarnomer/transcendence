import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { useGameOptionsContext } from '../../contexts/gameContext/GameOptionsContext';
import { getTournaments } from '../../services/userService';
import { NavIconButton } from '../UI/buttons/NavIconButton';
import { BackgroundGlow } from '../visual/BackgroundGlow';

interface DataInQueue {
  queue_id: string;
  isPrivate: boolean;
  mode: string;
  name: string;
  j;
  variant: string;
}

export const Tournaments: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [dataInQueue, setDataInQueue] = useState<DataInQueue[]>([]);
  const navigate = useNavigate();
  const { setMode, setDifficulty, setLobby, setQueueId, setTournamentOptions } =
    useGameOptionsContext();

  async function fetchData() {
    setLoading(true);
    const fetchedQueueData = await getTournaments();
    console.log(fetchedQueueData);
    setDataInQueue(fetchedQueueData.tournaments);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log('users in queue:', dataInQueue);
  }, [dataInQueue]);

  const handleJoinGameClick = (event, options: DataInQueue) => {
    event.stopPropagation();
    setMode(options.mode);
    setDifficulty(options.variant);
    setTournamentOptions({
      playerCount: 2,
      tournamentName: options.name,
      isPrivate: options.isPrivate,
      password: options.isPrivate ? password : null,
    });
    setLobby('join');
    setQueueId(options.queue_id);
    navigate('/tournamentLobby');
  };

  return (
    <>
      <motion.div className="w-full">
        <div className="flex items-center justify-center text-center w-full h-[20px] bg-primary text-black text-xs">
          <h2 className="">Open Tournaments</h2>
        </div>
        <motion.div className="p-2 relative  text-sm">
          <div className="p-5 mt-1 border-1  h-full relative overflow-hidden bg-primary/20 ">
            <BackgroundGlow></BackgroundGlow>
            <ul>
              {dataInQueue.length === 0 ? (
                <li className="text-muted text-gray-500 text-sm">No Tournaments in queue</li>
              ) : (
                dataInQueue.map((options, index) => (
                  <li key={index} className="my-2">
                    <div className="flex items-center justify-center gap-5">
                      <p>{options.name || 'N/A'}</p>
                      {Boolean(options.isPrivate) && (
                        <input
                          type="password"
                          placeholder="Enter password"
                          className="border border-gray-300 rounded p-1"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      )}
                      <NavIconButton
                        id="join-game-button"
                        icon="arrowRight"
                        onClick={(event) => handleJoinGameClick(event, options)}
                      />
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};
