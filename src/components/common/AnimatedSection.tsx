import React, { useRef } from 'react';
import { motion, useInView, Variant } from 'framer-motion';
import { Box, BoxProps } from '@mui/material';

type AnimationVariant = 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'zoomIn' | 'fadeIn';

interface AnimatedSectionProps extends BoxProps {
  children: React.ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
  staggerChildren?: number;
}

const variants: Record<AnimationVariant, { hidden: Variant; visible: Variant }> = {
  fadeUp: {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -60 },
    visible: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  },
  zoomIn: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

/**
 * Reusable scroll-reveal animation wrapper using framer-motion.
 * Wraps any section and animates it when scrolled into view.
 */
const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.7,
  once = true,
  amount = 0.2,
  staggerChildren,
  ...boxProps
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });

  const selectedVariant = variants[variant];

  const containerVariants = staggerChildren
    ? {
        hidden: {},
        visible: {
          transition: {
            staggerChildren,
            delayChildren: delay,
          },
        },
      }
    : undefined;

  return (
    <Box ref={ref} {...boxProps}>
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={containerVariants || selectedVariant}
        transition={
          !staggerChildren
            ? { duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }
            : undefined
        }
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </Box>
  );
};

/**
 * Individual animated item — used inside AnimatedSection with staggerChildren
 */
export const AnimatedItem: React.FC<{
  children: React.ReactNode;
  variant?: AnimationVariant;
  duration?: number;
}> = ({ children, variant = 'fadeUp', duration = 0.6 }) => (
  <motion.div
    variants={variants[variant]}
    transition={{ duration, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    {children}
  </motion.div>
);

/**
 * Animated counter — counts from 0 to target number when in view
 */
export const AnimatedCounter: React.FC<{
  target: number;
  suffix?: string;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ target, suffix = '', duration = 2, style }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.span
      ref={ref}
      style={style}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
    >
      {isInView ? (
        <CountUp target={target} duration={duration} suffix={suffix} />
      ) : (
        `0${suffix}`
      )}
    </motion.span>
  );
};

/** Internal counter component */
const CountUp: React.FC<{ target: number; duration: number; suffix: string }> = ({
  target,
  duration,
  suffix,
}) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const durationMs = duration * 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return <>{count}{suffix}</>;
};

export default AnimatedSection;
