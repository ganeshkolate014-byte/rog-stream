import React, { useState, useEffect, useRef } from 'react';
import { MousePointer2, Move } from 'lucide-react';

export const Trackpad: React.FC = () => {
  const [cursorPos, setCursorPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState<{ x: number; y: number } | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [dimensions, setDimensions] = useState({ w: 256, h: 192 });
  const prevHoverRef = useRef<Element | null>(null);
  
  // Load config
  useEffect(() => {
    const checkConfig = () => {
        try {
            const stored = localStorage.getItem('ui_config');
            if (stored) {
                const parsed = JSON.parse(stored);
                setIsEnabled(parsed.enableTrackpad === true);
                if (parsed.trackpadWidth) {
                    setDimensions({ w: parsed.trackpadWidth, h: parsed.trackpadHeight });
                }
            }
        } catch(e) {}
    };
    
    checkConfig();
    window.addEventListener('storage', checkConfig);
    window.addEventListener('ui_config_update', checkConfig);
    
    return () => {
        window.removeEventListener('storage', checkConfig);
        window.removeEventListener('ui_config_update', checkConfig);
    };
  }, []);

  // Hover Simulation Logic
  useEffect(() => {
    if (!isEnabled) return;

    // We briefly hide the cursor to see what's under it, then show it back
    // This needs to be very fast.
    const cursor = document.getElementById('virtual-cursor');
    if (cursor) cursor.style.display = 'none';
    const elem = document.elementFromPoint(cursorPos.x, cursorPos.y);
    if (cursor) cursor.style.display = 'block';

    if (elem !== prevHoverRef.current) {
        if (prevHoverRef.current) {
            // Dispatch mouseleave/mouseout to old element
            prevHoverRef.current.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true, view: window }));
            prevHoverRef.current.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true, cancelable: true, view: window }));
        }

        if (elem) {
            // Dispatch mouseenter/mouseover to new element
            elem.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window }));
            elem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true, view: window }));
        }

        prevHoverRef.current = elem;
    }
  }, [cursorPos, isEnabled]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation(); // Stop event from passing through to elements behind
    setIsDragging(true);
    setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!lastTouch) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    const deltaX = (currentX - lastTouch.x) * 2.5; // Sensitivity
    const deltaY = (currentY - lastTouch.y) * 2.5;

    setCursorPos(prev => ({
        x: Math.min(Math.max(0, prev.x + deltaX), window.innerWidth),
        y: Math.min(Math.max(0, prev.y + deltaY), window.innerHeight)
    }));

    setLastTouch({ x: currentX, y: currentY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(false);
    setLastTouch(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const cursor = document.getElementById('virtual-cursor');
    if(cursor) cursor.style.display = 'none';
    const element = document.elementFromPoint(cursorPos.x, cursorPos.y);
    if(cursor) cursor.style.display = 'block';

    if (element) {
        // Trigger click
        if (element instanceof HTMLElement) {
            element.click();
            
            // Fix for "stuck" hover on all cards:
            // Often clicking simulates a touch which triggers :hover on devices.
            // We can try to blur active elements immediately if they aren't inputs.
            if (document.activeElement instanceof HTMLElement && document.activeElement.tagName !== 'INPUT') {
                 document.activeElement.blur();
            }
        }
    }
  };

  if (!isEnabled) return null;

  return (
    <>
      {/* Virtual Cursor */}
      <div 
        id="virtual-cursor"
        className="fixed z-[9999] pointer-events-none transition-transform duration-75"
        style={{ 
            left: 0, 
            top: 0, 
            transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)` 
        }}
      >
        <MousePointer2 className="w-6 h-6 text-brand-400 fill-brand-400 drop-shadow-[0_0_10px_rgba(255,0,51,0.8)]" />
      </div>

      {/* Trackpad Area */}
      <div className="fixed bottom-6 right-6 z-[9000] flex flex-col items-end gap-2 touch-none">
         <div className="text-[10px] font-bold text-brand-400 uppercase tracking-widest bg-black/80 px-2 py-1 border border-brand-400/30 rounded-sm pointer-events-none">
            Mouse Mode Active
         </div>
         
         <div 
            className="bg-black/80 border-2 border-brand-400/50 rounded-lg backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative"
            style={{ width: `${dimensions.w}px`, height: `${dimensions.h}px` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
         >
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAwLCA1MSwgMC4yKSIvPjwvc3ZnPg==')] opacity-30 pointer-events-none" />
            
            {/* Touch Area Label */}
            <div className="flex-1 flex items-center justify-center text-zinc-600 pointer-events-none">
                <Move className="w-8 h-8 opacity-20" />
            </div>

            {/* Click Buttons */}
            <div className="h-12 border-t border-brand-400/30 flex divide-x divide-brand-400/30">
                <button 
                    className="flex-1 bg-white/5 active:bg-brand-400/20 transition-colors flex items-center justify-center text-xs font-bold text-zinc-400 uppercase tracking-wider hover:text-white"
                    onClick={handleClick}
                    onTouchEnd={(e) => e.stopPropagation()} // Prevent ghost touches here too
                >
                    Left Click
                </button>
            </div>
         </div>
      </div>
    </>
  );
};