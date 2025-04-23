import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import { motion } from 'framer-motion';

import { ListSvgContainer } from '../visual/svg/containers/ListSvgContainer';

const Competitor: React.FC<CompetitorProps> = ({ name }) => {
  return (
    <motion.li
      className={`flex items-center m-4 p-1 hover:text-secondary`}
      // onClick={() => navigate(`/profile/${user.user_id}`)}
    >
      <ListSvgContainer>
        <div className="flex items-center gap-2">
          <div className="opacity relative h-[50px] w-[50px] border-1 border-current overflow-hidden">
            <img
              className="object-cover w-full h-full"
              src={'./src/assets/images/default_avatar.png'}
              alt={`users's profile picture`}
            />
          </div>
          <p className="text-xs">
            {name} <br />
          </p>
        </div>
      </ListSvgContainer>
    </motion.li>
  );
};

const Round: React.FC<{
  id?: string;
  competitors: string[];
  roundIndex: number;
  maxRounds: number;
}> = ({ id, competitors, roundIndex, maxRounds }) => {
  const leftCompetitors = competitors.filter((_, idx) => idx % 2 === 0);
  const rightCompetitors = competitors.filter((_, idx) => idx % 2 !== 0);
  const isFinal = competitors.length === 1;

  if (isFinal) {
    return <></>;
  }

  return (
    <>
      <div style={{ gridColumnStart: roundIndex + 1, gridRowStart: 1 }}>
        <ol className="flex h-full flex-col justify-around">
          {leftCompetitors.map((name, idx) => (
            <div key={`left-${idx}`}>
              <Competitor name={name} />
            </div>
          ))}
        </ol>
      </div>

      <div style={{ gridColumnStart: maxRounds - roundIndex, gridRowStart: 1 }}>
        <ol className="flex h-full flex-col justify-around">
          {rightCompetitors.map((name, idx) => (
            <div key={`right-${idx}`}>
              <Competitor name={name} />
            </div>
          ))}
        </ol>
      </div>
    </>
  );
};

const TournamentBracket: React.FC = ({ players }) => {
  // Create rounds based on number of players
  const generateRounds = (initialPlayers: string[]) => {
    const rounds = [];
    let currentRound = initialPlayers;

    while (currentRound.length >= 1) {
      rounds.push(currentRound);
      currentRound = new Array(Math.floor(currentRound.length / 2)).fill('Competitor');
    }

    return rounds.map((competitors, idx) => ({
      id: `round-${idx + 1}`,
      competitors,
    }));
  };

  const container = document.getElementById('app-main-container');
  if (!container) return null;
  const rounds = generateRounds(players);
  const maxRounds = players.length / 2;
  const gridCols = maxRounds + 2;
  console.log('Max rounds: ', maxRounds);
  console.log('Grid cols: ', gridCols);

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
            {rounds.map((round, index) => (
              <Round
                key={round.id}
                roundIndex={index}
                competitors={round.competitors}
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
