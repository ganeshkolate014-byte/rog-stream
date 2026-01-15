import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltProps {
  children: React.ReactNode;
  className?: string;
  perspective?: number;
  scale?: number;
  max?: number; // Max rotation in degrees
}

export const Tilt: React.FC<TiltProps> = ({
    children,
    className = "",
    perspective = 1000,
    scale = 1.05,
    max = 15
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [max, -max]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-max, max]);

  // Scale on hover
  const [hover, setHover] = useState(false);
  const scaleAnim = useSpring(hover ? scale : 1, { stiffness: 150, damping: 15 });

  // Update scale spring when hover state changes
  React.useEffect(() => {
      scaleAnim.set(hover ? scale : 1);
  }, [hover, scale, scaleAnim]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    // Calculate mouse position relative to center of element (-0.5 to 0.5)
    const width = rect.width;
    const height = rect.height;

    const mouseXRel = e.clientX - rect.left;
    const mouseYRel = e.clientY - rect.top;

    const xPct = (mouseXRel / width) - 0.5;
    const yPct = (mouseYRel / height) - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setHover(false);
  };

  const handleMouseEnter = () => {
      setHover(true);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        perspective: `${perspective}px`,
        transformStyle: "preserve-3d"
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale: scaleAnim,
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
