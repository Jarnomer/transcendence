import React from 'react';

import { MessageNotificationSvg } from '@components/visual';

export const MessageNotification: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative text-primary aspect-[174/75] h-20 md:h-24 pointer-events-auto">
      <div className="notification-content w-full h-full px-1 py-4">{children}</div>
      <div className="w-full h-full absolute top-0 left-0 translate-y-[2px] pointer-events-none">
        <MessageNotificationSvg />
      </div>
    </div>
  );
};
