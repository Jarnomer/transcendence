import React, { useState } from 'react';

import { CreateTournament } from '../components/menu/CreateTournament';
import { TournamentList } from '../components/menu/TournamentList';
import { ClippedButton } from '../components/UI/buttons/ClippedButton';

export const TournamentMenu: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handleCreateTournamentClick = () => {
    setActiveTab('createTournament');
  };

  return (
    <>
      {activeTab === 'createTournament' ? (
        <CreateTournament />
      ) : (
        <div className="w-full h-full glass-box p-5 flex flex-col justify-center items-center">
          <span className="w-full">Open tournaments</span>
          <div className="w-full h-full flex">
            <TournamentList />
          </div>
          <div className="mt-4 w-full flex justify-end">
            <ClippedButton label="Create" onClick={handleCreateTournamentClick} />
          </div>
        </div>
      )}
    </>
  );
};
