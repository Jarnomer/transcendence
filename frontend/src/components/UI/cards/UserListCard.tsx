import React, { useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { ListSvgContainer } from '../../visual/svg/containers/ListSvgContainer';
import { UserHoverCard } from './UserHoverCard';

export const UserListCard: React.FC<{ user: User; children: React.ReactNode }> = ({
  user,
  children,
}) => {
  const [showCard, setShowCard] = useState(false);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    // Capture mouse position when entering
    const { clientX, clientY } = e;
    setHoverPos({ x: clientX, y: clientY });

    // Start timer for delayed show
    timerRef.current = setTimeout(() => {
      setShowCard(true);
    }, 600);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowCard(false);
    setHoverPos(null);
  };

  // console.log('user from competitor component: ', user);
  return (
    <motion.div
      className={`w-full`}
      // onClick={() => navigate(`/profile/${user.user_id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* CLIPPED CORNER SHAPE WITH THIS SVG WRAPPER */}
      <ListSvgContainer>{children}</ListSvgContainer>
      <AnimatePresence>
        {showCard && user && hoverPos && (
          <UserHoverCard user={user} x={hoverPos.x} y={hoverPos.y} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
