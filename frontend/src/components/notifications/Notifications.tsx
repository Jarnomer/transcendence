import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { useUser } from '../../contexts/user/UserContext';
import { acceptFriendRequest, rejectFriendRequest } from '../../services/friendService';
import { getNotifications, getUserByID, markNotificationAsSeen } from '../../services/userService';
import { NavIconButton } from '../UI/buttons/NavIconButton';

export const animationVariants = {
  initial: {
    clipPath: 'inset(50% 0 50% 0)',
    opacity: 0,
  },
  animate: {
    clipPath: 'inset(0% 0 0% 0)',
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
  exit: {
    clipPath: 'inset(50% 0 50% 0)',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeInOut' },
    delay: 0.4,
  },
};

export const Notifications: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { user, refetchUser, refetchRequests } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await getNotifications();
        console.log(res);
        const friends = await Promise.all(
          res.map(async (notification) => {
            switch (notification.type) {
              case 'friend_request': {
                console.log('Friend request:', notification);
                const friend = await getUserByID(notification.reference_id);
                const addNotification = {
                  ...friend,
                  notification_id: notification.notification_id,
                  type: notification.type,
                };
                console.log('Friend:', friend);
                return addNotification;
              }
              default:
                console.log('Unknown notification:', notification);
            }
          })
        );
        setNotifications(friends);
        refetchUser();
        refetchRequests();
      } catch (err) {
        console.error('Failed to get notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    console.log('Friends:', notifications);
  }, [notifications]);

  if (!notifications || loading) {
    return <p>Loading...</p>;
  }

  const handleAcceptFriendClick = (event, sender_id: string) => {
    event.stopPropagation();
    acceptFriendRequest(sender_id)
      .then(() => {
        console.log('Friend request accepted');
        refetchUser();
        refetchRequests();
      })
      .catch((error) => {
        console.error('Failed to accept friend request: ', error);
      });
  };

  const handleRejectFriendClick = (event, sender_id: string) => {
    event.stopPropagation();
    rejectFriendRequest(sender_id)
      .then(() => {
        console.log('Friend request rejected');
        refetchUser();
        refetchRequests();
      })
      .catch((error) => {
        console.error('Failed to reject friend request: ', error);
      });
  };

  const handleNotificationClick = async (event, request: any) => {
    console.log('notification clicked');
    event.stopPropagation();
    switch (request.type) {
      case 'friend_request':
        await markNotificationAsSeen(request.notification_id);
        navigate(`/profile/${request.user_id}`);
        break;
      default:
        console.log('Unknown notification:', request);
    }
  };

  console.log(user?.friend_requests);

  console.log('notficitations: ', notifications);
  return (
    <motion.div
      className=" "
      variants={animationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <ul className="flex flex-col gap-1">
        {notifications.length > 0 ? (
          notifications.map((request: any, index: number) => (
            <li key={index}>
              <div
                className="flex items-center justify-start gap-2 text-secondary"
                onClick={(event) => handleNotificationClick(event, request)}
              >
                <div className="h-[30px] w-[30px] rounded-full overflow-hidden border-secondary border-1">
                  <img src={request.avatar_url} className="object-contain"></img>
                </div>
                <span className="text-xs">{request.display_name} sent you a friend request</span>
                {user?.friend_requests.some((fr) => fr.user_id === request?.user_id) && (
                  <div className="ml-5 flex gap-1">
                    <NavIconButton
                      id={`accept-friend-${request.user_id}`}
                      icon="checkCircle"
                      ariaLabel="accept friend request"
                      onClick={(event) => handleAcceptFriendClick(event, request.user_id)}
                    />
                    <NavIconButton
                      id={`reject-friend-${request.user_id}`}
                      icon="xCircle"
                      ariaLabel="reject friend request"
                      onClick={(event) => handleRejectFriendClick(event, request.user_id)}
                    />
                  </div>
                )}
              </div>
            </li>
          ))
        ) : (
          <p className="text-xs">No new notifications.</p>
        )}
      </ul>
    </motion.div>
  );
};
