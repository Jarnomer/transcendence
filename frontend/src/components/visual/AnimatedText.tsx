import { motion } from 'framer-motion';

const sentenceVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const letterVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

export const AnimatedText = ({ text }: { text: string }) => {
  return (
    <motion.span
      className="inline-block"
      variants={sentenceVariants}
      initial="hidden"
      animate="visible"
    >
      {text.split('').map((char, index) => (
        <motion.span key={index} variants={letterVariants} className="inline-block">
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};
