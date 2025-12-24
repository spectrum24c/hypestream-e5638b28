
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Faster loading for mobile devices (4 seconds instead of 6)
    const isMobile = window.innerWidth < 768;
    const duration = isMobile ? 4000 : 6000;
    const updateInterval = 50; // Update every 50ms for smoother animation
    const totalSteps = duration / updateInterval;
    const increment = 100 / totalSteps;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 300); // Shorter delay for mobile
          return 100;
        }
        return newProgress;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-hype-dark flex flex-col items-center justify-center px-4"
      style={{ 
        minHeight: '100dvh' // Better mobile viewport height
      }}
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col items-center space-y-6 w-full max-w-sm"
      >
        <div className="relative flex items-center justify-center">
          <Film size={48} className="text-primary sm:w-14 sm:h-14" />
          <div className="absolute -inset-2 rounded-full bg-primary/20 animate-pulse-slow"></div>
        </div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-3xl sm:text-4xl font-bold text-white text-center"
        >
          HypeStream
        </motion.h1>
        
        <motion.div 
          initial={{ width: "60%", opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="w-full max-w-60 h-1.5 bg-hype-gray/30 rounded-full overflow-hidden"
        >
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary rounded-full"
            transition={{ ease: "linear" }}
          ></motion.div>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-muted-foreground text-center text-sm sm:text-base"
        >
          Loading your experience...
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
