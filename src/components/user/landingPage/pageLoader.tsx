import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageLoaderProps {
  companyName?: string;
  onLoadingComplete?: () => void;
  rubikClassName?: string;
  poppinsClassName?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  companyName = 'Harita',
  onLoadingComplete,
  rubikClassName = '',
  poppinsClassName = '',
}) => {
  const [count, setCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Counter animation from 0 to 100
    const duration = 2500; // 2.5 seconds
    const increment = 100 / (duration / 16); // 60fps

    const timer = setInterval(() => {
      setCount((prevCount) => {
        const newCount = prevCount + increment;
        if (newCount >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsComplete(true);
            if (onLoadingComplete) {
              setTimeout(onLoadingComplete, 1000);
            }
          }, 300);
          return 100;
        }
        return newCount;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            y: '-100%',
            borderRadius: '0 0 50% 50%',
            transition: {
              duration: 1.2,
              ease: [0.76, 0, 0.24, 1],
            },
          }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-blue-800 overflow-hidden"
        >
          {/* Company Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
            }}
            className="mb-8"
          >
            <motion.h1
              className={`${rubikClassName} text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tight`}
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {companyName}
            </motion.h1>
          </motion.div>

          {/* Loading Counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.3,
            }}
            className="relative"
          >
            <motion.p
              className={`${poppinsClassName} text-4xl md:text-5xl font-semibold text-blue-200`}
              key={Math.floor(count)}
            >
              {Math.floor(count)}%
            </motion.p>
          </motion.div>

          {/* Loading Bar */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '300px' }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.5,
            }}
            className="mt-8 h-1 bg-blue-600 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-blue-300 rounded-full"
              style={{
                width: `${count}%`,
              }}
              transition={{
                duration: 0.1,
                ease: 'linear',
              }}
            />
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Top Left Circle */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute -top-20 -left-20 w-60 h-60 border-4 border-blue-600 rounded-full"
            />
            
            {/* Bottom Right Circle */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute -bottom-32 -right-32 w-80 h-80 border-4 border-blue-600 rounded-full"
            />

            {/* Center Circle */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-blue-500 rounded-full"
            />
          </motion.div>

          {/* Small Loading Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.8,
            }}
            className={`${poppinsClassName} absolute bottom-12 text-blue-200 text-sm tracking-widest`}
          >
            LOADING
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};