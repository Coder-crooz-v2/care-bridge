"use client";

import { motion, Variants } from "motion/react";

function LoadingOverlay() {
  const dotVariants: Variants = {
    jump: {
      y: -30,
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="flex flex items-center justify-center w-full gap-6">
      <motion.div
      animate="jump"
      transition={{ staggerChildren: -0.2, staggerDirection: -1 }}
      className="flex justify-center items-center gap-4"
    >
      <motion.div className="h-4 w-4 rounded-full bg-primary" variants={dotVariants} />
      <motion.div className="h-4 w-4 rounded-full bg-primary" variants={dotVariants} />
      <motion.div className="h-4 w-4 rounded-full bg-primary" variants={dotVariants} />
      
    </motion.div>
      <p className="text-primary text-3xl font-bold -translate-y-3">Hang in tight!</p>
    </div>
  );
}

export default LoadingOverlay;
