import React, { useEffect, useState } from 'react';

import { useLocation } from 'react-router-dom';

import { motion } from 'framer-motion';

import { ProcessingBar, WarningSign } from '@components/visual';

const generateRandomText = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}<>?';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Flickering color variants
const colors = ['#ea355a', '#f13c7a', '#f24c8c', '#f85b99', '#fc6dbb'];

const lineVariants = {
  hidden: { opacity: 0, y: -5 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
    },
  }),
};

const parentVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

export const SvgCircle: React.FC = () => {
  return (
    <motion.div>
      {/* <motion.svg
        className="w-[78px] h-[69px] p-0 m-0"
        viewBox="0 0 69 78"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        style={{ transformOrigin: 'center' }} // Keeps it from moving around
      >
        <path
          d="M5.29412 68.4031L5.71767 67.9796L6.03524 67.7678C5.96465 67.6972 5.89412 67.662 5.82353 67.662V67.5561H5.71767L6.1411 67.2384L6.56465 66.8149C14.3999 73.1678 24.0353 75.8149 33.3529 74.862C42.6706 73.909 51.5646 69.462 58.0235 61.6267C64.3764 53.7914 67.0236 44.1561 66.0706 34.8384C65.1177 25.5208 60.6706 16.5208 52.8353 10.1678C45 3.81488 35.3647 1.16783 26.047 2.12077C16.7294 2.96783 7.72933 7.52077 1.37639 15.3561L0.529412 14.6149L0 14.1914C6.67059 5.93253 16.2 1.16783 25.9412 0.214888C35.7882 -0.843935 46.0588 2.01489 54.2117 8.68548C62.4705 15.4619 67.2353 24.8855 68.1883 34.7325C69.2471 44.5796 66.4941 54.7443 59.7177 63.0031C52.9412 71.262 43.5176 76.0267 33.6705 76.9796C23.8235 77.9325 13.6588 75.1796 5.39997 68.4031H5.29412Z"
          fill="black"
        />

        <path
          d="M0.212891 41.5093L12.9188 40.2388C13.4482 44.6858 15.46 48.6035 18.5306 51.4623L9.84816 60.7799C4.55404 55.9093 0.954067 49.2388 0.212891 41.5093ZM27.4247 8.1564C44.1541 6.46228 59.0836 18.6388 60.7777 35.3682C61.413 42.2505 59.8246 48.8152 56.4364 54.3211L45.5306 47.5446C47.4365 44.474 48.3893 40.6623 47.9658 36.6387C47.0129 27.0035 38.3306 19.9093 28.6953 20.9682L27.4247 8.1564Z"
          fill="black"
        />
        <path
          d="M30.6011 38.4389L9.84804 60.886L9.74219 60.6742L30.3892 38.333L30.6011 38.4389Z"
          fill="black"
        />
        <path d="M30.3894 38.4386L27.2129 8.15625H27.5306L30.6012 38.4386H30.3894Z" fill="black" />
        <path
          d="M7.41158 65.5447L7.83513 65.227L8.1527 64.8035C15.4586 70.7329 24.4586 73.1682 33.0351 72.3211C41.7174 71.4741 50.0822 67.2388 56.0116 60.0388C61.941 52.7329 64.3763 43.7329 63.5292 35.0505C62.6822 26.3682 58.5528 18.1094 51.2469 12.18C43.941 6.14466 34.9409 3.70936 26.2586 4.6623C17.5762 5.50936 9.31741 9.63878 3.388 16.9447L2.54102 16.3094C8.68219 8.79171 17.2586 4.55642 26.1527 3.60348C35.1527 2.75642 44.3645 5.19172 51.8822 11.3329C59.3998 17.4741 63.6351 26.0505 64.588 34.9447C65.4351 43.9447 62.8939 53.1564 56.7527 60.6741C50.6115 68.1917 42.035 72.427 33.1409 73.38C24.2468 74.227 15.0351 71.6858 7.51743 65.5447H7.41158Z"
          fill="black"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.6594 40.1327C13.2359 35.4739 14.6124 31.0268 17.3653 27.7445C20.1183 24.3563 24.1417 22.0268 28.8005 21.6033C33.4594 21.0739 37.8006 22.5563 41.1888 25.3092C44.5771 28.0621 46.8005 32.0857 47.3299 36.7445C47.7535 41.2974 46.377 45.7445 43.6241 49.1327C40.8711 52.4151 36.8477 54.7445 32.1888 55.2739C27.53 55.6974 23.1888 54.2151 19.8005 51.4621C16.4123 48.8151 14.1888 44.7915 13.6594 40.1327ZM17.4712 27.8504C14.8241 31.1327 13.3417 35.4739 13.8711 40.1327C14.2947 44.6857 16.624 48.7092 19.9064 51.3563C23.1887 54.1092 27.6359 55.5916 32.1888 55.0621C36.7418 54.6386 40.7653 52.3092 43.5182 49.0269C46.1653 45.6386 47.6476 41.2974 47.1182 36.7445C46.6947 32.0857 44.3652 28.168 41.0829 25.4151C37.8005 22.6621 33.3535 21.2857 28.8005 21.7092C24.1417 22.2386 20.2241 24.4621 17.4712 27.8504ZM20.7535 39.3916C20.4358 36.7445 21.2829 34.0974 22.8711 32.1915C24.4594 30.2857 26.7888 28.9092 29.5418 28.5916C32.1888 28.3798 34.7299 29.2268 36.7417 30.8151C38.6476 32.4033 40.0241 34.7327 40.2359 37.3798C40.5535 40.1327 39.7065 42.6739 38.1182 44.5798C36.53 46.5915 34.2005 47.8621 31.4476 48.1798C28.8005 48.4974 26.2594 47.6504 24.2477 46.0621C22.3418 44.4739 20.9653 42.1445 20.7535 39.3916ZM22.977 32.2974C21.3888 34.2033 20.6476 36.7445 20.8594 39.3916C21.177 42.0386 22.4476 44.368 24.3535 45.8504C26.2594 47.4386 28.8005 48.2857 31.4476 48.0739C34.0946 47.7563 36.4241 46.3798 38.0124 44.4739C39.6006 42.568 40.3418 40.1327 40.13 37.3798C39.8124 34.7327 38.5417 32.5092 36.6358 30.921C34.73 29.3327 32.1888 28.4857 29.5418 28.8033C26.8947 29.0151 24.5652 30.3916 22.977 32.2974Z"
          fill="black"
        />
      </motion.svg> */}

      <motion.svg
        className="w-[100px]"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        style={{ transformOrigin: 'center' }} // Keeps it from moving around
      >
        <path
          d="M26.8401 14.635C26.8401 14.74 26.8401 14.8375 26.8401 14.9275H21.8226C21.8376 14.8375 21.8451 14.74 21.8451 14.635C21.8451 11.125 18.9651 8.24499 15.4551 8.24499V3.25C21.7326 3.25 26.8401 8.35749 26.8401 14.635Z"
          fill="black"
        />
        <path
          d="M15.4563 21.0252V26.0427C9.24632 26.0427 4.20633 21.0927 4.04883 14.9277H9.06631C9.20131 18.3027 12.0138 21.0252 15.4563 21.0252Z"
          fill="black"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M29.9008 14.6345C29.9008 18.5045 28.4158 22.127 25.6708 24.872C22.9483 27.5945 19.3033 29.102 15.4558 29.102C11.5858 29.102 7.94077 27.5945 5.21826 24.872C2.49576 22.127 0.988281 18.5045 0.988281 14.6345C0.988281 10.787 2.49576 7.14197 5.21826 4.41947C7.94077 1.67447 11.5858 0.166992 15.4558 0.166992C19.3033 0.166992 22.9483 1.67447 25.6708 4.41947C28.4158 7.14197 29.9008 10.787 29.9008 14.6345ZM29.2033 14.6345C29.2033 7.05198 23.0383 0.886981 15.4558 0.886981C7.87326 0.886981 1.68578 7.05198 1.68578 14.6345C1.68578 22.217 7.87326 28.4045 15.4558 28.4045C23.0383 28.4045 29.2033 22.217 29.2033 14.6345Z"
          fill="black"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20.8331 14.6343C20.8331 14.7093 20.8256 14.7843 20.8106 14.8593C20.7656 16.2093 20.2031 17.4693 19.2581 18.4368C18.2231 19.4493 16.8731 20.0118 15.4556 20.0118C14.0156 20.0118 12.6656 19.4493 11.6531 18.4368C10.6856 17.4693 10.1231 16.2093 10.0781 14.8593C10.0781 14.7843 10.0781 14.7093 10.0781 14.6343C10.0781 13.2168 10.6406 11.8668 11.6531 10.8318C12.6656 9.81934 14.0156 9.25684 15.4556 9.25684C16.8731 9.25684 18.2231 9.81934 19.2581 10.8318C20.2706 11.8668 20.8331 13.2168 20.8331 14.6343ZM20.5631 14.8593C20.5631 14.7843 20.5631 14.7093 20.5631 14.6343C20.5631 11.8218 18.2681 9.52685 15.4556 9.52685C12.6206 9.52685 10.3256 11.8218 10.3256 14.6343C10.3256 14.7093 10.3331 14.7843 10.3481 14.8593C10.4606 17.5818 12.7106 19.7419 15.4556 19.7419C18.2006 19.7419 20.4281 17.5818 20.5631 14.8593Z"
          fill="black"
        />
      </motion.svg>
    </motion.div>
  );
};

