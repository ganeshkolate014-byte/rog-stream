import { ReactLenis } from 'lenis/react';
import React from 'react';

export const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
};
