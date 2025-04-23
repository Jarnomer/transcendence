import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { getNotifications, getUserByID, markNotificationAsSeen } from '../../services/userService';

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
  //const { user } = useUser();
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

  console.log('notficitations: ', notifications);
  return (
    <motion.div
      className="backdrop-blur-sm"
      variants={animationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <ul>
        {notifications.length > 0 ? (
          notifications.map((request: any, index: number) => (
            <li key={index}>
              <div
                className="flex items-center justify-center gap-2"
                onClick={(event) => handleNotificationClick(event, request)}
              >
                <div className="h-[30px] w-[30px] rounded-full overflow-hidden border-primary border-1">
                  <img src={request.avatar_url} className="object-contain"></img>
                </div>
                <span className="text-xs">{request.display_name} sent you a friend request</span>
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