export const BackgroundGlitchTextBlock: React.FC<{}> = () => {
  const [lines, setLines] = useState<string[]>([]);
  const location = useLocation();
  useEffect(() => {
    console.log(location.pathname);
    const newLines = Array.from({ length: 20 }, () => generateRandomText(60));
    setLines(newLines);
  }, []);

  return (
    <>
      <motion.div
        className="w-full h-full z-0 left-0 opacity-55 pointer-events-none p-4 text-gray-500 font-mono text-[6px] sm:text-sm space-y-1"
        variants={parentVariants}
        initial="hidden"
        animate={'visible'}
        exit="hidden"
      >
        <motion.div className="w-full-full">
          {lines.map((line, lineIndex) => (
            <motion.div
              key={lineIndex}
              className="whitespace-pre text-[6px] sm:text-xs"
              variants={lineVariants}
              custom={lineIndex}
            >
              {line.split('').map((char, charIndex) => (
                <motion.span key={charIndex}>{char}</motion.span>
              ))}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </>
  );
};

export const BackgroundGlitch: React.FC<{ duration: number }> = ({ duration }) => {
  const [showGlitch, setShowGlitch] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setShowGlitch(true);
    const glitchTimer = setTimeout(() => {
      setShowGlitch(false);
    }, duration);
    return () => {
      clearTimeout(glitchTimer);
    };
  }, [location]);

  // if (location.pathname === '/chat') {
  //   return (
  //     <>
  //       <motion.div className="w-full h-full z-0 left-0 opacity-55 pointer-events-none p-4 text-gray-500 font-mono text-[6px] sm:text-sm space-y-1">
  //         <SvgCircle></SvgCircle>
  //       </motion.div>
  //     </>
  //   );
  // } else
  return (
    <div className="absolute h-full w-full ">
      {showGlitch ? (
        <motion.div className="relative w-full h-full">
          <motion.div className="absolute">
            <WarningSign></WarningSign>
          </motion.div>
          <motion.div className="absolute right-0 translate-x-[-50%] text-primary">
            <ProcessingBar duration={duration} />
          </motion.div>

          <motion.div className="absolute right-0 top-[100px]">
            <BackgroundGlitchTextBlock></BackgroundGlitchTextBlock>
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  );
};
