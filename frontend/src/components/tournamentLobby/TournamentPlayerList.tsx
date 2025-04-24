import React, { useState } from 'react';

import { motion } from 'framer-motion';

import { slideFromRightVariants } from './animationVariants';
import TournamentBracket from './TournamentBracket';

export const TournamentPlayerList: React.FC = ({ players }) => {
  const [activeTab, setActiveTab] = useState('bracket');

  return (
    <motion.div>
      <div className="flex gap-3">
        <button className="text-xs hover:text-secondary" onClick={() => setActiveTab('bracket')}>
          bracket
        </button>
        <button className="text-xs hover:text-secondary" onClick={() => setActiveTab('list')}>
          list
        </button>
      </div>
      <motion.div
        key="tournamentBracket"
        className="w-full h-full "
        variants={slideFromRightVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {activeTab == 'bracket' ? (
          <TournamentBracket players={players}></TournamentBracket>
        ) : (
          <>
            <h1>not implemented :)</h1>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

// export const TournamentPlayerList: React.FC = () => {
//   return (
//     <div className="h-full w-full">
//       <motion.ul className="p-2 w-full h-full flex flex-col justify-items-start gap-2 overflow-y-scroll">
//         <motion.li
//           className="h-[57px] min-w-[282px] flex gap-3 hover:scale-[1.02] p-1 hover:text-secondary"
//           // onClick={() => navigate(`/profile/${user.user_id}`)}
//         >
//           <ListSvgContainer>
//             <div className="flex items-center gap-2">
//               <div className="opacity relative h-[50px] w-[50px] border-1 border-current overflow-hidden">
//                 <img
//                   className="object-cover w-full h-full"
//                   src={'./src/assets/images/default_avatar.png'}
//                   alt={`users's profile picture`}
//                 />
//               </div>
//               <p className="text-xs">
//                 dummy user <br />
//               </p>
//             </div>
//           </ListSvgContainer>
//         </motion.li>
//       </motion.ul>
//     </div>
//   );
// };
