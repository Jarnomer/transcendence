import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '../../pages/LoadingContextProvider';
import { useWebSocketContext } from '../../services';
import { getUserData } from '../../services/userService';
import { BackgroundGlow } from '../visual/BackgroundGlow';
interface MatchMakingCarouselProps {
  setAnimate: (value: boolean) => void;
}

const aiOptions = {
  easy: {
    avatar: './src/assets/images/ai_easy.png',
    name: 'AI_EASY',
  },
  normal: {
    avatar: './src/assets/images/ai.png',
    name: 'AI_NORMAL',
  },
  brutal: {
    avatar: './src/assets/images/ai_hard.png',
    name: 'AI_BRUTAL',
  },
};

export const MatchMakingCarousel: React.FC<MatchMakingCarouselProps> = ({ setAnimate }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [opponentAvatar, setOpponentAvatar] = useState<string | null>(null);
  const [opponentName, setOpponentName] = useState<string>('???');
  const [opponentFound, setOpponentFound] = useState<boolean>(false);
  const [searchingOpponent, setSearchingOpponent] = useState<boolean>(false);
  const location = useLocation();
  const { mode, difficulty } = location.state || {};
  const { setLoadingState } = useLoading();

  const { gameStatus, connectionStatus, gameState } = useWebSocketContext();

  // 🧠 Replace with your real avatars (or use placeholder images)
  const avatarList = [
    './src/assets/images/ai_easy.png',
    './src/assets/images/ai_hard.png',
    './src/assets/images/ai.png',
    './src/assets/images/ai_3.png',
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (mode === 'singleplayer') {
      setOpponentAvatar(aiOptions[difficulty].avatar);
      setOpponentName(aiOptions[difficulty].name);
      return;
    }

    setAnimate(true);
    setLoadingState('matchMakingAnimationLoading', true);

    if (!opponentFound) {
      interval = setInterval(() => {
        let newAvatar;
        do {
          newAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];
        } while (newAvatar === opponentAvatar); // force a different one
        setOpponentAvatar(newAvatar);
      }, 300);
    }
    return () => clearInterval(interval);
  }, [opponentFound, opponentAvatar]);

  const fetchOpponentData = async (user_id) => {
    if (mode === 'singleplayer') {
      const selectedAI = aiOptions[difficulty] || aiOptions.easy;
      setOpponentAvatar(selectedAI.avatar);
      setOpponentName(selectedAI.name);
    } else {
      const user2 = await getUserData(gameState.players.player2.id);
      if (user2) {
        setOpponentAvatar(gameStatus.opponent.avatar_url || '/avatars/default.png');
        setOpponentName(gameStatus.opponent.display_name || 'Opponent');
        return user2;
      }
    }
  };

  useEffect(() => {
    if (connectionStatus === 'waiting') {
      let timeout;
      if (gameState.players.player2?.id) {
        const res = fetchOpponentData(gameState.players.player2.id);
        console.log(res);

        setOpponentFound(true);
        timeout = setTimeout(() => {
          setAnimate(false);
          setLoadingState('matchMakingAnimationLoading', false);
        }, 2000);
      }
      return () => clearTimeout(timeout);
    }
  }, [connectionStatus]);

  useEffect(() => {
    if (mode === 'singleplayer') setOpponentFound(true);
    const userId = localStorage.getItem('userID');
    if (!userId) return;
    setLoading(true);
    getUserData(userId)
      .then((data) => {
        setUser(data);
      })
      .catch((error) => {
        console.error('Failed to fetch user data: ', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      {!opponentFound ? (
        <h2 className="w-full text-center font-heading text-3xl m-2">Looking for an opponent</h2>
      ) : null}
      <div className="flex h-full relative justify-center items-center gap-5">
        {/* PLAYER CARD */}
        <div
          id="player-card"
          className="border glass-box relative overflow-hidden flex flex-col justify-center items-center p-4 "
        >
          <BackgroundGlow></BackgroundGlow>
          <div className="w-[200px] h-[200px] overflow-hidden bg-background  border-2 border-primary">
            <img className="w-full h-full object-cover" src={user?.avatar_url} alt="You" />
          </div>
          <p className="mt-2 font-semibold">{user?.display_name}</p>
        </div>

        {/* OPPONENT CARD */}
        <div
          id="opponent-card"
          className="border glass-box relative overflow-hidden flex flex-col justify-center items-center p-4 "
        >
          <BackgroundGlow></BackgroundGlow>
          <div className="w-[200px] h-[200px] bg-background overflow-hidden border-2 border-primary relative">
            <div className="absolute w-full h-full">
              <AnimatePresence mode="wait">
                {opponentAvatar && (
                  <motion.img
                    key={opponentAvatar}
                    src={opponentAvatar}
                    alt="Opponent"
                    initial={{ y: -200 }}
                    animate={{ y: 0 }}
                    exit={{ y: 200 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="w-full h-full object-cover absolute"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
          <motion.p
            key={opponentName}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 font-semibold"
          >
            {opponentName}
          </motion.p>
        </div>

        <h1 className="text-9xl text-white font-heading absolute left-[50%] translate-x-[-50%]">
          VS
        </h1>
      </div>
    </>
  );
};
