import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Tv, Check, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onComplete: (preferences: { movies: boolean; series: boolean }) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [selectedPreferences, setSelectedPreferences] = useState({
    movies: true,
    series: true
  });

  const handlePreferenceToggle = (type: 'movies' | 'series') => {
    setSelectedPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleContinue = () => {
    if (step === 0) {
      setStep(1);
    } else {
      // Save preferences to localStorage
      localStorage.setItem('hypestream_welcome_completed', 'true');
      localStorage.setItem('hypestream_notification_prefs', JSON.stringify(selectedPreferences));
      onComplete(selectedPreferences);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-background to-background" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 10,
            }}
            animate={{
              y: -10,
              transition: {
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5
              }
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="welcome"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 text-center px-6 max-w-lg"
          >
            {/* Logo */}
            <motion.div variants={itemVariants} className="mb-8">
              <motion.div 
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 mb-6"
                animate={{ 
                  boxShadow: ['0 0 30px hsl(var(--primary) / 0.3)', '0 0 50px hsl(var(--primary) / 0.5)', '0 0 30px hsl(var(--primary) / 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-10 h-10 text-primary" />
              </motion.div>
              <h1 className="font-display text-5xl md:text-7xl tracking-wide text-foreground mb-2">
                HYPE<span className="text-primary">STREAM</span>
              </h1>
            </motion.div>

            {/* Welcome message */}
            <motion.div variants={itemVariants} className="space-y-4 mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                Welcome to the Future of Streaming
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Discover millions of movies and TV shows, personalized just for you. 
                Get ready for an immersive viewing experience.
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div variants={itemVariants}>
              <Button
                onClick={handleContinue}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-lg font-semibold rounded-lg group"
              >
                Get Started
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            {/* Skip option */}
            <motion.button
              variants={itemVariants}
              onClick={() => {
                localStorage.setItem('hypestream_welcome_completed', 'true');
                onComplete({ movies: true, series: true });
              }}
              className="mt-6 text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Skip for now
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="preferences"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 text-center px-6 max-w-lg"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                What would you like to watch?
              </h2>
              <p className="text-muted-foreground">
                Choose what types of recommendations you'd like to receive
              </p>
            </motion.div>

            {/* Preference cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-10">
              {/* Movies Card */}
              <motion.button
                onClick={() => handlePreferenceToggle('movies')}
                className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                  selectedPreferences.movies 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-card hover:border-muted-foreground'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {selectedPreferences.movies && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </motion.div>
                )}
                <Film className={`w-12 h-12 mx-auto mb-3 ${selectedPreferences.movies ? 'text-primary' : 'text-muted-foreground'}`} />
                <h3 className={`font-semibold text-lg ${selectedPreferences.movies ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Movies
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Latest releases & classics
                </p>
              </motion.button>

              {/* Series Card */}
              <motion.button
                onClick={() => handlePreferenceToggle('series')}
                className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                  selectedPreferences.series 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-card hover:border-muted-foreground'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {selectedPreferences.series && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </motion.div>
                )}
                <Tv className={`w-12 h-12 mx-auto mb-3 ${selectedPreferences.series ? 'text-primary' : 'text-muted-foreground'}`} />
                <h3 className={`font-semibold text-lg ${selectedPreferences.series ? 'text-foreground' : 'text-muted-foreground'}`}>
                  TV Series
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Binge-worthy shows
                </p>
              </motion.button>
            </motion.div>

            {/* Note */}
            <motion.p variants={itemVariants} className="text-sm text-muted-foreground mb-8">
              You can change these preferences anytime in settings
            </motion.p>

            {/* CTA Button */}
            <motion.div variants={itemVariants}>
              <Button
                onClick={handleContinue}
                disabled={!selectedPreferences.movies && !selectedPreferences.series}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-lg font-semibold rounded-lg group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Watching
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WelcomeScreen;
