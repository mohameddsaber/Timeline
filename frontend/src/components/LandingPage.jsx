import React from 'react';
import { motion } from 'framer-motion';
import HeroGraph3D from './HeroGraph3D';

const LandingPage = ({ onEnter }) => {
  return (
    <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-between p-6 sm:p-12 font-sans selection:bg-cyan-900 overflow-hidden">
      
      {/* Spacer to push content down slightly */}
      <div className="h-4 md:h-8 flex-none"></div>

      {/* Hero Text */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10 flex-none"
      >
        <h1 className="text-5xl md:text-7xl font-extralight text-white tracking-widest uppercase mb-4 md:mb-6 drop-shadow-lg">
          Future <span className="text-cyan-400 font-light">Paths</span>
        </h1>
        <p className="text-zinc-400 text-sm md:text-lg font-light tracking-[0.3em] uppercase max-w-xl mx-auto">
          The Node-Based Narrative Engine
        </p>
      </motion.div>

      {/* Floating Graph Visual */}
      <div className="relative w-full max-w-3xl flex-1 min-h-0 flex items-center justify-center my-4 md:my-8 z-0">
        
        {/* Decorative Grid/Lines */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 md:w-96 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 md:h-64 w-[1px] bg-gradient-to-b from-transparent via-zinc-800 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-zinc-800/30 opacity-50"></div>

        {/* 3D WebGL Canvas */}
        <HeroGraph3D />
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        className="z-10 flex-none pb-4 md:pb-8"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEnter}
          className="px-12 py-5 bg-zinc-900/80 backdrop-blur border border-zinc-800 hover:border-cyan-400 text-zinc-300 hover:text-cyan-400 font-medium tracking-[0.2em] uppercase text-xs md:text-sm rounded-full transition-colors shadow-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
        >
          Initialize Engine
        </motion.button>
      </motion.div>

    </div>
  );
};

export default LandingPage;
