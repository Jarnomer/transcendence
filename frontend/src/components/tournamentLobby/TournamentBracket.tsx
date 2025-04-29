import React from 'react';

import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import { motion } from 'framer-motion';

import { UserListCard } from '../UI/cards/UserListCard';

interface PlayerData {
  user_id: string;
  avatar_url: string;
  display_name: string;
}

interface CompetitorProps {
  player: PlayerData;
}

const Competitor: React.FC<CompetitorProps> = ({ player }) => {
  return (
    <motion.li
      className={`flex items-center m-4 p-1 hover:text-secondary`}
      // onClick={() => navigate(`/profile/${user.user_id}`)}
    >
      <UserListCard user={player}>
        <div className="flex items-center gap-2">
          <div className="opacity relative h-[50px] w-[50px] border-1 border-current overflow-hidden">
            <img
              className="object-cover w-full h-full"
              src={'./src/assets/images/default_avatar.png'}
            />
          </div>
          <p className="text-xs">
            {player ? player.display_name : '??'} <br />
          </p>
        </div>
      </UserListCard>
    </motion.li>
  );
};

const Round: React.FC<{
  id?: string;
  matches: TournamentMatch[];
  roundIndex: number;
  maxRounds: number;
}> = ({ id, competitors, maxRounds }) => {
  const mid = Math.ceil(competitors.length / 2);
  const leftHalf = competitors.slice(0, mid);
  const rightHalf = competitors.slice(mid);
  const round = parseInt(competitors[0].round);

  // console.log('matches from round: ', competitors);
  // console.log('leftHalf: ', leftHalf);
  // console.log('rightHalf: ', rightHalf);
  // console.log('maxRounds: ', maxRounds);
  // console.log('competitors', competitors);

  if (competitors.length === 1) {
    // console.log('Single match round:', round);

    return (
      <>
        {/* Left side */}
        <div
          style={{
            gridColumnStart: round + 1,
            gridRowStart: 1,
          }}
        >
          <ol className="flex h-full flex-col justify-around">
            <div className={` `}>
              <Competitor player={competitors[0].players[0]} />
            </div>
          </ol>
        </div>

        {/* Right side */}
        <div style={{ gridColumnStart: maxRounds - round, gridRowStart: 1 }}>
          <ol className="flex h-full flex-col justify-around">
            <div className="">
              <Competitor player={competitors[0].players[1]} />
            </div>
          </ol>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Left side */}
      <div
        style={{
          gridColumnStart: round + 1,
          gridRowStart: 1,
        }}
      >
        <ol className="flex h-full flex-col justify-around">
          {leftHalf.map((match, idx) => (
            <div className={` `} key={`left-${idx}`}>
              {/* <p>
                round: {round} index: {idx}
              </p> */}
              <Competitor player={match.players[0]} />
              <Competitor player={match.players[1]} />
            </div>
          ))}
        </ol>
      </div>

      {/* Right side */}
      <div style={{ gridColumnStart: maxRounds - round, gridRowStart: 1 }}>
        <ol className="flex h-full flex-col justify-around">
          {rightHalf.map((match, idx) => (
            <div className="" key={`right-${idx}`}>
              {/* <p>
                round: {round} index: {idx}
              </p> */}
              <Competitor player={match.players[0]} />
              <Competitor player={match.players[1]} />
            </div>
          ))}
        </ol>
      </div>
    </>
  );
};

export const TournamentBracket: React.FC = ({ players, tournamentSize }) => {
  // Create rounds based on number of players

  if (!players) return;
  const gridCols = players.length * 2 + 2;
  // console.log('players from bracket component:', players);
  // console.log('players.length: ', players.length, 'grid cols:', gridCols);

  const container = document.getElementById('app-main-container');
  if (!container) return null;

  return (
    <div className=" w-full flex items-center justify-center">
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={4}
        wheel={{
          wheelEnabled: true,
          touchPadEnabled: true, // this is important
          step: 0.1,
        }}
        doubleClick={{ disabled: true }}
      >
        <TransformComponent>
          <div
            className=" grid grid-rows-1"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
              minWidth: `${gridCols * 150}px`,
            }}
          >
            {players.map((round, index) => (
              <Round
                key={'round_' + index}
                roundIndex={index}
                competitors={round}
                maxRounds={gridCols}
              />
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default TournamentBracket;
