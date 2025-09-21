// Pixel motion variants copied from export (scoped locally)
export const pixelMotionVariants = {
  fadeAndRise: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  },
  bumpScale: { initial: { scale: 1 }, animate: { scale: [1, 1.06, 1] } },
  shieldDeploy: { initial: { scale: 0.6, opacity: 0 }, animate: { scale: [0.6, 1.2, 1], opacity: [0, 1, 1] } },
  lotteryPot: { animate: { y: [0, -2, 0] } },
  particleFloat: { initial: { opacity: 1, y: 0, x: 0, scale: 1 }, animate: { opacity: [1, 1, 0], y: [-20, -40], x: [0, 15], scale: [1, 0.8, 0.4] } },
  dailyReset: { initial: { opacity: 0, scale: 0.8, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.9, y: -20 } }
}

export const pixelTransitions = {
  quick: { duration: 0.2 },
  medium: { duration: 0.3 },
  slow: { duration: 0.4 },
  lottery: { duration: 1.5, ease: 'easeOut' },
  breathing: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
}
