import React, { useState } from 'react';

import { motion } from 'framer-motion';

import { BackgroundGlow } from '../../BackgroundGlow';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const BoxDiv: React.FC = ({ index }) => {
  const [showGlitch, setShowGlitch] = useState(true);

  return (
    <motion.div className="overflow-hidden w-[200px] h-[200px] relative" variants={itemVariants}>
      <BackgroundGlow></BackgroundGlow>
      <motion.svg
        className="absolute top-0 left-0 w-full h-full"
        width="194"
        height="193"
        viewBox="0 0 194 193"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M187.22 6.4502V191.85H168.59L164.09 187.35H6.32031V6.4502H187.22ZM158.33 7.3502H58.9703L55.8203 10.5002H42.0503L38.9003 7.3502H7.22031V86.8202L10.3703 89.9702V103.83L7.22031 106.98V167.01L10.3703 170.16V183.3H23.5103L26.6603 186.45H186.32V157.11L183.17 153.96V140.1L186.32 136.95V35.3402L181.82 30.8402V11.8502H162.83L158.33 7.3502Z"
          stroke="currentColor"
          strokeWidth={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.2 * (index + 1), duration: 0.5, ease: 'easeInOut' }}
        />
        <motion.path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M187.22 6.4502V191.85H168.59L164.09 187.35H6.32031V6.4502H187.22ZM158.33 7.3502H58.9703L55.8203 10.5002H42.0503L38.9003 7.3502H7.22031V86.8202L10.3703 89.9702V103.83L7.22031 106.98V167.01L10.3703 170.16V183.3H23.5103L26.6603 186.45H186.32V157.11L183.17 153.96V140.1L186.32 136.95V35.3402L181.82 30.8402V11.8502H162.83L158.33 7.3502Z"
          fill="currentColor"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 * (index + 1), duration: 0.5, ease: 'easeInOut' }}
        />
        {/* <path
          d="M190.369 159.72V134.25H189.469V158.82V191.85V192.3H193.069V162.42L190.369 159.72Z"
          fill=" currentColor"
        />
        <path
          d="M3.16875 26.0696H4.06875V19.6796V4.19961H37.5488H65.1787V3.29961H36.6488L33.9488 0.599609H0.46875V16.0796L3.16875 18.7796V26.0696Z"
          fill=" currentColor"
        /> */}
        <motion.path
          d="M3.16992 123.72H4.06992V70.1699H3.16992V123.72Z"
          stroke="currentColor"
          strokeWidth={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3 * (index + 1), duration: 0.5, ease: 'easeInOut' }}
        />
        <motion.path
          d="M29.4492 190.32H70.5792V189.42H29.4492V190.32Z"
          stroke="currentColor"
          strokeWidth={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3 * (index + 1), duration: 0.5, ease: 'easeInOut' }}
        />
        <motion.path
          d="M189.469 82.5896H190.369V49.5596H189.469V82.5896Z"
          stroke="currentColor"
          strokeWidth={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3 * (index + 1), duration: 0.5, ease: 'easeInOut' }}
        />
        <motion.path
          d="M4.06992 155.58H3.16992V190.32H15.7699V189.42H4.06992V155.58Z"
          stroke="currentColor"
          strokeWidth={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3 * (index + 1), duration: 0.5, ease: 'easeInOut' }}
        />
        <path
          d="M189.47 15.8995H190.37V3.47949H144.74V4.37949H189.47V15.8995Z"
          fill=" currentColor"
        />
      </motion.svg>
    </motion.div>
  );
};
