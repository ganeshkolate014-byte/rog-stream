import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface ParallaxProps {
  children: React.ReactNode;
  offset?: number;
  className?: string;
  direction?: 'up' | 'down';
}

export const Parallax: React.FC<ParallaxProps> = ({
    children,
    offset = 50,
    className = "",
    direction = 'up'
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Calculate parallax range based on direction
  // if direction is 'up' (default), content moves opposite to scroll (looks like it's further away)
  // if direction is 'down', content moves with scroll (looks closer)
  const range = direction === 'up' ? [-offset, offset] : [offset, -offset];

  const y = useTransform(scrollYProgress, [0, 1], range);

  return (
    <div ref={ref} className={`relative ${className}`}>
        <motion.div style={{ y }} className="w-full h-full">
            {children}
        </motion.div>
    </div>
  );
};
