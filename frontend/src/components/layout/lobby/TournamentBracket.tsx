import React from 'react';

import { motion } from 'framer-motion';

import { useMediaQuery } from '../../../hooks';

interface PlayerData {
  user_id: string;
  avatar_url: string;
  display_name: string;
}

interface CompetitorProps {
  player: PlayerData | null;
  side: string;
}

const Competitor: React.FC<CompetitorProps> = ({ player, side }) => {
  const isDesktop = useMediaQuery('(min-width: 600px)');

  console.log('is desktop: ', isDesktop);
  if (!isDesktop)
    return (
      <motion.li className={`flex items-center m-2 hover:text-secondary`}>
        <div className=" h-full flex items-center justify-center">
          <p className="text-xs">{player ? player.display_name : '??'}</p>
        </div>
      </motion.li>
    );

  return (
    <motion.li
      className={`flex items-center m-2 hover:text-secondary`}
      // onClick={() => navigate(`/profile/${user.user_id}`)}
    >
      <div
        className={`w-full flex gap-2 items-center glass-box overflow-hidden ${
          side === 'right' ? 'flex-row-reverse' : ''
        }`}
      >
        <div className="opacity relative hidden sm:block sm:h-[20px] sm:w-[20px] md:h-[50px] md:w-[50px] border-1 border-current overflow-hidden">
          <img className="object-cover w-full h-full" src={'/images/avatars/default_avatar.png'} />
        </div>
        <div className="h-full flex items-center justify-center">
          <p className="text-xs">{player ? player.display_name : '??'}</p>
        </div>
      </div>
    </motion.li>
  );
};

interface TournamentMatch {
  gameId: string;
  players: [PlayerData | null, PlayerData | null];
  round: string;
  isComplete: boolean;
}

interface PlayerData {
  user_id: string;
  avatar_url: string;
  display_name: string;
}

const Round: React.FC<{
  matches: TournamentMatch[];
  competitors: TournamentMatch[];
  roundIndex: number;
  maxRounds: number;
}> = ({ competitors, maxRounds }) => {
  const mid = Math.ceil(competitors.length / 2);
  const leftHalf = competitors.slice(0, mid);
  const rightHalf = competitors.slice(mid);
  const round = parseInt(competitors[0].round);

  // console.log('------ ROUND: ', round, '--------');
  // console.log('matches from round: ', competitors);
  // console.log('leftHalf: ', leftHalf);
  // console.log('rightHalf: ', rightHalf);
  // console.log('maxRounds: ', maxRounds);
  // console.log('competitors', competitors);
  // console.log('------------------------');

  if (competitors.length === 1) {
    // console.log('Single match round:', round);

    return (
      <>
        {/* Left side */}
        <div
          style={{
            gridColumnStart: round,
            gridRowStart: 1,
          }}
        >
          <ol className="flex h-full flex-col justify-around">
            <div className={` `}>
              <Competitor player={competitors[0].players[0]} side="left" />
            </div>
          </ol>
        </div>

        {/* Right side */}
        <div style={{ gridColumnStart: round + 1, gridRowStart: 1 }}>
          <ol className="flex h-full flex-col justify-around">
            <div className="">
              <Competitor player={competitors[0].players[1]} side="right" />
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
          gridColumnStart: round,
          gridRowStart: 1,
        }}
      >
        <ol className="flex h-full flex-col justify-around">
          {leftHalf.map((match, idx) => (
            <div className={`container`} key={`left-${idx}`}>
              <Competitor player={match.players[0]} side="left" />
              <Competitor player={match.players[1]} side="left" />
            </div>
          ))}
        </ol>
      </div>

      {/* Right side */}
      <div style={{ gridColumnStart: maxRounds - round, gridRowStart: 1 }}>
        <ol className="flex h-full flex-col justify-around">
          {rightHalf.map((match, idx: number) => (
            <div className="container" key={`right-${idx}`}>
              <Competitor player={match.players[0]} side="right" />
              <Competitor player={match.players[1]} side="right" />
            </div>
          ))}
        </ol>
      </div>
    </>
  );
};

interface tournamentBracketProps {
  players: PlayerData[];
}

export const TournamentBracket: React.FC<tournamentBracketProps> = ({ players }) => {
  const isDesktop = useMediaQuery('(min-width: 600px)');
  if (!players) return;
  const gridCols = players.length * 2;
  console.log('playersLength:', players.length, ' gridCols: ', gridCols);

  return (
    <div className=" w-full h-full flex  ">
      <div
        className="grid grid-rows-1 w-full overflow-x-scroll"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        }}
      >
        {players.map((round, index) => (
          <Round
            key={'round_' + index}
            roundIndex={index}
            competitors={round}
            maxRounds={gridCols + 1}
          />
        ))}
      </div>
    </div>
  );
};
