
import * as React from 'react';

const SplashScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-hype-dark text-white">
      <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-hype-orange to-hype-purple bg-clip-text text-transparent animate-fade-in">
        HypeStream
      </h1>
      <p className="mt-4 text-lg text-gray-300 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        Loading your next hype...
      </p>
    </div>
  );
};

export default SplashScreen;
