
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Calculate the increment needed to reach 100% in 6 seconds
    // If we update every 20ms, we need (6000ms / 20ms) = 300 steps
    // So each step should increase progress by (100 / 300) = 0.333
    const increment = 0.333;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-hype-dark flex flex-col items-center justify-center"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center space-y-6"
      >
        <div className="relative flex items-center justify-center">
          <Film size={56} className="text-hype-purple" />
          <div className="absolute -inset-2 rounded-full bg-hype-purple/20 animate-pulse-slow"></div>
        </div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-4xl font-bold text-white"
        >
          HypeStream
        </motion.h1>
        
        <motion.div 
          initial={{ width: "60%", opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-60 h-1.5 bg-hype-gray/30 rounded-full overflow-hidden"
        >
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-hype-purple to-hype-teal rounded-full"
          ></motion.div>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-muted-foreground"
        >
          Loading your experience...
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
