import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { PlayerQueue } from '../../../tournamentPage/Tournaments';
import { BoxDiv } from './SvgBoxContainer';

export const fillVariants = {
  initial: {
    clipPath: 'inset(50% 0 50% 0)',
    opacity: 0,
  },
  animate: {
    clipPath: 'inset(0% 0 0% 0)',
    opacity: 1,
    transition: { delay: 0.4, duration: 0.4, ease: 'easeInOut' },
  },
  exit: {
    clipPath: 'inset(50% 0 50% 0)',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeInOut' },
    delay: 0.4,
  },
};

const FrameTop = () => {
  return (
    <svg
      className="w-full h-auto"
      viewBox="0 0 509 57"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M508.029 56.5714V0H53.4857L0 56.4L508.029 56.5714Z" fill="currentColor" />
    </svg>
  );
};

const SelectionCard = ({
  children,
  expanded,
  selectedTab,
}: {
  children: React.ReactNode;
  expanded: boolean;
  selectedTab: string;
}) => {
  if (selectedTab !== null && !expanded) return;
  <></>;

  return (
    <motion.div
      className="relative m-0"
      initial={{ height: 0 }}
      animate={{ height: expanded ? 'auto' : 100 }} // Adjust based on whether expanded or not
      transition={{ duration: 0.1 }}
    >
      <motion.span
        className="absolute top-0 left-0 translate-y-[-100%] w-full"
        // variants={fillVariants}
        // initial="initial"
        // animate="animate"
        // exit="exit"
      >
        <svg
          className="w-full h-auto"
          viewBox="0 0 486 27"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M485.914 26.8286L476.4 17.3143H262.029L244.714 0H51L32.6571 18.2572H0V26.8286H0.942836H485.914Z"
            fill="currentColor"
          />
        </svg>
      </motion.span>

      <div className="svg-card-wrapper relative w-full h-full grid place-items-center text-center">
        {
          <div
            className={`w-full ${expanded ? 'absolute bottom-0 left-0 translate-y-[50%]' : 'row-start-1 col-start-1'}`}
          >
            <svg
              className="w-full"
              viewBox="0 0 492 102"
              fill="red"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M456.943 101.172 H227.829 L212.229 85.5715 H0 V0.542969 M491.143 0.542969 V66.9715L456.943 101.172"
                stroke="currentColor"
                strokeWidth={1}
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.3, duration: 0.3, ease: 'easeInOut' }}
              />
            </svg>
          </div>
        }
        {!expanded ? (
          <span className="absolute bottom-0 left-0 translate-y-[80%] w-full">
            <svg
              className="w-full h-auto"
              viewBox="0 0 464 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M293.829 25.0286H245.143L220.971 0.857143H52.9714L44.7428 9.08569H0V8.22855H44.4L52.6286 0H221.314L245.486 24.1714H293.486L305.4 12.3429H463.543V13.2H305.743L293.829 25.0286Z"
                stroke="currentColor"
                strokeWidth={1}
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.3, duration: 0.3, ease: 'easeInOut' }}
              />
            </svg>
          </span>
        ) : null}

        {/* <motion.span
          className="col-start-1 row-start-1 w-full translate-x-[2%]"
          variants={fillVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <svg
            className="w-full h-auto"
            viewBox="0 0 490 99"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.2"
              d="M0 0H489.429V65.2286L455.743 98.9143H227.314L211.714 83.3142H0V0Z"
              fill="currentColor"
              fillOpacity="80%"
            />
          </svg>
        </motion.span> */}
        <div
          className={`w-full h-full relative ${expanded ? 'col-start-1 row-start-2 border-x-1 border-primary' : 'row-start-1 col-start-1'}`}
        >
          {expanded ? (
            <>
              <span className="absolute bottom-0 left-0 translate-y-[80%] w-full">
                <svg
                  className="w-full h-auto"
                  viewBox="0 0 464 26"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <motion.path
                    d="M293.829 25.0286H245.143L220.971 0.857143H52.9714L44.7428 9.08569H0V8.22855H44.4L52.6286 0H221.314L245.486 24.1714H293.486L305.4 12.3429H463.543V13.2H305.743L293.829 25.0286Z"
                    stroke="currentColor"
                  />
                </svg>
              </span>
              <span className="absolute top-0 left-0 translate-y-[100%] w-full">
                <svg
                  className="w-full h-auto"
                  viewBox="0 0 464 26"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <motion.path
                    d="M293.829 25.0286H245.143L220.971 0.857143H52.9714L44.7428 9.08569H0V8.22855H44.4L52.6286 0H221.314L245.486 24.1714H293.486L305.4 12.3429H463.543V13.2H305.743L293.829 25.0286Z"
                    stroke="currentColor"
                  />
                </svg>
              </span>
            </>
          ) : null}
          <div
            id="card-content flex items-center justify-center"
            className={`${expanded ? 'border-x-1 border-primary p-2 w-[95%] bg-primary/20' : 'w-full'}'`}
          >
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const SelectionSvg: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>(null);

  useEffect(() => {
    console.log(selectedTab);
  }, [selectedTab]);

  return (
    <>
      <div className="relative m-0 p-10 w-full">
        <div className="flex">
          {!selectedTab || selectedTab === 'tournaments' ? (
            <div onClick={() => setSelectedTab('tournaments')} className="w-full">
              <BoxDiv>
                <div
                  className={`text-3xl font-heading w-full h-full p-10 flex items-center justify-center ${selectedTab !== 'tournaments' ? 'aspect-square' : ''}`}
                >
                  Tournaments
                </div>
                {selectedTab === '1v1' ? <PlayerQueue></PlayerQueue> : null}
              </BoxDiv>
            </div>
          ) : null}

          {!selectedTab || selectedTab === '1v1' ? (
            <div onClick={() => setSelectedTab('1v1')} className={'w-full'}>
              <BoxDiv>
                <div
                  className={`text-3xl font-heading w-full h-full p-10 flex items-center justify-center ${selectedTab !== '1v1' ? 'aspect-square' : 'flex-col gap-2'}`}
                >
                  {/* <h1>1v1</h1> */}
                  {selectedTab === '1v1' ? <PlayerQueue></PlayerQueue> : null}
                </div>
              </BoxDiv>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};
