import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState("");
  
  const loadingTexts = [
    "Initializing secure connection...",
    "Loading trading algorithms...", 
    "Syncing market data...",
    "Preparing dashboard...",
    "Almost ready..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const textInterval = setInterval(() => {
      const textIndex = Math.floor(progress / 20);
      if (textIndex < loadingTexts.length) {
        setCurrentText(loadingTexts[textIndex]);
      }
    }, 100);

    return () => clearInterval(textInterval);
  }, [progress]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--gradient-background)' }}
    >
      <div className="text-center space-y-8">
        {/* Logo/Brand */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="glass rounded-2xl p-8 animate-card-3d"
        >
          <div className="text-4xl font-bold text-gradient mb-4">CryptoTrade</div>
          <div className="text-sm text-muted-foreground">Professional Trading Platform</div>
        </motion.div>

        {/* Terminal-style loading animation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6 min-w-[400px] bg-black/20"
        >
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="text-xs text-muted-foreground ml-4">Terminal v2.1.0</div>
          </div>
          
          <div className="text-left space-y-2 font-mono text-sm">
            <div className="text-green-400">$ npm start --production</div>
            <div className="text-gray-300">{currentText}</div>
            <div className="flex items-center space-x-2">
              <div className="text-blue-400">Progress:</div>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="text-white text-xs">{progress}%</div>
            </div>
          </div>
        </motion.div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
                opacity: 0
              }}
              animate={{
                y: -10,
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;