// Animation variants for framer-motion

export const fadeInUp = {
  initial: { 
    opacity: 0, 
    y: 20 
  },
  animate: { 
    opacity: 1, 
    y: 0 
  },
  exit: { 
    opacity: 0, 
    y: -20 
  },
  transition: { 
    duration: 0.3, 
    ease: [0.4, 0, 0.2, 1] 
  },
};

export const fadeIn = {
  initial: { 
    opacity: 0 
  },
  animate: { 
    opacity: 1 
  },
  exit: { 
    opacity: 0 
  },
  transition: { 
    duration: 0.3 
  },
};

export const scaleIn = {
  initial: { 
    opacity: 0, 
    scale: 0.9 
  },
  animate: { 
    opacity: 1, 
    scale: 1 
  },
  exit: { 
    opacity: 0, 
    scale: 0.9 
  },
  transition: { 
    duration: 0.3, 
    ease: [0.4, 0, 0.2, 1] 
  },
};

export const slideInRight = {
  initial: { 
    opacity: 0, 
    x: 50 
  },
  animate: { 
    opacity: 1, 
    x: 0 
  },
  exit: { 
    opacity: 0, 
    x: -50 
  },
  transition: { 
    duration: 0.3, 
    ease: [0.4, 0, 0.2, 1] 
  },
};

export const slideInLeft = {
  initial: { 
    opacity: 0, 
    x: -50 
  },
  animate: { 
    opacity: 1, 
    x: 0 
  },
  exit: { 
    opacity: 0, 
    x: 50 
  },
  transition: { 
    duration: 0.3, 
    ease: [0.4, 0, 0.2, 1] 
  },
};

export const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerFast = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

export const bounce = {
  initial: { 
    scale: 0 
  },
  animate: { 
    scale: 1 
  },
  transition: { 
    type: 'spring', 
    stiffness: 260, 
    damping: 20 
  },
};

export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const spin = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Hover animations
export const hoverScale = {
  whileHover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  whileTap: { 
    scale: 0.95 
  },
};

export const hoverLift = {
  whileHover: { 
    y: -4,
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    transition: { duration: 0.2 }
  },
};

export const hoverGlow = (color = 'rgba(102, 126, 234, 0.3)') => ({
  whileHover: {
    boxShadow: `0 0 20px ${color}`,
    transition: { duration: 0.2 }
  },
});

// Number counter animation
export const counterAnimation = {
  initial: { 
    opacity: 0, 
    scale: 0.5 
  },
  animate: { 
    opacity: 1, 
    scale: 1 
  },
  transition: { 
    duration: 0.5, 
    ease: [0.68, -0.55, 0.265, 1.55] 
  },
};

// Card animations
export const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  hover: {
    y: -4,
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    transition: { duration: 0.2 }
  },
};

// List item animations
export const listItemVariants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: (index) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }),
};

export default {
  fadeInUp,
  fadeIn,
  scaleIn,
  slideInRight,
  slideInLeft,
  stagger,
  staggerFast,
  bounce,
  pulse,
  spin,
  hoverScale,
  hoverLift,
  hoverGlow,
  counterAnimation,
  cardVariants,
  listItemVariants,
};









