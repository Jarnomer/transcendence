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

interface TournamentResponse {
  tournaments: DataInQueue[];
}

export const TournamentList: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [dataInQueue, setDataInQueue] = useState<DataInQueue[]>([]);
  const navigate = useNavigate();
  const { setMode, setDifficulty, setLobby, setQueueId, setTournamentOptions } =
    useGameOptionsContext();

  async function fetchData() {
    setIsLoading(true);
    try {
      const fetchedQueueData = (await getTournaments()) as TournamentResponse;
      console.log(fetchedQueueData);
      setDataInQueue(fetchedQueueData.tournaments || []);
    } catch (error) {
      console.error('Failed to fetch tournaments:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleJoinGameClick = (event: React.MouseEvent<HTMLElement>, options: DataInQueue) => {
    event.stopPropagation();
    setMode(options.mode);
    setDifficulty(options.variant);
    setTournamentOptions({
      playerCount: parseInt(options.variant),
      numberOfRounds: Math.log2(parseInt(options.variant)),
      tournamentName: options.name,
      isPrivate: options.isPrivate,
      password: options.isPrivate ? passwords[options.queue_id] || null : null,
    });
    setLobby('join');
    setQueueId(options.queue_id);
    navigate('/tournamentLobby');
  };

  const handlePasswordChange = (queue_id: string, password: string) => {
    setPasswords((prev) => ({
      ...prev,
      [queue_id]: password,
    }));
  };

  return (
    <div className="w-full overflow-auto border-1 bg-black/10">
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <p>Loading tournaments...</p>
        </div>
      ) : dataInQueue.length === 0 ? (
        <div className="flex justify-center items-center p-8">
          <p>No tournaments available. Create one to get started!</p>
        </div>
      ) : (
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
            {dataInQueue.map((options, index) => (
              <tr key={options.queue_id || index} className="border-b hover:text-secondary">
                <td className="px-4 py-2">{options.name || 'N/A'}</td>
                <td className="px-4 py-2">
                  {options.isPrivate ? (
                    <input
                      type="password"
                      placeholder="Password"
                      className="border border-gray-300 rounded px-2 py-1"
                      value={passwords[options.queue_id] || ''}
                      onChange={(e) => handlePasswordChange(options.queue_id, e.target.value)}
                    />
                  ) : (
                    'Public'
                  )}
                </td>
                <td className="px-4 py-2">??/{options.variant || '??'}</td>
                <td className="px-4 py-2">
                  <NavIconButton
                    id="join-game-button"
                    ariaLabel="join game"
                    icon="arrowRight"
                    ariaLabel={`Join ${options.name}`}
                    onClick={(event) => handleJoinGameClick(event, options)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
