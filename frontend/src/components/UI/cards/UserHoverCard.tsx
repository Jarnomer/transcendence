import ReactDOM from 'react-dom';

import { motion } from 'framer-motion';

import { UserActions } from '@components/UI';

import { UserDataResponseType } from '@shared/types';

interface userHoverCardProps {
  user: UserDataResponseType;
  x: number;
  y: number;
}

export const UserHoverCard: React.FC<userHoverCardProps> = ({ user, x, y }) => {
  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute p-0 m-0 glass-box backdrop-blur-lg z-50 h-md w-auto text-sm text-primary"
      style={{ top: y + 2, left: x + 2, position: 'fixed' }}
    >
      <div className="flex justify-center items-center w-full h-full p-2 flex-col gap-2">
        <div className="relative border-1 h-[100px] w-[100px] overflow-hidden">
          <img
            className="object-cover w-full h-full"
            src={user?.avatar_url}
            alt={`${user?.display_name}'s profile picture`}
          />
        </div>
        <p className="text-secondary">{user.display_name}</p>
        <UserActions user={user}></UserActions>
      </div>
    </motion.div>,
    document.body // render directly into bodys
  );
};

// import { ProfilePictureMedium } from '../ProfilePictureMedium';

// export const UserHoverCard: React.FC<{ user: User }> = ({ user }) => {
//   if (!user) return;
//   return (
//     <div className="absolute top-full left-0 mt-2 p-2 bg-white border rounded shadow-lg z-10 text-sm">
//       <p>
//         <strong>{user?.display_name}</strong>
//       </p>
//       <p>User ID: {user?.user_id}</p>
//       {/* Add more info as needed */}
//       <ProfilePictureMedium user={user}></ProfilePictureMedium>
//     </div>
//   );
// };
