import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

const RandomLetters: React.FC = () => {
  const [letters, setLetters] = useState<string[]>([]);
  const length = 5; // Length of the string of random letters

  // Function to generate a random letter
  const getRandomLetter = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return letters[Math.floor(Math.random() * letters.length)];
  };

  // Generate initial random letters for the given length
  const generateRandomLetters = () => {
    const initialLetters = [];
    for (let i = 0; i < length; i++) {
      initialLetters.push(getRandomLetter());
    }
    return initialLetters;
  };

  useEffect(() => {
    // Set the initial random letters
    setLetters(generateRandomLetters());

    const interval = setInterval(() => {
      // Update each letter randomly one by one every 200ms
      setLetters((prevLetters) => prevLetters.map(() => getRandomLetter()));
    }, 200);

    return () => {
      clearInterval(interval); // Clear the interval when the component unmounts
    };
  }, []);

  return (
    <div className="mt-2 flex">
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            scale: [1, 1.2, 1], // Animate letter scaling up and down
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.1, // Stagger the animation for each letter
            repeat: Infinity,
            repeatType: 'loop',
          }}
          className=""
        >
          {letter}
        </motion.span>
      ))}
    </div>
  );
};

export default RandomLetters;
