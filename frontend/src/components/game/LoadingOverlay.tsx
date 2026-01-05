import React, { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

interface LoadingOverlayProps {
  isLoading: boolean;
  progress: number;
  currentTask: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  progress,
  currentTask,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Delay hiding the overlay to allow fade out animation
      const timer = setTimeout(() => {
        setVisible(false);
      }, 1000); // Fade out duration
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center uppercase"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <div className="max-w-xl w-full px-8">
            <div className="flex flex-col gap-6">
              <div className="text-primary text-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl mb-2"
                >
                  Loading Game Environment
                </motion.div>
                <motion.div
                  key={currentTask}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-secondary"
                >
                  {currentTask}
                </motion.div>
              </div>

              <div className="w-full bg-[#111111] h-2 rounded-sm overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{
                    duration: 0.3,
                    ease: 'easeOut',
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
