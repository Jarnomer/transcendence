import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useGameOptionsContext } from '@contexts';

import { NavIconButton } from '@components/UI';

import { getTournaments } from '@services';

interface DataInQueue {
  queue_id: string;
  isPrivate: boolean;
  mode: string;
  name: string;
  variant: string;
}

export const TournamentList: React.FC = () => {
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

  const handleJoinGameClick = (event, options: DataInQueue) => {
    event.stopPropagation();
    setMode(options.mode);
    setDifficulty(options.variant);
    setTournamentOptions({
      playerCount: parseInt(options.variant),
      numberOfRounds: Math.log2(parseInt(options.variant)),
      tournamentName: options.name,
      isPrivate: options.isPrivate,
      password: options.isPrivate ? password : null,
    });
    setLobby('join');
    setQueueId(options.queue_id);
    navigate('/tournamentLobby');
  };

  // console.log(dataInQueue);

  return (
    <div className="w-full overflow-auto border-1 bg-black/10">
      <table className="w-full table-auto text-left">
        <thead>
          <tr className="text-sm text-gray-500 border-b">
            <th className="px-4 py-2">Tournament Name</th>
            <th className="px-4 py-2">Visibility</th>
            <th className="px-4 py-2">Players</th>
            <th className="px-4 py-2">Join</th>
          </tr>
        </thead>
        <tbody className="border-1">
          {dataInQueue.length > 0 &&
            dataInQueue.map((options, index) => (
              <tr key={index} className="border-b hover:text-secondary">
                <td className="px-4 py-2">{options.name || 'N/A'}</td>
                <td className="px-4 py-2">
                  {options.isPrivate ? (
                    <input
                      type="password"
                      placeholder="Password"
                      className="border border-gray-300 rounded px-2 py-1"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  ) : (
                    'Public'
                  )}
                </td>
                <td>??/??</td>
                <td className="px-4 py-2">
                  <NavIconButton
                    id="join-game-button"
                    ariaLabel="join game"
                    icon="arrowRight"
                    onClick={(event) => handleJoinGameClick(event, options)}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};
